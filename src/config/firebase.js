// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the values below with your specific Firebase keys from Console
const firebaseConfig = {
  apiKey: "AIzaSyD1PM__UzMlbPRghVg__MDqyIEtbjrQedI",
  authDomain: "eh-magkano-f7207.firebaseapp.com",
  projectId: "eh-magkano-f7207",
  storageBucket: "eh-magkano-f7207.firebasestorage.app",
  messagingSenderId: "762623264292",
  appId: "1:762623264292:web:5740fbb7927fbadc93fab1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;