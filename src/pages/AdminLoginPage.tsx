import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, LogIn } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome, Administrator!");
      navigate("/admin");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{
      background: "linear-gradient(135deg, hsl(220 25% 10%), hsl(240 20% 15%), hsl(260 25% 12%))"
    }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-18 w-18 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ width: 72, height: 72 }}>
            <Shield className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Admin Access</h1>
          <p className="text-sm mt-1 text-white/50">EcoSort AI — Restricted Area</p>
        </div>

        <div className="rounded-2xl p-8 border border-white/10 shadow-2xl" style={{
          background: "linear-gradient(180deg, hsl(220 20% 16%), hsl(220 20% 12%))"
        }}>
          <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <Shield className="h-4 w-4 text-red-400" />
            <span className="text-xs text-red-300 font-medium">Authorized personnel only</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-white/70">Admin Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ecosort.ai"
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-red-500/50"
                required
              />
            </div>
            <div>
              <Label className="text-white/70">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-red-500/50"
                required
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 border-0 text-white font-semibold text-base shadow-lg shadow-red-500/25"
            >
              {loading ? "Authenticating..." : <><LogIn className="h-4 w-4 mr-2" />Admin Sign In</>}
            </Button>
          </form>

          <div className="text-center mt-5">
            <a href="/login" className="text-xs text-white/40 hover:text-white/60 transition-colors">
              ← Back to User Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
