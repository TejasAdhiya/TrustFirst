'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, Bot, User, ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { auth } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface Message {
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

interface AgreementContext {
  amount: number;
  dueDate: string;
  status: string;
  bufferDays: number;
  borrowerName: string;
  lenderName: string;
  hasInstallmentPlan: boolean;
  borrowerId?: string;
  lenderId?: string;
}

export default function NegotiatePage() {
  const params = useParams();
  const router = useRouter();
  const [user] = useAuthState(auth);
  const agreementId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [agreementContext, setAgreementContext] = useState<AgreementContext | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [actionResult, setActionResult] = useState<any>(null);
  const [userRole, setUserRole] = useState<'borrower' | 'lender' | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      loadConversation();
    }
  }, [user, agreementId]);

  const loadConversation = async () => {
    try {
      const response = await fetch(`/api/agreements/${agreementId}/negotiate?userId=${user?.uid}`, {
        method: 'GET',
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages || []);
        setAgreementContext(data.agreementContext);
        
        // Determine user role
        if (user?.uid === data.agreementContext.borrowerId) {
          setUserRole('borrower');
        } else if (user?.uid === data.agreementContext.lenderId) {
          setUserRole('lender');
        }
        
        // Add welcome message if no messages yet
        if (!data.messages || data.messages.length === 0) {
          const role = user?.uid === data.agreementContext.borrowerId ? 'borrower' : 'lender';
          const welcomeMsg = role === 'borrower' 
            ? 'Welcome! I can help you negotiate payment terms, extend deadlines, and answer questions about your agreement.'
            : 'Welcome! I can provide insights about the borrower, suggest collection strategies, and help you make informed decisions.';
          
          setMessages([{
            role: 'system',
            content: welcomeMsg,
            timestamp: new Date(),
          }]);
        }
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);
    setActionResult(null);

    // Add user message optimistically
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await fetch(`/api/agreements/${agreementId}/negotiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          userId: user?.uid,
        }),
      });

      const data = await response.json();

      if (data.success || data.fallback) {
        // Add AI response
        const aiMessage: Message = {
          role: 'ai',
          content: data.aiMessage,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);

        // Show action result if any
        if (data.actionResult) {
          setActionResult(data.actionResult);
          
          // Reload agreement context if deadline was extended
          if (data.actionResult.success && data.agreement) {
            setAgreementContext(prev => prev ? {
              ...prev,
              dueDate: data.agreement.dueDate,
            } : null);
            
            // If extension was successful, show success message
            if (data.actionResult.shouldClose) {
              setTimeout(() => {
                const confirmMsg: Message = {
                  role: 'system',
                  content: `✅ All done! Your deadline has been extended. You can now close this chat and return to the agreement page to see the updated due date.`,
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, confirmMsg]);
              }, 500);
            }
          }
        }
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        role: 'system',
        content: `Error: ${error.message}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/agreement/${agreementId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Agreement
        </Button>
      </div>

      {agreementContext && (
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  AI Negotiation Assistant
                  {userRole && (
                    <Badge variant={userRole === 'borrower' ? 'default' : 'secondary'}>
                      {userRole === 'borrower' ? '👤 Borrower' : '💼 Lender'}
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span className="text-xs">NEAR AI • TEE</span>
                    </div>
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {userRole === 'borrower' 
                    ? 'Negotiate terms, extend deadlines, and get payment advice'
                    : 'Get borrower insights, risk assessment, and collection strategies'}
                  <span className="block text-xs mt-1 text-purple-600">
                    🔒 Privacy-preserving AI powered by NEAR AI Cloud with TEE security
                  </span>
                </CardDescription>
              </div>
              <Badge variant={agreementContext.status === 'active' ? 'default' : 'secondary'}>
                {agreementContext.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-semibold">{agreementContext.amount.toLocaleString()} KRW</p>
              </div>
              <div>
                <p className="text-muted-foreground">Due Date</p>
                <p className="font-semibold">
                  {new Date(agreementContext.dueDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Buffer Days</p>
                <p className="font-semibold">{agreementContext.bufferDays} days</p>
              </div>
              <div>
                <p className="text-muted-foreground">Installment Plan</p>
                <p className="font-semibold">
                  {agreementContext.hasInstallmentPlan ? '✅ Active' : '❌ None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {actionResult && (
        <Alert className={actionResult.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
          {actionResult.success ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={actionResult.success ? 'text-green-800' : 'text-red-800'}>
            {actionResult.message}
          </AlertDescription>
        </Alert>
      )}

      <Card className="mt-4">
        <CardContent className="p-0">
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role !== 'user' && (
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === 'ai' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    {msg.role === 'ai' ? (
                      <Bot className="h-4 w-4 text-purple-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                )}
                
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : msg.role === 'ai'
                      ? 'bg-purple-50 text-gray-900 border border-purple-200'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {msg.content.replace(/^\[(BORROWER|LENDER)\]\s*/, '')}
                  </p>
                  <p className={`text-xs mt-1 ${
                    msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-purple-600" />
                </div>
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    <div className="text-xs text-purple-600">
                      <div className="font-semibold">Processing with NEAR AI...</div>
                      <div className="text-purple-500">🔒 TEE-Secured • Privacy-Preserving</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about extending deadline, installment plans, or payment options..."
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !inputMessage.trim()}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                {userRole === 'borrower' 
                  ? '💡 Try: "Can I extend the deadline by 5 days?" or "What installment plans are available?"'
                  : '💡 Try: "Is this borrower reliable?" or "What\'s the best way to approach them for payment?"'}
              </p>
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-semibold text-blue-600">NEAR AI</span>
                </div>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-purple-600">🔒 TEE Secured</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
