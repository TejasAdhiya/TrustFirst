import OpenAI from 'openai';
import connectDB from './mongodb';
import Agreement from '../models/Agreement';
import User from '../models/User';

const nearAI = new OpenAI({
  apiKey: process.env.NEAR_AI_API_KEY,
  baseURL: process.env.NEAR_AI_BASE_URL || 'https://cloud-api.near.ai/v1',
});

export interface TrustScoreAnalysis {
  trustScore: 'high' | 'medium' | 'low';
  riskLevel: number;
  suggestedStrategy: string;
  analyzedAt: Date;
  borrowerCreditReport?: CreditReport;
  lenderCreditReport?: {
    totalAgreements: number;
    avgAmount: number;
    totalAmount: number;
  };
  // NEW: Explainable AI
  confidence?: number;
  reasoning?: string[];
  processingTimeMs?: number;
  modelUsed?: string;
  dataPoints?: {
    paymentHistory: number;
    amountRisk: number;
    witnessInvolvement: number;
    trustScoreWeight: number;
  };
}

export interface MediationStrategy {
  tone: 'friendly' | 'neutral' | 'strict';
  messageIntent: 'reminder' | 'warning' | 'escalation';
  openingLine: string;
  strategyGeneratedAt: Date;
}

export interface CreditHistory {
  totalAgreements: number;
  onTimeRate: number;
  lateCount: number;
  earlyCount: number;
  totalAmount: number;
  avgAmount: number;
}

export interface CreditReport {
  totalAgreements: number;
  onTimeRate: number;
  lateCount: number;
  totalAmount: number;
  avgAmount: number;
}

export async function getUserCreditHistory(userId: string, userEmail: string): Promise<CreditHistory | null> {
  try {
    await connectDB();
    
    const agreements = await Agreement.find({
      $or: [
        { borrowerId: userId },
        { borrowerEmail: userEmail }
      ]
    });
    
    if (!agreements || agreements.length === 0) {
      return null;
    }
    
    let onTimeCount = 0;
    let lateCount = 0;
    let earlyCount = 0;
    let totalAmount = 0;
    let witnessCount = 0;
    
    for (const agreement of agreements) {
      totalAmount += agreement.amount || 0;
      
      if (agreement.status === 'settled') {
        const dueDate = new Date(agreement.dueDate);
        
        if (agreement.borrowerProof?.uploadedAt) {
          const proofDate = new Date(agreement.borrowerProof.uploadedAt);
          if (proofDate <= dueDate) {
            onTimeCount++;
          } else {
            lateCount++;
          }
        } else if (agreement.status === 'settled') {
          const now = new Date();
          if (now < dueDate) {
            earlyCount++;
          } else {
            lateCount++;
          }
        }
      }
      
      if (agreement.witnessName) {
        witnessCount++;
      }
    }
    
    const total = agreements.length;
    const completed = onTimeCount + lateCount + earlyCount;
    
    return {
      totalAgreements: total,
      onTimeRate: completed > 0 ? Math.round((onTimeCount / completed) * 100) : 0,
      lateCount,
      earlyCount,
      totalAmount,
      avgAmount: total > 0 ? Math.round(totalAmount / total) : 0,
      witnessInvolvementCount: witnessCount,
    };
  } catch (error: any) {
    console.error('[NEAR AI] Error fetching credit history:', error.message);
    return null;
  }
}

export async function getUserTrustScore(userId: string, userEmail: string): Promise<number> {
  try {
    await connectDB();
    const user = await User.findOne({ $or: [{ uid: userId }, { email: userEmail }] });
    
    if (!user || user.trustScore === undefined) {
      return 75;
    }
    
    return user.trustScore || 75;
  } catch (error: any) {
    console.error('[NEAR AI] Error fetching trust score:', error.message);
    return 75;
  }
}

