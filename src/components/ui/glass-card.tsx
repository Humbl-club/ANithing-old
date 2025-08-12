import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const glassCardVariants = cva(
  "relative overflow-hidden rounded-xl backdrop-blur-glass border transition-all duration-500",
  {
    variants: {
      variant: {
        default: "bg-glass border-glass-border shadow-lg hover:shadow-xl hover:bg-glass-hover",
        frost: "bg-card/10 backdrop-blur-2xl border-border/20 shadow-2xl hover:bg-card/20 hover:border-primary/30",
        intense: "bg-card/30 backdrop-blur-3xl border-border/40 shadow-2xl hover:bg-card/40 hover:border-primary/50",
        glow: "bg-glass border-glass-border shadow-glow-card hover:shadow-glow-primary hover:border-primary/40",
        pink: "bg-pink-500/5 backdrop-blur-glass border-pink-500/20 shadow-lg hover:bg-pink-500/10 hover:border-pink-500/40 hover:shadow-glow-pink",
        purple: "bg-purple-500/5 backdrop-blur-glass border-purple-500/20 shadow-lg hover:bg-purple-500/10 hover:border-purple-500/40 hover:shadow-glow-purple",
        rainbow: "bg-gradient-rainbow/5 backdrop-blur-glass border-primary/20 shadow-lg hover:bg-gradient-rainbow/10 hover:border-primary/40 hover:shadow-glow-rainbow"
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10"
      },
      animation: {
        none: "",
        subtle: "hover:scale-[1.01] hover:-translate-y-0.5",
        medium: "hover:scale-[1.02] hover:-translate-y-1",
        strong: "hover:scale-[1.03] hover:-translate-y-2"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "subtle"
    }
  }
)

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  shimmer?: boolean
  blur?: "light" | "medium" | "heavy"
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, size, animation, shimmer, blur, children, ...props }, ref) => {
    const blurClass = blur === "light" ? "backdrop-blur-sm" 
                    : blur === "medium" ? "backdrop-blur-md"
                    : blur === "heavy" ? "backdrop-blur-heavy"
                    : ""

    return (
      <div
        ref={ref}
        className={cn(
          glassCardVariants({ variant, size, animation }),
          blurClass,
          shimmer && "relative before:absolute before:inset-0 before:bg-shimmer before:bg-[length:200%_100%] before:animate-shimmer before:pointer-events-none",
          className
        )}
        {...props}
      >
        {children}
        
        {/* Glass reflection effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
        
        {/* Subtle border highlight */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>
    )
  }
)

const GlassCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 relative z-10", className)}
    {...props}
  />
))

const GlassCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-foreground/90 relative z-10",
      className
    )}
    {...props}
  />
))

const GlassCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground/80 relative z-10", className)}
    {...props}
  />
))

const GlassCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("relative z-10", className)} {...props} />
))

const GlassCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center relative z-10", className)}
    {...props}
  />
))

GlassCard.displayName = "GlassCard"
GlassCardHeader.displayName = "GlassCardHeader"
GlassCardTitle.displayName = "GlassCardTitle"
GlassCardDescription.displayName = "GlassCardDescription"
GlassCardContent.displayName = "GlassCardContent"
GlassCardFooter.displayName = "GlassCardFooter"

export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
  glassCardVariants
}