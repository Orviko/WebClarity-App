# 🚀 WebClarity Quick Start Card

**Get up and running in ~20 minutes**

---

## ⚡ Super Quick Start (TL;DR)

```bash
# 1. Navigate & Install
cd web-app
pnpm install

# 2. Create Supabase project at supabase.com

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with Supabase credentials

# 4. Initialize database
pnpm --filter database push
pnpm --filter database generate

# 5. Start server
pnpm dev

# 6. Create admin user
pnpm --filter scripts create:user

# 7. Open http://localhost:3000
```

---

## 📖 Detailed Instructions

### Before You Start

**What you'll need:**
- ✅ Node.js 20+
- ✅ pnpm installed
- ✅ 20 minutes
- ✅ Supabase account (free)
- ✅ Email provider account (Plunk recommended - free)
- ✅ Stripe account (free test mode)

**Read These First:**
1. 📋 `SETUP_CHECKLIST.md` - Track your progress
2. 📘 `SETUP_GUIDE.md` - Complete instructions
3. 📊 `PROJECT_OVERVIEW.md` - Understand the architecture

---

## 🗄️ Supabase Setup (5 mins)

### 1. Create Project
```
→ Go to supabase.com
→ Click "New Project"
→ Name: WebClarity
→ Database Password: [Generate & Save]
→ Region: [Choose closest]
→ Wait ~2 minutes
```

### 2. Get Connection Strings
```
→ Settings → Database
→ Copy "Connection pooling" URL
→ Copy "Direct connection" URL
```

### 3. Get API Keys
```
→ Settings → API
→ Copy Project URL
→ Copy anon public key
→ Copy service_role key (keep secret!)
```

### 4. Create Storage Buckets
```
→ Storage → New bucket
→ Name: avatars (public ✓)
→ Storage → New bucket
→ Name: logos (public ✓)
```

---

## 🔐 Environment Setup (3 mins)

### 1. Create `.env.local`
```bash
cp .env.example .env.local
```

### 2. Fill Required Variables

**Minimum to start:**
```env
# Database (from Supabase)
DATABASE_URL="postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BETTER_AUTH_URL="http://localhost:3000"

# Generate this
BETTER_AUTH_SECRET="[run: openssl rand -base64 32]"

# Supabase (from Supabase)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhb..."
SUPABASE_SERVICE_ROLE_KEY="eyJhb..."

# Storage
NEXT_PUBLIC_AVATARS_BUCKET_NAME="avatars"
NEXT_PUBLIC_LOGOS_BUCKET_NAME="logos"

# Mail (get from useplunk.com)
MAIL_PROVIDER="plunk"
PLUNK_API_KEY="your-key"

# Payments (get from stripe.com)
PAYMENT_PROVIDER="stripe"
STRIPE_SECRET_KEY="sk_test_xxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
```

### 3. Generate Auth Secret
```bash
openssl rand -base64 32
```
Copy output to `BETTER_AUTH_SECRET`

---

## 📧 Email Provider Setup (2 mins)

**Recommended: Plunk (Free tier)**

```
→ Go to useplunk.com
→ Sign up
→ Dashboard → API Keys
→ Copy API key
→ Add to .env.local as PLUNK_API_KEY
```

**Alternatives:**
- Resend (resend.com)
- Postmark (postmarkapp.com)
- Your own SMTP

---

## 💳 Stripe Setup (5 mins)

### 1. Get API Keys
```
→ Go to stripe.com
→ Sign up/login
→ Dashboard → Developers → API keys
→ Copy "Secret key" (starts with sk_test_)
→ Copy "Publishable key" (starts with pk_test_)
```

### 2. Create Products
```
→ Products → Add product
→ Create:
   1. "Pro Monthly" - $29/month recurring
   2. "Pro Yearly" - $290/year recurring  
   3. "Lifetime" - $799 one-time

→ Copy each Price ID (starts with price_xxx)
→ Add to .env.local
```

---

## 🗃️ Database Setup (2 mins)

```bash
# Push schema to database
pnpm --filter database push

# Generate Prisma client
pnpm --filter database generate
```

