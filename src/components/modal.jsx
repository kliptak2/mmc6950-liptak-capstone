import { AnimatePresence, motion } from "motion/react";
import styles from "../styles/modal.module.css";
import useSystemStore from "../state/system";

import AddProductForm from "./products/add-product";
import EditProductForm from "./products/edit-product";

const Modal = () => {
  const modalOpen = useSystemStore((state) => state.modalOpen);
  const modalContent = useSystemStore((state) => state.modalContent);

  const setModalOpen = useSystemStore((state) => state.setModalOpen);
  const setModalContent = useSystemStore((state) => state.setModalContent);

  const COMPONENT_MAP = {
    ADD_PRODUCT: AddProductForm,
    EDIT_PRODUCT: EditProductForm,
  };

  const RenderComponent = COMPONENT_MAP[modalContent.component];

  return (
    <AnimatePresence>
      {modalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modal}
          >
            {!!RenderComponent && <RenderComponent {...modalContent.params} />}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setModalOpen(false);
              setModalContent({ component: "", params: null });
            }}
            className={styles.backdrop}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
