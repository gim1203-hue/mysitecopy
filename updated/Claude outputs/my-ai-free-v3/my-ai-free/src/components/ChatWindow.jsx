import MessageBubble from './MessageBubble'

function ChatWindow({ messages, isLoading, typingText }) {
  return (
    <div className="chat-window">
      {messages.length === 0 && typingText === null && (
        <p className="chat-empty">Say something, or type a message below, to get started.</p>
      )}
      {messages.map((m, i) => (
        <MessageBubble key={i} role={m.role} content={m.content} />
      ))}
      {typingText !== null && (
        <div className="message-bubble assistant typing">
          <span className="message-role">My AI</span>
          <p>{typingText}<span className="typing-cursor">▌</span></p>
        </div>
      )}
      {isLoading && typingText === null && <p className="chat-thinking">My AI is thinking…</p>}
    </div>
  )
}

export default ChatWindow
