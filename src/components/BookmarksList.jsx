import { supabase } from '../lib/supabase'

function BookmarksList({ bookmarks, onEdit, onDelete, onVisit }) {
  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">Nog geen bookmarks. Voeg je eerste favoriete website toe!</p>
      </div>
    )
  }

  function formatDate(dateString) {
    if (!dateString) return 'Nooit bezocht'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  const handleVisit = async (bookmark) => {
    // Update visit count and last visited
    try {
      await supabase
        .from('bookmarks')
        .update({
          visit_count: (bookmark.visit_count || 0) + 1,
          last_visited_at: new Date().toISOString()
        })
        .eq('id', bookmark.id)

      onVisit()
    } catch (err) {
      console.error('Error updating visit count:', err)
    }

    // Open URL in new tab
    window.open(bookmark.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-t-4 border-primary"
        >
          <div className="p-4">
            {/* Header with Favicon and Name */}
            <div className="flex items-start gap-3 mb-3">
              {bookmark.favicon_url ? (
                <img
                  src={bookmark.favicon_url}
                  alt=""
                  className="w-8 h-8 rounded flex-shrink-0"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {bookmark.name}
                </h3>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline truncate block"
                  onClick={(e) => {
                    e.preventDefault()
                    handleVisit(bookmark)
                  }}
                >
                  {bookmark.url}
                </a>
              </div>
            </div>

            {/* Rating */}
            {bookmark.rating > 0 && (
              <div className="mb-3">
                {renderStars(bookmark.rating)}
              </div>
            )}

            {/* Description */}
            {bookmark.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {bookmark.description}
              </p>
            )}

            {/* Category */}
            {bookmark.category && (
              <div className="mb-3">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-primary text-white rounded">
                  {bookmark.category}
                </span>
              </div>
            )}

            {/* Tags */}
            {bookmark.tags && bookmark.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {bookmark.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    #{tag}
                  </span>
                ))}
                {bookmark.tags.length > 3 && (
                  <span className="inline-block px-2 py-1 text-xs text-gray-500">
                    +{bookmark.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Visit Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 pb-3 border-b">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{bookmark.visit_count || 0} bezoeken</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatDate(bookmark.last_visited_at)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleVisit(bookmark)}
                className="flex-1 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm hover:shadow-md"
              >
                Bezoeken
              </button>
              <button
                onClick={() => onEdit(bookmark)}
                className="px-3 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-dark transition-colors shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(bookmark.id)}
                className="px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default BookmarksList
