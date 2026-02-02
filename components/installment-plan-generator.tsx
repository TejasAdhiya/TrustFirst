"use client"

import { useState } from "react"
import { Sparkles, Calendar, Check, AlertCircle, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { generateInstallmentPlans, InstallmentPlan } from "@/app/actions/generate-installment-plan"
import { cn } from "@/lib/utils"

interface InstallmentPlanGeneratorProps {
    amount: number
    currency?: string
    dueDate: string
    borrowerName: string
    agreementId: string
    onPlanConfirmed?: (plan: InstallmentPlan, planIndex: number) => void
}

export function InstallmentPlanGenerator({
    amount,
    currency = "INR",
    dueDate,
    borrowerName,
    agreementId,
    onPlanConfirmed
}: InstallmentPlanGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [plans, setPlans] = useState<InstallmentPlan[]>([])
    const [error, setError] = useState<string | null>(null)
    const [selectedPlanIndex, setSelectedPlanIndex] = useState<number | null>(null)

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (open && plans.length === 0 && !loading) {
            fetchPlans()
        }
    }

    const fetchPlans = async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await generateInstallmentPlans(amount, currency, dueDate, borrowerName)
            if (result.error) {
                setError(result.error)
            } else if (result.plans) {
                setPlans(result.plans)
            }
        } catch (e) {
            setError("An unexpected error occurred while generating plans.")
        } finally {
            setLoading(false)
        }
    }

    const handleSelectPlan = (index: number) => {
        setSelectedPlanIndex(index)
    }

    const handleConfirmPlan = () => {
        if (selectedPlanIndex !== null && onPlanConfirmed) {
            const selectedPlan = plans[selectedPlanIndex]
            // Store plan in sessionStorage to avoid regenerating
            sessionStorage.setItem('selectedInstallmentPlan', JSON.stringify({
                planIndex: selectedPlanIndex,
                plan: selectedPlan
            }))
            onPlanConfirmed(selectedPlan, selectedPlanIndex)
            setIsOpen(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full h-12 bg-transparent border-primary/30 text-primary hover:bg-primary/10 transition-all hover:border-primary/50"
                >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Installment Plan with AI
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[85vw] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">AI Installment Planner</DialogTitle>
                            <DialogDescription>
                                Smart repayment schedules tailored for {borrowerName}.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden p-6 pt-2">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full blur-xl bg-primary/20 animate-pulse"></div>
                                <Loader2 className="h-12 w-12 text-primary animate-spin relative z-10" />
                            </div>
                            <p className="text-muted-foreground text-lg animate-pulse">
                                Analyzing financial context & generating plans...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="rounded-full bg-destructive/10 p-4">
                                <AlertCircle className="h-10 w-10 text-destructive" />
                            </div>
                            <h3 className="text-lg font-semibold text-destructive">Generation Failed</h3>
                            <p className="text-muted-foreground max-w-md">{error}</p>
                            <Button onClick={fetchPlans} variant="outline" className="mt-4">
                                Try Again
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-y-auto pb-4">
                            {plans.map((plan, index) => (
                                <Card
                                    key={index}
                                    className={cn(
                                        "flex flex-col h-full border-2 transition-all duration-300 hover:shadow-lg hover:border-primary/50 cursor-pointer relative overflow-hidden group",
                                        selectedPlanIndex === index ? "border-primary bg-primary/5 shadow-xl scale-[1.02]" : "border-border"
                                    )}
                                    onClick={() => handleSelectPlan(index)}
                                >
                                    {selectedPlanIndex === index && (
                                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg z-20">
                                            SELECTED
                                        </div>
                                    )}
                                    <CardHeader className="pb-3 bg-muted/30">
                                        <CardTitle className="flex justify-between items-center text-lg">
                                            {plan.planName}
                                            <Badge variant={index === 0 ? "destructive" : index === 1 ? "default" : "secondary"}>
                                                {plan.durationMonths} Months
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2 min-h-[40px]">
                                            {plan.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 p-0">
                                        <ScrollArea className="h-[300px] w-full p-4">
                                            <div className="space-y-3">
                                                {plan.installments.map((inst, i) => (
                                                    <div key={i} className="flex justify-between items-center p-2 rounded-md bg-secondary/20 hover:bg-secondary/40 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center border border-border text-xs text-muted-foreground font-mono">
                                                                {i + 1}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium">
                                                                    {new Date(inst.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                </span>
                                                                {inst.note && <span className="text-[10px] text-muted-foreground">{inst.note}</span>}
                                                            </div>
                                                        </div>
                                                        <span className="font-semibold text-primary">
                                                            {currency === "INR" ? "₹" : currency} {inst.amount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                        <div className="px-4 py-2 bg-muted/30 border-t border-border mt-auto">
                                            <div className="flex justify-between items-center font-bold">
                                                <span>Total</span>
                                                <span>{currency === "INR" ? "₹" : currency} {plan.totalAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-2">
                                        <Button
                                            className={cn("w-full transition-all", selectedPlanIndex === index ? "opacity-100" : "opacity-0 group-hover:opacity-100")}
                                            variant={selectedPlanIndex === index ? "default" : "secondary"}
                                        >
                                            {selectedPlanIndex === index ? (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" /> Plan Selected
                                                </>
                                            ) : (
                                                "Select This Plan"
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Confirm Button */}
                {!loading && !error && selectedPlanIndex !== null && (
                    <div className="p-6 pt-0 border-t border-border shrink-0">
                        <Button 
                            onClick={handleConfirmPlan} 
                            className="w-full h-12 text-lg font-semibold gap-2"
                        >
                            <Check className="h-5 w-5" />
                            Confirm Selected Plan & Upload Payment Proofs
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
