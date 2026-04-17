import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAgreement extends Document {
  lenderId: string;
  lenderName: string;
  lenderEmail: string;
  borrowerId?: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerPhone?: string;
  amount: number;
  purpose?: string;
  createdDate: Date;
  dueDate: Date;
  status: 'active' | 'pending_witness' | 'reviewing' | 'settled' | 'overdue';
  type: 'lent' | 'borrowed';
  trustScore: number;
  strictMode: boolean;
  bufferDays: number;
  witnessName?: string;
  witnessEmail?: string;
  witnessPhone?: string;
  witnessApproved: boolean;
  lenderProof?: {
    fileName: string;
    fileUrl: string;
    uploadedAt: Date;
  };
  borrowerProof?: {
    fileName: string;
    fileUrl: string;
    uploadedAt: Date;
  };
  timeline: Array<{
    event: string;
    date: Date | null;
    completed: boolean;
  }>;
  aiMessages: Array<{
    role: 'user' | 'ai' | 'system';
    content: string;
    timestamp: Date;
  }>;
  selectedInstallmentPlan?: {
    planIndex: number;
    planName: string;
    installments: Array<{
      date: string;
      amount: number;
      note?: string;
      proofUploaded: boolean;
      proofUrl?: string;
      proofFileName?: string;
      uploadedAt?: Date;
    }>;
  };
  groupContribution?: boolean;
  moneyRequestId?: string;
  aiAnalysis?: {
    trustScore: 'high' | 'medium' | 'low';
    riskLevel: number;
    suggestedStrategy: string;
    analyzedAt: Date;
  };
  borrowerCreditReport?: {
    totalAgreements: number;
    onTimeRate: number;
    lateCount: number;
    totalAmount: number;
    avgAmount: number;
  };
  lenderCreditReport?: {
    totalAgreements: number;
    avgAmount: number;
    totalAmount: number;
  };
  mediationStrategy?: {
    tone: 'friendly' | 'neutral' | 'strict';
    messageIntent: 'reminder' | 'warning' | 'escalation';
    openingLine: string;
    strategyGeneratedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AgreementSchema: Schema = new Schema(
  {
    lenderId: {
      type: String,
      required: true,
      index: true,
    },
    lenderName: {
      type: String,
      required: true,
    },
    lenderEmail: {
      type: String,
      required: true,
    },
    borrowerId: {
      type: String,
      index: true,
    },
    borrowerName: {
      type: String,
      required: true,
    },
    borrowerEmail: {
      type: String,
      required: true,
    },
    borrowerPhone: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    purpose: {
      type: String,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'pending_witness', 'reviewing', 'settled', 'overdue'],
      default: 'active',
    },
    type: {
      type: String,
      enum: ['lent', 'borrowed'],
      required: true,
    },
    trustScore: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
    strictMode: {
      type: Boolean,
      default: false,
    },
    bufferDays: {
      type: Number,
      default: 3,
      min: 0,
      max: 14,
    },
    witnessName: {
      type: String,
    },
    witnessEmail: {
      type: String,
    },
    witnessPhone: {
      type: String,
    },
    witnessApproved: {
      type: Boolean,
      default: false,
    },
    lenderProof: {
      fileName: String,
      fileUrl: String,
      uploadedAt: Date,
    },
    borrowerProof: {
      fileName: String,
      fileUrl: String,
      uploadedAt: Date,
    },
    timeline: [
      {
        event: String,
        date: Date,
        completed: Boolean,
      },
    ],
    aiMessages: [
      {
        role: {
          type: String,
          enum: ['user', 'ai', 'system'],
        },
        content: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    selectedInstallmentPlan: {
      type: {
        planIndex: {
          type: Number,
        },
        planName: {
          type: String,
        },
        installments: {
          type: [
            {
              date: {
                type: String,
              },
              amount: {
                type: Number,
              },
              note: {
                type: String,
              },
              proofUploaded: {
                type: Boolean,
                default: false,
              },
              proofUrl: {
                type: String,
              },
              proofFileName: {
                type: String,
              },
              uploadedAt: {
                type: Date,
              },
            },
          ],
        },
      },
      default: undefined,
    },
    groupContribution: {
      type: Boolean,
      default: false,
    },
    moneyRequestId: {
      type: String,
    },
    aiAnalysis: {
      trustScore: {
        type: String,
        enum: ['high', 'medium', 'low'],
      },
      riskLevel: {
        type: Number,
        min: 0,
        max: 100,
      },
      suggestedStrategy: String,
      analyzedAt: Date,
    },
    mediationStrategy: {
      tone: {
        type: String,
        enum: ['friendly', 'neutral', 'strict'],
      },
      messageIntent: {
        type: String,
        enum: ['reminder', 'warning', 'escalation'],
      },
      openingLine: String,
      strategyGeneratedAt: Date,
    },
    borrowerCreditReport: {
      totalAgreements: {
        type: Number,
        default: 0,
      },
      onTimeRate: {
        type: Number,
        default: 0,
      },
      lateCount: {
        type: Number,
        default: 0,
      },
      totalAmount: {
        type: Number,
        default: 0,
      },
      avgAmount: {
        type: Number,
        default: 0,
      },
    },
    lenderCreditReport: {
      totalAgreements: {
        type: Number,
        default: 0,
      },
      avgAmount: {
        type: Number,
        default: 0,
      },
      totalAmount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Agreement: Model<IAgreement> =
  mongoose.models.Agreement || mongoose.model<IAgreement>('Agreement', AgreementSchema);

export default Agreement;
