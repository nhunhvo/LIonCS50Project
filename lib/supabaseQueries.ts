import { supabase } from './supabaseClient'

// Photo operations
export async function uploadPhoto(
  userId: string,
  categoryId: string,
  photoUrl: string,
  caption?: string
) {
  const { data, error } = await supabase
    .from('photos')
    .insert([
      {
        user_id: userId,
        category_id: categoryId,
        photo_url: photoUrl,
        caption: caption || null,
      },
    ])
    .select()

  if (error) throw error
  return data?.[0]
}

// Vote on photo
export async function voteOnPhoto(
  photoId: string,
  userId: string,
  voteType: 'like' | 'dislike'
) {
  // Check if user already voted
  const { data: existingVote } = await supabase
    .from('photo_votes')
    .select()
    .eq('photo_id', photoId)
    .eq('user_id', userId)
    .single()

  if (existingVote) {
    // Update vote
    const { error } = await supabase
      .from('photo_votes')
      .update({ vote_type: voteType })
      .eq('id', existingVote.id)

    if (error) throw error
  } else {
    // Create new vote
    const { error } = await supabase.from('photo_votes').insert([
      {
        photo_id: photoId,
        user_id: userId,
        vote_type: voteType,
      },
    ])

    if (error) throw error
  }

  // Update photo scores
  await updatePhotoScores(photoId)
}

// Update photo scores
export async function updatePhotoScores(photoId: string) {
  const { data: votes } = await supabase
    .from('photo_votes')
    .select('vote_type')
    .eq('photo_id', photoId)

  if (!votes) return

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

// Fetch photos by category
export async function getPhotosByCategory(
  categoryId: string,
  sortBy: 'recent' | 'trending' = 'recent'
) {
  let query = supabase
    .from('photos')
    .select(
      `
    id,
    user_id,
    photo_url,
    caption,
    likes_count,
    dislikes_count,
    net_score,
    created_at,
    users:user_id(username, profile_picture_url)
  `
    )
    .eq('category_id', categoryId)
    .eq('is_archived', false)

  if (sortBy === 'trending') {
    query = query.order('net_score', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

// Get user profile
export async function getUserProfile(userId: string) {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select()
    .eq('id', userId)
    .single()

  if (userError) throw userError

  // Get user's photos
  const { data: photos, error: photosError } = await supabase
    .from('photos')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (photosError) throw photosError

  // Get user's badges
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

  if (badgesError) throw badgesError

  return {
    user,
    photos,
    badges,
  }
}

// Calculate leaderboard for a week
export async function calculateWeeklyLeaderboard(categoryId: string) {
  const now = new Date()
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)

  // Get all photos in this category from this week
  const { data: photos } = await supabase
    .from('photos')
    .select('user_id, net_score')
    .eq('category_id', categoryId)
    .gte('created_at', weekStart.toISOString())
    .lt('created_at', weekEnd.toISOString())

  if (!photos) return

  // Group by user and sum scores
  const userScores = photos.reduce(
    (acc, photo) => {
      if (!acc[photo.user_id]) {
        acc[photo.user_id] = 0
      }
      acc[photo.user_id] += photo.net_score
      return acc
    },
    {} as Record<string, number>
  )

  // Sort and rank
  const rankings = Object.entries(userScores)
    .sort((a, b) => b[1] - a[1])
    .map(([userId, score], index) => ({
      category_id: categoryId,
      user_id: userId,
      rank: index + 1,
      points: score,
      week_start_date: weekStart.toISOString(),
      week_end_date: weekEnd.toISOString(),
    }))

  // Upsert leaderboard
  for (const ranking of rankings) {
    await supabase.from('weekly_leaderboards').upsert([ranking])
  }

  return rankings
}

// Get hall of fame for category
export async function getHallOfFame(categoryId: string, monthYear?: string) {
  const month = monthYear || new Date().toISOString().substring(0, 7) // YYYY-MM

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

  if (error) throw error
  return data
}

// Archive category (when weekly category expires)
export async function archiveWeeklyCategory(categoryId: string) {
  const { error } = await supabase
    .from('categories')
    .update({ is_active: false })
    .eq('id', categoryId)

  if (error) throw error
}
