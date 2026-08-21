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
# 1. Run automated test suite
npm run test:coverage

# 2. Run ESLint code checks
npm run lint

# 3. Check code formatting
npm run format:check

# 4. Verify production build
npm run build
```

---

## 📝 Commit Conventions

We follow the Conventional Commits specification:
- `feat:` New features
- `fix:` Bug fixes
- `refactor:` Code restructuring without behavior changes
- `test:` Adding or updating unit/component tests
- `docs:` Documentation improvements
- `ci:` Continuous integration and automation workflows
