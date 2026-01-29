"use client"

import React from "react"

import { useState, use, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { auth } from "@/firebase"
import { trackUserLocation } from "@/app/utils/radar"
import { onAuthStateChanged } from "firebase/auth"

export default function AgreementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)
  const [agreement, setAgreement] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isStrictMode, setIsStrictMode] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [aiMessage, setAiMessage] = useState("")
  const [aiMessages, setAiMessages] = useState<any[]>([])
  const [isCallingBorrower, setIsCallingBorrower] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid)
        await fetchAgreement()
      } else {
        router.push("/auth/signin")
      }
    })

    return () => unsubscribe()
  }, [router, id])

  const fetchAgreement = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/agreements/${id}`)
      const data = await response.json()

      if (response.ok) {
        setAgreement(data.agreement)
        setIsStrictMode(data.agreement.strictMode)
        setAiMessages(data.agreement.aiMessages || [])
      } else {
        console.error("Failed to fetch agreement:", data.error)
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error fetching agreement:", error)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  // Determine user role
  const isLender = agreement?.lenderId === currentUserId
  const isBorrower = agreement?.borrowerId === currentUserId
  const isWitness = agreement?.witnessEmail && auth.currentUser?.email === agreement.witnessEmail

  const daysUntilDue = agreement
    ? Math.ceil(
      (new Date(agreement.dueDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
    )
    : 0

  const handleStrictModeToggle = async (checked: boolean) => {
    setIsStrictMode(checked)
    try {
      await fetch(`/api/agreements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strictMode: checked }),
      })
      setAgreement((prev: any) => ({ ...prev, strictMode: checked }))
    } catch (error) {
      console.error("Error updating strict mode:", error)
    }
  }

  const handleAICall = async () => {
    setIsCallingBorrower(true)
    const newMessage = {
      id: `system-${Date.now()}`,
      role: "system",
      content: `Connecting to AI mediator... Calling ${agreement.borrowerName}...`,
      timestamp: new Date().toISOString(),
    }
    setAiMessages((prev) => [...prev, newMessage])

    // Start location tracking in background (non-blocking for UI animation)
    // We await it but we catch errors silently so the call proceeds.
    const trackAndSaveLocation = async () => {
      try {
        console.log("Tracking user location...");
        const locationData: any = await trackUserLocation(currentUserId || "guest");
        console.log("Location result:", locationData);

        if (locationData) {
          await fetch("/api/live-location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              agreementId: id,
              userId: currentUserId,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              locationContext: locationData.locationContext || locationData.context,
            }),
          });
          console.log("Location saved to database.");
        }
      } catch (locError) {
        // Silently fail location tracking as per requirement "strictly do NOT block the UI"
        console.error("Location tracking/saving failed:", locError);
      }
    };

    try {
      // Execute location tracking first (or fast enough)
      // The user requested "before this part after that webhook will connect".
      // We will await it, but since we have a timeout and IP fallback, it should return reasonably fast (or null).
      await trackAndSaveLocation();

      // Call the AI call endpoint which triggers Make.com webhook
      const response = await fetch(`/api/agreements/${id}/ask-ai-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (response.ok) {
        const successMessage = {
          id: `system-success-${Date.now()}`,
          role: "system",
          content: `AI mediator call initiated successfully for ${agreement.borrowerName}. The call will be processed shortly.`,
          timestamp: new Date().toISOString(),
        }
        setAiMessages((prev) => [...prev, successMessage])

        // Refresh agreement to get updated timeline and messages
        await fetchAgreement()
      } else {
        const errorMessage = {
          id: `system-error-${Date.now()}`,
          role: "system",
          content: `Failed to initiate AI call: ${data.error || 'Unknown error'}`,
          timestamp: new Date().toISOString(),
        }
        setAiMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error("Error triggering AI call:", error)
      const errorMessage = {
        id: `system-conn-error-${Date.now()}`,
        role: "system",
        content: `Error connecting to AI mediator. Please try again.`,
        timestamp: new Date().toISOString(),
      }
      setAiMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsCallingBorrower(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiMessage.trim()) return

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: aiMessage,
      timestamp: new Date().toISOString(),
    }
    setAiMessages((prev) => [...prev, userMessage])
    setAiMessage("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content:
          "I understand your concern. I can reach out to the borrower to discuss the payment timeline. Would you like me to call them now or send a reminder message first?",
        timestamp: new Date().toISOString(),
      }
      setAiMessages((prev) => [...prev, aiResponse])

      // Update agreement with new AI messages
      fetch(`/api/agreements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiMessages: [...aiMessages, userMessage, aiResponse],
        }),
      }).catch((error) => console.error("Error saving AI messages:", error))
    }, 1500)
  }

  const handleSendReminder = async () => {
    try {
      const response = await fetch(`/api/agreements/${id}/send-reminder`, {
        method: "POST",
      })

      if (response.ok) {
        alert("Payment reminder sent successfully!")
      } else {
        alert("Failed to send reminder")
      }
    } catch (error) {
      console.error("Error sending reminder:", error)
      alert("Failed to send reminder")
    }
  }

  const handleWitnessApproval = async () => {
    try {
      const response = await fetch(`/api/agreements/${id}/approve-witness`, {
        method: "POST",
      })

      if (response.ok) {
        alert("Agreement approved successfully!")
        await fetchAgreement() // Refresh agreement data
      } else {
        alert("Failed to approve agreement")
      }
    } catch (error) {
      console.error("Error approving agreement:", error)
      alert("Failed to approve agreement")
    }
  }

  const handleSettleAgreement = async () => {
    if (!confirm("Are you sure you want to settle and close this agreement? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/agreements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "settled" }),
      })

      if (response.ok) {
        alert("Agreement settled successfully!")
        await fetchAgreement() // Refresh agreement data
        router.push("/dashboard")
      } else {
        alert("Failed to settle agreement")
      }
    } catch (error) {
      console.error("Error settling agreement:", error)
      alert("Failed to settle agreement")
    }
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

  if (loading || !agreement) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
            <p className="text-muted-foreground">Loading agreement...</p>
          </div>
        </div>
      </div>
    )
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
          <p className="text-sm text-muted-foreground">{agreement.purpose || "No purpose specified"}</p>
        </div>
        <div
          className={`text-2xl font-bold ${isLender ? "text-primary" : "text-orange"
            }`}
        >
          ₹{agreement.amount.toLocaleString()}
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
              className={`text-sm ${daysUntilDue > 0 ? "text-primary" : "text-orange"
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
              className={`text-sm ${agreement.witnessApproved ? "text-primary" : "text-orange"
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
            <div key={`${item.event}-${index}`} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${item.completed
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
                    className={`w-0.5 h-8 mt-2 ${item.completed ? "bg-primary" : "bg-border"
                      }`}
                  />
                )}
              </div>
              <div className="flex-1 pb-2">
                <div
                  className={`font-medium ${item.completed ? "text-foreground" : "text-muted-foreground"
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
          <h2 className="text-lg font-semibold">Payment Actions</h2>
          <Sparkles className="h-5 w-5 text-primary" />
        </div>

        {isLender && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Send automated payment reminders to the borrower via email.
            </p>
            <Button
              onClick={handleSendReminder}
              variant="outline"
              className="w-full h-12 bg-transparent border-orange/30 text-orange hover:bg-orange/10"
            >
              <Mail className="mr-2 h-4 w-4" />
              Send Payment Reminder Email
            </Button>
          </div>
        )}

        <div className="mt-4">
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
            className={`h-5 w-5 text-muted-foreground transition-transform ${showAIChat ? "rotate-90" : ""
              }`}
          />
        </button>

        {showAIChat && (
          <div className="border-t border-border">
            {/* Chat Messages */}
            <div className="max-h-80 overflow-y-auto p-4 space-y-4">
              {aiMessages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === "user"
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
        {/* Witness Approval Button - Only show if user is witness and not yet approved */}
        {isWitness && !agreement.witnessApproved && (
          <Button
            onClick={handleWitnessApproval}
            className="w-full h-14 bg-chart-3 text-white hover:bg-chart-3/90"
          >
            <Users className="mr-2 h-5 w-5" />
            Approve as Witness
          </Button>
        )}

        {/* Borrower Actions - Upload Proof (Future Feature) */}
        {isBorrower && agreement.status !== "settled" && (
          <Button
            variant="outline"
            className="w-full h-14 bg-transparent border-primary text-primary hover:bg-primary/10"
            disabled
          >
            <Upload className="mr-2 h-5 w-5" />
            Mark as Paid & Upload Proof (Coming Soon)
          </Button>
        )}

        {/* Lender Actions - Settle Agreement */}
        {isLender && agreement.status !== "settled" && (
          <Button
            onClick={handleSettleAgreement}
            className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Settle Up / Close Loan
          </Button>
        )}

        {/* Show Settled Status */}
        {agreement.status === "settled" && (
          <div className="w-full h-14 flex items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Agreement Settled
          </div>
        )}
      </div>
    </div>
  )
}
