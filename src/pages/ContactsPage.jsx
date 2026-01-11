import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ContactForm from '../components/ContactForm'
import ContactsList from '../components/ContactsList'

function ContactsPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRelation, setFilterRelation] = useState('')

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('first_name', { ascending: true })

      if (error) throw error
      setContacts(data || [])
    } catch (err) {
      console.error('Error fetching contacts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setSelectedContact(null)
    setShowForm(true)
  }

  const handleEdit = (contact) => {
    setSelectedContact(contact)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Weet je zeker dat je dit contact wilt verwijderen?')) return

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchContacts()
    } catch (err) {
      console.error('Error deleting contact:', err)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedContact(null)
  }

  const handleFormSuccess = () => {
    fetchContacts()
  }

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const query = searchQuery.toLowerCase()
    const matchesSearch = !query ||
      contact.first_name.toLowerCase().includes(query) ||
      (contact.last_name && contact.last_name.toLowerCase().includes(query)) ||
      (contact.nickname && contact.nickname.toLowerCase().includes(query)) ||
      (contact.company && contact.company.toLowerCase().includes(query)) ||
      (contact.notes && contact.notes.toLowerCase().includes(query))

    const matchesRelation = !filterRelation || contact.relation === filterRelation

    return matchesSearch && matchesRelation
  })

  // Stats
  const stats = {
    total: contacts.length,
    family: contacts.filter(c => c.relation === 'family').length,
    friends: contacts.filter(c => c.relation === 'friend').length,
    colleagues: contacts.filter(c => c.relation === 'colleague').length
  }

  return (
    <div>
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Contacten</h2>
          <button
            onClick={handleAddNew}
            className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors shadow-md"
          >
            + Nieuw Contact
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-gray-600">Totaal contacten</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">{stats.family}</div>
            <div className="text-sm text-gray-600">Familie</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{stats.friends}</div>
            <div className="text-sm text-gray-600">Vrienden</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.colleagues}</div>
            <div className="text-sm text-gray-600">Collega's</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Zoek in contacten..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
        />

        {/* Filter Row */}
        <div className="flex flex-wrap gap-3">
          {/* Relation Filter */}
          <select
            value={filterRelation}
            onChange={(e) => setFilterRelation(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
          >
            <option value="">Alle relaties</option>
            <option value="family">Familie</option>
            <option value="friend">Vrienden</option>
            <option value="colleague">Collega's</option>
            <option value="other">Overig</option>
          </select>

          {/* Clear Filters */}
          {(searchQuery || filterRelation) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setFilterRelation('')
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Wis filters
            </button>
          )}
        </div>
      </div>

      {/* Contacts List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Laden...</p>
        </div>
      ) : (
        <ContactsList
          contacts={filteredContacts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <ContactForm
          contact={selectedContact}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

export default ContactsPage
