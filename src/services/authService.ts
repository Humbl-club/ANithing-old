import { supabase } from '@/lib/supabaseClient';

export const authService = {
  signUp: async (email: string, password: string) => {
    const result = await supabase.auth.signUp({ email, password });
    return {
      success: !result.error,
      error: result.error,
      data: result.data,
      needsConfirmation: true
    };
  },
  
  signIn: async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({ email, password });
    return {
      success: !result.error,
      error: result.error,
      data: result.data
    };
  },
  
  resendConfirmation: async (email: string) => {
    const result = await supabase.auth.resend({ type: 'signup', email });
    return {
      success: !result.error,
      error: result.error,
      message: result.error ? result.error.message : 'Confirmation email sent!'
    };
  }
};
