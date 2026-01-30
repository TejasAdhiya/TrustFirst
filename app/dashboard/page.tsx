"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth } from "@/firebase"
import { onAuthStateChanged } from "firebase/auth"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface Agreement {
  _id: string
  borrowerName: string
  lenderName: string
  amount: number
  type: "lent" | "borrowed"
  purpose?: string
  dueDate: string
  status: "active" | "pending_witness" | "reviewing" | "settled" | "overdue"
  witnessApproved: boolean
  lenderId: string
  borrowerId?: string
}

interface GroupedAgreements {
  personId: string
  personName: string
  totalLent: number
  totalBorrowed: number
  agreements: Agreement[]
}

const statusConfig = {
  active: {
    label: "Active",
    color: "bg-primary/20 text-primary",
    icon: Clock,
  },
  pending_witness: {
    label: "Pending Witness",
    color: "bg-orange/20 text-orange",
    icon: AlertCircle,
  },
  reviewing: {
    label: "Reviewing",
    color: "bg-chart-3/20 text-chart-3",
    icon: Clock,
  },
  settled: {
    label: "Settled",
    color: "bg-muted text-muted-foreground",
    icon: CheckCircle2,
  },
  overdue: {
    label: "Overdue",
    color: "bg-red-500/20 text-red-500",
    icon: AlertCircle,
  },
}

