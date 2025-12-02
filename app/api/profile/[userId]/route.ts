import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select()
      .eq('id', userId)
      .single()

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // Get user's photos
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (photosError) {
      return NextResponse.json({ error: photosError.message }, { status: 500 })
    }

    // Get user's displayed badges
    const { data: badges, error: badgesError } = await supabase
      .from('displayed_badges')
      .select(
        `
      user_badges:badge_id(
        badge_type,
        category_id,
        rank,
        period,
        categories:category_id(name)
      )
    `
      )
      .eq('user_id', userId)
      .order('display_order', { ascending: true })
      .limit(5)

    if (badgesError) {
      return NextResponse.json({ error: badgesError.message }, { status: 500 })
    }

    return NextResponse.json({
      user,
      photos,
      badges,
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
