import { useState, useCallback, useRef, useEffect } from 'react'
import ChatWindow from './ChatWindow'
import VoiceButton from './VoiceButton'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { useLocalStorage } from '../hooks/useLocalStorage'

const TYPING_MS_PER_CHUNK = 18

function ChatTab() {
  const [messages, setMessages] = useLocalStorage('my-ai-chat-history', [])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [typingText, setTypingText] = useState(null)
  const typingTimerRef = useRef(null)

  const { speak, stopSpeaking } = useSpeechSynthesis()

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
        setErrorMessage(err.message)
      } finally {
        setIsLoading(false)
      }
    },
    [messages, setMessages, revealReply]
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
          placeholder="Type your message..."
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
    </>
  )
}

export default ChatTab
