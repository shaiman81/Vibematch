import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCUrsyBPqP7epeNGQP13vHPlDB64eviDC4",
  authDomain: "vibematch-9f061.firebaseapp.com",
  projectId: "vibematch-9f061",
  storageBucket: "vibematch-9f061.firebasestorage.app",
  messagingSenderId: "506411121976",
  appId: "1:506411121976:web:cab8acd97ea99cf7bc15cd",
  measurementId: "G-90H7QRTKPL"
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const db: Firestore = getFirestore(app);

// Safely initialize analytics only on the client side
export const analytics = typeof window !== 'undefined' 
  ? isSupported().then(yes => yes ? getAnalytics(app) : null) 
  : null;

export { app };
