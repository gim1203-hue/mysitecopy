import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

// YYYY-MM-DD for today, in the browser's own local timezone.
export function toToday() {
  const d = new Date()
  return toDateStr(d)
}

export function toDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// A calendar that "saves forever": entries live in this browser's
// localStorage, keyed by date, and are never cleared automatically.
// (They stay only in this browser — clearing browsing data would remove
// them, and they won't follow you to a different device.)
export function useCalendar() {
  const [events, setEvents] = useLocalStorage('my-ai-calendar', {})

  const addEvent = useCallback(
    (dateStr, text) => {
      setEvents((prev) => {
        const dayList = prev[dateStr] || []
        return {
          ...prev,
          [dateStr]: [
            ...dayList,
            { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text },
          ],
        }
      })
    },
    [setEvents]
  )

  const removeEvent = useCallback(
    (dateStr, id) => {
      setEvents((prev) => {
        const dayList = prev[dateStr] || []
        return { ...prev, [dateStr]: dayList.filter((e) => e.id !== id) }
      })
    },
    [setEvents]
  )

  const getEventsForDate = useCallback((dateStr) => events[dateStr] || [], [events])
  const getTodayEvents = useCallback(() => events[toToday()] || [], [events])

  return { events, addEvent, removeEvent, getEventsForDate, getTodayEvents }
}
