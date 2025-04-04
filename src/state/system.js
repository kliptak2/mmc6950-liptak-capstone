import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useSystemStore = create(
  persist(
    (set) => ({
      app: null,
      auth: null,
      db: null,
      drawerContent: {
        component: "",
        params: null,
      },
      drawerOpen: false,
      setAuth: (authInst) => set({ auth: authInst }),
      setApp: (appInst) => set({ app: appInst }),
      setDb: (dbInst) => set({ db: dbInst }),
      setDrawerContent: (cont) => set({ drawerContent: cont }),
      setDrawerOpen: (open) => set({ drawerOpen: open }),
      setStorage: (storageInst) => set({ storage: storageInst }),
      storage: null,
    }),
    {
      name: "product-keeper-system-storage", // unique name
      getStorage: () => createJSONStorage(),
    }
  )
);

export default useSystemStore;
