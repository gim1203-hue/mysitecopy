import { useState, useMemo } from 'react'
import './App.css'
import ChatTab from './components/ChatTab'
import SearchTab from './components/SearchTab'
import FilesTab from './components/FilesTab'
import CalendarTab from './components/CalendarTab'
import ProjectLinksTab from './components/ProjectLinksTab'
import WeatherTab from './components/WeatherTab'
import RadioTab from './components/RadioTab'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useCalendar } from './hooks/useCalendar'
import { useRadioPlayer } from './hooks/useRadioPlayer'
import { AssistantActionsContext } from './context/AssistantActionsContext'

const TABS = [
  { id: 'chat', label: '💬 Chat' },
  { id: 'search', label: '🔎 Web Search' },
  { id: 'weather', label: '☀️ Weather' },
  { id: 'radio', label: '📻 Radio' },
  { id: 'calendar', label: '📅 Calendar' },
  { id: 'links', label: '🔗 Project Links' },
  { id: 'files', label: '📁 Files' },
]

function App() {
  const [activeTab, setActiveTab] = useState('chat')
  const [darkMode, setDarkMode] = useLocalStorage('my-ai-dark-mode', false)

  // Both live here, at the top of the app, so they keep running (radio
  // keeps playing, the calendar stays loaded) no matter which tab is
  // open — and so the Chat tab's voice commands can reach them too.
  const calendar = useCalendar()
  const radio = useRadioPlayer()
  const assistantActions = useMemo(() => ({ calendar, radio }), [calendar, radio])

  return (
    <AssistantActionsContext.Provider value={assistantActions}>
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
          {activeTab === 'weather' && <WeatherTab />}
          {activeTab === 'radio' && <RadioTab radio={radio} />}
          {activeTab === 'calendar' && <CalendarTab calendar={calendar} />}
          {activeTab === 'links' && <ProjectLinksTab />}
          {activeTab === 'files' && <FilesTab />}
        </main>
      </div>
    </AssistantActionsContext.Provider>
  )
}

export default App
