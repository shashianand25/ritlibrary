import express from 'express';
import cors from 'cors';
import { Octokit } from '@octokit/rest';
import multer from 'multer';
import crypto from 'crypto';

const app = express();

// Use express.json for JSON requests
app.use(express.json());
app.use(cors());

// Configure Multer for in-memory uploads (if needed, although we are mostly client-side uploading now)
const upload = multer({ storage: multer.memoryStorage() });

// GitHub configuration from environment
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

let octokit;
if (GITHUB_TOKEN) {
  octokit = new Octokit({ auth: GITHUB_TOKEN });
}

const getGitHubFile = async (path) => {
  try {
    const response = await octokit.rest.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path,
      ref: GITHUB_BRANCH,
    });
    const content = Buffer.from(response.data.content, 'base64').toString('utf8');
    return { content: JSON.parse(content), sha: response.data.sha };
  } catch (error) {
    if (error.status === 404) {
      return { content: [], sha: null };
    }
    throw error;
  }
};

const updateGitHubFile = async (path, content, message, sha) => {
  await octokit.rest.repos.createOrUpdateFileContents({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    path,
    message,
    content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
    sha,
    branch: GITHUB_BRANCH,
  });
};

/* ── base64url helpers ── */
const b64url = str => Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64urlBuf = buf => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/* ── Get Google OAuth2 access token via Service Account JWT ── */
async function getGoogleAuthToken() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT) return null;
  const sa = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);

  const headerB64 = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payloadB64 = b64url(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/drive', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const sigInput = `${headerB64}.${payloadB64}`;

  const pem = sa.private_key;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(sigInput);
  const signature = sign.sign(pem, 'base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const jwt = `${sigInput}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const { access_token, error } = await res.json();
  if (error) throw new Error(`Token error: ${error}`);
  return access_token;
}

async function getGoogleUserAuthToken() {
  const missing = ['GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN']
    .filter(key => !process.env[key]);
  if (missing.length) return null;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`User OAuth token error: ${data.error_description || data.error || 'unknown error'}`);
  }
  return data.access_token;
}

async function getDriveAuthToken() {
  return await getGoogleUserAuthToken() || await getGoogleAuthToken();
}

async function fetchAllFiles(folderId, token) {
  const all = [];
  let pageToken = '';
  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'nextPageToken,files(id,name,mimeType)',
      pageSize: '1000',
      ...(pageToken ? { pageToken } : {}),
    });
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    all.push(...(data.files || []));
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  return all;
}

async function deleteDriveFile(token, fileId) {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) return;
  if (!res.ok) {
    let message = 'Drive delete failed';
    try {
      const data = await res.json();
      message = data?.error?.message || data?.error_description || message;
    } catch {}
    throw new Error(`Drive delete failed (${res.status}): ${message}`);
  }
}

async function uploadToDrive(token, fileName, fileBytes, mimeType, parentId) {
  if (!parentId) throw new Error('DRIVE_ROOT_ID is not configured');

  const boundary = 'rit_lib_boundary';
  const meta = JSON.stringify({ name: fileName, parents: [parentId] });
  const parts = [
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
    Buffer.from(fileBytes),
    Buffer.from(`\r\n--${boundary}--`),
  ];
  const body = Buffer.concat(parts);
  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    const message = data?.error?.message || data?.error_description || 'Drive upload failed';
    throw new Error(`Drive upload failed (${res.status}): ${message}`);
  }
  return data;
}

const cleanPathSegment = value => String(value || '').replace(/[\\/]+/g, '-').trim();
const getFileViewName = fileName => String(fileName || '').replace(/\.[^/.]+$/, '');
const normalizeSection = value => {
  const section = cleanPathSegment(value || 'Gen');
  if (!section || section.toLowerCase() === 'gen') return 'Gen';
  return section.toUpperCase();
};

async function verifyIdToken(idToken, firebaseApiKey) {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.users?.[0]?.email || null;
  } catch { return null; }
}

async function requireAdmin(req) {
  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!idToken) return { error: 'Missing token', status: 401 };

  const email = await verifyIdToken(idToken, process.env.FIREBASE_API_KEY);
  if (!email) return { error: 'Invalid token', status: 401 };

  const admins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  const isAdmin = admins.includes(email.toLowerCase());
  
  if (!isAdmin) return { error: 'Forbidden', status: 403 };

  return { email };
}

async function requireDeleter(req) {
  // If public deletes are enabled, anyone can delete. Otherwise check admin.
  const PUBLIC_DELETES_ENABLED = process.env.PUBLIC_DELETES_ENABLED !== 'false';
  if (!PUBLIC_DELETES_ENABLED) return requireAdmin(req);

  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!idToken) return { email: 'public-showcase' };

  const email = await verifyIdToken(idToken, process.env.FIREBASE_API_KEY);
  return { email: email || 'public-showcase' };
}

async function requireUploader(req) {
  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!idToken) return { error: 'Missing token', status: 401 };

  const email = await verifyIdToken(idToken, process.env.FIREBASE_API_KEY);
  if (!email) return { error: 'Invalid token', status: 401 };

  const PUBLIC_UPLOADS_ENABLED = process.env.PUBLIC_UPLOADS_ENABLED !== 'false';
  if (!PUBLIC_UPLOADS_ENABLED) {
    const admins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const isAdmin = admins.includes(email.toLowerCase());
    if (!isAdmin) return { error: 'Forbidden', status: 403 };
  }

  return { email };
}

// Routes

app.get('/api/drive-root', (req, res) => {
  res.json({ folderId: process.env.DRIVE_ROOT_ID });
});

