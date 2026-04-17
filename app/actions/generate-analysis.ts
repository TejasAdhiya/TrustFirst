"use server"

import { analyzeTrustScoreWithHistory } from "@/lib/near-ai"
import connectDB from "@/lib/mongodb"
import Agreement from "@/models/Agreement"
import User from "@/models/User"

export async function generateAIContractAnalysis(agreementId: string) {
  try {
    await connectDB()
    
    const agreement = await Agreement.findById(agreementId)
    if (!agreement) {
      return { error: "Agreement not found" }
    }
    
    const borrower = await User.findOne({ uid: agreement.borrowerId })
    const lender = await User.findOne({ uid: agreement.lenderId })
    
    if (!borrower) {
      return { error: "Borrower not found" }
    }
    
    console.log('[NEAR AI] Generating analysis for agreement:', agreementId)
    
    const aiAnalysis = await analyzeTrustScoreWithHistory(
      agreement.amount,
      agreement.borrowerName,
      borrower.uid,
      borrower.email,
      agreement.purpose || "Not specified",
      agreement.dueDate.toISOString().split('T')[0],
      agreement.lenderName,
      agreement.lenderId,
      agreement.lenderEmail
    )
    
    if (!aiAnalysis) {
      return { error: "Failed to generate analysis" }
    }
    
    // Update agreement with new analysis
    await Agreement.findByIdAndUpdate(agreementId, {
      aiAnalysis: {
        trustScore: aiAnalysis.trustScore,
        riskLevel: aiAnalysis.riskLevel,
        suggestedStrategy: aiAnalysis.suggestedStrategy,
        analyzedAt: aiAnalysis.analyzedAt,
      },
      borrowerCreditReport: aiAnalysis.borrowerCreditReport ? {
        totalAgreements: aiAnalysis.borrowerCreditReport.totalAgreements,
        onTimeRate: aiAnalysis.borrowerCreditReport.onTimeRate,
        lateCount: aiAnalysis.borrowerCreditReport.lateCount,
        totalAmount: aiAnalysis.borrowerCreditReport.totalAmount,
        avgAmount: aiAnalysis.borrowerCreditReport.avgAmount,
      } : {
        totalAgreements: 0,
        onTimeRate: 100,
        lateCount: 0,
        totalAmount: 0,
        avgAmount: 0,
      },
      lenderCreditReport: aiAnalysis.lenderCreditReport ? {
        totalAgreements: aiAnalysis.lenderCreditReport.totalAgreements,
        avgAmount: aiAnalysis.lenderCreditReport.avgAmount,
        totalAmount: aiAnalysis.lenderCreditReport.totalAmount,
      } : {
        totalAgreements: 0,
        avgAmount: 0,
        totalAmount: 0,
      },
    })
    
    console.log('[NEAR AI] Analysis saved for agreement:', agreementId)
    
    return { success: true, aiAnalysis }
  } catch (error: any) {
    console.error('[NEAR AI] Generate analysis error:', error.message)
    return { error: error.message }
  }
}