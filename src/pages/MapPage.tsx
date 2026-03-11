import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { FillLevelBar } from "@/components/FillLevelBar";

export default function MapPage() {
  const [bins, setBins] = useState<any[]>([]);

  useEffect(() => {
    const fetchBins = async () => {
      const { data } = await supabase.from("waste_bins").select("*").order("bin_id");
      if (data) setBins(data);
    };
    fetchBins();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Smart Map</h1>
        <p className="text-sm text-muted-foreground">Geographic overview of all smart bins</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        {[
          { color: "bg-success", label: "Empty (< 30%)" },
          { color: "bg-warning", label: "Medium (30-80%)" },
          { color: "bg-destructive", label: "Full (> 80%)" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2 text-sm">
            <div className={`h-3 w-3 rounded-full ${l.color}`} />
            <span className="text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl shadow-card border overflow-hidden">
        <div className="relative bg-gradient-to-br from-secondary/50 to-accent/30 h-[400px] flex items-center justify-center">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle, hsl(152 60% 36%) 1px, transparent 1px)",
            backgroundSize: "30px 30px"
          }} />
          
          {bins.length === 0 ? (
            <p className="text-muted-foreground">No bins to display. Admin can add bins.</p>
          ) : (
            <div className="relative w-full h-full">
              {bins.map((bin, i) => {
                const statusColor = bin.status === "Full" ? "bg-destructive" : bin.status === "Medium" ? "bg-warning" : "bg-success";
                const positions = [
                  { top: "15%", left: "25%" }, { top: "30%", left: "55%" },
                  { top: "55%", left: "20%" }, { top: "70%", left: "65%" },
                  { top: "20%", left: "75%" }, { top: "45%", left: "45%" },
                  { top: "65%", left: "35%" }, { top: "40%", left: "70%" },
                ];
                return (
                  <div key={bin.id} className="absolute group" style={positions[i % 8]}>
                    <div className={`h-6 w-6 rounded-full ${statusColor} border-2 border-card shadow-md cursor-pointer flex items-center justify-center transition-transform hover:scale-125`}>
                      <MapPin className="h-3 w-3 text-card" />
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-card rounded-lg p-3 shadow-elevated border min-w-[180px]">
                        <p className="font-display font-semibold text-xs">{bin.bin_id}</p>
                        <p className="text-[11px] text-muted-foreground">{bin.location}</p>
                        <FillLevelBar level={bin.fill_level} size="sm" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {bins.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {bins.map((bin) => (
            <div key={bin.id} className="bg-card rounded-lg p-3 shadow-card border flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full flex-shrink-0 ${
                bin.status === "Full" ? "bg-destructive" : bin.status === "Medium" ? "bg-warning" : "bg-success"
              }`} />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{bin.bin_id} — {bin.location}</p>
                <p className="text-[11px] text-muted-foreground">{bin.fill_level}% full</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