export default function DashboardPage() {
  const router = useRouter()
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid)
        await fetchAgreements(user.uid)
      } else {
        router.push("/auth/signin")
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchAgreements = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/agreements?userId=${userId}`)
      const data = await response.json()

      if (response.ok) {
        // Map agreements to include proper type based on current user
        const mappedAgreements = (data.agreements || []).map((agreement: any) => {
          // Determine if current user is lender or borrower
          const isLender = agreement.lenderId === userId
          return {
            ...agreement,
            type: isLender ? "lent" : "borrowed",
          }
        })
        setAgreements(mappedAgreements)
      } else {
        console.error("Failed to fetch agreements:", data.error)
      }
    } catch (error) {
      console.error("Error fetching agreements:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getPersonInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const groupAgreementsByPerson = (agreements: Agreement[]): GroupedAgreements[] => {
    const groups: { [key: string]: GroupedAgreements } = {}

    agreements.forEach((agreement) => {
      // Determine the "other person"
      const isLent = agreement.type === "lent"
      // If I lent, the other person is the borrower. If I borrowed, other is lender.
      // Use ID if available, otherwise fallback to Name (though ID is safer for uniqueness)
      const otherId = isLent ? agreement.borrowerId || agreement.borrowerName : agreement.lenderId || agreement.lenderName
      const otherName = isLent ? agreement.borrowerName : agreement.lenderName

      if (!groups[otherId]) {
        groups[otherId] = {
          personId: otherId,
          personName: otherName,
          totalLent: 0,
          totalBorrowed: 0,
          agreements: [],
        }
      }

      groups[otherId].agreements.push(agreement)
      if (isLent) {
        groups[otherId].totalLent += agreement.amount
      } else {
        groups[otherId].totalBorrowed += agreement.amount
      }
    })

    return Object.values(groups)
  }

  const totalLent = agreements
    .filter((a) => a.type === "lent" && a.status !== "settled")
    .reduce((sum, a) => sum + a.amount, 0)

  const totalBorrowed = agreements
    .filter((a) => a.type === "borrowed" && a.status !== "settled")
    .reduce((sum, a) => sum + a.amount, 0)

  const activeAgreements = agreements.filter((a) => a.status !== "settled")
  const groupedActiveAgreements = groupAgreementsByPerson(activeAgreements)

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
            <p className="text-muted-foreground">Loading agreements...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6">
      {/* Summary Card */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="p-5 sm:p-6">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              <span>You Lent</span>
            </div>
            <div className="text-2xl font-bold text-primary sm:text-3xl">
              ₹{totalLent.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {agreements.filter((a) => a.type === "lent" && a.status !== "settled").length} active
              agreements
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowDownLeft className="h-4 w-4 text-orange" />
              <span>You Borrowed</span>
            </div>
            <div className="text-2xl font-bold text-orange sm:text-3xl">
              ₹{totalBorrowed.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {agreements.filter((a) => a.type === "borrowed" && a.status !== "settled").length}{" "}
              active agreements
            </div>
          </div>
        </div>
        <div className="border-t border-border bg-secondary/30 px-5 py-3 sm:px-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Net Balance</span>
            <span
              className={`font-semibold ${totalLent - totalBorrowed >= 0 ? "text-primary" : "text-orange"
                }`}
            >
              {totalLent - totalBorrowed >= 0 ? "+" : "-"}₹
              {Math.abs(totalLent - totalBorrowed).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Create Agreement Button */}
      <Link href="/dashboard/create" className="block mb-6">
        <Button className="w-full h-14 bg-primary text-primary-foreground text-lg font-semibold hover:bg-primary/90 gap-2">
          <Plus className="h-5 w-5" />
          Create Trust Agreement
        </Button>
      </Link>

      {/* Active Agreements */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Active Agreements</h2>
        <span className="text-sm text-muted-foreground">
          {activeAgreements.length} agreements
        </span>
      </div>

      <div className="space-y-4">
        {groupedActiveAgreements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-border bg-card">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No Active Agreements</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first trust agreement to get started
            </p>
            <Link href="/dashboard/create">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Agreement
              </Button>
            </Link>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {groupedActiveAgreements.map((group) => {
              const netAmount = group.totalLent - group.totalBorrowed
              const isPositive = netAmount >= 0
              const personInitials = getPersonInitials(group.personName)

              return (
                <AccordionItem
                  key={group.personId}
                  value={group.personId}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline [&[data-state=open]]:bg-muted/50">
                    <div className="flex w-full items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${isPositive
                            ? "bg-primary/20 text-primary"
                            : "bg-orange/20 text-orange"
                            }`}
                        >
                          {personInitials}
                        </div>
                        <div className="text-left min-w-0">
                          <h3 className="font-semibold truncate">{group.personName}</h3>
                          <p className="text-xs text-muted-foreground">
                            {group.agreements.length} agreement{group.agreements.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 mr-2">
                        <div
                          className={`text-base font-bold ${isPositive ? "text-primary" : "text-orange"
                            }`}
                        >
                          {isPositive ? "+" : "-"}₹{Math.abs(netAmount).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {isPositive ? "To receive" : "To pay"}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-0 pb-0">
                    <div className="divide-y divide-border/50 border-t border-border/50">
                      {group.agreements.map((agreement) => {
                        const config = statusConfig[agreement.status as keyof typeof statusConfig] || statusConfig.active
                        const StatusIcon = config.icon
                        const daysUntilDue = calculateDaysUntilDue(agreement.dueDate)

                        return (
                          <Link
                            key={agreement._id}
                            href={`/dashboard/agreement/${agreement._id}`}
                            className="block px-4 py-3 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-medium truncate">
                                    {agreement.purpose || "No purpose specified"}
                                  </p>
                                  {!agreement.witnessApproved && (
                                    <Users className="h-3 w-3 text-orange" />
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${config.color}`}
                                  >
                                    <StatusIcon className="h-2.5 w-2.5" />
                                    {config.label}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <Calendar className="h-2.5 w-2.5" />
                                    {daysUntilDue > 0
                                      ? `${daysUntilDue}d left`
                                      : daysUntilDue === 0
                                        ? "Due today"
                                        : `${Math.abs(daysUntilDue)}d overdue`}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`text-sm font-bold ${agreement.type === "lent"
                                    ? "text-primary"
                                    : "text-orange"
                                    }`}
                                >
                                  {agreement.type === "lent" ? "+" : "-"}₹
                                  {agreement.amount.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
      </div>

      {/* Settled Section */}
      {agreements.some((a) => a.status === "settled") && (
        <>
          <div className="mb-4 mt-8 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-muted-foreground">Settled</h2>
          </div>
          <div className="space-y-3">
            {agreements
              .filter((a) => a.status === "settled")
              .map((agreement) => {
                const personName = agreement.type === "lent" ? agreement.borrowerName : agreement.lenderName
                const personInitials = getPersonInitials(personName)

                return (
                  <Link
                    key={agreement._id}
                    href={`/dashboard/agreement/${agreement._id}`}
                    className="block"
                  >
                    <div className="group rounded-xl border border-border/50 bg-card/50 p-4 transition-all hover:border-border hover:bg-card">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                          {personInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-muted-foreground truncate">
                            {personName}
                          </h3>
                          <p className="text-sm text-muted-foreground/70 truncate">
                            {agreement.purpose || "No purpose specified"}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-muted-foreground">
                            ₹{agreement.amount.toLocaleString()}
                          </div>
                          <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3" />
                            Settled
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
          </div>
        </>
      )}
    </div>
  )
}
