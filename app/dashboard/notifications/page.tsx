"use client"

import {
  Bell,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Sparkles,
  MessageSquare,
} from "lucide-react"

const notifications = [
  {
    id: "1",
    type: "ai_call",
    title: "AI Mediator Called Sarah Chen",
    description: "Sarah confirmed payment by February 15th",
    time: "2 hours ago",
    read: false,
    icon: Sparkles,
    iconColor: "text-primary",
    bgColor: "bg-primary/20",
  },
  {
    id: "2",
    type: "payment_due",
    title: "Payment Due Soon",
    description: "Mike Johnson's payment is due in 3 days",
    time: "5 hours ago",
    read: false,
    icon: Clock,
    iconColor: "text-orange",
    bgColor: "bg-orange/20",
  },
  {
    id: "3",
    type: "witness_approved",
    title: "Witness Approved",
    description: "Michael Brown approved your agreement with Sarah Chen",
    time: "1 day ago",
    read: true,
    icon: CheckCircle2,
    iconColor: "text-primary",
    bgColor: "bg-primary/20",
  },
  {
    id: "4",
    type: "money_received",
    title: "Payment Received",
    description: "Jordan Lee marked their $3,000 loan as paid",
    time: "2 days ago",
    read: true,
    icon: DollarSign,
    iconColor: "text-primary",
    bgColor: "bg-primary/20",
  },
  {
    id: "5",
    type: "witness_request",
    title: "Witness Request",
    description: "Alex Rodriguez wants you to witness their agreement",
    time: "3 days ago",
    read: true,
    icon: Users,
    iconColor: "text-chart-3",
    bgColor: "bg-chart-3/20",
  },
  {
    id: "6",
    type: "message",
    title: "New Message",
    description: "Emily Davis sent you a message about their loan",
    time: "4 days ago",
    read: true,
    icon: MessageSquare,
    iconColor: "text-muted-foreground",
    bgColor: "bg-secondary",
  },
]

export default function NotificationsPage() {
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "All caught up!"}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
          <Bell className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`rounded-xl border p-4 transition-colors ${
              notification.read
                ? "border-border bg-card/50"
                : "border-primary/30 bg-card"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${notification.bgColor}`}
              >
                <notification.icon className={`h-5 w-5 ${notification.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-semibold ${
                      notification.read ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {notification.title}
                  </h3>
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.description}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-2">
                  {notification.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No notifications</h3>
          <p className="text-sm text-muted-foreground">
            {"You're all caught up! Check back later for updates."}
          </p>
        </div>
      )}
    </div>
  )
}
