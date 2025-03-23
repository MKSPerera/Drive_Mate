// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, Messaging, isSupported } from "firebase/messaging";

/**
 * Firebase configuration object
 * Contains API keys and project identifiers from environment variables
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp | undefined;
let messaging: Messaging | undefined;

/**
 * Registers the Firebase service worker for push notifications
 * @returns Service worker registration or null if registration fails
 */
const registerServiceWorker = async () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      // Register the service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service worker registered successfully:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  }
  return null;
};

/**
 * Initializes Firebase app and messaging
 * Sets up service worker for push notifications
 */
export const initializeFirebase = async () => {
  if (typeof window !== 'undefined') {
    try {
      // Only initialize if no Firebase apps exist
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
      
      // Register service worker before initializing messaging
      await registerServiceWorker();

      // Check if messaging is supported in this browser
      const isSupportedResult = await isSupported();
      if (isSupportedResult) {
        messaging = getMessaging(app);
        console.log("Firebase messaging initialized successfully");
      } else {
        console.log("Firebase messaging is not supported in this browser");
      }
    } catch (error) {
      console.error("Error initializing Firebase:", error);
    }
  }
};

// Call the initialization function
initializeFirebase();

/**
 * Requests permission and gets Firebase Cloud Messaging token
 * @returns FCM token or null if unavailable
 */
export async function getFCMToken() {
  if (!messaging) {
    console.log("Messaging not initialized, trying to initialize now...");
    await initializeFirebase();
    
    if (!messaging) {
      console.error("Failed to initialize messaging");
      return null;
    }
  }
  
  try {
    // Request permission
    const permission = await Notification.requestPermission();
    console.log("Notification permission status:", permission);
    
    if (permission === 'granted') {
      // Get token
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        console.error("VAPID key is missing in environment variables");
        return null;
      }
      
      // Get the service worker registration
      const swRegistration = await navigator.serviceWorker.ready;
      
      const token = await getToken(messaging, { 
        vapidKey: vapidKey,
        serviceWorkerRegistration: swRegistration
      });
      
      if (token) {
        console.log("FCM Token obtained successfully", token);
        return token;
      } else {
        console.log("No FCM token available");
        return null;
      }
    } else {
      console.log('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Updates FCM token in the backend
 * @param token - FCM token to update
 * @returns Boolean indicating success or failure
 */
export async function updateFcmTokenInBackend(token: string) {
  try {
    // Get auth token from localStorage
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      console.log('No auth token found, skipping FCM token update');
      return false;
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/update-fcm-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ fcmToken: token })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update FCM token');
    }
    
    const data = await response.json();
    console.log('FCM token updated in backend:', data);
    return true;
  } catch (error) {
    console.error('Error updating FCM token in backend:', error);
    return false;
  }
}

/**
 * Sets up token refresh listener
 * Updates backend when FCM token is refreshed
 */
export async function setupTokenRefresh() {
  if (!messaging) {
    await initializeFirebase();
    if (!messaging) return;
  }
  
  // In Firebase v9, token refresh is handled automatically
  // We can listen for token changes via the messaging object
  navigator.serviceWorker.addEventListener('message', async (event) => {
    if (event.data && event.data.firebaseMessaging && event.data.firebaseMessaging.token) {
      console.log('FCM token refreshed, updating in backend');
      await updateFcmTokenInBackend(event.data.firebaseMessaging.token);
    }
  });
}

export { app, messaging }; 