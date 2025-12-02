'use client'

import { useState } from 'react'
import CategoryList from '@/components/CategoryList'
import PhotoGallery from '@/components/PhotoGallery'
import PhotoUpload from '@/components/PhotoUpload'
import WeeklyLeaderboard from '@/components/WeeklyLeaderboard'
import HallOfFame from '@/components/HallOfFame'

export default function Home() {
  // Test users provided for local testing
  const testUsers = [
    { id: '4e212ece-95b5-4280-aebf-05870cffeb8d', name: 'adam_photo' },
    { id: '3ad4720e-d872-4016-805a-8caafb0d269f', name: 'ella_lens' },
    { id: '1f7e738b-315b-41e9-9dc4-80f8b01dcda8', name: 'jenny_captures' },
  ]

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>(testUsers[0].id) // Replace with auth in production
  const [refreshPhotos, setRefreshPhotos] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">📸 ShareSnap</h1>
              <p className="text-gray-600 text-sm">Compete, Share & Celebrate</p>
            </div>
            {/* Test user selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="user-select" className="text-sm text-gray-600">
                Testing as:
              </label>
              <select
                id="user-select"
                className="border rounded px-2 py-1 text-sm"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              >
                {testUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <CategoryList onCategorySelect={setSelectedCategory} />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {!selectedCategory ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome to ShareSnap</h2>
                <p className="text-xl text-gray-600 mb-6">
                  Select a category to browse photos, compete on leaderboards, and see who's winning!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-2xl mb-2">📸</p>
                    <p className="font-semibold">Upload Photos</p>
                    <p className="text-sm text-gray-600">Share your best moments in any category</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-2xl mb-2">🏆</p>
                    <p className="font-semibold">Compete</p>
                    <p className="text-sm text-gray-600">Race to the top of the weekly leaderboard</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-2xl mb-2">⭐</p>
                    <p className="font-semibold">Hall of Fame</p>
                    <p className="text-sm text-gray-600">See the best photos of the month</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Upload Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <PhotoUpload
                      categoryId={selectedCategory}
                      userId={userId}
                      onPhotoUploaded={() => setRefreshPhotos((p) => p + 1)}
                    />
                  </div>
                  <div>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="w-full bg-gray-500 text-white font-bold py-2 rounded-lg hover:bg-gray-600"
                    >
                      ← Back
                    </button>
                  </div>
                </div>

                {/* Leaderboard */}
                <WeeklyLeaderboard categoryId={selectedCategory} />

                {/* Photos Gallery */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Recent Photos</h3>
                  <PhotoGallery key={refreshPhotos} categoryId={selectedCategory} sortBy="recent" />
                </div>

                {/* Hall of Fame */}
                <HallOfFame categoryId={selectedCategory} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
