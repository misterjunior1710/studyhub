import { useParams, Link, Navigate } from "react-router-dom";
import SEOHead, { StructuredData, getFAQSchema, getBreadcrumbSchema } from "@/components/SEOHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCurriculum, CURRICULA } from "@/lib/studyGuides";
import { Check, BookOpen, GraduationCap, Lightbulb, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const StudyGuideDetail = () => {
  const { slug = "" } = useParams();
  const guide = getCurriculum(slug);

  if (!guide) return <Navigate to="/study-guides" replace />;

  const url = `https://studyhub.world/study-guides/${guide.slug}`;
  const title = `How to Ace ${guide.name} Exams — Study Guide & Resources`;
  const description = `Complete ${guide.name} study guide: exam tips, recommended resources, top subjects and FAQs. Built for students preparing for ${guide.name}.`;

  return (
    <>
      <SEOHead title={title} description={description} canonical={url} type="article" />
      <StructuredData data={getFAQSchema(guide.faqs)} />
      <StructuredData
        data={getBreadcrumbSchema([
          { name: "StudyHub", url: "https://studyhub.world/" },
          { name: "Study Guides", url: "https://studyhub.world/study-guides" },
          { name: guide.name, url },
        ])}
      />
      <Navbar />
      <main className="container max-w-4xl mx-auto px-4 py-10">
        <Link to="/study-guides" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> All curricula
        </Link>

        <header className="mb-10">
          <p className="text-sm text-primary font-medium mb-2">Curriculum Study Guide</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            How to Ace {guide.name} Exams
          </h1>
          <p className="text-lg text-muted-foreground">{guide.description}</p>
        </header>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" /> Top Exam Tips
          </h2>
          <ul className="space-y-3">
            {guide.examTips.map((tip, i) => (
              <li key={i} className="flex gap-3 rounded-lg border border-border bg-card p-4">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> Recommended Study Resources
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {guide.studyResources.map((r, i) => (
              <li key={i} className="rounded-lg border border-border bg-card p-3 text-sm">
                {r}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" /> Popular {guide.name} Subjects
          </h2>
          <div className="flex flex-wrap gap-2">
            {guide.subjects.map((s) => (
              <span key={s} className="rounded-full border border-border bg-muted px-3 py-1 text-sm">
                {s}
              </span>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {guide.faqs.map((f, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-semibold mb-2">{f.question}</h3>
                <p className="text-muted-foreground">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6 text-center">
          <h2 className="text-2xl font-semibold mb-2">Study {guide.name} with peers</h2>
          <p className="text-muted-foreground mb-4">
            Join {guide.name} study groups on StudyHub — share notes, ask questions, and prep with students around the world.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild>
              <Link to="/groups">Browse Study Groups</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/questions">Ask a Question</Link>
            </Button>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold mb-3">Other Curriculum Guides</h2>
          <div className="flex flex-wrap gap-2">
            {CURRICULA.filter((c) => c.slug !== guide.slug).map((c) => (
              <Link
                key={c.slug}
                to={`/study-guides/${c.slug}`}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-sm hover:border-primary transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default StudyGuideDetail;
