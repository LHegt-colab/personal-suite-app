function KnowledgeView({ article, onClose, onEdit }) {
  if (!article) return null

  function formatDate(dateString) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {article.title}
              {article.is_favorite && (
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Meta Information */}
          <div className="mb-6 pb-6 border-b">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              {article.category && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="font-medium">{article.category}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Belangrijk: {getImportanceLabel(article.importance)}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(article.created_at)}</span>
              </div>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 bg-accent/20 text-primary rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          {article.summary && (
            <div className="mb-6 p-4 bg-accent/10 border-l-4 border-accent rounded">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Samenvatting</h3>
              <p className="text-gray-700">{article.summary}</p>
            </div>
          )}

          {/* Main Content */}
          <div
            className="prose prose-sm max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Source */}
          {article.source_name && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Bron</h3>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-gray-700">{article.source_name}</span>
                {article.source_url && (
                  <a
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline text-sm ml-2"
                  >
                    Bekijk bron →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Related Links */}
          {article.related_links && article.related_links.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Gerelateerde Links</h3>
              <div className="space-y-2">
                {article.related_links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span className="text-gray-700 group-hover:text-accent">{link.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => {
                onClose()
                onEdit(article)
              }}
              className="flex-1 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors shadow-md"
            >
              Bewerken
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KnowledgeView
