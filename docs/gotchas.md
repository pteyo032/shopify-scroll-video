# Technical gotchas

Things that cost real debugging time while building this — recorded so you
don't have to rediscover them. This was the first scroll-driven (not
click/hover-driven) feature built on this theme, so almost none of these
had an existing pattern to copy from.

1. **Horizon scrolls an internal `.page-wrapper` div, not `window`/`body`,
   once the viewport is 990px or wider.** The theme's own `base.css` sets
   `html`/`body` to `height: 100dvh; overflow: hidden;` above that
   breakpoint, and moves real scrolling to `.page-wrapper`
   (`overflow-y: auto`) — a mechanism for its sticky header. A
   `window.addEventListener('scroll', ...)` never fires there. Any
   scroll-driven feature on this theme needs to listen on **both**
   `window` and `.page-wrapper` — whichever one isn't the active scroll
   container for the current viewport width simply never fires, so this is
   safe to do unconditionally (see `#scrollTargets` in
   `assets/video-scroll.js`).

2. **Shopify `range` schema settings cap out at 101 total values**
   (`(max - min) / step`), undocumented anywhere obvious — found only via
   a real `shopify theme push` error: `Invalid schema: setting with
   id="..." step n'est pas valide`. `min:0, max:60, step:0.1` (601 values)
   and `min:0, max:200, step:1` (201 values) both failed silently at
   upload — and because the whole file gets rejected, every *downstream*
   symptom looked unrelated (block type "doesn't exist" in the customizer,
   preset validation errors) until the actual schema error was found.
   Always check `(max - min) / step <= 100` before shipping a `range`.

3. **A `position: sticky` element's scroll-progress math must account for
   its own `top` offset, not assume `top: 0`.** If the sticky element is
   offset (here, `top: var(--header-height)` so a nav bar doesn't cover
   it), any JS replicating "how far through its stuck phase are we" needs
   to subtract that same offset — reading it live via
   `getComputedStyle(el).top` rather than hardcoding it, so it can't
   silently drift out of sync with the CSS. Getting this wrong doesn't
   error — it just makes the animation finish slightly before (or after)
   the element actually unsticks, which is easy to misdiagnose as a
   timing/performance bug instead of pure geometry.

4. **A fixed-interval `throttle` can drop the final event in a scroll
   sequence.** A leading-edge throttle (`if (now - lastCall >= delay)
   call()`) has no trailing call — if the user's last scroll tick lands
   within the throttle window, it's simply never processed, and nothing
   fires again once scrolling stops. For anything that must reach an
   exact end state (like a video ending on its true last frame), coalesce
   scroll events into `requestAnimationFrame` instead: mark "needs
   update", read live geometry on the next frame. This guarantees the
   truly final scroll position is always the one processed, whereas a
   throttle can leave the last few percent of motion silently uncommitted.

5. **CSS percentage heights need a definite-height ancestor — and a
   custom element (`<my-component>`) is `display: inline` by default,**
   which never establishes one. `height: 300%` on a child of an unstyled
   custom element silently resolves to the child's own content height
   instead of erroring, so the bug shows up as "nothing happens" rather
   than a visible layout break. Any custom element wrapping
   percentage-sized children needs an explicit `display: block` (or
   `flex`/`grid`) in its own CSS.

6. **To anchor one item of a flex row to a fixed point while the rest of
   the row extends in either direction, don't center the whole row on
   that point.** Centering the box (`transform: translate(-50%, -50%)`)
   moves *every* child, including the one meant to stay fixed, whenever
   the row's total width changes (e.g. on `flex-direction: row-reverse`).
   Anchor by one edge instead (here, the tooltip's circle sits at the
   box's natural left edge in `row` mode) and only add
   `transform: translateX(-100%)` when reversing, so the box's edge — not
   its center — always lands on the anchor point.

7. **`max_blocks` at the section schema's top level caused upload
   failures in this theme's block system** and was dropped in favor of
   documenting the intended cap (3 tooltips) as a `paragraph` setting
   instead of enforcing it technically. Worth re-testing if you need a
   hard limit — this repo doesn't rely on one being enforced.

8. **`{% stylesheet %}` is compiled once per section/block *type* and
   shared across every instance on the page — never put
   `section.id`/`block.id` inside it.** Instance-specific values (a
   tooltip's `left`/`top` from its own settings, a section's accent
   color) go through a plain inline `style="..."` attribute instead, or
   a `{% style %}` tag if the value needs a media query or a class-scoped
   selector that inline styles can't express.
