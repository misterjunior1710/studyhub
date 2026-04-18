import { useGamification } from "@/contexts/GamificationContext";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

const CoinWallet = ({ compact = false }: { compact?: boolean }) => {
  const { coins, recentCoinGain, loading } = useGamification();

  if (loading) {
    return (
      <div className={cn("h-8 w-16 bg-muted/50 rounded-full animate-pulse", compact && "w-12")} />
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center gap-1.5 px-2.5 py-1 rounded-full",
        "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30",
        "transition-all hover:scale-105",
      )}
      aria-label={`${coins} coins`}
      title={`${coins} coins`}
    >
      <Coins className="h-3.5 w-3.5 text-amber-500" />
      <span className="text-sm font-semibold tabular-nums">{coins.toLocaleString()}</span>

      {/* Floating coin gain animation */}
      {recentCoinGain && (
        <span
          key={recentCoinGain.key}
          className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-amber-500 pointer-events-none animate-coin-pop whitespace-nowrap"
        >
          +{recentCoinGain.amount} 🪙
        </span>
      )}
    </div>
  );
};

export default CoinWallet;
