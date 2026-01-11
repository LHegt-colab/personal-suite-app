import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function MeasurementForm({ measurement, onClose, onSuccess }) {
  const [systolic, setSystolic] = useState('')
  const [diastolic, setDiastolic] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [measurementDate, setMeasurementDate] = useState('')
  const [timeOfDay, setTimeOfDay] = useState('')
  const [circumstances, setCircumstances] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (measurement) {
      setSystolic(measurement.systolic || '')
      setDiastolic(measurement.diastolic || '')
      setHeartRate(measurement.heart_rate || '')
      setMeasurementDate(measurement.measurement_date ? new Date(measurement.measurement_date).toISOString().slice(0, 16) : '')
      setTimeOfDay(measurement.time_of_day || '')
      setCircumstances(measurement.circumstances || '')
      setNotes(measurement.notes || '')
    } else {
      // Set current date/time for new measurement
      setMeasurementDate(new Date().toISOString().slice(0, 16))
      // Auto-detect time of day
      const hour = new Date().getHours()
      if (hour < 12) setTimeOfDay('morning')
      else if (hour < 17) setTimeOfDay('afternoon')
      else if (hour < 21) setTimeOfDay('evening')
      else setTimeOfDay('night')
    }
  }, [measurement])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const measurementData = {
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        heart_rate: parseInt(heartRate),
        measurement_date: new Date(measurementDate).toISOString(),
        time_of_day: timeOfDay || null,
        circumstances: circumstances || null,
        notes: notes || null
      }

      let result
      if (measurement) {
        result = await supabase
          .from('blood_pressure_measurements')
          .update(measurementData)
          .eq('id', measurement.id)
          .select()
      } else {
        result = await supabase
          .from('blood_pressure_measurements')
          .insert([measurementData])
          .select()
      }

      if (result.error) throw result.error

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error saving measurement:', err)
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
            {measurement ? 'Meting Bewerken' : 'Nieuwe Meting'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Blood Pressure Values */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bovendruk (Systolisch) *
              </label>
              <input
                type="number"
                min="50"
                max="250"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="120"
                required
              />
              <p className="text-xs text-gray-500 mt-1">mmHg</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Onderdruk (Diastolisch) *
              </label>
              <input
                type="number"
                min="30"
                max="150"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="80"
                required
              />
              <p className="text-xs text-gray-500 mt-1">mmHg</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hartslag *
              </label>
              <input
                type="number"
                min="30"
                max="200"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="70"
                required
              />
              <p className="text-xs text-gray-500 mt-1">bpm</p>
            </div>
          </div>

          {/* Date and Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Datum en tijd *
            </label>
            <input
              type="datetime-local"
              value={measurementDate}
              onChange={(e) => setMeasurementDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              required
            />
          </div>

          {/* Time of Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moment van de dag
            </label>
            <select
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
            >
              <option value="">Selecteer moment...</option>
              <option value="morning">Ochtend</option>
              <option value="afternoon">Middag</option>
              <option value="evening">Avond</option>
              <option value="night">Nacht</option>
            </select>
          </div>

          {/* Circumstances */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Omstandigheden
            </label>
            <select
              value={circumstances}
              onChange={(e) => setCircumstances(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
            >
              <option value="">Selecteer omstandigheden...</option>
              <option value="resting">Rustend</option>
              <option value="after_exercise">Na inspanning</option>
              <option value="stressed">Gestrest</option>
              <option value="after_medication">Na medicatie</option>
              <option value="other">Anders</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opmerkingen
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Eventuele extra opmerkingen..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Opslaan...' : measurement ? 'Bijwerken' : 'Opslaan'}
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

export default MeasurementForm
