import { useContext, useRef } from "react";
import useUserStore from "../state/user";
import { FirebaseContext } from "../context/context";
import styles from "../styles/navigation.module.css";
import clsx from "clsx";
import LogoutIcon from "@mui/icons-material/Logout";
import Wordmark from "../assets/wordmark_white.svg";

const Navigation = () => {
  const { auth } = useContext(FirebaseContext);

  const clearProducts = useUserStore((state) => state.clearProducts);
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);

  const ignoreClickRef = useRef(false);

  return (
    <nav className={clsx(styles.navigation, !!user && styles.loggedIn)}>
      <div className={styles.content}>
        <img src={Wordmark} alt="ProductKeeper Logo" className={styles.logo} />

        {user && (
          <button
            className={styles.menuButton}
            onClick={() => {
              if (ignoreClickRef.current) {
                return;
              }
              ignoreClickRef.current = true;

              auth.signOut();
              clearProducts();
              setUser(null);
            }}
            aria-label="Logout"
          >
            <LogoutIcon fontSize="large" />
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
