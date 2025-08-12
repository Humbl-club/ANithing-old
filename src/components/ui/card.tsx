import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "relative rounded-xl border text-card-foreground transition-all duration-500 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-card shadow-sm",
        glass: "bg-glass/60 border-glass-border/50 backdrop-blur-xl shadow-glass-lg hover:shadow-glass-xl hover:bg-glass/80 hover:border-primary/30 hover:scale-[1.01] hover:-translate-y-0.5",
        glassMorphism: "bg-card/15 backdrop-blur-2xl border-white/10 shadow-glass-lg hover:bg-card/25 hover:border-primary/25 hover:shadow-glass-xl hover:scale-[1.01] hover:-translate-y-1",
        appleGlass: "bg-white/5 backdrop-blur-2xl border-white/10 shadow-glass-xl hover:bg-white/10 hover:border-white/20 hover:shadow-glow-primary hover:scale-[1.01] hover:-translate-y-0.5",
        gradient: "bg-gradient-card border-border/50 shadow-lg hover:shadow-xl hover:scale-[1.01]",
        glow: "bg-card/40 backdrop-blur-md border-primary/20 shadow-glow-card hover:shadow-glow-primary hover:border-primary/40 hover:bg-card/60",
        animated: "bg-card shadow-sm hover:scale-[1.02] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out",
        premium: "bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-2xl border-white/10 shadow-glass-xl hover:from-white/12 hover:to-white/6 hover:border-white/20 hover:shadow-glow-primary hover:scale-[1.01] hover:-translate-y-1"
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10"
      }
    },
    defaultVariants: {
      variant: "glass",
      size: "default"
    }
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      
      {/* Apple Glass reflection effects */}
      {variant && ['glass', 'glassMorphism', 'appleGlass', 'premium'].includes(variant) && (
        <>
          {/* Primary glass reflection */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
          
          {/* Subtle border highlight */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          {/* Top highlight edge */}
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        </>
      )}
    </div>
  )
)
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 relative z-10", className)}
    {...props}
  />
))

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 relative z-10", className)} {...props} />
))

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 relative z-10", className)}
    {...props}
  />
))

Card.displayName = "Card"
CardHeader.displayName = "CardHeader"
CardTitle.displayName = "CardTitle"
CardDescription.displayName = "CardDescription"
CardContent.displayName = "CardContent"
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }
