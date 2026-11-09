# Architecture rules

- Keep the IndieAppCircle testimonials embed in its own homepage component, with a static trusted HTML string and effect-managed script cleanup, to isolate third-party integration lifecycle from page rendering.
- Render landing-page LCP text and the initial page without entrance delays; load testimonial scripts near the viewport so offscreen work does not compete with first paint.
- Keep the HTML logo preload synchronized with StudyHubLogo's optimized asset pointer so the browser reuses the requested image.