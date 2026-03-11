import { cn } from "@/lib/utils";

type Status = "Empty" | "Medium" | "Full";

export function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Empty: "bg-success/10 text-success",
    Medium: "bg-warning/10 text-warning",
    Full: "bg-destructive/10 text-destructive",
  };

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", styles[status])}>
      {status}
    </span>
  );
}
