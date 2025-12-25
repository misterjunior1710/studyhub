import { Home, HelpCircle, Users, Trophy, UserPlus, Menu, Timer, Sparkles, Megaphone, Bookmark } from "lucide-react";
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

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/questions", label: "Questions", icon: HelpCircle },
    { path: "/groups", label: "Groups", icon: Users },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { path: "/friends", label: "Friends", icon: UserPlus },
    { path: "/study", label: "Study Mode", icon: Timer },
    { path: "/content-generator", label: "AI Generator", icon: Sparkles },
    { path: "/updates", label: "Updates", icon: Megaphone },
    { path: "/saved", label: "Saved Posts", icon: Bookmark },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="text-left bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            StudyHub
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 mt-6">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "default" : "ghost"}
              className="w-full justify-start h-12 text-base"
              onClick={() => handleNavigate(item.path)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
