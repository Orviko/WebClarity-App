# WebClarity - Web Application

> **A production-ready SaaS starter built on supastarter for Next.js**

WebClarity is a comprehensive web application for [your SaaS product description]. This repository contains the complete web application built with Next.js, TypeScript, and modern web technologies.

## 🚀 Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Set up database
pnpm --filter database push
pnpm --filter database generate

# 4. Start development server
pnpm dev

# 5. Open http://localhost:3000
```

## 📋 Documentation

- **[Setup Guide](SETUP_GUIDE.md)** - Complete step-by-step setup instructions
- **[Setup Checklist](SETUP_CHECKLIST.md)** - Track your setup progress
- **[Project Overview](PROJECT_OVERVIEW.md)** - Architecture and tech stack details
- **[Changelog](CHANGELOG.md)** - Version history and updates

## 🛠️ Tech Stack

### Core
- **Next.js 16** - React framework with App Router
- **TypeScript 5.9** - Type-safe JavaScript
- **Tailwind CSS v4** - Utility-first styling
- **Turborepo** - Monorepo build system

### Backend
- **Prisma** - Database ORM
- **PostgreSQL** - Database (via Supabase)
- **Better Auth** - Authentication
- **oRPC** - Type-safe API

### Features
- **Supabase** - Database, Storage, Auth
- **Stripe** - Payment processing
- **Email Providers** - Transactional emails
- **Analytics** - User tracking (configurable)

## 📦 Project Structure

```
web-app/
├── apps/web/          # Main Next.js application
├── packages/          # Shared packages
│   ├── api/           # API procedures
│   ├── auth/          # Authentication
│   ├── database/      # Database layer
│   ├── storage/       # File storage
│   ├── mail/          # Email system
│   ├── payments/      # Payment processing
│   └── ...
├── config/            # App configuration
└── tooling/           # Build tools
```

## 🎯 Features

### Authentication
- ✅ Email/password login
- ✅ Magic link authentication
- ✅ Social OAuth (Google, GitHub)
- ✅ Two-factor authentication (2FA)
- ✅ Passkey support (WebAuthn)

### Organizations
- ✅ Multi-tenant teams
- ✅ Role-based access control
- ✅ Team invitations
- ✅ Organization billing

### Payments
- ✅ Subscription plans
- ✅ One-time payments
- ✅ Free tier
- ✅ Trial periods
- ✅ Customer portal

### Content
- ✅ MDX blog
- ✅ Documentation
- ✅ Changelog
- ✅ Legal pages

### UI/UX
- ✅ Responsive design
- ✅ Dark mode
- ✅ Loading states
- ✅ Toast notifications
- ✅ Internationalization (i18n)

## 🔧 Configuration

The main configuration file is `config/index.ts`. Key settings:

```typescript
export const config = {
  appName: "WebClarity",
  organizations: {
    enable: true,
    enableBilling: true,  // Organization-level billing
  },
  users: {
    enableBilling: false, // User-level billing disabled
    enableOnboarding: true,
  },
  auth: {
    enableSignup: true,
    enableMagicLink: true,
    enableSocialLogin: true,
  },
  // ... more settings
};
```

## 📝 Common Tasks

### Development
```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm type-check       # Check TypeScript types
pnpm lint             # Lint code
pnpm format           # Format code
```

### Database
```bash
pnpm --filter database push       # Push schema changes
pnpm --filter database generate   # Generate Prisma client
pnpm --filter database migrate    # Create migration
pnpm --filter database studio     # Open Prisma Studio
```

### Testing
```bash
pnpm --filter web e2e        # Run E2E tests
pnpm --filter web e2e:ui     # Run tests in UI mode
```

## 🔐 Environment Variables

Key environment variables (see `.env.example` for complete list):

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BETTER_AUTH_SECRET="..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# Mail Provider
MAIL_PROVIDER="plunk"
PLUNK_API_KEY="..."

# Payment Provider
PAYMENT_PROVIDER="stripe"
STRIPE_SECRET_KEY="..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="..."
```

## 🚀 Deployment

### Recommended: Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy!

### Other Platforms

- **Netlify**: Deploy via Git integration
- **Railway**: One-click deployment
- **Self-hosted**: Use Docker

See [deployment guide](SETUP_GUIDE.md#deployment) for details.

## 🧪 Testing

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# E2E tests (Playwright)
pnpm --filter web e2e

# E2E tests with UI
pnpm --filter web e2e:ui
```

## 📚 Learn More

### Documentation
- [supastarter Docs](https://supastarter.dev/docs/nextjs)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Better Auth Docs](https://better-auth.com)

### Community
- [supastarter Discord](https://discord.gg/supastarter)
- [Next.js Discord](https://nextjs.org/discord)

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Verify connection string
echo $DATABASE_URL

# Test connection
pnpm --filter database studio
```

### Module Not Found
```bash
# Clean and reinstall
pnpm clean
rm -rf node_modules
pnpm install
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

See [SETUP_GUIDE.md](SETUP_GUIDE.md#troubleshooting) for more solutions.

## 🤝 Contributing

1. Follow existing code style (Biome)
2. Write TypeScript (no JavaScript)
3. Use functional components
4. Add types for all functions
5. Test thoroughly

## 📄 License

This project is built on supastarter. See supastarter license for details.

## 🎉 Getting Started

Ready to begin? Follow these steps:

1. ✅ Read [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. ✅ Use [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
3. ✅ Review [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
4. ✅ Start building!

---

**Built with ❤️ using [supastarter](https://supastarter.dev)**
