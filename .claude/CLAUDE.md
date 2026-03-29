# My Blog — Claude Instructions

## Package manager

Always use `pnpm`. Never use `npm` or `yarn`.

## Workflow

- Do not create git commits unless explicitly asked to.
- Run `pnpm build` before committing to catch type errors and build failures.

## ESLint rules

- `curly: all` — always use curly braces for `if`/`else`/`for`/`while` bodies, even single-line ones.

## Architecture

### Data flow

- **Public pages** (`app/page.tsx`, `app/posts/[slug]/page.tsx`) — server components that call the Admin SDK directly. No API routes involved.
- **Admin pages** (`app/admin/**`) — client components that call API routes with a Firebase ID token in the `Authorization: Bearer <token>` header.
- **API routes** (`app/api/posts/**`) — call `assertAdmin()` from `lib/auth-utils.ts` before any mutation. Returns `NextResponse | null` (null = authorised).

### Firestore

- Slug is the Firestore document ID (`posts/{slug}`). No separate slug field needed for lookups.
- All Firestore access goes through `lib/posts-repository.ts`. Do not import `adminDb` directly in pages or API routes.
- Firebase client SDK (`lib/firebase.ts`) and Admin SDK (`lib/firebase-admin.ts`) both use Proxy objects for lazy initialisation — this prevents build-time crashes when env vars are absent.

### Caching

- Public pages are fully static (no `revalidate`, no `force-dynamic`).
- Content is kept fresh via on-demand revalidation: every mutating API route calls `revalidatePath('/')` and `revalidatePath('/posts/[slug]')`.
- Do not add time-based revalidation or `force-dynamic` to public pages.

### Analytics

- `components/Analytics.tsx` handles both Firebase Analytics and Umami.
- Both are disabled for the admin user — do not split them back into separate components.

## Key constraints

- `package.json` has no `"type"` field — removing it fixed Turbopack ESM errors. Do not add it back.
- Cover images must be 1200×630px. They are hosted on Cloudinary and referenced by URL.
- `lib/firebase-admin.ts` and `lib/auth-utils.ts` are server-only — they import `server-only`.
