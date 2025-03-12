import SignUp from "./auth/signup";
import SignIn from "./auth/signin";

const Landing = ({ auth, setUser }) => {
  return (
    <div style={{ display: "flex", gap: "2rem" }}>
      <SignUp auth={auth} setUser={setUser} />
      <SignIn auth={auth} setUser={setUser} />
    </div>
  );
};

export default Landing;
