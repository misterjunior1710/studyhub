import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";
import { soundManager } from "@/lib/soundManager";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, onCheckedChange, ...props }, ref) => {
  const handleChange = (checked: boolean) => {
    soundManager.init();
    soundManager.play("toggle");
    onCheckedChange?.(checked);
  };
  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-[22px] w-[44px] min-h-[22px] min-w-[44px] shrink-0 cursor-pointer items-center rounded-full border border-muted-foreground/30 bg-muted transition-all duration-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      onCheckedChange={handleChange}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-[18px] w-[18px] rounded-full bg-background shadow-md ring-0 transition-transform duration-200 data-[state=checked]:translate-x-[24px] data-[state=unchecked]:translate-x-[2px]",
        )}
      />
    </SwitchPrimitives.Root>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
