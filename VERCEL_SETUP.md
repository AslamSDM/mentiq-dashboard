# Vercel Deployment Setup Guide

## Issue: Login Works Locally But Not on Vercel

### Root Cause
The middleware is unable to decode JWT tokens because `NEXTAUTH_SECRET` is missing or misconfigured in Vercel's environment variables.

---

## Required Environment Variables

You **must** set these environment variables in Vercel:

### 1. NEXT_PUBLIC_API_BASE_URL
**This is critical!** Your API must be called over HTTPS, not HTTP.

**Value:**
```
https://app.trymentiq.com
```

**Important Notes:**
- Must use `https://` (not `http://`)
- No trailing slash
- This is a public variable (starts with `NEXT_PUBLIC_`)
- Browsers block HTTP requests from HTTPS pages (Mixed Content Error)

### 2. NEXTAUTH_SECRET
This is the most critical variable. Without it, NextAuth.js cannot encrypt/decrypt JWT tokens.

**How to generate:**
```bash
openssl rand -base64 32
```

**Important:** Use the **exact same value** as your local `.env.local` file.

### 3. NEXTAUTH_URL
The canonical URL of your site.

**Value for Production:**
```
https://your-app-name.vercel.app
```

**Value for Preview:**
```
https://your-app-name-git-branch.vercel.app
```

### 4. Other Variables
Make sure any other environment variables from your `.env.local` are also set in Vercel (API URLs, database connections, etc.)

---

## Step-by-Step: Adding Environment Variables to Vercel

1. **Go to your Vercel Dashboard**
   - Navigate to your project
   - Click on **Settings** tab

2. **Navigate to Environment Variables**
   - In the sidebar, click **Environment Variables**

3. **Add NEXT_PUBLIC_API_BASE_URL**
   - Click **Add New**
   - **Name**: `NEXT_PUBLIC_API_BASE_URL`
   - **Value**: `https://app.trymentiq.com` (must be HTTPS!)
   - **Environments**: Select **Production**, **Preview**, and **Development**
   - Click **Save**

4. **Add NEXTAUTH_SECRET**
   - Click **Add New**
   - **Name**: `NEXTAUTH_SECRET`
   - **Value**: Your generated secret (paste the output from `openssl rand -base64 32`)
   - **Environments**: Select **Production**, **Preview**, and **Development**
   - Click **Save**

5. **Add NEXTAUTH_URL**
   - Click **Add New**
   - **Name**: `NEXTAUTH_URL`
   - **Value**: `https://your-domain.vercel.app`
   - **Environments**: 
     - For **Production**: Use your production URL
     - For **Preview**: You can use a wildcard or specific preview URL
   - Click **Save**

6. **Add any other required variables**
   - Check your `.env.local` file
   - Add any API endpoints, database URLs, etc.

7. **Redeploy**
   - Go to **Deployments** tab
   - Click the three dots (**...**) on your latest deployment
   - Click **Redeploy**
   - OR push a new commit to trigger a deployment

---

## Verification

After redeploying, check the Vercel deployment logs:

1. Go to **Deployments** tab
2. Click on your latest deployment
3. Click on **Functions** tab
4. Look for the middleware logs

You should now see:
```
🔐 Middleware Debug: {
  path: '/dashboard',
  hasToken: true,
  tokenEmail: 'user@example.com',
  hasSecret: true
}
```

Instead of:
```
🔐 Middleware Debug: {
  path: '/dashboard',
  hasToken: false,
  tokenEmail: 'N/A',
  hasSecret: false
}
```

---

## Common Mistakes

❌ **Different secrets between local and Vercel**
   - Make sure the `NEXTAUTH_SECRET` is identical

❌ **Not selecting all environments**
   - Select Production, Preview, and Development when adding variables

❌ **Forgetting to redeploy**
   - Environment variable changes require a redeploy to take effect

❌ **Using HTTP instead of HTTPS in NEXTAUTH_URL**
   - Vercel uses HTTPS, make sure your `NEXTAUTH_URL` starts with `https://`

---

## Testing

1. Deploy to Vercel with the environment variables set
2. Try logging in on your Vercel deployment
3. Check the Function logs in Vercel dashboard for the middleware debug output
4. If you see `hasSecret: false`, the environment variable is not set correctly

---

## Additional Security (Optional)

For production, consider also setting:

```env
# Restrict to HTTPS only in production
NEXTAUTH_URL_INTERNAL=https://your-domain.vercel.app
```

This ensures NextAuth.js only works over HTTPS in production.
