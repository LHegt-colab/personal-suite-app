import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import MeasurementForm from '../components/MeasurementForm'
import MeasurementsList from '../components/MeasurementsList'
import BloodPressureChart from '../components/BloodPressureChart'
import jsPDF from 'jspdf'

function BloodPressurePage() {
  const [measurements, setMeasurements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedMeasurement, setSelectedMeasurement] = useState(null)
  const [showChart, setShowChart] = useState(false)
  const [periodType, setPeriodType] = useState('week') // 'week', 'month', '3months', 'year', 'custom'
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  useEffect(() => {
    fetchMeasurements()
  }, [])

  const fetchMeasurements = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('blood_pressure_measurements')
        .select('*')
        .order('measurement_date', { ascending: false })

      if (error) throw error
      setMeasurements(data || [])
    } catch (err) {
      console.error('Error fetching measurements:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setSelectedMeasurement(null)
    setShowForm(true)
  }

  const handleEdit = (measurement) => {
    setSelectedMeasurement(measurement)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Weet je zeker dat je deze meting wilt verwijderen?')) return

    try {
      const { error } = await supabase
        .from('blood_pressure_measurements')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchMeasurements()
    } catch (err) {
      console.error('Error deleting measurement:', err)
    }
  }

  const getFilteredMeasurements = () => {
    const now = new Date()
    let startDate

    switch (periodType) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '3months':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      case 'custom':
        if (!customStartDate || !customEndDate) return measurements
        return measurements.filter(m => {
          const mDate = new Date(m.measurement_date)
          return mDate >= new Date(customStartDate) && mDate <= new Date(customEndDate)
        })
      default:
        return measurements
    }

    return measurements.filter(m => new Date(m.measurement_date) >= startDate)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    const filtered = getFilteredMeasurements()

    // Title
    doc.setFontSize(18)
    doc.text('Bloeddruk Rapport', 20, 20)

    // Period
    doc.setFontSize(12)
    let periodText = ''
    switch (periodType) {
      case 'week': periodText = 'Laatste week'; break
      case 'month': periodText = 'Laatste maand'; break
      case '3months': periodText = 'Laatste 3 maanden'; break
      case 'year': periodText = 'Laatste jaar'; break
      case 'custom': periodText = `${customStartDate} tot ${customEndDate}`; break
    }
    doc.text(`Periode: ${periodText}`, 20, 30)
    doc.text(`Datum rapport: ${new Date().toLocaleDateString('nl-NL')}`, 20, 36)

    // Stats
    const avg = {
      systolic: Math.round(filtered.reduce((sum, m) => sum + m.systolic, 0) / filtered.length),
      diastolic: Math.round(filtered.reduce((sum, m) => sum + m.diastolic, 0) / filtered.length),
      heartRate: Math.round(filtered.reduce((sum, m) => sum + m.heart_rate, 0) / filtered.length)
    }

    doc.text(`Gemiddelden:`, 20, 46)
    doc.text(`  Bovendruk: ${avg.systolic} mmHg`, 20, 52)
    doc.text(`  Onderdruk: ${avg.diastolic} mmHg`, 20, 58)
    doc.text(`  Hartslag: ${avg.heartRate} bpm`, 20, 64)

    // Table header
    let yPos = 80
    doc.setFontSize(10)
    doc.text('Datum', 20, yPos)
    doc.text('Tijd', 60, yPos)
    doc.text('Systolisch', 90, yPos)
    doc.text('Diastolisch', 125, yPos)
    doc.text('Hartslag', 160, yPos)

    yPos += 6

    // Table data
    filtered.forEach((m, index) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }

      const date = new Date(m.measurement_date)
      doc.text(date.toLocaleDateString('nl-NL'), 20, yPos)
      doc.text(date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }), 60, yPos)
      doc.text(m.systolic.toString(), 90, yPos)
      doc.text(m.diastolic.toString(), 125, yPos)
      doc.text(m.heart_rate.toString(), 160, yPos)

      yPos += 6
    })

    // Save
    doc.save(`bloeddruk-rapport-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  const stats = {
    total: measurements.length,
    thisWeek: measurements.filter(m =>
      new Date(m.measurement_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    avgSystolic: measurements.length > 0
      ? Math.round(measurements.reduce((sum, m) => sum + m.systolic, 0) / measurements.length)
      : 0,
    avgDiastolic: measurements.length > 0
      ? Math.round(measurements.reduce((sum, m) => sum + m.diastolic, 0) / measurements.length)
      : 0
  }

  return (
    <div>
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Bloeddruk Tracker</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowChart(!showChart)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-md"
            >
              {showChart ? 'Verberg Grafiek' : 'Toon Grafiek'}
            </button>
            <button
              onClick={handleAddNew}
              className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors shadow-md"
            >
              + Nieuwe Meting
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-gray-600">Totaal metingen</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-accent">{stats.thisWeek}</div>
            <div className="text-sm text-gray-600">Deze week</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">{stats.avgSystolic}</div>
            <div className="text-sm text-gray-600">Gem. bovendruk</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.avgDiastolic}</div>
            <div className="text-sm text-gray-600">Gem. onderdruk</div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {showChart && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Periode
                </label>
                <select
                  value={periodType}
                  onChange={(e) => setPeriodType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
                >
                  <option value="week">Laatste week</option>
                  <option value="month">Laatste maand</option>
                  <option value="3months">Laatste 3 maanden</option>
                  <option value="year">Laatste jaar</option>
                  <option value="custom">Aangepast</option>
                </select>
              </div>

              {periodType === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Van
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tot
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>
                </>
              )}

              <button
                onClick={exportToPDF}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF Downloaden
              </button>
            </div>
          </div>

          <BloodPressureChart measurements={getFilteredMeasurements()} />
        </div>
      )}

      {/* Measurements List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Laden...</p>
        </div>
      ) : (
        <MeasurementsList
          measurements={measurements}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <MeasurementForm
          measurement={selectedMeasurement}
          onClose={() => setShowForm(false)}
          onSuccess={() => { fetchMeasurements(); setShowForm(false) }}
        />
      )}
    </div>
  )
}

export default BloodPressurePage
