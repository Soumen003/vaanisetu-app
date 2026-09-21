# VaaniSetu (वाणीसेतु) - AI-Powered Vernacular Pedagogy App

A classroom web application designed for Foundational Literacy and Numeracy (FLN) educators in tribal districts of Jharkhand (supporting Santali in Ol Chiki script, Ho in Warang Citi, and Mundari in Bani/Nagari).

## Features
- **Realtime translation:** continuous Hindi speech recognition updates the input as the teacher speaks; the offline dictionary responds immediately and the Gemini fallback is debounced and cancellable.
- **Dual Translation Engine:** preloaded offline dictionary of foundational FLN phrases plus Gemini Generative AI fallback for arbitrary speech and text.
- **Voice Recognition & Speech Playback:** built-in Web Speech API integration for Hindi voice recording and romanized phonetic pronunciation audio.
- **Bilingual Worksheet Generator:** NIPUN Bharat aligned worksheets with preview and direct print capability.
- **Visual Flashcards:** interactive animal, number, and color flashcards with pronunciation drills.
- **Teacher Dashboard:** real-time stats and engagement analytics.
- **Responsive Display:** toggle between Mobile Device Simulator view and Full-Width Desktop view.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in Chrome or Edge. The browser must be served from `localhost` or HTTPS for microphone access.

4. Sign in with the demo account using the **Use Demo Teacher Account** button.

## How realtime translation works

1. Click **Speak Hindi**. The app starts continuous Web Speech recognition with `hi-IN` and `interimResults` enabled.
2. Interim speech is shown immediately and final speech is appended to the input box. If the browser ends a recognition segment, the app automatically starts the next segment while the mic remains enabled.
3. Every input change triggers the translation pipeline after a short 400 ms debounce. Known classroom phrases are served locally without a network request.
4. For phrases not in the local dictionary, the Gemini request is sent with an `AbortController`. When newer speech arrives, the older request is cancelled so an old response cannot overwrite the latest translation.
5. Stop the microphone to end the continuous session. The target language can be changed at any time.

This browser-native approach is suitable for a prototype and low-connectivity classroom fallback. It is not a true audio-streaming speech-to-speech service: the browser produces text segments, then the app translates those text segments. For production, move the Gemini call behind your own server so the API key is not exposed in browser JavaScript, and consider a streaming speech provider if word-level latency is required.

## Environment Configuration

The optional `.env` file can enable live AI translation for phrases not present in the offline dictionary:

```bash
cp .env.example .env
# Set a development-only key
VITE_GEMINI_API_KEY=your_key_here
```

A `VITE_*` variable is bundled into the browser and is therefore visible to users. Do **not** use a long-lived production key this way. In production, create a server endpoint such as `POST /api/translate`, keep the provider key in server-side environment variables, validate the requested target language, rate-limit requests, and call that endpoint from `performTranslation` instead of calling Google directly.

## Browser and deployment notes

- Chrome and Edge provide the most consistent Web Speech API support; Firefox support varies by platform.
- Microphone permission is required. Use HTTPS outside localhost.
- If speech recognition is unavailable, the text box remains usable and offline dictionary translations still work.
- The local dictionary is the reliable offline path. AI fallback requires internet connectivity and a configured key.
