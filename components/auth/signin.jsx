import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";

const SignIn = ({ auth, setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log(user);
      setUser(user);
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
      <h2>Sign In</h2>
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
      <button onClick={signIn} disabled={!email || !password}>
        Sign In
      </button>
    </div>
  );
};

export default SignIn;
