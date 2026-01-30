
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env');
    process.exit(1);
}

async function updateTrustScores() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to MongoDB.');

        // Use the mongoose.connection.db object to access the collection directly
        // This avoids needing the User model file if we just want to do a raw update
        // But since we want to be safe, let's try to find the collection "users"
        const collection = mongoose.connection.collection('users');

        console.log('Updating trust scores for all users to 70...');

        const result = await collection.updateMany(
            {}, // Filter: match all documents
            { $set: { trustScore: 70 } } // Update: set trustScore to 70
        );

        console.log(`Matched ${result.matchedCount} users.`);
        console.log(`Modified ${result.modifiedCount} users.`);
        console.log('Trust score update complete.');

    } catch (error) {
        console.error('Error updating trust scores:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit(0);
    }
}

updateTrustScores();
