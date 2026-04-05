// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK with explicit options
const app = initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

// Auth and Storage are the same for both environments
export const auth = getAuth(app);
export const storage = getStorage(app);

// Firestore: Always use databaseId if provided in AI Studio Build
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Connection test as per guidelines
async function testConnection() {
  try {
    // Try to fetch a dummy document from the server to test connection
    await getDocFromServer(doc(db, '_connection_test_', 'test'));
    console.log("Firestore connection test successful.");
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.error("Firestore connection failed: The client is offline. Please check your Firebase configuration and database ID.");
    } else {
      // Other errors (like permission denied) are expected if the document doesn't exist
      console.log("Firestore connection test completed (ignoring non-connectivity errors).");
    }
  }
}

testConnection();