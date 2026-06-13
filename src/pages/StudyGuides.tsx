import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CURRICULA } from "@/lib/studyGuides";
import { ArrowRight, BookOpen } from "lucide-react";

const StudyGuides = () => {
  return (
    <>
      <SEOHead
        title="Curriculum Study Guides — CBSE, IGCSE, IB, AP & More"
        description="Free study guides, exam tips and resources for CBSE, IGCSE, IB, AP, A-Levels and more. Curriculum-specific help built for students."
        canonical="https://studyhub.world/study-guides"
      />
      <Navbar />
      <main className="container max-w-5xl mx-auto px-4 py-10">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Curriculum Study Guides</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pick your curriculum to get focused study material, exam strategies, and the resources students actually use to ace it.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {CURRICULA.map((c) => (
            <Link
              key={c.slug}
              to={`/study-guides/${c.slug}`}
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">{c.name}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.short}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default StudyGuides;
