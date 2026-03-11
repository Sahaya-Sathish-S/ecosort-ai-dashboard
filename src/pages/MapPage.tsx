import { useEffect, useRef } from "react";
import { wasteBins } from "@/lib/mockData";
import { MapPin } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { FillLevelBar } from "@/components/FillLevelBar";

export default function MapPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Smart Map</h1>
        <p className="text-sm text-muted-foreground">Geographic overview of all smart bins</p>
      </div>

      {/* Legend */}
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

      {/* Map placeholder with bin markers */}
      <div className="bg-card rounded-xl shadow-card border overflow-hidden">
        <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 h-[400px] flex items-center justify-center">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle, hsl(152 60% 36%) 1px, transparent 1px)",
            backgroundSize: "30px 30px"
          }} />
          
          {/* Simulated map with positioned bins */}
          <div className="relative w-full h-full">
            {wasteBins.map((bin, i) => {
              const statusColor = bin.status === "Full" ? "bg-destructive" : bin.status === "Medium" ? "bg-warning" : "bg-success";
              const positions = [
                { top: "15%", left: "25%" }, { top: "30%", left: "55%" },
                { top: "55%", left: "20%" }, { top: "70%", left: "65%" },
                { top: "20%", left: "75%" }, { top: "45%", left: "45%" },
                { top: "65%", left: "35%" }, { top: "40%", left: "70%" },
              ];
              return (
                <div
                  key={bin.id}
                  className="absolute group"
                  style={positions[i]}
                >
                  <div className={`h-6 w-6 rounded-full ${statusColor} border-2 border-card shadow-md cursor-pointer flex items-center justify-center transition-transform hover:scale-125`}>
                    <MapPin className="h-3 w-3 text-card" />
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-card rounded-lg p-3 shadow-elevated border min-w-[180px]">
                      <p className="font-display font-semibold text-xs">{bin.id}</p>
                      <p className="text-[11px] text-muted-foreground">{bin.location}</p>
                      <FillLevelBar level={bin.fillLevel} size="sm" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bin List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {wasteBins.map((bin) => (
          <div key={bin.id} className="bg-card rounded-lg p-3 shadow-card border flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full flex-shrink-0 ${
              bin.status === "Full" ? "bg-destructive" : bin.status === "Medium" ? "bg-warning" : "bg-success"
            }`} />
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{bin.id} — {bin.location}</p>
              <p className="text-[11px] text-muted-foreground">{bin.fillLevel}% full</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
