import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function ContactForm({ contact, onClose, onSuccess }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [nickname, setNickname] = useState('')
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [phoneType, setPhoneType] = useState('mobile')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [emails, setEmails] = useState([])
  const [emailType, setEmailType] = useState('personal')
  const [email, setEmail] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('Nederland')
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [relation, setRelation] = useState('')
  const [notes, setNotes] = useState('')
  const [specialDates, setSpecialDates] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (contact) {
      setFirstName(contact.first_name || '')
      setLastName(contact.last_name || '')
      setNickname(contact.nickname || '')
      setPhoneNumbers(contact.phone_numbers || [])
      setEmails(contact.emails || [])
      setStreet(contact.street || '')
      setCity(contact.city || '')
      setPostalCode(contact.postal_code || '')
      setCountry(contact.country || 'Nederland')
      setCompany(contact.company || '')
      setJobTitle(contact.job_title || '')
      setRelation(contact.relation || '')
      setNotes(contact.notes || '')

      // Fetch special dates if editing
      fetchSpecialDates(contact.id)
    }
  }, [contact])

  const fetchSpecialDates = async (contactId) => {
    try {
      const { data, error } = await supabase
        .from('contact_special_dates')
        .select('*')
        .eq('contact_id', contactId)

      if (error) throw error
      setSpecialDates(data || [])
    } catch (err) {
      console.error('Error fetching special dates:', err)
    }
  }

  const handleAddPhone = () => {
    const trimmed = phoneNumber.trim()
    if (trimmed) {
      setPhoneNumbers([...phoneNumbers, { type: phoneType, number: trimmed }])
      setPhoneNumber('')
      setPhoneType('mobile')
    }
  }

  const handleRemovePhone = (index) => {
    setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index))
  }

  const handleAddEmail = () => {
    const trimmed = email.trim()
    if (trimmed) {
      setEmails([...emails, { type: emailType, email: trimmed }])
      setEmail('')
      setEmailType('personal')
    }
  }

  const handleRemoveEmail = (index) => {
    setEmails(emails.filter((_, i) => i !== index))
  }

  const handleAddSpecialDate = () => {
    setSpecialDates([...specialDates, {
      date_type: 'birthday',
      date_label: '',
      date: '',
      include_year: true,
      create_calendar_event: true,
      reminder_days_before: 1
    }])
  }

  const handleUpdateSpecialDate = (index, field, value) => {
    const newDates = [...specialDates]
    newDates[index] = { ...newDates[index], [field]: value }
    setSpecialDates(newDates)
  }

  const handleRemoveSpecialDate = (index) => {
    setSpecialDates(specialDates.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const contactData = {
        first_name: firstName,
        last_name: lastName || null,
        nickname: nickname || null,
        phone_numbers: phoneNumbers,
        emails: emails,
        street: street || null,
        city: city || null,
        postal_code: postalCode || null,
        country: country || null,
        company: company || null,
        job_title: jobTitle || null,
        relation: relation || null,
        notes: notes || null
      }

      let contactId
      if (contact) {
        const { error: updateError } = await supabase
          .from('contacts')
          .update(contactData)
          .eq('id', contact.id)

        if (updateError) throw updateError
        contactId = contact.id

        // Delete existing special dates
        await supabase
          .from('contact_special_dates')
          .delete()
          .eq('contact_id', contactId)
      } else {
        const { data, error: insertError } = await supabase
          .from('contacts')
          .insert([contactData])
          .select()

        if (insertError) throw insertError
        contactId = data[0].id
      }

      // Insert special dates
      const validDates = specialDates.filter(d => d.date)
      if (validDates.length > 0) {
        const datesData = validDates.map(d => ({
          contact_id: contactId,
          date_type: d.date_type,
          date_label: d.date_label || null,
          date: d.date,
          include_year: d.include_year !== false,
          create_calendar_event: d.create_calendar_event !== false,
          reminder_days_before: d.reminder_days_before || 1
        }))

        const { error: datesError } = await supabase
          .from('contact_special_dates')
          .insert(datesData)

        if (datesError) throw datesError
      }

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error saving contact:', err)
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
            {contact ? 'Contact Bewerken' : 'Nieuw Contact'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Name Section */}
          <div className="border-b pb-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Naam</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voornaam *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Achternaam
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bijnaam
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Phone Numbers */}
          <div className="border-b pb-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Telefoonnummers</h4>
            <div className="space-y-2 mb-3">
              <div className="flex gap-2">
                <select
                  value={phoneType}
                  onChange={(e) => setPhoneType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
                >
                  <option value="mobile">Mobiel</option>
                  <option value="home">Thuis</option>
                  <option value="work">Werk</option>
                  <option value="other">Overig</option>
                </select>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="06 12345678"
                />
                <button
                  type="button"
                  onClick={handleAddPhone}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            {phoneNumbers.length > 0 && (
              <div className="space-y-2">
                {phoneNumbers.map((phone, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="text-xs font-medium text-gray-600 capitalize">{phone.type}:</span>
                    <span className="flex-1 text-sm">{phone.number}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePhone(index)}
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

          {/* Emails */}
          <div className="border-b pb-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">E-mailadressen</h4>
            <div className="space-y-2 mb-3">
              <div className="flex gap-2">
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
                >
                  <option value="personal">Persoonlijk</option>
                  <option value="work">Werk</option>
                  <option value="other">Overig</option>
                </select>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="email@example.com"
                />
                <button
                  type="button"
                  onClick={handleAddEmail}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            {emails.length > 0 && (
              <div className="space-y-2">
                {emails.map((em, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="text-xs font-medium text-gray-600 capitalize">{em.type}:</span>
                    <span className="flex-1 text-sm">{em.email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(index)}
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

          {/* Address */}
          <div className="border-b pb-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Adres</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Straat
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postcode
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stad
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Land
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Professional */}
          <div className="border-b pb-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Werk</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrijf
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Functie
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Personal */}
          <div className="border-b pb-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Persoonlijk</h4>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relatie
              </label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
              >
                <option value="">Selecteer relatie...</option>
                <option value="family">Familie</option>
                <option value="friend">Vriend</option>
                <option value="colleague">Collega</option>
                <option value="other">Overig</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notities
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Extra informatie..."
              />
            </div>
          </div>

          {/* Special Dates */}
          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Bijzondere Datums</h4>
              <button
                type="button"
                onClick={handleAddSpecialDate}
                className="px-3 py-1 text-sm bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
              >
                + Toevoegen
              </button>
            </div>
            {specialDates.length > 0 && (
              <div className="space-y-4">
                {specialDates.map((sd, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={sd.date_type}
                          onChange={(e) => handleUpdateSpecialDate(index, 'date_type', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent bg-white"
                        >
                          <option value="birthday">Verjaardag</option>
                          <option value="anniversary">Jubileum</option>
                          <option value="custom">Aangepast</option>
                        </select>
                      </div>
                      {sd.date_type === 'custom' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Label
                          </label>
                          <input
                            type="text"
                            value={sd.date_label || ''}
                            onChange={(e) => handleUpdateSpecialDate(index, 'date_label', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                            placeholder="Bijv. Trouwdag"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Datum
                        </label>
                        <input
                          type="date"
                          value={sd.date || ''}
                          onChange={(e) => handleUpdateSpecialDate(index, 'date', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Herinnering (dagen van tevoren)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={sd.reminder_days_before || 1}
                          onChange={(e) => handleUpdateSpecialDate(index, 'reminder_days_before', parseInt(e.target.value))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={sd.create_calendar_event !== false}
                          onChange={(e) => handleUpdateSpecialDate(index, 'create_calendar_event', e.target.checked)}
                          className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                        />
                        <span className="text-sm text-gray-700">
                          Automatisch toevoegen aan agenda
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialDate(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Verwijderen
                      </button>
                    </div>
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
              {saving ? 'Opslaan...' : contact ? 'Bijwerken' : 'Opslaan'}
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

export default ContactForm
