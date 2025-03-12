import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID_KEY,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET_KEY,
  messagingSenderId: import.meta.env.ITE_FIREBASE_MESSAGINGSENDERID_KEY,
  appId: import.meta.env.VITE_FIREBASE_APPID_KEY,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENTID_KEY,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
const storage = getStorage(app);

export { app, db, auth, storage };
