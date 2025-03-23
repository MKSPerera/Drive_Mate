// Service workers can't use ES6 module imports
// Using importScripts instead

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

/**
 * Firebase configuration object
 * Contains API keys and project identifiers
 */
const firebaseConfig = {
    apiKey: "AIzaSyBGJozT6_IqdegTtkaRFBKfTCviPe3xvtU",
    authDomain: "drivemate-88803.firebaseapp.com",
    projectId: "drivemate-88803",
    storageBucket: "drivemate-88803.firebasestorage.app",
    messagingSenderId: "61535472161",
    appId: "1:61535472161:web:4796ae3245172fc9743160",
    measurementId: "G-HQ0YY3FD6R"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

/**
 * Background message handler
 * Displays notifications when the app is in the background
 */
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification && payload.notification.title || 'Notification';
    const notificationOptions = {
        body: payload.notification && payload.notification.body || '',
        icon: '/icon-192x192.png' // Make sure this icon exists in your public folder
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Note: Token refresh is now handled automatically by Firebase
// We don't need to use onTokenRefresh anymore