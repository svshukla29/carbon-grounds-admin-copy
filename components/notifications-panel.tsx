import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileCheck, UserCheck } from "lucide-react"

const notifications = [
  {
    id: 1,
    title: "Verification Required",
    description: "12 new farmers need verification in the Sustainable Rice Project",
    type: "verification",
    time: "2 hours ago",
  },
  {
    id: 2,
    title: "Report Due",
    description: "Monthly carbon credit report for Agroforestry Initiative is due tomorrow",
    type: "report",
    time: "1 day ago",
  },
  {
    id: 3,
    title: "New Team Member",
    description: "Emma Wilson accepted your invitation to join the team",
    type: "team",
    time: "2 days ago",
  },
  {
    id: 4,
    title: "Upcoming Meeting",
    description: "Project review meeting scheduled with partners on Friday, 10:00 AM",
    type: "meeting",
    time: "3 days ago",
  },
]

export function NotificationsPanel() {
  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Alert key={notification.id} className="border-l-4 border-l-green-600">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 rounded-full bg-green-100 p-1.5">
              {notification.type === "verification" && <UserCheck className="h-4 w-4 text-green-700" />}
              {notification.type === "report" && <FileCheck className="h-4 w-4 text-green-700" />}
              {notification.type === "team" && <UserCheck className="h-4 w-4 text-green-700" />}
              {notification.type === "meeting" && <Calendar className="h-4 w-4 text-green-700" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <AlertTitle className="flex items-center gap-2">
                  {notification.title}
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    New
                  </Badge>
                </AlertTitle>
                <span className="text-xs text-muted-foreground">{notification.time}</span>
              </div>
              <AlertDescription className="mt-1">{notification.description}</AlertDescription>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  )
}
