import { createContext } from "react";
import { app, auth, db, storage } from "../firebase/config";

const FirebaseContext = createContext({
  app: null,
  auth: null,
  db: null,
  storage: null,
});

const FirebaseProvider = ({ children }) => {
  return (
    <FirebaseContext.Provider
      value={{ app: app, auth: auth, db: db, storage: storage }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export { FirebaseContext, FirebaseProvider };
