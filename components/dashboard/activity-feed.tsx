import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activities = [
  {
    id: 1,
    user: {
      name: "Sarah Chen",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "SC",
    },
    action: "verified 24 new farmers in",
    project: "Sustainable Rice Project",
    time: "2 hours ago",
  },
  {
    id: 2,
    user: {
      name: "Michael Rodriguez",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "MR",
    },
    action: "added a new partner to",
    project: "Agroforestry Initiative",
    time: "4 hours ago",
  },
  {
    id: 3,
    user: {
      name: "Aisha Patel",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "AP",
    },
    action: "generated monthly report for",
    project: "Soil Carbon Sequestration",
    time: "Yesterday",
  },
  {
    id: 4,
    user: {
      name: "David Okafor",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "DO",
    },
    action: "updated carbon metrics for",
    project: "Regenerative Grazing",
    time: "2 days ago",
  },
  {
    id: 5,
    user: {
      name: "Emma Wilson",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "EW",
    },
    action: "added 3 new team members to",
    project: "Community Forest Management",
    time: "3 days ago",
  },
]

export function ActivityFeed() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4">
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
