import { Trash2, Recycle, TrendingUp, Thermometer } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { FillLevelBar } from "@/components/FillLevelBar";
import { StatusBadge } from "@/components/StatusBadge";
import { wasteBins, wasteDistribution, dailyCollection } from "@/lib/mockData";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Real-time waste management overview</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Waste Collected" value="2,450 kg" icon={<Trash2 className="h-5 w-5" />} trend={{ value: 12, positive: true }} />
        <StatCard title="Recycling Rate" value="87%" icon={<Recycle className="h-5 w-5" />} trend={{ value: 5, positive: true }} />
        <StatCard title="Active Bins" value="156" icon={<TrendingUp className="h-5 w-5" />} subtitle="8 bins online" />
        <StatCard title="Avg Temperature" value="29°C" icon={<Thermometer className="h-5 w-5" />} subtitle="Normal range" />
      </div>

      {/* Charts */}
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

      {/* Bin Fill Levels */}
      <div className="bg-card rounded-xl p-5 shadow-card border">
        <h3 className="font-display font-semibold mb-4">Smart Bin Fill Levels</h3>
        <div className="space-y-3">
          {wasteBins.slice(0, 5).map((bin) => (
            <div key={bin.id} className="flex items-center gap-4">
              <span className="text-xs font-medium w-16 text-muted-foreground">{bin.id}</span>
              <div className="flex-1">
                <FillLevelBar level={bin.fillLevel} />
              </div>
              <StatusBadge status={bin.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
