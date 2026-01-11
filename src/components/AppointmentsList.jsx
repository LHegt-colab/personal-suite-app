function AppointmentsList({ appointments, onEdit, onDelete }) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">Geen afspraken gevonden.</p>
      </div>
    )
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  function formatTime(dateString) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('nl-NL', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  function getRecurrenceText(apt) {
    if (!apt.is_recurring) return null
    const interval = apt.recurrence_interval > 1 ? `${apt.recurrence_interval} ` : ''
    switch (apt.recurrence_pattern) {
      case 'daily':
        return `Elke ${interval}${apt.recurrence_interval > 1 ? 'dagen' : 'dag'}`
      case 'weekly':
        return `Elke ${interval}${apt.recurrence_interval > 1 ? 'weken' : 'week'}`
      case 'monthly':
        return `Elke ${interval}${apt.recurrence_interval > 1 ? 'maanden' : 'maand'}`
      case 'yearly':
        return `Elke ${interval}${apt.recurrence_interval > 1 ? 'jaren' : 'jaar'}`
      default:
        return null
    }
  }

  function getReminderText(minutes) {
    if (!minutes || minutes === 0) return null
    if (minutes < 60) return `${minutes} minuten van tevoren`
    if (minutes < 1440) return `${Math.floor(minutes / 60)} uur van tevoren`
    if (minutes < 10080) return `${Math.floor(minutes / 1440)} dag${minutes >= 2880 ? 'en' : ''} van tevoren`
    return `${Math.floor(minutes / 10080)} week van tevoren`
  }

  function isPast(dateString) {
    return new Date(dateString) < new Date()
  }

  // Group appointments by date
  const groupedAppointments = appointments.reduce((groups, apt) => {
    const dateKey = new Date(apt.start_date).toDateString()
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(apt)
    return groups
  }, {})

  // Sort dates
  const sortedDates = Object.keys(groupedAppointments).sort((a, b) =>
    new Date(a) - new Date(b)
  )

  return (
    <div className="space-y-6">
      {sortedDates.map(dateKey => (
        <div key={dateKey}>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 sticky top-0 bg-gray-50 py-2 z-10">
            {formatDate(dateKey)}
          </h3>
          <div className="space-y-3">
            {groupedAppointments[dateKey]
              .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
              .map(apt => (
                <div
                  key={apt.id}
                  className={`bg-white rounded-lg shadow-md p-4 border-l-4 hover:shadow-lg transition-shadow ${
                    isPast(apt.end_date) ? 'opacity-60' : ''
                  }`}
                  style={{ borderLeftColor: apt.color || '#4dd0e1' }}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Time indicator */}
                    <div className="flex-shrink-0 w-20 text-center">
                      {apt.all_day ? (
                        <div className="text-sm font-medium text-gray-600">Hele dag</div>
                      ) : (
                        <>
                          <div className="text-sm font-medium text-gray-900">
                            {formatTime(apt.start_date)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTime(apt.end_date)}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        {apt.title}
                      </h4>

                      {apt.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {apt.description}
                        </p>
                      )}

                      {/* Meta info */}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                        {apt.location_name && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {apt.location_name}
                          </div>
                        )}

                        {apt.category && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {apt.category}
                          </div>
                        )}

                        {getReminderText(apt.reminder_minutes) && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {getReminderText(apt.reminder_minutes)}
                          </div>
                        )}

                        {getRecurrenceText(apt) && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {getRecurrenceText(apt)}
                          </div>
                        )}
                      </div>

                      {/* Participants */}
                      {apt.participants && apt.participants.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {apt.participants.map((participant, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {participant}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => onEdit(apt)}
                          className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-dark transition-colors shadow-sm hover:shadow-md"
                        >
                          Bewerken
                        </button>
                        <button
                          onClick={() => onDelete(apt.id)}
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
        </div>
      ))}
    </div>
  )
}

export default AppointmentsList
