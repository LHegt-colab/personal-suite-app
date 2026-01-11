import { supabase } from '../lib/supabase'

function TodoList({ todos, onEdit, onDelete, onToggleComplete }) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">Nog geen todos. Maak je eerste todo aan!</p>
      </div>
    )
  }

  function formatDate(dateString) {
    if (!dateString) return null
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  function getPriorityLabel(priority) {
    switch (priority) {
      case 'high':
        return 'Hoog'
      case 'medium':
        return 'Gemiddeld'
      case 'low':
        return 'Laag'
      default:
        return priority
    }
  }

  function isOverdue(dueDate) {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  function getRecurrenceText(todo) {
    if (!todo.is_recurring) return null
    const interval = todo.recurrence_interval > 1 ? `${todo.recurrence_interval} ` : ''
    switch (todo.recurrence_pattern) {
      case 'daily':
        return `Elke ${interval}${todo.recurrence_interval > 1 ? 'dagen' : 'dag'}`
      case 'weekly':
        return `Elke ${interval}${todo.recurrence_interval > 1 ? 'weken' : 'week'}`
      case 'monthly':
        return `Elke ${interval}${todo.recurrence_interval > 1 ? 'maanden' : 'maand'}`
      case 'yearly':
        return `Elke ${interval}${todo.recurrence_interval > 1 ? 'jaren' : 'jaar'}`
      default:
        return null
    }
  }

  const handleToggle = async (todo) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', todo.id)

      if (error) throw error
      onToggleComplete()
    } catch (err) {
      console.error('Error toggling todo:', err)
    }
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border-l-4 ${
            todo.completed
              ? 'border-green-500 bg-gray-50'
              : isOverdue(todo.due_date)
              ? 'border-red-500'
              : 'border-primary'
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo)}
              className="mt-1 w-5 h-5 text-accent border-gray-300 rounded focus:ring-accent cursor-pointer"
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title and Priority */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className={`text-lg font-semibold ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {todo.title}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(todo.priority)}`}>
                  {getPriorityLabel(todo.priority)}
                </span>
              </div>

              {/* Description */}
              {todo.description && (
                <p className={`text-sm mb-2 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                  {todo.description}
                </p>
              )}

              {/* Category and Tags */}
              <div className="flex flex-wrap gap-2 mb-2">
                {todo.category && (
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-primary text-white rounded">
                    {todo.category}
                  </span>
                )}
                {todo.tags && todo.tags.length > 0 && todo.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Subtasks Progress */}
              {todo.subtasks && todo.subtasks.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>
                      {todo.subtasks.filter(st => st.completed).length}/{todo.subtasks.length} subtaken voltooid
                    </span>
                  </div>
                </div>
              )}

              {/* Dates and Info */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                {todo.due_date && (
                  <div className={`flex items-center gap-1 ${isOverdue(todo.due_date) && !todo.completed ? 'text-red-600 font-medium' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Deadline: {formatDate(todo.due_date)}
                  </div>
                )}

                {todo.reminder_date && !todo.completed && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Herinnering: {formatDate(todo.reminder_date)}
                  </div>
                )}

                {getRecurrenceText(todo) && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {getRecurrenceText(todo)}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => onEdit(todo)}
                  className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-dark transition-colors shadow-sm hover:shadow-md"
                >
                  Bewerken
                </button>
                <button
                  onClick={() => onDelete(todo.id)}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors shadow-sm hover:shadow-md"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TodoList
