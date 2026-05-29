# Japanese Word Sheet Parser

A web app that extracts Japanese words from a PDF or image using the Gemini API. Upload a Japanese word sheet, and the app will parse every word with its reading, meaning, and part of speech.

Built with Svelte 5, SvelteKit, TypeScript, and Material Web Components. Deployed on Cloudflare Pages.

## Setup

```sh
npm install
```

Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey). You'll enter it in the app on first visit — it's stored only in your browser.

## Developing

```sh
npm run dev
```

## Building

```sh
npm run build
```

The output lands in `.svelte-kit/cloudflare/`, ready to deploy via `wrangler pages deploy` or by connecting your repo to the Cloudflare Pages dashboard.

## Usage

1. Enter your Gemini API key (stored in browser localStorage).
2. Upload a PDF or image containing a Japanese word sheet.
3. Click **Extract Words** to send the file to Gemini.
4. Review the extracted words in the preview table.
5. Click **Open Full Results Page** to view a printable, self-contained results page.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit 2 (Svelte 5 runes) |
| Language | TypeScript |
| UI | Material Web Components |
| API | Gemini 2.5 Flash |
| Hosting | Cloudflare Pages |
