"use client"

import { useState, use, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Upload,
  Check,
  X,
  Calendar,
  DollarSign,
  ImageIcon,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { toast } from "@/hooks/use-toast"

interface Installment {
  date: string
  amount: number
  note?: string
  proofUploaded: boolean
  proofUrl?: string
  proofFileName?: string
}

export default function UploadProofsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { id } = use(params)
  const planIndex = searchParams.get("plan")
  
  const [agreement, setAgreement] = useState<any>(null)
  const [installments, setInstallments] = useState<Installment[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid)
        await fetchAgreementAndPlan()
      } else {
        router.push("/auth/signin")
      }
    })

    return () => unsubscribe()
  }, [router, id, planIndex])

  const fetchAgreementAndPlan = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/agreements/${id}`)
      const data = await response.json()

      if (response.ok) {
        setAgreement(data.agreement)
        
        // If plan is already selected and saved in DB, load it
        if (data.agreement.selectedInstallmentPlan) {
          console.log('Loading existing plan from database')
          setInstallments(data.agreement.selectedInstallmentPlan.installments)
        } else {
          // Try to get plan from sessionStorage (just selected)
          const storedPlanData = sessionStorage.getItem('selectedInstallmentPlan')
          
          if (storedPlanData) {
            console.log('Loading plan from sessionStorage and saving to database')
            const { planIndex: storedPlanIndex, plan } = JSON.parse(storedPlanData)
            
            // Save plan to database first
            await savePlanToDatabase(storedPlanIndex, plan)
            
            // Clear sessionStorage
            sessionStorage.removeItem('selectedInstallmentPlan')
            
            // Set installments
            setInstallments(plan.installments.map((inst: any) => ({
              ...inst,
              proofUploaded: false,
            })))
          } else if (planIndex) {
            console.log('No stored plan found, generating new plan (fallback)')
            // Fallback: generate plan (should rarely happen)
            await generateAndSavePlan(data.agreement, parseInt(planIndex))
          } else {
            console.error('No plan data available')
            toast({
              title: "Error",
              description: "No installment plan found. Please select a plan first.",
              variant: "destructive",
            })
            router.push(`/dashboard/agreement/${id}`)
          }
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load agreement",
          variant: "destructive",
        })
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error fetching agreement:", error)
      toast({
        title: "Error",
        description: "Failed to load agreement",
        variant: "destructive",
      })
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const savePlanToDatabase = async (selectedPlanIndex: number, plan: any) => {
    try {
      console.log('Saving plan to database:', plan.planName)
      const saveResponse = await fetch(`/api/agreements/${id}/save-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planIndex: selectedPlanIndex,
          planName: plan.planName,
          installments: plan.installments.map((inst: any) => ({
            date: inst.date,
            amount: inst.amount,
            note: inst.note,
            proofUploaded: false,
          })),
        }),
      })

      const result = await saveResponse.json()

      if (!saveResponse.ok) {
        console.error("Failed to save plan to database:", result)
        throw new Error(result.error || 'Failed to save plan')
      }
      
      console.log('Plan saved successfully to database')
      
      // Wait and then verify the plan was actually saved by fetching again
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Fetch agreement again to verify plan is saved
      const verifyResponse = await fetch(`/api/agreements/${id}`)
      const verifyData = await verifyResponse.json()
      
      if (!verifyData.agreement?.selectedInstallmentPlan) {
        console.error('Plan not found after save, retrying...')
        // Wait a bit more and try one more time
        await new Promise(resolve => setTimeout(resolve, 1000))
        const retryResponse = await fetch(`/api/agreements/${id}`)
        const retryData = await retryResponse.json()
        
        if (!retryData.agreement?.selectedInstallmentPlan) {
          throw new Error('Plan failed to save to database')
        }
      }
      
      console.log('Plan verified in database')
    } catch (error) {
      console.error("Error saving plan:", error)
      throw error
    }
  }

  const generateAndSavePlan = async (agreementData: any, selectedPlanIndex: number) => {
    try {
      // Import the generate function
      const { generateInstallmentPlans } = await import("@/app/actions/generate-installment-plan")
      
      const result = await generateInstallmentPlans(
        agreementData.amount,
        "INR",
        agreementData.dueDate,
        agreementData.borrowerName
      )

      if (result.plans && result.plans[selectedPlanIndex]) {
        const selectedPlan = result.plans[selectedPlanIndex]
        
        // Save plan to agreement
        const saveResponse = await fetch(`/api/agreements/${id}/save-plan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planIndex: selectedPlanIndex,
            planName: selectedPlan.planName,
            installments: selectedPlan.installments.map(inst => ({
              date: inst.date,
              amount: inst.amount,
              note: inst.note,
              proofUploaded: false,
            })),
          }),
        })

        if (saveResponse.ok) {
          setInstallments(selectedPlan.installments.map(inst => ({
            ...inst,
            proofUploaded: false,
          })))
        }
      }
    } catch (error) {
      console.error("Error generating plan:", error)
    }
  }

  const handleFileSelect = async (index: number, file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      setUploadingIndex(index)

      console.log('Uploading file for installment', index + 1, ':', file.name)

      // Create form data
      const formData = new FormData()
      formData.append("file", file)
      formData.append("installmentIndex", index.toString())

      // Upload to API
      const response = await fetch(`/api/agreements/${id}/upload-installment-proof`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Upload successful:', data)
        // Update local state
        setInstallments(prev => prev.map((inst, i) => 
          i === index 
            ? { 
                ...inst, 
                proofUploaded: true, 
                proofUrl: data.proofUrl,
                proofFileName: file.name,
              }
            : inst
        ))

        toast({
          title: "Success",
          description: `Payment proof ${index + 1} uploaded successfully`,
        })
      } else {
        console.error('Upload failed:', data)
        toast({
          title: "Upload Failed",
          description: data.error || "Failed to upload proof",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error uploading proof:", error)
      toast({
        title: "Error",
        description: "Failed to upload proof",
        variant: "destructive",
      })
    } finally {
      setUploadingIndex(null)
    }
  }

  const handleRemoveProof = async (index: number) => {
    try {
      const response = await fetch(`/api/agreements/${id}/remove-installment-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installmentIndex: index }),
      })

      if (response.ok) {
        setInstallments(prev => prev.map((inst, i) => 
          i === index 
            ? { 
                ...inst, 
                proofUploaded: false, 
                proofUrl: undefined,
                proofFileName: undefined,
              }
            : inst
        ))

        toast({
          title: "Success",
          description: "Payment proof removed",
        })
      }
    } catch (error) {
      console.error("Error removing proof:", error)
    }
  }

  if (loading || !agreement) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="inline-block h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading payment plan...</p>
          </div>
        </div>
      </div>
    )
  }

  const allProofsUploaded = installments.every(inst => inst.proofUploaded)
  const uploadedCount = installments.filter(inst => inst.proofUploaded).length

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/dashboard/agreement/${id}`}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Upload Payment Proofs</h1>
          <p className="text-sm text-muted-foreground">
            Upload screenshots for each installment payment
          </p>
        </div>
      </div>

      {/* Progress Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Upload Progress</span>
            <span className="text-primary">{uploadedCount} / {installments.length}</span>
          </CardTitle>
          <CardDescription>
            {allProofsUploaded 
              ? "All payment proofs uploaded! You can now submit for review."
              : `Upload ${installments.length - uploadedCount} more proof${installments.length - uploadedCount !== 1 ? 's' : ''} to complete.`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(uploadedCount / installments.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Installments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {installments.map((installment, index) => (
          <Card 
            key={index}
            className={`relative transition-all ${
              installment.proofUploaded 
                ? "border-green-500/50 bg-green-500/5" 
                : "border-border"
            }`}
          >
            {installment.proofUploaded && (
              <div className="absolute top-2 right-2 z-10">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                  <Check className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
            
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                  {index + 1}
                </span>
                Installment {index + 1}
              </CardTitle>
              <CardDescription className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3 w-3" />
                  {new Date(installment.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <DollarSign className="h-3 w-3" />
                  ₹{installment.amount.toLocaleString()}
                </div>
                {installment.note && (
                  <p className="text-xs text-muted-foreground mt-1">{installment.note}</p>
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {installment.proofUploaded ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm flex-1 truncate">{installment.proofFileName}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open(installment.proofUrl, '_blank')}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveProof(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <input
                    ref={el => { fileInputRefs.current[index] = el }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileSelect(index, file)
                    }}
                  />
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => fileInputRefs.current[index]?.click()}
                    disabled={uploadingIndex === index}
                  >
                    {uploadingIndex === index ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Screenshot
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Button */}
      {allProofsUploaded && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">All Proofs Uploaded!</h3>
                <p className="text-sm text-muted-foreground">
                  You can now return to the agreement page. The lender will review your payment proofs.
                </p>
              </div>
              <Button onClick={() => router.push(`/dashboard/agreement/${id}`)}>
                Back to Agreement
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
