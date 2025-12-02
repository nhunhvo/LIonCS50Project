'use client'

import { useState, useEffect } from 'react'

interface HallOfFameEntry {
  rank: number
  likes_count: number
  photos: {
    photo_url: string
    caption: string
  }
  users: {
    username: string
    profile_picture_url: string
  }
}

interface HallOfFameProps {
  categoryId: string
}

export default function HallOfFame({ categoryId }: HallOfFameProps) {
  const [hallOfFame, setHallOfFame] = useState<HallOfFameEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHallOfFame()
  }, [categoryId])

  const fetchHallOfFame = async () => {
    try {
      const response = await fetch(`/api/hall-of-fame?categoryId=${categoryId}`)
      const data = await response.json()
      setHallOfFame(data)
    } catch (error) {
      console.error('Error fetching hall of fame:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading hall of fame...</div>
  }

  if (hallOfFame.length === 0) {
    return <div className="text-center py-8 text-gray-500">No entries yet</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Hall of Fame</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hallOfFame.map((entry) => (
          <div
            key={entry.rank}
            className={`rounded-lg overflow-hidden shadow-md ${
              entry.rank === 1
                ? 'ring-4 ring-yellow-400'
                : entry.rank === 2
                  ? 'ring-4 ring-gray-400'
                  : entry.rank === 3
                    ? 'ring-4 ring-orange-400'
                    : ''
            }`}
          >
            <div className="relative">
              <img
                src={entry.photos.photo_url}
                alt={entry.photos.caption}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-2 left-2 text-4xl">
                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-center mb-2">
                <img
                  src={entry.users.profile_picture_url || '/default-avatar.png'}
                  alt={entry.users.username}
                  className="w-6 h-6 rounded-full mr-2"
                />
                <span className="font-semibold text-sm">{entry.users.username}</span>
              </div>
              {entry.photos.caption && (
                <p className="text-gray-700 text-sm mb-2">{entry.photos.caption}</p>
              )}
              <div className="text-sm font-bold text-red-500">
                ❤️ {entry.likes_count} likes
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
