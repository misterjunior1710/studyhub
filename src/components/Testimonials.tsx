import { useEffect } from "react";

const TESTIMONIALS_HTML = '<indieappcircle-testimonials app="j57d9scwdsc2b0y81bn779hq0d870wd1"><a href="https://www.indieappcircle.com/apps/j57d9scwdsc2b0y81bn779hq0d870wd1">Verified feedback on IndieAppCircle</a></indieappcircle-testimonials>';

export default function Testimonials() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.indieappcircle.com/testimonials-embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <section aria-labelledby="testimonials-heading" className="py-12 sm:py-16 border-t border-border/40">
      <div className="container mx-auto px-4">
        <h2 id="testimonials-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8">
          Testimonials
        </h2>
        <div className="min-w-0 max-w-full" dangerouslySetInnerHTML={{ __html: TESTIMONIALS_HTML }} />
      </div>
    </section>
  );
}