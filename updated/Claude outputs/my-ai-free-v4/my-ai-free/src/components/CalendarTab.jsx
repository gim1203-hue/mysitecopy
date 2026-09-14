import { useState } from 'react'
import { toToday } from '../hooks/useCalendar'

function CalendarTab({ calendar }) {
  const { getEventsForDate, addEvent, removeEvent } = calendar
  const [selectedDate, setSelectedDate] = useState(toToday())
  const [text, setText] = useState('')

  const dayEvents = getEventsForDate(selectedDate)

  const handleAdd = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    addEvent(selectedDate, trimmed)
    setText('')
  }

  return (
    <div className="calendar-tab">
      <div className="calendar-controls">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        {selectedDate === toToday() && <span className="calendar-today-badge">Today</span>}
      </div>

      <form className="chat-form" onSubmit={handleAdd}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add something for this day..."
        />
        <button type="submit">Add</button>
      </form>

      {dayEvents.length === 0 ? (
        <p className="chat-empty">Nothing saved for this day yet.</p>
      ) : (
        <ul className="calendar-list">
          {dayEvents.map((ev) => (
            <li key={ev.id} className="calendar-item">
              <span>{ev.text}</span>
              <button type="button" onClick={() => removeEvent(selectedDate, ev.id)} aria-label="Remove">
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="calendar-note">
        Saved in this browser — it stays here for good unless you clear your browser data or
        remove it yourself. You can also say "save [something] on [a day]" in the Chat tab.
      </p>
    </div>
  )
}

export default CalendarTab
