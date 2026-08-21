# Deployment Guide

This guide will help you deploy Pyramid Task Manager to Vercel (frontend) and Render (backend).

## Prerequisites

1. GitHub account with the repo pushed to https://github.com/notrishabhsingh/ablespace
2. MongoDB Atlas cluster (free tier works)
3. Vercel account (free)
4. Render account (free)

## Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 tier)
3. Create a database user with read/write permissions
4. Whitelist all IP addresses (0.0.0.0/0) for free tier, or add Vercel/Render IPs
5. Get your connection string (should look like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pyramid?retryWrites=true&w=majority
   ```

## Step 2: Deploy Backend to Render

### Option A: Using Render Dashboard (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub account and select the `ablespace` repo
4. Configure the service:
   - **Name**: `pyramid-backend` (or your choice)
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Instance Type**: `Free`

5. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=4000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pyramid?retryWrites=true&w=majority
   JWT_SECRET=<generate-a-random-64-char-string>
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=<will-add-after-vercel-deployment>
   ```

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL (e.g., `https://pyramid-backend.onrender.com`)

### Option B: Using render.yaml (Infrastructure as Code)

1. The `render.yaml` file is already in your repo
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Blueprint"
4. Connect your GitHub repo
5. Render will detect the `render.yaml` and prompt for environment variables
6. Fill in:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `CORS_ORIGIN`: Your Vercel frontend URL (add after Step 3)
7. Click "Apply"

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repo `ablespace`
4. Vercel will auto-detect it as a Next.js project
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

6. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://pyramid-backend.onrender.com/api
   ```
   (Use your actual Render backend URL from Step 2)

7. Click "Deploy"
8. Wait for deployment (2-3 minutes)
9. Copy your frontend URL (e.g., `https://ablespace.vercel.app`)

## Step 4: Update Backend CORS

1. Go back to Render Dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Update `CORS_ORIGIN` to your Vercel URL:
   ```
   CORS_ORIGIN=https://ablespace.vercel.app
   ```
5. Click "Save Changes"
6. Render will automatically redeploy

## Step 5: Verify Deployment

1. Visit your Vercel URL (e.g., `https://ablespace.vercel.app`)
2. You should see the login page
3. Click "Continue as guest" to create a test account
4. Try creating a project and tasks
5. Check that everything works correctly

## Troubleshooting

### Backend not connecting to MongoDB
- Verify your MongoDB Atlas IP whitelist includes all IPs (0.0.0.0/0)
- Check that your connection string is correct
- Ensure the database user has read/write permissions

### Frontend can't reach backend
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Check that `CORS_ORIGIN` in Render matches your Vercel URL exactly
- Check Render logs for any errors

### CORS errors in browser console
- Ensure `CORS_ORIGIN` in Render matches your Vercel URL (including https://)
- Redeploy backend after updating CORS_ORIGIN

### Backend slow to respond (free tier)
- Render free tier spins down after 15 minutes of inactivity
- First request after idle may take 30-60 seconds to wake up
- Consider upgrading to a paid plan for production use

## Environment Variables Reference

### Backend (Render)
```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pyramid
JWT_SECRET=<random-64-character-string>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com/api
```

## Generating a JWT Secret

You can generate a secure JWT secret using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or use an online generator like [random.org](https://www.random.org/strings/)

## Custom Domain (Optional)

### Vercel
1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

### Render
1. Go to your Render service settings
2. Click "Custom Domain"
3. Add your custom domain (e.g., `api.yourdomain.com`)
4. Update `CORS_ORIGIN` in environment variables
5. Update `NEXT_PUBLIC_API_URL` in Vercel

## Monitoring

- **Render**: Check logs in the dashboard for backend errors
- **Vercel**: Check deployment logs and function logs
- **MongoDB Atlas**: Monitor database metrics and connections

## Cost

- **Vercel**: Free tier is sufficient for development/small projects
- **Render**: Free tier (spins down after inactivity)
- **MongoDB Atlas**: M0 free tier (512MB storage)

Total: **$0/month** for development use
