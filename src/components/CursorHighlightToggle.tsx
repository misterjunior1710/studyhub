import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MousePointer2 } from "lucide-react";
import {
  isCursorHighlightEnabled,
  setCursorHighlightEnabled,
  subscribeCursorHighlight,
} from "@/lib/cursorHighlight";

const CursorHighlightToggle = () => {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(isCursorHighlightEnabled());
    return subscribeCursorHighlight(setEnabled);
  }, []);

  const handleChange = (next: boolean) => {
    setEnabled(next);
    setCursorHighlightEnabled(next);
  };

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <MousePointer2 className="h-5 w-5 text-primary mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <Label htmlFor="cursor-highlight-switch" className="text-sm font-medium cursor-pointer">
            Cursor highlight
          </Label>
          <p className="text-xs text-muted-foreground max-w-md">
            Show a subtle circle that follows your pointer. Turn this off if you find it distracting while studying.
          </p>
        </div>
      </div>
      <Switch
        id="cursor-highlight-switch"
        checked={enabled}
        onCheckedChange={handleChange}
        aria-label="Toggle cursor highlight"
      />
    </div>
  );
};

export default CursorHighlightToggle;
