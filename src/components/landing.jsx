import SignUp from "./auth/signup";
import SignIn from "./auth/signin";

const Landing = () => {
  return (
    <div style={{ display: "flex", gap: "2rem" }}>
      <SignUp />
      <SignIn />
    </div>
  );
};

export default Landing;
