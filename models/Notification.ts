import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  type: 'ai_call' | 'payment_due' | 'witness_approved' | 'money_received' | 'witness_request' | 'message' | 'agreement_created';
  title: string;
  description: string;
  read: boolean;
  agreementId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['ai_call', 'payment_due', 'witness_approved', 'money_received', 'witness_request', 'message', 'agreement_created'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    agreementId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
