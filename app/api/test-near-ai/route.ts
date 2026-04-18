import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType = 'simple' } = body;

    const apiKey = process.env.NEAR_AI_API_KEY;
    const baseURL = process.env.NEAR_AI_BASE_URL || 'https://cloud-api.near.ai/v1';

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'NEAR_AI_API_KEY not configured',
        configured: false,
      }, { status: 500 });
    }

    const nearAI = new OpenAI({
      apiKey,
      baseURL,
    });

    const startTime = Date.now();

    let prompt = '';
    if (testType === 'simple') {
      prompt = 'Respond with exactly: {"status": "working", "message": "NEAR AI is operational"}';
    } else if (testType === 'trust_score') {
      prompt = `Analyze this lending scenario and respond with JSON:
      
Borrower: John Doe
Amount: 500000 KRW
Purpose: Emergency medical expense
Payment History: 3 past agreements, 66% on-time rate, 1 late payment
Due Date: 30 days from now

Respond with:
{
  "trustScore": "high" | "medium" | "low",
  "riskLevel": number (0-100),
  "reasoning": "brief explanation",
  "recommendation": "what to do"
}`;
    }

    const response = await nearAI.chat.completions.create({
      model: 'anthropic/claude-sonnet-4-5',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const content = response.choices[0]?.message?.content?.trim();

    let parsed = null;
    try {
      parsed = JSON.parse(content || '{}');
    } catch (e) {
      // Not JSON, that's ok
    }

    return NextResponse.json({
      success: true,
      configured: true,
      working: true,
      responseTime: `${responseTime}ms`,
      model: 'anthropic/claude-sonnet-4-5',
      rawResponse: content,
      parsedResponse: parsed,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[NEAR AI Test] Error:', error);
    return NextResponse.json({
      success: false,
      configured: !!process.env.NEAR_AI_API_KEY,
      working: false,
      error: error.message,
      errorType: error.constructor.name,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'NEAR AI Test Endpoint',
    usage: 'POST with { "testType": "simple" | "trust_score" }',
    configured: !!process.env.NEAR_AI_API_KEY,
    baseURL: process.env.NEAR_AI_BASE_URL || 'https://cloud-api.near.ai/v1',
  });
}
