import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import styles from "../styles/drawer.module.css";
import useSystemStore from "../state/system";

import AddProductForm from "./products/add-product";
import EditProductForm from "./products/edit-product";
import ProductDetails from "./products/product-details";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

const Drawer = () => {
  console.log("rendering drawer");
  const drawerOpen = useSystemStore((state) => state.drawerOpen);
  const drawerContent = useSystemStore((state) => state.drawerContent);

  const setDrawerOpen = useSystemStore((state) => state.setDrawerOpen);
  const setDrawerContent = useSystemStore((state) => state.setDrawerContent);

  useEffect(() => {
    console.log("drawerOpen", drawerOpen);
    console.log("drawerContent", drawerContent);
  }, [drawerOpen, drawerContent]);

  const COMPONENT_MAP = {
    ADD_PRODUCT: AddProductForm,
    EDIT_PRODUCT: EditProductForm,
    PRODUCT_DETAILS: ProductDetails,
  };
  const RenderComponent = COMPONENT_MAP[drawerContent?.component || ""];

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            initial={{ x: "80%" }}
            animate={{ x: 0 }}
            exit={{ x: "80%" }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            className={styles.drawer}
          >
            <div className={styles.drawerHeader}>
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setDrawerContent({ component: "", params: null });
                }}
                className={styles.closeButton}
              >
                <CloseOutlinedIcon fontSize="large" />
              </button>
            </div>
            {!!RenderComponent && (
              <RenderComponent {...drawerContent?.params} />
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setDrawerOpen(false);
              setDrawerContent({ component: "", params: null });
            }}
            className={styles.backdrop}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default Drawer;
