import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Phone, Shield, Coins, Save, Camera, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, isAdmin } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [totalCredits, setTotalCredits] = useState(0);
  const [totalScans, setTotalScans] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [profileRes, creditsRes, scansRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("green_credits").select("credits").eq("user_id", user.id),
        supabase.from("detection_history").select("id").eq("user_id", user.id),
      ]);
      if (profileRes.data) {
        setFullName(profileRes.data.full_name || "");
        setPhone(profileRes.data.phone || "");
      }
      if (creditsRes.data) {
        setTotalCredits(creditsRes.data.reduce((a, b) => a + b.credits, 0));
      }
      if (scansRes.data) {
        setTotalScans(scansRes.data.length);
      }
    };
    fetch();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles")
      .update({ full_name: fullName, phone })
      .eq("user_id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Profile updated! 🌱");
    setSaving(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account and view your impact</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Green Credits", value: totalCredits, icon: Coins, color: "from-primary/10 to-accent/10 border-primary/20" },
          { label: "AI Scans", value: totalScans, icon: Camera, color: "from-blue-500/10 to-cyan-500/10 border-blue-500/20" },
          { label: "Rank", value: isAdmin ? "Admin" : "User", icon: isAdmin ? Shield : Trophy, color: "from-purple-500/10 to-pink-500/10 border-purple-500/20" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-xl p-5 border bg-gradient-to-br ${stat.color} text-center hover:shadow-elevated transition-shadow`}
          >
            <stat.icon className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-display font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl p-6 shadow-elevated border"
      >
        <h3 className="font-display font-semibold mb-5 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" /> Account Details
        </h3>

        <div className="space-y-4">
          <div>
            <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email</Label>
            <Input value={user?.email || ""} disabled className="mt-1.5 bg-muted/50" />
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-muted-foreground" /> Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your name" className="mt-1.5" />
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXXXXXXX" className="mt-1.5" />
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/20">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Administrator Access</span>
            </div>
          )}

          <Button onClick={handleSave} disabled={saving} className="w-full btn-glow gradient-eco border-0 text-primary-foreground h-11">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
