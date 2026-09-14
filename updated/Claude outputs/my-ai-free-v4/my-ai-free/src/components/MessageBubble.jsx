import { useState } from 'react'

function MessageBubble({ role, content }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can be blocked — fail silently.
    }
  }

  return (
    <div className={`message-bubble ${role}`}>
      <span className="message-role">{role === 'user' ? 'You' : 'My AI'}</span>
      <p>{content}</p>
      {role === 'assistant' && (
        <button type="button" className="copy-button" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      )}
    </div>
  )
}

export default MessageBubble
