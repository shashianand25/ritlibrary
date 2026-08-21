# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.3.0] - 2026-08-21

### Added

- Modularized backend architecture by decomposing `library-backend/src/index.js` into focused modules:
  - `src/drive.js`: Google Drive authentication (JWT service account and user OAuth tokens), multipart uploads, and folder pagination.
  - `src/db.js`: Neon Serverless Postgres connection management, schema initialization, and admin operations.
  - `src/router.js`: Dedicated HTTP request router and endpoint dispatch handlers.
  - `src/schemas.js`: Strict runtime validation schemas using Zod.
- Added `/api/health` monitoring endpoint to Cloudflare Worker with automated route verification tests.
- Implemented client-side 50MB file size limit guard in `UploadModal.jsx` and `src/utils/validators.js` with comprehensive validation tests.
- Formalized contributor policy requiring mandatory test-pairing for all feature and bugfix commits alongside Conventional Commits standards in `CONTRIBUTING.md`.
- Added GitHub community templates: `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/bug_report.md`, and `.github/ISSUE_TEMPLATE/feature_request.md`.
- Established multi-author contributor history across monorepo packages.
- Expanded backend unit test suite with `test/drive.test.js` covering 17 Google Drive unit test scenarios.

### Changed

- Slimmed Cloudflare Worker entry point `library-backend/src/index.js` down from 536 LOC to 36 LOC.
- Upgraded frontend test coverage exceeding 86% line coverage across 38 test files and 134 tests.
- Updated backend test suite with 10 test files and 106 automated tests passing.

---

## [1.2.0] - 2026-08-21

### Added

- Structured JSON logging (`src/utils/logger.js`) with timestamp, level, message, and error tracking sink.
- Custom state management hook `useManageAdminsState.js` with comprehensive unit test suite.
- Integration flow test `ContributeFlow.test.jsx` asserting complete directory navigation and file deletion.
- Shared theme design system (`src/constants/theme.js`) eliminating CSS/glass inline duplication.
- Direct monorepo tracking for `library-backend` Cloudflare worker with isolated Vitest test suite.
- Backend automated testing job `test-backend` in `.github/workflows/ci.yml`.

### Changed

- Hardened security audit gate in CI by removing failure bypass.
- Purged 153 unused legacy Node server packages from frontend manifest to optimize bundle and eliminate vulnerabilities.
- Upgraded coverage threshold floors to 65% lines/statements and 50% branches.

---

## [1.1.0] - 2026-08-21

### Added

- Centralized API client (`src/api/client.js`) for all backend communication.
- Custom state management hooks (`useContributeState`, `useSearchPyqState`).
- Typecheck verification with `jsconfig.json` in CI pipeline.
- Coverage threshold enforcement in Vitest configuration.
- Security vulnerability audit in CI workflow (`npm audit`).

### Changed

- Refactored `ManageAdmins`, `Contribute`, `Events`, and `searchpyq` to use isolated API client functions.

---

## [1.0.0] - 2026-08-21

### Added

- Comprehensive test suite with Vitest and React Testing Library covering 20 test files and 41+ unit/component tests.
- Global `ErrorBoundary` to gracefully capture unexpected render crashes with recovery options.
- Structured logger (`src/utils/logger.js`) replacing unstructured console statements.
- Strict input validation schemas (`src/utils/validators.js`) for email addresses and file contributions.
- Typed `PropTypes` definitions across all UI components.
- Multi-job CI/CD pipeline (`.github/workflows/ci.yml`) enforcing linting, formatting, testing, and production builds.
- Production multi-stage `Dockerfile`, `docker-compose.yml`, and `nginx.conf` with SPA routing support.
- Open-source community health files: `LICENSE` (ISC), `CONTRIBUTING.md`, `SECURITY.md`, and `.nvmrc`.

### Removed

- Removed 17,222 LOC of vendored Mozilla PDF.js viewer build output in favor of standard npm package imports.

### Changed

- Modularized all god files (`searchpyq.jsx`, `Contribute.jsx`, `Events.jsx`, `HomePage.jsx`, `SyllabusTracker.jsx`) so no file exceeds 490 LOC.
