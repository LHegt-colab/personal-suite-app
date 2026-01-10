import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import NotesList from '../components/NotesList'
import NoteForm from '../components/NoteForm'

function NotesPage() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [])

  async function fetchNotes() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
      alert('Fout bij het ophalen van notities: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  function handleAddNew() {
    setEditingNote(null)
    setShowForm(true)
  }

  function handleEdit(note) {
    setEditingNote(note)
    setShowForm(true)
  }

  function handleFormClose() {
    setShowForm(false)
    setEditingNote(null)
  }

  function handleFormSuccess() {
    fetchNotes()
    handleFormClose()
  }

  async function handleDelete(id) {
    if (!confirm('Weet je zeker dat je deze notitie wilt verwijderen?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Fout bij het verwijderen: ' + error.message)
    }
  }

  async function handleToggleFavorite(note) {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_favorite: !note.is_favorite })
        .eq('id', note.id)

      if (error) throw error
      fetchNotes()
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert('Fout bij het bijwerken: ' + error.message)
    }
  }

  function stripHtml(html) {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  // Get unique categories and tags
  const categories = [...new Set(notes.map(n => n.category).filter(Boolean))]
  const allTags = [...new Set(notes.flatMap(n => n.tags || []))]

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      note.title.toLowerCase().includes(query) ||
      stripHtml(note.content).toLowerCase().includes(query) ||
      (note.category && note.category.toLowerCase().includes(query)) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))

    const matchesCategory = !selectedCategory || note.category === selectedCategory
    const matchesTag = !selectedTag || (note.tags && note.tags.includes(selectedTag))
    const matchesFavorite = !showFavoritesOnly || note.is_favorite

    return matchesSearch && matchesCategory && matchesTag && matchesFavorite
  })

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Mijn Notities</h2>
        <button
          onClick={handleAddNew}
          className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors shadow-md"
        >
          + Nieuwe Notitie
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Zoek in notities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
        />

        {/* Filters row */}
        <div className="flex flex-wrap gap-3">
          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
          >
            <option value="">Alle categorieën</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Tag filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
          >
            <option value="">Alle tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>#{tag}</option>
            ))}
          </select>

          {/* Favorites toggle */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showFavoritesOnly
                ? 'bg-yellow-100 border-yellow-500 text-yellow-800'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill={showFavoritesOnly ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {showFavoritesOnly ? 'Alleen favorieten' : 'Favorieten'}
            </span>
          </button>

          {/* Clear filters */}
          {(selectedCategory || selectedTag || showFavoritesOnly || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('')
                setSelectedTag('')
                setShowFavoritesOnly(false)
                setSearchQuery('')
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Wis filters
            </button>
          )}
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-600">
          {filteredNotes.length} van {notes.length} notities
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Laden...</p>
        </div>
      ) : (
        <NotesList
          notes={filteredNotes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {showForm && (
        <NoteForm
          note={editingNote}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

export default NotesPage
