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
  Shield,
  Check,
  X,
} from "lucide-react"
import { InstallmentPlanGenerator } from "@/components/installment-plan-generator"
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
  const [showExtensionModal, setShowExtensionModal] = useState(false)
  const [selectedExtensionDays, setSelectedExtensionDays] = useState(1)
  const [isExtending, setIsExtending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Extension modal states initialized

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
    const initMessage = {
      id: `system-${Date.now()}`,
      role: "system",
      content: `Please wait... Checking borrower's live context before connecting...`,
      timestamp: new Date().toISOString(),
    }
    setAiMessages((prev) => [...prev, initMessage])

    try {
      // 1. Check Location & Context
      console.log("Tracking user location for context check...");
      // Pass email for mock testing
      const userEmail = auth.currentUser?.email;
      const locationData: any = await trackUserLocation(currentUserId || "guest", userEmail);
      console.log("Context Result:", locationData);

      // Save location regardless of emergency status (for audit trail)
      if (locationData) {
        try {
          await fetch("/api/live-location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              agreementId: id,
              userId: currentUserId,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              locationContext: locationData.locationContext || locationData.context,
              isEmergency: locationData.isEmergency // Log this too if backend supports
            }),
          });
        } catch (e) {
          console.error("Failed to save location log", e);
        }
      }

      // 2. BLOCKING LOGIC: Is it an emergency?
      if (locationData && locationData.isEmergency) {
        console.warn("🚫 Call Blocked: User is in an emergency/hospital context.");

        const blockedMessage = {
          id: `system-blocked-${Date.now()}`,
          role: "system",
          content: `⚠️ Call Prevented: The borrower is currently detected at a sensitive location (${locationData.locationContext?.description || "Hospital/medical area"}). TrustFirst AI has delayed the call to respect their privacy.`,
          timestamp: new Date().toISOString(),
        }
        setAiMessages((prev) => [...prev, blockedMessage])
        setIsCallingBorrower(false) // Stop loading
        return; // EXIT HERE
      }

      // 3. If Safe -> Proceed to Call
      const connectingMessage = {
        id: `system-conn-${Date.now()}`,
        role: "system",
        content: `Context indicates it's safe to call. Connecting to AI mediator...`,
        timestamp: new Date().toISOString(),
      }
      setAiMessages((prev) => [...prev, connectingMessage])

      // Call the AI call endpoint which triggers Make.com webhook
      const response = await fetch(`/api/agreements/${id}/ask-ai-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
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

  const handleExtendDueDate = async () => {
    if (!selectedExtensionDays || selectedExtensionDays < 1) {
      alert("Please select valid extension days")
      return
    }

    setIsExtending(true)
    try {
      const response = await fetch(`/api/agreements/${id}/extend-due-date`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          extensionDays: selectedExtensionDays,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Due date extended by ${selectedExtensionDays} day(s) successfully!`)
        setShowExtensionModal(false)
        await fetchAgreement() // Refresh agreement data
      } else {
        alert(data.error || "Failed to extend due date")
      }
    } catch (error) {
      console.error("Error extending due date:", error)
      alert("Failed to extend due date")
    } finally {
      setIsExtending(false)
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    setIsUploading(true)
    try {
      // 1. Upload file
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || "Upload failed")
      }

      // 2. Update agreement status and proof
      const updateResponse = await fetch(`/api/agreements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "reviewing",
          borrowerProof: {
            fileName: uploadData.fileName,
            fileUrl: uploadData.fileUrl,
            uploadedAt: new Date().toISOString(),
          },
          timeline: [
            ...agreement.timeline,
            {
              event: "Payment Proof Uploaded",
              date: new Date().toISOString(),
              completed: true,
            },
          ],
        }),
      })

      if (!updateResponse.ok) {
        throw new Error("Failed to update agreement")
      }

      alert("Proof uploaded successfully! Agreement is now under review.")
      await fetchAgreement() // Refresh data
    } catch (error: any) {
      console.error("Error uploading proof:", error)
      alert(`Failed to upload proof: ${error.message}`)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = "" // Reset input
      }
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
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
            ₩{agreement.amount.toLocaleString()}
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

        {/* NEAR AI Analysis Display */}
        {agreement.aiAnalysis && (
          <div className="mt-4 pt-4 border-t border-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">AI Analysis</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/40">
                <Shield className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-300">TEE Secured</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Trust:</span>
                <span className="ml-2 font-semibold">
                  {agreement.aiAnalysis.trustScore?.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Risk:</span>
                <span className="ml-2 font-semibold">{agreement.aiAnalysis.riskLevel}%</span>
              </div>
            </div>
            
            {/* Hardware Acceleration Badge */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Intel TDX</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>NVIDIA GPU</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Secure Processing</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Credit Reports - Simple display */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Credit Reports</h2>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/40">
            <Shield className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">TEE Secured</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <h3 className="font-medium mb-3">Borrower</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agreements</span>
                <span className="font-medium">{agreement.borrowerCreditReport?.totalAgreements ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">On-time Rate</span>
                <span className="font-medium">{agreement.borrowerCreditReport?.onTimeRate ?? 100}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Risk Level</span>
                <span className="font-medium">{agreement.aiAnalysis?.riskLevel ?? 0}%</span>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <h3 className="font-medium mb-3">Lender</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agreements</span>
                <span className="font-medium">{agreement.lenderCreditReport?.totalAgreements ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trust Score</span>
                <span className="font-medium">{agreement.trustScore || 0}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Intel TDX</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>NVIDIA GPU</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Secure Processing</span>
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
          <InstallmentPlanGenerator
            amount={agreement.amount}
            dueDate={agreement.dueDate}
            borrowerName={agreement.borrowerName}
            agreementId={id}
            onPlanConfirmed={(plan, planIndex) => {
              // Navigate to payment proof upload page
              router.push(`/dashboard/agreement/${id}/upload-proofs?plan=${planIndex}`)
            }}
          />
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
                    {agreement.borrowerProof.fileName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Uploaded {new Date(agreement.borrowerProof.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
                <a
                  href={agreement.borrowerProof.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-8 w-8 hover:bg-secondary rounded-full transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </a>
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
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">TrustFirst AI Mediator</h2>
              </div>
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
                        TrustFirst AI
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
                  ? "Calling..."
                  : isLender
                    ? "Ask AI to Call Borrower"
                    : "Get Call from TrustFirst AI"}
              </Button>

              {/* Extend Due Date Button (Borrower Only) */}
              {isBorrower && agreement.bufferDays > 0 && (
                <Button
                  onClick={() => setShowExtensionModal(true)}
                  variant="outline"
                  className="w-full h-12 bg-transparent border-orange/30 text-orange hover:bg-orange/10"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Extend Due Date ({agreement.bufferDays} days available)
                </Button>
              )}

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
        {isBorrower && agreement.status !== "settled" && agreement.status !== "reviewing" && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*"
            />
            <Button
              variant="outline"
              onClick={triggerFileUpload}
              disabled={isUploading}
              className="w-full h-14 border-primary text-primary hover:bg-primary/10"
            >
              <Upload className="mr-2 h-5 w-5" />
              {isUploading ? "Uploading..." : "Mark as Paid & Upload Proof"}
            </Button>
          </>
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

      {/* Extension Modal */}
      {showExtensionModal && agreement && agreement.bufferDays > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border border-border max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Extend Due Date</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You can extend the due date using available buffer days.
            </p>

            <div className="mb-6">
              <Label htmlFor="extensionDays" className="mb-2 block">
                Select extension days (1 to {agreement.bufferDays} days available)
              </Label>
              <select
                id="extensionDays"
                value={selectedExtensionDays}
                onChange={(e) => setSelectedExtensionDays(Number(e.target.value))}
                className="w-full h-12 px-4 rounded-lg border border-border bg-input"
              >
                {Array.from({ length: agreement.bufferDays }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day} day{day > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowExtensionModal(false)}
                variant="outline"
                className="flex-1"
                disabled={isExtending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExtendDueDate}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isExtending}
              >
                {isExtending ? "Extending..." : "Confirm Extension"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