app.get('/api/files.json', (req, res) => {
  res.redirect(302, 'https://shashianand25.github.io/ritlibrary-data/files.json');
});

app.post('/api/check-admin', async (req, res) => {
  try {
    const { email } = req.body;
    const admins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const isAdmin = admins.includes(String(email).toLowerCase());
    return res.status(isAdmin ? 200 : 403).json({ isAdmin });
  } catch {
    return res.status(400).json({ isAdmin: false });
  }
});

app.post('/api/register-file', async (req, res) => {
  const adminCheck = await requireAdmin(req);
  if (adminCheck.error) return res.status(adminCheck.status).json({ error: adminCheck.error });

  const { id, name, mimeType, previewUrl, ...rest } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'Missing id or name' });

  const newEntry = { id, name, mimeType: mimeType || '', previewUrl: previewUrl || '', ...rest };
  
  try {
    const { content: files, sha } = await getGitHubFile('files.json');
    files.push(newEntry);
    await updateGitHubFile('files.json', files, `Register file ${name}`, sha);
    
    console.log('Registered file:', name);
    return res.json({ success: true, file: newEntry });
  } catch (error) {
    console.error('GitHub API error:', error);
    return res.status(500).json({ error: 'Failed to save to GitHub' });
  }
});

app.delete('/api/files/:id', async (req, res) => {
  const deleterCheck = await requireDeleter(req);
  if (deleterCheck.error) return res.status(deleterCheck.status).json({ error: deleterCheck.error });

  const fileId = req.params.id;
  if (!fileId) return res.status(400).json({ error: 'Missing file id' });

  try {
    const { content: files, sha } = await getGitHubFile('files.json');
    const target = files.find(file => file?.id === fileId);
    
    if (!target) return res.status(404).json({ error: 'File not found' });

    // Attempt to delete from Drive
    try {
      const token = await getDriveAuthToken();
      if (token) {
        await deleteDriveFile(token, fileId);
      }
    } catch (driveErr) {
      console.error('Drive delete error, continuing with GitHub delete:', driveErr);
    }

    const nextFiles = files.filter(file => file?.id !== fileId);
    await updateGitHubFile('files.json', nextFiles, `Delete file ${fileId}`, sha);
    
    console.log(`Deleted file ${fileId} by ${deleterCheck.email}`);
    return res.json({ success: true, id: fileId });
  } catch (error) {
    console.error('GitHub API error:', error);
    return res.status(500).json({ error: 'Failed to update GitHub' });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  const uploaderCheck = await requireUploader(req);
  if (uploaderCheck.error) return res.status(uploaderCheck.status).json({ error: uploaderCheck.error });

  const file = req.file;
  const category = req.body.category || 'Notes';
  const year = req.body.year || '';
  const sem = req.body.sem || '';
  const branch = req.body.branch || '';
  const subjectCode = req.body.subjectCode || '';
  const folderName = req.body.folderName || '';
  const section = normalizeSection(req.body.section || 'Gen');
  const uploaderName = cleanPathSegment(req.body.uploaderName || '') || uploaderCheck.email;

  if (!file || !year || !sem || !branch || !subjectCode || !folderName)
    return res.status(400).json({ error: 'Missing required fields' });

  const driveName = `${folderName}/${subjectCode}/${section}/${file.originalname}`;

  try {
    const token = await getDriveAuthToken();
    const driveFile = await uploadToDrive(token, driveName, file.buffer, file.mimetype, process.env.DRIVE_ROOT_ID);
    if (!driveFile.id) return res.status(500).json({ error: 'Drive upload failed', detail: driveFile });

    const newEntry = {
      id: driveFile.id,
      name: driveName,
      view: getFileViewName(file.originalname),
      category,
      year,
      sem,
      branch,
      subjectCode,
      folderName,
      section,
      uploaderName,
      uploaderEmail: uploaderCheck.email,
      mimeType: file.mimetype,
      previewUrl: `https://drive.google.com/file/d/${driveFile.id}/preview`,
    };

    const { content: files, sha } = await getGitHubFile('files.json');
    files.push(newEntry);
    await updateGitHubFile('files.json', files, `Server upload file ${file.originalname}`, sha);

    return res.json({ success: true, file: newEntry });
  } catch (err) {
    console.error('Drive upload error:', err);
    return res.status(500).json({ error: err.message || 'Drive upload failed' });
  }
});

// Cron Sync Route for Vercel
app.get('/api/cron/sync-drive', async (req, res) => {
  // Can use VERCEL_CRON_SECRET for security or just public execution if harmless
  console.log('[Cron] Starting Drive scan...');
  try {
    const token = await getDriveAuthToken();
    if (!token) {
       return res.status(500).json({ error: 'Failed to get drive token' });
    }
    
    const { content: existingFiles, sha } = await getGitHubFile('files.json');
    const existingById = new Map();
    if (Array.isArray(existingFiles)) {
      existingFiles.forEach(file => file?.id && existingById.set(file.id, file));
    }
    
    const drives = await fetchAllFiles(process.env.DRIVE_ROOT_ID, token);
    const files = drives.map(f => ({
      ...(existingById.get(f.id) || {}),
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      previewUrl: `https://drive.google.com/file/d/${f.id}/preview`,
    }));
    
    await updateGitHubFile('files.json', files, `Cron sync: updated ${files.length} files`, sha);
    
    console.log(`[Cron] Saved ${files.length} files to GitHub.`);
    return res.json({ success: true, count: files.length });
  } catch (error) {
    console.error('[Cron Error]', error);
    return res.status(500).json({ error: error.message });
  }
});

// For Vercel Serverless Function compatibility
export default app;
