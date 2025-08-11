import { supabase } from '@/integrations/supabase/client';
import { AppError, errorHandler } from '@/lib/errorHandling';
import { connectionManager } from '@/lib/supabaseConnection';
import { sanitizeString, authRateLimiter } from '@/utils/simpleSecurity';
const sanitizeInput = (input: string): string => {
  return sanitizeString(input).toLowerCase();
};
export const authService = {
  async signUp(email: string, password: string) {
    try {
      // Input validation
      if (!email || !password) {
        throw new AppError('Email and password required', 'VALIDATION_ERROR', 400);
      }
      if (password.length < 6) {
        throw new AppError('Password must be at least 6 characters', 'WEAK_PASSWORD', 400);
      }
      const sanitizedEmail = sanitizeInput(email);
      // Execute with retry logic
      const result = await connectionManager.executeWithRetry(
        async () => {
          const { data, error } = await supabase.auth.signUp({
            email: sanitizedEmail,
            password,
            options: {
              // Simple redirect URL
              emailRedirectTo: `${window.location.origin}/auth/callback`,
              data: {
                email_verified: false
              }
            }
          });
          if (error) throw error;
          return data;
        },
        'Sign up'
      );
      return { data: result, error: null };
    } catch (error) {
      return errorHandler.handleError(error as Error | AppError);
    }
  },
  async signIn(email: string, password: string) {
    try {
      const sanitizedEmail = sanitizeInput(email);
      const result = await connectionManager.executeWithRetry(
        async () => {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: sanitizedEmail,
            password
          });
          if (error) {
            if (error.message.includes('Invalid login credentials')) {
              throw new AppError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
            }
            throw error;
          }
          return data;
        },
        'Sign in'
      );
      return { data: result, error: null };
    } catch (error) {
      return errorHandler.handleError(error as Error | AppError);
    }
  },
  async signOut() {
    try {
      await connectionManager.executeWithRetry(
        async () => {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
        },
        'Sign out'
      );
      return { error: null };
    } catch (error) {
      return errorHandler.handleError(error as Error | AppError);
    }
  },
  async signInWithGoogle() {
    try {
      const result = await connectionManager.executeWithRetry(
        async () => {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/dashboard`,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent'
              }
            }
          });
          if (error) throw error;
          return data;
        },
        'Google sign in'
      );
      return { data: result, error: null };
    } catch (error) {
      return errorHandler.handleError(error as Error | AppError);
    }
  },
  async resendConfirmation(email: string) {
    try {
      if (!email) {
        throw new AppError('Email is required', 'VALIDATION_ERROR', 400);
      }
      const sanitizedEmail = sanitizeInput(email);
      const result = await connectionManager.executeWithRetry(
        async () => {
          const { data, error } = await supabase.auth.resend({
            type: 'signup',
            email: sanitizedEmail
          });
          if (error) throw error;
          return data;
        },
        'Resend confirmation'
      );
      return { data: result, error: null };
    } catch (error) {
      return errorHandler.handleError(error as Error | AppError);
    }
  }
};