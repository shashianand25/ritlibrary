# RIT Library Backend (Cloudflare Worker)

Backend API service for the RIT Library platform, built on Cloudflare Workers and connecting to Neon PostgreSQL and Google Drive.

## Local Development & Testing

### Installation

```bash
npm install
```

### Running Tests

Tests use Vitest providing isolated in-memory worker runtimes with Miniflare:

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

---

## 📡 Observability & Metrics Telemetry

The Cloudflare Worker backend utilizes a structured JSON logger (`src/utils/logger.js`) with request correlation and Prometheus/JSON runtime telemetry (`src/utils/metrics.js`).

### 1. Structured JSON Log Format

Every log output contains standardized fields for high-volume streaming, Logpush indexing, and log aggregation:

```json
{
	"timestamp": "2026-08-21T06:51:07.123Z",
	"level": "ERROR",
	"requestId": "req_81264548-5899-46aa-b0be-cb5a1d835bbd",
	"message": "Unhandled worker error on [POST] /api/upload",
	"error": {
		"name": "Error",
		"message": "Drive service unavailable",
		"stack": "Error: Drive service unavailable\n    at uploadToDrive..."
	},
	"context": {
		"path": "/api/upload",
		"method": "POST"
	}
}
```

- **`timestamp`**: ISO 8601 UTC timestamp.
- **`level`**: Log severity level (`DEBUG`, `INFO`, `WARN`, `ERROR`).
- **`requestId`**: Correlated request identifier extracted from Cloudflare `CF-Ray`, `X-Request-Id`, or auto-generated UUID.
- **`message`**: Human-readable log narrative.
- **`context`**: Additional execution metadata (HTTP path, method, user identifier).
- **`error`**: Serialized exception details with stack trace.

### 2. Runtime Metrics & Health Endpoints

- **`GET /api/health`**: Availability and status probe returning JSON `{ status: "ok" }`.
- **`GET /api/metrics`**: Exposes standard Prometheus text metrics (request totals, 5xx error totals, uptime, and route breakdowns) or JSON metrics when queried with `Accept: application/json`.

### 3. Request Correlation & Contextual Loggers

Create request-scoped loggers that automatically inherit `requestId` and route metadata:

```javascript
import logger from './utils/logger.js';

const reqLogger = logger.withContext(
	{
		requestId: request.headers.get('cf-ray'),
		path: url.pathname,
		method: request.method,
	},
	env
);

reqLogger.info('Processing file upload', { fileSize: 1048576 });
```

---

## Environment Variables

Configure `.env` or wrangler secrets based on `.env.example`:

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Google Cloud Service Account
- `GOOGLE_PRIVATE_KEY`: Service Account RSA Private Key
- `NEON_DATABASE_URL`: Neon PostgreSQL pooled connection string
- `ADMIN_EMAILS`: Comma-separated list of bootstrap root admin emails
- `LOGPUSH_URL`: (Optional) Remote Logpush / Webhook ingestion endpoint

## Running Locally

```bash
npm run dev
```
