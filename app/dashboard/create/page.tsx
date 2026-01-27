"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Mail,
  Upload,
  Check,
  Info,
  User,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { auth } from "@/firebase"
import { onAuthStateChanged } from "firebase/auth"

const steps = [
  { id: 1, title: "Loan Details", icon: FileText },
  { id: 2, title: "Buffer Days", icon: Calendar },
  { id: 3, title: "Add Witness", icon: Users },
  { id: 4, title: "Upload Proof", icon: Upload },
]

export default function CreateAgreementPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user)
      } else {
        router.push("/auth/signin")
      }
    })

    return () => unsubscribe()
  }, [router])

  const [formData, setFormData] = useState({
    borrowerName: "",
    borrowerEmail: "",
    borrowerPhone: "",
    amount: "",
    returnDate: "",
    purpose: "",
    bufferDays: 3,
    witnessName: "",
    witnessEmail: "",
    witnessPhone: "",
    proofFile: null as File | null,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSliderChange = (value: number[]) => {
    setFormData((prev) => ({
      ...prev,
      bufferDays: value[0],
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        proofFile: e.target.files![0],
      }))
    }
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!currentUser) {
      alert("Please sign in to create an agreement")
      return
    }

    setIsSubmitting(true)

    try {
      const agreementData = {
        lenderId: currentUser.uid,
        lenderName: currentUser.displayName || currentUser.email?.split("@")[0] || "User",
        lenderEmail: currentUser.email,
        borrowerName: formData.borrowerName,
        borrowerEmail: formData.borrowerEmail,
        borrowerPhone: formData.borrowerPhone,
        amount: parseFloat(formData.amount),
        purpose: formData.purpose,
        dueDate: formData.returnDate,
        bufferDays: formData.bufferDays,
        witnessName: formData.witnessName,
        witnessEmail: formData.witnessEmail,
        witnessPhone: formData.witnessPhone,
        proofFile: formData.proofFile
          ? {
              fileName: formData.proofFile.name,
              fileUrl: "/placeholder-proof.jpg", // In production, upload to storage
            }
          : undefined,
      }

      const response = await fetch("/api/agreements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agreementData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/dashboard")
      } else {
        // Show user-friendly error message
        if (data.message) {
          alert(data.message)
        } else {
          alert(`Failed to create agreement: ${data.error}`)
        }
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error creating agreement:", error)
      alert("Failed to create agreement. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.borrowerName &&
          formData.borrowerEmail &&
          formData.amount &&
          formData.returnDate
        )
      case 2:
        return true
      case 3:
        return true
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Create Trust Agreement</h1>
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of 4
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    currentStep > step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : currentStep === step.id
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium hidden sm:block ${
                    currentStep >= step.id
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 w-8 sm:w-16 lg:w-24 transition-colors ${
                    currentStep > step.id ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        {/* Step 1: Loan Details */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="borrowerName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Borrower Name
              </Label>
              <Input
                id="borrowerName"
                name="borrowerName"
                placeholder="Sarah Chen"
                value={formData.borrowerName}
                onChange={handleChange}
                className="h-12 bg-input border-border"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="borrowerEmail" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="borrowerEmail"
                  name="borrowerEmail"
                  type="email"
                  placeholder="sarah@example.com"
                  value={formData.borrowerEmail}
                  onChange={handleChange}
                  className="h-12 bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="borrowerPhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone (Optional)
                </Label>
                <Input
                  id="borrowerPhone"
                  name="borrowerPhone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.borrowerPhone}
                  onChange={handleChange}
                  className="h-12 bg-input border-border"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Amount
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="2500"
                  value={formData.amount}
                  onChange={handleChange}
                  className="h-12 bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="returnDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Expected Return Date
                </Label>
                <Input
                  id="returnDate"
                  name="returnDate"
                  type="date"
                  value={formData.returnDate}
                  onChange={handleChange}
                  className="h-12 bg-input border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Purpose (Optional)
              </Label>
              <Textarea
                id="purpose"
                name="purpose"
                placeholder="Rent for March, Emergency car repair, etc."
                value={formData.purpose}
                onChange={handleChange}
                className="min-h-[100px] bg-input border-border resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Buffer Days */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4">
              <Lock className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold text-primary">Private Feature</h3>
                <p className="text-sm text-muted-foreground">
                  Only visible to you, not the borrower. This gives you grace
                  period before sending reminders.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg">
                Buffer Days: {formData.bufferDays} days
              </Label>
              <Slider
                value={[formData.bufferDays]}
                onValueChange={handleSliderChange}
                min={0}
                max={14}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>No buffer</span>
                <span>2 weeks</span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-secondary/30 p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    If the return date is February 15 and buffer is 3 days:
                  </p>
                  <ul className="list-disc space-y-1 pl-4">
                    <li>Trust score starts dropping on February 18</li>
                    <li>AI reminders begin on February 18</li>
                    <li>The borrower sees February 15 as the due date</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Add Witness */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-secondary/30 p-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-primary" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    Witness will receive an approval email
                  </p>
                  <p className="text-muted-foreground">
                    They can verify the agreement but will NOT see the monetary
                    amount - only the terms and parties involved.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="witnessName" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Witness Name (Optional)
                </Label>
                <Input
                  id="witnessName"
                  name="witnessName"
                  placeholder="John Smith"
                  value={formData.witnessName}
                  onChange={handleChange}
                  className="h-12 bg-input border-border"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="witnessEmail"
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="witnessEmail"
                    name="witnessEmail"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.witnessEmail}
                    onChange={handleChange}
                    className="h-12 bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="witnessPhone"
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone (Optional)
                  </Label>
                  <Input
                    id="witnessPhone"
                    name="witnessPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.witnessPhone}
                    onChange={handleChange}
                    className="h-12 bg-input border-border"
                  />
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Adding a witness is optional but recommended for larger amounts.
            </p>
          </div>
        )}

        {/* Step 4: Upload Proof */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 text-lg font-semibold">
                Upload Transaction Screenshot
              </h2>
              <p className="text-sm text-muted-foreground">
                Upload proof that you sent the money (bank transfer, payment
                app, etc.)
              </p>
            </div>

            <label
              htmlFor="proof-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 p-10 transition-colors hover:border-primary/50 hover:bg-secondary/50"
            >
              {formData.proofFile ? (
                <div className="text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 mx-auto">
                    <Check className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-medium">{formData.proofFile.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Click to change file
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-secondary mx-auto">
                    <Upload className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="font-medium">Click to upload</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    PNG, JPG or PDF up to 10MB
                  </p>
                </div>
              )}
              <input
                id="proof-upload"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <div className="rounded-xl border border-border bg-secondary/30 p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  This proof will be visible to the borrower and witness as
                  confirmation that the money was sent.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex gap-3">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={handleBack}
            className="h-12 flex-1 bg-transparent border-border"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
        {currentStep < 4 ? (
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="h-12 flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-12 flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? "Creating Agreement..." : "Create Agreement"}
          </Button>
        )}
      </div>
    </div>
  )
}
