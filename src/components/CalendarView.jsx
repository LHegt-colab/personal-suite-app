import { useState } from 'react'

function CalendarView({ appointments, currentDate, onDateChange, onDayClick }) {
  const [viewMode, setViewMode] = useState('month') // 'month' or 'week'

  // Get month/year info
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const today = new Date()

  // Month navigation
  const goToPreviousMonth = () => {
    const newDate = new Date(year, month - 1, 1)
    onDateChange(newDate)
  }

  const goToNextMonth = () => {
    const newDate = new Date(year, month + 1, 1)
    onDateChange(newDate)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 // Monday = 0

  // Build calendar grid
  const calendarDays = []

  // Previous month padding
  const prevMonthDays = new Date(year, month, 0).getDate()
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDays - i)
    })
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: new Date(year, month, day)
    })
  }

  // Next month padding
  const remainingDays = 42 - calendarDays.length // 6 rows of 7 days
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(year, month + 1, day)
    })
  }

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => {
      const aptStart = new Date(apt.start_date)
      const aptEnd = new Date(apt.end_date)
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)

      return (aptStart >= dateStart && aptStart <= dateEnd) ||
             (aptEnd >= dateStart && aptEnd <= dateEnd) ||
             (aptStart <= dateStart && aptEnd >= dateEnd)
    })
  }

  const isToday = (date) => {
    return date.toDateString() === today.toDateString()
  }

  const monthNames = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ]

  const dayNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Calendar Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Vandaag
            </button>
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Vorige maand"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Volgende maand"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((calDay, index) => {
            const dayAppointments = getAppointmentsForDate(calDay.date)
            const isTodayDate = isToday(calDay.date)

            return (
              <button
                key={index}
                onClick={() => onDayClick(calDay.date)}
                className={`
                  min-h-[80px] p-2 border rounded-lg text-left transition-colors
                  ${calDay.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                  ${isTodayDate ? 'border-accent border-2 bg-accent/5' : 'border-gray-200'}
                  hover:shadow-md
                `}
              >
                <div className={`text-sm font-medium mb-1 ${isTodayDate ? 'text-accent font-bold' : ''}`}>
                  {calDay.day}
                </div>

                {/* Appointments indicators */}
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map(apt => (
                    <div
                      key={apt.id}
                      className="text-xs px-1 py-0.5 rounded truncate"
                      style={{
                        backgroundColor: apt.color || '#4dd0e1',
                        color: 'white'
                      }}
                      title={apt.title}
                    >
                      {apt.title}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500 px-1">
                      +{dayAppointments.length - 3} meer
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CalendarView
