import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, LogIn, UserPlus, Shield } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "signup") {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created successfully! You can now sign in.");
        setMode("login");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{
      background: "linear-gradient(135deg, hsl(152 30% 8%), hsl(168 25% 12%), hsl(140 20% 10%))"
    }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl gradient-eco flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <Leaf className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">EcoSort AI</h1>
          <p className="text-sm mt-1 text-white/50">Smart Waste Management System</p>
        </div>

        <div className="rounded-2xl p-8 border border-white/10 shadow-2xl" style={{
          background: "linear-gradient(180deg, hsl(152 15% 14%), hsl(152 10% 10%))"
        }}>
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${mode === "login" ? "bg-primary text-primary-foreground shadow-sm" : "text-white/50 hover:text-white/70"}`}
            >
              <LogIn className="h-3.5 w-3.5 inline mr-1.5" />Sign In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${mode === "signup" ? "bg-primary text-primary-foreground shadow-sm" : "text-white/50 hover:text-white/70"}`}
            >
              <UserPlus className="h-3.5 w-3.5 inline mr-1.5" />Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label className="text-white/70">Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/30" required />
              </div>
            )}
            <div>
              <Label className="text-white/70">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/30" required />
            </div>
            <div>
              <Label className="text-white/70">Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/30" required minLength={6} />
            </div>

            <Button type="submit" disabled={loading} className="w-full btn-glow gradient-eco border-0 text-primary-foreground h-12 text-base font-semibold">
              {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="flex items-center justify-between mt-5">
            <p className="text-xs text-white/30">
              {mode === "login" ? "Don't have an account? Sign up above." : "Already have an account? Sign in above."}
            </p>
            <Link to="/admin-login" className="text-xs text-white/30 hover:text-white/50 flex items-center gap-1 transition-colors">
              <Shield className="h-3 w-3" /> Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
