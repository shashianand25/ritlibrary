/**
 * Hermetic Test Suite Environment Setup
 *
 * Stubs required environment variables and secrets so the entire backend test suite
 * can run completely offline without needing live database or Cloudflare credentials.
 */

if (!process.env.DATABASE_URL) {
	process.env.DATABASE_URL =
		'postgresql://mock_user:mock_pass@mock-pooler.us-east-2.aws.neon.tech/mockdb?sslmode=require';
}
if (!process.env.ADMIN_EMAILS) {
	process.env.ADMIN_EMAILS = 'admin@rit.edu,developer@rit.edu';
}
if (!process.env.DRIVE_ROOT_ID) {
	process.env.DRIVE_ROOT_ID = 'mock-drive-root-folder-id';
}
if (!process.env.FIREBASE_API_KEY) {
	process.env.FIREBASE_API_KEY = 'mock_firebase_web_api_key';
}
