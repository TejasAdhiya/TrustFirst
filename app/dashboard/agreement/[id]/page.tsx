"use client"

import React from "react"

import { useState, use } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Users,
  Mail,
  Phone,
  ImageIcon,
  Upload,
  Sparkles,
  Send,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

// Mock agreement data
const mockAgreement = {
  id: "1",
  borrowerName: "Sarah Chen",
  borrowerEmail: "sarah@example.com",
  borrowerPhone: "+1 (555) 234-5678",
  borrowerInitials: "SC",
  amount: 2500,
  purpose: "Rent for March",
  createdDate: "2026-01-15",
  dueDate: "2026-02-15",
  status: "active",
  type: "lent",
  trustScore: 85,
  strictMode: false,
  witnessName: "Michael Brown",
  witnessEmail: "michael@example.com",
  witnessApproved: true,
  timeline: [
    { event: "Agreement Created", date: "2026-01-15", completed: true },
    { event: "Witness Approved", date: "2026-01-16", completed: true },
    { event: "Money Sent", date: "2026-01-17", completed: true },
    { event: "Payment Received", date: null, completed: false },
  ],
  lenderProof: {
    fileName: "bank_transfer_jan15.png",
    uploadedAt: "2026-01-17",
  },
  borrowerProof: null,
  aiMessages: [
    {
      id: "1",
      role: "system",
      content: "Setu AI Mediator is ready to help with this agreement.",
      timestamp: "2026-01-15",
    },
  ],
}

