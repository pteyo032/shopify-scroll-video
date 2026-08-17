# Integration guide

## Install

1. Copy `sections/section-video-scroll.liquid`, `blocks/video-scroll-tooltip.liquid`
   and `assets/video-scroll.js` into your theme, unchanged.
2. Merge the locale keys from `locales/*.json` and `locales/*.schema.json`
   into your theme's own locale files (they're additive — nothing here
   overwrites native Horizon keys).
3. In the theme editor, add the **Video Scroll** section to any template.
   Add up to a few **Tooltip** blocks under it if you want highlighted
   callouts over the video.

## Getting a video URL

This section deliberately uses a plain text field for the video, **not**
Shopify's native Video Picker — the Video Picker re-encodes whatever you
upload, and this feature needs to control exactly how the file is served
(muted, no controls, seekable frame-by-frame). Instead:

1. Upload your video file directly in **Settings → Files** in the Shopify
   admin.
2. Copy the file's URL (ends in something like `.mp4?v=...`).
3. Paste that URL into the section's **Video URL** setting.

For the scrub to feel smooth, encode the video so **every frame is a
keyframe** (a high keyframe-interval / all-I-frame encode). A normal
long-GOP encode can still work, but seeking will be noticeably less smooth
during fast scrolling since the browser has to decode forward from the
nearest keyframe on every seek.

## How the scrub works

- The section renders a tall "spacer" wrapper (height = the **Scroll
  distance** setting, in `vh`) containing a `position: sticky` inner
  wrapper that holds the video.
- While the sticky wrapper is pinned, `assets/video-scroll.js` maps how far
  the user has scrolled through the spacer to a point in `video.duration`,
  and sets `video.currentTime` directly — no `play()`/`pause()` calls, the
  video is essentially treated as a scrubbable image sequence.
- Below the 750px breakpoint, the video is never assigned a `src` and no
  scroll listener is attached — the section instead shows up to 3 stacked
  images from the section's mobile image settings.
- If the visitor has JavaScript disabled, or `prefers-reduced-motion:
  reduce` is set, the video plays back normally (autoplay, muted, looped)
  instead of scrubbing.

## Tooltip blocks

Each **Tooltip** block is independent and takes:

- **Position** — X/Y as percentages of the video frame
- **Timing** — start/end time in seconds (decimals allowed, e.g. `1.5`),
  the tooltip fades in at start and out at end
- **Grows toward** — left or right; only the connecting line and text
  extend in that direction, the marker circle always stays exactly on the
  configured point
- **Line length** / **Line thickness** — the thickness setting also scales
  the marker circle and its ring proportionally, so one control keeps the
  whole marker visually consistent

There's no hard cap enforced on how many tooltip blocks you add (see
`docs/gotchas.md` #7 for why), but the section's own settings panel
recommends staying at 3 — much more than that gets visually busy on a
single frame of video.

## Customizing the look

Everything visual lives in the `{% stylesheet %}` block at the bottom of
`sections/section-video-scroll.liquid` — class names are all prefixed
`.video-scroll` / `.video-scroll-tooltip`, no theme-wide selectors are
touched. The one exception is `object-fit: contain` vs `cover` on
`.video-scroll__video`: `contain` (the default here) always shows the
full frame with possible letterboxing; switch to `cover` if you'd rather
fill the screen edge-to-edge and crop instead.
