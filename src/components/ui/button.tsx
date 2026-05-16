import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { soundManager } from "@/lib/soundManager";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] hover:scale-[1.02] hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-primary/95 to-primary text-primary-foreground border border-white/15 shadow-[inset_0_1px_0_0_hsl(0_0%_100%_/_0.25),0_4px_14px_-4px_hsl(var(--primary)/0.45)] backdrop-blur-md hover:from-primary hover:to-primary/90 hover:shadow-[inset_0_1px_0_0_hsl(0_0%_100%_/_0.3),0_8px_22px_-6px_hsl(var(--primary)/0.55)] active:from-primary/90 active:to-primary/80",
        liquid:
          "bg-gradient-to-b from-primary/95 to-primary text-primary-foreground border border-white/15 shadow-[inset_0_1px_0_0_hsl(0_0%_100%_/_0.25),0_4px_14px_-4px_hsl(var(--primary)/0.45)] backdrop-blur-md hover:from-primary hover:to-primary/90 hover:shadow-[inset_0_1px_0_0_hsl(0_0%_100%_/_0.3),0_8px_22px_-6px_hsl(var(--primary)/0.55)] active:from-primary/90 active:to-primary/80",
        "liquid-glass":
          "bg-white/10 dark:bg-white/5 text-foreground border border-white/20 dark:border-white/10 backdrop-blur-xl shadow-[inset_0_1px_0_0_hsl(0_0%_100%_/_0.3),inset_0_-1px_0_0_hsl(0_0%_100%_/_0.05),0_8px_24px_-8px_hsl(0_0%_0%_/_0.25)] hover:bg-white/15 dark:hover:bg-white/10 hover:shadow-[inset_0_1px_0_0_hsl(0_0%_100%_/_0.4),inset_0_-1px_0_0_hsl(0_0%_100%_/_0.08),0_12px_32px_-8px_hsl(0_0%_0%_/_0.35)] active:bg-white/20",
        destructive:
          "bg-gradient-to-b from-destructive/95 to-destructive text-destructive-foreground border border-white/15 shadow-[inset_0_1px_0_0_hsl(0_0%_100%_/_0.2),0_4px_14px_-4px_hsl(var(--destructive)/0.45)] backdrop-blur-md hover:from-destructive hover:to-destructive/90",
        outline:
          "border border-input bg-background/60 backdrop-blur-md shadow-[inset_0_1px_0_0_hsl(0_0%_100%_/_0.08)] hover:bg-accent/40 hover:text-accent-foreground hover:border-input/80 hover:shadow-[inset_0_1px_0_0_hsl(0_0%_100%_/_0.12),0_4px_14px_-6px_hsl(0_0%_0%_/_0.2)]",
        secondary:
          "bg-gradient-to-b from-secondary/95 to-secondary/85 text-secondary-foreground border border-white/10 backdrop-blur-md shadow-[inset_0_1px_0_0_hsl(0_0%_100%_/_0.1)] hover:from-secondary hover:to-secondary/80",
        ghost:
          "hover:bg-accent/60 hover:text-accent-foreground hover:backdrop-blur-md active:bg-accent hover:scale-100 hover:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline active:underline hover:scale-100 hover:translate-y-0",
        gradient:
          "bg-gradient-to-r from-primary to-accent text-primary-foreground border border-white/15 shadow-[inset_0_1px_0_0_hsl(0_0%_100%_/_0.25),0_6px_18px_-4px_hsl(var(--primary)/0.5)] backdrop-blur-md hover:shadow-[inset_0_1px_0_0_hsl(0_0%_100%_/_0.3),0_10px_28px_-6px_hsl(var(--primary)/0.6)] hover:opacity-95",
        "gradient-outline":
          "border-2 border-transparent bg-gradient-to-r from-primary to-accent bg-clip-border text-foreground active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Ensure init happens on this gesture (in case it's the very first interaction)
      soundManager.init();
      soundManager.play("click");
      onClick?.(e);
    };
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
