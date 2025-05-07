import { initializeApp } from 'firebase/app'

// Your web app's Firebase configuration
// First, try to get config from window.FIREBASE_CONFIG which will be injected at runtime
// If not available, fall back to environment variables
const firebaseConfig = window.FIREBASE_CONFIG || {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)