import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import KnowledgeForm from '../components/KnowledgeForm'
import KnowledgeList from '../components/KnowledgeList'
import KnowledgeView from '../components/KnowledgeView'

function KnowledgePage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showView, setShowView] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [viewArticle, setViewArticle] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterImportance, setFilterImportance] = useState('')
  const [filterFavorites, setFilterFavorites] = useState(false)
  const [sortBy, setSortBy] = useState('recent') // 'recent', 'accessed', 'title'

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setArticles(data || [])
    } catch (err) {
      console.error('Error fetching articles:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setSelectedArticle(null)
    setShowForm(true)
  }

  const handleEdit = (article) => {
    setSelectedArticle(article)
    setShowForm(true)
    setShowView(false)
  }

  const handleView = (article) => {
    setViewArticle(article)
    setShowView(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Weet je zeker dat je dit artikel wilt verwijderen?')) return

    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchArticles()
    } catch (err) {
      console.error('Error deleting article:', err)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedArticle(null)
  }

  const handleViewClose = () => {
    setShowView(false)
    setViewArticle(null)
  }

  const handleFormSuccess = () => {
    fetchArticles()
  }

  // Get unique categories
  const categories = [...new Set(articles.filter(a => a.category).map(a => a.category))]

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const query = searchQuery.toLowerCase()
    const matchesSearch = !query ||
      article.title.toLowerCase().includes(query) ||
      (article.content && article.content.toLowerCase().includes(query)) ||
      (article.summary && article.summary.toLowerCase().includes(query)) ||
      (article.tags && article.tags.some(tag => tag.toLowerCase().includes(query)))

    const matchesCategory = !filterCategory || article.category === filterCategory
    const matchesImportance = !filterImportance || article.importance === filterImportance
    const matchesFavorites = !filterFavorites || article.is_favorite

    return matchesSearch && matchesCategory && matchesImportance && matchesFavorites
  })

  // Sort articles
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at) - new Date(a.created_at)
      case 'accessed':
        return new Date(b.last_accessed_at) - new Date(a.last_accessed_at)
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  // Stats
  const stats = {
    total: articles.length,
    favorites: articles.filter(a => a.is_favorite).length,
    high: articles.filter(a => a.importance === 'high').length,
    categories: categories.length
  }

  return (
    <div>
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Kennisbase</h2>
          <button
            onClick={handleAddNew}
            className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors shadow-md"
          >
            + Nieuw Artikel
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-gray-600">Totaal artikelen</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-500">{stats.favorites}</div>
            <div className="text-sm text-gray-600">Favorieten</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">{stats.high}</div>
            <div className="text-sm text-gray-600">Hoge prioriteit</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-accent">{stats.categories}</div>
            <div className="text-sm text-gray-600">Categorieën</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Zoek in artikelen, tags..."
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

          {/* Importance Filter */}
          <select
            value={filterImportance}
            onChange={(e) => setFilterImportance(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
          >
            <option value="">Alle prioriteiten</option>
            <option value="high">Hoog</option>
            <option value="normal">Normaal</option>
            <option value="low">Laag</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
          >
            <option value="recent">Nieuwste eerst</option>
            <option value="accessed">Laatst bekeken</option>
            <option value="title">Alfabetisch</option>
          </select>

          {/* Favorites Toggle */}
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={filterFavorites}
              onChange={(e) => setFilterFavorites(e.target.checked)}
              className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
            />
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Alleen favorieten
            </span>
          </label>

          {/* Clear Filters */}
          {(searchQuery || filterCategory || filterImportance || filterFavorites) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setFilterCategory('')
                setFilterImportance('')
                setFilterFavorites(false)
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Wis filters
            </button>
          )}
        </div>
      </div>

      {/* Articles List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Laden...</p>
        </div>
      ) : (
        <KnowledgeList
          articles={sortedArticles}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <KnowledgeForm
          article={selectedArticle}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* View Modal */}
      {showView && (
        <KnowledgeView
          article={viewArticle}
          onClose={handleViewClose}
          onEdit={handleEdit}
        />
      )}
    </div>
  )
}

export default KnowledgePage
