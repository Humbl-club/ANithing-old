import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 hover:shadow-glow-primary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105",
        outline: "border border-white/20 bg-white/5 backdrop-blur-xl text-foreground hover:bg-white/10 hover:border-primary/50 hover:shadow-glow-primary hover:scale-[1.02] hover:-translate-y-0.5",
        secondary: "bg-white/10 backdrop-blur-xl border border-white/10 text-secondary-foreground hover:bg-white/15 hover:border-white/20 hover:scale-105 hover:-translate-y-0.5",
        ghost: "hover:bg-white/10 hover:text-accent-foreground hover:scale-[1.02] hover:-translate-y-0.5 backdrop-blur-xl",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-primary text-primary-foreground hover:shadow-glow-primary hover:scale-105 hover:-translate-y-1 font-semibold backdrop-blur-xl",
        accent: "bg-gradient-secondary text-accent-foreground hover:shadow-glow-accent hover:scale-105 hover:-translate-y-1 font-semibold backdrop-blur-xl",
        glassmorphism: "bg-white/10 backdrop-blur-2xl border border-white/20 text-foreground hover:bg-white/15 hover:border-primary/50 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-glow-primary",
        appleGlass: "bg-white/8 backdrop-blur-2xl border border-white/15 text-foreground hover:bg-white/12 hover:border-white/25 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-glass-lg",
        pink: "bg-gradient-pink text-white hover:shadow-glow-pink hover:scale-105 hover:-translate-y-1 font-semibold backdrop-blur-xl",
        purple: "bg-gradient-purple text-white hover:shadow-glow-purple hover:scale-105 hover:-translate-y-1 font-semibold backdrop-blur-xl",
        rainbow: "bg-gradient-rainbow text-white hover:shadow-glow-rainbow hover:scale-105 hover:-translate-y-1 font-semibold backdrop-blur-xl",
        glass: "bg-glass/60 backdrop-blur-2xl border border-glass-border/50 text-foreground hover:bg-glass/80 hover:border-primary/40 hover:shadow-glow-primary hover:scale-[1.02] hover:-translate-y-0.5",
        shimmer: "bg-gradient-primary text-primary-foreground hover:shadow-glow-primary hover:scale-105 hover:-translate-y-1 font-semibold relative before:absolute before:inset-0 before:bg-shimmer before:bg-[length:200%_100%] hover:before:animate-shimmer backdrop-blur-xl"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-8 text-base",
        xl: "h-12 px-10 text-lg",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        bounce: "hover:animate-bounce-subtle",
        pulse: "hover:animate-pulse-glow",
        glow: "animate-glow-pulse"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none"
    },
  }
)
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  ripple?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, animation, asChild = false, ripple, children, ...props }, ref) => {
    const [rippleCoords, setRippleCoords] = React.useState<{ x: number; y: number } | null>(null)
    const [isPressed, setIsPressed] = React.useState(false)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple) {
        const rect = e.currentTarget.getBoundingClientRect()
        setRippleCoords({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
        setIsPressed(true)
        setTimeout(() => setIsPressed(false), 300)
      }
      props.onClick?.(e)
    }

    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, animation }), className)}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {children}
        
        {/* Apple Glass reflection effects for glass variants */}
        {variant && ['glassmorphism', 'appleGlass', 'glass', 'outline', 'secondary', 'ghost'].includes(variant) && (
          <>
            {/* Primary glass reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent pointer-events-none rounded-xl" />
            
            {/* Top highlight edge */}
            <div className="absolute top-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
          </>
        )}
        
        {/* Enhanced shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-700 pointer-events-none rounded-xl" />
        
        {/* Ripple effect */}
        {ripple && rippleCoords && isPressed && (
          <div
            className="absolute rounded-full bg-white/30 animate-ping pointer-events-none"
            style={{
              left: rippleCoords.x - 10,
              top: rippleCoords.y - 10,
              width: 20,
              height: 20
            }}
          />
        )}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
