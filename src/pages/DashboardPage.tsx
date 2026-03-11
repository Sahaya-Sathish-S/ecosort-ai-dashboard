import { useEffect, useState } from "react";
import { Trash2, Recycle, TrendingUp, Thermometer } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { FillLevelBar } from "@/components/FillLevelBar";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { wasteDistribution, dailyCollection } from "@/lib/mockData";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function DashboardPage() {
  const [bins, setBins] = useState<any[]>([]);

  useEffect(() => {
    const fetchBins = async () => {
      const { data } = await supabase.from("waste_bins").select("*").order("bin_id");
      if (data) setBins(data);
    };
    fetchBins();

    const channel = supabase.channel("bins-realtime").on("postgres_changes", { event: "*", schema: "public", table: "waste_bins" }, () => {
      fetchBins();
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const totalBins = bins.length;
  const avgTemp = bins.length ? Math.round(bins.reduce((a, b) => a + (b.temperature || 0), 0) / bins.length) : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Real-time waste management overview</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Waste Collected" value="2,450 kg" icon={<Trash2 className="h-5 w-5" />} trend={{ value: 12, positive: true }} />
        <StatCard title="Recycling Rate" value="87%" icon={<Recycle className="h-5 w-5" />} trend={{ value: 5, positive: true }} />
        <StatCard title="Active Bins" value={String(totalBins)} icon={<TrendingUp className="h-5 w-5" />} subtitle={`${totalBins} bins online`} />
        <StatCard title="Avg Temperature" value={`${avgTemp}°C`} icon={<Thermometer className="h-5 w-5" />} subtitle="Normal range" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-5 shadow-card border">
          <h3 className="font-display font-semibold mb-4">Waste Type Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={wasteDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                  {wasteDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-card border">
          <h3 className="font-display font-semibold mb-4">Daily Collection (kg)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyCollection}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(140,15%,90%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="plastic" fill="hsl(200, 80%, 50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paper" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="metal" fill="hsl(260, 60%, 55%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="organic" fill="hsl(152, 60%, 36%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-5 shadow-card border">
        <h3 className="font-display font-semibold mb-4">Smart Bin Fill Levels</h3>
        {bins.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bins configured yet. Admin can add bins from the Admin Panel.</p>
        ) : (
          <div className="space-y-3">
            {bins.slice(0, 5).map((bin) => (
              <div key={bin.id} className="flex items-center gap-4">
                <span className="text-xs font-medium w-16 text-muted-foreground">{bin.bin_id}</span>
                <div className="flex-1">
                  <FillLevelBar level={bin.fill_level} />
                </div>
                <StatusBadge status={bin.status as "Full" | "Medium" | "Empty"} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
