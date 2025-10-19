// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCcMDNUOJHJ2JXn83kO8ScXc63FErAG-f4",
  authDomain: "sklep-ab300.firebaseapp.com",
  projectId: "sklep-ab300",
  storageBucket: "sklep-ab300.firebasestorage.app",
  messagingSenderId: "744477072783",
  appId: "1:744477072783:web:b1c9d1fce218be9eae3ffa",
  measurementId: "G-SXYRXF8296"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
