import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AppointmentForm from '../components/AppointmentForm'
import CalendarView from '../components/CalendarView'
import AppointmentsList from '../components/AppointmentsList'

function CalendarPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('calendar') // 'calendar' or 'list'
  const [filterCategory, setFilterCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('start_date', { ascending: true })

      if (error) throw error
      setAppointments(data || [])
    } catch (err) {
      console.error('Error fetching appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = (date = null) => {
    setSelectedAppointment(null)
    setSelectedDate(date)
    setShowForm(true)
  }

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment)
    setSelectedDate(null)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Weet je zeker dat je deze afspraak wilt verwijderen?')) return

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchAppointments()
    } catch (err) {
      console.error('Error deleting appointment:', err)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedAppointment(null)
    setSelectedDate(null)
  }

  const handleFormSuccess = () => {
    fetchAppointments()
  }

  const handleDayClick = (date) => {
    handleAddNew(date)
  }

  // Get unique categories
  const categories = [...new Set(appointments.filter(a => a.category).map(a => a.category))]

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
    const query = searchQuery.toLowerCase()
    const matchesSearch = !query ||
      apt.title.toLowerCase().includes(query) ||
      (apt.description && apt.description.toLowerCase().includes(query)) ||
      (apt.location_name && apt.location_name.toLowerCase().includes(query))

    const matchesCategory = !filterCategory || apt.category === filterCategory

    // For list view, show appointments for current month
    if (viewMode === 'list') {
      const aptDate = new Date(apt.start_date)
      const matchesMonth = aptDate.getMonth() === currentDate.getMonth() &&
                          aptDate.getFullYear() === currentDate.getFullYear()
      return matchesSearch && matchesCategory && matchesMonth
    }

    return matchesSearch && matchesCategory
  })

  // Get upcoming appointments (next 7 days)
  const upcomingAppointments = appointments.filter(apt => {
    const start = new Date(apt.start_date)
    const now = new Date()
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return start >= now && start <= weekFromNow
  }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date))

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Agenda</h2>
          <div className="flex gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Kalender
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Lijst
              </button>
            </div>
            <button
              onClick={() => handleAddNew()}
              className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors shadow-md"
            >
              + Nieuwe Afspraak
            </button>
          </div>
        </div>

        {/* Upcoming appointments banner */}
        {upcomingAppointments.length > 0 && viewMode === 'calendar' && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Aankomende afspraken (komende 7 dagen)
            </h3>
            <div className="space-y-2">
              {upcomingAppointments.slice(0, 3).map(apt => (
                <div key={apt.id} className="text-sm text-gray-700">
                  <span className="font-medium">{apt.title}</span>
                  {' - '}
                  {new Date(apt.start_date).toLocaleDateString('nl-NL', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: apt.all_day ? undefined : '2-digit',
                    minute: apt.all_day ? undefined : '2-digit'
                  })}
                </div>
              ))}
              {upcomingAppointments.length > 3 && (
                <div className="text-sm text-gray-500">
                  +{upcomingAppointments.length - 3} meer
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="space-y-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Zoek in afspraken..."
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

            {/* Clear Filters */}
            {(searchQuery || filterCategory) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilterCategory('')
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Wis filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Laden...</p>
        </div>
      ) : (
        <>
          {viewMode === 'calendar' ? (
            <CalendarView
              appointments={filteredAppointments}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onDayClick={handleDayClick}
            />
          ) : (
            <AppointmentsList
              appointments={filteredAppointments}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </>
      )}

      {/* Form Modal */}
      {showForm && (
        <AppointmentForm
          appointment={selectedAppointment}
          initialDate={selectedDate}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

export default CalendarPage
