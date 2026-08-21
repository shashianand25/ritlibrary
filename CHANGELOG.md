# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

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
