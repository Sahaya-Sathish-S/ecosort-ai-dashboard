import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Medal, Award, Star, Crown, Coins } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  total_credits: number;
  total_disposals: number;
  rank: number;
}

const PRIZE_TIERS = [
  { rank: 1, prize: "₹5,000", color: "from-yellow-400 to-amber-500", icon: Crown, label: "Gold Champion" },
  { rank: 2, prize: "₹3,000", color: "from-slate-300 to-slate-400", icon: Medal, label: "Silver Star" },
  { rank: 3, prize: "₹1,500", color: "from-orange-400 to-orange-600", icon: Award, label: "Bronze Hero" },
];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myCredits, setMyCredits] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from("green_credits")
        .select("user_id, credits, profiles!inner(full_name)")
        .order("credits", { ascending: false });

      if (data) {
        // Aggregate by user
        const userMap = new Map<string, { full_name: string | null; total_credits: number; total_disposals: number }>();
        data.forEach((row: any) => {
          const existing = userMap.get(row.user_id);
          if (existing) {
            existing.total_credits += row.credits;
            existing.total_disposals += 1;
          } else {
            userMap.set(row.user_id, {
              full_name: row.profiles?.full_name || "Anonymous",
              total_credits: row.credits,
              total_disposals: 1,
            });
          }
        });

        const sorted = Array.from(userMap.entries())
          .map(([user_id, data], i) => ({ user_id, ...data, rank: i + 1 }))
          .sort((a, b) => b.total_credits - a.total_credits)
          .map((entry, i) => ({ ...entry, rank: i + 1 }));

        setEntries(sorted);

        if (user) {
          const mine = sorted.find((e) => e.user_id === user.id);
          setMyCredits(mine?.total_credits || 0);
        }
      }
    };

    fetchLeaderboard();

    const channel = supabase
      .channel("leaderboard-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "green_credits" }, () => fetchLeaderboard())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" /> Green Credits Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground">Earn credits by properly disposing waste • Top performers win cash prizes!</p>
      </div>

      {/* My Credits */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 border bg-gradient-to-r from-primary/5 via-primary/10 to-accent/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Your Green Credits</p>
            <p className="text-4xl font-display font-bold text-primary mt-1">{myCredits}</p>
            <p className="text-xs text-muted-foreground mt-1">Dispose waste properly to earn more credits</p>
          </div>
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Coins className="h-8 w-8 text-primary" />
          </div>
        </div>
      </motion.div>

      {/* Prize Tiers */}
      <div className="grid grid-cols-3 gap-3">
        {PRIZE_TIERS.map((tier) => (
          <div key={tier.rank} className={`rounded-xl p-4 text-center bg-gradient-to-br ${tier.color} text-white shadow-lg`}>
            <tier.icon className="h-6 w-6 mx-auto mb-1" />
            <p className="text-xs font-medium opacity-90">{tier.label}</p>
            <p className="text-lg font-display font-bold">{tier.prize}</p>
          </div>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-card rounded-xl shadow-card border overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" /> Rankings
          </h3>
        </div>

        {entries.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No credits earned yet</p>
            <p className="text-sm text-muted-foreground mt-1">Be the first to scan and dispose waste to earn green credits!</p>
          </div>
        ) : (
          <div className="divide-y">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-4 p-4 ${entry.user_id === user?.id ? "bg-primary/5" : ""}`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-display font-bold text-sm ${
                  entry.rank === 1 ? "bg-yellow-400 text-yellow-900" :
                  entry.rank === 2 ? "bg-slate-300 text-slate-700" :
                  entry.rank === 3 ? "bg-orange-400 text-orange-900" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {entry.rank <= 3 ? (
                    entry.rank === 1 ? <Crown className="h-5 w-5" /> :
                    entry.rank === 2 ? <Medal className="h-5 w-5" /> :
                    <Award className="h-5 w-5" />
                  ) : (
                    `#${entry.rank}`
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {entry.full_name || "Anonymous"}
                    {entry.user_id === user?.id && <span className="text-primary text-xs ml-2">(You)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{entry.total_disposals} proper disposals</p>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-primary">{entry.total_credits}</p>
                  <p className="text-[10px] text-muted-foreground">credits</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
