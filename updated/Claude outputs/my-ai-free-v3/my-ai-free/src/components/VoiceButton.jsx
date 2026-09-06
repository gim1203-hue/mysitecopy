function VoiceButton({ isListening, isSupported, onStart, onStop }) {
  if (!isSupported) {
    return (
      <button className="voice-button unsupported" disabled title="Voice input isn't supported in this browser — try Chrome or Edge.">
        Mic unavailable in this browser
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`voice-button ${isListening ? 'listening' : ''}`}
      onClick={isListening ? onStop : onStart}
    >
      {isListening ? '● Listening… (click to stop)' : '🎤 Start voice'}
    </button>
  )
}

export default VoiceButton
