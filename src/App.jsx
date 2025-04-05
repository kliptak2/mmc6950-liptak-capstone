import { useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Navigation from "./components/navigation";
import Landing from "./components/landing";
import Products from "./components/products/products";
import Drawer from "./components/drawer";
import useUserStore from "./state/user";
import { FirebaseContext } from "./context/context";

function App() {
  const { auth } = useContext(FirebaseContext);

  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  onAuthStateChanged(auth, (user) => {
    setUser(user);
  });

  return (
    <>
      {!user && <Landing />}
      {!!user && (
        <>
          <Navigation />
          <Products />
        </>
      )}

      <Drawer />
    </>
  );
}

export default App;
