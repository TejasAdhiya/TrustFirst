importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
    apiKey: "AIzaSyCtuWqRevBeq8t7GDtflpIXJ7uiq755U0A",
    authDomain: "setu-79fd9.firebaseapp.com",
    projectId: "setu-79fd9",
    storageBucket: "setu-79fd9.firebasestorage.app",
    messagingSenderId: "103604699354",
    appId: "1:103604699354:web:99f835acd19d3199f665e3",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
        '[firebase-messaging-sw.js] Received background message ',
        payload
    );
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.png', // TrustFirst logo
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
