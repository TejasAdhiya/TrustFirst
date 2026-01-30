import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env');
    process.exit(1);
}

async function getFcmToken() {
    try {
        await mongoose.connect(MONGODB_URI as string);

        // Find a user with an fcmToken
        const user = await User.findOne({ fcmToken: { $exists: true, $ne: null } }).select('email fcmToken');

        if (user) {
            console.log(`Found token for user ${user.email}`);
            console.log(`TOKEN:${user.fcmToken}`);
        } else {
            console.log('No FCM tokens found in database.');
            console.log('Please log in to the dashboard in your browser to generate a token.');
        }

    } catch (error) {
        console.error('Error fetching token:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

getFcmToken();
