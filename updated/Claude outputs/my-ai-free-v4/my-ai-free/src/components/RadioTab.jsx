import { useEffect, useState } from 'react'

function RadioTab({ radio }) {
  const {
    countries,
    countryName,
    stations,
    currentStation,
    stationIndex,
    isPlaying,
    isLoading,
    error,
    volume,
    setVolume,
    loadCountry,
    play,
    pause,
    next,
    prev,
    playStationAt,
  } = radio

  const [selectedCountry, setSelectedCountry] = useState('')

  useEffect(() => {
    if (countryName) setSelectedCountry(countryName)
  }, [countryName])

  const handleCountryChange = (e) => {
    const name = e.target.value
    setSelectedCountry(name)
    if (name) loadCountry(name)
  }

  return (
    <div className="radio-tab">
      <div className="radio-now-playing">
        <div className="radio-station-name">{currentStation ? currentStation.name : 'No station playing'}</div>
        <div className="radio-country-name">{countryName || 'Pick a country to start'}</div>
      </div>

      <select
        value={selectedCountry}
        onChange={handleCountryChange}
        className="radio-country-select"
        aria-label="Select a country"
      >
        <option value="">Select a country…</option>
        {countries.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name} ({c.stationcount})
          </option>
        ))}
      </select>

      {isLoading && <p className="chat-thinking">Loading stations…</p>}
      {error && <p className="chat-error">{error}</p>}

      <div className="radio-controls">
        <button type="button" onClick={prev} disabled={stations.length === 0}>⏮ Prev</button>
        <button type="button" onClick={isPlaying ? pause : play} disabled={!currentStation}>
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button type="button" onClick={next} disabled={stations.length === 0}>⏭ Next</button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="radio-volume"
          aria-label="Volume"
        />
      </div>

      {stations.length > 0 && (
        <ul className="radio-station-list">
          {stations.map((s, i) => (
            <li key={s.stationuuid || `${s.name}-${i}`}>
              <button
                type="button"
                className={i === stationIndex ? 'radio-station-item active' : 'radio-station-item'}
                onClick={() => playStationAt(i)}
              >
                {s.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="calendar-note">
        You can also say "play radio from [country]" in the Chat tab.
      </p>
    </div>
  )
}

export default RadioTab
