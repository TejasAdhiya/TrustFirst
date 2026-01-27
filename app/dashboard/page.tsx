"use client"

import Link from "next/link"
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock data with realistic examples
const agreements = [
  {
    id: "1",
    personName: "Sarah Chen",
    personInitials: "SC",
    amount: 2500,
    type: "lent",
    purpose: "Rent for March",
    dueDate: "2026-02-15",
    status: "active",
    witnessApproved: true,
    daysUntilDue: 19,
  },
  {
    id: "2",
    personName: "Mike Johnson",
    personInitials: "MJ",
    amount: 850,
    type: "borrowed",
    purpose: "Dinner at Chillis",
    dueDate: "2026-01-30",
    status: "pending_witness",
    witnessApproved: false,
    daysUntilDue: 3,
  },
  {
    id: "3",
    personName: "Emily Davis",
    personInitials: "ED",
    amount: 1200,
    type: "lent",
    purpose: "Emergency Car Repair",
    dueDate: "2026-02-28",
    status: "active",
    witnessApproved: true,
    daysUntilDue: 32,
  },
  {
    id: "4",
    personName: "Alex Rodriguez",
    personInitials: "AR",
    amount: 500,
    type: "lent",
    purpose: "Medical Bills",
    dueDate: "2026-01-25",
    status: "reviewing",
    witnessApproved: true,
    daysUntilDue: -2,
  },
  {
    id: "5",
    personName: "Jordan Lee",
    personInitials: "JL",
    amount: 3000,
    type: "borrowed",
    purpose: "Business Investment",
    dueDate: "2026-03-15",
    status: "settled",
    witnessApproved: true,
    daysUntilDue: 47,
  },
]

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
}

export default function DashboardPage() {
  const totalLent = agreements
    .filter((a) => a.type === "lent" && a.status !== "settled")
    .reduce((sum, a) => sum + a.amount, 0)

  const totalBorrowed = agreements
    .filter((a) => a.type === "borrowed" && a.status !== "settled")
    .reduce((sum, a) => sum + a.amount, 0)

  const activeAgreements = agreements.filter((a) => a.status !== "settled")

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
              ${totalLent.toLocaleString()}
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
              ${totalBorrowed.toLocaleString()}
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
              className={`font-semibold ${
                totalLent - totalBorrowed >= 0 ? "text-primary" : "text-orange"
              }`}
            >
              {totalLent - totalBorrowed >= 0 ? "+" : "-"}$
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

      <div className="space-y-3">
        {activeAgreements.map((agreement) => {
          const config = statusConfig[agreement.status as keyof typeof statusConfig]
          const StatusIcon = config.icon

          return (
            <Link
              key={agreement.id}
              href={`/dashboard/agreement/${agreement.id}`}
              className="block"
            >
              <div className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-card/80">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${
                      agreement.type === "lent"
                        ? "bg-primary/20 text-primary"
                        : "bg-orange/20 text-orange"
                    }`}
                  >
                    {agreement.personInitials}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{agreement.personName}</h3>
                      {!agreement.witnessApproved && (
                        <Users className="h-4 w-4 text-orange" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {agreement.purpose}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {agreement.daysUntilDue > 0
                          ? `${agreement.daysUntilDue} days left`
                          : agreement.daysUntilDue === 0
                          ? "Due today"
                          : `${Math.abs(agreement.daysUntilDue)} days overdue`}
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <div
                      className={`text-lg font-bold ${
                        agreement.type === "lent" ? "text-primary" : "text-orange"
                      }`}
                    >
                      {agreement.type === "lent" ? "+" : "-"}${agreement.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {agreement.type === "lent" ? "To receive" : "To pay"}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
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
              .map((agreement) => (
                <Link
                  key={agreement.id}
                  href={`/dashboard/agreement/${agreement.id}`}
                  className="block"
                >
                  <div className="group rounded-xl border border-border/50 bg-card/50 p-4 transition-all hover:border-border hover:bg-card">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                        {agreement.personInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-muted-foreground truncate">
                          {agreement.personName}
                        </h3>
                        <p className="text-sm text-muted-foreground/70 truncate">
                          {agreement.purpose}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-muted-foreground">
                          ${agreement.amount.toLocaleString()}
                        </div>
                        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3" />
                          Settled
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </>
      )}
    </div>
  )
}
