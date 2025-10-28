// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <--- ADD THIS

// YOUR WEB APP'S FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyDad-9eZgahHfKxzzINUHDAryYju8IAWrU",
  authDomain: "hunarscan.firebaseapp.com",
  projectId: "hunarscan",
  storageBucket: "YOUR_hunarscan.firebasestorage.appSTORAGE_BUCKET",
  messagingSenderId: "598699076099",
  appId: "1:598699076099:web:c59183ab00cafc2401fc36"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app); // <--- ADD THIS

export { app, auth, db};



