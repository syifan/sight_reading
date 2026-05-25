# 🎵 Sight Reading Trainer

A playful, pure-frontend music **sight reading practice tool**. Notes appear on
the staff and you name the pitch — by clicking the colorful letter keys or using
your keyboard. Tracks your score, streak, and accuracy.

Built with **React + Vite + TypeScript**, **Tailwind CSS / shadcn-style UI**,
and **VexFlow** for music notation. No backend — it runs entirely in the
browser and deploys to **GitHub Pages**.

## Features

- 🎼 Treble, bass, or both clefs
- 🌈 Colorful note keys (C–B) with keyboard shortcuts (A–G, Space for next)
- 📈 Score, streak, and accuracy tracking (saved in your browser)
- ➕ Optional ledger-line notes for an extra challenge
- 🌙 Light & dark themes
- 📲 Installable PWA — add it to your home screen / desktop and use it offline

## Install as an app

The site is a Progressive Web App, so you can install it for an app-like,
offline-capable experience:

- **iPhone/iPad (Safari):** Share → *Add to Home Screen*
- **Android (Chrome):** menu → *Install app* / *Add to Home Screen*
- **Desktop (Chrome/Edge):** the install icon in the address bar

Once installed it launches in its own window and works without a connection.

### Icons

App icons are generated from `scripts/icon.svg` into `public/` and committed,
so a normal build needs no extra tooling. To regenerate them after editing the
SVG, run `npm i -D sharp` then `node scripts/gen-icons.mjs`.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build
```

## Deployment

Pushing to `main` triggers the GitHub Actions workflow in
`.github/workflows/deploy.yml`, which builds the site and publishes it to
GitHub Pages.

> **One-time setup:** in the repository settings, set
> **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.

The site is served from `/sight_reading/` (configured via `base` in
`vite.config.ts`). If you rename the repository, update that value to match.
