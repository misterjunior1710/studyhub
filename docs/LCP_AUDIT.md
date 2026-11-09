# Landing-page LCP audit — 9 November 2026

## Measurement

Published visitor readings over the preceding seven days, bots excluded and repeated metric series collapsed:

| Page | LCP readings | LCP p75 | FCP p75 |
| --- | ---: | ---: | ---: |
| / | 1,946 | 4.091 s | 1.782 s |
| /auth | 122 | 2.581 s | 1.808 s |
| /feed | 16 | 3.310 s | 1.610 s |
| /questions | 8 | 3.074 s | 1.341 s |

These are all-device readings, not a desktop-only Search Console sample. Feed/questions have too few readings to classify. Google's good LCP threshold is 2.5 seconds. The homepage paints early but replaces that initial content with its larger live paragraph later.

## Actual largest element

Desktop Chromium at 1280 × 1800 identifies the HeroGeometric description paragraph as LCP. The hero has no bitmap image; its decoration is CSS/motion. There is no lazy-loaded LCP image to repair. Preloading an invented hero image would waste bandwidth.

## Changes

- Render the heading and description without delayed entrance transforms.
- Paint the initial page immediately rather than hiding it behind the route transition; retain subsequent route transitions.
- Defer IndieAppCircle's script until its section approaches the viewport, retaining unmount cleanup and the trusted embed markup.
- Resize the shared logo from 510 × 417 PNG (79,308 bytes) to 256 × 209 WebP (6,810 bytes), a 91.4% reduction. Preserve original PNG URLs for email/PWA/social compatibility.
- Match the HTML high-priority image preload to the real logo CSS-mask asset, including CORS mode. This logo is not claimed to be LCP.
- Preload the Latin Lato regular/bold WOFF2 files used by visible text; retain nonblocking stylesheet loading and swap fallbacks.
- Align initial placeholder description with current homepage copy.

## Initial pipeline review

Vite's application stylesheet remains render-blocking, with critical placeholder CSS already inline. Google Fonts uses nonblocking print/onload loading. Google Analytics is async, and tracking is preserved. Most routes are already lazy-loaded; no route-loading overhaul or extra dependency was added. The pure SPA/static fallback architecture remains unchanged.

## Verification and limitations

Before changes, local desktop LCP was 3.216 seconds; after changes a comparable local run measured 1.396 seconds (and a subsequent desktop run 0.996 seconds). These are development-browser samples, not a production score or guaranteed visitor improvement. Desktop/mobile screenshots retained the layout and logo, showed no horizontal overflow, and navigation remained usable. The testimonial script was absent initially, loaded near its section, and was removed on navigation. A third-party styled-components error appeared once after scrolling into reviews; the application remained usable.

The hosted optimized logo responds HTTP 200 with image/webp and immutable caching. Local Vite does not directly serve CDN pointers, so image visual verification forwarded that path to the hosted asset. Production must be published and fresh visitor data collected before claiming the Search Console issue is resolved.