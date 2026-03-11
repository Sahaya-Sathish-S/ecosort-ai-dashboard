import { cn } from "@/lib/utils";

interface FillLevelBarProps {
  level: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function FillLevelBar({ level, size = "md", showLabel = true }: FillLevelBarProps) {
  const color = level >= 80 ? "bg-destructive" : level >= 50 ? "bg-warning" : "bg-success";
  const heights = { sm: "h-2", md: "h-3", lg: "h-4" };

  return (
    <div className="flex items-center gap-2">
      <div className={cn("flex-1 rounded-full bg-muted overflow-hidden", heights[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${level}%` }}
        />
      </div>
      {showLabel && <span className="text-xs font-medium text-muted-foreground w-10 text-right">{level}%</span>}
    </div>
  );
}
