function JournalList({ entries, onEdit, onDelete }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">Nog geen dagboek entries. Maak je eerste entry aan!</p>
      </div>
    )
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{entry.title}</h3>
            <div className="flex gap-3">
              <button
                onClick={() => onEdit(entry)}
                className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-dark transition-colors shadow-sm hover:shadow-md"
              >
                Bewerken
              </button>
              <button
                onClick={() => onDelete(entry.id)}
                className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors shadow-sm hover:shadow-md"
              >
                Verwijderen
              </button>
            </div>
          </div>

          <p className="text-gray-700 mb-3 whitespace-pre-wrap">{entry.content}</p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(entry.created_at)}
            </div>

            {entry.location_name && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {entry.location_name}
              </div>
            )}
          </div>

          {entry.updated_at !== entry.created_at && (
            <div className="mt-2 text-xs text-gray-400">
              Laatst bewerkt: {formatDate(entry.updated_at)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default JournalList
