# Contributing to RIT Library

Thank you for your interest in improving RIT Library! We welcome contributions from developers, designers, and students.

---

## 🛠 Getting Started

1. **Fork the Repository**
   Fork the repo to your own GitHub account and clone it locally:
   ```bash
   git clone https://github.com/<your-username>/ritlibrary.git
   cd ritlibrary
   ```

2. **Install Dependencies**
   ```bash
   npm --prefix my-project install
   npm --prefix library-backend install
   ```

3. **Configure Environment**
   ```bash
   cp my-project/.env.example my-project/.env
   cp library-backend/.env.example library-backend/.env
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

# 4. Run ESLint code checks
npm run lint

# 5. Check code formatting
npm run format:check

# 6. Verify production build
npm run build
```

---

## 📝 Commit Conventions & Test-Pairing Policy

We strictly follow the **[Conventional Commits](https://www.conventionalcommits.org/)** specification and maintain a **mandatory test-pairing policy**:

### 1. Test-Pairing Rule
- **Every feature (`feat:`) and bugfix (`fix:`) commit MUST include its corresponding unit, component, or integration test within the exact same commit.**
- Changes submitted without accompanying tests will require revisions before PR approval.

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

## 🚀 Pull Request Process

1. Create a feature branch from `main`: `git checkout -b feat/my-new-feature`.
2. Ensure code follows formatting (`npm run format`) and linting rules (`npm run lint`).
3. Confirm all tests pass (`npm test`).
4. Fill out the pull request template completely and check off all verification items.
