import { Home, HelpCircle, Users, UserPlus, Menu, Timer, Sparkles, Megaphone, Calendar, Palette, LifeBuoy, Rss, NotebookPen, Bookmark, Download, ListChecks, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const sections = [
    {
      label: "Main",
      items: [
        { path: "/", label: "Home", icon: Home },
        { path: "/feed", label: "Feed", icon: Rss },
        { path: "/questions", label: "Questions", icon: HelpCircle },
        { path: "/groups", label: "Groups", icon: Users },
      ],
    },
    {
      label: "Study",
      items: [
        { path: "/study", label: "Study Tools", icon: Timer },
        { path: "/content-generator", label: "AI Study Tools", icon: Sparkles },
        { path: "/notes", label: "Notes", icon: NotebookPen },
        { path: "/whiteboards", label: "Whiteboards", icon: Palette },
      ],
    },
    {
      label: "Plan",
      items: [
        { path: "/tasks", label: "Tasks", icon: ListChecks },
        { path: "/calendar", label: "Calendar", icon: Calendar },
        { path: "/transitions", label: "Life Skills", icon: Compass },
      ],
    },
    {
      label: "Community",
      items: [
        { path: "/friends", label: "Friends", icon: UserPlus },
        { path: "/updates", label: "Updates", icon: Megaphone },
      ],
    },
    {
      label: "More",
      items: [
        { path: "/saved", label: "Saved Posts", icon: Bookmark },
        { path: "/install", label: "Install App", icon: Download },
        { path: "/support", label: "Support", icon: LifeBuoy },
      ],
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            StudyHub
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-6">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">
                {section.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className="w-full justify-start h-11 text-sm"
                    onClick={() => handleNavigate(item.path)}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
