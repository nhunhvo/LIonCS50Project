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
    const { data: categories } = await supabase.from('categories').select('id')

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

      await supabase.from('hall_of_fame').upsert(hallOfFameEntries, {
        onConflict: 'category_id,user_id,month_year,rank',
      })

      totalEntriesAdded += hallOfFameEntries.length
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
