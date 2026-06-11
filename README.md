# Funnelly — mobile funnels in minutes

A free, open Perspective-style funnel builder. Build beautiful mobile-first funnels (quiz steps, lead forms, social proof) and share them with a single link.

**Zero running cost by design:**
- No database — funnels are saved in your browser (localStorage)
- No backend — publishing packs the entire funnel into the share URL (lz-string compression, decoded client-side at `/f#…`)
- No AI calls — nothing burns credits
- No accounts, no auth, nothing to maintain

## Features

- 📱 Mobile-first editor with live phone canvas (Perspective-style)
- 🧱 9 block types: heading, text, image, button, quiz choice, lead form, video, social proof, spacer
- 🪜 Multi-step funnels with progress bar and step transitions
- 🎨 Theming: brand color, light/gradient/dark backgrounds, font styles
- 🧲 4 templates: Blank, Lead Magnet, Quiz Funnel, Service Booking
- 📬 Lead capture posts JSON to any webhook (GoHighLevel, Make, Zapier, n8n) with quiz answers attached
- 🔗 One-click publish — copy the link, send it anywhere

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Push to GitHub and import on [Vercel](https://vercel.com) — no env vars, no config needed.

## How publishing works

The editor serializes the funnel JSON, compresses it with `lz-string`, and puts it in the URL hash. The `/f` route decompresses and renders it. The funnel literally *is* the link — host it once, share unlimited funnels for free.

## Stack

Next.js (App Router) · React · Tailwind CSS · lz-string
