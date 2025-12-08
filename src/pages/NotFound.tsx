import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, HelpCircle, BookOpen, Users } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted p-4">
      <SEOHead
        title="Page Not Found - 404"
        description="The page you're looking for doesn't exist on StudyHub. Return to the homepage to browse questions, join study groups, or connect with students worldwide."
        noIndex={true}
      />
      
      <article className="text-center max-w-lg">
        <h1 className="mb-2 text-6xl font-bold text-primary">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Page Not Found</h2>
        <p className="mb-6 text-muted-foreground leading-relaxed">
          Sorry, the page you're looking for doesn't exist or may have been moved. 
          Don't worry — you can explore other parts of StudyHub to continue your learning journey.
        </p>
        
        <nav aria-label="Helpful links">
          <h3 className="sr-only">Navigate to other pages</h3>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Button asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" aria-hidden="true" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/questions">
                <BookOpen className="h-4 w-4 mr-2" aria-hidden="true" />
                Browse Questions
              </Link>
            </Button>
          </div>
          
          <section className="text-sm text-muted-foreground space-y-2">
            <p>Here are some helpful links:</p>
            <ul className="flex flex-wrap justify-center gap-4">
              <li>
                <Link to="/groups" className="text-primary hover:underline inline-flex items-center gap-1">
                  <Users className="h-3 w-3" aria-hidden="true" />
                  Study Groups
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-primary hover:underline">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-primary hover:underline inline-flex items-center gap-1">
                  <HelpCircle className="h-3 w-3" aria-hidden="true" />
                  Get Support
                </Link>
              </li>
            </ul>
          </section>
        </nav>
      </article>
    </main>
  );
};

export default NotFound;
