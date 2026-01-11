import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import RichTextEditor from './RichTextEditor'

function KnowledgeForm({ article, onClose, onSuccess }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [summary, setSummary] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [importance, setImportance] = useState('normal')
  const [isFavorite, setIsFavorite] = useState(false)
  const [sourceUrl, setSourceUrl] = useState('')
  const [sourceName, setSourceName] = useState('')
  const [relatedLinks, setRelatedLinks] = useState([])
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (article) {
      setTitle(article.title || '')
      setContent(article.content || '')
      setSummary(article.summary || '')
      setCategory(article.category || '')
      setTags(article.tags || [])
      setImportance(article.importance || 'normal')
      setIsFavorite(article.is_favorite || false)
      setSourceUrl(article.source_url || '')
      setSourceName(article.source_name || '')
      setRelatedLinks(article.related_links || [])
    }
  }, [article])

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleAddLink = () => {
    const trimmedUrl = linkUrl.trim()
    const trimmedTitle = linkTitle.trim()
    if (trimmedUrl && trimmedTitle) {
      setRelatedLinks([...relatedLinks, { url: trimmedUrl, title: trimmedTitle }])
      setLinkUrl('')
      setLinkTitle('')
    }
  }

  const handleRemoveLink = (index) => {
    setRelatedLinks(relatedLinks.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const articleData = {
        title,
        content,
        summary: summary || null,
        category: category || null,
        tags,
        importance,
        is_favorite: isFavorite,
        source_url: sourceUrl || null,
        source_name: sourceName || null,
        related_links: relatedLinks
      }

      let result
      if (article) {
        result = await supabase
          .from('knowledge_base')
          .update(articleData)
          .eq('id', article.id)
          .select()
      } else {
        result = await supabase
          .from('knowledge_base')
          .insert([articleData])
          .select()
      }

      if (result.error) throw result.error

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error saving article:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
          <h3 className="text-xl font-semibold text-gray-900">
            {article ? 'Artikel Bewerken' : 'Nieuw Artikel'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titel *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Titel van het artikel"
              required
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Samenvatting
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Korte samenvatting voor snel overzicht..."
            />
          </div>

          {/* Content with Rich Text Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inhoud *
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Schrijf hier je kennisartikel..."
            />
          </div>

          {/* Category, Importance, and Favorite */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categorie
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Bijv. Technologie"
                list="knowledge-categories"
              />
              <datalist id="knowledge-categories">
                <option value="Algemeen" />
                <option value="Technologie" />
                <option value="Gezondheid" />
                <option value="Recepten" />
                <option value="Tips & Tricks" />
                <option value="Tutorials" />
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Belangrijkheid
              </label>
              <select
                value={importance}
                onChange={(e) => setImportance(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
              >
                <option value="low">Laag</option>
                <option value="normal">Normaal</option>
                <option value="high">Hoog</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 px-4 py-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                />
                <span className="text-sm font-medium text-gray-700">
                  Favoriet
                </span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Voeg een tag toe (druk Enter)"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Toevoegen
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-accent/20 text-primary rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-primary-dark"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Source */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bron naam
              </label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Naam van de bron"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bron URL
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Related Links */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gerelateerde links
            </label>
            <div className="space-y-2 mb-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Link titel"
                />
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {relatedLinks.length > 0 && (
              <div className="space-y-2">
                {relatedLinks.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-sm text-accent hover:underline"
                    >
                      {link.title}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Opslaan...' : article ? 'Bijwerken' : 'Opslaan'}
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

export default KnowledgeForm
