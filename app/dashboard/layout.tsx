"use client"

import React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plus, User, Bell, Sparkles, Users } from "lucide-react"
import useFcmToken from "@/hooks/useFcmToken"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useFcmToken()
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/dashboard/create", icon: Plus, label: "Create" },
    { href: "/dashboard/groups", icon: Users, label: "Groups" },
    { href: "/dashboard/notifications", icon: Bell, label: "Alerts" },
    { href: "/dashboard/profile", icon: User, label: "Profile" },
  ]

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Desktop Header */}
      <header className="fixed top-0 left-0 right-0 z-50 hidden border-b border-border bg-background/95 backdrop-blur-sm lg:block">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img src="/logo.png" alt="TrustFirst" className="h-12 w-12 object-contain" />
            <span className="text-xl font-semibold">TrustFirst</span>
          </Link>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm lg:hidden">
        <div className="flex h-14 items-center justify-center px-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img src="/logo.png" alt="TrustFirst" className="h-10 w-10 object-contain" />
            <span className="text-lg font-semibold">TrustFirst</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-14 lg:pt-16">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden">
        <div className="flex h-16 items-center justify-around px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
