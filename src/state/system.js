import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { produce } from "immer";

const useSystemStore = create(
  persist(
    (set) => ({
      app: null,
      auth: null,
      db: null,
      modalContent: {
        component: "",
        params: null,
      },
      modalOpen: false,
      setAuth: (authInst) => set({ auth: authInst }),
      setApp: (appInst) => set({ app: appInst }),
      setDb: (dbInst) => set({ db: dbInst }),
      setModalContent: (cont) => set({ modalContent: cont }),
      setModalOpen: (open) => set({ modalOpen: open }),
      setStorage: (storageInst) => set({ storage: storageInst }),
      storage: null,
      toggleModal: () => set((state) => ({ modalOpen: !state.modalOpen })),
    }),
    {
      name: "product-keeper-system-storage", // unique name
      getStorage: () => createJSONStorage(),
    }
  )
);

export default useSystemStore;
