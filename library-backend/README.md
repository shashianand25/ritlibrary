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
