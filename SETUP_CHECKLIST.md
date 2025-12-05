# WebClarity - Initial Setup Checklist

Use this checklist to track your initial setup progress. Mark items as complete as you go!

## 🎯 Prerequisites

- [ ] Node.js v20+ installed (`node --version`)
- [ ] pnpm v10.14.0+ installed (`pnpm --version`)
- [ ] Git installed
- [ ] Code editor (VSCode recommended)

## 📦 Project Setup

- [ ] Clone/download the WebClarity repository
- [ ] Navigate to `web-app` directory
- [ ] Run `pnpm install` to install dependencies
- [ ] Verify installation with `pnpm list --depth 0`

## 🗄️ Supabase Setup

### Create Project
- [ ] Sign up/login to Supabase (supabase.com)
- [ ] Create new project named "WebClarity"
- [ ] Set database password (save it securely!)
- [ ] Select region closest to your users
- [ ] Wait for project provisioning (~2 mins)

### Get Credentials
- [ ] Copy **Connection pooling** URL from Database settings
- [ ] Copy **Direct connection** URL from Database settings
- [ ] Copy **Project URL** from API settings
- [ ] Copy **anon public** key from API settings
- [ ] Copy **service_role** key from API settings (keep secret!)

### Create Storage Buckets
- [ ] Create `avatars` bucket (public)
- [ ] Create `logos` bucket (public)
- [ ] Set bucket policies for public access

## 🔐 Environment Configuration

- [ ] Copy `.env.example` to `.env.local`
- [ ] Set `DATABASE_URL` (connection pooling)
- [ ] Set `DIRECT_URL` (direct connection)
- [ ] Set `NEXT_PUBLIC_APP_URL` to `http://localhost:3000`
- [ ] Generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32`
- [ ] Set `BETTER_AUTH_URL` to `http://localhost:3000`
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Set bucket names: `avatars`, `logos`

## 📧 Mail Provider Setup

Choose ONE provider:

### Option A: Plunk (Recommended for starters)
- [ ] Sign up at useplunk.com
- [ ] Get API key from dashboard
- [ ] Set `PLUNK_API_KEY` in `.env.local`
- [ ] Set `MAIL_PROVIDER="plunk"`

### Option B: Resend
- [ ] Sign up at resend.com
- [ ] Get API key
- [ ] Set `RESEND_API_KEY`
- [ ] Update provider export in `packages/mail/src/provider/index.ts`

### Option C: Other (Postmark, Nodemailer)
- [ ] Get credentials
- [ ] Set appropriate env vars
- [ ] Update provider export

## 💳 Payment Provider Setup (Stripe)

- [ ] Create Stripe account (stripe.com)
- [ ] Get test API keys from dashboard
- [ ] Set `STRIPE_SECRET_KEY` (sk_test_...)
- [ ] Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_test_...)

### Create Products
- [ ] Create "Pro Monthly" subscription product
- [ ] Create "Pro Yearly" subscription product
- [ ] Create "Lifetime" one-time product
- [ ] Copy price IDs to `.env.local`:
  - [ ] `NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY`
  - [ ] `NEXT_PUBLIC_PRICE_ID_PRO_YEARLY`
  - [ ] `NEXT_PUBLIC_PRICE_ID_LIFETIME`

## 🔑 Social Authentication (Optional)

### Google OAuth
- [ ] Create project in Google Cloud Console
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials
- [ ] Set redirect URI: `http://localhost:3000/api/auth/callback/google`
- [ ] Set `GOOGLE_CLIENT_ID`
- [ ] Set `GOOGLE_CLIENT_SECRET`

### GitHub OAuth
- [ ] Go to GitHub Developer Settings
- [ ] Create new OAuth App
- [ ] Set callback URL: `http://localhost:3000/api/auth/callback/github`
- [ ] Set `GITHUB_CLIENT_ID`
- [ ] Set `GITHUB_CLIENT_SECRET`

## 🗃️ Database Setup

- [ ] Verify Supabase storage provider configured
- [ ] Run `pnpm --filter database push` to create tables
- [ ] Run `pnpm --filter database generate` to generate Prisma client
- [ ] Verify tables created in Supabase dashboard

## 🚀 First Run

- [ ] Run `pnpm dev` from web-app directory
- [ ] Wait for build to complete
- [ ] Open `http://localhost:3000` in browser
- [ ] Verify homepage loads without errors
- [ ] Check browser console for errors

## 👤 Create Admin User

Choose ONE method:

### Option A: CLI Script (Easiest)
- [ ] Run `pnpm --filter scripts create:user`
- [ ] Enter email
- [ ] Enter name
- [ ] Select role: Admin
- [ ] Save the generated password

### Option B: Supabase Dashboard
- [ ] Insert row in `user` table
- [ ] Set email, name, role=admin, emailVerified=true
- [ ] Create password entry in `account` table

### Option C: Sign Up (if enabled)
- [ ] Go to `/auth/signup`
- [ ] Create account
- [ ] Verify email
- [ ] Update role to `admin` in database

## ✅ Verify Setup

- [ ] Login at `http://localhost:3000/auth/login`
- [ ] Access admin panel at `/app/admin`
- [ ] Upload test avatar (tests storage)
- [ ] Send test email (check console logs)
- [ ] Navigate through all pages
- [ ] Check for console errors

## 🎨 Branding & Content

- [ ] Update `config/index.ts` (already set to "WebClarity")
- [ ] Replace logo images in `apps/web/public/images/`
- [ ] Update email templates in `packages/mail/emails/`
- [ ] Update marketing content in `apps/web/content/`
- [ ] Customize homepage in `apps/web/app/(marketing)/`

## 📊 Analytics Setup (Optional)

- [ ] Choose analytics provider (Google, Plausible, PostHog, etc.)
- [ ] Get tracking ID/key
- [ ] Set environment variables
- [ ] Update `apps/web/modules/analytics/index.tsx`
- [ ] Test tracking in development

## 🔧 Additional Configuration (Optional)

- [ ] Set up Sentry for error tracking
- [ ] Configure rate limiting
- [ ] Set up monitoring
- [ ] Configure CDN
- [ ] Set up custom domain

## 🚢 Deployment Preparation

- [ ] Test build with `pnpm build`
- [ ] Fix any build errors
- [ ] Set up production database (separate from dev)
- [ ] Configure production environment variables
- [ ] Set up Stripe webhooks
- [ ] Configure CI/CD (GitHub Actions)
- [ ] Choose hosting provider (Vercel recommended)

## 📚 Documentation Review

- [ ] Read `SETUP_GUIDE.md` thoroughly
- [ ] Review [supastarter docs](https://supastarter.dev/docs/nextjs)
- [ ] Bookmark important documentation links
- [ ] Join supastarter Discord for support

## 🎉 Ready to Build!

Once all critical items are checked:
- [ ] All core features working
- [ ] No console errors
- [ ] Admin access verified
- [ ] Storage uploads working
- [ ] Emails sending (or logging in dev)
- [ ] Ready to start building WebClarity features!

---

## 🐛 Having Issues?

1. Check `SETUP_GUIDE.md` troubleshooting section
2. Verify all environment variables are set correctly
3. Check Supabase project is active
4. Review console logs for specific errors
5. Join [supastarter Discord](https://discord.gg/supastarter)

---

## 📝 Notes

Use this space to track any custom configurations or issues:

```
[Add your notes here]
```

---

**Last Updated**: [Add date when you complete setup]
**Project Status**: [Initial Setup / In Development / Production]

