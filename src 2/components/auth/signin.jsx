import { useContext, useRef, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FirebaseContext } from "../../context/context";
import useUserStore from "../../state/user";
import styles from "../../styles/auth.module.css";
import { ArrowBack } from "@mui/icons-material";

const SignIn = (props) => {
  const { goBack } = props;
  const { auth, db } = useContext(FirebaseContext);

  const setUser = useUserStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const ignoreClickRef = useRef(false);

  const signIn = async () => {
    try {
      if (ignoreClickRef.current) {
        return;
      }
      ignoreClickRef.current = true;

      const signinResponse = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const authUser = signinResponse.user;

      if (!authUser) {
        return;
      }

      const userDoc = await getDoc(doc(db, "users", authUser.uid));

      if (!userDoc.exists()) {
        return;
      }

      setUser({
        ...authUser,
        ...userDoc.data(),
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
      <h2>Sign In</h2>
      <div className={styles.formContainer}>
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
        <button onClick={signIn} disabled={!email || !password}>
          Sign In
        </button>
      </div>
    </>
  );
};

export default SignIn;