export default function AgreementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [agreement, setAgreement] = useState(mockAgreement)
  const [isStrictMode, setIsStrictMode] = useState(agreement.strictMode)
  const [showAIChat, setShowAIChat] = useState(false)
  const [aiMessage, setAiMessage] = useState("")
  const [aiMessages, setAiMessages] = useState(agreement.aiMessages)
  const [isCallingBorrower, setIsCallingBorrower] = useState(false)

  // Simulate current user is the lender
  const isLender = agreement.type === "lent"

  const daysUntilDue = Math.ceil(
    (new Date(agreement.dueDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  )

  const handleStrictModeToggle = (checked: boolean) => {
    setIsStrictMode(checked)
    setAgreement((prev) => ({ ...prev, strictMode: checked }))
  }

  const handleAICall = async () => {
    setIsCallingBorrower(true)
    setAiMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "system",
        content: `Connecting to Vapi AI... Calling ${agreement.borrowerName}...`,
        timestamp: new Date().toISOString(),
      },
    ])

    // Simulate AI call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setAiMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: `I spoke with ${agreement.borrowerName}. They confirmed they are aware of the upcoming payment due on ${new Date(agreement.dueDate).toLocaleDateString()} and plan to transfer the amount by then.`,
        timestamp: new Date().toISOString(),
      },
    ])
    setIsCallingBorrower(false)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiMessage.trim()) return

    setAiMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: aiMessage,
        timestamp: new Date().toISOString(),
      },
    ])
    setAiMessage("")

    // Simulate AI response
    setTimeout(() => {
      setAiMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content:
            "I understand your concern. I can reach out to Sarah to discuss the payment timeline. Would you like me to call them now or send a reminder message first?",
          timestamp: new Date().toISOString(),
        },
      ])
    }, 1500)
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-primary"
    if (score >= 60) return "text-chart-4"
    if (score >= 40) return "text-orange"
    return "text-destructive"
  }

  const getTrustScoreRingColor = (score: number) => {
    if (score >= 80) return "stroke-primary"
    if (score >= 60) return "stroke-chart-4"
    if (score >= 40) return "stroke-orange"
    return "stroke-destructive"
  }

  console.log("[v0] Agreement ID:", id)

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{agreement.borrowerName}</h1>
          <p className="text-sm text-muted-foreground">{agreement.purpose}</p>
        </div>
        <div
          className={`text-2xl font-bold ${
            isLender ? "text-primary" : "text-orange"
          }`}
        >
          ${agreement.amount.toLocaleString()}
        </div>
      </div>

      {/* Status & Due Date */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          {daysUntilDue > 0 ? (
            <Clock className="h-8 w-8 text-primary" />
          ) : (
            <AlertCircle className="h-8 w-8 text-orange" />
          )}
          <div>
            <div className="text-sm text-muted-foreground">Due Date</div>
            <div className="font-semibold">
              {new Date(agreement.dueDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div
              className={`text-sm ${
                daysUntilDue > 0 ? "text-primary" : "text-orange"
              }`}
            >
              {daysUntilDue > 0
                ? `${daysUntilDue} days remaining`
                : daysUntilDue === 0
                ? "Due today"
                : `${Math.abs(daysUntilDue)} days overdue`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          {agreement.witnessApproved ? (
            <CheckCircle2 className="h-8 w-8 text-primary" />
          ) : (
            <Users className="h-8 w-8 text-orange" />
          )}
          <div>
            <div className="text-sm text-muted-foreground">Witness Status</div>
            <div className="font-semibold">{agreement.witnessName}</div>
            <div
              className={`text-sm ${
                agreement.witnessApproved ? "text-primary" : "text-orange"
              }`}
            >
              {agreement.witnessApproved ? "Approved" : "Pending Approval"}
            </div>
          </div>
        </div>
      </div>

      {/* Trust Score */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Trust Score</h2>
          {isLender && (
            <div className="flex items-center gap-2">
              <Label
                htmlFor="strict-mode"
                className="text-sm text-muted-foreground"
              >
                {isStrictMode ? "Strict Mode" : "Lenient Mode"}
              </Label>
              <Switch
                id="strict-mode"
                checked={isStrictMode}
                onCheckedChange={handleStrictModeToggle}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-8">
          {/* Trust Score Circle */}
          <div className="relative h-32 w-32 flex-shrink-0">
            <svg className="h-full w-full -rotate-90 transform">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-secondary"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(agreement.trustScore / 100) * 352} 352`}
                strokeLinecap="round"
                className={getTrustScoreRingColor(agreement.trustScore)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-3xl font-bold ${getTrustScoreColor(
                  agreement.trustScore
                )}`}
              >
                {agreement.trustScore}
              </span>
              <span className="text-xs text-muted-foreground">out of 100</span>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-3">
              {isStrictMode
                ? "Strict Mode: Trust score drops faster if payment is late."
                : "Lenient Mode: Grace period before trust score is affected."}
            </p>
            {isLender && (
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                {isStrictMode ? (
                  <ToggleRight className="h-4 w-4 text-primary" />
                ) : (
                  <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                )}
                Only you can see this setting.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Timeline</h2>
        <div className="space-y-4">
          {agreement.timeline.map((item, index) => (
            <div key={item.event} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    item.completed
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {item.completed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </div>
                {index < agreement.timeline.length - 1 && (
                  <div
                    className={`w-0.5 h-8 mt-2 ${
                      item.completed ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 pb-2">
                <div
                  className={`font-medium ${
                    item.completed ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {item.event}
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.date
                    ? new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Pending"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Repayment Plan */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">AI Repayment Plan</h2>
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Let AI suggest an optimal installment plan based on the amount and
          timeline.
        </p>
        <Button
          variant="outline"
          className="w-full h-12 bg-transparent border-primary/30 text-primary hover:bg-primary/10"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Installment Plan with AI
        </Button>
      </div>

      {/* Proof Gallery */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Proof Gallery</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Lender's Proof */}
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              {"Lender's Proof"}
            </div>
            {agreement.lenderProof ? (
              <div className="flex items-center gap-3 rounded-lg bg-card p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <ImageIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-sm">
                    {agreement.lenderProof.fileName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Uploaded{" "}
                    {new Date(agreement.lenderProof.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No proof uploaded yet
              </div>
            )}
          </div>

          {/* Borrower's Proof */}
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              {"Borrower's Repayment Proof"}
            </div>
            {agreement.borrowerProof ? (
              <div className="flex items-center gap-3 rounded-lg bg-card p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <ImageIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-sm">
                    payment_proof.png
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Uploaded today
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <div className="text-sm text-muted-foreground">
                  Waiting for borrower
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Mediator Chat */}
      <div className="mb-6 rounded-xl border border-border bg-card overflow-hidden">
        <button
          onClick={() => setShowAIChat(!showAIChat)}
          className="w-full flex items-center justify-between p-6 hover:bg-secondary/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <h2 className="font-semibold">Setu AI Mediator</h2>
              <p className="text-sm text-muted-foreground">
                Get AI help with sensitive conversations
              </p>
            </div>
          </div>
          <ChevronRight
            className={`h-5 w-5 text-muted-foreground transition-transform ${
              showAIChat ? "rotate-90" : ""
            }`}
          />
        </button>

        {showAIChat && (
          <div className="border-t border-border">
            {/* Chat Messages */}
            <div className="max-h-80 overflow-y-auto p-4 space-y-4">
              {aiMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : msg.role === "system"
                        ? "bg-secondary/50 text-muted-foreground"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {msg.role === "ai" && (
                      <div className="flex items-center gap-2 mb-1 text-xs text-primary">
                        <Sparkles className="h-3 w-3" />
                        Setu AI
                      </div>
                    )}
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Actions */}
            <div className="border-t border-border p-4 space-y-3">
              <Button
                onClick={handleAICall}
                disabled={isCallingBorrower}
                variant="outline"
                className="w-full h-12 bg-transparent border-primary/30 text-primary hover:bg-primary/10"
              >
                <Phone className="mr-2 h-4 w-4" />
                {isCallingBorrower
                  ? "Calling Borrower..."
                  : "Ask AI to Call Borrower"}
              </Button>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder="Type a message to AI..."
                  className="h-12 bg-input border-border"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-12 w-12 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Borrower Contact Info */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Borrower Details</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <span>{agreement.borrowerName}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span>{agreement.borrowerEmail}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span>{agreement.borrowerPhone}</span>
          </div>
        </div>
      </div>

      {/* Settlement Actions */}
      <div className="space-y-3">
        {!isLender && (
          <Button
            variant="outline"
            className="w-full h-14 bg-transparent border-primary text-primary hover:bg-primary/10"
          >
            <Upload className="mr-2 h-5 w-5" />
            Mark as Paid & Upload Proof
          </Button>
        )}

        {isLender && (
          <Button className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Settle Up / Close Loan
          </Button>
        )}
      </div>
    </div>
  )
}
