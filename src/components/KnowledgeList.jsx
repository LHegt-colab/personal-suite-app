import { supabase } from '../lib/supabase'

function KnowledgeList({ articles, onEdit, onDelete, onView }) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">Nog geen kennisartikelen. Maak je eerste artikel aan!</p>
      </div>
    )
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  function getImportanceColor(importance) {
    switch (importance) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  function getImportanceLabel(importance) {
    switch (importance) {
      case 'high':
        return 'Hoog'
      case 'normal':
        return 'Normaal'
      case 'low':
        return 'Laag'
      default:
        return importance
    }
  }

  const updateLastAccessed = async (articleId) => {
    try {
      await supabase
        .from('knowledge_base')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', articleId)
    } catch (err) {
      console.error('Error updating last accessed:', err)
    }
  }

  const handleView = (article) => {
    updateLastAccessed(article.id)
    onView(article)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <div
          key={article.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-t-4 border-primary"
        >
          <div className="p-4">
            {/* Header with title and favorite */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 flex-1 line-clamp-2">
                {article.title}
              </h3>
              {article.is_favorite && (
                <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </div>

            {/* Summary */}
            {article.summary && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {article.summary}
              </p>
            )}

            {/* Category and Importance */}
            <div className="flex flex-wrap gap-2 mb-3">
              {article.category && (
                <span className="inline-block px-2 py-1 text-xs font-medium bg-primary text-white rounded">
                  {article.category}
                </span>
              )}
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getImportanceColor(article.importance)}`}>
                {getImportanceLabel(article.importance)}
              </span>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {article.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    #{tag}
                  </span>
                ))}
                {article.tags.length > 3 && (
                  <span className="inline-block px-2 py-1 text-xs text-gray-500">
                    +{article.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Source */}
            {article.source_name && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>Bron: {article.source_name}</span>
              </div>
            )}

            {/* Related Links Count */}
            {article.related_links && article.related_links.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{article.related_links.length} gerelateerde link{article.related_links.length !== 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Date info */}
            <div className="text-xs text-gray-400 mb-3">
              Aangemaakt: {formatDate(article.created_at)}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleView(article)}
                className="flex-1 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm hover:shadow-md"
              >
                Bekijken
              </button>
              <button
                onClick={() => onEdit(article)}
                className="px-3 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-dark transition-colors shadow-sm hover:shadow-md"
              >
                Bewerken
              </button>
              <button
                onClick={() => onDelete(article.id)}
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

export default KnowledgeList
