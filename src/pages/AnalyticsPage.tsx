import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { StatCard } from "@/components/StatCard";
import { Leaf, Recycle, TrendingUp, TreePine, Cpu } from "lucide-react";

export default function AnalyticsPage() {
  const [bins, setBins] = useState<any[]>([]);
  const [detections, setDetections] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [binsRes, detectionsRes] = await Promise.all([
        supabase.from("waste_bins").select("*"),
        supabase.from("detection_history").select("*").order("created_at", { ascending: false }).limit(200),
      ]);
      if (binsRes.data) setBins(binsRes.data);
      if (detectionsRes.data) setDetections(detectionsRes.data);
    };
    fetchData();
  }, []);

  const totalBins = bins.length;
  const fullBins = bins.filter((b) => b.status === "Full").length;
  const recyclingRate = totalBins > 0 ? Math.round(((totalBins - fullBins) / totalBins) * 100) : 0;

  const typeBreakdown: Record<string, number> = {};
  detections.forEach((d) => {
    typeBreakdown[d.waste_type] = (typeBreakdown[d.waste_type] || 0) + 1;
  });
  const typeData = Object.entries(typeBreakdown).map(([name, count]) => ({ name, count }));

  const dailyMap: Record<string, number> = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { weekday: "short" });
    dailyMap[key] = 0;
  }
  detections.forEach((d) => {
    const date = new Date(d.created_at);
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 7) {
      const key = date.toLocaleDateString("en-US", { weekday: "short" });
      if (key in dailyMap) dailyMap[key]++;
    }
  });
  const dailyData = Object.entries(dailyMap).map(([day, scans]) => ({ day, scans }));

  const hasBinData = totalBins > 0;
  const hasDetections = detections.length > 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Waste Analytics</h1>
        <p className="text-sm text-muted-foreground">Insights from real data</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Bins" value={hasBinData ? String(totalBins) : "—"} icon={<TrendingUp className="h-5 w-5" />} subtitle={hasBinData ? "Active smart bins" : "Awaiting hardware"} />
        <StatCard title="Recycling Efficiency" value={hasBinData ? `${recyclingRate}%` : "—"} icon={<Recycle className="h-5 w-5" />} subtitle={hasBinData ? "Based on bin status" : "Awaiting hardware"} />
        <StatCard title="AI Scans" value={hasDetections ? String(detections.length) : "—"} icon={<Leaf className="h-5 w-5" />} subtitle={hasDetections ? "Total detections" : "No scans yet"} />
        <StatCard title="Waste Types" value={hasDetections ? String(Object.keys(typeBreakdown).length) : "—"} icon={<TreePine className="h-5 w-5" />} subtitle={hasDetections ? "Unique types detected" : "No data yet"} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-5 shadow-card border">
          <h3 className="font-display font-semibold mb-4">Daily AI Scans (Last 7 Days)</h3>
          <div className="h-64">
            {dailyData.some((d) => d.scans > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(140,15%,90%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="scans" stroke="hsl(152, 60%, 36%)" strokeWidth={2} dot={{ fill: "hsl(152, 60%, 36%)" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Cpu className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No scan data in the last 7 days</p>
                <p className="text-xs text-muted-foreground mt-1">Use the AI scanner to generate data</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-card border">
          <h3 className="font-display font-semibold mb-4">Detection Breakdown by Type</h3>
          <div className="h-64">
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(140,15%,90%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(152, 60%, 36%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Cpu className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No detection data yet</p>
                <p className="text-xs text-muted-foreground mt-1">Scan waste items to see breakdown</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
