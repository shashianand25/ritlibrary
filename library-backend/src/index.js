import { Pool } from '@neondatabase/serverless';

/* ════════════════════════════════════════════════
   RIT Library — Cloudflare Worker
   Bindings : PYQ_BUCKET (R2), EVENTS_BUCKET (R2)
   Secrets  : GOOGLE_SERVICE_ACCOUNT, DRIVE_ROOT_ID, DATABASE_URL, ADMIN_EMAILS
              Optional preferred Drive OAuth:
              GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
   ════════════════════════════════════════════════ */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

const jsonRes = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
const PUBLIC_UPLOADS_ENABLED = true;
const PUBLIC_DELETES_ENABLED = true;
const cleanPathSegment = value => String(value || '').replace(/[\\/]+/g, '-').trim();
const getFileViewName = fileName => String(fileName || '').replace(/\.[^/.]+$/, '');
const normalizeSection = value => {
  const section = cleanPathSegment(value || 'Gen');
  if (!section || section.toLowerCase() === 'gen') return 'Gen';
  return section.toUpperCase();
};
const slugify = value => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80) || 'event';
const assetUrl = (origin, key) => `${origin}/api/events/assets/${key.split('/').map(encodeURIComponent).join('/')}`;

/* ── base64url helpers ── */
const b64url = str => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64urlBuf = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/* ── Get Google OAuth2 access token via Service Account JWT ── */
async function getGoogleAuthToken(env, scope = 'https://www.googleapis.com/auth/drive') {
  const sa = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT);
  const enc = new TextEncoder();
  const now = Math.floor(Date.now() / 1000);

  const headerB64 = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payloadB64 = b64url(JSON.stringify({ iss: sa.client_email, scope, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const sigInput = `${headerB64}.${payloadB64}`;

  const pem = sa.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  const keyBytes = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey('pkcs8', keyBytes.buffer, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sigBuf = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, enc.encode(sigInput));
  const jwt = `${sigInput}.${b64urlBuf(sigBuf)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const { access_token, error } = await res.json();
  if (error) throw new Error(`Token error: ${error}`);
  return access_token;
}

/* ── Get Google OAuth2 access token for a real Drive user via refresh token ── */
async function getGoogleUserAuthToken(env) {
  const missing = ['GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN']
    .filter(key => !env[key]);
  if (missing.length) return null;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`User OAuth token error: ${data.error_description || data.error || 'unknown error'}`);
  }
  return data.access_token;
}

async function getDriveAuthToken(env) {
  return await getGoogleUserAuthToken(env) || await getGoogleAuthToken(env);
}

/* ── List all files in Drive folder (paginated) ── */
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

/* ── Upload a single file to Drive (multipart) ── */
async function uploadToDrive(token, fileName, fileBytes, mimeType, parentId) {
  if (!parentId) throw new Error('DRIVE_ROOT_ID is not configured');

  const boundary = 'rit_lib_boundary';
  const enc = new TextEncoder();
  const meta = JSON.stringify({ name: fileName, parents: [parentId] });
  const parts = [
    enc.encode(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n`),
    enc.encode(`--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
    new Uint8Array(fileBytes),
    enc.encode(`\r\n--${boundary}--`),
  ];
  const body = new Uint8Array(parts.reduce((s, p) => s + p.byteLength, 0));
  let off = 0; for (const p of parts) { body.set(p, off); off += p.byteLength; }
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

let __pool = null;
function getPool(env) {
  if (!__pool) {
    __pool = new Pool({ connectionString: env.DATABASE_URL });
  }
  return __pool;
}

let __dbInitialized = false;
async function initDb(env) {
  if (__dbInitialized || !env.DATABASE_URL) return;
  try {
    const pool = getPool(env);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    __dbInitialized = true;
  } catch (err) {
    console.error('Failed to init DB:', err);
  }
}

async function checkIsAdmin(email, env) {
  if (!email) return false;
  // 1. Check bootstrap
  const bootstrapAdmins = (env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  if (bootstrapAdmins.includes(email.toLowerCase())) return true;
  
  // 2. Check DB
  if (!env.DATABASE_URL) return false;
  try {
    await initDb(env);
    const pool = getPool(env);
    const res = await pool.query('SELECT email FROM admins WHERE email = $1', [email.toLowerCase()]);
    return res.rows.length > 0;
  } catch (err) {
    console.error('Postgres error:', err);
    return false;
  }
}

async function requireAdmin(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const idToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!idToken) return { response: jsonRes({ error: 'Missing token' }, 401) };

  const email = await verifyIdToken(idToken, env.FIREBASE_API_KEY);
  if (!email) return { response: jsonRes({ error: 'Invalid token' }, 401) };

  const isAdmin = await checkIsAdmin(email, env);
  if (!isAdmin) return { response: jsonRes({ error: 'Forbidden' }, 403) };

  return { email };
}


async function requireDeleter(request, env) {
  if (!PUBLIC_DELETES_ENABLED) return requireAdmin(request, env);

  const authHeader = request.headers.get('Authorization') || '';
  const idToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!idToken) return { email: 'public-showcase' };

  const email = await verifyIdToken(idToken, env.FIREBASE_API_KEY);
  return { email: email || 'public-showcase' };
}

async function requireUploader(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const idToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!idToken) return { response: jsonRes({ error: 'Missing token' }, 401) };

  const email = await verifyIdToken(idToken, env.FIREBASE_API_KEY);
  if (!email) return { response: jsonRes({ error: 'Invalid token' }, 401) };

  if (!PUBLIC_UPLOADS_ENABLED) {
    const isAdmin = await checkIsAdmin(email, env);
    if (!isAdmin) return { response: jsonRes({ error: 'Forbidden' }, 403) };
  }

  return { email };
}

/* ── Verify Firebase ID token → return email or null ── */
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

/* ════════════════════════════════════════
   EXPORT
════════════════════════════════════════ */
export default {

  /* ── FETCH HANDLER ── */
  async fetch(request, env, ctx) {
    try {
      if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

      const url = new URL(request.url);

      /* GET / — serve files.json from R2 */
      if (request.method === 'GET' && url.pathname === '/') {
        const obj = await env.PYQ_BUCKET.get('files.json');
        if (!obj) return jsonRes([], 200); // empty array so frontend doesn't get 404
        return new Response(await obj.text(), { headers: { ...CORS, 'Content-Type': 'application/json' } });
      }

      /* GET /api/drive-root — exposes folder ID for client-side Drive uploads */
      if (request.method === 'GET' && url.pathname === '/api/drive-root') {
        return jsonRes({ folderId: env.DRIVE_ROOT_ID });
      }

      /* GET /api/events — serve event metadata from R2 */
      if (request.method === 'GET' && url.pathname === '/api/events') {
        const obj = await env.EVENTS_BUCKET.get('events.json');
        if (!obj) return jsonRes([], 200);
        let events = [];
        try {
          const parsed = JSON.parse(await obj.text());
          events = Array.isArray(parsed) ? parsed : [];
        } catch {}
        return jsonRes(events.map(event => ({
          ...event,
          imageUrl: event.imageKey ? assetUrl(url.origin, event.imageKey) : event.imageUrl,
        })));
      }

      /* GET /api/events/assets/... — serve event images without public bucket access */
      if (request.method === 'GET' && url.pathname.startsWith('/api/events/assets/')) {
        const key = decodeURIComponent(url.pathname.replace('/api/events/assets/', ''));
        const obj = await env.EVENTS_BUCKET.get(key);
        if (!obj) return new Response('Not Found', { status: 404, headers: CORS });
        return new Response(obj.body, {
          headers: {
            ...CORS,
            'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }

      /* DELETE /api/events/:id — remove event metadata and stored image */
      if (request.method === 'DELETE' && url.pathname.startsWith('/api/events/')) {
        const { email, response } = await requireDeleter(request, env);
        if (response) return response;

        const eventId = decodeURIComponent(url.pathname.replace('/api/events/', '')).trim();
        if (!eventId || eventId === 'assets') return jsonRes({ error: 'Missing event id' }, 400);

        const existing = await env.EVENTS_BUCKET.get('events.json');
        let events = [];
        if (existing) {
          try {
            const parsed = JSON.parse(await existing.text());
            events = Array.isArray(parsed) ? parsed : [];
          } catch {}
        }

        const target = events.find(event => event?.id === eventId);
        if (!target) return jsonRes({ error: 'Event not found' }, 404);

        const nextEvents = events.filter(event => event?.id !== eventId);
        if (target.imageKey) await env.EVENTS_BUCKET.delete(target.imageKey);
        await env.EVENTS_BUCKET.put('events.json', JSON.stringify(nextEvents), {
          httpMetadata: { contentType: 'application/json' },
        });
        console.log(`Deleted event ${eventId} by ${email}`);
        return jsonRes({ success: true, id: eventId });
      }

      /* POST /api/check-admin */
      if (url.pathname === '/api/check-admin' && request.method === 'POST') {
        try {
          const { email } = await request.json();
          const isAdmin = await checkIsAdmin(email, env);
          return jsonRes({ isAdmin }, isAdmin ? 200 : 403);
        } catch {
          return jsonRes({ isAdmin: false }, 400);
        }
      }

      /* ADMIN MANAGEMENT ROUTES */
      if (url.pathname === '/api/admins') {
        const { email, response } = await requireAdmin(request, env);
        if (response) return response;

        try {
          await initDb(env);
          const pool = getPool(env);

          if (request.method === 'GET') {
            const res = await pool.query('SELECT email, created_at FROM admins ORDER BY created_at DESC');
            const bootstrapAdmins = (env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
            return jsonRes({ dbAdmins: res.rows, bootstrapAdmins });
          }

          if (request.method === 'POST') {
            const { newAdminEmail } = await request.json();
            if (!newAdminEmail) return jsonRes({ error: 'Missing email' }, 400);
            await pool.query('INSERT INTO admins (email) VALUES ($1) ON CONFLICT DO NOTHING', [newAdminEmail.toLowerCase()]);
            return jsonRes({ success: true, email: newAdminEmail.toLowerCase() });
          }

          if (request.method === 'DELETE') {
            const { removeEmail } = await request.json();
            if (!removeEmail) return jsonRes({ error: 'Missing email' }, 400);
            await pool.query('DELETE FROM admins WHERE email = $1', [removeEmail.toLowerCase()]);
            return jsonRes({ success: true });
          }
        } catch (err) {
          console.error(err);
          return jsonRes({ error: 'Database error' }, 500);
        }
      }

      /* POST /api/register-file — called after client-side Drive upload */
      if (url.pathname === '/api/register-file' && request.method === 'POST') {
        const authHeader2 = request.headers.get('Authorization') || '';
        const idToken2    = authHeader2.replace(/^Bearer\s+/i, '').trim();
        if (!idToken2) return jsonRes({ error: 'Missing token' }, 401);
        const email2 = await verifyIdToken(idToken2, env.FIREBASE_API_KEY);
        if (!email2)  return jsonRes({ error: 'Invalid token' }, 401);
        const isAdmin2 = await checkIsAdmin(email2, env);
        if (!isAdmin2) return jsonRes({ error: 'Forbidden' }, 403);
        let body;
        try { body = await request.json(); } catch { return jsonRes({ error: 'Bad JSON' }, 400); }
        const { id, name, mimeType, previewUrl } = body;
        if (!id || !name) return jsonRes({ error: 'Missing id or name' }, 400);
        const newEntry = { id, name, mimeType: mimeType || '', previewUrl: previewUrl || '' };
        const existing = await env.PYQ_BUCKET.get('files.json');
        let files = [];
        if (existing) {
          try { const parsed = JSON.parse(await existing.text()); files = Array.isArray(parsed) ? parsed : []; } catch {}
        }
        files.push(newEntry);
        await env.PYQ_BUCKET.put('files.json', JSON.stringify(files), { httpMetadata: { contentType: 'application/json' } });
        console.log('Registered file:', name);
        return jsonRes({ success: true, file: newEntry });
      }

      /* DELETE /api/files/:id — remove uploaded Drive file and files.json entry */
      if (request.method === 'DELETE' && url.pathname.startsWith('/api/files/')) {
        const { email, response } = await requireDeleter(request, env);
        if (response) return response;

        const fileId = decodeURIComponent(url.pathname.replace('/api/files/', '')).trim();
        if (!fileId) return jsonRes({ error: 'Missing file id' }, 400);

        const existing = await env.PYQ_BUCKET.get('files.json');
        let files = [];
        if (existing) {
          try {
            const parsed = JSON.parse(await existing.text());
            files = Array.isArray(parsed) ? parsed : [];
          } catch {}
        }

        const target = files.find(file => file?.id === fileId);
        if (!target) return jsonRes({ error: 'File not found' }, 404);

        const token = await getDriveAuthToken(env);
        await deleteDriveFile(token, fileId);
        const nextFiles = files.filter(file => file?.id !== fileId);
        await env.PYQ_BUCKET.put('files.json', JSON.stringify(nextFiles), {
          httpMetadata: { contentType: 'application/json' },
        });
        console.log(`Deleted file ${fileId} by ${email}`);
        return jsonRes({ success: true, id: fileId });
      }

      /* POST /api/events — admin event creation */
      if (url.pathname === '/api/events' && request.method === 'POST') {
        const { email, response } = await requireUploader(request, env);
        if (response) return response;

        let formData;
        try { formData = await request.formData(); } catch { return jsonRes({ error: 'Bad form data' }, 400); }

        const image = formData.get('image');
        const title = String(formData.get('title') || '').trim();
        const description = String(formData.get('description') || '').trim();
        const category = String(formData.get('category') || 'event').trim().toLowerCase();
        const date = String(formData.get('date') || '').trim();
        const venue = String(formData.get('venue') || '').trim();
        const link = String(formData.get('link') || '').trim();
        const createdBy = String(formData.get('createdBy') || email).trim();

        if (!image || !title || !description) {
          return jsonRes({ error: 'Image, title, and description are required' }, 400);
        }
        if (!['hackathon', 'event', 'challenge'].includes(category)) {
          return jsonRes({ error: 'Invalid category' }, 400);
        }

        const now = new Date().toISOString();
        const id = `${Date.now()}-${crypto.randomUUID()}`;
        const ext = image.name?.includes('.') ? image.name.split('.').pop().toLowerCase() : 'jpg';
        const imageKey = `events/${slugify(title)}-${id}/banner.${ext}`;
        await env.EVENTS_BUCKET.put(imageKey, await image.arrayBuffer(), {
          httpMetadata: { contentType: image.type || 'application/octet-stream' },
        });

        const event = {
          id,
          title,
          description,
          category,
          date,
          venue,
          link,
          imageKey,
          imageUrl: assetUrl(url.origin, imageKey),
          createdBy,
          createdByEmail: email,
          createdAt: now,
        };

        const existing = await env.EVENTS_BUCKET.get('events.json');
        let events = [];
        if (existing) {
          try {
            const parsed = JSON.parse(await existing.text());
            events = Array.isArray(parsed) ? parsed : [];
          } catch {}
        }
        events.unshift(event);
        await env.EVENTS_BUCKET.put('events.json', JSON.stringify(events), {
          httpMetadata: { contentType: 'application/json' },
        });
        return jsonRes({ success: true, event });
      }

      /* POST /api/upload — legacy server-side upload (kept for compatibility) */
      if (url.pathname === '/api/upload' && request.method === 'POST') {
        /* 1. Verify uploader */
        const { email, response } = await requireUploader(request, env);
        if (response) return response;

        /* 2. Parse form */
        let formData;
        try { formData = await request.formData(); } catch { return jsonRes({ error: 'Bad form data' }, 400); }

        const file = formData.get('file');
        const category = formData.get('category') || 'Notes';
        const year = formData.get('year') || '';
        const sem = formData.get('sem') || '';
        const branch = formData.get('branch') || '';
        const subjectCode = formData.get('subjectCode') || '';
        const folderName = formData.get('folderName') || '';
        const section = normalizeSection(formData.get('section') || 'Gen');
        const allSubjects = String(formData.get('allSubjects') || '').toLowerCase() === 'true';
        const uploaderName = cleanPathSegment(formData.get('uploaderName') || '') || email;

        if (!file || !year || !sem || !branch || !subjectCode || !folderName)
          return jsonRes({ error: 'Missing required fields' }, 400);

        /* 3. Drive filename = folder[/allsubjects]/subject/section/file */
        const driveName = allSubjects
          ? `${folderName}/allsubjects/${subjectCode}/${section}/${file.name}`
          : `${folderName}/${subjectCode}/${section}/${file.name}`;

        /* 4. Upload to Drive */
        try {
          const token = await getDriveAuthToken(env);
          const fileBytes = await file.arrayBuffer();
          const driveFile = await uploadToDrive(token, driveName, fileBytes, file.type, env.DRIVE_ROOT_ID);
          if (!driveFile.id) return jsonRes({ error: 'Drive upload failed: Google did not return a file id', detail: driveFile }, 500);

          /* 5. Build new entry */
          const newEntry = {
            id: driveFile.id,
            name: driveName,
            view: getFileViewName(file.name),
            category,
            year,
            sem,
            branch,
            subjectCode,
            folderName,
            section,
            allSubjects,
            uploaderName,
            uploaderEmail: email,
            mimeType: file.type,
            previewUrl: `https://drive.google.com/file/d/${driveFile.id}/preview`,
          };

          /* 6. Append to files.json in R2 */
          const existing = await env.PYQ_BUCKET.get('files.json');
          let files = [];
          if (existing) {
            try { const parsed = JSON.parse(await existing.text()); files = Array.isArray(parsed) ? parsed : []; } catch { }
          }
          files.push(newEntry);
          await env.PYQ_BUCKET.put('files.json', JSON.stringify(files), { httpMetadata: { contentType: 'application/json' } });

          return jsonRes({ success: true, file: newEntry });
        } catch (driveErr) {
          console.error('Drive upload error:', driveErr);
          return jsonRes({ error: driveErr.message || 'Drive upload failed' }, 500);
        }
      }

      return jsonRes({ error: 'Not Found' }, 404);
    } catch (err) {
      console.error('Unhandled worker error:', err);
      return jsonRes({ error: err.message || 'Internal server error' }, 500);
    }
  },

  /* ── CRON: Rebuild files.json from Drive every 10 min ── */
  async scheduled(event, env, ctx) {
    ctx.waitUntil((async () => {
      console.log('[Cron] Starting Drive scan...');
      const token = await getDriveAuthToken(env);
      const existing = await env.PYQ_BUCKET.get('files.json');
      const existingById = new Map();
      if (existing) {
        try {
          const parsed = JSON.parse(await existing.text());
          if (Array.isArray(parsed)) parsed.forEach(file => file?.id && existingById.set(file.id, file));
        } catch {}
      }
      const drives = await fetchAllFiles(env.DRIVE_ROOT_ID, token);
      const files = drives.map(f => ({
        ...(existingById.get(f.id) || {}),
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        previewUrl: `https://drive.google.com/file/d/${f.id}/preview`,
      }));
      await env.PYQ_BUCKET.put('files.json', JSON.stringify(files), { httpMetadata: { contentType: 'application/json' } });
      console.log(`[Cron] Saved ${files.length} files to R2.`);
    })());
  },
};
