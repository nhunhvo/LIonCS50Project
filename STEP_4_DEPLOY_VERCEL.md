# Step 4: Deploy to Vercel

## Prerequisites
- GitHub account (you already have this)
- Vercel account (free at https://vercel.com)

## Deployment Steps

### 1. Sign up on Vercel

1. Go to https://vercel.com
2. Click **Sign Up**
3. Choose **Continue with GitHub**
4. Authorize Vercel to access your GitHub account

### 2. Import Your Project

1. After signing in, click **New Project**
2. Find and select `LIonCS50Project` from your repositories
3. Click **Import**

### 3. Set Environment Variables

Before deploying, you need to add your Supabase credentials:

1. In the **Configure Project** step, you'll see "Environment Variables"
2. Add these three variables:

```
NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key
SUPABASE_SERVICE_ROLE_KEY = your_service_role_key
```

**How to get these values:**
- Go to your Supabase dashboard
- Click your project
- Go to **Settings** → **API**
- Copy the URL and keys from there

### 4. Deploy!

1. Click **Deploy**
2. Wait 2-3 minutes for deployment to complete
3. You'll get a URL like: `https://your-project.vercel.app`

### 5. Test Your Deployment

- Visit your new URL
- Upload a photo
- Check the leaderboard
- Everything should work!

## Automatic Deployments

After initial setup, every time you push to GitHub, Vercel automatically deploys:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel detects the push and redeploys automatically! ✨

## Troubleshooting

**Issue**: "Database connection error"
**Solution**: Double-check your environment variables in Vercel settings match your Supabase credentials

**Issue**: "Photos not uploading"
**Solution**: Make sure your Supabase Storage bucket is public and CORS is configured

**Issue**: "Build failed"
**Solution**: Check the build logs in Vercel dashboard for error messages

## Monitoring

In Vercel dashboard you can:
- View real-time logs
- Check deployment history
- Monitor performance
- Scale automatically (Vercel handles this)

That's it! Your app is now live on the internet! 🚀
