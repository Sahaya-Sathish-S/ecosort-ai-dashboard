import { wasteBins } from "@/lib/mockData";
import { FillLevelBar } from "@/components/FillLevelBar";
import { StatusBadge } from "@/components/StatusBadge";
import { MapPin, Thermometer } from "lucide-react";

export default function MonitoringPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Bin Monitoring</h1>
        <p className="text-sm text-muted-foreground">Real-time status of all smart dustbins</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {wasteBins.map((bin) => (
          <div key={bin.id} className="bg-card rounded-xl p-5 shadow-card border space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display font-semibold text-sm">{bin.id}</span>
              <StatusBadge status={bin.status} />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {bin.location}
            </div>
            <FillLevelBar level={bin.fillLevel} size="lg" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Waste: {bin.wasteType}</span>
              <span className="flex items-center gap-1">
                <Thermometer className="h-3 w-3" /> {bin.temperature}°C
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Updated {bin.lastUpdated}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
