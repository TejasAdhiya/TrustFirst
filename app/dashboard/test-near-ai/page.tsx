'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Zap } from 'lucide-react';

export default function TestNearAIPage() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runTest = async (testType: 'simple' | 'trust_score') => {
    setTesting(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-near-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">NEAR AI Testing Dashboard</h1>
        <p className="text-muted-foreground">
          Verify that NEAR AI integration is working correctly
        </p>
      </div>

      <div className="grid gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Tests</CardTitle>
            <CardDescription>Run these tests to verify NEAR AI connectivity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={() => runTest('simple')}
                disabled={testing}
                variant="outline"
              >
                {testing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Simple Test
                  </>
                )}
              </Button>

              <Button
                onClick={() => runTest('trust_score')}
                disabled={testing}
              >
                {testing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Trust Score Test
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Test Results</CardTitle>
                {result.success ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Success
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="mr-1 h-3 w-3" />
                    Failed
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Configured</p>
                  <p className="font-medium">
                    {result.configured ? '✅ Yes' : '❌ No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Working</p>
                  <p className="font-medium">
                    {result.working ? '✅ Yes' : '❌ No'}
                  </p>
                </div>
                {result.responseTime && (
                  <div>
                    <p className="text-sm text-muted-foreground">Response Time</p>
                    <p className="font-medium">{result.responseTime}</p>
                  </div>
                )}
                {result.model && (
                  <div>
                    <p className="text-sm text-muted-foreground">Model</p>
                    <p className="font-medium text-xs">{result.model}</p>
                  </div>
                )}
              </div>

              {result.usage && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Token Usage</p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Prompt:</span>{' '}
                      {result.usage.promptTokens}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completion:</span>{' '}
                      {result.usage.completionTokens}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span>{' '}
                      {result.usage.totalTokens}
                    </div>
                  </div>
                </div>
              )}

              {result.parsedResponse && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Parsed Response</p>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
                    {JSON.stringify(result.parsedResponse, null, 2)}
                  </pre>
                </div>
              )}

              {result.rawResponse && !result.parsedResponse && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Raw Response</p>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
                    {result.rawResponse}
                  </pre>
                </div>
              )}

              {result.error && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Error Details</p>
                  <pre className="bg-destructive/10 text-destructive p-4 rounded-lg text-xs overflow-auto">
                    {result.error}
                  </pre>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Timestamp: {result.timestamp}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>What This Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>Simple Test:</strong> Verifies basic connectivity to NEAR AI API
            </div>
            <div>
              <strong>Trust Score Test:</strong> Tests the actual trust scoring logic with a realistic scenario
            </div>
            <div className="pt-4 border-t">
              <p className="text-muted-foreground">
                If tests fail, check your .env file for NEAR_AI_API_KEY and NEAR_AI_BASE_URL
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
