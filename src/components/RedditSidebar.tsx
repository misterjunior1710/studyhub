import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  TrendingUp, 
  HelpCircle, 
  Users, 
  Trophy, 
  UserPlus,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Calculator,
  FlaskConical,
  Globe,
  Palette,
  Code,
  Music,
  Dumbbell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface RedditSidebarProps {
  selectedSubject?: string | null;
  onSubjectChange?: (subject: string | null) => void;
}

const subjects = [
  { name: "Mathematics", icon: Calculator },
  { name: "Science", icon: FlaskConical },
  { name: "English", icon: BookOpen },
  { name: "History", icon: Globe },
  { name: "Arts", icon: Palette },
  { name: "Computer Science", icon: Code },
  { name: "Music", icon: Music },
  { name: "Physical Education", icon: Dumbbell },
];

const RedditSidebar = ({ selectedSubject, onSubjectChange }: RedditSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [topicsOpen, setTopicsOpen] = useState(true);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSubjectClick = (subject: string) => {
    if (onSubjectChange) {
      onSubjectChange(selectedSubject === subject ? null : subject);
    }
  };

  return (
    <aside className="w-[270px] flex-shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-3">
        {/* Primary Navigation */}
        <nav className="bg-card rounded-lg border border-border p-3 space-y-1">
          <Button
            variant={isActive("/") ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-10",
              isActive("/") && "bg-secondary font-medium"
            )}
            onClick={() => navigate("/")}
          >
            <Home className="h-5 w-5" />
            Home
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-10"
            onClick={() => navigate("/")}
          >
            <TrendingUp className="h-5 w-5" />
            Popular
          </Button>
        </nav>

        {/* Topics Section */}
        <Collapsible open={topicsOpen} onOpenChange={setTopicsOpen}>
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between h-12 rounded-none border-b border-border px-4"
              >
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Topics
                </span>
                {topicsOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-2 space-y-0.5">
                {subjects.map((subject) => (
                  <Button
                    key={subject.name}
                    variant={selectedSubject === subject.name ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "w-full justify-start gap-3 h-9 text-sm",
                      selectedSubject === subject.name && "bg-secondary font-medium"
                    )}
                    onClick={() => handleSubjectClick(subject.name)}
                  >
                    <subject.icon className="h-4 w-4" />
                    {subject.name}
                  </Button>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Resources Section */}
        <Collapsible open={resourcesOpen} onOpenChange={setResourcesOpen}>
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between h-12 rounded-none border-b border-border px-4"
              >
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Resources
                </span>
                {resourcesOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-2 space-y-0.5">
                <Button
                  variant={isActive("/ask-doubt") ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start gap-3 h-9 text-sm"
                  onClick={() => navigate("/ask-doubt")}
                >
                  <HelpCircle className="h-4 w-4" />
                  Ask a Doubt
                </Button>
                <Button
                  variant={isActive("/groups") ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start gap-3 h-9 text-sm"
                  onClick={() => navigate("/groups")}
                >
                  <Users className="h-4 w-4" />
                  Study Groups
                </Button>
                <Button
                  variant={isActive("/leaderboard") ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start gap-3 h-9 text-sm"
                  onClick={() => navigate("/leaderboard")}
                >
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </Button>
                <Button
                  variant={isActive("/friends") ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start gap-3 h-9 text-sm"
                  onClick={() => navigate("/friends")}
                >
                  <UserPlus className="h-4 w-4" />
                  Friends
                </Button>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
    </aside>
  );
};

export default RedditSidebar;
