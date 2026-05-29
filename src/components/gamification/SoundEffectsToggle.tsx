import { Volume2, VolumeX } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useGamification } from "@/contexts/GamificationContext";

const SoundEffectsToggle = () => {
  const { soundEnabled, setSoundEnabled } = useGamification();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {soundEnabled ? (
          <Volume2 className="h-5 w-5 text-primary" />
        ) : (
          <VolumeX className="h-5 w-5 text-muted-foreground" />
        )}
        <div>
          <p className="font-medium">Sound Effects</p>
          <p className="text-sm text-muted-foreground">
            Toggle clicks, coin pops, and completion chimes
          </p>
        </div>
      </div>
      <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
    </div>
  );
};

export default SoundEffectsToggle;
