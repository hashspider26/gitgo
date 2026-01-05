# Quick Start: Deploy to Vercel

## ✅ Is Vercel + Turso + Cloudinary a Good Choice?

**YES! This is an EXCELLENT stack for your Next.js project:**

- ✅ **Vercel**: Made by Next.js creators, zero-config deployment
- ✅ **Turso**: Serverless SQL, fast, scalable, free tier
- ✅ **Cloudinary**: Professional image CDN, auto-optimization, free tier
- ✅ **All work seamlessly together**

## Quick Setup (5 minutes)

### 1. Get Your Cloudinary URL

You already have: `cloudinary://<your_api_key>:<your_api_secret>@dgoi2pvuw`

### 2. Setup Turso Database

```bash
# Install Turso CLI (if not installed)
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create database
turso db create greenvalleyseeds

# Get connection details
turso db show greenvalleyseeds --url
turso db tokens create greenvalleyseeds
```

### 3. Deploy to Vercel

**Option A: Via GitHub (Recommended)**

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your repository
5. Add these environment variables:

```
DATABASE_URL=libsql://your-db-url.turso.io
TURSO_AUTH_TOKEN=your-token-here
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@dgoi2pvuw
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-random-string
```

6. Click "Deploy" ✅

**Option B: Via CLI**

```bash
npm i -g vercel
vercel login
vercel
# Follow prompts, then add env vars in dashboard
```

### 4. Run Database Migration

After deployment, run:

```bash
# Set env vars locally
export DATABASE_URL="libsql://your-db-url.turso.io"
export TURSO_AUTH_TOKEN="your-token"

# Push schema
npx prisma db push
```

Or use Vercel's terminal/SSH to run migrations.

## Environment Variables Summary

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-auth-token
CLOUDINARY_URL=cloudinary://api_key:api_secret@dgoi2pvuw
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-random-secret
NODE_ENV=production
```

## What Changed?

✅ **Database**: SQLite → Turso (libSQL)  
✅ **Images**: Local storage → Cloudinary CDN  
✅ **Hosting**: cPanel → Vercel  
✅ **All APIs updated** to work with new stack

## Need Help?

See `DEPLOYMENT_VERCEL.md` for detailed instructions.

