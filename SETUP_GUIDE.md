# WebClarity SaaS - Complete Setup Guide

> **Welcome to WebClarity!** This guide will walk you through setting up your production-ready SaaS application built with supastarter for Next.js.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Initial Setup](#initial-setup)
4. [Supabase Configuration](#supabase-configuration)
5. [Environment Variables](#environment-variables)
6. [Database Setup](#database-setup)
7. [Provider Configuration](#provider-configuration)
8. [Running the Application](#running-the-application)
9. [Creating Admin User](#creating-admin-user)
10. [Next Steps](#next-steps)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js** (v20 or higher)
-   **pnpm** (v10.14.0 or higher) - `npm install -g pnpm`
-   **Git** (for version control)
-   **VSCode** (recommended) or any code editor
-   **PostgreSQL database** (we'll use Supabase)

---

## 📦 Project Overview

WebClarity is built on **supastarter for Next.js**, a production-ready SaaS starter kit. Here's the architecture:

### Project Structure

```
web-app/
├── apps/
│   └── web/                  # Main Next.js application
│       ├── app/              # Next.js App Router
│       ├── modules/          # Feature modules (auth, payments, etc.)
│       └── content/          # Content (docs, blog posts)
├── packages/                 # Shared packages (monorepo)
│   ├── api/                  # API routes and procedures
│   ├── auth/                 # Authentication (Better Auth)
│   ├── database/             # Database layer (Prisma)
│   ├── storage/              # File storage (Supabase/S3)
│   ├── mail/                 # Email templates and providers
│   ├── payments/             # Payment processing (Stripe)
│   ├── i18n/                 # Internationalization
│   └── utils/                # Utility functions
├── config/                   # Application configuration
└── tooling/                  # Build tooling (Tailwind, TypeScript)
```

### Tech Stack

-   **Framework**: Next.js 16 (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS v4 + Shadcn UI
-   **Database**: PostgreSQL (via Supabase)
-   **ORM**: Prisma
-   **Authentication**: Better Auth v1.4
-   **Storage**: Supabase Storage (S3-compatible)
-   **Payments**: Stripe
-   **Email**: Multiple providers supported (Plunk, Resend, etc.)
-   **Monorepo**: Turborepo + pnpm workspaces

---

## 🚀 Initial Setup

### Step 1: Install Dependencies

The project uses pnpm for package management:

```bash
# Navigate to the web-app directory
cd /path/to/WebClarity/web-app

# Install all dependencies
pnpm install
```

This will install dependencies for all packages in the monorepo.

### Step 2: Verify Installation

Check that all packages are installed correctly:

```bash
# Check pnpm version
pnpm --version  # Should be 10.14.0 or higher

# Check Node version
node --version  # Should be v20 or higher

# List workspace packages
pnpm list --depth 0
```

---

## 🗄️ Supabase Configuration

We'll use Supabase for database, auth, and storage. Follow the [Supabase setup guide](https://supastarter.dev/docs/nextjs/supabase-setup) for detailed instructions.

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in project details:
    - **Name**: WebClarity
    - **Database Password**: Generate a strong password (save it!)
    - **Region**: Choose closest to your users
4. Wait for project to be provisioned (~2 minutes)

### Step 2: Get Database Credentials

Once your project is ready:

1. Go to **Project Settings** → **Database**
2. Find **Connection string** section
3. Copy the **Connection pooling** string (starts with `postgresql://`)
4. Copy the **Direct connection** string (for migrations)

Example format:

```
# Connection pooling (for app)
postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres

# Direct connection (for migrations)
postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
```

### Step 3: Get Supabase API Keys

1. Go to **Project Settings** → **API**
2. Copy:
    - **Project URL**: `https://xxx.supabase.co`
    - **anon public** key
    - **service_role** key (keep this secret!)

### Step 4: Create Storage Buckets

1. Go to **Storage** in the Supabase dashboard
2. Create buckets:
    - Name: `avatars` - Public bucket for user avatars
    - Name: `logos` - Public bucket for organization logos

For each bucket:

-   Click **"New bucket"**
-   Enter name
-   Set as **Public bucket** ✓
-   Click **"Create bucket"**

#### Set Bucket Policies

For public access, add these policies:

**For the `avatars` bucket:**

1. Go to bucket → **Policies** tab
2. Add policy:
    - Name: "Public Access"
    - Allowed operations: SELECT
    - Target roles: `public`
    - Policy definition: `true`

Repeat for the `logos` bucket.

---

## 🔐 Environment Variables

### Step 1: Create .env.local File

Copy the example environment file:

```bash
cp .env.example .env.local
```

### Step 2: Fill in Required Variables

Open `.env.local` and update with your Supabase credentials:

```env
# Database
DATABASE_URL="postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:3000"

# Supabase Storage
STORAGE_PROVIDER="supabase"
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Storage Buckets
NEXT_PUBLIC_AVATARS_BUCKET_NAME="avatars"
NEXT_PUBLIC_LOGOS_BUCKET_NAME="logos"

# Mail Provider (we'll configure this next)
MAIL_PROVIDER="plunk"
PLUNK_API_KEY="your-plunk-api-key"

# Payment Provider (we'll configure this next)
PAYMENT_PROVIDER="stripe"
STRIPE_SECRET_KEY="sk_test_xxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
```

### Step 3: Generate Better Auth Secret

```bash
openssl rand -base64 32
```

Copy the output and paste it as `BETTER_AUTH_SECRET` in your `.env.local` file.

---

## 🗃️ Database Setup

### Step 1: Configure Supabase Storage Provider

First, we need to add Supabase storage support. Create the Supabase storage provider:

**File**: `packages/storage/provider/supabase/index.ts`

```typescript
import { createClient } from "@supabase/supabase-js";
import type { StorageProvider } from "../../types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
	throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const storageProvider: StorageProvider = {
	async createUploadUrl(bucket: string, path: string) {
		const { data, error } = await supabase.storage
			.from(bucket)
			.createSignedUploadUrl(path);

		if (error) throw error;

		return {
			url: data.signedUrl,
			path: data.path,
		};
	},

	async getPublicUrl(bucket: string, path: string) {
		const { data } = supabase.storage.from(bucket).getPublicUrl(path);
		return data.publicUrl;
	},

	async deleteFile(bucket: string, path: string) {
		const { error } = await supabase.storage.from(bucket).remove([path]);
		if (error) throw error;
	},
};
```

Update the provider export:

**File**: `packages/storage/provider/index.ts`

```typescript
// Change from:
export * from "./s3";

// To:
export * from "./supabase";
```

### Step 2: Push Database Schema

Push the Prisma schema to your Supabase database:

```bash
pnpm --filter database push
```

This will:

-   Create all tables defined in `packages/database/prisma/schema.prisma`
-   Set up relationships and indexes
-   Create the Better Auth tables

### Step 3: Generate Prisma Client

Generate the Prisma client types:

```bash
pnpm --filter database generate
```

This creates TypeScript types for your database models.

---

## ⚙️ Provider Configuration

### Mail Provider Setup

We recommend starting with **Plunk** (free tier available):

1. Sign up at [useplunk.com](https://useplunk.com)
2. Get your API key from the dashboard
3. Add to `.env.local`:

```env
MAIL_PROVIDER="plunk"
PLUNK_API_KEY="your-plunk-api-key"
```

**Alternative providers:**

-   **Resend**: `RESEND_API_KEY`
-   **Postmark**: `POSTMARK_SERVER_TOKEN`
-   **Nodemailer**: `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`

To switch providers, update `packages/mail/src/provider/index.ts`:

```typescript
// Change the export
export * from "./plunk"; // or "./resend", "./postmark", etc.
```

### Payment Provider Setup (Stripe)

1. Create a [Stripe account](https://stripe.com)
2. Get your test API keys from the dashboard
3. Create products and prices in Stripe:

    - **Pro Monthly**: Recurring subscription
    - **Pro Yearly**: Recurring subscription
    - **Lifetime**: One-time payment

4. Add to `.env.local`:

```env
PAYMENT_PROVIDER="stripe"
STRIPE_SECRET_KEY="sk_test_xxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"  # After setting up webhooks

# Product/Price IDs
NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY="price_xxx"
NEXT_PUBLIC_PRICE_ID_PRO_YEARLY="price_xxx"
NEXT_PUBLIC_PRICE_ID_LIFETIME="price_xxx"
```

### Social Authentication (Optional)

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Add to `.env.local`:

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

#### GitHub OAuth

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Add to `.env.local`:

```env
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

---

## 🏃 Running the Application

### Start Development Server

```bash
# From web-app directory
pnpm dev
```

This will:

-   Start the Next.js dev server on `http://localhost:3000`
-   Enable hot module replacement
-   Run all workspace packages in watch mode

**Expected output:**

```
turbo dev
• Packages in scope: @repo/api, @repo/auth, @repo/database, @repo/web, ...
• Running dev in 8 packages
• Remote caching disabled

@repo/web:dev: ready started server on [::]:3000, url: http://localhost:3000
```

### Open the Application

Navigate to `http://localhost:3000` in your browser.

---

## 👤 Creating Admin User

To access admin features, create an admin user:

### Option 1: Using CLI Script

```bash
pnpm --filter scripts create:user
```

Follow the prompts:

-   Enter email
-   Enter name
-   Select role: **Admin**
-   Note the generated password

### Option 2: Using Supabase Dashboard

1. Go to Supabase → **Table Editor** → `user` table
2. Insert a new row:
    - `email`: your email
    - `name`: your name
    - `role`: `admin`
    - `emailVerified`: `true`
    - `createdAt`: current timestamp
    - `updatedAt`: current timestamp
3. Go to `account` table and create a password entry (hash with bcrypt)

### Option 3: Sign Up Through UI (if signup is enabled)

1. Go to `http://localhost:3000/auth/signup`
2. Create an account
3. Verify your email (check console logs in dev)
4. Update role to `admin` in Supabase dashboard

### Login

Go to `http://localhost:3000/auth/login` and sign in with your admin credentials.

---

## 🎨 Customizing Your Application

### Update Branding

Edit `config/index.ts`:

```typescript
export const config = {
	appName: "WebClarity",

	// Update other settings as needed
	organizations: {
		enable: true,
		enableBilling: true, // Enable org billing
	},

	users: {
		enableBilling: false, // Disable user billing
		enableOnboarding: true,
	},

	// ... rest of config
} as const satisfies Config;
```

### Update Logo and Assets

Replace files in `apps/web/public/images/`:

-   `supastarter-logo-light.svg` → your light mode logo
-   `supastarter-logo-dark.svg` → your dark mode logo
-   `hero-image.png` → your hero image

### Update Email Templates

Email templates are in `packages/mail/emails/`:

-   `MagicLink.tsx` - Magic link emails
-   `EmailVerification.tsx` - Email verification
-   `ForgotPassword.tsx` - Password reset
-   `OrganizationInvitation.tsx` - Team invitations

### Update Content

-   **Marketing pages**: `apps/web/app/(marketing)/[locale]`
-   **Documentation**: `apps/web/content/docs/`
-   **Blog posts**: `apps/web/content/posts/`
-   **Legal pages**: `apps/web/content/legal/`

---

## ✅ Next Steps

### 1. Set Up Analytics (Optional)

Uncomment and configure in `.env.local`:

```env
NEXT_PUBLIC_ANALYTICS_PROVIDER="google"
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

Update `apps/web/modules/analytics/index.tsx` to export your chosen provider.

### 2. Configure Webhooks

#### Stripe Webhooks (Production)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
    - `checkout.session.completed`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
4. Copy webhook secret to `.env.local`

#### Development Webhooks

Use Stripe CLI for local testing:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 3. Set Up CI/CD

The project includes GitHub Actions workflows in `.github/workflows/`:

-   `validate-prs.yml` - Validates PRs (type checking, linting)

Configure deployment to Vercel or your preferred platform.

### 4. Add Custom Features

Start building WebClarity-specific features:

-   Website analysis tools
-   SEO insights
-   Performance monitoring
-   Accessibility checking

Place your custom modules in `apps/web/modules/`.

### 5. Testing

Run E2E tests:

```bash
pnpm --filter web e2e
```

### 6. Build for Production

```bash
pnpm build
```

---

## 🐛 Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`

**Solution**:

-   Verify `DATABASE_URL` is correct
-   Check Supabase project is active
-   Ensure password is URL-encoded (e.g., `%` → `%25`)

### Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:

```bash
pnpm --filter database generate
```

### Storage Upload Fails

**Error**: `Storage provider not configured`

**Solution**:

-   Verify Supabase credentials in `.env.local`
-   Check buckets exist and are public
-   Ensure `STORAGE_PROVIDER="supabase"` is set

### Email Not Sending

**Error**: `Mail provider error`

**Solution**:

-   Verify mail provider API key
-   Check provider export in `packages/mail/src/provider/index.ts`
-   In development, check console logs for email preview URLs

### Module Not Found Errors

**Error**: `Cannot find module '@repo/...'`

**Solution**:

```bash
# Clean and reinstall
pnpm clean
rm -rf node_modules
pnpm install
```

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm dev
```

---

## 📚 Additional Resources

-   [supastarter Documentation](https://supastarter.dev/docs/nextjs)
-   [Next.js Documentation](https://nextjs.org/docs)
-   [Prisma Documentation](https://www.prisma.io/docs)
-   [Better Auth Documentation](https://better-auth.com)
-   [Supabase Documentation](https://supabase.com/docs)
-   [Stripe Documentation](https://stripe.com/docs)

---

## 🤝 Getting Help

If you encounter issues:

1. Check this guide and the [supastarter docs](https://supastarter.dev/docs)
2. Search existing issues in the repository
3. Join the [supastarter Discord](https://discord.gg/supastarter)
4. Create a detailed issue with error logs

---

## 🎉 You're Ready!

Your WebClarity SaaS application is now set up and ready for development. Start building amazing features!

**Quick Start Checklist:**

-   ✅ Dependencies installed
-   ✅ Supabase project created
-   ✅ `.env.local` configured
-   ✅ Database schema pushed
-   ✅ Storage buckets created
-   ✅ Mail provider configured
-   ✅ Payment provider configured
-   ✅ Admin user created
-   ✅ Development server running

Happy coding! 🚀
