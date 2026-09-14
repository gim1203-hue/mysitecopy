import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

function hostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function normalizeUrl(url) {
  const trimmed = url.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

// A holding pen for whatever websites belong to the project you're
// currently working on — add them as you find them, they stay here
// (saved in this browser) until you remove them yourself.
function ProjectLinksTab() {
  const [links, setLinks] = useLocalStorage('my-ai-project-links', [])
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')

  const addLink = (e) => {
    e.preventDefault()
    const normalized = normalizeUrl(url)
    if (!normalized) return
    setLinks((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url: normalized,
        title: title.trim() || hostname(normalized),
      },
    ])
    setUrl('')
    setTitle('')
  }

  const removeLink = (id) => setLinks((prev) => prev.filter((l) => l.id !== id))

  return (
    <div className="links-tab">
      <form className="links-form" onSubmit={addLink}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a website link..."
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Label (optional)"
        />
        <button type="submit">Add</button>
      </form>

      {links.length === 0 ? (
        <p className="chat-empty">
          Nothing saved yet — add links for whatever you're working on right now. They'll stay
          here until you remove them.
        </p>
      ) : (
        <ul className="links-list">
          {links.map((l) => (
            <li key={l.id} className="links-item">
              <a href={l.url} target="_blank" rel="noopener noreferrer">
                {l.title}
              </a>
              <span className="links-domain">{hostname(l.url)}</span>
              <button type="button" onClick={() => removeLink(l.id)} aria-label="Remove">
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ProjectLinksTab
