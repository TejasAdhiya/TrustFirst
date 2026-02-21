"use client"

import { useState, use, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Users,
  User,
  Mail,
  DollarSign,
  Calendar,
  ChevronRight,
  UserPlus,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { auth } from "@/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { toast } from "@/hooks/use-toast"

interface Group {
  _id: string
  name: string
  description?: string
  createdBy: string
  members: {
    userId: string
    name: string
    email: string
  }[]
}

interface MoneyRequest {
  _id: string
  requesterId: string
  requesterName: string
  requesterEmail: string
  amount: number
  amountReceived: number
  amountRemaining: number
  purpose?: string
  dueDate: string
  status: string
  contributions: {
    lenderName: string
    amount: number
  }[]
}

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)
  const [group, setGroup] = useState<Group | null>(null)
  const [moneyRequests, setMoneyRequests] = useState<MoneyRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeletingGroup, setIsDeletingGroup] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid)
        await fetchGroupData()
      } else {
        router.push("/auth/signin")
      }
    })

    return () => unsubscribe()
  }, [router, id])

  const fetchGroupData = async () => {
    try {
      setLoading(true)

      // Fetch group details
      const groupResponse = await fetch(`/api/groups/${id}`)
      const groupData = await groupResponse.json()

      if (groupResponse.ok) {
        setGroup(groupData.group)
      }

      // Fetch money requests
      const requestsResponse = await fetch(`/api/money-requests?groupId=${id}`)
      const requestsData = await requestsResponse.json()

      if (requestsResponse.ok) {
        setMoneyRequests(requestsData.requests || [])
      }
    } catch (error) {
      console.error("Error fetching group data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPersonInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const calculateDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    try {
      setIsAddingMember(true)

      const response = await fetch(`/api/groups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addMemberEmails: [newMemberEmail.trim()],
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Member added successfully",
        })
        setNewMemberEmail("")
        setAddMemberDialogOpen(false)
        await fetchGroupData()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add member",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding member:", error)
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      })
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleRemoveMember = async (memberEmail: string) => {
    if (!confirm(`Remove ${memberEmail} from the group?`)) {
      return
    }

    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          removeMemberEmail: memberEmail,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Member removed successfully",
        })
        await fetchGroupData()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to remove member",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error removing member:", error)
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      })
    }
  }

  const handleDeleteGroup = async () => {
    try {
      setIsDeletingGroup(true)

      const response = await fetch(`/api/groups/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Group deleted successfully",
        })
        router.push("/dashboard/groups")
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete group",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting group:", error)
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      })
    } finally {
      setIsDeletingGroup(false)
      setDeleteDialogOpen(false)
    }
  }

  if (loading || !group) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
            <p className="text-muted-foreground">Loading group...</p>
          </div>
        </div>
      </div>
    )
  }

  const activeRequests = moneyRequests.filter((r) => r.status === "active")
  const fulfilledRequests = moneyRequests.filter((r) => r.status === "fulfilled")
  const isAdmin = currentUserId === group.createdBy

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard/groups"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{group.name}</h1>
          {group.description && (
            <p className="text-sm text-muted-foreground">{group.description}</p>
          )}
        </div>
      </div>

      {/* Group Info Card */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Group Members</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {group.members.length} members
            </span>
            {isAdmin && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAddMemberDialogOpen(true)}
                className="gap-1"
              >
                <UserPlus className="h-4 w-4" />
                Add Member
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          {group.members.map((member) => {
            const isMemberAdmin = member.userId === group.createdBy
            const canRemove = isAdmin && !isMemberAdmin

            return (
              <div
                key={member.userId}
                className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-semibold">
                  {getPersonInitials(member.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{member.name}</span>
                    {isMemberAdmin && (
                      <span className="inline-flex items-center rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {member.email}
                  </div>
                </div>
                {canRemove && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveMember(member.email)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="mb-6">
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="w-full gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Group
          </Button>
        </div>
      )}

      {/* Request Money Button */}
      <Link href={`/dashboard/groups/${id}/request`} className="block mb-6">
        <Button className="w-full h-14 bg-primary text-primary-foreground text-lg font-semibold hover:bg-primary/90 gap-2">
          <Plus className="h-5 w-5" />
          Request Money from Group
        </Button>
      </Link>

      {/* Active Money Requests */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Active Requests</h2>
        <span className="text-sm text-muted-foreground">
          {activeRequests.length} requests
        </span>
      </div>

      <div className="space-y-3 mb-8">
        {activeRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-border bg-card">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No Active Requests</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to request money from the group
            </p>
          </div>
        ) : (
          activeRequests.map((request) => {
            const daysUntilDue = calculateDaysUntilDue(request.dueDate)
            const progress = (request.amountReceived / request.amount) * 100
            const personInitials = getPersonInitials(request.requesterName)

            return (
              <Link
                key={request._id}
                href={`/dashboard/groups/${id}/requests/${request._id}`}
                className="block"
              >
                <div className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-card/80">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange/20 text-orange text-sm font-semibold">
                      {personInitials}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {request.requesterName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {request.purpose || "No purpose specified"}
                      </p>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            ₹{request.amountReceived.toLocaleString()} of ₹
                            {request.amount.toLocaleString()}
                          </span>
                          <span className="text-primary font-medium">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {daysUntilDue > 0
                            ? `${daysUntilDue} days left`
                            : "Due today"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {request.contributions.length} contributors
                        </span>
                      </div>
                    </div>

                    {/* Amount Remaining */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange">
                        ₹{request.amountRemaining.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        remaining
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* Fulfilled Requests */}
      {fulfilledRequests.length > 0 && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-muted-foreground">
              Fulfilled Requests
            </h2>
          </div>
          <div className="space-y-3">
            {fulfilledRequests.map((request) => {
              const personInitials = getPersonInitials(request.requesterName)

              return (
                <div
                  key={request._id}
                  className="rounded-xl border border-border/50 bg-card/50 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                      {personInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-muted-foreground truncate">
                        {request.requesterName}
                      </h3>
                      <p className="text-sm text-muted-foreground/70 truncate">
                        {request.purpose || "No purpose specified"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-muted-foreground">
                        ₹{request.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Fulfilled
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member to Group</DialogTitle>
            <DialogDescription>
              Enter the email address of the person you want to add to this group.
              They must have an account on TrustFirst.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="email"
              placeholder="member@example.com"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isAddingMember) {
                  handleAddMember()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddMemberDialogOpen(false)
                setNewMemberEmail("")
              }}
              disabled={isAddingMember}
            >
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={isAddingMember}>
              {isAddingMember ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the group
              "{group.name}" and remove all associated data. All active money requests
              in this group will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingGroup}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              disabled={isDeletingGroup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingGroup ? "Deleting..." : "Delete Group"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
