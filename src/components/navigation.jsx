import { useContext } from "react";
import useUserStore from "../state/user";
import { FirebaseContext } from "../context/context";
import styles from "../styles/navigation.module.css";
import clsx from "clsx";
import LogoutIcon from "@mui/icons-material/Logout";

const Navigation = () => {
  const { auth } = useContext(FirebaseContext);

  const clearProducts = useUserStore((state) => state.clearProducts);
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);

  return (
    <nav className={clsx(styles.navigation, !!user && styles.loggedIn)}>
      <h1>ProductKeeper</h1>

      {user && (
        <button
          className={styles.menuButton}
          onClick={() => {
            auth.signOut();
            clearProducts();
            setUser(null);
          }}
        >
          <LogoutIcon fontSize="large" />
        </button>
      )}
    </nav>
  );
};

export default Navigation;
