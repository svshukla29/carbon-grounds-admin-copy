import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activities = [
  {
    user: {
      name: "Sarah Chen",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "SC",
    },
    action: "added a new project",
    project: "Agroforestry Initiative",
    time: "2 hours ago",
  },
  {
    user: {
      name: "Michael Rodriguez",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "MR",
    },
    action: "updated farmer count for",
    project: "Sustainable Rice Cultivation",
    time: "5 hours ago",
  },
  {
    user: {
      name: "Priya Sharma",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "PS",
    },
    action: "generated monthly report for",
    project: "Soil Carbon Sequestration",
    time: "Yesterday",
  },
  {
    user: {
      name: "David Okafor",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "DO",
    },
    action: "added new team members to",
    project: "Regenerative Grazing",
    time: "2 days ago",
  },
  {
    user: {
      name: "Emma Wilson",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "EW",
    },
    action: "verified carbon credits for",
    project: "Community Forest Management",
    time: "3 days ago",
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start gap-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
            <AvatarFallback className="bg-green-100 text-green-800">{activity.user.initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">{activity.user.name}</span> {activity.action}{" "}
              <span className="font-medium text-green-700">{activity.project}</span>
            </p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
