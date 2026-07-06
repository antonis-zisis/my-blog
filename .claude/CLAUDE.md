# My Blog — Claude Instructions

## Package manager

Always use `pnpm`. Never use `npm` or `yarn`.

## Workflow

- Do not create git commits unless explicitly asked to.
- Run `pnpm test` and `pnpm build` before committing to catch regressions, type errors, and build failures.

## ESLint rules

- `curly: all` — always use curly braces for `if`/`else`/`for`/`while` bodies, even single-line ones.
- `id-length` (min 2) — no single-character identifiers (e.g. use `event` not `e`, `post` not `p`). Exceptions: `_` and `r`.
- `padding-line-between-statements` — blank line required before every `return` and after every block-like statement (`if`, `for`, `try`, etc.).

## Testing

- Vitest + jsdom + React Testing Library. Tests live in `test/` mirroring source paths (`test/lib`, `test/api`, `test/components`). Run with `pnpm test` (or `pnpm test:watch`).
- **No snapshot tests** — Tailwind class churn and TipTap's nested DOM make them noise. Assert behavior, not markup blobs.
- `src/lib/posts-repository.ts` is deliberately not tested directly — mocking the Firestore query chain costs more than it protects. It is covered indirectly via the API route tests, which mock the repository at the boundary. Revisit only if its `toPost` mapping grows logic.
- Setup gotchas: `vitest.config.ts` aliases `server-only` to `test/stubs/server-only.ts` (required — server-only modules throw outside RSC otherwise), and `test/setup.ts` calls RTL `cleanup()` in an explicit `afterEach` because Vitest globals are off (RTL auto-cleanup does not run without them).
- Open item: an optional Playwright smoke test (home page loads, post navigation, theme toggle) was considered and deferred — it needs a running build plus real Firebase env vars. Ask the user before adding it.

## Architecture

### Layout

- All application code lives under `src/` (`src/app`, `src/components`, `src/lib`). The `@/*` import alias maps to `./src/*`.

### Data flow

- **Public pages** (`src/app/page.tsx`, `src/app/posts/[slug]/page.tsx`) — server components that call the Admin SDK directly. No API routes involved.
- **Admin pages** (`src/app/admin/**`) — client components that call API routes with a Firebase ID token in the `Authorization: Bearer <token>` header.
- **API routes** (`src/app/api/posts/**`) — call `assertAdmin()` from `src/lib/auth-utils.ts` before any mutation. Returns `NextResponse | null` (null = authorised).

### Firestore

- Slug is the Firestore document ID (`posts/{slug}`). No separate slug field needed for lookups.
- All Firestore access goes through `src/lib/posts-repository.ts`. Do not import `adminDb` directly in pages or API routes.
- Firebase client SDK (`src/lib/firebase.ts`) and Admin SDK (`src/lib/firebase-admin.ts`) both use Proxy objects for lazy initialisation — this prevents build-time crashes when env vars are absent.

### Caching

- Public pages are fully static (no `revalidate`, no `force-dynamic`).
- Content is kept fresh via on-demand revalidation: every mutating API route calls `revalidatePath('/')` and `revalidatePath('/posts/[slug]')`.
- Do not add time-based revalidation or `force-dynamic` to public pages.

### Analytics

- `src/components/Analytics.tsx` handles both Firebase Analytics and Umami.
- Both are disabled for the admin user — do not split them back into separate components.

## Key constraints

- `package.json` has no `"type"` field — removing it fixed Turbopack ESM errors. Do not add it back.
- Cover images must be 1200×630px. They are hosted on Cloudinary and referenced by URL.
- `src/lib/firebase-admin.ts` and `src/lib/auth-utils.ts` are server-only — they import `server-only`.
