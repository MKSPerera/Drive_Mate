'use client';

import { useEffect } from 'react';
import { getFCMToken, setupTokenRefresh, updateFcmTokenInBackend, initializeFirebase } from '@/lib/firebase';

export default function FirebaseInit() {
  useEffect(() => {
    const initFCM = async () => {
      try {
        // Initialize Firebase first
        await initializeFirebase();
        
        // Get and update FCM token if the user is logged in
        const token = await getFCMToken();
        if (token) {
          console.log('FCM Token initialized:', token);
          // Update token in the backend
          await updateFcmTokenInBackend(token);
        }
        
        // Setup token refresh listener
        await setupTokenRefresh();
      } catch (error) {
        console.error('Error initializing Firebase:', error);
      }
    };
    
    // Check if user is logged in
    const authToken = localStorage.getItem('token');
    if (authToken) {
      initFCM();
    }
  }, []);
  
  // This component doesn't render anything
  return null;
} 