# unbuy

A preloved marketplace storefront — currently configured as a single-seller
shop (Shoe Monkey PK) for one Instagram seller. Built as a Next.js app so it
can scale to multiple sellers later without rewrites.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui (base-ui)
- Prisma 7 + SQLite (libsql driver adapter)
- Auth.js v5 (NextAuth beta) — credentials provider, JWT sessions
- Zod for validation
- bcryptjs for password hashing (cost 12)

## Quick start

```bash
pnpm install
cp .env.example .env
# Edit .env: set AUTH_SECRET to a random 32+ char string
pnpm prisma db push      # creates dev.db
pnpm db:seed             # seeds 6 products + 2 user accounts
pnpm dev                 # http://localhost:6969
```

## Seeded accounts

| Role | Email | Password |
| --- | --- | --- |
| Owner | `owner@unbuy.local` | `unbuy-owner-dev` |
| Seller | `shoemonkey@unbuy.local` | `shoemonkey-dev` |

**Change these in production.**

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server on port 6969 |
| `pnpm build` | Production build (runs `prisma generate`) |
| `pnpm start` | Production server on port 6969 |
| `pnpm db:push` | Push schema to SQLite |
| `pnpm db:seed` | Seed products + users from catalog.json |
| `pnpm db:studio` | Open Prisma Studio |

## Routes

| Path | Who | Purpose |
| --- | --- | --- |
| `/` | public | Home — hero, featured, all |
| `/shop` | public | Catalog with search + filters (size, brand, condition, status) |
| `/products/[id]` | public | Product detail, WhatsApp/IG contact |
| `/about` | public | About page |
| `/login`, `/register` | public | Auth |
| `/admin` | authed | Product list (mark sold, delete) |
| `/admin/products/new` | authed | Add product + image upload |
| `/admin/products/[id]` | authed | Edit product |
| `/api/auth/*` | public | Auth.js endpoints |
| `/sitemap.xml`, `/robots.txt` | public | Auto-generated |

## Environment variables

| Var | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | SQLite path. Defaults to `file:./dev.db` |
| `AUTH_SECRET` | yes | 32+ char random. Used to sign JWT sessions. **Never commit this.** |
| `AUTH_TRUST_HOST` | prod | Set to `true` behind a proxy. |
| `NEXT_PUBLIC_SITE_URL` | prod | Canonical URL for sitemap/OG meta. e.g. `https://shop.example.com` |

## Security

- ✅ Bcrypt cost 12
- ✅ Rate limit on `/login` (10/hr) and `/register` (5/hr) per IP
- ✅ CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy
- ✅ Image upload magic-byte validation (real images only)
- ✅ Filenames generated server-side (no user input on filesystem path)
- ✅ Path traversal guard on upload destination
- ✅ Server-side Zod validation on all forms
- ✅ Email lowercased + trimmed before lookup
- ✅ HTTP-only, secure session cookies (Auth.js defaults)
- ✅ `/admin/*` protected via auth check in layout
- ✅ `/admin` and `/api` excluded from sitemap + robots
- ✅ OAuth-style CSRF protection via Auth.js server actions

## Deploying to production

1. Set `DATABASE_URL` to a managed Postgres (Neon/Supabase). Update `prisma/schema.prisma` provider and rerun `prisma db push`.
2. Generate `AUTH_SECRET`: `openssl rand -base64 32`
3. Set `NEXT_PUBLIC_SITE_URL` to your canonical domain
4. Run `pnpm build && pnpm start` (or push to Vercel)
5. Replace the WhatsApp number in `src/lib/seller.ts` with the real one
6. Replace the seeded admin accounts

## Typography

- **Bebas Neue** — headings
- **Inter** — body
- **JetBrains Mono** — prices, handles, mono UI

## Color palette

Bone/cream background, deep ink foreground, muted clay/terracotta accent.
Defined in `src/app/globals.css` using OKLCH.