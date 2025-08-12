import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const gradientButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        primary: "bg-gradient-primary text-primary-foreground hover:shadow-glow-primary hover:scale-105 font-semibold",
        secondary: "bg-gradient-secondary text-secondary-foreground hover:shadow-glow-accent hover:scale-105 font-semibold",
        pink: "bg-gradient-pink text-white hover:shadow-glow-pink hover:scale-105 font-semibold",
        purple: "bg-gradient-purple text-white hover:shadow-glow-purple hover:scale-105 font-semibold",
        rainbow: "bg-gradient-rainbow text-white hover:shadow-glow-rainbow hover:scale-105 font-semibold",
        glass: "bg-glass backdrop-blur-lg border border-glass-border text-foreground hover:bg-glass-hover hover:border-primary/40 hover:shadow-glow-primary",
        outline: "border-2 border-transparent bg-gradient-primary bg-clip-border text-transparent bg-clip-text hover:text-white hover:bg-clip-padding hover:shadow-glow-primary",
        ghost: "bg-transparent hover:bg-gradient-primary/20 hover:text-primary-foreground backdrop-blur-sm"
      },
      size: {
        sm: "h-9 px-4 text-xs",
        default: "h-11 px-6 py-2",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-11 w-11"
      },
      animation: {
        none: "",
        pulse: "animate-pulse-glow",
        bounce: "hover:animate-bounce-subtle",
        gradient: "bg-[length:200%_200%] hover:animate-gradient-shift",
        shimmer: "relative before:absolute before:inset-0 before:bg-shimmer before:bg-[length:200%_100%] hover:before:animate-shimmer"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      animation: "none"
    }
  }
)

export interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gradientButtonVariants> {
  asChild?: boolean
  glow?: boolean
  ripple?: boolean
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant, size, animation, asChild = false, glow, ripple, children, ...props }, ref) => {
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
        className={cn(
          gradientButtonVariants({ variant, size, animation }),
          glow && "hover:shadow-glow-button-hover",
          className
        )}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {children}
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
        
        {/* Ripple effect */}
        {ripple && rippleCoords && isPressed && (
          <div
            className="absolute rounded-full bg-white/20 animate-ping pointer-events-none"
            style={{
              left: rippleCoords.x - 10,
              top: rippleCoords.y - 10,
              width: 20,
              height: 20
            }}
          />
        )}
        
        {/* Glow overlay */}
        {glow && (
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" />
        )}
      </Comp>
    )
  }
)

GradientButton.displayName = "GradientButton"

export { GradientButton, gradientButtonVariants }