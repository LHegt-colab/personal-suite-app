import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import BookmarkForm from '../components/BookmarkForm'
import BookmarksList from '../components/BookmarksList'

function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedBookmark, setSelectedBookmark] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterRating, setFilterRating] = useState(0)
  const [sortBy, setSortBy] = useState('visits') // 'visits', 'recent', 'rating', 'name'

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const fetchBookmarks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookmarks(data || [])
    } catch (err) {
      console.error('Error fetching bookmarks:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setSelectedBookmark(null)
    setShowForm(true)
  }

  const handleEdit = (bookmark) => {
    setSelectedBookmark(bookmark)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Weet je zeker dat je deze bookmark wilt verwijderen?')) return

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchBookmarks()
    } catch (err) {
      console.error('Error deleting bookmark:', err)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedBookmark(null)
  }

  const handleFormSuccess = () => {
    fetchBookmarks()
  }

  const handleVisit = () => {
    fetchBookmarks()
  }

  // Get unique categories
  const categories = [...new Set(bookmarks.filter(b => b.category).map(b => b.category))]

  // Filter bookmarks
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const query = searchQuery.toLowerCase()
    const matchesSearch = !query ||
      bookmark.name.toLowerCase().includes(query) ||
      (bookmark.description && bookmark.description.toLowerCase().includes(query)) ||
      (bookmark.url && bookmark.url.toLowerCase().includes(query)) ||
      (bookmark.tags && bookmark.tags.some(tag => tag.toLowerCase().includes(query)))

    const matchesCategory = !filterCategory || bookmark.category === filterCategory
    const matchesRating = filterRating === 0 || bookmark.rating >= filterRating

    return matchesSearch && matchesCategory && matchesRating
  })

  // Sort bookmarks
  const sortedBookmarks = [...filteredBookmarks].sort((a, b) => {
    switch (sortBy) {
      case 'visits':
        return (b.visit_count || 0) - (a.visit_count || 0)
      case 'recent':
        return new Date(b.last_visited_at || 0) - new Date(a.last_visited_at || 0)
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  // Stats
  const stats = {
    total: bookmarks.length,
    categories: categories.length,
    avgRating: bookmarks.length > 0
      ? (bookmarks.reduce((sum, b) => sum + (b.rating || 0), 0) / bookmarks.length).toFixed(1)
      : 0,
    mostVisited: bookmarks.reduce((max, b) => Math.max(max, b.visit_count || 0), 0)
  }

  return (
    <div>
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Favoriete Websites</h2>
          <button
            onClick={handleAddNew}
            className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors shadow-md"
          >
            + Nieuwe Bookmark
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-gray-600">Totaal bookmarks</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-accent">{stats.categories}</div>
            <div className="text-sm text-gray-600">Categorieën</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-500 flex items-center gap-1">
              {stats.avgRating}
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="text-sm text-gray-600">Gem. beoordeling</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{stats.mostVisited}</div>
            <div className="text-sm text-gray-600">Meeste bezoeken</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Zoek in bookmarks, tags, URL..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
        />

        {/* Filter Row */}
        <div className="flex flex-wrap gap-3">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
          >
            <option value="">Alle categorieën</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Rating Filter */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
          >
            <option value={0}>Alle beoordelingen</option>
            <option value={5}>5 sterren</option>
            <option value={4}>4+ sterren</option>
            <option value={3}>3+ sterren</option>
            <option value={2}>2+ sterren</option>
            <option value={1}>1+ sterren</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
          >
            <option value="visits">Meest bezocht</option>
            <option value="recent">Laatst bezocht</option>
            <option value="rating">Hoogste beoordeling</option>
            <option value="name">Alfabetisch</option>
          </select>

          {/* Clear Filters */}
          {(searchQuery || filterCategory || filterRating > 0) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setFilterCategory('')
                setFilterRating(0)
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Wis filters
            </button>
          )}
        </div>
      </div>

      {/* Bookmarks List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Laden...</p>
        </div>
      ) : (
        <BookmarksList
          bookmarks={sortedBookmarks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onVisit={handleVisit}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <BookmarkForm
          bookmark={selectedBookmark}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

export default BookmarksPage
