import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card py-4 hidden md:block">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>•</span>
          <Link to="/ask-doubt" className="hover:text-foreground transition-colors">
            Ask a Doubt
          </Link>
          <span>•</span>
          <Link to="/groups" className="hover:text-foreground transition-colors">
            Study Groups
          </Link>
          <span>•</span>
          <Link to="/leaderboard" className="hover:text-foreground transition-colors">
            Leaderboard
          </Link>
          <span>•</span>
          <Link to="/friends" className="hover:text-foreground transition-colors">
            Friends
          </Link>
          <span>•</span>
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          © {new Date().getFullYear()} StudyHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
