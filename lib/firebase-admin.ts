import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

export const sendNotification = async (fcmToken: string, title: string, body: string) => {
    try {
        await admin.messaging().send({
            token: fcmToken,
            notification: {
                title,
                body,
            },
        });
        console.log(`Notification sent to ${fcmToken}`);
        return true;
    } catch (error) {
        console.error('Error sending notification:', error);
        return false;
    }
};
