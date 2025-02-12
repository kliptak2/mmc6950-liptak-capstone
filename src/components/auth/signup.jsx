import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

const SignUp = ({ auth, db, setUser }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const signUp = async () => {
    try {
      const createResponse = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const authUser = createResponse.user;

      if (!authUser) {
        return;
      }

      const userDocData = {
        categories: ["Electronics", "Home & Kitchen", "Kids & Toys", "Sports"],
        email: email,
        name: name,
      };

      await setDoc(doc(db, "users", authUser.uid), userDocData);

      setUser({
        ...authUser,
        ...userDocData,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "0.5rem",
        border: "1px solid black",
      }}
    >
      <h2>Sign Up</h2>
      <label htmlFor="name">Name</label>
      <input
        name="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label htmlFor="email">Email</label>
      <input
        name="email"
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label htmlFor="password">Password</label>
      <input
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <label htmlFor="confirmPassword">Confirm Password</label>
      <input
        name="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button
        onClick={signUp}
        disabled={
          !email ||
          !password ||
          !confirmPassword ||
          password !== confirmPassword
        }
      >
        Sign Up
      </button>
    </div>
  );
};

export default SignUp;
