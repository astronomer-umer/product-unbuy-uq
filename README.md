# unbuy

A preloved marketplace. Curated sellers. One at a time.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui (base-ui)
- Prisma 7 + SQLite (libsql driver adapter)
- Auth.js v5 (NextAuth beta) — credentials provider, JWT sessions
- Zod for validation
- bcryptjs for password hashing

## Getting started

```bash
pnpm install
cp .env.example .env        # then set AUTH_SECRET to a random string
pnpm prisma db push         # creates dev.db with the schema
pnpm dev                    # http://localhost:6969
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start dev server on port 6969 |
| `pnpm dev-https` | Dev server, LAN HTTPS (for phone testing) |
| `pnpm build` | Generate Prisma client + production build |
| `pnpm start` | Start production server on port 6969 |
| `pnpm db:push` | Push Prisma schema to SQLite |
| `pnpm db:studio` | Open Prisma Studio |

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Home — featured + all listings |
| `/products/[id]` | Product detail |
| `/sellers/[handle]` | Seller profile + their catalog |
| `/login` | Sign in |
| `/register` | Create account |
| `/about` | About page |
| `/api/auth/*` | Auth.js endpoints |

## Typography

- **Bebas Neue** — headings (`font-heading`)
- **Inter** — body (`font-sans`)
- **JetBrains Mono** — numbers, handles, code (`font-mono`)

## Data

Currently mock JSON at `src/data/catalog.json`. Auth uses Prisma + SQLite at `prisma/dev.db`.

## Notes

- Next.js 16: `middleware` renamed to `proxy` (see `src/proxy.ts`).
- Next.js 16: page `params` and `searchParams` are async Promises.
- Prisma 7: datasource URL lives in `prisma.config.ts`, not `schema.prisma`.