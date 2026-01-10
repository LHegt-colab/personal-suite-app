function NotesList({ notes, onEdit, onDelete, onToggleFavorite }) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">Nog geen notities. Maak je eerste notitie aan!</p>
      </div>
    )
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  function stripHtml(html) {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  function truncate(text, maxLength = 150) {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <div
          key={note.id}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow relative group"
        >
          {/* Favorite star */}
          <button
            onClick={() => onToggleFavorite(note)}
            className="absolute top-3 right-3 text-gray-300 hover:text-yellow-500 transition-colors"
            title={note.is_favorite ? 'Favoriet verwijderen' : 'Toevoegen aan favorieten'}
          >
            <svg
              className="w-5 h-5"
              fill={note.is_favorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-8">
            {note.title}
          </h3>

          {/* Content preview */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {truncate(stripHtml(note.content))}
          </p>

          {/* Category */}
          {note.category && (
            <div className="mb-2">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-primary text-white rounded">
                {note.category}
              </span>
            </div>
          )}

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {note.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Date */}
          <div className="text-xs text-gray-500 mb-3">
            {formatDate(note.created_at)}
          </div>

          {/* Actions */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(note)}
              className="flex-1 text-accent hover:text-accent-dark text-sm font-medium py-1 px-2 border border-accent rounded hover:bg-accent/10 transition-colors"
            >
              Bewerken
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="flex-1 text-red-600 hover:text-red-800 text-sm font-medium py-1 px-2 border border-red-600 rounded hover:bg-red-50 transition-colors"
            >
              Verwijderen
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotesList
