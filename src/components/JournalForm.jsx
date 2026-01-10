import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import useGeolocation from '../hooks/useGeolocation'

function JournalForm({ entry, onClose, onSuccess }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const { location, loading: locationLoading, error: locationError, getLocation } = useGeolocation()

  useEffect(() => {
    if (entry) {
      setTitle(entry.title)
      setContent(entry.content)
    }
  }, [entry])

  async function handleSubmit(e) {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert('Vul zowel een titel als inhoud in.')
      return
    }

    try {
      setSaving(true)

      const entryData = {
        title: title.trim(),
        content: content.trim(),
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        location_name: location?.locationName || null,
      }

      if (entry) {
        // Update existing entry
        const { error } = await supabase
          .from('journal_entries')
          .update(entryData)
          .eq('id', entry.id)

        if (error) throw error
      } else {
        // Create new entry
        const { error } = await supabase
          .from('journal_entries')
          .insert([entryData])

        if (error) throw error
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving journal entry:', error)
      alert('Fout bij het opslaan: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {entry ? 'Dagboek Entry Bewerken' : 'Nieuwe Dagboek Entry'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Geef je dagboek entry een titel..."
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inhoud
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Schrijf hier je dagboek entry..."
                required
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Locatie
                </label>
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={locationLoading}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400"
                >
                  {locationLoading ? 'Ophalen...' : 'Huidige locatie ophalen'}
                </button>
              </div>

              {location && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        {location.locationName || 'Locatie vastgelegd'}
                      </p>
                      <p className="text-xs text-green-700">
                        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {locationError && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    {locationError}
                  </p>
                </div>
              )}

              {!location && !locationError && !locationLoading && (
                <p className="text-sm text-gray-500">
                  Klik op "Huidige locatie ophalen" om je GPS locatie toe te voegen aan deze entry.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Opslaan...' : entry ? 'Bijwerken' : 'Opslaan'}
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
    </div>
  )
}

export default JournalForm
