// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// 🔑 Dane z Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCcMDNUOJHJ2JXn83kO8ScXc63FErAG-f4",
  authDomain: "sklep-ab300.firebaseapp.com",
  projectId: "sklep-ab300",
  storageBucket: "sklep-ab300.firebasestorage.app",
  messagingSenderId: "744477072783",
  appId: "1:744477072783:web:b1c9d1fce218be9eae3ffa",
  measurementId: "G-SXYRXF8296",
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);

// Eksport usług, których faktycznie używamy
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// tymczasowo wystaw na window (debug)
;(window as any).__pcbase_auth = auth;

//@ts-ignore
window.auth = auth;
