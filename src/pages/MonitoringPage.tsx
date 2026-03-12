import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FillLevelBar } from "@/components/FillLevelBar";
import { StatusBadge } from "@/components/StatusBadge";
import { MapPin, Thermometer, Cpu } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function MonitoringPage() {
  const [bins, setBins] = useState<any[]>([]);

  useEffect(() => {
    const fetchBins = async () => {
      const { data } = await supabase.from("waste_bins").select("*").order("bin_id");
      if (data) setBins(data);
    };
    fetchBins();
    const channel = supabase.channel("monitoring-bins").on("postgres_changes", { event: "*", schema: "public", table: "waste_bins" }, () => fetchBins()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Bin Monitoring</h1>
        <p className="text-sm text-muted-foreground">Real-time status of all smart dustbins</p>
      </div>

      {bins.length === 0 ? (
        <div className="bg-card rounded-xl p-12 shadow-card border text-center space-y-3">
          <Cpu className="h-10 w-10 text-primary/30 mx-auto" />
          <p className="font-display font-semibold">No Smart Bins Connected</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Smart bin monitoring requires IoT hardware integration (ESP32/Arduino with fill-level sensors, temperature sensors, and GPS modules). 
            Once connected via our REST API, bins will appear here with live data.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {bins.map((bin) => (
            <div key={bin.id} className="bg-card rounded-xl p-5 shadow-card border space-y-3 hover:shadow-elevated transition-shadow">
              <div className="flex items-center justify-between">
                <span className="font-display font-semibold text-sm">{bin.bin_id}</span>
                <StatusBadge status={bin.status as "Full" | "Medium" | "Empty"} />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {bin.location}
              </div>
              <FillLevelBar level={bin.fill_level} size="lg" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Waste: {bin.waste_type}</span>
                <span className="flex items-center gap-1"><Thermometer className="h-3 w-3" /> {bin.temperature}°C</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Updated {formatDistanceToNow(new Date(bin.last_updated), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
