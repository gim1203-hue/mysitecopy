// Vercel serverless function: GET /api/search?q=...
// Uses SerpApi's free tier (250 searches/month, no credit card) to
// return real Google search results — Google closed off "search the
// entire web" for new Custom Search engines in January 2026, so this
// is the closest genuinely-free, recurring alternative.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const query = req.query.q

  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'A search query ("q") is required.' })
  }

  const apiKey = process.env.SERPAPI_KEY

  if (!apiKey) {
    return res.status(500).json({
      error: 'The server is missing SERPAPI_KEY. See README.md.',
    })
  }

  const url = new URL('https://serpapi.com/search.json')
  url.searchParams.set('engine', 'google')
  url.searchParams.set('q', query)
  url.searchParams.set('api_key', apiKey)

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || 'The search service returned an error.',
      })
    }

    const results = (data.organic_results || []).map((item) => ({
      title: item.title,
      link: item.link,
      displayLink: item.displayed_link,
      snippet: item.snippet,
    }))

    return res.status(200).json({ results })
  } catch (err) {
    return res.status(500).json({ error: 'Could not reach the search service.' })
  }
}
