import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import TodoForm from '../components/TodoForm'
import TodoList from '../components/TodoList'

function TodoPage() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, active, completed
  const [notificationPermission, setNotificationPermission] = useState('default')

  useEffect(() => {
    fetchTodos()
    checkNotificationPermission()
    // Check for reminders every minute
    const interval = setInterval(checkReminders, 60000)
    return () => clearInterval(interval)
  }, [])

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
    }
  }

  const checkReminders = async () => {
    if (Notification.permission !== 'granted') return

    try {
      const now = new Date()
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000)

      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('completed', false)
        .not('reminder_date', 'is', null)
        .gte('reminder_date', now.toISOString())
        .lte('reminder_date', fiveMinutesFromNow.toISOString())

      if (error) throw error

      data.forEach(todo => {
        new Notification('Todo Herinnering', {
          body: `${todo.title}${todo.due_date ? `\nDeadline: ${new Date(todo.due_date).toLocaleString('nl-NL')}` : ''}`,
          icon: '/favicon.ico',
          tag: `todo-${todo.id}`
        })
      })
    } catch (err) {
      console.error('Error checking reminders:', err)
    }
  }

  const fetchTodos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTodos(data || [])
    } catch (err) {
      console.error('Error fetching todos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setSelectedTodo(null)
    setShowForm(true)
  }

  const handleEdit = (todo) => {
    setSelectedTodo(todo)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Weet je zeker dat je deze todo wilt verwijderen?')) return

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchTodos()
    } catch (err) {
      console.error('Error deleting todo:', err)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedTodo(null)
  }

  const handleFormSuccess = () => {
    fetchTodos()
  }

  // Get unique categories
  const categories = [...new Set(todos.filter(t => t.category).map(t => t.category))]

  // Filter todos
  const filteredTodos = todos.filter(todo => {
    const query = searchQuery.toLowerCase()
    const matchesSearch = !query ||
      todo.title.toLowerCase().includes(query) ||
      (todo.description && todo.description.toLowerCase().includes(query)) ||
      (todo.category && todo.category.toLowerCase().includes(query))

    const matchesPriority = !filterPriority || todo.priority === filterPriority
    const matchesCategory = !filterCategory || todo.category === filterCategory
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && !todo.completed) ||
      (filterStatus === 'completed' && todo.completed)

    return matchesSearch && matchesPriority && matchesCategory && matchesStatus
  })

  // Sort by priority and due date
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    // Completed todos go to bottom
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff

    // Sort by due date
    if (a.due_date && b.due_date) {
      return new Date(a.due_date) - new Date(b.due_date)
    }
    if (a.due_date) return -1
    if (b.due_date) return 1

    return 0
  })

  // Stats
  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
    overdue: todos.filter(t => !t.completed && t.due_date && new Date(t.due_date) < new Date()).length
  }

  return (
    <div>
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Mijn Todo's</h2>
          <button
            onClick={handleAddNew}
            className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors shadow-md"
          >
            + Nieuwe Todo
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-gray-600">Totaal</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-accent">{stats.active}</div>
            <div className="text-sm text-gray-600">Actief</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Voltooid</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-gray-600">Verlopen</div>
          </div>
        </div>

        {/* Notification Permission */}
        {notificationPermission === 'default' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="text-sm text-gray-700">
                  Sta browser notificaties toe om herinneringen te ontvangen
                </span>
              </div>
              <button
                onClick={requestNotificationPermission}
                className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Toestaan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Zoek in todos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
        />

        {/* Filter Row */}
        <div className="flex flex-wrap gap-3">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
          >
            <option value="all">Alle statussen</option>
            <option value="active">Actief</option>
            <option value="completed">Voltooid</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
          >
            <option value="">Alle prioriteiten</option>
            <option value="high">Hoog</option>
            <option value="medium">Gemiddeld</option>
            <option value="low">Laag</option>
          </select>

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
          {(searchQuery || filterPriority || filterCategory || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setFilterPriority('')
                setFilterCategory('')
                setFilterStatus('all')
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Wis filters
            </button>
          )}
        </div>
      </div>

      {/* Todo List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Laden...</p>
        </div>
      ) : (
        <TodoList
          todos={sortedTodos}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleComplete={fetchTodos}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <TodoForm
          todo={selectedTodo}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

export default TodoPage
