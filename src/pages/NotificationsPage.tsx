import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Trash2, Wrench, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const iconMap: Record<string, any> = {
  full: Trash2,
  maintenance: Wrench,
  temperature: Thermometer,
};

const colorMap: Record<string, string> = {
  full: "bg-destructive/10 text-destructive",
  maintenance: "bg-warning/10 text-warning",
  temperature: "bg-info/10 text-info",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
      if (data) setNotifications(data);
    };
    fetch();
    const ch = supabase.channel("notifs-rt").on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => fetch()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Alerts and system notifications</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4" />
          {unreadCount} unread
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-card rounded-xl p-12 shadow-card border text-center">
          <p className="text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = iconMap[n.type] || AlertTriangle;
            return (
              <div
                key={n.id}
                className={cn(
                  "bg-card rounded-xl p-4 shadow-card border flex items-start gap-4 transition-colors",
                  !n.read && "border-primary/30 bg-primary/[0.02]"
                )}
              >
                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0", colorMap[n.type] || "bg-muted")}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", !n.read && "font-medium")}>{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!n.read && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
