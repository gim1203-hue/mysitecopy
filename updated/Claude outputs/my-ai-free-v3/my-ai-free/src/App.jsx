import { useState } from 'react'
import './App.css'
import ChatTab from './components/ChatTab'
import SearchTab from './components/SearchTab'
import FilesTab from './components/FilesTab'
import { useLocalStorage } from './hooks/useLocalStorage'

const TABS = [
  { id: 'chat', label: '💬 Chat' },
  { id: 'search', label: '🔎 Web Search' },
  { id: 'files', label: '📁 Files' },
]

function App() {
  const [activeTab, setActiveTab] = useState('chat')
  const [darkMode, setDarkMode] = useLocalStorage('my-ai-dark-mode', false)

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <header className="app-header">
        <button
          type="button"
          className="dark-toggle"
          onClick={() => setDarkMode((d) => !d)}
          title="Toggle dark mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        <h1>My AI</h1>
        <p>Your free personal assistant — voice powered by your browser, brains powered by Gemini.</p>
      </header>

      <nav className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activeTab === 'chat' && <ChatTab />}
        {activeTab === 'search' && <SearchTab />}
        {activeTab === 'files' && <FilesTab />}
      </main>
    </div>
  )
}

export default App