export async function analyzeTrustScoreWithHistory(
  amount: number,
  borrowerName: string,
  borrowerId: string,
  borrowerEmail: string,
  purpose: string,
  dueDate: string,
  lenderName: string,
  lenderId: string,
  lenderEmail: string
): Promise<TrustScoreAnalysis | null> {
  if (!process.env.NEAR_AI_API_KEY) {
    console.log('[NEAR AI] No API key, using fallback');
    return getFallbackTrustScore(amount, purpose, null);
  }

  try {
    const borrowerHistory = await getUserCreditHistory(borrowerId, borrowerEmail);
    const lenderHistory = await getUserCreditHistory(lenderId, lenderEmail);
    const borrowerTrustScore = await getUserTrustScore(borrowerId, borrowerEmail);
    const lenderTrustScore = await getUserTrustScore(lenderId, lenderEmail);

    const borrowerHistoryText = borrowerHistory ? `
Borrower Credit History:
- Total Past Agreements: ${borrowerHistory.totalAgreements}
- On-time Payment Rate: ${borrowerHistory.onTimeRate}%
- Late Payments: ${borrowerHistory.lateCount}
- Early Payments: ${borrowerHistory.earlyCount}
- Total Borrowed: ${borrowerHistory.totalAmount} KRW
- Average Amount: ${borrowerHistory.avgAmount} KRW
- Witness Involvement: ${borrowerHistory.witnessInvolvementCount} times
- Current Trust Score: ${borrowerTrustScore}` : `
Borrower Credit History: New user, no past agreements`;

    const lenderHistoryText = lenderHistory ? `
Lender Credit History:
- Total Past Agreements: ${lenderHistory.totalAgreements}
- Average Lending Amount: ${lenderHistory.avgAmount} KRW
- Total Lent: ${lenderHistory.totalAmount} KRW
- Witness Involvement: ${lenderHistory.witnessInvolvementCount} times
- Current Trust Score: ${lenderTrustScore}` : `
Lender Credit History: New user, no past agreements`;

    const prompt = `You are a senior financial risk analyst for TrustFirst, a peer-to-peer lending platform.

Analyze this lending agreement with FULL context from both parties' history.

Current Agreement:
- Amount: ${amount} KRW
- Borrower: ${borrowerName}
- Purpose: ${purpose || 'Not specified'}
- Due Date: ${dueDate}
- Lender: ${lenderName}

${borrowerHistoryText}

${lenderHistoryText}

Based on this comprehensive data:
1. If borrower has low on-time rate (<50%), HIGH RISK
2. If borrower is new (0 agreements), MEDIUM RISK
3. If amount is significantly higher than borrower's avg, ELEVATED RISK
4. If borrower has witness involvement history, LOWER RISK
5. If lender has good track record, MORE LIKELY to honor agreement

Respond with ONLY a JSON object with EXPLAINABLE reasoning:
{
  "trustScore": "high" | "medium" | "low",
  "riskLevel": number (0-100),
  "suggestedStrategy": "string describing recommended approach",
  "confidence": number (0-1, how confident you are),
  "reasoning": ["reason 1", "reason 2", "reason 3"],
  "dataPoints": {
    "paymentHistory": number (0-100, weight of payment history),
    "amountRisk": number (0-100, risk from amount),
    "witnessInvolvement": number (0-100, trust from witnesses),
    "trustScoreWeight": number (0-100, weight of existing trust score)
  }
}

Example: {
  "trustScore": "medium", 
  "riskLevel": 45, 
  "suggestedStrategy": "Recommend installment plan with semi-monthly payments",
  "confidence": 0.85,
  "reasoning": [
    "Borrower has 66% on-time rate (moderate reliability)",
    "Amount is 1.5x their average (elevated risk)",
    "Has witness involvement in 2 past agreements (trust factor)"
  ],
  "dataPoints": {
    "paymentHistory": 66,
    "amountRisk": 35,
    "witnessInvolvement": 20,
    "trustScoreWeight": 75
  }
}`;

    const startTime = Date.now();
    
    const response = await nearAI.chat.completions.create({
      model: 'Qwen/Qwen3-30B-A3B-Instruct-2507',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    });

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      console.error('[NEAR AI] Empty response, using fallback');
      return getFallbackTrustScore(amount, purpose, borrowerHistory);
    }

    const parsed = JSON.parse(content);
    
    console.log('[NEAR AI] Analysis complete:', {
      trustScore: parsed.trustScore,
      riskLevel: parsed.riskLevel,
      confidence: parsed.confidence,
      processingTime: `${processingTime}ms`,
    });
    
    return {
      trustScore: parsed.trustScore || 'medium',
      riskLevel: parsed.riskLevel || 50,
      suggestedStrategy: parsed.suggestedStrategy || 'Standard repayment terms',
      analyzedAt: new Date(),
      confidence: parsed.confidence || 0.5,
      reasoning: parsed.reasoning || [],
      processingTimeMs: processingTime,
      modelUsed: 'Qwen/Qwen3-30B-A3B-Instruct-2507',
      dataPoints: parsed.dataPoints,
      borrowerCreditReport: borrowerHistory ? {
        totalAgreements: borrowerHistory.totalAgreements,
        onTimeRate: borrowerHistory.onTimeRate,
        lateCount: borrowerHistory.lateCount,
        totalAmount: borrowerHistory.totalAmount,
        avgAmount: borrowerHistory.avgAmount,
      } : undefined,
      lenderCreditReport: lenderHistory ? {
        totalAgreements: lenderHistory.totalAgreements,
        avgAmount: lenderHistory.avgAmount,
        totalAmount: lenderHistory.totalAmount,
      } : undefined,
    };
  } catch (error: any) {
    console.error('[NEAR AI] Error:', error.message, '- using fallback');
    return getFallbackTrustScore(amount, purpose, null, borrowerHistory, lenderHistory);
  }
}

