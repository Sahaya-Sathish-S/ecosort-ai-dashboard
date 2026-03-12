import { useEffect, useState } from "react";
import { Trash2, Recycle, TrendingUp, Thermometer, Cpu } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { FillLevelBar } from "@/components/FillLevelBar";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export default function DashboardPage() {
  const [bins, setBins] = useState<any[]>([]);
  const [detections, setDetections] = useState<any[]>([]);

  useEffect(() => {
    const fetchBins = async () => {
      const { data } = await supabase.from("waste_bins").select("*").order("bin_id");
      if (data) setBins(data);
    };
    const fetchDetections = async () => {
      const { data } = await supabase.from("detection_history").select("*").order("created_at", { ascending: false }).limit(100);
      if (data) setDetections(data);
    };
    fetchBins();
    fetchDetections();

    const channel = supabase.channel("dash-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "waste_bins" }, () => fetchBins())
      .on("postgres_changes", { event: "*", schema: "public", table: "detection_history" }, () => fetchDetections())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const totalBins = bins.length;
  const avgTemp = bins.length ? Math.round(bins.reduce((a, b) => a + (b.temperature || 0), 0) / bins.length) : 0;
  const fullBins = bins.filter((b) => b.status === "Full").length;
  const recyclingRate = totalBins > 0 ? Math.round(((totalBins - fullBins) / totalBins) * 100) : 0;

  const wasteTypeCounts: Record<string, number> = {};
  bins.forEach((b) => { wasteTypeCounts[b.waste_type] = (wasteTypeCounts[b.waste_type] || 0) + 1; });
  const wasteColors: Record<string, string> = {
    Plastic: "hsl(200, 80%, 50%)", Paper: "hsl(38, 92%, 50%)",
    Metal: "hsl(260, 60%, 55%)", Organic: "hsl(152, 60%, 36%)",
    Mixed: "hsl(220, 50%, 55%)", Glass: "hsl(180, 50%, 45%)",
  };
  const wasteDistribution = Object.entries(wasteTypeCounts).map(([name, value]) => ({ name, value, color: wasteColors[name] || "hsl(0, 0%, 60%)" }));

  const detectionsByType: Record<string, number> = {};
  detections.forEach((d) => { detectionsByType[d.waste_type || "Unknown"] = (detectionsByType[d.waste_type || "Unknown"] || 0) + 1; });

  const HardwareNotice = () => (
    <div className="rounded-xl p-6 border border-dashed border-primary/30 bg-primary/5 text-center">
      <Cpu className="h-8 w-8 text-primary/40 mx-auto mb-3" />
      <p className="font-display font-semibold text-sm">Awaiting Hardware Connection</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
        Connect your IoT smart bins to populate real-time data. This dashboard will automatically reflect live sensor readings once hardware is integrated.
      </p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Real-time waste management overview</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Bins" value={totalBins > 0 ? String(totalBins) : "—"} icon={<Trash2 className="h-5 w-5" />} subtitle={totalBins > 0 ? `${fullBins} bins full` : "No hardware connected"} />
        <StatCard title="Recycling Rate" value={totalBins > 0 ? `${recyclingRate}%` : "—"} icon={<Recycle className="h-5 w-5" />} subtitle={totalBins > 0 ? "Based on bin status" : "Awaiting data"} />
        <StatCard title="AI Detections" value={detections.length > 0 ? String(detections.length) : "—"} icon={<TrendingUp className="h-5 w-5" />} subtitle={detections.length > 0 ? "Total scans" : "No scans yet"} />
        <StatCard title="Avg Temperature" value={totalBins > 0 ? `${avgTemp}°C` : "—"} icon={<Thermometer className="h-5 w-5" />} subtitle={totalBins > 0 ? "Normal range" : "No sensors"} />
      </div>

      {totalBins === 0 && detections.length === 0 ? (
        <HardwareNotice />
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-5 shadow-card border">
              <h3 className="font-display font-semibold mb-4">Waste Type Distribution</h3>
              {wasteDistribution.length === 0 ? (
                <HardwareNotice />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={wasteDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                        {wasteDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-card rounded-xl p-5 shadow-card border">
              <h3 className="font-display font-semibold mb-4">AI Detection Breakdown</h3>
              {detections.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">No detections yet. Use the AI scanner to classify waste!</div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(detectionsByType).map(([name, count]) => ({ name, count }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(140,15%,90%)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(152, 60%, 36%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {bins.length > 0 && (
            <div className="bg-card rounded-xl p-5 shadow-card border">
              <h3 className="font-display font-semibold mb-4">Smart Bin Fill Levels</h3>
              <div className="space-y-3">
                {bins.map((bin) => (
                  <div key={bin.id} className="flex items-center gap-4">
                    <span className="text-xs font-medium w-20 text-muted-foreground">{bin.bin_id}</span>
                    <div className="flex-1"><FillLevelBar level={bin.fill_level} /></div>
                    <StatusBadge status={bin.status as "Full" | "Medium" | "Empty"} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
