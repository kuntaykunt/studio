
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDDXQSdS4qa9NFQe6nZAr6veRQuQZUgmjk",
  authDomain: "storytime-ff29c.firebaseapp.com",
  projectId: "storytime-ff29c",
  storageBucket: "storytime-ff29c.firebasestorage.app",
  messagingSenderId: "913312348369",
  appId: "1:913312348369:web:7af3b0ab9850dbb2d46df0",
  measurementId: "G-TLNG2CSGMK"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
// const storage = getStorage(app);

export { app, auth, db /*, storage */ };

