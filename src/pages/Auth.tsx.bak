import { useState } from "react";
import { Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft } from "lucide-react";
import { 
  AuthWelcomeHeader, 
  AuthForm, 
  ForgotPasswordForm, 
  ResendConfirmationCard 
} from "@/features/auth/components";

const Auth = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('tab') === 'signup');
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [lastSignupEmail, setLastSignupEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleToggleMode = (newIsSignUp: boolean) => {
    setIsSignUp(newIsSignUp);
    setShowResendConfirmation(false);
    setShowForgotPassword(false);
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleShowResendConfirmation = (email: string) => {
    setLastSignupEmail(email);
    setShowResendConfirmation(true);
  };

  const handleBackToAuth = () => {
    setShowForgotPassword(false);
    setShowResendConfirmation(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Back to Home Arrow */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 p-3 glass-card border border-primary/20 rounded-full hover:bg-primary/10 transition-all duration-200 hover-scale group z-10"
        aria-label="Back to home"
      >
        <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </button>

      <div className="w-full max-w-md">
        <AuthWelcomeHeader />

        {showResendConfirmation ? (
          <ResendConfirmationCard
            email={lastSignupEmail}
            onBack={handleBackToAuth}
          />
        ) : showForgotPassword ? (
          <ForgotPasswordForm
            onBack={handleBackToAuth}
          />
        ) : (
          <AuthForm
            isSignUp={isSignUp}
            onToggleMode={handleToggleMode}
            onForgotPassword={handleForgotPassword}
            onShowResendConfirmation={handleShowResendConfirmation}
          />
        )}
      </div>
    </div>
  );
};

export default Auth;