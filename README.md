# TxnFlow — Frontend

> Secure Multi-Tenant Personal Finance Transaction Extractor  
> Built with Next.js 15 · TypeScript · shadcn/ui · Better Auth · Tailwind CSS

![TxnFlow Landing](./screenshot/Screenshot%20(1620).png)
![TxnFlow Features](./screenshot/Screenshot%20(1621).png)
![TxnFlow Dashboard](./screenshot/Screenshot%20(1622).png)
![TxnFlow Transactions](./screenshot/Screenshot%20(1623).png)

---

## Project Structure

```
vessify-frontend/
├── .next/                          # Next.js build output (auto-generated)
├── .vscode/                        # VS Code workspace settings
├── app/                            # Next.js 15 App Router
│   ├── (auth)/                     # Auth route group (no shared layout)
│   │   ├── login/
│   │   │   └── page.tsx            # /login — shadcn form + Better Auth
│   │   └── register/
│   │       └── page.tsx            # /register — shadcn form + Better Auth
│   └── (dashboard)/                # Protected route group
│       └── dashboard/
│           └── page.tsx            # /dashboard — stats + extractor + table
├── components/                     # Reusable UI components
├── lib/                            # Utilities and config
├── public/                         # Static assets
├── screenshot/                     # App screenshots (for README)
│   ├── Screenshot (1620).png
│   ├── Screenshot (1621).png
│   ├── Screenshot (1622).png
│   └── Screenshot (1623).png
├── node_modules/                   # Dependencies
├── .env.local                      # Local environment variables (git-ignored)
├── .gitignore
├── AGENTS.md                       # Agent/AI tool usage notes
├── CLAUDE.md                       # Claude-specific instructions
├── components.json                 # shadcn/ui component registry config
├── eslint.config.mjs               # ESLint flat config
├── favicon.ico
├── globals.css                     # Global Tailwind CSS styles
├── layout.tsx                      # Root layout (fonts, providers)
├── next-env.d.ts                   # Next.js TypeScript declarations
├── next.config.ts                  # Next.js configuration
├── package.json                    # Dependencies and scripts
├── package-lock.json               # Lockfile
├── postcss.config.mjs              # PostCSS config (Tailwind)
├── README.md                       # This file
└── tsconfig.json                   # TypeScript strict config
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Better Auth (session + JWT) |
| Deployment | Vercel |

---

## Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Backend running at `http://localhost:8080`

---

## Installation & Setup

### 1. Clone the repo

```bash
git clone https://github.com/your-username/vessify-frontend.git
cd vessify-frontend/vessify-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8080
BETTER_AUTH_URL=http://localhost:8080
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build for production

```bash
npm run build
npm start
```

---

## Key Files Explained

### `app/(auth)/`
Route group for public auth pages. Pages inside this group do **not** share the dashboard layout. Both `/login` and `/register` use shadcn `<Form>`, `<Input>`, and `<Button>` components and call the Better Auth backend endpoints directly.

### `app/(dashboard)/dashboard/page.tsx`
Protected Server Component. Checked by `middleware.ts` — unauthenticated users are redirected to `/login`. Renders three sections:
- **Stats cards** — total transactions, total debits (₹), average confidence score
- **Transaction Extractor** — textarea + "Parse & Save" button
- **Recent Transactions** — paginated shadcn `<Table>` with cursor-based "Load more"

### `components/`
All reusable UI components live here:
- `transaction-extractor.tsx` — controlled textarea, loading state, error toast
- `transaction-table.tsx` — shadcn Table + cursor pagination logic
- `stats-cards.tsx` — three summary metric cards
- `ui/` — auto-generated shadcn primitives (Button, Card, Table, Form, Input, Badge, etc.)

### `lib/`
- `auth.ts` — Better Auth client config, session helpers
- `api.ts` — typed fetch wrapper that auto-attaches `Authorization: Bearer <token>`
- `utils.ts` — `cn()` class merge helper (clsx + tailwind-merge)

### `components.json`
shadcn/ui registry config — defines component style (`default`), Tailwind CSS path, aliases for `@/components` and `@/lib`.

### `next.config.ts`
- Enables strict mode
- Configures API rewrites if needed (`/api/*` → backend)
- Sets `output: 'standalone'` for containerised deployment

### `tsconfig.json`
Strict TypeScript:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## Available Scripts

```bash
npm run dev        # Start dev server with hot reload (localhost:3000)
npm run build      # Production build
npm start          # Serve production build
npm run lint       # ESLint check
```

---

## Authentication Flow

```
User visits /dashboard
  → middleware.ts checks Better Auth session
  → No session? Redirect to /login
  → /login form → POST /api/auth/login (backend)
  → Backend returns JWT (7-day expiry)
  → Session stored → redirect back to /dashboard
  → All API calls attach Bearer token via lib/api.ts
```

---

## Pages & Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page — hero, features, how it works |
| `/login` | Public | Email + password login |
| `/register` | Public | New account creation |
| `/dashboard` | Protected | Main app — extract + view transactions |

---

## Screenshots

| Screen | Description |
|--------|-------------|
| ![](./screenshot/Screenshot%20(1620).png) | Landing page — hero section |
| ![](./screenshot/Screenshot%20(1621).png) | Features + How It Works section |
| ![](./screenshot/Screenshot%20(1622).png) | Dashboard — stats + extractor |
| ![](./screenshot/Screenshot%20(1623).png) | Dashboard — transaction table |

---

## .env.example

```env
# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8080
BETTER_AUTH_URL=http://localhost:8080
```

---

## Test Users

Seeded via backend `npm run seed`:

| Name | Email | Password |
|------|-------|----------|
| Alice | alice@test.com | Test@1234 |
| Bob | bob@test.com | Test@1234 |

Alice and Bob belong to separate organizations — neither can access the other's transactions.

---

## Deployment (Vercel)

```bash
npm i -g vercel
vercel --prod
```

Add all `.env.local` variables in Vercel Dashboard → Project → Settings → Environment Variables.

---

## AI Tools Used

This project was built with assistance from **Claude (Anthropic)** and **Cursor** for code generation, architecture decisions, and debugging. Every line of code has been reviewed and understood before committing.

---

## Approach to Better Auth Integration

Better Auth manages session creation and organization-level membership on the backend. The frontend uses Better Auth's client SDK to read the active session token, which is then injected into every API request via `lib/api.ts`. Route protection is handled entirely server-side in `middleware.ts` using `getToken()` — so access control never relies on client-side state, eliminating any possibility of bypassing protected routes through browser manipulation.
