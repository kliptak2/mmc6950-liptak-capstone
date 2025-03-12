import { useContext } from "react";
import useUserStore from "../state/user";
import { FirebaseContext } from "../context/context";
import { set } from "lodash";

const Navigation = () => {
  const { auth } = useContext(FirebaseContext);

  const clearProducts = useUserStore((state) => state.clearProducts);
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);

  return (
    <nav>
      <h1>ProductKeeper</h1>

      {user && (
        <button
          onClick={() => {
            auth.signOut();
            clearProducts();
            setUser(null);
          }}
        >
          Sign Out
        </button>
      )}
    </nav>
  );
};

export default Navigation;
