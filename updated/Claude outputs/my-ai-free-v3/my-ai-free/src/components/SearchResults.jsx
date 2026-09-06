// Renders results in the familiar Google-style layout:
// blue title link, green URL, gray snippet underneath.
function SearchResults({ results }) {
  if (!results || results.length === 0) return null

  return (
    <div className="search-results">
      {results.map((r, i) => (
        <div key={i} className="search-result">
          <a href={r.link} target="_blank" rel="noreferrer" className="search-result-title">
            {r.title}
          </a>
          <div className="search-result-url">{r.displayLink || r.link}</div>
          <p className="search-result-snippet">{r.snippet}</p>
        </div>
      ))}
    </div>
  )
}

export default SearchResults
