import { useContext } from "react";
import "./App.css";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Navigation from "./components/navigation";
import Landing from "./components/landing";
import Products from "./components/products/products";
import Modal from "./components/modal";
import useSystemStore from "./state/system";
import useUserStore from "./state/user";
import { FirebaseContext } from "./context/context";

function App() {
  const { auth } = useContext(FirebaseContext);

  const setModalComponent = useSystemStore((state) => state.setModalComponent);
  const setModalOpen = useSystemStore((state) => state.setModalOpen);

  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const clearProducts = useUserStore((state) => state.clearProducts);

  onAuthStateChanged(auth, (user) => {
    setUser(user);
  });

  return (
    <>
      <Navigation />
      {!user && <Landing />}
      {!!user && <Products />}

      <Modal />
    </>
  );
}

export default App;
