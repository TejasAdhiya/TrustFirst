import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Manually initialize admin since we can't easily import from lib in a standalone script without ts-node setup for aliases
if (!admin.apps.length) {
    // Check if private key is available
    if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
        console.error("Missing FIREBASE_PRIVATE_KEY or FIREBASE_CLIENT_EMAIL in .env");
        console.log("Please ensure you have generated a Service Account in Firebase Console -> Project Settings -> Service accounts and added the keys to .env");
        process.exit(1);
    }

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const sendTestNotification = async (fcmToken: string) => {
    console.log(`Sending test notification to: ${fcmToken.substring(0, 10)}...`);
    try {
        await admin.messaging().send({
            token: fcmToken,
            notification: {
                title: "Test Notification from Setu",
                body: "If you see this, real-time alerts are working! 🚀",
            },
        });
        console.log('✅ Notification sent successfully!');
    } catch (error) {
        console.error('❌ Error sending notification:', error);
    }
};

// Helper to get token if not provided
async function getFcmTokenFromDb(): Promise<string | null> {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) return null;

    // Minimal mongoose setup
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(MONGODB_URI);
    }

    // Direct db access to avoid model issues in script
    const user = await mongoose.connection.collection('users').findOne({ fcmToken: { $exists: true, $ne: null } });
    return user?.fcmToken || null;
}

const run = async () => {
    let token = process.argv[2];

    if (!token) {
        console.log("Auto-detecting device token from database...");
        const dbToken = await getFcmTokenFromDb();
        if (dbToken) {
            token = dbToken;
            console.log(`Found token in DB: ${token.substring(0, 15)}...`);
        } else {
            console.error("Could not find any FCM token in database. Please log in first.");
            process.exit(1);
        }
    }

    await sendTestNotification(token);
    process.exit(0);
};

run();
