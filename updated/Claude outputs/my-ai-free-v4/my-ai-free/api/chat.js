// Vercel serverless function: POST /api/chat
// Keeps the Gemini API key on the server, never sent to the browser.

// Gemini itself can't touch the Radio/Weather/Calendar tabs — those are
// handled by a separate, exact-phrasing command router before a message
// ever reaches this function (see src/lib/commandRouter.js). This tells
// Gemini about that split so it's honest when a request doesn't match
// one of those phrasings, instead of claiming to have done something it
// has no way to actually do.
const SYSTEM_PROMPT = `You are "My AI", a free personal assistant built into a website with several tabs: Chat, Web Search, Weather, Radio, Calendar, Project Links, and Files.

You (the chat model) cannot directly play radio stations, look up weather, or read/write the calendar yourself — those only happen when the person's message is recognized by the site's command router, BEFORE it reaches you. That router only recognizes fairly exact phrasings:
- "play radio from <country>"
- "weather in <place>"
- "what day is it" / "what's today's date"
- "what are my tasks today" / "do I have anything today"
- "save <something> on <day>"

If you are replying to a message, it means the router did NOT recognize it as one of those commands. So if someone asks you to play music, check weather, or save/recall something on the calendar, do not claim you did it — you can't. Instead, tell them the exact phrasing above that would work, in one short sentence, and/or point them to the matching tab (Radio, Weather, or Calendar). For everything else, just have a normal, helpful conversation.`

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
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        }),
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
