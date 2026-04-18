import { useMemo } from "react";
import { useAllBadges, useUserBadges, RARITY_STYLES, type Badge } from "@/hooks/useBadges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Award, Loader2 } from "lucide-react";

interface BadgeShelfProps {
  userId: string;
  ownProfile?: boolean;
}

const RARITY_ORDER: Badge["rarity"][] = ["legendary", "epic", "rare", "common"];

const BadgeShelf = ({ userId, ownProfile }: BadgeShelfProps) => {
  const { data: allBadges, isLoading: loadingAll } = useAllBadges();
  const { data: userBadges, isLoading: loadingUser } = useUserBadges(userId);

  const unlockedSet = useMemo(
    () => new Set((userBadges || []).map((b) => b.badge_slug)),
    [userBadges],
  );

  const grouped = useMemo(() => {
    const map: Record<Badge["rarity"], Badge[]> = { legendary: [], epic: [], rare: [], common: [] };
    (allBadges || []).forEach((b) => map[b.rarity].push(b));
    return map;
  }, [allBadges]);

  const unlockedCount = unlockedSet.size;
  const totalCount = allBadges?.length ?? 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Badges
          </span>
          <span className="text-xs text-muted-foreground font-normal">
            {unlockedCount}/{totalCount} unlocked
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loadingAll || loadingUser ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {RARITY_ORDER.map((rarity) => {
              const badges = grouped[rarity];
              if (badges.length === 0) return null;
              return (
                <div key={rarity}>
                  <p
                    className={cn(
                      "text-xs uppercase tracking-wide font-semibold mb-2",
                      RARITY_STYLES[rarity].label,
                    )}
                  >
                    {rarity}
                  </p>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                    {badges.map((badge) => {
                      const unlocked = unlockedSet.has(badge.slug);
                      return (
                        <Tooltip key={badge.slug}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "aspect-square rounded-lg flex items-center justify-center text-2xl ring-2 transition-all",
                                unlocked
                                  ? `${RARITY_STYLES[badge.rarity].ring} ${RARITY_STYLES[badge.rarity].bg} hover:scale-110 cursor-default`
                                  : "ring-border bg-muted/20 grayscale opacity-40 cursor-default",
                              )}
                              aria-label={`${badge.name}${unlocked ? "" : " (locked)"}`}
                            >
                              <span aria-hidden>{badge.icon}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <div className="text-xs max-w-[180px]">
                              <p className="font-semibold">{badge.name}</p>
                              <p className="text-muted-foreground">{badge.description}</p>
                              {!unlocked && ownProfile && (
                                <p className="text-muted-foreground mt-1 italic">Not yet unlocked</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {totalCount === 0 && (
              <p className="text-sm text-muted-foreground italic text-center py-4">No badges available yet</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BadgeShelf;
