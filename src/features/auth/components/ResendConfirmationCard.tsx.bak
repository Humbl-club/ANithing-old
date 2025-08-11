import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface ResendConfirmationCardProps {
  email: string;
  onBack: () => void;
}

export function ResendConfirmationCard({ email, onBack }: ResendConfirmationCardProps) {
  const { resendConfirmation } = useAuth();
  const [isResending, setIsResending] = useState(false);

  const handleResendConfirmation = async () => {
    setIsResending(true);
    try {
      const result = await resendConfirmation(email);
      if (result.success) {
        toast.success('Confirmation email sent! Check your inbox.');
      } else {
        toast.error(result.error || 'Failed to resend confirmation');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend confirmation');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-card border border-green-500/20 glow-success">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">Check Your Email!</CardTitle>
          <CardDescription>
            We've sent a verification link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">Click the link in your email to verify your account.</p>
            <p>Didn't receive the email? Check your spam folder or resend it.</p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleResendConfirmation}
              disabled={isResending}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              {isResending ? 'Sending...' : 'Resend Email'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}