import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[5px_5px_0px_1px_rgba(0,_0,_0,_0.8)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all ease-in-out",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all ease-in-out",
        outline:
          "shadow-xl text-primary hover:bg-primary hover:text-white border bg-primary/10 dark:bg-input/30 dark:border-input dark:hover:bg-input/50 hover:shadow-none hover:-translate-y-1 transition-all ease-in-out",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all ease-in-out",
        ghost:
          "hover:bg-accent hover:text-accent-foreground hover:shadow-none hover:-translate-y-1 transition-all ease-in-out",
        link: "text-primary underline-offset-4 hover:underline hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all ease-in-out",
        success:
          "bg-success text-success-foreground hover:bg-success/90 focus-visible:ring-success/20 dark:focus-visible:ring-success/40 dark:bg-success/60 shadow-[5px_5px_0px_1px_rgba(0,_0,_0,_0.8)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all ease-in-out",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  alt,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    alt?: string;
  }) {
  const Comp = asChild ? Slot : "button";

  const button = (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );

  if (alt) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>{alt}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

export { Button, buttonVariants };
