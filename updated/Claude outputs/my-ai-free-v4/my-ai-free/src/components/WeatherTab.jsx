import { useState } from 'react'
import { fetchWeather } from '../lib/weather'

function WeatherTab() {
  const [place, setPlace] = useState('')
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const runSearch = async (e) => {
    e.preventDefault()
    const trimmed = place.trim()
    if (!trimmed) return

    setIsLoading(true)
    setErrorMessage(null)
    setResult(null)

    try {
      const data = await fetchWeather(trimmed)
      setResult(data)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="weather-tab">
      <form className="chat-form" onSubmit={runSearch}>
        <input
          type="text"
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="Any city, anywhere in the world..."
        />
        <button type="submit" disabled={isLoading}>Check</button>
      </form>

      {isLoading && <p className="chat-thinking">Checking the sky…</p>}
      {errorMessage && <p className="chat-error">{errorMessage}</p>}

      {result && (
        <div className="weather-result">
          <div className="weather-temp">{result.temperature}°{result.unit}</div>
          <div className="weather-place">{result.place}</div>
          <div className="weather-desc">{result.description}</div>
        </div>
      )}

      {!result && !isLoading && !errorMessage && (
        <p className="chat-empty">
          Try any place name — "Tokyo", "Lahore", "small town, state" all work. You can also just
          say "weather in [place]" in the Chat tab.
        </p>
      )}
    </div>
  )
}

export default WeatherTab
