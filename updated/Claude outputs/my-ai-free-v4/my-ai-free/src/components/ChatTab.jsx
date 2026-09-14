import { useState, useCallback, useRef, useEffect } from 'react'
import ChatWindow from './ChatWindow'
import VoiceButton from './VoiceButton'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useAssistantActions } from '../context/AssistantActionsContext'
import { interpretCommand, parseDatePhrase } from '../lib/commandRouter'
import { fetchWeather } from '../lib/weather'

const TYPING_MS_PER_CHUNK = 18

function ChatTab() {
  const [messages, setMessages] = useLocalStorage('my-ai-chat-history', [])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [typingText, setTypingText] = useState(null)
  const typingTimerRef = useRef(null)

  const { speak, stopSpeaking } = useSpeechSynthesis()
  const actions = useAssistantActions()

  useEffect(() => () => clearInterval(typingTimerRef.current), [])

  const revealReply = useCallback((fullText, { speakReply }) => {
    let index = 0
    setTypingText('')
    clearInterval(typingTimerRef.current)

    typingTimerRef.current = setInterval(() => {
      index += Math.max(2, Math.round(fullText.length / 60))
      setTypingText(fullText.slice(0, index))

      if (index >= fullText.length) {
        clearInterval(typingTimerRef.current)
        setMessages((prev) => [...prev, { role: 'assistant', content: fullText }])
        setTypingText(null)
        if (speakReply) speak(fullText)
      }
    }, TYPING_MS_PER_CHUNK)
  }, [setMessages, speak])

  // Runs an already-recognized command (from interpretCommand) and returns
  // the plain-text reply to show/speak back. Anything that goes wrong here
  // (a bad country name, an unparseable date) becomes a friendly sentence
  // instead of an error, since this is standing in for a real conversation.
  const runCommand = useCallback(
    async (command) => {
      switch (command.type) {
        case 'radio': {
          if (!actions?.radio) return "Radio isn't available right now."
          const result = await actions.radio.playCountry(command.country)
          return result.success
            ? `Playing ${result.stationName} from ${result.countryName}.`
            : `I couldn't find a radio station for "${command.country}" — try the Radio tab to browse countries.`
        }
        case 'weather': {
          try {
            const w = await fetchWeather(command.location)
            return `${w.place}: ${w.temperature}°${w.unit}, ${w.description}.`
          } catch (err) {
            return err.message || `I couldn't find weather for "${command.location}".`
          }
        }
        case 'today': {
          const d = new Date()
          return `Today is ${d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`
        }
        case 'tasks-today': {
          if (!actions?.calendar) return "The calendar isn't available right now."
          const events = actions.calendar.getTodayEvents()
          if (events.length === 0) return "You don't have anything saved for today."
          return `Today you have: ${events.map((e) => e.text).join(', ')}.`
        }
        case 'save-event': {
          if (!actions?.calendar) return "The calendar isn't available right now."
          const dateStr = parseDatePhrase(command.datePhrase)
          if (!dateStr) {
            return `I wasn't sure which day "${command.datePhrase}" means — try saying "today", "tomorrow", a weekday name, or a date like "December 5", or add it directly in the Calendar tab.`
          }
          actions.calendar.addEvent(dateStr, command.text)
          const friendly = new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })
          return `Saved "${command.text}" on ${friendly}.`
        }
        default:
          return null
      }
    },
    [actions]
  )

  const sendMessage = useCallback(
    async (text, { speakReply = false } = {}) => {
      const trimmed = text.trim()
      if (!trimmed) return

      setErrorMessage(null)
      const nextMessages = [...messages, { role: 'user', content: trimmed }]
      setMessages(nextMessages)
      setInput('')
      setIsLoading(true)

      try {
        const command = interpretCommand(trimmed)
        if (command) {
          const replyText = await runCommand(command)
          revealReply(replyText, { speakReply })
          return
        }

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: nextMessages }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Something went wrong talking to the AI.')
        }

        revealReply(data.reply, { speakReply })
      } catch (err) {
        setErrorMessage(err.message || 'Something went wrong.')
      } finally {
        setIsLoading(false)
      }
    },
    [messages, setMessages, revealReply, runCommand]
  )

  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition({
    onResult: (transcript) => sendMessage(transcript, { speakReply: true }),
  })

  const handleFormSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const clearHistory = () => {
    setMessages([])
    setErrorMessage(null)
  }

  return (
    <>
      <ChatWindow messages={messages} isLoading={isLoading} typingText={typingText} />

      {errorMessage && <p className="chat-error">{errorMessage}</p>}

      <form className="chat-form" onSubmit={handleFormSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message, or a command like 'weather in Tokyo'..."
        />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>

      <div className="voice-controls">
        <VoiceButton
          isListening={isListening}
          isSupported={isSupported}
          onStart={startListening}
          onStop={stopListening}
        />
        <button type="button" className="stop-speaking" onClick={stopSpeaking}>
          Stop speaking
        </button>
        {messages.length > 0 && (
          <button type="button" className="clear-history" onClick={clearHistory}>
            Clear history
          </button>
        )}
      </div>

      <p className="chat-command-hint">
        Try: "play radio from Pakistan" · "weather in Tokyo" · "what day is it" ·
        "what are my tasks today" · "save call the dentist on Friday"
      </p>
    </>
  )
}

export default ChatTab
