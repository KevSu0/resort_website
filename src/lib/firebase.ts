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
// Only initialize analytics in production with valid measurement ID
export const analytics = typeof window !== 'undefined' && 
  import.meta.env.PROD && 
  import.meta.env.VITE_FIREBASE_MEASUREMENT_ID && 
  import.meta.env.VITE_FIREBASE_MEASUREMENT_ID !== 'G-XXXXXXXXXX' 
  ? getAnalytics(app) 
  : null;

// Connect to emulators in development (disabled - requires Java 11+)
// Using mock data fallback instead for development
if (false && import.meta.env.DEV && import.meta.env.VITE_ENABLE_FIREBASE_EMULATORS === 'true') {
  // Only connect to emulators if using demo project
  if (firebaseConfig.projectId === 'demo-project') {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
      // Connected to Firestore emulator
    } catch (error) {
      // Firestore emulator connection failed or already connected
    }
    
    try {
      connectAuthEmulator(auth, 'http://localhost:9099');
      // Connected to Auth emulator
    } catch (error) {
      // Auth emulator connection failed or already connected
    }
    
    try {
      connectStorageEmulator(storage, 'localhost', 9199);
      // Connected to Storage emulator
    } catch (error) {
      // Storage emulator connection failed or already connected
    }
  }
}

// Development mode flag for mock data
export const isDevelopmentMode = import.meta.env.DEV && firebaseConfig.projectId === 'demo-project';

export default app;