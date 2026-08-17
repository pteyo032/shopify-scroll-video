import { Component } from '@theme/component';
import { clamp, mediaQueryLarge, prefersReducedMotion } from '@theme/utilities';

/**
 * Pins a full-bleed video and scrubs its playback position to scroll progress
 * (desktop only). Falls back to a normal looping autoplay when the viewport
 * is mobile-sized or the user prefers reduced motion.
 *
 * @typedef {object} Refs
 * @property {HTMLDivElement} spacer - The tall wrapper that defines the scrub scroll distance.
 * @property {HTMLDivElement} pin - The sticky-positioned wrapper holding the video.
 * @property {HTMLVideoElement} video - The video element being scrubbed.
 * @property {HTMLElement[]} [tooltip] - The tooltip overlay elements.
 *
 * @extends Component<Refs>
 */
export class VideoScrollComponent extends Component {
  requiredRefs = ['spacer', 'pin', 'video'];

  /** @type {'scrub' | 'autoplay' | null} */
  #mode = null;

  /** @type {number | null} */
  #rafId = null;

  /**
   * Coalesces scroll events into at most one `#updateScrub()` call per
   * animation frame, always reading the latest geometry when the frame runs
   * (not a snapshot from when the scroll event fired) — this guarantees the
   * final scroll position is never dropped, unlike a fixed-interval throttle.
   */
  #handleScroll = () => {
    if (this.#rafId !== null) return;

    this.#rafId = requestAnimationFrame(() => {
      this.#rafId = null;
      this.#updateScrub();
    });
  };

  /**
   * Horizon scrolls `window` below 990px, but switches to an internal
   * `.page-wrapper` scroll container at 990px+ (`html`/`body` get
   * `overflow: hidden` there — see base.css). `window` never fires a
   * `scroll` event in that mode, so both potential scroll sources need
   * a listener; whichever one isn't the active scroller simply never fires.
   * @returns {(Window | Element)[]}
   */
  get #scrollTargets() {
    const pageWrapper = document.querySelector('.page-wrapper');
    return pageWrapper ? [window, pageWrapper] : [window];
  }

  connectedCallback() {
    super.connectedCallback();
    mediaQueryLarge.addEventListener('change', this.#handleBreakpointChange);
    this.#handleBreakpointChange();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    mediaQueryLarge.removeEventListener('change', this.#handleBreakpointChange);
    for (const target of this.#scrollTargets) {
      target.removeEventListener('scroll', this.#handleScroll);
    }
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
  }

  /**
   * Switches between scrub mode (desktop, motion allowed) and autoplay mode
   * (mobile viewport or reduced motion), and reacts to live breakpoint changes.
   */
  #handleBreakpointChange = () => {
    const nextMode = mediaQueryLarge.matches && !prefersReducedMotion() ? 'scrub' : 'autoplay';

    if (nextMode === this.#mode) return;
    this.#mode = nextMode;

    const scrollTargets = this.#scrollTargets;
    for (const target of scrollTargets) {
      target.removeEventListener('scroll', this.#handleScroll);
    }
    this.#ensureVideoSource();

    const { video } = this.refs;

    if (nextMode === 'scrub') {
      video.loop = false;
      video.pause();
      for (const target of scrollTargets) {
        target.addEventListener('scroll', this.#handleScroll, { passive: true });
      }
      this.#updateScrub();
    } else {
      video.loop = true;
      video.currentTime = 0;
      video.play().catch(() => {});
      this.#hideAllTooltips();
    }
  };

  /**
   * Lazily assigns the real video source. Only ever called once per element,
   * regardless of how many times the mode switches back and forth, so no
   * video bytes are requested before this component actually needs them.
   */
  #ensureVideoSource() {
    const { video } = this.refs;
    if (video.src) return;

    const src = video.dataset.videoSrc;
    if (!src) return;

    video.addEventListener('error', this.#handleVideoError, { once: true });
    video.addEventListener('loadedmetadata', this.#handleLoadedMetadata, { once: true });
    video.src = src;
    video.load();
  }

  #handleLoadedMetadata = () => {
    if (this.#mode === 'scrub') this.#updateScrub();
  };

  #handleVideoError = () => {
    this.classList.add('video-scroll__desktop--error');
  };

  /**
   * Maps current scroll progress through the spacer to a point in the video's
   * duration, and syncs tooltip visibility to that same point in time.
   */
  #updateScrub() {
    const { spacer, pin, video } = this.refs;
    if (!video.duration || Number.isNaN(video.duration)) return;

    const rect = spacer.getBoundingClientRect();
    const scrollableHeight = rect.height - pin.offsetHeight;
    if (scrollableHeight <= 0) return;

    // The pin sticks at `top: var(--header-height)`, not `top: 0` — progress
    // must be measured from that same offset, or it reaches 1 (and unsticks
    // the video) before the section is actually done scrolling through.
    const stickyOffset = Number.parseFloat(getComputedStyle(pin).top) || 0;
    const progress = clamp((stickyOffset - rect.top) / scrollableHeight, 0, 1);

    video.currentTime = progress * video.duration;
    this.#updateTooltips(video.currentTime);
  }

  /**
   * @param {number} currentTime
   */
  #updateTooltips(currentTime) {
    for (const tooltip of this.refs.tooltip ?? []) {
      const start = Number.parseFloat(tooltip.dataset.startTime ?? '0');
      const end = Number.parseFloat(tooltip.dataset.endTime ?? '0');

      tooltip.classList.toggle('is-visible', currentTime >= start && currentTime <= end);
    }
  }

  #hideAllTooltips() {
    for (const tooltip of this.refs.tooltip ?? []) {
      tooltip.classList.remove('is-visible');
    }
  }
}

if (!customElements.get('video-scroll-component')) {
  customElements.define('video-scroll-component', VideoScrollComponent);
}
