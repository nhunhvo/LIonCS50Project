# Quick Reference: Steps 3, 4, 5

## Step 3: Create Sample Data ✅

**Purpose**: Add test data to see your app in action

**Quick Steps**:
1. Go to https://supabase.com → your project → SQL Editor
2. Copy & paste SQL from `STEP_3_SAMPLE_DATA.md`
3. Click Run
4. Update `app/page.tsx` line 13 with a test user ID
5. Run `npm run dev` and test uploading photos

**Files**: `STEP_3_SAMPLE_DATA.md`

---

## Step 4: Deploy to Vercel 🚀

**Purpose**: Make your app live on the internet

**Quick Steps**:
1. Sign up at https://vercel.com with GitHub
2. Click "New Project" → select `LIonCS50Project`
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click Deploy
5. Wait 2-3 minutes
6. Get a live URL! 🎉

**Pro Tip**: After deployment, every `git push` auto-deploys!

**Files**: `STEP_4_DEPLOY_VERCEL.md`

---

## Step 5: Implement Cron Jobs ⏰

**Purpose**: Auto-manage categories and rankings

**What's Automated**:
- Every Monday: Archive expired weekly categories
- Every 1st of month: Calculate Hall of Fame rankings

**Quick Steps**:
1. Review the cron files (already created):
   - `app/api/cron/archive-categories/route.ts`
   - `app/api/cron/calculate-hall-of-fame/route.ts`
2. In Vercel → Environment Variables → Add: `CRON_SECRET` = (any random string)
3. Push to GitHub:
   ```bash
   git add .
   git commit -m "Add cron job implementations"
   git push origin main
   ```
4. Go to Vercel → Deployments → Cron (to monitor)

**Files**: 
- `STEP_5_CRON_JOBS.md`
- `vercel.json` (cron schedule config)
- `app/api/cron/archive-categories/route.ts`
- `app/api/cron/calculate-hall-of-fame/route.ts`

---

## Full Command Reference

```bash
# Test locally
npm run dev

# Deploy to GitHub (triggers Vercel auto-deploy)
git add .
git commit -m "Your message"
git push origin main

# Test cron locally
curl http://localhost:3000/api/cron/archive-categories \
  -H "Authorization: Bearer your_cron_secret"
```

---

## Environment Variables Needed

Add these to Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://eadoawblzbppydumyslk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGci...
CRON_SECRET = your_secret_key_here
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Photos not showing | Check Supabase Storage bucket is public |
| Can't upload photos | Verify SUPABASE_SERVICE_ROLE_KEY is correct |
| Vercel build fails | Check build logs in Vercel dashboard |
| Crons not running | Verify CRON_SECRET env var is set |
| 404 on API route | Make sure route file is in right folder |

---

## What Happens Next

✅ Your app is live  
✅ Categories auto-archive  
✅ Hall of Fame auto-calculates  
✅ Every git push auto-deploys  

**Optional next steps**:
- Add Supabase Authentication (login system)
- Add push notifications
- Build mobile app with React Native
- Add analytics dashboard

---

Need help? Check the detailed guides:
- `STEP_3_SAMPLE_DATA.md` - Detailed sample data setup
- `STEP_4_DEPLOY_VERCEL.md` - Detailed Vercel deployment
- `STEP_5_CRON_JOBS.md` - Detailed cron job setup
