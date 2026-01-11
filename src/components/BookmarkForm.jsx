import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function BookmarkForm({ bookmark, onClose, onSuccess }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [rating, setRating] = useState(0)
  const [faviconUrl, setFaviconUrl] = useState('')
  const [fetchingFavicon, setFetchingFavicon] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (bookmark) {
      setName(bookmark.name || '')
      setUrl(bookmark.url || '')
      setDescription(bookmark.description || '')
      setCategory(bookmark.category || '')
      setTags(bookmark.tags || [])
      setRating(bookmark.rating || 0)
      setFaviconUrl(bookmark.favicon_url || '')
    }
  }, [bookmark])

  const fetchFavicon = async (websiteUrl) => {
    if (!websiteUrl) return

    setFetchingFavicon(true)
    try {
      // Extract domain from URL
      const urlObj = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`)
      const domain = urlObj.origin

      // Try Google's favicon service
      const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
      setFaviconUrl(googleFaviconUrl)
    } catch (err) {
      console.error('Error fetching favicon:', err)
    } finally {
      setFetchingFavicon(false)
    }
  }

  const handleUrlBlur = () => {
    if (url && !faviconUrl) {
      fetchFavicon(url)
    }
  }

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const bookmarkData = {
        name,
        url: url.startsWith('http') ? url : `https://${url}`,
        description: description || null,
        category: category || null,
        tags,
        rating,
        favicon_url: faviconUrl || null
      }

      let result
      if (bookmark) {
        result = await supabase
          .from('bookmarks')
          .update(bookmarkData)
          .eq('id', bookmark.id)
          .select()
      } else {
        result = await supabase
          .from('bookmarks')
          .insert([bookmarkData])
          .select()
      }

      if (result.error) throw result.error

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error saving bookmark:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {bookmark ? 'Bookmark Bewerken' : 'Nieuwe Bookmark'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Naam *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Naam van de website"
              required
            />
          </div>

          {/* URL with Favicon Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL *
            </label>
            <div className="flex gap-2 items-center">
              {faviconUrl && (
                <img
                  src={faviconUrl}
                  alt="Favicon"
                  className="w-8 h-8 rounded"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              )}
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={handleUrlBlur}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="https://example.com"
                required
              />
              {fetchingFavicon && (
                <div className="text-sm text-gray-500">Ophalen...</div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beschrijving
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Beschrijving van de website..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categorie
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Bijv. Ontwikkeling, Social Media..."
              list="bookmark-categories"
            />
            <datalist id="bookmark-categories">
              <option value="Ontwikkeling" />
              <option value="Social Media" />
              <option value="Nieuws" />
              <option value="Entertainment" />
              <option value="Productiviteit" />
              <option value="Inspiratie" />
              <option value="Shopping" />
              <option value="Educatie" />
            </datalist>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Voeg een tag toe (druk Enter)"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Toevoegen
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-accent/20 text-primary rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-primary-dark"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beoordeling
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <svg
                    className={`w-8 h-8 ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              {rating > 0 && (
                <button
                  type="button"
                  onClick={() => setRating(0)}
                  className="ml-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Wissen
                </button>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Opslaan...' : bookmark ? 'Bijwerken' : 'Opslaan'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookmarkForm
