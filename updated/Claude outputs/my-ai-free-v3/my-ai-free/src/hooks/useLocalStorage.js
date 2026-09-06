import { useState, useEffect } from 'react'

// Persists a piece of state in the browser's own storage — free,
// no database, no server. Survives page reloads. Private to this
// browser only (won't sync between devices).
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage can fail in private-browsing modes — safe to ignore.
    }
  }, [key, value])

  return [value, setValue]
}
