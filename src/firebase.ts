import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyANT28Cldwuc9pjuEO4bKyc6OiWXzM8hR0",
  authDomain: "shenli-tracker.firebaseapp.com",
  projectId: "shenli-tracker",
  storageBucket: "shenli-tracker.firebasestorage.app",
  messagingSenderId: "175954651296",
  appId: "1:175954651296:web:8dffe6838caf5f0bae41c5",
  measurementId: "G-LL67FQSG1L"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
