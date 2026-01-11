import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function TodoForm({ todo, onClose, onSuccess }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [reminderDate, setReminderDate] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState('daily')
  const [recurrenceInterval, setRecurrenceInterval] = useState(1)
  const [subtasks, setSubtasks] = useState([])
  const [subtaskInput, setSubtaskInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (todo) {
      setTitle(todo.title || '')
      setDescription(todo.description || '')
      setPriority(todo.priority || 'medium')
      setCategory(todo.category || '')
      setTags(todo.tags || [])
      setDueDate(todo.due_date ? new Date(todo.due_date).toISOString().slice(0, 16) : '')
      setReminderDate(todo.reminder_date ? new Date(todo.reminder_date).toISOString().slice(0, 16) : '')
      setIsRecurring(todo.is_recurring || false)
      setRecurrencePattern(todo.recurrence_pattern || 'daily')
      setRecurrenceInterval(todo.recurrence_interval || 1)
      setSubtasks(todo.subtasks || [])
    }
  }, [todo])

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

  const handleAddSubtask = () => {
    const trimmedSubtask = subtaskInput.trim()
    if (trimmedSubtask) {
      setSubtasks([...subtasks, { text: trimmedSubtask, completed: false }])
      setSubtaskInput('')
    }
  }

  const handleSubtaskInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSubtask()
    }
  }

  const handleToggleSubtask = (index) => {
    const newSubtasks = [...subtasks]
    newSubtasks[index].completed = !newSubtasks[index].completed
    setSubtasks(newSubtasks)
  }

  const handleRemoveSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const todoData = {
        title,
        description,
        priority,
        category: category || null,
        tags,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        reminder_date: reminderDate ? new Date(reminderDate).toISOString() : null,
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : null,
        recurrence_interval: isRecurring ? recurrenceInterval : null,
        subtasks
      }

      let result
      if (todo) {
        result = await supabase
          .from('todos')
          .update(todoData)
          .eq('id', todo.id)
          .select()
      } else {
        result = await supabase
          .from('todos')
          .insert([todoData])
          .select()
      }

      if (result.error) throw result.error

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error saving todo:', err)
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
            {todo ? 'Todo Bewerken' : 'Nieuwe Todo'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titel *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Wat moet er gedaan worden?"
              required
            />
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
              placeholder="Extra details..."
            />
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioriteit
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
              >
                <option value="low">Laag</option>
                <option value="medium">Gemiddeld</option>
                <option value="high">Hoog</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categorie
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Bijv. Werk, Privé..."
                list="todo-categories"
              />
              <datalist id="todo-categories">
                <option value="Werk" />
                <option value="Privé" />
                <option value="Studie" />
                <option value="Huis" />
              </datalist>
            </div>
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

          {/* Due Date and Reminder */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Herinnering
              </label>
              <input
                type="datetime-local"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
          </div>

          {/* Recurring Reminder */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
              />
              <span className="text-sm font-medium text-gray-700">
                Terugkerende herinnering
              </span>
            </label>

            {isRecurring && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patroon
                  </label>
                  <select
                    value={recurrencePattern}
                    onChange={(e) => setRecurrencePattern(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
                  >
                    <option value="daily">Dagelijks</option>
                    <option value="weekly">Wekelijks</option>
                    <option value="monthly">Maandelijks</option>
                    <option value="yearly">Jaarlijks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Elke X {recurrencePattern === 'daily' ? 'dagen' : recurrencePattern === 'weekly' ? 'weken' : recurrencePattern === 'monthly' ? 'maanden' : 'jaren'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={recurrenceInterval}
                    onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtaken
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={handleSubtaskInputKeyDown}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Voeg een subtaak toe (druk Enter)"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Toevoegen
              </button>
            </div>
            {subtasks.length > 0 && (
              <div className="space-y-2 mt-3">
                {subtasks.map((subtask, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => handleToggleSubtask(index)}
                      className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                    />
                    <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                      {subtask.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Opslaan...' : todo ? 'Bijwerken' : 'Opslaan'}
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

export default TodoForm
