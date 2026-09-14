import { useState, useRef, useCallback, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

// Free, keyless internet radio via the Radio Browser API
// (https://www.radio-browser.info) — the same directory WorldWave uses.
// "all.api..." (rather than one hardcoded mirror like "de1.api...") is the
// load-balanced address that routes to whichever of their servers is
// actually up, so one mirror going down doesn't take Radio down with it.
// Lives once at the top of the app (in App.jsx) so playback keeps going
// no matter which tab is open, and so voice commands ("play radio from
// Pakistan") can control it from the Chat tab too.
const RADIO_API = 'https://all.api.radio-browser.info/json'

export function useRadioPlayer() {
  const [countries, setCountries] = useState([])
  const [countryName, setCountryName] = useState(null)
  const [stations, setStations] = useState([])
  const [stationIndex, setStationIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [volume, setVolume] = useLocalStorage('my-ai-radio-volume', 0.8)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = new Audio()
    audio.addEventListener('ended', () => setIsPlaying(false))
    audio.addEventListener('error', () => {
      setIsPlaying(false)
      setError('That station stopped responding — try another one.')
    })
    audioRef.current = audio
    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    fetch(`${RADIO_API}/countries`)
      .then((r) => r.json())
      .then((data) => setCountries(data.filter((c) => c.name && c.stationcount > 0)))
      .catch(() => {
        // Country list is only used for name-matching voice commands and
        // filling the dropdown — the rest of the app still works without it.
      })
  }, [])

  const playStationAt = useCallback(
    (index, stationList) => {
      const list = stationList || stations
      const station = list[index]
      if (!station || !audioRef.current) return false
      audioRef.current.src = station.url_resolved || station.url
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setError('Could not play that station — try another one.'))
      setStationIndex(index)
      setError(null)
      return true
    },
    [stations]
  )

  const loadCountry = useCallback(
    async (name) => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `${RADIO_API}/stations/bycountry/${encodeURIComponent(name)}?hidebroken=true&order=clickcount&reverse=true&limit=50`
        )
        if (!res.ok) throw new Error('Station lookup failed.')
        const data = await res.json()
        if (!data || data.length === 0) {
          setError(`No stations found for "${name}".`)
          return { success: false }
        }
        setStations(data)
        setCountryName(name)
        const ok = playStationAt(0, data)
        return { success: ok, stationName: data[0]?.name, countryName: name }
      } catch (err) {
        setError('Could not load stations for that country.')
        return { success: false }
      } finally {
        setIsLoading(false)
      }
    },
    [playStationAt]
  )

  // Voice command entry point — fuzzy-matches the spoken country name
  // against the real country list so "pakistan" hits "Pakistan".
  const playCountry = useCallback(
    async (spokenName) => {
      const clean = spokenName.trim().toLowerCase()
      let match = countries.find((c) => c.name.toLowerCase() === clean)
      if (!match) {
        match = countries.find(
          (c) => c.name.toLowerCase().includes(clean) || clean.includes(c.name.toLowerCase())
        )
      }
      return loadCountry(match ? match.name : spokenName)
    },
    [countries, loadCountry]
  )

  const play = useCallback(() => {
    if (!audioRef.current || !audioRef.current.src) return
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const next = useCallback(() => {
    if (stations.length === 0) return
    playStationAt((stationIndex + 1) % stations.length)
  }, [stations, stationIndex, playStationAt])

  const prev = useCallback(() => {
    if (stations.length === 0) return
    playStationAt((stationIndex - 1 + stations.length) % stations.length)
  }, [stations, stationIndex, playStationAt])

  return {
    countries,
    countryName,
    stations,
    stationIndex,
    currentStation: stations[stationIndex] || null,
    isPlaying,
    isLoading,
    error,
    volume,
    setVolume,
    loadCountry,
    playCountry,
    play,
    pause,
    next,
    prev,
    playStationAt,
  }
}
