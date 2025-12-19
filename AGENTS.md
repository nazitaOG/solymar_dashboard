Listen up, agents — no fluff. Use these commands first:

- Build: pnpm build || npm run build (uses `nest build`)
- Dev: pnpm start:dev || npm run start:dev (watch mode)
- Lint: pnpm run lint || npm run lint (ESLint + autofix)
- Format: pnpm run format || npm run format (Prettier, .prettierrc)
- Test (all): pnpm test || npm run test (Jest)
- Run a single test file: pnpm test -- src/path/to/file.spec.ts OR npm run test -- src/path/to/file.spec.ts
- Run a single test by name: pnpm test -- -t "partial test name" (or npm run test -- -t "name")
- E2E / Coverage / Debug: npm run test:e2e, npm run test:cov, npm run test:debug
- Prisma: npm run prisma:generate | prisma:migrate | prisma:seed

Code style and agent rules (be strict):

- Formatting: follow .prettierrc; run `npm run format` before commits.
- Imports: external packages first, then absolute project imports (use tsconfig paths), then relative imports; avoid deep relative chains (../../../). Keep grouped and alphabetized.
- Naming: Classes/Controllers/Services/DTOs = PascalCase; files and folders = kebab-case; functions/variables = camelCase; DTO suffix: _Dto; tests: _.spec.ts.
- Types: prefer explicit return types on exported functions/methods; avoid `any`. Use `unknown` + validated casts if necessary. Use Prisma client types for DB models.
- DTOs / Validation: use class-validator/class-transformer for incoming data. DTO classes are the contract.
- Error handling: never swallow errors. Use Nest exceptions (BadRequestException, NotFoundException, HttpException) and structured-logger (common/logging/structured-logger.ts). Log context & metadata, then throw or rethrow mapped HTTP errors.
- Async: use async/await consistently; handle/rethrow promise errors. Prefer transactions for multi-step DB changes.
- Tests: unit test with mocked Prisma, e2e with supertest. Keep tests deterministic and focused.

Cursor/Copilot rules: none found in repository (no .cursor rules or .github/copilot-instructions.md).

If you alter code style rules here, document why and add a migration note. No shortcuts — write code that survives production.
