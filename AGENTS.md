# Architecture rules

- Keep the IndieAppCircle testimonials embed in its own homepage component, with a static trusted HTML string and effect-managed script cleanup, to isolate third-party integration lifecycle from page rendering.