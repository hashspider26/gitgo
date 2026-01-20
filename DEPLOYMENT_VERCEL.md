# Deploying to Vercel with Turso & Cloudinary

## Why This Stack?

✅ **Vercel + Turso + Cloudinary** is an **EXCELLENT** choice for this Next.js project:

- **Vercel**: Made by Next.js creators, perfect integration, zero-config deployment
- **Turso**: Serverless SQL database, fast, scalable, free tier available
- **Cloudinary**: Professional image CDN, automatic optimization, free tier available
- **All work seamlessly together** with serverless functions

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free)
2. **Turso Account**: Sign up at [turso.tech](https://turso.tech) (free tier available)
3. **Cloudinary Account**: Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)

## Step 1: Setup Turso Database

1. **Create a Turso account** at [turso.tech](https://turso.tech)
2. **Install Turso CLI**:
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   ```
   Or download from: https://docs.turso.tech/cli/installation

3. **Login to Turso**:
   ```bash
   turso auth login
   ```

4. **Create a database**:
   ```bash
   turso db create greenvalleyseeds
   ```

5. **Get database URL and auth token**:
   ```bash
   # Get database URL
   turso db show greenvalleyseeds --url
   
   # Create auth token
   turso db tokens create greenvalleyseeds
   ```

6. **Run migrations**:
   ```bash
   # Set DATABASE_URL temporarily
   export DATABASE_URL="libsql://your-db-url.turso.io"
   export TURSO_AUTH_TOKEN="your-auth-token"
   
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   ```

## Step 2: Setup Cloudinary

1. **Create a Cloudinary account** at [cloudinary.com](https://cloudinary.com)
2. **Go to Dashboard** → Settings
3. **Copy your credentials**:
   - Cloud Name
   - API Key
   - API Secret
   - Or use the full `CLOUDINARY_URL` format

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and click "Add New Project"

3. **Import your GitHub repository**

4. **Configure Environment Variables** in Vercel:
   
   Go to Project Settings → Environment Variables and add:

   ```
   DATABASE_URL=libsql://your-db-url.turso.io
   TURSO_AUTH_TOKEN=your-turso-auth-token
   
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   # OR use the full URL format:
   CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
   
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-random-secret-here
   NODE_ENV=production
   ```

5. **Deploy**: Click "Deploy"

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set environment variables**:
   ```bash
   vercel env add DATABASE_URL
   vercel env add TURSO_AUTH_TOKEN
   vercel env add CLOUDINARY_CLOUD_NAME
   vercel env add CLOUDINARY_API_KEY
   vercel env add CLOUDINARY_API_SECRET
   vercel env add NEXTAUTH_URL
   vercel env add NEXTAUTH_SECRET
   ```

5. **Redeploy**:
   ```bash
   vercel --prod
   ```

## Step 4: Verify Prisma Configuration

The Prisma schema and client are already configured for Turso (libSQL). 

**Note**: Prisma handles the Turso connection automatically when using the `libsql` provider. No additional setup needed!

The `lib/prisma.ts` file is already configured to use `DATABASE_URL` from environment variables.

## Step 5: Verify Deployment

1. **Check Vercel Dashboard** for build logs
2. **Visit your deployed site**: `https://your-project.vercel.app`
3. **Test image uploads** - should upload to Cloudinary
4. **Test database operations** - should use Turso

## Troubleshooting

### Build Errors

- **Prisma generate fails**: Make sure `DATABASE_URL` and `TURSO_AUTH_TOKEN` are set
- **Cloudinary errors**: Verify all Cloudinary env vars are set correctly
- **Type errors**: Run `npm run build` locally first to catch issues

### Database Connection Issues

- Verify `DATABASE_URL` format: `libsql://your-db.turso.io`
- Check `TURSO_AUTH_TOKEN` is set correctly
- Ensure database exists: `turso db list`

### Image Upload Issues

- Verify Cloudinary credentials
- Check Cloudinary dashboard for upload logs
- Ensure `CLOUDINARY_URL` or individual credentials are set

## Environment Variables Summary

```env
# Database (Turso)
DATABASE_URL=libsql://your-db-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
# OR
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=generate-random-string-here

# Node
NODE_ENV=production
```

## Next Steps

1. **Custom Domain**: Add your domain in Vercel settings
2. **Database Backup**: Set up regular backups in Turso
3. **Monitoring**: Enable Vercel Analytics
4. **Image Optimization**: Cloudinary handles this automatically!

## Cost Estimate (Free Tier)

- **Vercel**: Free for hobby projects
- **Turso**: Free tier includes 500 databases, 1GB storage
- **Cloudinary**: Free tier includes 25GB storage, 25GB bandwidth/month

**Total: $0/month** for small to medium projects! 🎉

