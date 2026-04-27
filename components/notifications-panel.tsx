import { Bell } from "lucide-react";

export function NotificationsPanel() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2">
      <Bell className="h-8 w-8 opacity-40" />
      <p className="text-sm">No notifications at this time.</p>
      <p className="text-xs opacity-70">Important alerts will appear here.</p>
    </div>
  );
}
