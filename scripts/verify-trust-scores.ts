
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env');
    process.exit(1);
}

async function verifyTrustScores() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to MongoDB.');

        const users = await User.find({}, 'email trustScore');

        console.log('--- User Trust Scores ---');
        let allCorrect = true;
        users.forEach(user => {
            console.log(`User: ${user.email}, Score: ${user.trustScore}`);
            if (user.trustScore !== 70) {
                allCorrect = false;
                console.error(`❌ Mismatch found for ${user.email}: Expected 70, got ${user.trustScore}`);
            }
        });

        if (allCorrect && users.length > 0) {
            console.log('✅ All users have Trust Score 70.');
        } else if (users.length === 0) {
            console.log('⚠️ No users found in database.');
        } else {
            console.error('❌ Verification FAILED.');
            process.exit(1);
        }

    } catch (error) {
        console.error('Error verification:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit(0);
    }
}

verifyTrustScores();
