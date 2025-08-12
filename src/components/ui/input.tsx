import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-lg px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border border-input bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        glass: "bg-glass backdrop-blur-lg border border-glass-border focus:bg-glass-focus focus:border-primary/40 focus:shadow-glow-primary",
        outline: "border-2 border-border bg-transparent focus:border-primary focus:shadow-glow-primary",
        filled: "bg-muted border border-transparent focus:bg-background focus:border-primary",
        underline: "border-0 border-b-2 border-border rounded-none bg-transparent focus:border-primary px-0",
        floating: "bg-glass/50 backdrop-blur-md border border-glass-border hover:bg-glass-hover focus:bg-glass-focus focus:border-primary/50 focus:shadow-lg"
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
        variant="glass"
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
