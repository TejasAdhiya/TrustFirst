"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"

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
  const [user] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    initials: "JD",
    trustScore: 92,
    totalLent: 8500,
    totalBorrowed: 1200,
    agreementCount: 12,
    memberSince: "January 2025",
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:px-6">
      {/* Profile Header */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
              {user.initials}
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
              {user.phone}
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
            <div className="text-sm font-medium">{user.memberSince}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            ${user.totalLent.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">Total Lent</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-orange">
            ${user.totalBorrowed.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">Total Borrowed</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{user.agreementCount}</div>
          <div className="text-xs text-muted-foreground">Agreements</div>
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
        ))}
      </div>

      {/* Sign Out */}
      <Link href="/">
        <Button
          variant="outline"
          className="w-full h-14 bg-transparent border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </Button>
      </Link>
    </div>
  )
}
