import { useState } from "react";
import SignUp from "./auth/signup";
import SignIn from "./auth/signin";
import styles from "../styles/landing.module.css";
import LogoColor from "../assets/logo-tagline-color.svg";

const Landing = () => {
  const [landingContent, setLandingContent] = useState("");
  return (
    <div className={styles.container}>
      {!landingContent && (
        <>
          <div className={styles.logoContainer}>
            <img width={375} src={LogoColor} alt="ProductKeeper Logo" />
          </div>
          <div className={styles.buttonContainer}>
            <button
              id={styles.signin}
              onClick={() => setLandingContent("signin")}
            >
              Sign In
            </button>
            <button
              id={styles.signup}
              onClick={() => setLandingContent("signup")}
            >
              Sign Up
            </button>
          </div>
        </>
      )}
      {landingContent === "signup" && (
        <SignUp goBack={() => setLandingContent("")} />
      )}
      {landingContent === "signin" && (
        <SignIn goBack={() => setLandingContent("")} />
      )}
    </div>
  );
};

export default Landing;
