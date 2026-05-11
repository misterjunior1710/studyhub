import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import * as LucideIcons from "lucide-react";
import ProgressRing from "./ProgressRing";
import type { TransitionModule } from "@/hooks/useTransitions";

interface Props {
  module: TransitionModule;
  done: number;
  total: number;
  pct: number;
}

const ModuleCard = ({ module, done, total, pct }: Props) => {
  const Icon = (LucideIcons as any)[module.icon] ?? LucideIcons.GraduationCap;
  const accentClass =
    module.accent === "purple"
      ? "from-purple-500/10 to-amber-500/5"
      : "from-blue-500/10 to-teal-500/5";

  return (
    <Link to={`/transitions/${module.slug}`} className="block group">
      <Card
        className={`glass-card hover-lift tap-press p-6 bg-gradient-to-br ${accentClass} border-border/40`}
      >
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-background/60 p-3 ring-1 ring-border/40">
            <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{module.phase}</p>
            <h3 className="text-lg font-semibold mt-0.5 group-hover:text-primary transition-colors">
              {module.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{module.description}</p>
          </div>
          <ProgressRing pct={pct} size={64} strokeWidth={6} />
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{done} of {total} lessons</span>
          <span className="text-primary group-hover:translate-x-0.5 transition-transform">Open →</span>
        </div>
      </Card>
    </Link>
  );
};

export default ModuleCard;
