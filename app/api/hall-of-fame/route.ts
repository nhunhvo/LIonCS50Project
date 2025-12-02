import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const monthYear = searchParams.get('monthYear')

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Missing categoryId' },
        { status: 400 }
      )
    }

    const month = monthYear || new Date().toISOString().substring(0, 7)

    const { data, error } = await supabase
      .from('hall_of_fame')
      .select(
        `
      rank,
      likes_count,
      photos:photo_id(
        photo_url,
        caption
      ),
      users:user_id(
        username,
        profile_picture_url
      )
    `
      )
      .eq('category_id', categoryId)
      .eq('month_year', month)
      .order('rank', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching hall of fame:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
