import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Medal, Award, Star, Crown, Coins, TrendingUp, Flame, Target } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  total_credits: number;
  total_disposals: number;
  rank: number;
}

const PRIZE_TIERS = [
  { rank: 1, prize: "₹5,000", color: "from-yellow-400 via-amber-400 to-yellow-500", icon: Crown, label: "Gold Champion", shadow: "shadow-yellow-500/30" },
  { rank: 2, prize: "₹3,000", color: "from-slate-300 via-gray-300 to-slate-400", icon: Medal, label: "Silver Star", shadow: "shadow-slate-400/30" },
  { rank: 3, prize: "₹1,500", color: "from-orange-400 via-amber-500 to-orange-600", icon: Award, label: "Bronze Hero", shadow: "shadow-orange-500/30" },
];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myCredits, setMyCredits] = useState(0);
  const [myRank, setMyRank] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from("leaderboard")
        .select("*")
        .order("rank");

      if (data && !error) {
        setEntries(data.map((d) => ({
          user_id: d.user_id || "",
          full_name: d.full_name || "Anonymous",
          total_credits: d.total_credits || 0,
          total_disposals: d.total_disposals || 0,
          rank: d.rank || 0,
        })));

        if (user) {
          const mine = data.find((e) => e.user_id === user.id);
          setMyCredits(mine?.total_credits || 0);
          setMyRank(mine?.rank || null);
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

      {/* My Credits Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 border shadow-elevated overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, hsl(152 60% 36% / 0.1), hsl(168 60% 40% / 0.1), hsl(200 80% 50% / 0.05))" }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -mr-10 -mt-10" />
        <div className="flex items-center justify-between relative">
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-orange-500" /> Your Green Credits
            </p>
            <p className="text-5xl font-display font-bold text-primary mt-2">{myCredits}</p>
            <div className="flex items-center gap-3 mt-2">
              {myRank && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                  <Target className="h-3 w-3" /> Rank #{myRank}
                </span>
              )}
              <span className="text-xs text-muted-foreground">Dispose waste to earn more!</span>
            </div>
          </div>
          <div className="h-20 w-20 rounded-2xl gradient-eco flex items-center justify-center shadow-lg shadow-primary/20">
            <Coins className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>
      </motion.div>

      {/* Prize Tiers */}
      <div className="grid grid-cols-3 gap-3">
        {PRIZE_TIERS.map((tier, i) => (
          <motion.div
            key={tier.rank}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-xl p-4 text-center bg-gradient-to-br ${tier.color} text-white shadow-lg ${tier.shadow} hover:scale-105 transition-transform cursor-default`}
          >
            <tier.icon className="h-7 w-7 mx-auto mb-1 drop-shadow" />
            <p className="text-[11px] font-semibold opacity-90">{tier.label}</p>
            <p className="text-xl font-display font-bold mt-1">{tier.prize}</p>
          </motion.div>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-card rounded-2xl shadow-elevated border overflow-hidden">
        <div className="p-5 border-b bg-gradient-to-r from-primary/5 to-accent/5">
          <h3 className="font-display font-bold flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" /> Rankings
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{entries.length} participants</p>
        </div>

        {entries.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground font-display font-semibold">No credits earned yet</p>
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
                className={`flex items-center gap-4 p-4 transition-all hover:bg-muted/30 ${
                  entry.user_id === user?.id ? "bg-primary/5 border-l-4 border-l-primary" : ""
                }`}
              >
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-display font-bold text-sm shadow-sm ${
                  entry.rank === 1 ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-yellow-900" :
                  entry.rank === 2 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700" :
                  entry.rank === 3 ? "bg-gradient-to-br from-orange-400 to-orange-500 text-orange-900" :
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
                  <p className="font-semibold text-sm truncate flex items-center gap-2">
                    {entry.full_name || "Anonymous"}
                    {entry.user_id === user?.id && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">YOU</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {entry.total_disposals} proper disposals
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-lg text-primary">{entry.total_credits}</p>
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
