'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface LeaderboardEntry {
  rank: number
  points: number
  users: {
    username: string
    profile_picture_url: string
  }
}

interface WeeklyLeaderboardProps {
  categoryId: string
}

export default function WeeklyLeaderboard({ categoryId }: WeeklyLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
    subscribeToLeaderboard()
  }, [categoryId])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/leaderboard?categoryId=${categoryId}`)
      const data = await response.json()
      setLeaderboard(data)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToLeaderboard = () => {
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
          fetchLeaderboard()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading leaderboard...</div>
  }

  if (leaderboard.length === 0) {
    return <div className="text-center py-8 text-gray-500">No rankings yet</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Weekly Leaderboard</h2>
      <div className="space-y-2">
        {leaderboard.map((entry, index) => (
          <div
            key={index}
            className={`flex items-center p-3 rounded-lg ${
              entry.rank === 1
                ? 'bg-yellow-100'
                : entry.rank === 2
                  ? 'bg-gray-100'
                  : entry.rank === 3
                    ? 'bg-orange-100'
                    : 'bg-gray-50'
            }`}
          >
            <div className="text-2xl font-bold w-12 text-center">
              {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
            </div>
            <img
              src={entry.users.profile_picture_url || '/default-avatar.png'}
              alt={entry.users.username}
              className="w-10 h-10 rounded-full mx-3"
            />
            <span className="font-semibold flex-1">{entry.users.username}</span>
            <span className="font-bold text-lg">{entry.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  )
}
