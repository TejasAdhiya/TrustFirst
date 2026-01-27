"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Sparkles,
  MessageSquare,
} from "lucide-react"
import { auth } from "@/firebase"
import { onAuthStateChanged } from "firebase/auth"

interface Notification {
  _id: string
  type: string
  title: string
  description: string
  read: boolean
  createdAt: string
}

const iconMap: Record<string, any> = {
  ai_call: Sparkles,
  payment_due: Clock,
  witness_approved: CheckCircle2,
  money_received: DollarSign,
  witness_request: Users,
  message: MessageSquare,
  agreement_created: CheckCircle2,
}

const colorMap: Record<string, { iconColor: string; bgColor: string }> = {
  ai_call: { iconColor: "text-primary", bgColor: "bg-primary/20" },
  payment_due: { iconColor: "text-orange", bgColor: "bg-orange/20" },
  witness_approved: { iconColor: "text-primary", bgColor: "bg-primary/20" },
  money_received: { iconColor: "text-primary", bgColor: "bg-primary/20" },
  witness_request: { iconColor: "text-chart-3", bgColor: "bg-chart-3/20" },
  message: { iconColor: "text-muted-foreground", bgColor: "bg-secondary" },
  agreement_created: { iconColor: "text-primary", bgColor: "bg-primary/20" },
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchNotifications(user.uid)
      } else {
        router.push("/auth/signin")
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchNotifications = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/notifications?userId=${userId}`)
      const data = await response.json()

      if (response.ok) {
        setNotifications(data.notifications || [])
      } else {
        console.error("Failed to fetch notifications:", data.error)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 lg:px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </div>
    )
  }

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
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No notifications</h3>
            <p className="text-sm text-muted-foreground">
              {"You're all caught up! Check back later for updates."}
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = iconMap[notification.type] || Bell
            const colors = colorMap[notification.type] || {
              iconColor: "text-muted-foreground",
              bgColor: "bg-secondary",
            }

            return (
              <div
                key={notification._id}
                className={`rounded-xl border p-4 transition-colors ${
                  notification.read
                    ? "border-border bg-card/50"
                    : "border-primary/30 bg-card"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${colors.bgColor}`}
                  >
                    <Icon className={`h-5 w-5 ${colors.iconColor}`} />
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
                      {getTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
