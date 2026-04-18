import { useEffect } from "react";
import { useGamification } from "@/contexts/GamificationContext";
import { useAllBadges, RARITY_STYLES } from "@/hooks/useBadges";
import { toast } from "sonner";
import { sounds } from "@/lib/sounds";

const BadgeUnlockToast = () => {
  const { newlyUnlockedBadges, clearNewlyUnlockedBadges } = useGamification();
  const { data: allBadges } = useAllBadges();

  useEffect(() => {
    if (!newlyUnlockedBadges.length || !allBadges?.length) return;
    newlyUnlockedBadges.forEach((slug, i) => {
      const badge = allBadges.find((b) => b.slug === slug);
      if (!badge) return;
      setTimeout(() => {
        sounds.levelUp();
        toast(`Badge unlocked: ${badge.name}`, {
          description: badge.description,
          icon: <span className="text-2xl">{badge.icon}</span>,
          className: `border-2 ${RARITY_STYLES[badge.rarity].ring}`,
          duration: 5000,
        });
      }, i * 700);
    });
    clearNewlyUnlockedBadges();
  }, [newlyUnlockedBadges, allBadges, clearNewlyUnlockedBadges]);

  return null;
};

export default BadgeUnlockToast;
