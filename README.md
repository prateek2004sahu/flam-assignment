# Study Assistant

A small React app that turns your notes or a topic into flashcards. You paste some
text, the app asks an AI model for flashcards, and then you flip through them and
mark each one as "Got it" or "Missed it". At the end you can re-test only the cards
you missed.

**Live demo:** https://flam-assignment-0yui.onrender.com
**Demo video:** https://drive.google.com/file/d/1tMfdFDLNj2KkfSGUJ38mZS3ZdPYhxBXc/view?usp=sharing

The demo runs on Render's free tier, which goes to sleep when idle. If it's the
first visit in a while, give it 30 to 60 seconds to wake up.

## What it uses

- React with hooks (Vite)
- A small Node/Express server that holds the API key and calls Google Gemini
  (gemini-2.5-flash, free tier)
- Plain CSS, no UI library

## Running it locally

1. Install Node 18 or newer.
2. Get a free Gemini API key from https://aistudio.google.com/apikey
3. Copy `.env.example` to `.env` and fill in the key:
   ```
   GEMINI_API_KEY=your_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```
4. Run:
   ```
   npm install && npm start
   ```
5. Open http://localhost:5173

`npm start` runs the Express server (port 3001) and the Vite dev server together.
Vite forwards `/api` requests to Express, so the browser never sees the key.

## How to use it

1. Type a topic or paste your notes into the text box.
2. Click "Generate flashcards" and wait a few seconds.
3. Click a card to flip it and see the answer.
4. Press "Got it" or "Missed it" to move to the next card.
5. When the round ends you see your score. You can re-test just the missed cards
   or start over with the full deck.

## Data shape

I designed the JSON shape first and then wrote the prompt around it. The model is
asked to return only this:

```json
{ "cards": [{ "question": "string", "answer": "string" }] }
```

## How I handle bad AI output

I don't trust what the model sends back. The server passes the raw text to the
frontend, and `src/lib/validateResult.js` checks it before anything is rendered.
Every failure ends up in the shared `ErrorState` component with a "Try again"
button that re-sends the last input, so the app doesn't crash or go blank.

- **Malformed JSON:** I strip any ```json fences and parse inside a try/catch. If
  it fails, the user sees "The AI returned malformed JSON."
- **Wrong shape:** After parsing, I check that `cards` is an array, then keep only
  cards where both `question` and `answer` are non-empty strings. If nothing usable
  is left, an error is shown.
- **Empty response:** An empty or whitespace-only reply is treated as a failure,
  not as a valid empty result.
- **Slow response:** A loading spinner shows and the button is disabled while
  waiting. On the server, an `AbortController` cancels the Gemini call after 30
  seconds and returns a "took too long" error, so nothing hangs forever.
- **Failed request:** `src/lib/api.js` catches network errors and non-200 responses
  (missing key, Gemini errors) and turns them into readable messages.
- **Stale responses:** Each request gets a number from a `useRef` counter in
  `App.jsx`. When a response arrives, if a newer request has started, the old one
  is ignored so it can't overwrite the newer result. The Generate button is
  disabled while loading, so this is mostly a safeguard against retry clicks or
  future changes.

## Project structure

```
server/index.js            Express server: holds the API key, calls Gemini, serves the built app
src/App.jsx                Main state: idle / loading / error / success, plus the stale-request guard
src/lib/api.js             The only file that talks to my backend
src/lib/validateResult.js  Parses and checks the model's output before rendering
src/components/            PromptInput, LoadingState, ErrorState, FlashcardDeck
```

## AI usage

I used Claude (Anthropic) as a coding assistant on this project. It helped me pick
the study-assistant idea and generated the first version of the code (the React
components, the Express proxy and the validation logic). It also guided me through
setup, git and deploying to Render.

What I did myself: set up the project on my machine, added my own Gemini key, and
fixed the problems I ran into (for example `concurrently` not being installed, which
I resolved by reinstalling the dependencies). I ran the app locally with topics like
"Photosynthesis" and "DSA", checked the layout at a phone-sized viewport in Chrome
DevTools, pushed the code to GitHub, and deployed it to Render with the API key set
as an environment variable.

## Known limitations

- Flashcards aren't saved, so refreshing the page loses them.
- The result isn't streamed; you wait for the whole response.
- Very long notes may be rejected (the server limits request size to 50kb).
- The free Gemini tier has rate limits, and the free Render server sleeps when idle.
- Only one type of block (flashcards) is supported.

## Time spent

About 5 hours: 2 on setup and coding, 1 on debugging, 2 on deployment and README.

## What I'd do next

- Save and reload sessions.
- Stream the cards as they generate.
- Add a refinement prompt ("make these harder", "add 5 more") that edits the
  existing deck instead of regenerating it.
- Add a quiz mode with multiple choice.