import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { produce } from "immer";
import { mountStoreDevtool } from "simple-zustand-devtools";

const initialUserState = {
  user: null,
  products: [],
  productSort: "createdAtDesc",
};

const useUserStore = create(
  persist(
    (set) => ({
      ...initialUserState,
      clearProducts: () => set({ products: [] }),
      setProducts: (products) =>
        set(
          produce((state) => {
            state.products = products;
          })
        ),
      setProductSort: (sort) => set({ productSort: sort }),
      setUser: (user) => set({ user }),
    }),
    {
      name: "product-keeper-user-storage", // unique name
      getStorage: () => createJSONStorage(),
    }
  )
);

if (import.meta.env.DEV) {
  mountStoreDevtool("UserStore", useUserStore);
}

export default useUserStore;
