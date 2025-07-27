// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDblj4kIKd2OmZg29H5pgidaBQW8MLc4WQ",
  authDomain: "blr-traffic-pilot.firebaseapp.com",
  projectId: "blr-traffic-pilot",
  storageBucket: "blr-traffic-pilot.firebasestorage.app",
  messagingSenderId: "183390900351",
  appId: "1:183390900351:web:508b4639b9d246242cef4a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app; 