import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDebounce } from "use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import EnhancedEmailInput from "@/features/user/components/EnhancedEmailInput";
import EnhancedPasswordInput from "@/features/user/components/EnhancedPasswordInput";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthFormProps {
  isSignUp: boolean;
  onToggleMode: (isSignUp: boolean) => void;
  onForgotPassword: () => void;
  onShowResendConfirmation: (email: string) => void;
}

export function AuthForm({ isSignUp, onToggleMode, onForgotPassword, onShowResendConfirmation }: AuthFormProps) {
  const { signUp, signIn, signInWithGoogle, validateEmailFormat, validatePasswordStrength } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const { watch, setValue, getValues } = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    },
    mode: "onChange"
  });

  const watchedValues = watch();
  const [debouncedEmail] = useDebounce(watchedValues.email, 500);

  // Validation states
  const emailValidation = watchedValues.email ? validateEmailFormat(watchedValues.email) : { isValid: false, errors: [] };
  const passwordValidation = isSignUp 
    ? (watchedValues.password ? validatePasswordStrength(watchedValues.password) : { isValid: false, score: 0, errors: [] })
    : { isValid: watchedValues.password.length > 0, score: 0, errors: [] };
  const passwordsMatch = isSignUp ? watchedValues.password === watchedValues.confirmPassword && watchedValues.confirmPassword.length > 0 : true;

  const isFormValid = emailValidation.isValid && 
                     passwordValidation.isValid && 
                     passwordsMatch &&
                     watchedValues.email.length > 0 &&
                     watchedValues.password.length > 0 &&
                     (!isSignUp || watchedValues.confirmPassword.length > 0) &&
                     (!isSignUp || !emailExists);

  // Check if email exists when user is signing up
  useEffect(() => {
    const checkEmailExists = async () => {
      if (!isSignUp || !debouncedEmail || !emailValidation.isValid) {
        setEmailExists(false);
        setCheckingEmail(false);
        return;
      }

      setCheckingEmail(true);
      try {
        // Try the new secure function first, fallback to old function if needed
        let response;
        try {
          response = await supabase.functions.invoke('check-email-secure', {
            body: { email: debouncedEmail }
          });
        } catch (secureError) {
          // Fallback to old function if secure one fails
          console.warn('Secure email check failed, falling back to old function:', secureError);
          response = await supabase.functions.invoke('check-email-exists', {
            body: { email: debouncedEmail }
          });
        }
        
        const { data, error } = response;
        if (error) {
          setEmailExists(false);
        } else {
          setEmailExists(data.exists);
        }
      } catch (error) {
        setEmailExists(false);
      } finally {
        setCheckingEmail(false);
      }
    };

    checkEmailExists();
  }, [debouncedEmail, emailValidation.isValid, isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error('Please complete all required fields correctly.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        const result = await signUp(watchedValues.email, watchedValues.password);
        if (result.success) {
          onShowResendConfirmation(watchedValues.email);
          toast.success('Welcome! Please check your email to verify your account.');
        } else {
          toast.error(result.error || 'Signup failed');
        }
      } else {
        const result = await signIn(watchedValues.email, watchedValues.password);
        if (result.success) {
          toast.success('Welcome back!');
        } else {
          toast.error(result.error || 'Sign in failed');
        }
      }
    } catch (error: any) {
      toast.error(error.message || `${isSignUp ? 'Signup' : 'Sign in'} failed`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast.error(error.message || 'Google sign-in failed');
    }
  };

  return (
    <Card className="glass-card border border-primary/20 glow-card">
      <CardHeader className="text-center">
        <Tabs value={isSignUp ? "signup" : "signin"} onValueChange={(value) => onToggleMode(value === "signup")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to continue your anime journey</CardDescription>
          </TabsContent>
          
          <TabsContent value="signup">
            <CardTitle className="text-2xl">Join Anithing</CardTitle>
            <CardDescription>Create your account and discover amazing anime</CardDescription>
          </TabsContent>
        </Tabs>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <EnhancedEmailInput
              id="email"
              value={watchedValues.email}
              onChange={(value) => setValue('email', value)}
              validation={emailValidation}
              showValidation={watchedValues.email.length > 0}
              disabled={isSubmitting}
            />
            {isSignUp && checkingEmail && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Checking email availability...
              </div>
            )}
            {isSignUp && emailExists && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-3 h-3" />
                Email already registered. Try signing in instead.
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <EnhancedPasswordInput
              id="password"
              value={watchedValues.password}
              onChange={(value) => setValue('password', value)}
              validation={passwordValidation}
              showValidation={isSignUp && watchedValues.password.length > 0}
              disabled={isSubmitting}
              isSignUp={isSignUp}
            />
          </div>

          <AnimatePresence>
            {isSignUp && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <EnhancedPasswordInput
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={watchedValues.confirmPassword}
                  onChange={(value) => setValue('confirmPassword', value)}
                  validation={{ isValid: passwordsMatch, score: 0, errors: [] }}
                  showValidation={watchedValues.confirmPassword.length > 0}
                  disabled={isSubmitting}
                  hideStrengthMeter={true}
                />
                {watchedValues.confirmPassword.length > 0 && passwordsMatch && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    Passwords match
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            className="w-full"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </Button>

          {!isSignUp && (
            <div className="text-center">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-primary hover:underline"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <GoogleSignInButton 
          onSignIn={handleGoogleSignIn}
          disabled={isSubmitting}
        />
      </CardContent>
    </Card>
  );
}