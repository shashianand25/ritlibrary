import { registerFileSchema, uploadMetadataSchema } from '../schemas.js';
import { requireAdmin, requireDeleter, requireUploader } from '../utils/auth.js';
import { getFilesFromR2, saveFilesToR2 } from '../services/r2.js';
import { getDriveAuthToken, uploadToDrive, deleteDriveFile } from '../drive.js';
import { getFileViewName, jsonRes } from '../utils/response.js';
import logger from '../utils/logger.js';

export async function handleListFiles(env) {
	const files = await getFilesFromR2(env);
	return jsonRes(files);
}

export async function handleRegisterFile(request, env) {
	const { response } = await requireAdmin(request, env);
	if (response) return response;

	let body;
	try {
		body = await request.json();
	} catch {
		return jsonRes({ error: 'Bad JSON' }, 400);
	}

	const { id, name, mimeType, previewUrl } = registerFileSchema.parse(body);
	const newEntry = { id, name, mimeType: mimeType || '', previewUrl: previewUrl || '' };
	const files = await getFilesFromR2(env);
	files.push(newEntry);
	await saveFilesToR2(env, files);
	logger.info(`Registered file ${name}`);
	return jsonRes({ success: true, file: newEntry });
}

export async function handleUploadFile(request, env) {
	const { email, response } = await requireUploader(request, env);
	if (response) return response;

	let formData;
	try {
		formData = await request.formData();
	} catch {
		return jsonRes({ error: 'Bad form data' }, 400);
	}

	const file = formData.get('file');
	if (!file) return jsonRes({ error: 'File is required' }, 400);

	const validated = uploadMetadataSchema.parse({
		category: formData.get('category') || undefined,
		year: formData.get('year') || undefined,
		sem: formData.get('sem') || undefined,
		branch: formData.get('branch') || undefined,
		subjectCode: formData.get('subjectCode') || undefined,
		folderName: formData.get('folderName') || undefined,
		section: formData.get('section') || undefined,
		allSubjects: formData.get('allSubjects') || undefined,
		uploaderName: formData.get('uploaderName') || undefined,
	});

	const { category, year, sem, branch, subjectCode, folderName, section, allSubjects } = validated;
	const uploaderName = validated.uploaderName || email;

	const driveName = allSubjects
		? `${folderName}/allsubjects/${subjectCode}/${section}/${file.name}`
		: `${folderName}/${subjectCode}/${section}/${file.name}`;

	const token = await getDriveAuthToken(env);
	const fileBytes = await file.arrayBuffer();
	const driveFile = await uploadToDrive(token, driveName, fileBytes, file.type, env.DRIVE_ROOT_ID);
	if (!driveFile.id) return jsonRes({ error: 'Drive upload failed' }, 500);

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

	const files = await getFilesFromR2(env);
	files.push(newEntry);
	await saveFilesToR2(env, files);
	return jsonRes({ success: true, file: newEntry });
}

export async function handleDeleteFile(request, env, url) {
	const { email, response } = await requireDeleter(request, env);
	if (response) return response;

	const fileId = decodeURIComponent(url.pathname.replace('/api/files/', '')).trim();
	if (!fileId) return jsonRes({ error: 'Missing file id' }, 400);

	const files = await getFilesFromR2(env);
	const target = files.find((f) => f?.id === fileId);
	if (!target) return jsonRes({ error: 'File not found' }, 404);

	const token = await getDriveAuthToken(env);
	await deleteDriveFile(token, fileId);
	const nextFiles = files.filter((f) => f?.id !== fileId);
	await saveFilesToR2(env, nextFiles);
	logger.info(`Deleted file ${fileId} by ${email}`);
	return jsonRes({ success: true, id: fileId });
}

export default {
	handleListFiles,
	handleRegisterFile,
	handleUploadFile,
	handleDeleteFile,
};
