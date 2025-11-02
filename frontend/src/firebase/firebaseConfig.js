// Import Firebase core and services
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Your Firebase configuration (safe to use in frontend)
const firebaseConfig = {
  apiKey: "AIzaSyDQLXD2nYut3-4GJzfc-wmAhI4UCxNtbno",
  authDomain: "kobowave.firebaseapp.com",
  projectId: "kobowave",
  storageBucket: "kobowave.appspot.com", // ✅ fixed: was firebasestorage.app
  messagingSenderId: "680746236307",
  appId: "1:680746236307:web:e1e8dd67619208febd5066",
  measurementId: "G-VVHD29WTYN",
};

// ✅ Initialize Firebase app
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// ✅ Default export for app
export default app;
