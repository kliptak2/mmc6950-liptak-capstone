import { useState } from "react";
import SignUp from "./auth/signup";
import SignIn from "./auth/signin";
import LogoColor from "../assets/logo-color.svg";
import styles from "../styles/landing.module.css";

const Landing = () => {
  const [landingContent, setLandingContent] = useState("");
  return (
    <div className={styles.container}>
      {!landingContent && (
        <>
          <div className={styles.logoContainer}>
            <img src={LogoColor} alt="ProductKeeper Logo" />
            <p className={styles.tagline}>
              Minimal effort. Maximum Organization.
            </p>
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
      {/* <SignUp />
      <SignIn /> */}
    </div>
  );
};

export default Landing;
