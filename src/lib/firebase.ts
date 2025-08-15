import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Connect to emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_FIREBASE_EMULATORS === 'true') {
  // Only connect to emulators if using demo project
  if (firebaseConfig.projectId === 'demo-project') {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('Connected to Firestore emulator');
    } catch (error) {
      console.log('Firestore emulator connection failed or already connected:', error);
    }
    
    try {
      connectAuthEmulator(auth, 'http://localhost:9099');
      console.log('Connected to Auth emulator');
    } catch (error) {
      console.log('Auth emulator connection failed or already connected:', error);
    }
    
    try {
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log('Connected to Storage emulator');
    } catch (error) {
      console.log('Storage emulator connection failed or already connected:', error);
    }
  }
}

export default app;