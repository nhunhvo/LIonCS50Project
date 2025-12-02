'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Photo {
  id: string
  photo_url: string
  caption: string
  likes_count: number
  dislikes_count: number
  net_score: number
  created_at: string
  user_id: string
  users: {
    username: string
    profile_picture_url: string
  }
}

interface PhotoGalleryProps {
  categoryId: string
  sortBy?: 'recent' | 'trending'
}

export default function PhotoGallery({
  categoryId,
  sortBy = 'recent',
}: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [userVotes, setUserVotes] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchPhotos()
    subscribeToPhotos()
  }, [categoryId, sortBy])

  const fetchPhotos = async () => {
    try {
      const response = await fetch(
        `/api/photos?categoryId=${categoryId}&sortBy=${sortBy}`
      )
      const data = await response.json()
      setPhotos(data)
    } catch (error) {
      console.error('Error fetching photos:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToPhotos = () => {
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
          fetchPhotos()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const handleVote = async (photoId: string, voteType: 'like' | 'dislike') => {
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId,
          userId: (await supabase.auth.getUser()).data.user?.id,
          voteType,
        }),
      })

      if (response.ok) {
        setUserVotes((prev) => ({
          ...prev,
          [photoId]: voteType,
        }))
        fetchPhotos()
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading photos...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {photos.map((photo) => (
        <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <img
            src={photo.photo_url}
            alt={photo.caption}
            className="w-full h-64 object-cover"
          />
          <div className="p-4">
            <div className="flex items-center mb-2">
              <img
                src={photo.users.profile_picture_url || '/default-avatar.png'}
                alt={photo.users.username}
                className="w-8 h-8 rounded-full mr-2"
              />
              <span className="font-semibold text-sm">{photo.users.username}</span>
            </div>
            {photo.caption && <p className="text-gray-700 text-sm mb-3">{photo.caption}</p>}
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => handleVote(photo.id, 'like')}
                  className={`flex items-center gap-1 ${
                    userVotes[photo.id] === 'like'
                      ? 'text-red-500'
                      : 'text-gray-500'
                  } hover:text-red-500`}
                >
                  👍 {photo.likes_count}
                </button>
                <button
                  onClick={() => handleVote(photo.id, 'dislike')}
                  className={`flex items-center gap-1 ${
                    userVotes[photo.id] === 'dislike'
                      ? 'text-blue-500'
                      : 'text-gray-500'
                  } hover:text-blue-500`}
                >
                  👎 {photo.dislikes_count}
                </button>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(photo.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
