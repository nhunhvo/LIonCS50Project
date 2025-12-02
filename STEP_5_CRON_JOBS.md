# Step 5: Implement Cron Jobs

Cron jobs run automatically on a schedule. We'll use Vercel's built-in cron functionality.

## Task 1: Archive Expired Weekly Categories

Weekly categories should auto-archive after 7 days.

### Create the cron endpoint

Create a new file: `app/api/cron/archive-categories/route.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  // Verify the cron secret (security)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all active weekly categories that are older than 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: categoriesToArchive } = await supabase
      .from('categories')
      .select('id')
      .eq('category_type', 'official_weekly')
      .eq('is_active', true)
      .lt('week_start_date', weekAgo)

    if (!categoriesToArchive) {
      return NextResponse.json({ archived: 0 })
    }

    // Archive each category
    for (const category of categoriesToArchive) {
      await supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', category.id)
    }

    console.log(`Archived ${categoriesToArchive.length} categories`)
    return NextResponse.json({ 
      archived: categoriesToArchive.length,
      success: true 
    })
  } catch (error) {
    console.error('Error archiving categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Task 2: Calculate Hall of Fame Monthly

Run at the end of each month to calculate top photos.

### Create the cron endpoint

Create a new file: `app/api/cron/calculate-hall-of-fame/route.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  // Verify the cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get current month
    const now = new Date()
    const monthYear = now.toISOString().substring(0, 7) // YYYY-MM

    // Get all categories
    const { data: categories } = await supabase
      .from('categories')
      .select('id')

    if (!categories) return NextResponse.json({ error: 'No categories' })

    let totalEntriesAdded = 0

    // For each category, get top 10 photos of the month
    for (const category of categories) {
      const { data: topPhotos } = await supabase
        .from('photos')
        .select('id, user_id, likes_count')
        .eq('category_id', category.id)
        .gte('created_at', `${monthYear}-01`)
        .lte('created_at', `${monthYear}-31`)
        .order('likes_count', { ascending: false })
        .limit(10)

      if (!topPhotos || topPhotos.length === 0) continue

      // Insert into hall_of_fame
      const hallOfFameEntries = topPhotos.map((photo, index) => ({
        photo_id: photo.id,
        category_id: category.id,
        user_id: photo.user_id,
        month_year: monthYear,
        rank: index + 1,
        likes_count: photo.likes_count,
      }))

      const { error } = await supabase
        .from('hall_of_fame')
        .upsert(hallOfFameEntries, {
          onConflict: 'category_id,user_id,month_year,rank',
        })

      if (!error) {
        totalEntriesAdded += hallOfFameEntries.length
      }
    }

    console.log(`Added ${totalEntriesAdded} hall of fame entries for ${monthYear}`)
    return NextResponse.json({
      monthYear,
      entriesAdded: totalEntriesAdded,
      success: true,
    })
  } catch (error) {
    console.error('Error calculating hall of fame:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Setup in Vercel

### 1. Add CRON_SECRET to Environment Variables

1. Go to your Vercel project settings
2. Go to **Environment Variables**
3. Add: `CRON_SECRET` = (choose any random string, e.g., `super_secret_key_12345`)

### 2. Configure Cron Jobs

Add to your `vercel.json` file (create if doesn't exist):

```json
{
  "crons": [
    {
      "path": "/api/cron/archive-categories",
      "schedule": "0 0 * * 1"
    },
    {
      "path": "/api/cron/calculate-hall-of-fame",
      "schedule": "0 2 1 * *"
    }
  ]
}
```

**Cron Schedule Explanation:**
- `0 0 * * 1` = Every Monday at midnight (archive weekly categories)
- `0 2 1 * *` = First day of month at 2 AM (calculate hall of fame)

### 3. Deploy

```bash
git add .
git commit -m "Add cron jobs for categories and hall of fame"
git push origin main
```

Vercel will automatically set up the crons!

## How to Verify Crons Are Running

1. Go to Vercel dashboard
2. Select your project
3. Go to **Deployments** → **Cron**
4. You'll see the last run time and status

## Manual Testing (Before Vercel)

Test locally with:

```bash
curl http://localhost:3000/api/cron/archive-categories \
  -H "Authorization: Bearer super_secret_key_12345"

curl http://localhost:3000/api/cron/calculate-hall-of-fame \
  -H "Authorization: Bearer super_secret_key_12345"
```

## Optional: Add Badges Automatically

You can also create a cron job to automatically award badges to users who made the hall of fame or leaderboard. This would be a separate endpoint following the same pattern.

That's it! Your app now auto-manages categories and rankings! 🎯
