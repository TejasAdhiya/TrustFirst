"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  User,
  Mail,
  Phone,
  Shield,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit2,
  Star,
  CheckCircle,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { auth } from "@/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"

const menuItems = [
  {
    id: "account",
    title: "Account Settings",
    description: "Update your personal information",
    icon: User,
  },
  {
    id: "security",
    title: "Security",
    description: "Password and authentication",
    icon: Shield,
  },
  {
    id: "payment",
    title: "Payment Methods",
    description: "Manage your linked accounts",
    icon: CreditCard,
  },
  {
    id: "notifications",
    title: "Notification Preferences",
    description: "Control how you receive alerts",
    icon: Bell,
  },
  {
    id: "help",
    title: "Help & Support",
    description: "FAQs and contact support",
    icon: HelpCircle,
  },
]

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Verification Logic
  const { toast } = useToast()
  const [panNumber, setPanNumber] = useState("")
  const [verifying, setVerifying] = useState(false)

  const handleVerify = async () => {
    // Regex for PAN card: 5 letters, 4 digits, 1 letter
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;

    if (!panRegex.test(panNumber.toUpperCase())) {
      toast({
        title: "Invalid PAN Number",
        description: "Please enter a valid PAN number format (e.g., ABCDE1234F).",
        variant: "destructive",
      })
      return
    }

    try {
      setVerifying(true)
      const response = await fetch('/api/user/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: user.uid }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user) // Update user with new Trust Score and isVerified status
        toast({
          title: "Verification Successful",
          description: "Your identity has been verified and Trust Score increased by 10!",
        })
        setPanNumber("") // Clear input
      } else {
        toast({
          title: "Verification Failed",
          description: data.error || "Something went wrong.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Verification error:", error)
      toast({
        title: "Error",
        description: "Details: An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setVerifying(false)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchUserData(firebaseUser.uid)
      } else {
        router.push("/auth/signin")
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchUserData = async (uid: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${uid}`)
      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
      } else {
        console.error("Failed to fetch user:", data.error)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getMemberSince = (createdAt: string) => {
    const date = new Date(createdAt)
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 lg:px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:px-6">
      {/* Profile Header */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
              {getInitials(user.name)}
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <Edit2 className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{user.name}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {user.email}
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              {user.phone || "No phone number"}
            </div>
          </div>
        </div>

        {/* Trust Score */}
        <div className="mt-6 flex items-center gap-4 rounded-xl bg-primary/10 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Your Trust Score</div>
            <div className="text-2xl font-bold text-primary">{user.trustScore}/100</div>
          </div>


          <div className="ml-auto text-right">
            <div className="text-xs text-muted-foreground">Member since</div>
            <div className="text-sm font-medium">{getMemberSince(user.createdAt)}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            ₹{user.totalLent.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">Total Lent</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-orange">
            ₹{user.totalBorrowed.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">Total Borrowed</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{user.agreementCount}</div>
          <div className="text-xs text-muted-foreground">Agreements</div>
        </div>
      </div>

      {/* Identity Verification */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-lg">Identity Verification</h2>
            <p className="text-sm text-muted-foreground">Verify your identity to boost your Trust Score</p>
          </div>
        </div>

        <div className="mt-4">
          {user.isVerified ? (
            <div className="flex items-center gap-2 rounded-xl bg-green-500/10 p-4 text-green-600 border border-green-500/20">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Identity verification complete</span>
              <Badge className="ml-auto bg-green-500 hover:bg-green-600">Verified</Badge>
            </div>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" variant="secondary">
                  Verify Identity
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Verify Identity</DialogTitle>
                  <DialogDescription>
                    Enter your PAN number to verify your identity. We do not store this information.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                  <div className="grid flex-1 gap-2">
                    <Input
                      placeholder="Enter PAN Number (e.g. ABCDE1234F)"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      className="font-mono uppercase"
                      disabled={verifying}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleVerify} disabled={verifying || !panNumber}>
                    {verifying ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="mb-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className="w-full flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <item.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-muted-foreground">
                {item.description}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        ))
        }
      </div >

      {/* Sign Out */}
      < Button
        onClick={handleSignOut}
        variant="outline"
        className="w-full h-14 bg-transparent border-destructive/30 text-destructive hover:bg-destructive/10"
      >
        <LogOut className="mr-2 h-5 w-5" />
        Sign Out
      </Button >
    </div >
  )
}
