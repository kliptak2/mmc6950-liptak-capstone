import { useContext, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { FirebaseContext } from "../../context/context";
import useUserStore from "../../state/user";
import styles from "../../styles/auth.module.css";
import { ArrowBack } from "@mui/icons-material";

const SignUp = (props) => {
  const { goBack } = props;
  const { auth, db } = useContext(FirebaseContext);

  const setUser = useUserStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const ignoreClickRef = useRef(false);

  const signUp = async () => {
    try {
      if (ignoreClickRef.current) {
        return;
      }
      ignoreClickRef.current = true;

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
        createdAt: serverTimestamp(),
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
    } finally {
      ignoreClickRef.current = false;
    }
  };

  return (
    <>
      <button
        onClick={() => {
          console.log("click: ", goBack);
          goBack();
        }}
        className={styles.backButton}
      >
        <ArrowBack /> Go Back
      </button>
      <h2>Sign Up</h2>
      <div className={styles.formContainer}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            name="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
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
    </>
  );
};

export default SignUp;
