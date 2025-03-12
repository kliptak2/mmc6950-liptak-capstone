import { useState } from "react";
import "./App.css";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import Landing from "./components/landing";

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

  return (
    <div>
      {!user && <Landing auth={auth} setUser={setUser} />}
      {!!user && (
        <div>
          <h2>Welcome, {user.email}</h2>
          <button
            onClick={() => {
              signOut(auth);
              setUser(null);
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
