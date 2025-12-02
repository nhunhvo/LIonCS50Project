import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { photoId, userId, voteType } = await request.json()

    if (!photoId || !userId || !voteType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('photo_votes')
      .select()
      .eq('photo_id', photoId)
      .eq('user_id', userId)
      .single()

    if (existingVote) {
      // Update vote
      await supabase
        .from('photo_votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id)
    } else {
      // Create new vote
      await supabase.from('photo_votes').insert([
        {
          photo_id: photoId,
          user_id: userId,
          vote_type: voteType,
        },
      ])
    }

    // Update photo scores
    const { data: votes } = await supabase
      .from('photo_votes')
      .select('vote_type')
      .eq('photo_id', photoId)

    if (votes) {
      const likes = votes.filter((v) => v.vote_type === 'like').length
      const dislikes = votes.filter((v) => v.vote_type === 'dislike').length
      const netScore = likes - dislikes

      await supabase
        .from('photos')
        .update({
          likes_count: likes,
          dislikes_count: dislikes,
          net_score: netScore,
        })
        .eq('id', photoId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error voting on photo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
