function MeasurementsList({ measurements, onEdit, onDelete }) {
  if (measurements.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">Nog geen metingen. Voeg je eerste meting toe!</p>
      </div>
    )
  }

  const getStatusColor = (systolic, diastolic) => {
    if (systolic >= 180 || diastolic >= 120) {
      return 'bg-red-100 border-red-500 text-red-900'
    } else if (systolic >= 140 || diastolic >= 90) {
      return 'bg-orange-100 border-orange-500 text-orange-900'
    } else if (systolic >= 130 || diastolic >= 80) {
      return 'bg-yellow-100 border-yellow-500 text-yellow-900'
    } else if (systolic >= 90 && systolic < 120 && diastolic >= 60 && diastolic < 80) {
      return 'bg-green-100 border-green-500 text-green-900'
    } else {
      return 'bg-blue-100 border-blue-500 text-blue-900'
    }
  }

  const getStatusLabel = (systolic, diastolic) => {
    if (systolic >= 180 || diastolic >= 120) {
      return 'Kritiek Hoog'
    } else if (systolic >= 140 || diastolic >= 90) {
      return 'Hoog'
    } else if (systolic >= 130 || diastolic >= 80) {
      return 'Verhoogd'
    } else if (systolic >= 90 && systolic < 120 && diastolic >= 60 && diastolic < 80) {
      return 'Normaal'
    } else {
      return 'Laag'
    }
  }

  const getHeartRateColor = (heartRate) => {
    if (heartRate > 100) return 'text-red-600'
    if (heartRate < 60) return 'text-blue-600'
    return 'text-green-600'
  }

  const getTimeOfDayLabel = (timeOfDay) => {
    switch (timeOfDay) {
      case 'morning': return 'Ochtend'
      case 'afternoon': return 'Middag'
      case 'evening': return 'Avond'
      case 'night': return 'Nacht'
      default: return timeOfDay
    }
  }

  const getCircumstancesLabel = (circumstances) => {
    switch (circumstances) {
      case 'resting': return 'Rustend'
      case 'after_exercise': return 'Na inspanning'
      case 'stressed': return 'Gestrest'
      case 'after_medication': return 'Na medicatie'
      case 'other': return 'Anders'
      default: return circumstances
    }
  }

  function formatDateTime(dateString) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('nl-NL', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="space-y-3">
      {measurements.map((measurement) => (
        <div
          key={measurement.id}
          className={`rounded-lg shadow-md p-4 border-l-4 ${getStatusColor(measurement.systolic, measurement.diastolic)}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold">
                  {measurement.systolic}/{measurement.diastolic} mmHg
                </h3>
                <span className={`text-2xl font-bold ${getHeartRateColor(measurement.heart_rate)}`}>
                  ♥ {measurement.heart_rate}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {formatDateTime(measurement.measurement_date)}
              </p>
            </div>
            <span className="px-3 py-1 text-sm font-semibold rounded">
              {getStatusLabel(measurement.systolic, measurement.diastolic)}
            </span>
          </div>

          {/* Details */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-3">
            {measurement.time_of_day && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {getTimeOfDayLabel(measurement.time_of_day)}
              </div>
            )}

            {measurement.circumstances && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {getCircumstancesLabel(measurement.circumstances)}
              </div>
            )}
          </div>

          {/* Notes */}
          {measurement.notes && (
            <p className="text-sm text-gray-600 mb-3 p-2 bg-white bg-opacity-50 rounded">
              {measurement.notes}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => onEdit(measurement)}
              className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-dark transition-colors shadow-sm hover:shadow-md"
            >
              Bewerken
            </button>
            <button
              onClick={() => onDelete(measurement.id)}
              className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors shadow-sm hover:shadow-md"
            >
              Verwijderen
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MeasurementsList
