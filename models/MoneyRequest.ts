import mongoose, { Schema, Document } from 'mongoose';

export interface IMoneyRequest extends Document {
  groupId: string;
  requesterId: string; // User who needs money
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  amount: number; // Total amount needed
  amountReceived: number; // Amount received so far
  amountRemaining: number; // Amount still needed
  purpose?: string;
  dueDate: string;
  status: 'active' | 'fulfilled' | 'cancelled';
  contributions: {
    lenderId: string;
    lenderName: string;
    lenderEmail: string;
    amount: number;
    agreementId: string;
    contributedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const MoneyRequestSchema: Schema = new Schema(
  {
    groupId: {
      type: String,
      required: true,
      index: true,
    },
    requesterId: {
      type: String,
      required: true,
    },
    requesterName: {
      type: String,
      required: true,
    },
    requesterEmail: {
      type: String,
      required: true,
    },
    requesterPhone: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountReceived: {
      type: Number,
      default: 0,
      min: 0,
    },
    amountRemaining: {
      type: Number,
      required: true,
    },
    purpose: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'fulfilled', 'cancelled'],
      default: 'active',
    },
    contributions: [
      {
        lenderId: {
          type: String,
          required: true,
        },
        lenderName: {
          type: String,
          required: true,
        },
        lenderEmail: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        agreementId: {
          type: String,
          required: true,
        },
        contributedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.MoneyRequest || mongoose.model<IMoneyRequest>('MoneyRequest', MoneyRequestSchema);
