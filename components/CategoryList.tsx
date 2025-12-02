'use client'

import { useState, useEffect } from 'react'

interface Category {
  id: string
  name: string
  description: string
  category_type: string
  is_active: boolean
  created_at: string
}

interface CategoryListProps {
  onCategorySelect: (categoryId: string) => void
}

export default function CategoryList({ onCategorySelect }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'official_permanent' | 'official_weekly' | 'custom'>('official_permanent')

  useEffect(() => {
    fetchCategories()
  }, [activeTab])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories?type=${activeTab}`)
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading categories...</div>
  }

  const tabs = [
    { value: 'official_permanent' as const, label: 'Basic' },
    { value: 'official_weekly' as const, label: 'This Week' },
    { value: 'custom' as const, label: 'Custom' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Categories</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 font-semibold ${
              activeTab === tab.value
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600 hover:text-blue-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <p className="text-gray-500">No categories found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className="p-4 border rounded-lg hover:shadow-lg transition-shadow text-left hover:bg-blue-50"
            >
              <h3 className="font-bold text-lg mb-1">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-600 mb-2">{category.description}</p>
              )}
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {category.category_type === 'official_permanent'
                  ? 'Basic'
                  : category.category_type === 'official_weekly'
                    ? 'This Week'
                    : 'Custom'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
