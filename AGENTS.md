# Repository Guidelines

## Project Structure & Module Organization
- The Next.js App Router lives in `app/` with admin flows under `app/admin` and API routes in `app/api`.
- Shared UI sits in `components/` (stats-specific widgets in `components/stats`), while reusable logic and integrations are in `lib/` (`lib/db.ts`, `lib/email.ts`).
- Database schema and migrations live in `prisma/`; keep seeding logic in `prisma/seed.ts`.
- Automation scripts live under `scripts/` (see `scripts/setup-env.js` for local bootstrap). Static assets and generated JSON statistics belong in `public/`.
- Type definitions consolidate in `types/`; update them when adding new models or DTOs.

## Build, Test, and Development Commands
- `npm run setup:local` provisions a dev database, seeds Season 2 data, and writes `.env`.
- `npm run dev` starts the Next.js dev server with Turbopack; use `npm run build` before shipping to catch compilation issues.
- `npm run lint` runs the repository-wide ESLint configuration; fix violations before opening a PR.
- Database helpers: `npm run db:dev` spins up the Prisma dev service, `npm run db:migrate:dev` applies migrations, and `npm run db:seed` replays baseline tournament data.

## Coding Style & Naming Conventions
- TypeScript and React files use 2-space indentation, no semicolons, and named exports where possible.
- Components follow `PascalCase` filenames (e.g., `RoundSummaryCard.tsx`); utility modules stay `camelCase`.
- Favor Tailwind utility classes over custom CSS, and keep variant logic in hooks or helpers inside `lib/`.
- Run `npm run lint` after large refactors; the repo uses `eslint-config-next` plus custom chess-specific rules in `eslint.config.mjs`.

## Testing Guidelines
- Automated tests are not yet in place; when adding them, co-locate files as `*.spec.ts` beside the module or under a new `tests/` directory.
- Prefer integration coverage against key flows (registration, round management, stats generation) and mock Prisma with the official `@prisma/client` test utilities.
- Always document manual verification steps in the PR description if no automated test exists.

## Commit & Pull Request Guidelines
- Recent commits use concise, descriptive subjects (`Add Round 2 statistics...`, `Fix round availability...`). Keep them in the imperative mood and limit to ~70 characters.
- Each PR should outline the change, list commands run (`npm run lint`, manual scripts), call out schema or seed updates, and attach screenshots for UI tweaks.
- Link issues or checklist items, and mention any required environment variable updates so operations can track deployment changes.
