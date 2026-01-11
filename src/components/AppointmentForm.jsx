import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function AppointmentForm({ appointment, onClose, onSuccess, initialDate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [allDay, setAllDay] = useState(false)
  const [locationName, setLocationName] = useState('')
  const [locationAddress, setLocationAddress] = useState('')
  const [category, setCategory] = useState('')
  const [color, setColor] = useState('#4dd0e1')
  const [participants, setParticipants] = useState([])
  const [participantInput, setParticipantInput] = useState('')
  const [reminderMinutes, setReminderMinutes] = useState(15)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState('weekly')
  const [recurrenceInterval, setRecurrenceInterval] = useState(1)
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (appointment) {
      setTitle(appointment.title || '')
      setDescription(appointment.description || '')
      setStartDate(appointment.start_date ? new Date(appointment.start_date).toISOString().slice(0, 16) : '')
      setEndDate(appointment.end_date ? new Date(appointment.end_date).toISOString().slice(0, 16) : '')
      setAllDay(appointment.all_day || false)
      setLocationName(appointment.location_name || '')
      setLocationAddress(appointment.location_address || '')
      setCategory(appointment.category || '')
      setColor(appointment.color || '#4dd0e1')
      setParticipants(appointment.participants || [])
      setReminderMinutes(appointment.reminder_minutes || 15)
      setIsRecurring(appointment.is_recurring || false)
      setRecurrencePattern(appointment.recurrence_pattern || 'weekly')
      setRecurrenceInterval(appointment.recurrence_interval || 1)
      setRecurrenceEndDate(appointment.recurrence_end_date ? new Date(appointment.recurrence_end_date).toISOString().slice(0, 10) : '')
      setNotes(appointment.notes || '')
    } else if (initialDate) {
      // Set initial date if creating new appointment from calendar
      const start = new Date(initialDate)
      start.setHours(9, 0, 0, 0)
      const end = new Date(initialDate)
      end.setHours(10, 0, 0, 0)
      setStartDate(start.toISOString().slice(0, 16))
      setEndDate(end.toISOString().slice(0, 16))
    }
  }, [appointment, initialDate])

  const handleAddParticipant = () => {
    const trimmed = participantInput.trim()
    if (trimmed && !participants.includes(trimmed)) {
      setParticipants([...participants, trimmed])
      setParticipantInput('')
    }
  }

  const handleRemoveParticipant = (participant) => {
    setParticipants(participants.filter(p => p !== participant))
  }

  const handleParticipantKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddParticipant()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const appointmentData = {
        title,
        description: description || null,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        all_day: allDay,
        location_name: locationName || null,
        location_address: locationAddress || null,
        category: category || null,
        color: color,
        participants,
        reminder_minutes: reminderMinutes,
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : null,
        recurrence_interval: isRecurring ? recurrenceInterval : null,
        recurrence_end_date: isRecurring && recurrenceEndDate ? new Date(recurrenceEndDate).toISOString() : null,
        notes: notes || null
      }

      let result
      if (appointment) {
        result = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', appointment.id)
          .select()
      } else {
        result = await supabase
          .from('appointments')
          .insert([appointmentData])
          .select()
      }

      if (result.error) throw result.error

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error saving appointment:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const colorOptions = [
    { value: '#4dd0e1', label: 'Cyan' },
    { value: '#1a5f5f', label: 'Teal' },
    { value: '#f44336', label: 'Rood' },
    { value: '#4caf50', label: 'Groen' },
    { value: '#ff9800', label: 'Oranje' },
    { value: '#9c27b0', label: 'Paars' },
    { value: '#2196f3', label: 'Blauw' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {appointment ? 'Afspraak Bewerken' : 'Nieuwe Afspraak'}
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
              placeholder="Titel van de afspraak"
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
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Extra details..."
            />
          </div>

          {/* All Day Checkbox */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
              />
              <span className="text-sm font-medium text-gray-700">
                Hele dag evenement
              </span>
            </label>
          </div>

          {/* Start and End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start {!allDay && 'tijd'} *
              </label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? startDate.slice(0, 10) : startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  // Auto-set end date to 1 hour later if not set
                  if (!endDate && !allDay) {
                    const start = new Date(e.target.value)
                    start.setHours(start.getHours() + 1)
                    setEndDate(start.toISOString().slice(0, 16))
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Eind {!allDay && 'tijd'} *
              </label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? endDate.slice(0, 10) : endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Locatie
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Naam van de locatie"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adres
              </label>
              <input
                type="text"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Adres"
              />
            </div>
          </div>

          {/* Category and Color */}
          <div className="grid grid-cols-2 gap-4">
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
                list="appointment-categories"
              />
              <datalist id="appointment-categories">
                <option value="Werk" />
                <option value="Privé" />
                <option value="Familie" />
                <option value="Sport" />
                <option value="Dokter" />
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kleur
              </label>
              <div className="flex gap-2">
                {colorOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setColor(option.value)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      color === option.value ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: option.value }}
                    title={option.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deelnemers
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={participantInput}
                onChange={(e) => setParticipantInput(e.target.value)}
                onKeyDown={handleParticipantKeyDown}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Voeg deelnemer toe (druk Enter)"
              />
              <button
                type="button"
                onClick={handleAddParticipant}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Toevoegen
              </button>
            </div>
            {participants.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {participants.map((participant, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-accent/20 text-primary rounded-full text-sm"
                  >
                    {participant}
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(participant)}
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

          {/* Reminder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Herinnering
            </label>
            <select
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
            >
              <option value={0}>Geen herinnering</option>
              <option value={5}>5 minuten van tevoren</option>
              <option value={15}>15 minuten van tevoren</option>
              <option value={30}>30 minuten van tevoren</option>
              <option value={60}>1 uur van tevoren</option>
              <option value={1440}>1 dag van tevoren</option>
              <option value={10080}>1 week van tevoren</option>
            </select>
          </div>

          {/* Recurring */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
              />
              <span className="text-sm font-medium text-gray-700">
                Terugkerende afspraak
              </span>
            </label>

            {isRecurring && (
              <div className="space-y-3">
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
                      Interval
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Einddatum (optioneel)
                  </label>
                  <input
                    type="date"
                    value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notities
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Extra notities..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Opslaan...' : appointment ? 'Bijwerken' : 'Opslaan'}
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

export default AppointmentForm