**Verify:**
- Check Supabase dashboard → Table Editor
- Should see: user, session, organization, etc.

---

## 🏃 Run the App (1 min)

```bash
# Start development server
pnpm dev
```

**Expected output:**
```
@repo/web:dev: ready started server on [::]:3000
```

**Open:** http://localhost:3000

---

## 👤 Create Admin User (1 min)

### Option 1: CLI (Easiest)
```bash
pnpm --filter scripts create:user
```

Follow prompts:
- Email: your@email.com
- Name: Your Name
- Role: **Admin** ← Important!
- Save the password shown

### Option 2: Supabase Dashboard
```
→ Table Editor → user table
→ Insert row
→ Fill: email, name, role=admin, emailVerified=true
→ Save
```

---

## ✅ Verify It Works

### 1. Login
```
→ Go to http://localhost:3000/auth/login
→ Enter credentials
→ Should redirect to /app
```

### 2. Check Admin Panel
```
→ Go to http://localhost:3000/app/admin
→ Should see admin dashboard
→ Try viewing users/organizations
```

### 3. Test Storage
```
→ Go to /app/settings
→ Try uploading avatar
→ Should upload successfully
```

### 4. Check Console
```
→ Open browser DevTools
→ Should see no errors
→ Check terminal - should be clean
```

---

## 🎨 Customize (Optional)

### Update Branding
✅ Already done in `config/index.ts`

### Update Logos
```
apps/web/public/images/
├── supastarter-logo-light.svg → Replace with your logo
├── supastarter-logo-dark.svg → Replace with your logo
└── favicon.ico → Replace with your favicon
```

### Update Content
```
apps/web/content/
├── docs/ → Your documentation
├── posts/ → Your blog posts
└── legal/ → Privacy policy, terms
```

---

## 🐛 Quick Troubleshooting

### Can't connect to database
```bash
# Test connection
psql $DATABASE_URL

# Or check in Supabase dashboard
```

### Module not found
```bash
pnpm clean
rm -rf node_modules
pnpm install
```

### Port 3000 in use
```bash
lsof -ti:3000 | xargs kill -9
```

### Prisma client not generated
```bash
pnpm --filter database generate
```

---

## 📚 Next Steps

### Now that it's running:

1. **Read Documentation**
   - `PROJECT_OVERVIEW.md` - Architecture
   - `SETUP_GUIDE.md` - Advanced setup

2. **Configure Optional Features**
   - Google/GitHub OAuth
   - Analytics
   - Monitoring

3. **Start Building**
   - Add custom features in `apps/web/modules/`
   - Create API endpoints in `packages/api/modules/`
   - Build your SaaS product!

### Before Production:

1. Set up separate production database
2. Configure production env vars
3. Set up Stripe webhooks
4. Deploy to Vercel/other platform
5. Configure custom domain
6. Set up monitoring

---

## 🆘 Need Help?

**Resources:**
- 📖 `SETUP_GUIDE.md` - Comprehensive guide
- 📋 `SETUP_CHECKLIST.md` - Track progress
- 🏗️ `PROJECT_OVERVIEW.md` - Architecture
- 🌐 [supastarter docs](https://supastarter.dev/docs/nextjs)
- 💬 [Discord](https://discord.gg/supastarter)

**Common Issues:**
- Database connection: Check credentials in `.env.local`
- Storage not working: Verify buckets exist and are public
- Email not sending: Check provider API key
- Build errors: Run `pnpm clean` then `pnpm install`

---

## ✨ You're All Set!

Your WebClarity SaaS is ready for development!

**What you have:**
- ✅ Next.js 16 application running
- ✅ Database connected (Supabase)
- ✅ Storage configured (Supabase)
- ✅ Authentication working (Better Auth)
- ✅ Email system ready
- ✅ Payment system configured (Stripe)
- ✅ Admin access
- ✅ Production-ready architecture

**Start building your features! 🚀**

---

_Last updated: December 2025_
_For detailed documentation, see SETUP_GUIDE.md_

