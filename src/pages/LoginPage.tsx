import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, LogIn, UserPlus, Shield } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup" | "admin">("login");
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
        toast.success("Account created! Welcome to EcoSort AI.");
        navigate("/dashboard");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-accent/20 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl gradient-eco flex items-center justify-center mx-auto mb-4 shadow-elevated">
            <Leaf className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold">EcoSort AI</h1>
          <p className="text-muted-foreground text-sm mt-1">Smart Waste Management System</p>
        </div>

        <div className="bg-card rounded-2xl shadow-elevated border p-8">
          {/* Mode Tabs */}
          <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${mode === "login" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              <LogIn className="h-3.5 w-3.5 inline mr-1.5" />Login
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${mode === "signup" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              <UserPlus className="h-3.5 w-3.5 inline mr-1.5" />Sign Up
            </button>
            <button
              onClick={() => setMode("admin")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${mode === "admin" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              <Shield className="h-3.5 w-3.5 inline mr-1.5" />Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="mt-1" required />
              </div>
            )}
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1" required />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1" required minLength={6} />
            </div>

            <Button type="submit" disabled={loading} className="w-full btn-glow gradient-eco border-0 text-primary-foreground h-11">
              {loading ? "Please wait..." : mode === "signup" ? "Create Account" : mode === "admin" ? "Admin Login" : "Sign In"}
            </Button>
          </form>

          {mode === "admin" && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              <Shield className="h-3 w-3 inline mr-1" />
              Admin access is restricted to authorized personnel only.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
