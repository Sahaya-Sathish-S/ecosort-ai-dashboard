import { dailyCollection, wasteDistribution } from "@/lib/mockData";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { StatCard } from "@/components/StatCard";
import { Leaf, Recycle, TrendingUp, TreePine } from "lucide-react";

const monthlyData = [
  { month: "Jan", collected: 320, recycled: 270 },
  { month: "Feb", collected: 380, recycled: 310 },
  { month: "Mar", collected: 290, recycled: 250 },
  { month: "Apr", collected: 420, recycled: 380 },
  { month: "May", collected: 350, recycled: 300 },
  { month: "Jun", collected: 460, recycled: 410 },
];

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Waste Analytics</h1>
        <p className="text-sm text-muted-foreground">Insights and environmental impact metrics</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Monthly Collection" value="460 kg" icon={<TrendingUp className="h-5 w-5" />} trend={{ value: 15, positive: true }} />
        <StatCard title="Recycling Efficiency" value="89%" icon={<Recycle className="h-5 w-5" />} trend={{ value: 3, positive: true }} />
        <StatCard title="CO₂ Offset" value="1.2 tons" icon={<Leaf className="h-5 w-5" />} subtitle="This month" />
        <StatCard title="Trees Saved" value="38" icon={<TreePine className="h-5 w-5" />} subtitle="Equivalent impact" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-5 shadow-card border">
          <h3 className="font-display font-semibold mb-4">Collection vs Recycled (Monthly)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(140,15%,90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="collected" stroke="hsl(200, 80%, 50%)" fill="hsl(200, 80%, 50%)" fillOpacity={0.15} />
                <Area type="monotone" dataKey="recycled" stroke="hsl(152, 60%, 36%)" fill="hsl(152, 60%, 36%)" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-card border">
          <h3 className="font-display font-semibold mb-4">Daily Waste Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyCollection}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(140,15%,90%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="plastic" stroke="hsl(200, 80%, 50%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="organic" stroke="hsl(152, 60%, 36%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="paper" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="metal" stroke="hsl(260, 60%, 55%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Most common waste */}
      <div className="bg-card rounded-xl p-5 shadow-card border">
        <h3 className="font-display font-semibold mb-4">Most Common Waste Types</h3>
        <div className="space-y-3">
          {wasteDistribution.map((w) => (
            <div key={w.name} className="flex items-center gap-3">
              <span className="w-16 text-sm font-medium">{w.name}</span>
              <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${w.value}%`, backgroundColor: w.color }} />
              </div>
              <span className="text-sm font-medium w-10 text-right">{w.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
