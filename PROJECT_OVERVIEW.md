# WebClarity Web App - Project Overview

## 📖 Introduction

This is the web application for **WebClarity**, a SaaS product built on the [supastarter for Next.js](https://supastarter.dev) foundation. The application provides a robust, production-ready infrastructure for building and scaling a modern SaaS business.

## 🏗️ Architecture Overview

### Monorepo Structure

This project uses a **monorepo architecture** powered by **Turborepo** and **pnpm workspaces**, allowing for better code organization, sharing, and maintainability.

```
web-app/
├── apps/                    # Application packages
│   └── web/                 # Main Next.js application
│       ├── app/             # Next.js App Router pages
│       ├── modules/         # Feature modules
│       ├── content/         # MDX content (blog, docs)
│       └── public/          # Static assets
│
├── packages/                # Shared packages
│   ├── api/                 # API routes & procedures (oRPC)
│   ├── auth/                # Authentication (Better Auth)
│   ├── database/            # Database layer (Prisma)
│   ├── storage/             # File storage (Supabase/S3)
│   ├── mail/                # Email templates & providers
│   ├── payments/            # Payment processing (Stripe)
│   ├── ai/                  # AI features (OpenAI)
│   ├── i18n/                # Internationalization
│   ├── logs/                # Logging utilities
│   └── utils/               # Shared utilities
│
├── config/                  # Application configuration
├── tooling/                 # Build configuration
│   ├── tailwind/            # Tailwind CSS config
│   ├── typescript/          # TypeScript configs
│   └── scripts/             # Build scripts
│
└── [Configuration Files]    # Root config files
```

## 🛠️ Tech Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.7 | React framework with App Router |
| **React** | 19.2.1 | UI library |
| **TypeScript** | 5.9.3 | Type-safe JavaScript |
| **Turborepo** | 2.6.1 | Monorepo build system |
| **pnpm** | 10.14.0 | Package manager |

### Backend & Database

| Technology | Purpose |
|------------|---------|
| **Prisma** | ORM for database access |
| **PostgreSQL** | Primary database (via Supabase) |
| **Better Auth** | Authentication system |
| **oRPC** | Type-safe API procedures |

### Frontend & UI

| Technology | Purpose |
|------------|---------|
| **Tailwind CSS** | Utility-first CSS framework |
| **Shadcn UI** | Component library |
| **Radix UI** | Accessible component primitives |
| **Lucide Icons** | Icon library |
| **Next Themes** | Dark mode support |

### Features & Integrations

| Service | Purpose |
|---------|---------|
| **Supabase** | Database, Storage, (optional) Auth |
| **Stripe** | Payment processing |
| **OpenAI** | AI features (optional) |
| **Email Providers** | Transactional emails (Plunk/Resend/etc) |
| **Analytics** | User analytics (configurable) |

## 📦 Package Details

### `@repo/web` (apps/web)

The main Next.js application containing all user-facing pages and components.

**Key Features:**
- Server-side rendering (SSR)
- Static site generation (SSG)
- API routes
- File-based routing (App Router)
- Internationalization (i18n)
- MDX content support

**Module Organization:**
- `modules/marketing/` - Landing page, blog, docs
- `modules/saas/` - SaaS dashboard features
- `modules/auth/` - Authentication UI
- `modules/shared/` - Shared components
- `modules/ui/` - UI component library

### `@repo/api` (packages/api)

Type-safe API layer using oRPC (RPC-style APIs with full TypeScript support).

**Modules:**
- `admin/` - Admin operations
- `ai/` - AI chat features
- `contact/` - Contact form handling
- `organizations/` - Team management
- `payments/` - Billing operations
- `users/` - User management

### `@repo/auth` (packages/auth)

Authentication system built on Better Auth.

**Features:**
- Email/password authentication
- Magic link login
- Social OAuth (Google, GitHub)
- Passkey support
- Two-factor authentication (2FA)
- Session management
- Organization/team support

### `@repo/database` (packages/database)

Database access layer using Prisma ORM.

**Includes:**
- Prisma schema
- Type-safe database client
- Query helpers
- Zod schema generation
- Migration management

**Models:**
- User, Session, Account
- Organization, Member, Invitation
- Purchase (subscriptions)
- AiChat (AI conversations)
- Passkey, TwoFactor, Verification

### `@repo/storage` (packages/storage)

File storage abstraction supporting multiple providers.

**Providers:**
- Supabase Storage (default)
- S3-compatible storage

**Features:**
- Signed upload URLs
- Public URL generation
- File deletion
- Multiple bucket support

### `@repo/mail` (packages/mail)

Email system with React-based templates.

**Providers:**
- Plunk
- Resend
- Postmark
- Nodemailer (SMTP)

**Templates:**
- Magic link emails
- Email verification
- Password reset
- Organization invitations
- Newsletter signup

### `@repo/payments` (packages/payments)

Payment processing abstraction.

**Providers:**
- Stripe (default)
- LemonSqueezy
- Polar
- Creem
- DodoPayments

**Features:**
- Subscription management
- One-time payments
- Seat-based pricing
- Trial periods
- Customer portal

### `@repo/i18n` (packages/i18n)

Internationalization support.

**Features:**
- Multiple language support
- Translation management
- Locale detection
- Currency formatting

**Current Languages:**
- English (en)
- German (de)

## 🔧 Key Configuration Files

### Root Configuration

- `package.json` - Root package.json with scripts and dependencies
- `pnpm-workspace.yaml` - pnpm workspace configuration
- `turbo.json` - Turborepo build configuration
- `tsconfig.json` - Root TypeScript configuration
- `biome.json` - Biome linter/formatter configuration
- `.env.example` - Environment variable template
- `.env.local` - Local environment variables (gitignored)

### Application Configuration

- `config/index.ts` - **Main application configuration**
  - App name and branding
  - Feature flags
  - i18n settings
  - Auth settings
  - Organization settings
  - Payment plans

### Build Configuration

- `apps/web/next.config.ts` - Next.js configuration
- `apps/web/tailwind.config.ts` - Tailwind CSS configuration
- `packages/database/prisma/schema.prisma` - Database schema

## 🎯 Key Features

### Authentication & Authorization

✅ Multiple authentication methods
✅ Role-based access control (User, Admin)
✅ Session management
✅ Email verification
✅ Password reset
✅ Two-factor authentication
✅ Passkey support (WebAuthn)

### Organization/Team Management

✅ Multi-tenant architecture
✅ Team invitations
✅ Role-based permissions (Owner, Admin, Member)
✅ Organization billing
✅ Member management

### Billing & Payments

✅ Subscription plans (monthly/yearly)
✅ One-time payments
✅ Free tier
✅ Trial periods
✅ Seat-based pricing
✅ Customer portal
✅ Invoice management

### Content Management

✅ MDX-based blog
✅ Documentation system (Fumadocs)
✅ Changelog
✅ Legal pages

### Developer Experience

✅ Type-safe API calls
✅ Auto-generated TypeScript types
✅ Hot module replacement
✅ Fast refresh
✅ Biome linting
✅ Playwright E2E testing

### User Experience

✅ Responsive design (mobile-first)
✅ Dark mode
✅ Loading states
✅ Error boundaries
✅ Toast notifications
✅ Internationalization

## 🔐 Security Features

- CSRF protection
- Rate limiting (configurable)
- Secure session management
- Environment variable validation
- SQL injection protection (via Prisma)
- XSS protection (via React)

## 🚀 Deployment

### Recommended Platforms

- **Vercel** (primary, optimized for Next.js)
- **Netlify**
- **Railway**
- **Fly.io**
- **Self-hosted** (Docker)

### Environment Requirements

- Node.js v20+
- PostgreSQL database
- Redis (optional, for rate limiting)
- S3-compatible storage or Supabase

## 📊 Performance

### Optimizations

- Server-side rendering (SSR)
- Static site generation (SSG)
- Incremental static regeneration (ISR)
- Image optimization (next/image)
- Code splitting
- Lazy loading
- Bundle analysis

### Monitoring

- Error tracking (Sentry)
- Analytics (configurable provider)
- Performance monitoring
- User session recording (optional)

## 🧪 Testing

### Test Types

- **E2E Tests**: Playwright (in `apps/web/tests/`)
- **Type Checking**: TypeScript
- **Linting**: Biome

### Running Tests

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# E2E tests
pnpm --filter web e2e

# E2E tests in UI mode
pnpm --filter web e2e:ui
```

## 📚 Development Workflow

### Daily Development

```bash
# Start development server
pnpm dev

# Run type checking
pnpm type-check

# Format code
pnpm format

# Run linter
pnpm lint

# Clean build artifacts
pnpm clean
```

### Database Operations

```bash
# Push schema changes
pnpm --filter database push

# Generate Prisma client
pnpm --filter database generate

# Create migration
pnpm --filter database migrate

# Open Prisma Studio
pnpm --filter database studio
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter web build

# Start production server
pnpm start
```

## 🎨 Customization Points

### Branding
- `config/index.ts` - App name, settings
- `apps/web/public/images/` - Logos, favicons
- `tooling/tailwind/theme.css` - Colors, fonts

### Content
- `apps/web/content/docs/` - Documentation
- `apps/web/content/posts/` - Blog posts
- `apps/web/content/legal/` - Legal pages

### Features
- `config/index.ts` - Enable/disable features
- `apps/web/modules/` - Add custom modules
- `packages/api/modules/` - Add API endpoints

### Styling
- `tooling/tailwind/` - Tailwind configuration
- `apps/web/modules/ui/` - UI components
- `apps/web/globals.css` - Global styles

## 🔄 Upgrade Path

### Staying Updated

The project is based on supastarter, which receives regular updates. To update:

```bash
# Check for updates
git remote add upstream https://github.com/supastarter/supastarter-nextjs.git
git fetch upstream

# Merge updates (carefully)
git merge upstream/main

# Resolve conflicts
# Test thoroughly
```

**Note**: Always review changes before merging updates to avoid breaking custom features.

## 📖 Learning Resources

### Official Documentation
- [supastarter Docs](https://supastarter.dev/docs/nextjs)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Better Auth Docs](https://better-auth.com)

### Community
- [supastarter Discord](https://discord.gg/supastarter)
- [Next.js Discord](https://nextjs.org/discord)

## 🤝 Contributing

When contributing to WebClarity:

1. Follow the existing code style (enforced by Biome)
2. Write TypeScript (no JavaScript files)
3. Use functional components (no classes)
4. Add types for all functions
5. Write descriptive commit messages
6. Test thoroughly before committing

## 📝 License

This project is built on supastarter, which requires a license. Refer to the supastarter license for details.

---

**Project**: WebClarity
**Built on**: supastarter for Next.js
**Version**: Initial Setup
**Last Updated**: December 2025

