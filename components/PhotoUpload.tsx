'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface PhotoUploadProps {
  categoryId: string
  userId: string
  onPhotoUploaded: () => void
}

export default function PhotoUpload({
  categoryId,
  userId,
  onPhotoUploaded,
}: PhotoUploadProps) {
  const [caption, setCaption] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!photoFile) return

    setUploading(true)
    try {
      // Upload file to Supabase Storage
      const fileName = `${userId}/${Date.now()}-${photoFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, photoFile)

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('photos').getPublicUrl(fileName)

      // Create photo record
      const response = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          categoryId,
          photoUrl: publicUrl,
          caption,
        }),
      })

      if (response.ok) {
        setCaption('')
        setPhotoFile(null)
        setPreview('')
        onPhotoUploaded()
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Upload Photo</h2>
      <form onSubmit={handleUpload}>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Photo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border rounded-lg p-2"
            required
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-4 w-full h-48 object-cover rounded-lg"
            />
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Caption (Optional)
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full border rounded-lg p-2"
            rows={3}
            placeholder="Add a caption..."
          />
        </div>
        <button
          type="submit"
          disabled={uploading || !photoFile}
          className="w-full bg-blue-500 text-white font-bold py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </button>
      </form>
    </div>
  )
}
