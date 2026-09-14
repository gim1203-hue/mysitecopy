// Turns a handful of exact-ish spoken/typed phrasings into an action, so
// the assistant can actually DO things on the site instead of only
// talking about them. Anything that doesn't match one of these patterns
// falls straight through to normal Gemini chat — nothing is lost, it just
// won't take a direct action.
//
// Supported phrasings (case-insensitive):
//   "play radio from <country>" / "play radio <country>"
//   "weather in <place>" / "what's the weather in <place>" / "weather <place>"
//   "what day is it" / "what's today's date"
//   "what are my tasks today" / "what do I have today" / "do I have anything today"
//   "save <text> on <day>" / "save <text> for <day>"
export function interpretCommand(rawText) {
  const text = rawText.trim()
  // Apostrophes stripped for matching ("what's" -> "whats") since speech
  // recognition and typed text disagree about whether they're present.
  const lower = text.toLowerCase().replace(/[?.!]+$/, '').replace(/'/g, '')

  let m = lower.match(/^play (?:the )?radio(?: (?:from|in|for))? (.+)$/)
  if (m) return { type: 'radio', country: m[1].trim() }

  // Anchored to the start of the message on purpose — an unanchored
  // "weather...in" match would misfire on ordinary sentences that merely
  // mention weather (e.g. "I read about the weather in Texas last week").
  m =
    lower.match(
      /^(?:whats|what is|hows)?\s*(?:the\s+)?weather\s*(?:s|\s+is)?\s*(?:like\s+)?(?:in|for|at)\s+(.+)$/
    ) || lower.match(/^weather (.+)$/)
  if (m) return { type: 'weather', location: m[1].trim() }

  if (/what (day|date) is it/.test(lower) || /whats (the )?(todays )?date/.test(lower)) {
    return { type: 'today' }
  }

  if (
    /what.*(tasks?|to-?dos?|things?|schedule|plans?).*today/.test(lower) ||
    /what do i have (planned |scheduled )?today/.test(lower) ||
    /do i have (anything|any tasks?) today/.test(lower)
  ) {
    return { type: 'tasks-today' }
  }

  m = text.match(/^save (.+?) (?:on|for) (.+?)[.!?]?$/i)
  if (m) return { type: 'save-event', text: m[1].trim(), datePhrase: m[2].trim() }

  return null
}

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

function addDays(d, n) {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + n)
  return copy
}

function toDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function todayMidnight() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

// "december 5", "dec 5th", "december 5 2026" — rolls to next year when no
// year is given and the plain month/day has already passed this year.
function parseMonthDay(phrase) {
  const m = phrase.match(/^([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?$/)
  if (!m) return null

  const monthIndex = MONTHS.findIndex((name) => name === m[1] || (m[1].length >= 3 && name.startsWith(m[1])))
  const day = parseInt(m[2], 10)
  if (monthIndex === -1 || day < 1 || day > 31) return null

  const explicitYear = m[3] ? parseInt(m[3], 10) : null
  let year = explicitYear ?? new Date().getFullYear()
  let candidate = new Date(year, monthIndex, day)

  if (!explicitYear && candidate < todayMidnight()) {
    year += 1
    candidate = new Date(year, monthIndex, day)
  }
  return candidate
}

// "2026-12-25", "12/25/2026", "12/25" (rolls to next year if already passed).
function parseNumericDate(phrase) {
  let m = phrase.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (m) return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10))

  m = phrase.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/)
  if (m) {
    const month = parseInt(m[1], 10) - 1
    const day = parseInt(m[2], 10)
    const explicitYear = m[3] ? (m[3].length === 2 ? 2000 + parseInt(m[3], 10) : parseInt(m[3], 10)) : null
    let year = explicitYear ?? new Date().getFullYear()
    let candidate = new Date(year, month, day)
    if (!explicitYear && candidate < todayMidnight()) {
      candidate = new Date(year + 1, month, day)
    }
    return candidate
  }

  return null
}

// Best-effort natural-language date parsing for "save X on <this>".
// Deliberately does NOT fall back to JavaScript's own `new Date(string)`
// for bare "Month Day" text — that parser has a well-known quirk of
// defaulting missing years to 2001 for exactly this kind of input, which
// would silently save something to the wrong year. Anything not covered
// below returns null so the caller can ask the person to be more specific
// instead of guessing wrong.
export function parseDatePhrase(phraseRaw) {
  const phrase = phraseRaw.trim().toLowerCase().replace(/[.!?]+$/, '')

  if (phrase === 'today') return toDateStr(new Date())
  if (phrase === 'tomorrow') return toDateStr(addDays(new Date(), 1))

  const weekdayIndex = WEEKDAYS.findIndex(
    (d) => phrase === d || phrase === `next ${d}` || phrase === `this ${d}`
  )
  if (weekdayIndex !== -1) {
    const today = new Date()
    const currentDay = today.getDay()
    let diff = (weekdayIndex - currentDay + 7) % 7
    if (diff === 0) diff = phrase.startsWith('next') ? 7 : 0
    return toDateStr(addDays(today, diff))
  }

  const numeric = parseNumericDate(phrase)
  if (numeric && !Number.isNaN(numeric.getTime())) return toDateStr(numeric)

  const monthDay = parseMonthDay(phrase)
  if (monthDay && !Number.isNaN(monthDay.getTime())) return toDateStr(monthDay)

  return null
}
