import { useMissions } from "@/hooks/useMissions";
import { Card, CardContent } from "@/components/ui/card";
import { Target, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import MissionCard from "./MissionCard";
import { Skeleton } from "@/components/ui/skeleton";

const MissionsSidebar = () => {
  const { dailyMissions, activeCount, loading } = useMissions();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (dailyMissions.length === 0) return null;

  const preview = dailyMissions.slice(0, 3);

  return (
    <Card>
      <CardContent className="p-4">
        <Link
          to="/missions"
          className="flex items-center justify-between mb-3 group hover:text-primary transition-colors"
        >
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Daily Missions</h3>
            {activeCount > 0 && (
              <span className="text-xs text-muted-foreground">({activeCount} active)</span>
            )}
          </div>
          <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <div className="space-y-2">
          {preview.map((m) => (
            <MissionCard key={m.user_mission_id} mission={m} compact />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MissionsSidebar;
