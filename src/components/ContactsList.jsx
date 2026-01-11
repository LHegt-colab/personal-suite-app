function ContactsList({ contacts, onEdit, onDelete }) {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">Nog geen contacten. Voeg je eerste contact toe!</p>
      </div>
    )
  }

  const getInitials = (contact) => {
    const first = contact.first_name?.[0] || ''
    const last = contact.last_name?.[0] || ''
    return (first + last).toUpperCase() || '?'
  }

  const getRelationColor = (relation) => {
    switch (relation) {
      case 'family':
        return 'bg-red-100 text-red-800'
      case 'friend':
        return 'bg-green-100 text-green-800'
      case 'colleague':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRelationLabel = (relation) => {
    switch (relation) {
      case 'family':
        return 'Familie'
      case 'friend':
        return 'Vriend'
      case 'colleague':
        return 'Collega'
      case 'other':
        return 'Overig'
      default:
        return relation
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-t-4 border-primary p-4"
        >
          {/* Header with Initials/Photo and Name */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
              {getInitials(contact)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {contact.first_name} {contact.last_name}
              </h3>
              {contact.nickname && (
                <p className="text-sm text-gray-500 italic">"{contact.nickname}"</p>
              )}
              {contact.relation && (
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded mt-1 ${getRelationColor(contact.relation)}`}>
                  {getRelationLabel(contact.relation)}
                </span>
              )}
            </div>
          </div>

          {/* Company/Job */}
          {(contact.company || contact.job_title) && (
            <div className="mb-3 pb-3 border-b">
              {contact.company && (
                <p className="text-sm text-gray-700 font-medium">{contact.company}</p>
              )}
              {contact.job_title && (
                <p className="text-sm text-gray-600">{contact.job_title}</p>
              )}
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-2 mb-3">
            {contact.phone_numbers && contact.phone_numbers.length > 0 && (
              <div>
                {contact.phone_numbers.slice(0, 2).map((phone, index) => (
                  <a
                    key={index}
                    href={`tel:${phone.number}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-accent"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="capitalize text-xs text-gray-500">{phone.type}:</span>
                    <span>{phone.number}</span>
                  </a>
                ))}
              </div>
            )}

            {contact.emails && contact.emails.length > 0 && (
              <div>
                {contact.emails.slice(0, 1).map((email, index) => (
                  <a
                    key={index}
                    href={`mailto:${email.email}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-accent truncate"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{email.email}</span>
                  </a>
                ))}
              </div>
            )}

            {contact.city && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{contact.city}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t">
            <button
              onClick={() => onEdit(contact)}
              className="flex-1 px-3 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-dark transition-colors shadow-sm hover:shadow-md"
            >
              Bewerken
            </button>
            <button
              onClick={() => onDelete(contact.id)}
              className="px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ContactsList
