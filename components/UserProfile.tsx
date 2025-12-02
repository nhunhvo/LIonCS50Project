'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Badge {
  badge_type: string
  rank: number
  period: string
  categories: {
    name: string
  }
}

interface UserProfile {
  username: string
  profile_picture_url: string
  is_leaderboard_leader: boolean
  photos: Array<{
    id: string
    photo_url: string
    caption: string
    created_at: string
  }>
  badges: Array<{
    user_badges: Badge
  }>
}

interface UserProfileProps {
  userId: string
}

export default function UserProfile({ userId }: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setCurrentUser(data.user?.id || null)
    }

    getUser()
    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile/${userId}`)
      const data = await response.json()
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const deletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return

    try {
      await supabase.from('photos').delete().eq('id', photoId)
      fetchProfile()
    } catch (error) {
      console.error('Error deleting photo:', error)
    }
  }

  const archivePhoto = async (photoId: string) => {
    try {
      await supabase.from('photos').update({ is_archived: true }).eq('id', photoId)
      fetchProfile()
    } catch (error) {
      console.error('Error archiving photo:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>
  }

  if (!profile) {
    return <div className="text-center py-8 text-red-500">Profile not found</div>
  }

  const isOwnProfile = currentUser === userId

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="flex items-center mb-6">
          <div className="relative">
            <img
              src={profile.profile_picture_url || '/default-avatar.png'}
              alt={profile.username}
              className="w-24 h-24 rounded-full"
            />
            {profile.is_leaderboard_leader && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                👑
              </div>
            )}
          </div>
          <div className="ml-6">
            <h1 className="text-3xl font-bold">{profile.username}</h1>
            {profile.is_leaderboard_leader && (
              <p className="text-yellow-600 font-semibold mt-1">Current Weekly Leader</p>
            )}
          </div>
        </div>

        {/* Badges */}
        {profile.badges.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold text-lg mb-2">Achievements</h3>
            <div className="flex gap-3 flex-wrap">
              {profile.badges.map((badge, idx) => (
                <div key={idx} className="bg-yellow-100 px-4 py-2 rounded-full text-sm">
                  {badge.user_badges.badge_type === 'leaderboard' ? '🏆' : '⭐'}{' '}
                  {badge.user_badges.categories.name} - #{badge.user_badges.rank}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Photos Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Photos ({profile.photos.length})
        </h2>
        {profile.photos.length === 0 ? (
          <p className="text-gray-500">No photos yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.photos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={photo.photo_url}
                  alt={photo.caption}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3">
                  {photo.caption && <p className="text-sm text-gray-700 mb-2">{photo.caption}</p>}
                  <p className="text-xs text-gray-500 mb-3">
                    {new Date(photo.created_at).toLocaleDateString()}
                  </p>
                  {isOwnProfile && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => archivePhoto(photo.id)}
                        className="flex-1 bg-yellow-500 text-white py-1 rounded text-sm hover:bg-yellow-600"
                      >
                        Archive
                      </button>
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="flex-1 bg-red-500 text-white py-1 rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
