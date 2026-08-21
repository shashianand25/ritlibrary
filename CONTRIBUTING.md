# Contributing to RIT Library

Thank you for your interest in improving RIT Library! We welcome contributions from developers, designers, and students across the community.

---

## 🛠 Getting Started

1. **Fork the Repository**
   Fork the repo to your own GitHub account and clone it locally:
   ```bash
   git clone https://github.com/<your-username>/ritlibrary.git
   cd ritlibrary
   ```

2. **Automated Setup**
   Run the one-step setup command to install all workspace dependencies and initialize local `.env` configuration files:
   ```bash
   npm run setup
   ```

---

## 🧪 Testing & Code Standards

Before opening a pull request, ensure all tests pass and code style meets project requirements:

```bash
# 1. Run frontend automated tests with coverage
npm --prefix my-project run test:coverage

# 2. Run backend automated tests
npm --prefix library-backend test

# 3. Run full monorepo test suite
npm test

# 4. Run ESLint code checks across all workspaces
npm run lint

# 5. Check code formatting with Prettier
npm run format:check

# 6. Verify TypeScript types
npm run typecheck

# 7. Verify production build
npm run build
```

---

## 📝 Commit Conventions & Test-Pairing Policy

We strictly follow the **[Conventional Commits](https://www.conventionalcommits.org/)** specification and maintain a **mandatory test-pairing policy**:

### 1. Test-Pairing Rule
- **Every feature (`feat:`) and bugfix (`fix:`) commit MUST include its corresponding unit, component, or integration test within the exact same commit.**
- Changes submitted without accompanying tests will require revisions before PR approval.
- Follow existing patterns in:
  - **Backend Workers**: [`library-backend/test/*.spec.js`](file:///Users/shashi/notes-rit/library-backend/test) (e.g. `test/drive.spec.js`, `test/routes.spec.js`, `test/index.spec.js`) using isolated mocks and Vitest.
  - **Frontend UI & Hooks**: [`my-project/src/__tests__/*.test.jsx`](file:///Users/shashi/notes-rit/my-project/src/__tests__) using React Testing Library and Vitest.

### 2. Commit Types
- `feat(scope):` New user-facing feature or API capability (paired with tests)
- `fix(scope):` Bug fix or defect resolution (paired with regression test)
- `test(scope):` Test suite expansion or test fixture improvements
- `refactor(scope):` Code restructuring without behavior changes
- `perf(scope):` Performance optimization or bundle reduction
- `docs(scope):` Documentation, issue template, or changelog updates
- `ci(scope):` CI/CD workflows, automation gates, or script enhancements
- `chore(scope):` Dependency bumps or maintenance tasks

### 3. Commit Message Examples
```
feat(backend-health): add /api/health monitoring endpoint with tests
fix(upload): enforce 50MB file size limit with validation tests
refactor(router): decompose fetch dispatch handlers into router.js
test(auth): add edge case tests for expired token rejection
```

---

## 🚀 Pull Request & Code Review Process

To maintain high software quality and foster a sustained, multi-maintainer contributor base:

1. **Small, Focused Pull Requests**:
   - Keep PRs scoped to a single logical feature, fix, or enhancement.
   - Avoid massive monolithic PRs; break large changes into incremental, reviewable pull requests.

2. **Peer Review & Contributor Diversity**:
   - Every pull request requires review and approval from at least one additional maintainer or community contributor prior to merge.
   - Co-authoring and community reviews are actively encouraged to diversify the project's commit history and maintainer ecosystem.

3. **Release Tagging Cadence**:
   - Releases are tagged following [Semantic Versioning](https://semver.org/) (e.g., `v1.3.0`, `v1.4.0`) after each meaningful merged batch of PRs/commits, rather than in large end-of-sprint bursts.
   - All release milestones are documented in [`CHANGELOG.md`](file:///Users/shashi/notes-rit/CHANGELOG.md).

4. **Pull Request Checklist**:
   - Create a feature branch: `git checkout -b feat/my-new-feature`.
   - Ensure formatting (`npm run format`), linting (`npm run lint`), and tests (`npm test`) pass cleanly.
   - Fill out [`.github/PULL_REQUEST_TEMPLATE.md`](file:///Users/shashi/notes-rit/.github/PULL_REQUEST_TEMPLATE.md) completely.
