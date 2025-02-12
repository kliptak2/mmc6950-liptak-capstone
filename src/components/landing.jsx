import SignUp from "./auth/signup";
import SignIn from "./auth/signin";

const Landing = ({ auth, db, setUser }) => {
  return (
    <div style={{ display: "flex", gap: "2rem" }}>
      <SignUp auth={auth} db={db} setUser={setUser} />
      <SignIn auth={auth} db={db} setUser={setUser} />
    </div>
  );
};

export default Landing;
