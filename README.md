<p align="right"><a href="README.fr.md">Lire en français</a></p>

# Shopify Scroll Video — Apple-style scroll-scrubbed product video

[![Theme Check](https://github.com/pteyo032/shopify-scroll-video/actions/workflows/theme-check.yml/badge.svg)](https://github.com/pteyo032/shopify-scroll-video/actions/workflows/theme-check.yml)

A full-width section that pins a product video in place and scrubs its
playback frame-by-frame as the visitor scrolls — no play button, no visible
video controls, just the page reacting to scroll. Reversible: scroll back
up and the video plays backward. Up to a few configurable tooltip blocks
can highlight specific product features on top of the video, each with its
own position, timing window, and fade in/out.

Built for the **Shopify Horizon** theme. No third-party app, no external
library — a single web component driving `video.currentTime` off scroll
position.

## Features

- Video pinned full-screen (`position: sticky`) while a scroll "spacer"
  of adjustable length plays through it — the **Scroll distance** setting
  controls how much scrolling the full video takes, from the theme editor
- Fully reversible: scrolling up reverses the video, not just pauses it
- Up to a few tooltip blocks, each independently configurable: X/Y
  position, start/end time (decimal seconds), fade in/out, line length and
  thickness, and which side (left/right) the label grows toward — the
  marker circle always stays exactly on its configured point regardless of
  direction
- **Mobile gets no video at all** — below 750px, the section shows up to 3
  stacked images instead, and the video's `src` is never assigned, so no
  video bytes are ever requested on mobile
- Respects `prefers-reduced-motion` and works with JavaScript disabled —
  both fall back to a normal autoplay/loop instead of scroll-scrubbing
- Section heading, accent color, and section background are all editable
  from the theme editor; tooltip headline/description font sizes and the
  section heading's size/color are independently adjustable

## Repository contents

This repo contains **only the custom code for this feature** — not the
full Horizon theme, which belongs to Shopify. You drop these files into an
existing Horizon (or Horizon-based) theme.

| Path | What it is |
|---|---|
| `sections/section-video-scroll.liquid` | The section — markup, all CSS, schema |
| `blocks/video-scroll-tooltip.liquid` | The tooltip child block |
| `assets/video-scroll.js` | The `<video-scroll-component>` web component — scroll listening, scrub math, tooltip visibility |
| `locales/*.json`, `locales/*.schema.json` | English + French translations (storefront text and editor labels) |
| `docs/integration-guide.md` | How to install it, get a usable video URL, and what each setting does |
| `docs/gotchas.md` | Technical pitfalls discovered while building this — several are specific to Horizon's own scroll architecture, so you don't re-hit them |

## Quick start

1. Copy `sections/`, `blocks/` and `assets/` into your theme, and merge the
   locale keys from `locales/` into your own.
2. Upload your video directly to **Settings → Files** in Shopify admin
   (not the Video Picker — see `docs/integration-guide.md` for why), and
   paste its URL into the section's **Video URL** setting.
3. Add the **Video Scroll** section to a template from the theme editor.
   Add **Tooltip** blocks under it to highlight specific moments in the
   video.

See `docs/integration-guide.md` for the full breakdown of every setting
and how the scrub mechanism actually works.

## Why this one was harder than it looks

This was the first scroll-driven (rather than click/hover-driven) feature
built on this theme. Almost every bug traced back to something genuinely
undocumented about either Horizon's own scroll architecture or an
undocumented Shopify platform limit — not application logic. The short
version: Horizon scrolls a different element than `window` above 990px,
and Shopify caps `range` settings at 101 total values. Full list, with the
reasoning and the fix for each, in `docs/gotchas.md`.

## License

MIT — see `LICENSE`.
