import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import JournalList from '../components/JournalList'
import JournalForm from '../components/JournalForm'

function JournalPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error fetching journal entries:', error)
      alert('Fout bij het ophalen van dagboek entries: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  function handleAddNew() {
    setEditingEntry(null)
    setShowForm(true)
  }

  function handleEdit(entry) {
    setEditingEntry(entry)
    setShowForm(true)
  }

  function handleFormClose() {
    setShowForm(false)
    setEditingEntry(null)
  }

  function handleFormSuccess() {
    fetchEntries()
    handleFormClose()
  }

  async function handleDelete(id) {
    if (!confirm('Weet je zeker dat je deze dagboek entry wilt verwijderen?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchEntries()
    } catch (error) {
      console.error('Error deleting entry:', error)
      alert('Fout bij het verwijderen: ' + error.message)
    }
  }

  const filteredEntries = entries.filter(entry => {
    const query = searchQuery.toLowerCase()
    return (
      entry.title.toLowerCase().includes(query) ||
      entry.content.toLowerCase().includes(query) ||
      (entry.location_name && entry.location_name.toLowerCase().includes(query))
    )
  })

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mijn Dagboek</h2>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nieuwe Entry
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Zoek in je dagboek..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Laden...</p>
        </div>
      ) : (
        <JournalList
          entries={filteredEntries}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {showForm && (
        <JournalForm
          entry={editingEntry}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

export default JournalPage
