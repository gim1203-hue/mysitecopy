import { useState } from 'react'
import SearchResults from './SearchResults'

function SearchTab() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [searchedFor, setSearchedFor] = useState(null)

  const runSearch = async (e) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    setIsLoading(true)
    setErrorMessage(null)
    setResults([])

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed.')
      }

      setResults(data.results || [])
      setSearchedFor(trimmed)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="search-tab">
      <form className="chat-form" onSubmit={runSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the web..."
        />
        <button type="submit" disabled={isLoading}>Search</button>
      </form>

      {errorMessage && <p className="chat-error">{errorMessage}</p>}
      {isLoading && <p className="chat-thinking">Searching…</p>}

      {!isLoading && searchedFor && results.length === 0 && !errorMessage && (
        <p className="chat-empty">No results found for "{searchedFor}".</p>
      )}

      <SearchResults results={results} />
    </div>
  )
}

export default SearchTab
