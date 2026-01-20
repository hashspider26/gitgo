# Deploying Next.js App to cPanel

## Overview
This guide will help you deploy your Green Valley Seeds Next.js application to cPanel hosting.

## Prerequisites
- cPanel hosting account with Node.js support
- SSH access (recommended) or File Manager access
- Domain name configured
- Database access (for Prisma/SQLite)

## Method 1: Using cPanel Node.js App (Recommended)

### Step 1: Prepare Your Application

1. **Build the application locally first:**
```bash
npm run build
```

2. **Create a `.htaccess` file** in the `public` folder (if needed for static assets)

3. **Update `next.config.mjs`** to set output mode:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // or 'export' for static export
};

export default nextConfig;
```

### Step 2: Upload Files to cPanel

1. **Login to cPanel**
2. **Go to File Manager** or use FTP/SFTP
3. **Navigate to `public_html`** (or your domain's root directory)
4. **Upload all files** except:
   - `node_modules/` (will be installed on server)
   - `.git/`
   - `.next/` (will be built on server)

### Step 3: Setup Node.js App in cPanel

1. **Go to "Node.js" in cPanel** (if available)
2. **Click "Create Application"**
3. **Configure:**
   - **Node.js Version**: Select latest LTS (18.x or 20.x)
   - **Application Mode**: Production
   - **Application Root**: `/home/username/public_html` (or your domain root)
   - **Application URL**: Your domain (e.g., `greenvalleyseeds.pk`)
   - **Application Startup File**: `app.js` ⚠️ **IMPORTANT: Use `app.js`, NOT `server.js` or `next start`**

4. **Set Environment Variables:**
   - `NODE_ENV=production`
   - `DATABASE_URL=file:./prisma/dev.db` (or your database URL)
   - `NEXTAUTH_URL=https://yourdomain.com`
   - `NEXTAUTH_SECRET=your-secret-key` (generate a random string)
   - **Note**: cPanel automatically sets `PORT` - do NOT set it manually

### Step 4: Install Dependencies

1. **SSH into your server** or use Terminal in cPanel
2. **Navigate to your application directory:**
```bash
cd ~/public_html
```

3. **Install dependencies:**
```bash
npm install --production
```

4. **Generate Prisma Client:**
```bash
npx prisma generate
```

5. **Run database migrations:**
```bash
npx prisma db push
```

### Step 5: Build the Application

**⚠️ IMPORTANT: Build can hang on cPanel due to memory limits. Use optimized build commands:**

**Option 1: Standard build (if you have enough memory):**
```bash
npm run build:cpanel
```

**Option 2: Light build (if standard build hangs):**
```bash
npm run build:light
```

**Option 3: Manual build with timeout (recommended for cPanel):**
```bash
# Set memory limit
export NODE_OPTIONS="--max-old-space-size=1536"
# Build with timeout (15 minutes)
timeout 900 npm run build:cpanel || npm run build:light
```

**If build hangs:**
1. Don't refresh the page - wait at least 15-20 minutes
2. Check cPanel logs for memory errors
3. Try the light build option
4. Build locally and upload `.next` folder instead

### Step 6: Start the Application

**⚠️ CRITICAL: In cPanel Node.js App settings:**
- **Startup File**: `app.js` (NOT `package.json` or `server.js`)
- **DO NOT** use `npm start` or `next start` directly
- The `app.js` file automatically uses the PORT from cPanel environment

**If you see "EADDRINUSE: address already in use" error:**
1. Stop the Node.js app in cPanel
2. Wait 30 seconds
3. Make sure Startup File is set to `app.js` (not `package.json`)
4. Start the app again
```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

## Method 2: Static Export (Simpler but Limited)

If your cPanel doesn't support Node.js, you can export as static site:

### Step 1: Update `next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
```

**Note:** This method has limitations:
- No API routes
- No server-side features
- No dynamic routes (unless pre-rendered)

### Step 2: Build and Export

```bash
npm run build
```

This creates an `out` folder with static files.

### Step 3: Upload to cPanel

1. Upload contents of `out` folder to `public_html`
2. Done! Your site should be live.

## Method 3: Using PM2 (Advanced)

If you have SSH access:

1. **Install PM2 globally:**
```bash
npm install -g pm2
```

2. **Create `ecosystem.config.js`:**
```javascript
module.exports = {
  apps: [{
    name: 'greenvalleyseeds',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/home/username/public_html',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

3. **Start with PM2:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Important Configuration Files

### `.htaccess` for Apache (if needed)

Create in `public_html`:
```apache
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

### Environment Variables

Create `.env.production` or set in cPanel:
```
NODE_ENV=production
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_URL=https://greenvalleyseeds.pk
NEXTAUTH_SECRET=your-random-secret-here
```

## Database Setup

### For SQLite (Current Setup)
- Database file: `prisma/dev.db`
- Make sure file has write permissions
- Upload `prisma/dev.db` to server

### For MySQL/PostgreSQL (Recommended for Production)
1. Create database in cPanel
2. Update `DATABASE_URL` in `.env`
3. Update `prisma/schema.prisma` datasource
4. Run migrations: `npx prisma migrate deploy`

## Troubleshooting

### Common Issues:

1. **Port conflicts**: Make sure port 3000 is available or change PORT env variable
2. **File permissions**: Ensure uploads folder has write permissions (chmod 755)
3. **Memory limits**: Increase Node.js memory if needed
4. **Build errors**: Check Node.js version compatibility
5. **Database errors**: Verify database file permissions and path

### Check Logs:
- cPanel Node.js App logs
- PM2 logs: `pm2 logs`
- Application logs in `public_html`

## Recommended Hosting Alternatives

If cPanel doesn't work well:
- **Vercel** (Best for Next.js - Free tier available)
- **Netlify** (Good for static exports)
- **Railway** (Easy Node.js deployment)
- **DigitalOcean App Platform**
- **AWS Amplify**

## Post-Deployment Checklist

- [ ] Test all pages load correctly
- [ ] Verify images upload and display
- [ ] Test contact form submission
- [ ] Check admin dashboard access
- [ ] Verify database operations
- [ ] Test product creation/editing
- [ ] Check SSL certificate (HTTPS)
- [ ] Test on mobile devices
- [ ] Monitor error logs

## Support

If you encounter issues:
1. Check cPanel error logs
2. Verify Node.js version compatibility
3. Ensure all environment variables are set
4. Check file permissions
5. Review Next.js deployment docs