export async function analyzeTrustScore(
  amount: number,
  borrowerName: string,
  purpose: string,
  dueDate: string
): Promise<TrustScoreAnalysis | null> {
  return analyzeTrustScoreWithHistory(
    amount,
    borrowerName,
    'unknown',
    'unknown@email.com',
    purpose,
    dueDate,
    'unknown',
    'unknown',
    'unknown@email.com'
  );
}

function getFallbackTrustScore(amount: number, purpose: string, borrowerHistory: CreditHistory | null, lenderHistory: CreditHistory | null): TrustScoreAnalysis {
  const purposeLower = (purpose || '').toLowerCase();
  const isEmergency = purposeLower.includes('emergency') || purposeLower.includes('medical');
  const isLargeAmount = amount > 500000;
  
  let riskLevel = 30;
  let trustScore: 'high' | 'medium' | 'low' = 'high';
  
  if (borrowerHistory) {
    if (borrowerHistory.onTimeRate < 50) {
      riskLevel = 70;
      trustScore = 'low';
    } else if (borrowerHistory.onTimeRate < 80 || isLargeAmount) {
      riskLevel = 45;
      trustScore = 'medium';
    }
  } else if (isLargeAmount) {
    riskLevel = 50;
    trustScore = 'medium';
  }
  
  if (isEmergency && trustScore === 'high') {
    riskLevel = Math.min(riskLevel + 15, 85);
  }
  
  return {
    trustScore,
    riskLevel,
    suggestedStrategy: trustScore === 'low' 
      ? 'Require collateral or co-signer, consider partial payment first' 
      : isEmergency 
        ? 'Allow flexible payment terms, check in regularly'
        : 'Standard repayment terms',
    analyzedAt: new Date(),
    borrowerCreditReport: borrowerHistory ? {
      totalAgreements: borrowerHistory.totalAgreements,
      onTimeRate: borrowerHistory.onTimeRate,
      lateCount: borrowerHistory.lateCount,
      totalAmount: borrowerHistory.totalAmount,
      avgAmount: borrowerHistory.avgAmount,
    } : {
      totalAgreements: 0,
      onTimeRate: 100,
      lateCount: 0,
      totalAmount: 0,
      avgAmount: 0,
    },
    lenderCreditReport: lenderHistory ? {
      totalAgreements: lenderHistory.totalAgreements,
      avgAmount: lenderHistory.avgAmount,
      totalAmount: lenderHistory.totalAmount,
    } : {
      totalAgreements: 0,
      avgAmount: 0,
      totalAmount: 0,
    },
  };
}

export async function generateMediationStrategy(
  borrowerName: string,
  lenderName: string,
  amount: number,
  dueDate: string,
  daysOverdue: number,
  currentStatus: string
): Promise<MediationStrategy | null> {
  return generateMediationStrategyWithHistory(
    borrowerName,
    'unknown',
    'unknown@email.com',
    lenderName,
    'unknown',
    'unknown@email.com',
    amount,
    dueDate,
    daysOverdue,
    currentStatus
  );
}

