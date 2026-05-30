import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import {
  isCalmModeEnabled,
  setCalmMode,
  subscribeCalmMode,
} from "@/lib/calmMode";

const CalmModeToggle = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(isCalmModeEnabled());
    return subscribeCalmMode(setEnabled);
  }, []);

  const handleChange = (next: boolean) => {
    setEnabled(next);
    setCalmMode(next);
  };

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <Label htmlFor="calm-mode-switch" className="text-sm font-medium cursor-pointer">
            Calm mode
          </Label>
          <p className="text-xs text-muted-foreground max-w-md">
            Disables the cursor highlight, hover bounces, and decorative animations
            for a quieter, more focused study experience.
          </p>
        </div>
      </div>
      <Switch
        id="calm-mode-switch"
        checked={enabled}
        onCheckedChange={handleChange}
        aria-label="Toggle calm mode"
      />
    </div>
  );
};

export default CalmModeToggle;
