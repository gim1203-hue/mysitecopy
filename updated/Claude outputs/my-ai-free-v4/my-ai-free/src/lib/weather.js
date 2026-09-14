// Free, keyless weather via Open-Meteo (https://open-meteo.com).
// No signup, no API key, no rate-limit surprises — unlike most weather
// APIs, this one doesn't require an account at all.

const WEATHER_CODES = {
  0: 'clear sky',
  1: 'mostly clear',
  2: 'partly cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'depositing rime fog',
  51: 'light drizzle',
  53: 'moderate drizzle',
  55: 'dense drizzle',
  56: 'light freezing drizzle',
  57: 'dense freezing drizzle',
  61: 'slight rain',
  63: 'moderate rain',
  65: 'heavy rain',
  66: 'light freezing rain',
  67: 'heavy freezing rain',
  71: 'slight snow',
  73: 'moderate snow',
  75: 'heavy snow',
  77: 'snow grains',
  80: 'slight rain showers',
  81: 'moderate rain showers',
  82: 'violent rain showers',
  85: 'slight snow showers',
  86: 'heavy snow showers',
  95: 'thunderstorm',
  96: 'thunderstorm with slight hail',
  99: 'thunderstorm with heavy hail',
}

export async function fetchWeather(placeName) {
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(placeName)}&count=1`
  )
  if (!geoRes.ok) throw new Error('The map service is unavailable right now.')
  const geoData = await geoRes.json()
  const place = geoData.results?.[0]
  if (!place) throw new Error(`I couldn't find "${placeName}" anywhere.`)

  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`
  )
  if (!weatherRes.ok) throw new Error('The weather service is unavailable right now.')
  const weatherData = await weatherRes.json()
  const current = weatherData.current
  if (!current) throw new Error('The weather service did not return current conditions.')

  return {
    place: [place.name, place.admin1, place.country].filter(Boolean).join(', '),
    temperature: Math.round(current.temperature_2m),
    unit: 'F',
    description: WEATHER_CODES[current.weather_code] ?? 'unknown conditions',
  }
}
