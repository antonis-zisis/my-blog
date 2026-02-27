# My Blog

A personal blog built with Next.js and Firebase. The blog owner signs in via Google to create, edit, and delete posts using a rich text editor. Visitors can read posts without logging in and toggle between dark and light mode.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Firestore
- **Auth:** Firebase Auth (Google sign-in)
- **Editor:** TipTap (WYSIWYG)
- **Dark mode:** next-themes
- **Icons:** lucide-react
- **Hosting:** Netlify

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A Firebase project with Firestore and Authentication (Google provider) enabled

### Setup

1. Clone the repo and install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the sample env file and fill in your Firebase credentials:

   ```bash
   cp .env.sample .env
   ```

   | Variable                 | Source                                                    |
   | ------------------------ | --------------------------------------------------------- |
   | `NEXT_PUBLIC_FIREBASE_*` | Firebase Console > Project Settings > General > Your apps |
   | `NEXT_PUBLIC_ADMIN_UID`  | Firebase Console > Authentication > Users > your User UID |
   | `FIREBASE_PROJECT_ID`    | Same as `NEXT_PUBLIC_FIREBASE_PROJECT_ID`                 |
   | `FIREBASE_CLIENT_EMAIL`  | Service account JSON (`client_email` field)               |
   | `FIREBASE_PRIVATE_KEY`   | Service account JSON (`private_key` field)                |

   To get the service account JSON: Firebase Console > Project Settings > Service accounts > Generate new private key.

3. Create the required Firestore composite index:

   The app queries posts filtered by `published` and ordered by `createdAt`. Firestore will prompt you with a link to create this index on first request — just click it.

4. Start the dev server:

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command       | Description                   |
| ------------- | ----------------------------- |
| `pnpm dev`    | Start dev server (Turbopack)  |
| `pnpm build`  | Production build              |
| `pnpm start`  | Start production server       |
| `pnpm lint`   | Run ESLint                    |
| `pnpm format` | Format codebase with Prettier |

## Project Structure

```
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
├── Editor.tsx                  # TipTap editor with toolbar
├── PostCard.tsx                # Post preview card
├── PostContent.tsx             # Renders sanitized HTML
├── Navbar.tsx                  # Navigation + theme toggle
├── ThemeToggle.tsx             # Sun/moon toggle
├── AuthGuard.tsx               # Protects admin routes
└── LoginButton.tsx             # Google sign-in button

lib/
├── firebase.ts                 # Client SDK init
├── firebase-admin.ts           # Admin SDK init (server-only)
├── auth-context.tsx            # React context for auth state
└── utils.ts                    # Slug generation, date formatting
```

## Deployment

Configured for Netlify via `netlify.toml`. Connect your repo in the Netlify dashboard and set the environment variables from `.env` in the Netlify site settings.

## License

ISC
