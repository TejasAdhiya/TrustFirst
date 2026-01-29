"use client"

import { useState, use, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Users,
  User,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { auth } from "@/firebase"
import { onAuthStateChanged } from "firebase/auth"

interface MoneyRequest {
  _id: string
  requesterId: string
  requesterName: string
  requesterEmail: string
  requesterPhone?: string
  amount: number
  amountReceived: number
  amountRemaining: number
  purpose?: string
  dueDate: string
  status: string
  contributions: {
    lenderId: string
    lenderName: string
    lenderEmail: string
    amount: number
    agreementId: string
    contributedAt: string
  }[]
}

export default function MoneyRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string; requestId: string }>
}) {
  const router = useRouter()
  const { id, requestId } = use(params)
  const [moneyRequest, setMoneyRequest] = useState<MoneyRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isContributing, setIsContributing] = useState(false)
  const [contributionAmount, setContributionAmount] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user)
        await fetchMoneyRequest()
      } else {
        router.push("/auth/signin")
      }
    })

    return () => unsubscribe()
  }, [router, requestId])

  const fetchMoneyRequest = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/money-requests/${requestId}`)
      const data = await response.json()

      if (response.ok) {
        setMoneyRequest(data.moneyRequest)
      } else {
        console.error("Failed to fetch money request:", data.error)
        router.push(`/dashboard/groups/${id}`)
      }
    } catch (error) {
      console.error("Error fetching money request:", error)
      router.push(`/dashboard/groups/${id}`)
    } finally {
      setLoading(false)
    }
  }

  const handleContribute = async () => {
    if (!currentUser || !moneyRequest) return

    const amount = parseFloat(contributionAmount)

    if (!amount || amount <= 0) {
      alert("Please enter a valid amount")
      return
    }

    if (amount > moneyRequest.amountRemaining) {
      alert(`Cannot contribute more than ₹${moneyRequest.amountRemaining}`)
      return
    }

    setIsContributing(true)

    try {
      const response = await fetch(`/api/money-requests/${requestId}/contribute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lenderId: currentUser.uid,
          lenderName: currentUser.displayName || currentUser.email?.split("@")[0] || "User",
          lenderEmail: currentUser.email,
          contributionAmount: amount,
          bufferDays: 3,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to the created agreement
        router.push(`/dashboard/agreement/${data.agreement._id}`)
      } else {
        alert(`Failed to contribute: ${data.error}`)
      }
    } catch (error) {
      console.error("Error contributing:", error)
      alert("Failed to contribute. Please try again.")
    } finally {
      setIsContributing(false)
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

  if (loading || !moneyRequest) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
            <p className="text-muted-foreground">Loading request...</p>
          </div>
        </div>
      </div>
    )
  }

  const progress = (moneyRequest.amountReceived / moneyRequest.amount) * 100
  const daysUntilDue = calculateDaysUntilDue(moneyRequest.dueDate)
  const isRequester = currentUser?.uid === moneyRequest.requesterId
  const hasContributed = moneyRequest.contributions.some(
    (c) => c.lenderId === currentUser?.uid
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/dashboard/groups/${id}`}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{moneyRequest.requesterName}</h1>
          <p className="text-sm text-muted-foreground">
            {moneyRequest.purpose || "Money request"}
          </p>
        </div>
        <div className="text-2xl font-bold text-orange">
          ₹{moneyRequest.amount.toLocaleString()}
        </div>
      </div>

      {/* Status Card */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-lg font-bold text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Received</div>
            <div className="text-xl font-bold text-primary">
              ₹{moneyRequest.amountReceived.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Remaining</div>
            <div className="text-xl font-bold text-orange">
              ₹{moneyRequest.amountRemaining.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Due:{" "}
              {new Date(moneyRequest.dueDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div
            className={`text-sm ${
              daysUntilDue > 0 ? "text-primary" : "text-orange"
            }`}
          >
            {daysUntilDue > 0
              ? `${daysUntilDue} days remaining`
              : "Due today"}
          </div>
        </div>
      </div>

      {/* Contribute Button */}
      {!isRequester && moneyRequest.status === "active" && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-14 bg-primary text-primary-foreground text-lg font-semibold hover:bg-primary/90 mb-6">
              <DollarSign className="mr-2 h-5 w-5" />
              {hasContributed ? "Contribute More" : "Contribute to Request"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contribute Money</DialogTitle>
              <DialogDescription>
                Enter the amount you want to lend. This will create a separate
                agreement between you and {moneyRequest.requesterName}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="contribution">Amount (₹)</Label>
                <Input
                  id="contribution"
                  type="number"
                  placeholder="500"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  max={moneyRequest.amountRemaining}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum: ₹{moneyRequest.amountRemaining.toLocaleString()}
                </p>
              </div>
              <Button
                onClick={handleContribute}
                disabled={isContributing}
                className="w-full h-12"
              >
                {isContributing ? "Processing..." : "Confirm & Create Agreement"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Status Message */}
      {moneyRequest.status === "fulfilled" && (
        <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <div>
            <div className="font-semibold text-primary">Request Fulfilled!</div>
            <div className="text-sm text-muted-foreground">
              This request has received the full amount
            </div>
          </div>
        </div>
      )}

      {/* Contributors */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Contributors</h2>
        <span className="text-sm text-muted-foreground">
          {moneyRequest.contributions.length}{" "}
          {moneyRequest.contributions.length === 1 ? "person" : "people"}
        </span>
      </div>

      <div className="space-y-3">
        {moneyRequest.contributions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-border bg-card">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No Contributors Yet</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to help out!
            </p>
          </div>
        ) : (
          moneyRequest.contributions.map((contribution) => {
            const initials = getPersonInitials(contribution.lenderName)

            return (
              <Link
                key={contribution.agreementId}
                href={`/dashboard/agreement/${contribution.agreementId}`}
                className="block"
              >
                <div className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-card/80">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-semibold">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">
                        {contribution.lenderName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(contribution.contributedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        ₹{contribution.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        View Agreement →
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
