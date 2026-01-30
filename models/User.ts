import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  photoURL?: string;
  provider: 'email' | 'google';
  trustScore: number;
  totalLent: number;
  totalBorrowed: number;
  agreementCount: number;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  fcmToken?: string;
}

const UserSchema: Schema = new Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    photoURL: {
      type: String,
    },
    provider: {
      type: String,
      enum: ['email', 'google'],
      required: true,
    },
    trustScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
    totalLent: {
      type: Number,
      default: 0,
    },
    totalBorrowed: {
      type: Number,
      default: 0,
    },
    agreementCount: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    fcmToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
