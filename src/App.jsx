import { useState } from "react";
import "./App.css";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import Landing from "./components/landing";
import Products from "./components/products/products";

function App() {
  const [user, setUser] = useState(null);

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN_KEY,
    projectId: import.meta.env.VITE_FIREBASE_PROJECTID_KEY,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET_KEY,
    messagingSenderId: import.meta.env.ITE_FIREBASE_MESSAGINGSENDERID_KEY,
    appId: import.meta.env.VITE_FIREBASE_APPID_KEY,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENTID_KEY,
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence);
  const storage = getStorage(app);

  onAuthStateChanged(auth, (user) => {
    setUser(user);
  });

  return (
    <div>
      {!user && <Landing auth={auth} db={db} setUser={setUser} />}
      {!!user && (
        <>
          <div>
            <h1>Welcome, {user.email}</h1>
            <Products db={db} storage={storage} uid={user?.uid} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
