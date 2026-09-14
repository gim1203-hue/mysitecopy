# My AI — Free Edition (React + Web Speech API + Gemini)

A from-scratch rebuild of the "My AI" voice assistant that costs **$0** to
run. No OpenAI Realtime API, no credit balance to run out of.

## What's included

- **Chat tab:** text + voice conversation. Voice uses your browser's free
  built-in Web Speech API (speech-to-text and text-to-speech) — no API
  key needed. The "brain" is Google Gemini's free tier. Replies appear
  with a typewriter effect, and your conversation is automatically saved
  in your browser (via localStorage) so refreshing the page doesn't lose
  it. Each AI reply has a "Copy" button, and there's a "Clear history"
  button when you want a fresh start.
- **Voice/text commands:** typed or spoken, the Chat tab recognizes a
  handful of exact phrasings and actually does them instead of just
  talking about them:
  - `play radio from <country>` — plays the top station for that country
  - `weather in <place>` — looks up current conditions anywhere
  - `what day is it` / `what's today's date`
  - `what are my tasks today` / `do I have anything today`
  - `save <something> on <day>` — e.g. "save call the dentist on Friday"

  Anything phrased differently just goes to normal chat — Gemini knows
  about these commands and will tell you the right phrasing rather than
  pretending it did something it can't.
- **Weather tab:** current temperature and conditions for any place on
  Earth, powered by Open-Meteo — completely free, no API key, no signup.
- **Radio tab:** pick a country, get its stations, and play/pause/skip
  with a volume slider — the same free Radio Browser directory
  WorldWave uses. Keeps playing while you switch tabs.
- **Calendar tab:** pick a date, add notes for it, remove them later.
  Saved in your browser's storage, so it's there for good unless you
  clear your browser data — it doesn't sync across devices or browsers,
  though (see "Making it more reliable" below if you want that).
- **Project Links tab:** a holding pen for whatever websites belong to
  your current project — add them as you find them, they stay until you
  remove them.
- **Web Search tab:** real Google search results (titles, links,
  snippets) styled like an actual Google results page, powered by
  SerpApi's free tier.
- **Files tab:** pick any folder on your computer and browse/view its
  HTML, JS, CSS, JSON, Markdown, or text files — read-only, using the
  browser's own File System Access API. Nothing is uploaded anywhere;
  it all happens locally in your browser.
- **Dark mode:** toggle button (🌙/☀️) in the top right of the header,
  remembers your choice.

## 1. Get your free API keys

**Gemini (for chat):**
1. Go to https://aistudio.google.com/apikey
2. Sign in with a Google account, click "Create API key," copy it.

**SerpApi (for the Web Search tab):**
1. Go to https://serpapi.com and sign up for a free account.
2. Copy your API key from your dashboard.

Free tier: 250 searches/month, no credit card required. (Google shut
off "search the entire web" for new Custom Search engines in January
2026, which is why this app uses SerpApi instead — it returns the same
kind of real Google results.)

## 2. Add your keys locally

Copy `.env.example` to a new file named `.env.local` in this folder,
and fill in both values:

```
GEMINI_API_KEY=...
SERPAPI_KEY=...
```

## 3. Install and run locally

```
npm install
npm install -g vercel   (only needed once, ever)
vercel dev
```

Open the local URL it prints (usually http://localhost:3000) in Chrome.

If you change `.env.local` while `vercel dev` is already running, fully
stop it (Ctrl+C) and run `vercel dev` again — code changes reload
automatically, but new environment variables need a restart.

## 4. Push to GitHub

```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## 5. Deploy on Vercel

1. vercel.com → "New Project" → import your GitHub repo.
2. Leave the auto-detected Vite build settings as-is.
3. Under "Environment Variables," add both keys:
   `GEMINI_API_KEY` and `SERPAPI_KEY` (scoped to All Environments).
4. Click Deploy.

## Notes / limitations

- Voice input/output and the Files tab only work in Chrome-based
  browsers (Edge works too) — this is a browser limitation, not a bug
  in this code. Firefox/Safari don't support these APIs the same way.
- Gemini's free tier has a daily limit; SerpApi's free tier resets
  monthly (250 searches). Weather (Open-Meteo) and Radio (Radio
  Browser) are both fully free with no key and no monthly cap.
  Personal use shouldn't come close to hitting any of these.
- Chat history, the Calendar, and Project Links are all saved
  per-browser (localStorage), not in a shared database — none of them
  will follow you to a different browser or device, and clearing your
  browser's site data would clear them too.
- The voice/text commands (radio, weather, calendar) use pattern
  matching on a handful of specific phrasings, not full natural-language
  understanding — see the exact list above. If a command doesn't work,
  try it closer to that wording; anything else falls back to a normal
  chat reply.
- "Propose AI changes" (editing files with AI) from the original app
  isn't included yet — let me know if you want that added next.

## Making it more reliable / next steps

- **Cross-device calendar/links:** right now they're saved only in one
  browser. If you want your calendar or project links to follow you
  everywhere (phone, laptop, different browsers), the next step is a
  small free database — you already have a Supabase account connected,
  which has a generous free tier for exactly this. Say the word and
  I'll wire it in.
- **A second AI as backup:** if Gemini's daily free limit is ever hit,
  the Chat tab will show an error instead of silently failing. Adding
  a fallback to a second free model (so it keeps working that day) is
  a small follow-up if you want extra reliability.
- I built and reviewed this update in my own sandbox, including running
  the actual command-parsing and date logic through real test cases (not
  just reading the code) — but my sandbox doesn't have general internet
  access, so I could not run `npm install`/`vite build` or make live
  calls to the Weather/Radio APIs from here. Please do the normal
  `npm install` then `vercel dev` check locally before deploying, the
  same way you did for the last update — that's the real test.
