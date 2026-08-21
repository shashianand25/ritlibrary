# RIT Library Backend (Cloudflare Worker)

Backend API service for the RIT Library platform, built on Cloudflare Workers and connecting to Neon PostgreSQL and Google Drive.

## Local Development & Testing

### Installation

```bash
npm install
```

### Running Tests

Tests use `@cloudflare/vitest-pool-workers` providing isolated in-memory worker runtimes with Miniflare:

```bash
npm test
```

### Hermetic & Isolated Testing Architecture

Backend test execution is isolated from live third-party services (Google OAuth, Google Drive API, Neon PostgreSQL) to guarantee deterministic test runs with zero external network calls:

- **Google Drive & OAuth Mock (`test/drive.mock.js`)**:
  - Exports `createDriveFetchMock()` which stubs `global.fetch` calls to Google OAuth (`https://oauth2.googleapis.com/token`) and Google Drive API (`https://www.googleapis.com/upload/drive/v3/files` multipart upload, listing, and deletion endpoints).
  - Includes `MOCK_SERVICE_ACCOUNT` with a test PKCS#8 RSA key to verify full JWT generation and signing logic in memory without external auth services.
  - Features a **Strict Zero Network Call Guard**: any outbound HTTP request to an unmocked URL or external service immediately raises an explicit `[Zero Network Call Violation]` error to ensure total network isolation.
  - Provides `parseMultipartBody()` to assert on multipart payload format (JSON metadata part, boundary markers, binary file bytes, and Content-Type).

- **Database Isolation (`test/admins.spec.js`)**:
  - Tests database query builders and connection handling without requiring a live Neon PostgreSQL database instance.

### Environment Variables

Configure `.env` or wrangler secrets based on `.env.example`:

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Google Cloud Service Account
- `GOOGLE_PRIVATE_KEY`: Service Account RSA Private Key
- `NEON_DATABASE_URL`: Neon PostgreSQL pooled connection string
- `ADMIN_EMAILS`: Comma-separated list of bootstrap root admin emails

### Running Locally

```bash
npm run dev
```
