"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { auth } from "@/firebase"
import { onAuthStateChanged } from "firebase/auth"

export default function CreateGroupPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [memberEmails, setMemberEmails] = useState<string[]>([])
  const [newMemberEmail, setNewMemberEmail] = useState("")

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

  const handleAddMember = () => {
    if (newMemberEmail && !memberEmails.includes(newMemberEmail)) {
      setMemberEmails([...memberEmails, newMemberEmail])
      setNewMemberEmail("")
    }
  }

  const handleRemoveMember = (email: string) => {
    setMemberEmails(memberEmails.filter((e) => e !== email))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) {
      alert("Please sign in to create a group")
      return
    }

    if (!formData.name) {
      alert("Please enter a group name")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          createdBy: currentUser.uid,
          createdByName: currentUser.displayName || currentUser.email?.split("@")[0] || "User",
          createdByEmail: currentUser.email,
          memberEmails,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/dashboard/groups/${data.group._id}`)
      } else {
        alert(`Failed to create group: ${data.error}`)
      }
    } catch (error) {
      console.error("Error creating group:", error)
      alert("Failed to create group. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard/groups"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Create New Group</h1>
          <p className="text-sm text-muted-foreground">
            Add members to start requesting money
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Office Friends, College Buddies, etc."
              value={formData.name}
              onChange={handleChange}
              className="h-12 bg-input border-border"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What is this group for?"
              value={formData.description}
              onChange={handleChange}
              className="min-h-[100px] bg-input border-border resize-none"
            />
          </div>

          {/* Add Members */}
          <div className="space-y-2">
            <Label>Add Members (Optional)</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="member@example.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddMember()
                  }
                }}
                className="h-12 bg-input border-border"
              />
              <Button
                type="button"
                onClick={handleAddMember}
                variant="outline"
                className="h-12 px-6"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Members must be registered on TrustFirst
            </p>
          </div>

          {/* Members List */}
          {memberEmails.length > 0 && (
            <div className="space-y-2">
              <Label>Members ({memberEmails.length})</Label>
              <div className="space-y-2">
                {memberEmails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3"
                  >
                    <span className="text-sm">{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(email)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-primary text-primary-foreground text-lg font-semibold hover:bg-primary/90"
          >
            {isSubmitting ? "Creating Group..." : "Create Group"}
          </Button>
        </div>
      </form>
    </div>
  )
}
