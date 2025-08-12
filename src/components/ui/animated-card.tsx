import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const animatedCardVariants = cva(
  "relative overflow-hidden rounded-xl border text-card-foreground transition-all duration-500 group cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-card shadow-sm hover:shadow-lg hover:-translate-y-1",
        glass: "bg-glass border-glass-border backdrop-blur-glass shadow-lg hover:shadow-xl hover:bg-glass-hover",
        gradient: "bg-gradient-card border-border/50 shadow-lg hover:shadow-glow-primary",
        glow: "bg-card border-primary/20 shadow-glow-card hover:shadow-glow-primary hover:border-primary/40",
        float: "bg-card shadow-sm hover:shadow-2xl hover:-translate-y-3 hover:rotate-1",
        tilt: "bg-card shadow-sm hover:shadow-xl transform-gpu hover:rotate-3d",
        scale: "bg-card shadow-sm hover:shadow-lg hover:scale-105",
        slide: "bg-card shadow-sm hover:shadow-lg hover:translate-x-2 hover:-translate-y-1"
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10"
      },
      animation: {
        subtle: "hover:scale-[1.02] hover:-translate-y-1",
        medium: "hover:scale-[1.05] hover:-translate-y-2",
        strong: "hover:scale-[1.08] hover:-translate-y-4",
        bounce: "hover:animate-bounce-subtle",
        float: "hover:animate-float",
        pulse: "hover:animate-pulse-glow",
        glow: "hover:animate-glow-pulse"
      },
      borderGlow: {
        none: "",
        primary: "hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)]",
        pink: "hover:shadow-[0_0_20px_hsl(329_75%_51%/0.4)]",
        purple: "hover:shadow-[0_0_20px_hsl(270_91%_65%/0.4)]",
        rainbow: "hover:shadow-[0_0_30px_hsl(219_100%_65%/0.2),0_0_40px_hsl(329_75%_51%/0.3)]"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "subtle",
      borderGlow: "none"
    }
  }
)

export interface AnimatedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof animatedCardVariants> {
  sparkles?: boolean
  ripple?: boolean
  magnetic?: boolean
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation, 
    borderGlow, 
    sparkles, 
    ripple, 
    magnetic,
    children, 
    onMouseMove,
    onMouseLeave,
    ...props 
  }, ref) => {
    const cardRef = React.useRef<HTMLDivElement>(null)
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
    const [isHovering, setIsHovering] = React.useState(false)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (magnetic && cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const deltaX = (e.clientX - centerX) * 0.1
        const deltaY = (e.clientY - centerY) * 0.1
        
        setMousePosition({ x: deltaX, y: deltaY })
      }
      onMouseMove?.(e)
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      setMousePosition({ x: 0, y: 0 })
      setIsHovering(false)
      onMouseLeave?.(e)
    }

    const handleMouseEnter = () => {
      setIsHovering(true)
    }

    return (
      <div
        ref={cardRef}
        className={cn(animatedCardVariants({ variant, size, animation, borderGlow }), className)}
        style={magnetic ? {
          transform: `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale(${isHovering ? 1.02 : 1})`
        } : undefined}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        {...props}
      >
        {children}
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Border glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Sparkles effect */}
        {sparkles && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-primary rounded-full animate-particle-float"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${10 + i * 10}%`,
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </div>
        )}
        
        {/* Ripple effect */}
        {ripple && isHovering && (
          <div className="absolute inset-0 rounded-xl">
            <div className="absolute inset-0 rounded-xl bg-primary/10 animate-ping" />
            <div className="absolute inset-2 rounded-xl bg-primary/5 animate-ping animation-delay-75" />
          </div>
        )}
        
        {/* Content wrapper with relative positioning */}
        <div className="relative z-10">
          {typeof children === 'function' ? children({ isHovering }) : children}
        </div>
      </div>
    )
  }
)

const AnimatedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 relative z-10", className)}
    {...props}
  />
))

const AnimatedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-foreground/90 relative z-10 group-hover:text-primary transition-colors duration-300",
      className
    )}
    {...props}
  />
))

const AnimatedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground/80 relative z-10 group-hover:text-muted-foreground transition-colors duration-300", className)}
    {...props}
  />
))

const AnimatedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("relative z-10", className)} {...props} />
))

const AnimatedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center relative z-10", className)}
    {...props}
  />
))

AnimatedCard.displayName = "AnimatedCard"
AnimatedCardHeader.displayName = "AnimatedCardHeader"
AnimatedCardTitle.displayName = "AnimatedCardTitle"
AnimatedCardDescription.displayName = "AnimatedCardDescription"
AnimatedCardContent.displayName = "AnimatedCardContent"
AnimatedCardFooter.displayName = "AnimatedCardFooter"

export {
  AnimatedCard,
  AnimatedCardHeader,
  AnimatedCardTitle,
  AnimatedCardDescription,
  AnimatedCardContent,
  AnimatedCardFooter,
  animatedCardVariants
}