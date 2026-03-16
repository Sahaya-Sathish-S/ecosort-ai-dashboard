import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Trash2, Wrench, Thermometer, Brain, CheckCircle2, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const iconMap: Record<string, any> = {
  full: Trash2,
  maintenance: Wrench,
  temperature: Thermometer,
  detection: Brain,
};

const colorMap: Record<string, string> = {
  full: "bg-destructive/10 text-destructive border-destructive/20",
  maintenance: "bg-warning/10 text-warning border-warning/20",
  temperature: "bg-info/10 text-info border-info/20",
  detection: "bg-primary/10 text-primary border-primary/20",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
    if (data) setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
    const ch = supabase.channel("notifs-rt").on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => fetchNotifications()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    for (const n of unread) {
      await supabase.from("notifications").update({ read: true }).eq("id", n.id);
    }
    toast.success("All notifications marked as read");
    fetchNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" /> Notifications
          </h1>
          <p className="text-sm text-muted-foreground">Alerts, detections, and system notifications</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary text-primary-foreground">
              {unreadCount} new
            </span>
          )}
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark all read
          </Button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 shadow-card border text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Bell className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <p className="text-muted-foreground font-display font-semibold">No notifications yet</p>
          <p className="text-sm text-muted-foreground mt-1">Scan waste with AI to generate detection alerts!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => {
            const Icon = iconMap[n.type] || AlertTriangle;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  "bg-card rounded-xl p-4 shadow-card border flex items-start gap-4 transition-all hover:shadow-elevated",
                  !n.read && "border-primary/30 bg-primary/[0.02]"
                )}
              >
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 border", colorMap[n.type] || "bg-muted border-border")}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", !n.read && "font-semibold")}>{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!n.read && <div className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0 mt-2 animate-pulse" />}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
