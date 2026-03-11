import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              StudyHub
            </h3>
            <p className="text-sm text-muted-foreground">
              Study Smarter, Ace Everything 🎯
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/questions" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Questions
                </Link>
              </li>
              <li>
                <Link to="/groups" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Study Groups
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Your Stuff</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/friends" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Friends
                </Link>
              </li>
              <li>
                <Link to="/study" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Study Mode
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-muted-foreground active:text-primary py-1 inline-block">
                  Need Help?
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} StudyHub. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Built with <Heart className="h-4 w-4 text-destructive" /> by students, for students
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
