// Site-wide notice banner. Renders above the navigation bar on every page.
//
// To edit the notice: change BANNER_MESSAGE below.
// To remove the notice: delete the <SiteNoticeBanner /> line in src/App.tsx
// (or set BANNER_MESSAGE to an empty string to hide it everywhere at once).

export const BANNER_MESSAGE =
  "⚠️ Some StudyHub features are temporarily unavailable. We're working on it and expect to be back by 18 November.";

const SiteNoticeBanner = () => {
  if (!BANNER_MESSAGE.trim()) return null;

  return (
    <aside
      role="note"
      aria-label="Site notice"
      className="w-full border-b border-amber-600/50 bg-amber-400 text-amber-950"
    >
      <div className="mx-auto max-w-4xl px-4 py-2.5 pt-[calc(0.625rem+env(safe-area-inset-top))] text-center text-sm font-medium leading-snug sm:text-base">
        {BANNER_MESSAGE}
      </div>
    </aside>
  );
};

export default SiteNoticeBanner;
