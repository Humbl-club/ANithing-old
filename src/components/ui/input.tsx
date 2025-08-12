import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-xl px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border border-input bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        glass: "bg-white/8 backdrop-blur-xl border border-white/20 focus:bg-white/12 focus:border-primary/40 focus:shadow-glow-primary hover:bg-white/10 hover:border-white/25",
        appleGlass: "bg-white/6 backdrop-blur-2xl border border-white/15 focus:bg-white/10 focus:border-white/30 focus:shadow-glass-lg hover:bg-white/8 hover:border-white/20",
        outline: "border-2 border-white/20 bg-transparent backdrop-blur-xl focus:border-primary focus:shadow-glow-primary hover:border-white/30",
        filled: "bg-white/10 backdrop-blur-xl border border-white/10 focus:bg-white/15 focus:border-primary hover:bg-white/12",
        underline: "border-0 border-b-2 border-white/20 rounded-none bg-transparent focus:border-primary px-0 backdrop-blur-xl",
        floating: "bg-white/8 backdrop-blur-2xl border border-white/15 hover:bg-white/10 focus:bg-white/12 focus:border-primary/50 focus:shadow-glass-lg"
      },
      size: {
        sm: "h-8 text-xs",
        default: "h-10",
        lg: "h-12 text-base",
        xl: "h-14 text-lg px-4"
      },
      state: {
        default: "",
        error: "border-destructive focus:border-destructive focus:ring-destructive",
        success: "border-green-500 focus:border-green-500 focus:ring-green-500",
        warning: "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default"
    }
  }
)

export interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, state, type, ...props }, ref) => {
    const isGlassVariant = variant && ['glass', 'appleGlass', 'floating'].includes(variant);
    
    if (isGlassVariant) {
      return (
        <div className="relative">
          <input
            type={type}
            className={cn(inputVariants({ variant, size, state }), "relative z-10", className)}
            ref={ref}
            {...props}
          />
          {/* Glass reflection effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-transparent pointer-events-none rounded-xl" />
          <div className="absolute top-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        </div>
      );
    }
    
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size, state }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)

// Glass Input with enhanced styling
const GlassInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        variant="appleGlass"
        className={cn("glass-input", className)}
        ref={ref}
        {...props}
      />
    )
  }
)

// Floating Label Input
interface FloatingInputProps extends InputProps {
  label?: string
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const handleFocus = () => setFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false)
      setHasValue(!!e.target.value)
    }

    return (
      <div className="relative">
        <Input
          className={cn("peer", className)}
          variant="floating"
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder=" "
          {...props}
        />
        {label && (
          <label className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-200 pointer-events-none",
            "peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary",
            "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-primary"
          )}>
            {label}
          </label>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"
GlassInput.displayName = "GlassInput"
FloatingInput.displayName = "FloatingInput"

export { Input, GlassInput, FloatingInput, inputVariants }
