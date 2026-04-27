import { Clock } from "lucide-react";

export function ActivityFeed() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2">
      <Clock className="h-8 w-8 opacity-40" />
      <p className="text-sm">No recent activity yet.</p>
      <p className="text-xs opacity-70">Activity will appear here as your team makes updates.</p>
    </div>
  );
}
