import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail } from 'lucide-react';

interface ResendConfirmationCardProps {
  email: string;
}

export function ResendConfirmationCard({ email }: ResendConfirmationCardProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const { resendConfirmation } = useAuth();

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    const result = await resendConfirmation(email);
    
    if (!result.success) {
      const errorMessage = result.error && typeof result.error === 'object' && 'message' in result.error 
        ? result.error.message 
        : 'Failed to resend confirmation';
      setError(errorMessage);
    } else {
      setSuccess(true);
    }
    
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Confirmation</CardTitle>
        <CardDescription>
          We've sent a confirmation email to {email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <AlertDescription>
              Confirmation email sent! Please check your inbox.
            </AlertDescription>
          </Alert>
        )}
        
        <Button
          onClick={handleResend}
          disabled={loading}
          className="w-full"
          variant="outline"
        >
          <Mail className="mr-2 h-4 w-4" />
          {loading ? 'Sending...' : 'Resend Confirmation Email'}
        </Button>
      </CardContent>
    </Card>
  );
}
