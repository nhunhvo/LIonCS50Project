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

    if (!categoriesToArchive || categoriesToArchive.length === 0) {
      return NextResponse.json({ archived: 0, success: true })
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
      success: true,
    })
  } catch (error) {
    console.error('Error archiving categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
