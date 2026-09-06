// Vercel serverless function: POST /api/chat
// Keeps the Gemini API key on the server, never sent to the browser.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages } = req.body || {}

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'A "messages" array is required.' })
  }

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return res.status(500).json({
      error: 'The server is missing GEMINI_API_KEY. Add it in your Vercel project settings (or .env.local for local dev).',
    })
  }

  // Gemini expects { role: 'user' | 'model', parts: [{ text }] }
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  try {
    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({ contents }),
      }
    )

    const data = await geminiResponse.json()

    if (!geminiResponse.ok) {
      return res.status(geminiResponse.status).json({
        error: data.error?.message || 'The AI service returned an error.',
      })
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
      || "I couldn't come up with a response for that — try rephrasing."

    return res.status(200).json({ reply })
  } catch (err) {
    return res.status(500).json({ error: 'Could not reach the AI service. Please try again.' })
  }
}
