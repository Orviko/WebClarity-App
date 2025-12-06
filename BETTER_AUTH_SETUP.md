# Better Auth Setup - WebClarity Configuration

## ✅ Current Authentication Setup

Your Better Auth is now configured with:

### Enabled Features:

-   ✅ **Email/Password Authentication** - Users can sign up and login with email
-   ✅ **Google OAuth** - Social login with Google
-   ✅ **Two-Factor Authentication (2FA)** - TOTP-based 2FA for enhanced security
-   ✅ **Email Verification** - Verify email addresses on signup
-   ✅ **Password Reset** - Forgot password functionality
-   ✅ **Organizations** - Team management and invitations
-   ✅ **Admin Panel** - Admin user management

### Disabled Features:

-   ❌ **Magic Links** - Removed (not needed)
-   ❌ **Passkeys** - Removed (WebAuthn not needed)
-   ❌ **GitHub OAuth** - Removed (only using Google)

---

## 🔐 Google OAuth Setup

To enable Google sign-in, you need to set up OAuth credentials:

### Step 1: Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Sign in with your Google account

### Step 2: Create a Project

1. Click on the project dropdown (top left)
2. Click **"New Project"**
3. **Project name**: `WebClarity`
4. Click **"Create"**

### Step 3: Enable Google+ API

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"Google Identity"**
3. Click on it and click **"Enable"**

### Step 4: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (for public app) or **"Internal"** (if you have Google Workspace)
3. Click **"Create"**

#### Fill in the form:

**App Information:**

-   **App name**: `WebClarity`
-   **User support email**: Your email
-   **App logo**: (Optional, upload your logo)

**App domain:**

-   **Application home page**: `http://localhost:3000` (for now)
-   **Application privacy policy**: `http://localhost:3000/legal/privacy-policy`
-   **Application terms of service**: `http://localhost:3000/legal/terms`

**Developer contact information:**

-   **Email**: Your email

4. Click **"Save and Continue"**

#### Scopes:

1. Click **"Add or Remove Scopes"**
2. Select:
    - `../auth/userinfo.email`
    - `../auth/userinfo.profile`
    - `openid`
3. Click **"Update"** → **"Save and Continue"**

#### Test users (for development):

1. Click **"Add Users"**
2. Add your Gmail address for testing
3. Click **"Save and Continue"**

### Step 5: Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**

**Application type:** Web application

**Name:** `WebClarity Web App`

**Authorized JavaScript origins:**

```
http://localhost:3000
http://localhost:3001
http://127.0.0.1:3000
```

**Authorized redirect URIs:**

```
http://localhost:3000/api/auth/callback/google
http://localhost:3001/api/auth/callback/google
```

4. Click **"Create"**

### Step 6: Copy Your Credentials

You'll see a modal with:

-   **Client ID**: `123456789-abcdefg.apps.googleusercontent.com`
-   **Client Secret**: `GOCSPX-xxxxxxxxxxxxx`

**⚠️ Copy both immediately!**

### Step 7: Update `.env.local`

Add these to your `.env.local` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-secret-here"
```

---

## 🔧 Production Setup

When deploying to production:

### Update Google OAuth Redirect URIs:

1. Go back to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Add production URLs:

**Authorized JavaScript origins:**

```
https://webclarity.app
https://www.webclarity.app
```

**Authorized redirect URIs:**

```
https://webclarity.app/api/auth/callback/google
https://www.webclarity.app/api/auth/callback/google
```

4. Save

### Update OAuth Consent Screen:

-   Change App domain URLs to production URLs
-   Submit app for verification (if needed for public use)

---

## 🛡️ Two-Factor Authentication (2FA)

2FA is already enabled! Users can:

1. **Enable 2FA** in Settings → Security
2. **Scan QR code** with authenticator app (Google Authenticator, Authy, 1Password, etc.)
3. **Enter code** to verify setup
4. **Get backup codes** for recovery

### How it works:

-   After enabling, users must enter a 6-digit code on login
-   Codes change every 30 seconds
-   Backup codes can be used if phone is lost

---

## 📧 Email Configuration

Your emails are already configured to send:

### Email Templates Used:

-   ✅ **Email Verification** - When user signs up
-   ✅ **Password Reset** - Forgot password flow
-   ✅ **Organization Invitation** - Team invites

### Email Provider:

Make sure you have configured your email provider in `.env.local`:

```env
MAIL_PROVIDER="plunk"
PLUNK_API_KEY="your-api-key"
```

Or use another provider (Resend, Postmark, etc.)

---

## ✅ Testing Your Setup

### 1. Test Email/Password Signup:

```
→ Go to http://localhost:3000/auth/signup
→ Enter email and password
→ Check email for verification link
→ Click link to verify
→ Login successful!
```

### 2. Test Google OAuth:

```
→ Go to http://localhost:3000/auth/login
→ Click "Continue with Google"
→ Select your Google account
→ Grant permissions
→ Redirected back to app, logged in!
```

### 3. Test 2FA:

```
→ Login to your account
→ Go to Settings → Security
→ Click "Enable Two-Factor Authentication"
→ Scan QR code with authenticator app
→ Enter code to verify
→ Logout and login again
→ You'll be prompted for 2FA code!
```

---

## 🎯 What's Configured:

| Feature            | Status      | Notes                          |
| ------------------ | ----------- | ------------------------------ |
| Email/Password     | ✅ Enabled  | Primary authentication method  |
| Google OAuth       | ✅ Enabled  | Needs credentials setup        |
| Two-Factor Auth    | ✅ Enabled  | TOTP-based, optional for users |
| Email Verification | ✅ Enabled  | Required on signup             |
| Password Reset     | ✅ Enabled  | Via email link                 |
| Organizations      | ✅ Enabled  | Team management                |
| Magic Links        | ❌ Disabled | Not needed                     |
| Passkeys           | ❌ Disabled | Not needed                     |
| GitHub OAuth       | ❌ Disabled | Only using Google              |

---

## 🐛 Troubleshooting

### Google OAuth not working:

**Error: "redirect_uri_mismatch"**

-   Check that redirect URI in Google Console exactly matches your app URL
-   Must be: `http://localhost:3000/api/auth/callback/google`

**Error: "invalid_client"**

-   Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
-   Check for extra spaces in `.env.local`

**Error: "access_denied"**

-   Make sure you added yourself as a test user in OAuth consent screen
-   Try with a different Google account

### 2FA not working:

**Can't scan QR code:**

-   Make sure authenticator app is updated
-   Try manual entry of the secret key shown

**Invalid code:**

-   Check your device time is synced correctly
-   TOTP codes are time-based

### Email verification not working:

**Not receiving emails:**

-   Check your email provider is configured
-   Look in spam folder
-   Check console logs in development

---

## 📚 Next Steps

1. ✅ Set up Google OAuth credentials
2. ✅ Test all authentication flows
3. ✅ Create admin user (if not done): `pnpm --filter scripts create:user`
4. ✅ Test 2FA with your admin account
5. ⏳ Configure production URLs before deploying

---

## 🔗 Useful Links

-   [Better Auth Documentation](https://better-auth.com)
-   [Google OAuth Setup Guide](https://developers.google.com/identity/protocols/oauth2)
-   [2FA Best Practices](https://authy.com/what-is-2fa/)

---

**Your authentication is now properly configured for production! 🎉**
