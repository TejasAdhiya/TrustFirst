"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Shield, Users, Bot, Sparkles, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: Bot,
      title: "AI Mediation",
      description: "Let AI handle sensitive conversations and payment reminders with empathy and professionalism.",
    },
    {
      icon: Shield,
      title: "Trust Scores",
      description: "Build and track credibility through transparent, fair trust scoring that both parties can see.",
    },
    {
      icon: Users,
      title: "Legal-Free Agreements",
      description: "Create binding social agreements with witnesses - no lawyers, no courts, just trust.",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="TrustFirst" className="h-12 w-12 object-contain" />
            <span className="text-xl font-semibold tracking-tight">TrustFirst</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-16">
        {/* Background Elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Powered by AI for smarter lending</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-balance">
            Trust & Transparency in{" "}
            <span className="text-primary">Informal Finance</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl text-pretty">
            The modern way to manage money between friends and family. Create agreements,
            track trust scores, and let AI handle the awkward conversations.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="group h-14 min-w-[200px] bg-primary text-primary-foreground text-lg font-semibold hover:bg-primary/90"
              >
                Sign Up Free
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button
                size="lg"
                variant="outline"
                className="h-14 min-w-[200px] border-border text-lg font-semibold bg-transparent hover:bg-secondary"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-16">
            {[
              { value: "10K+", label: "Active Users" },
              { value: "₹2M+", label: "Managed Securely" },
              { value: "99%", label: "Trust Rate" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary sm:text-4xl">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-muted-foreground/30 p-2">
            <div className="h-2 w-1 rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need for{" "}
              <span className="text-primary">trusted lending</span>
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Built for the real world, where money and relationships need to coexist peacefully.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/50 hover:bg-card/80"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-300 ${hoveredFeature === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-primary"
                    }`}
                >
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                <ChevronRight
                  className={`absolute bottom-8 right-8 h-5 w-5 text-primary transition-all duration-300 ${hoveredFeature === index ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                    }`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t border-border bg-secondary/30 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              How TrustFirst Works
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Three simple steps to stress-free lending between friends and family.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create Agreement",
                description: "Set up a trust agreement with loan details, return date, and optionally add a witness.",
              },
              {
                step: "02",
                title: "Track Progress",
                description: "Monitor trust scores, receive AI-powered reminders, and keep everything transparent.",
              },
              {
                step: "03",
                title: "Settle Securely",
                description: "Upload payment proofs, get AI mediation if needed, and close agreements smoothly.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="mb-4 text-5xl font-bold text-primary/20">{item.step}</div>
                <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to transform how you lend?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
            Join thousands of users who have simplified their informal finances with TrustFirst.
          </p>
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="group h-14 px-10 bg-primary text-primary-foreground text-lg font-semibold hover:bg-primary/90"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="TrustFirst" className="h-10 w-10 object-contain" />
            <span className="font-semibold">TrustFirst</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 TrustFirst. Building trust, one agreement at a time.
          </p>
        </div>
      </footer>
    </div>
  )
}
