import { Link } from "react-router-dom";
import { Crown, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UpgradeWallProps {
  feature: string;
  description?: string;
  highlights?: string[];
}

const DEFAULT_HIGHLIGHTS = [
  "Enhanced Nova AI assistant",
  "Advanced flashcards, quizzes & mind maps",
  "Collaborative whiteboards & docs",
  "Premium themes & Pro badge",
];

const UpgradeWall = ({ feature, description, highlights }: UpgradeWallProps) => {
  const items = highlights ?? DEFAULT_HIGHLIGHTS;
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card className="relative w-full max-w-xl overflow-hidden rounded-2xl border-primary/40 bg-card/80 p-8 backdrop-blur shadow-[0_20px_60px_-30px_hsl(var(--primary)/0.6)]">
        <div
          className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary to-transparent"
          aria-hidden
        />
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              StudyHub Pro
            </p>
            <h1 className="text-2xl font-bold tracking-tight">{feature}</h1>
          </div>
        </div>

        <p className="mt-4 text-muted-foreground">
          {description ??
            `${feature} is part of StudyHub Pro. Upgrade to unlock it and the rest of the Pro toolkit.`}
        </p>

        <ul className="mt-6 space-y-2.5">
          {items.map((h) => (
            <li key={h} className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{h}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="h-11 px-6 font-semibold">
            <Link to="/pricing">
              <Sparkles className="mr-2 h-4 w-4" />
              See Pro plans
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-11 px-6">
            <Link to="/feed">Back to feed</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UpgradeWall;
