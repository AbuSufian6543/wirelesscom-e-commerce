# Rapid Radio Gear - E-Commerce Platform

Custom full-stack Next.js e-commerce store for two-way radios and accessories.

## Features

- Conversion-focused storefront (hero, trust badges, featured products, categories, industries, testimonials, newsletter)
- Product catalog with search, categories, industries, and product detail pages
- Product variants/options with CAD/USD pricing and sale prices
- Guest + account checkout with PayPal
- Customer accounts with order history
- Admin panel for products, categories, industries, and orders

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- Auth.js (NextAuth)
- PayPal Server SDK
- Docker Compose

## Prerequisites

- Node.js 20+
- Docker Desktop (Windows 11 dev) or Docker Engine (Debian prod)
- PayPal Developer account (sandbox keys for testing)

## Windows 11 Development

### Option A: Docker (recommended)

```powershell
# Copy environment file
copy .env.example .env

# Start app + database
docker compose up --build
```

Open http://localhost:3000

### Option B: Local Node + Docker Postgres only

```powershell
copy .env.example .env

# Start only Postgres
docker compose up db -d

# Install deps and setup DB
npm install
npx prisma generate
npx prisma db push
npm run db:seed

# Run dev server
npm run dev
```

## Default Admin Login

After seeding:

- Email: `admin@example.com`
- Password: `admin123`

Admin panel: http://localhost:3000/admin

Change credentials via `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` before seeding.

## PayPal Setup

1. Create a PayPal Developer app at https://developer.paypal.com
2. Add sandbox credentials to `.env`:

```env
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-secret
PAYPAL_MODE=sandbox
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-sandbox-client-id
```

## Debian Production Deployment

On your Debian server with a public IP:

```bash
# Clone/copy project to server
git clone <your-repo> radio-store
cd radio-store

# Configure environment
cp .env.example .env
nano .env
```

Set production values:

```env
AUTH_SECRET=<long-random-string>
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
DOMAIN=yourdomain.com
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
POSTGRES_PASSWORD=strong-password
```

Deploy with Caddy reverse proxy:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Caddy will obtain TLS certificates automatically when `DOMAIN` points to your server.

## Useful Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio
```

## Project Structure

```
src/
  app/
    (store)/          # Storefront pages
    admin/            # Admin panel
    actions/          # Server actions
    api/auth/         # Auth.js routes
  components/         # UI components
  lib/                # Utilities, auth, prisma, paypal
prisma/
  schema.prisma       # Database schema
  seed.ts             # Sample data
```

## Environment Variables

See `.env.example` for all required variables.

## Notes

- Multi-currency: CAD and USD prices are stored per product (no live FX).
- Shipping uses flat-rate placeholders; configure in `src/lib/constants.ts`.
- Sized for ~5k users on a single Dockerized server.
