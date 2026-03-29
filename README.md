# My Blog

[![Netlify Status](https://api.netlify.com/api/v1/badges/ef7d0975-f273-4a3a-ab21-4b07ed2422f5/deploy-status)](https://app.netlify.com/projects/az-my-blog/deploys)

Personal blog at [blog.antoniszisis.com](https://blog.antoniszisis.com)

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Firestore
- **Auth:** Firebase Auth (Google sign-in)
- **Editor:** TipTap (WYSIWYG)
- **Dark mode:** next-themes
- **Icons:** lucide-react
- **Analytics:** Firebase Analytics + Umami
- **Hosting:** Netlify, Cloudinary (Images)

## Scripts

| Command       | Description                   |
| ------------- | ----------------------------- |
| `pnpm dev`    | Start dev server (Turbopack)  |
| `pnpm build`  | Production build              |
| `pnpm start`  | Start production server       |
| `pnpm lint`   | Run ESLint                    |
| `pnpm format` | Format codebase with Prettier |

## Project Structure

```text
app/
├── layout.tsx                  # Root layout (ThemeProvider, AuthProvider, Navbar)
├── page.tsx                    # Homepage — list published posts
├── globals.css
├── posts/[slug]/page.tsx       # Public post view
├── login/page.tsx              # Google sign-in
├── admin/
│   ├── layout.tsx              # Auth guard wrapper
│   ├── page.tsx                # Dashboard — list all posts, delete
│   ├── new/page.tsx            # Create post (TipTap editor)
│   └── edit/[slug]/page.tsx    # Edit post (TipTap editor)
└── api/posts/
    ├── route.ts                # GET (list published), POST (create)
    ├── all/route.ts            # GET (list all — admin only)
    └── [slug]/route.ts         # GET, PUT, DELETE

components/
├── Analytics.tsx               # Combined Firebase + Umami analytics
├── Editor.tsx                  # TipTap editor
├── EditorToolbar.tsx           # TipTap toolbar buttons
├── PostCard.tsx                # Post preview card
├── PostContent.tsx             # Renders sanitized HTML
├── Navbar.tsx                  # Navigation + theme toggle
├── ThemeToggle.tsx             # Sun/moon toggle
├── AuthGuard.tsx               # Protects admin routes
├── LoginButton.tsx             # Google sign-in button
├── ConfirmModal.tsx            # Delete confirmation dialog
└── Footer.tsx                  # Footer with social links

lib/
├── firebase.ts                 # Client SDK init
├── firebase-admin.ts           # Admin SDK init (server-only)
├── auth-context.tsx            # React context for auth state
├── auth-utils.ts               # assertAdmin helper for API routes
├── cloudinary.ts               # Cloudinary URL transformation
├── posts-repository.ts         # Firestore data access layer
└── utils.ts                    # Slug generation, date formatting, reading time
```

## Caching and cold starts

Netlify runs Next.js server components via serverless functions. On a low-traffic blog these functions go cold between visits — when cold, they take several seconds to wake up. During that time, client-side navigation (clicking a link) appears completely frozen with no feedback.

**How this is solved:** all public-facing pages are fully static — pre-rendered at build time and served directly from Netlify's CDN. No serverless function is involved when navigating between pages, so cold starts don't affect visitors.

- `app/page.tsx` — no `revalidate`, no `force-dynamic` → fully static, served from CDN
- `app/posts/[slug]/page.tsx` — `generateStaticParams` pre-renders all published posts at build time; no time-based revalidation, content is updated only via `revalidatePath`

Since static pages don't re-fetch on every request, content is kept fresh via **on-demand revalidation**: every API route that mutates data calls `revalidatePath()` from `next/cache`, which tells Next.js to regenerate the affected static pages immediately.

| Admin action | Pages regenerated       |
| ------------ | ----------------------- |
| Create post  | `/` and `/posts/[slug]` |
| Update post  | `/` and `/posts/[slug]` |
| Delete post  | `/` and `/posts/[slug]` |

**One thing to expect:** after saving or publishing, the static cache for those pages is purged. The next person to visit (usually myself) triggers a one-time regeneration and may see a brief loading spinner. All subsequent visitors get the CDN-cached version instantly.

## Cover Images

Cover images are optional per post. They are hosted on [Cloudinary](https://cloudinary.com) and referenced by URL in the admin editor.

Images must be generated at exactly **1200×630px**. This size is used for both the post card on the homepage and the cover on the post page itself.

## License

© 2026 Antonis Zisis. All rights reserved. This repository is public for reference and transparency only — no permission is granted to copy, modify, or redistribute the code.
