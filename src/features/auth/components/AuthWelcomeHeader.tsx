import { Sparkles, Crown } from "lucide-react";

export function AuthWelcomeHeader() {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="p-3 bg-gradient-primary rounded-full glow-primary">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gradient-primary mb-2">Welcome to Anithing</h1>
      <p className="text-muted-foreground mb-6">Your ultimate anime & manga tracking platform</p>
      <div className="glass-card p-4 border border-primary/20 glow-primary">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          <span className="font-semibold text-gradient-primary">Get Your Legendary Username!</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Get a random legendary anime character username automatically! No choosing required.
        </p>
      </div>
    </div>
  );
}