export async function generateMediationStrategyWithHistory(
  borrowerName: string,
  borrowerId: string,
  borrowerEmail: string,
  lenderName: string,
  lenderId: string,
  lenderEmail: string,
  amount: number,
  dueDate: string,
  daysOverdue: number,
  currentStatus: string
): Promise<MediationStrategy | null> {
  if (!process.env.NEAR_AI_API_KEY) {
    console.log('[NEAR AI] No API key, using fallback');
    return getFallbackMediationStrategy(borrowerName, lenderName, daysOverdue, null);
  }

  try {
    const borrowerHistory = await getUserCreditHistory(borrowerId, borrowerEmail);
    const borrowerTrustScore = await getUserTrustScore(borrowerId, borrowerEmail);

    const historyContext = borrowerHistory ? `
Borrower Context:
- Total Past Agreements: ${borrowerHistory.totalAgreements}
- Payment Reliability: ${borrowerHistory.onTimeRate}%
- Days Overdue Now: ${daysOverdue}
- Trust Score: ${borrowerTrustScore}
- Previous Late Payments: ${borrowerHistory.lateCount}` : `
Borrower Context: New user`;

    const baseTone = daysOverdue <= 7 ? 'friendly' : daysOverdue <= 30 ? 'neutral' : 'strict';
    const intent = daysOverdue <= 7 ? 'reminder' : daysOverdue <= 30 ? 'warning' : 'escalation';

    const prompt = `You are TrustFirst AI Mediation Strategy Generator.

Generate the optimal approach for a collection call using real borrower history.

Current Situation:
- Amount Owed: ${amount} KRW
- Days Overdue: ${daysOverdue}
- Due Date: ${dueDate}
- Current Status: ${currentStatus}

${historyContext}

Determine tone based on:
- If borrower's on-time rate >80%, use FRIENDLY
- If borrower's on-time rate 50-80%, use NEUTRAL  
- If borrower's on-time rate <50% or days overdue >30, use STRICT

Also consider if this is first time or recurring delay.

Respond with ONLY JSON:
{
  "tone": "friendly" | "neutral" | "strict",
  "messageIntent": "reminder" | "warning" | "escalation",
  "openingLine": "natural opening for the AI to say"
}`;

    const response = await nearAI.chat.completions.create({
      model: 'Qwen/Qwen3-30B-A3B-Instruct-2507',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      console.error('[NEAR AI] Empty response, using fallback');
      return getFallbackMediationStrategy(borrowerName, lenderName, daysOverdue, borrowerHistory);
    }

    const parsed = JSON.parse(content);
    
    return {
      tone: parsed.tone || baseTone,
      messageIntent: parsed.messageIntent || intent,
      openingLine: parsed.openingLine || `Hello ${borrowerName}, this is regarding your lending agreement with ${lenderName}.`,
      strategyGeneratedAt: new Date(),
    };
  } catch (error: any) {
    console.error('[NEAR AI] Error:', error.message, '- using fallback');
    return getFallbackMediationStrategy(borrowerName, lenderName, daysOverdue, null);
  }
}

function getFallbackMediationStrategy(
  borrowerName: string,
  lenderName: string,
  daysOverdue: number,
  history: CreditHistory | null
): MediationStrategy {
  let tone: 'friendly' | 'neutral' | 'strict' = 'friendly';
  let messageIntent: 'reminder' | 'warning' | 'escalation' = 'reminder';
  
  if (history && history.onTimeRate < 50) {
    tone = 'strict';
    messageIntent = 'escalation';
  } else if (daysOverdue > 30) {
    tone = 'strict';
    messageIntent = 'escalation';
  } else if (daysOverdue > 7 || (history && history.onTimeRate < 80)) {
    tone = 'neutral';
    messageIntent = 'warning';
  }

  return {
    tone,
    messageIntent,
    openingLine: `Hello ${borrowerName}, this is regarding your lending agreement with ${lenderName}. I'm following up on your payment.`,
    strategyGeneratedAt: new Date(),
  };
}