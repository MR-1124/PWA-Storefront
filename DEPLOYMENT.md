# Deployment Guide

## Architecture
- **Frontend**: Vercel (React PWA)
- **Backend**: Railway/Render (Express API)
- **Database**: Railway/Render MySQL or PlanetScale

## Step 1: Deploy Backend (Railway - Recommended)

### 1.1 Sign up at Railway.app
- Go to https://railway.app
- Sign up with GitHub

### 1.2 Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your `PWA-Storefront` repository
- Railway will auto-detect the Node.js app

### 1.3 Configure Backend
- Click on your service
- Go to "Variables" tab
- Add environment variables:
```
PORT=5001
DB_HOST=<your-db-host>
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
DB_NAME=pwa_ecommerce
JWT_SECRET=<generate-random-secret>
NODE_ENV=production
```

### 1.4 Set Root Directory
- Go to "Settings" tab
- Set "Root Directory" to `server`
- Set "Start Command" to `npm start`

### 1.5 Add MySQL Database
- Click "New" > "Database" > "Add MySQL"
- Railway will provide connection details
- Copy these to your environment variables

### 1.6 Initialize Database
- Go to MySQL service > "Data" tab
- Click "Query" and run:
  - Copy contents from `server/database/schema.sql`
  - Then copy contents from `server/database/seeds.sql`

### 1.7 Get Backend URL
- Your backend will be at: `https://your-app.railway.app`
- Copy this URL for frontend configuration

## Step 2: Deploy Frontend (Vercel)

### 2.1 Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2.2 Deploy via Vercel Dashboard
1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "Add New" > "Project"
4. Import your `PWA-Storefront` repository
5. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 2.3 Add Environment Variables
In Vercel project settings > Environment Variables:
```
REACT_APP_API_URL=https://your-backend.railway.app/api
```

### 2.4 Deploy
- Click "Deploy"
- Vercel will build and deploy your frontend

## Step 3: Update CORS Settings

Update `server/index.js` to allow your Vercel domain:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app',  // Add your Vercel URL
  ],
  credentials: true,
};
```

Commit and push changes - Railway will auto-deploy.

## Alternative: Deploy via CLI

### Backend (Railway)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

### Frontend (Vercel)
```bash
# From project root
vercel

# Follow prompts:
# - Set root directory to 'client'
# - Add environment variable: REACT_APP_API_URL

# Deploy to production
vercel --prod
```

## Alternative Backend Hosts

### Render.com
1. Create account at https://render.com
2. New > Web Service
3. Connect GitHub repo
4. Root Directory: `server`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add environment variables
8. Create PostgreSQL or MySQL database

### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Set environment variables
heroku config:set JWT_SECRET=your-secret

# Deploy
git subtree push --prefix server heroku main
```

## Database Alternatives

### PlanetScale (MySQL)
1. Sign up at https://planetscale.com
2. Create database
3. Get connection string
4. Use in Railway/Render environment variables

### Supabase (PostgreSQL)
1. Sign up at https://supabase.com
2. Create project
3. Get connection details
4. Update code to use PostgreSQL instead of MySQL

## Post-Deployment Checklist

- [ ] Backend is running and accessible
- [ ] Database is initialized with schema and seeds
- [ ] Frontend can connect to backend API
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] Admin account works (admin@example.com)
- [ ] Test customer account works
- [ ] PWA features work (service worker, offline mode)
- [ ] Image uploads work (configure cloud storage if needed)

## Troubleshooting

### Frontend can't connect to backend
- Check REACT_APP_API_URL is correct
- Verify CORS settings in backend
- Check browser console for errors

### Database connection fails
- Verify DB credentials in environment variables
- Check if database service is running
- Ensure database is initialized with schema

### Images not loading
- For production, use cloud storage (AWS S3, Cloudinary)
- Update multer configuration in backend
- Or use Railway's persistent volumes

## Monitoring

- **Railway**: Built-in logs and metrics
- **Vercel**: Analytics and logs in dashboard
- **Uptime**: Use UptimeRobot or similar for monitoring

## Custom Domain (Optional)

### Vercel
- Go to project settings > Domains
- Add your custom domain
- Update DNS records as instructed

### Railway
- Go to service settings > Networking
- Add custom domain
- Update DNS records
