import { Home, HelpCircle, Users, Trophy, UserPlus, Menu } from "lucide-react";
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
    { path: "/ask-doubt", label: "Ask Doubt", icon: HelpCircle },
    { path: "/groups", label: "Groups", icon: Users },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { path: "/friends", label: "Friends", icon: UserPlus },
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
          <SheetTitle className="text-left text-xl font-bold">
            studyhub
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 mt-6">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => handleNavigate(item.path)}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
