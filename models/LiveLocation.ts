import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILiveLocation extends Document {
    agreementId: mongoose.Types.ObjectId;
    userId?: string;
    role: "borrower" | "lender" | "witness" | "unknown";
    latitude: number;
    longitude: number;
    locationContext: any;
    isEmergency?: boolean; // Added field
    timestamp: Date;
}

const LiveLocationSchema: Schema = new Schema({
    agreementId: {
        type: String, // User prompt asked for String (ref to agreement)
        required: true,
    },
    userId: {
        type: String,
        required: false, // optional
    },
    role: {
        type: String,
        default: "unknown",
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    locationContext: {
        type: Schema.Types.Mixed,
        default: {}
    },
    isEmergency: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

// Prevent recompilation of model
const LiveLocation: Model<ILiveLocation> =
    mongoose.models.LiveLocation ||
    mongoose.model<ILiveLocation>("LiveLocation", LiveLocationSchema);

export default LiveLocation;
