"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Users, ChevronRight, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth } from "@/firebase"
import { onAuthStateChanged } from "firebase/auth"

interface Group {
  _id: string
  name: string
  description?: string
  createdBy: string
  createdByName: string
  members: {
    userId: string
    name: string
    email: string
  }[]
  createdAt: string
}

export default function GroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid)
        await fetchGroups(user.uid)
      } else {
        router.push("/auth/signin")
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchGroups = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/groups?userId=${userId}`)
      const data = await response.json()

      if (response.ok) {
        setGroups(data.groups || [])
      } else {
        console.error("Failed to fetch groups:", data.error)
      }
    } catch (error) {
      console.error("Error fetching groups:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
            <p className="text-muted-foreground">Loading groups...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Groups</h1>
        <p className="text-muted-foreground">
          Create groups and request money from multiple people
        </p>
      </div>

      {/* Create Group Button */}
      <Link href="/dashboard/groups/create" className="block mb-6">
        <Button className="w-full h-14 bg-primary text-primary-foreground text-lg font-semibold hover:bg-primary/90 gap-2">
          <Plus className="h-5 w-5" />
          Create New Group
        </Button>
      </Link>

      {/* Groups List */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Groups</h2>
        <span className="text-sm text-muted-foreground">
          {groups.length} {groups.length === 1 ? "group" : "groups"}
        </span>
      </div>

      <div className="space-y-3">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-border bg-card">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No Groups Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first group to start requesting money
            </p>
            <Link href="/dashboard/groups/create">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </Link>
          </div>
        ) : (
          groups.map((group) => (
            <Link
              key={group._id}
              href={`/dashboard/groups/${group._id}`}
              className="block"
            >
              <div className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-card/80">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Users className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{group.name}</h3>
                    {group.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {group.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{group.members.length} members</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
