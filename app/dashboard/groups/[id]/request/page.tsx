"use client"

import { useState, use, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, DollarSign, Calendar, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { auth } from "@/firebase"
import { onAuthStateChanged } from "firebase/auth"

export default function RequestMoneyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { id } = use(params)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    purpose: "",
    dueDate: "",
  })

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) {
      alert("Please sign in to request money")
      return
    }

    if (!formData.amount || !formData.dueDate) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/money-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId: id,
          requesterId: currentUser.uid,
          requesterName: currentUser.displayName || currentUser.email?.split("@")[0] || "User",
          requesterEmail: currentUser.email,
          amount: parseFloat(formData.amount),
          purpose: formData.purpose,
          dueDate: formData.dueDate,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/dashboard/groups/${id}`)
      } else {
        alert(`Failed to create request: ${data.error}`)
      }
    } catch (error) {
      console.error("Error creating request:", error)
      alert("Failed to create request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/dashboard/groups/${id}`}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Request Money</h1>
          <p className="text-sm text-muted-foreground">
            Group members can contribute any amount
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Amount Needed *
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              placeholder="2000"
              value={formData.amount}
              onChange={handleChange}
              className="h-12 bg-input border-border"
              required
            />
            <p className="text-xs text-muted-foreground">
              Members can contribute any amount up to this total
            </p>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Expected Return Date *
            </Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              className="h-12 bg-input border-border"
              required
            />
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Purpose (Optional)
            </Label>
            <Textarea
              id="purpose"
              name="purpose"
              placeholder="Rent, emergency, medical expenses, etc."
              value={formData.purpose}
              onChange={handleChange}
              className="min-h-[100px] bg-input border-border resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
            <h3 className="font-semibold text-primary mb-2">How it works:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Group members will see your request</li>
              <li>• They can contribute any amount they want</li>
              <li>• Each contribution creates a separate agreement</li>
              <li>• You'll repay each person individually</li>
              <li>• Request closes when full amount is received</li>
            </ul>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-primary text-primary-foreground text-lg font-semibold hover:bg-primary/90"
          >
            {isSubmitting ? "Creating Request..." : "Create Money Request"}
          </Button>
        </div>
      </form>
    </div>
  )
}
