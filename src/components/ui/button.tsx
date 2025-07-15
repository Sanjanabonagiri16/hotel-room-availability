import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-lg hover:from-blue-600 hover:to-teal-500 hover:shadow-xl active:scale-95 active:brightness-95",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
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
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    // Responsive: if children is an array and first is an icon, show only icon on mobile, icon+text on sm+ screens
    let content = children;
    if (Array.isArray(children) && React.isValidElement(children[0]) && typeof children[1] === 'string') {
      content = <>
        <span className="block sm:hidden" aria-label={typeof children[1] === 'string' ? children[1] : undefined}>
          {children[0]}
        </span>
        <span className="hidden sm:flex items-center gap-x-2">
          {children[0]} {children[1]}
        </span>
      </>;
    }
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          // Responsive padding, font, min-width
          "px-3 sm:px-4 py-2 rounded-xl text-base sm:text-base md:text-lg min-w-[44px] sm:min-w-[90px] md:min-w-[120px] flex items-center justify-center gap-x-2 transition",
          className
        )}
        ref={ref}
        {...props}
      >
        {content}
      </Comp>
    );
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
