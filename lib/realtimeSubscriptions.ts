import { supabase } from './supabaseClient'

// Real-time subscription for photos
export function subscribeToPhotos(
  categoryId: string,
  callback: () => void
) {
  const subscription = supabase
    .channel(`photos:${categoryId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'photos',
        filter: `category_id=eq.${categoryId}`,
      },
      () => {
        callback()
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

// Real-time subscription for votes
export function subscribeToVotes(
  photoId: string,
  callback: () => void
) {
  const subscription = supabase
    .channel(`votes:${photoId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'photo_votes',
        filter: `photo_id=eq.${photoId}`,
      },
      () => {
        callback()
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

// Real-time subscription for leaderboard
export function subscribeToLeaderboard(
  categoryId: string,
  callback: () => void
) {
  const subscription = supabase
    .channel(`leaderboard:${categoryId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'weekly_leaderboards',
        filter: `category_id=eq.${categoryId}`,
      },
      () => {
        callback()
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

// Real-time subscription for hall of fame
export function subscribeToHallOfFame(
  categoryId: string,
  callback: () => void
) {
  const subscription = supabase
    .channel(`halloffame:${categoryId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'hall_of_fame',
        filter: `category_id=eq.${categoryId}`,
      },
      () => {
        callback()
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}
