"use client";

import { useEffect, useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging, auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const useFcmToken = () => {
    const { toast } = useToast();
    const [token, setToken] = useState<string | null>(null);
    const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<NotificationPermission | null>(null);

    useEffect(() => {
        const retrieveToken = async () => {
            try {
                if (typeof window !== "undefined" && "serviceWorker" in navigator) {
                    // Register service worker if not already registered (though usually Next.js handles static assets, we just ensure scope)
                    // Actually, for FCM we just need the file to exist at public/firebase-messaging-sw.js

                    const permission = await Notification.requestPermission();
                    setNotificationPermissionStatus(permission);

                    if (permission === "granted" && messaging) {
                        const currentToken = await getToken(messaging, {
                            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                        });

                        if (currentToken) {
                            setToken(currentToken);
                            // Save token to backend for the current user
                            onAuthStateChanged(auth, async (user) => {
                                if (user) {
                                    try {
                                        await fetch('/api/user/save-token', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ uid: user.uid, fcmToken: currentToken })
                                        });
                                    } catch (error) {
                                        console.error("Error saving FCM token:", error);
                                    }
                                }
                            });
                        } else {
                            console.log("No registration token available. Request permission to generate one.");
                        }
                    }
                }
            } catch (error) {
                console.error("An error occurred while retrieving token:", error);
            }
        };

        retrieveToken();
    }, []);

    // Listen for foreground messages
    useEffect(() => {
        if (messaging) {
            const unsubscribe = onMessage(messaging, (payload) => {
                console.log("Foreground message received:", payload);
                toast({
                    title: payload.notification?.title || "New Notification",
                    description: payload.notification?.body || "You have a new alert.",
                });
            });
            return () => unsubscribe();
        }
    }, [toast]);

    return { token, notificationPermissionStatus };
};

export default useFcmToken;
