import { useContext, useEffect, useState } from "react";
import useSystemStore from "../../state/system";
import useUserStore from "../../state/user";
import styles from "../../styles/product-details.module.css";
import { deleteDoc, doc } from "firebase/firestore";
import { FirebaseContext } from "../../context/context";
import { DateTime } from "luxon";
import RemoveIcon from "@mui/icons-material/Remove";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getDownloadURL, ref, deleteObject } from "firebase/storage";

const ProductDetails = ({ availableTags, productId }) => {
  const { db, storage } = useContext(FirebaseContext);

  const products = useUserStore((state) => state.products);
  const product = products.find((p) => p.id === productId);
  console.log(product);

  const user = useUserStore((state) => state.user);

  const setDrawerOpen = useSystemStore((state) => state.setDrawerOpen);
  const setDrawerContent = useSystemStore((state) => state.setDrawerContent);

  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    const getFiles = async () => {
      if (!product.files?.length) {
        return;
      }

      const filePromises = product.files.map(async (file) => {
        const fileRef = ref(storage, `${user.uid}/${file}`);
        const url = await getDownloadURL(fileRef);
        return {
          name: file,
          url,
        };
      });

      const files = await Promise.all(filePromises);

      setFileList(files);
    };

    getFiles();
  }, [productId]);

  const getRemainingWarrantyLength = (productId) => {
    const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const purchaseDate = product.purchaseDate;
    const warrantyLength = product.warrantyLength;
    const warrantyLengthUnit = product.warrantyLengthUnit;

    if (!purchaseDate || !warrantyLength || !warrantyLengthUnit) {
      return null;
    }

    console.log(purchaseDate, warrantyLength, warrantyLengthUnit);

    const dtPurchase = DateTime.fromISO(`${purchaseDate}T00:00:00`, {
      zone: clientTimezone,
    });
    const expirationDate = dtPurchase.plus({
      [warrantyLengthUnit]: warrantyLength,
    });

    const now = DateTime.now();

    const daysSincePurchase = now.diff(dtPurchase, ["days"]).days;

    const warrantyLengthInDays = expirationDate.diff(dtPurchase, ["days"]).days;

    const warrantyPercentComplete = Math.max(
      daysSincePurchase / warrantyLengthInDays,
      0
    );

    console.log(`Warranty percent complete: ${warrantyPercentComplete}%`);

    console.log(
      `Days since purchase: ${daysSincePurchase}, Warranty length in days: ${warrantyLengthInDays}`
    );

    if (warrantyPercentComplete >= 1) {
      return {
        percentComplete: 1,
        expirationDate: expirationDate.toFormat("yyyy-MM-dd"),
      };
    }

    return {
      percentComplete: warrantyPercentComplete,
      expirationDate: expirationDate.toFormat("yyyy-MM-dd"),
    };
  };

  const deleteProduct = async () => {
    const files = products.find((product) => product.id === id).files;

    await Promise.all(
      files.map(async (file) => {
        const storageRef = ref(storage, `${user.uid}/${file}`);
        await deleteObject(storageRef);
      })
    );

    await deleteDoc(doc(db, `users/${user.uid}/products/${id}`));

    setDrawerOpen(false);
    setDrawerContent({ component: "", params: null });
  };

  const formatWarrantyLengthUnit = () => {
    console.log(product.warrantyLength, product.warrantyLength === 1);
    switch (product.warrantyLengthUnit) {
      case "days":
        return product.warrantyLength === "1" ? "day" : "days";
      case "months":
        return product.warrantyLength === "1" ? "month" : "months";
      case "years":
        return product.warrantyLength === "1" ? "year" : "years";
      default:
        return "";
    }
  };

  const { percentComplete, expirationDate } =
    getRemainingWarrantyLength(productId);

  return (
    <div className={styles.container}>
      <h2 id={styles.productName}>{product.name}</h2>
      <div id={styles.progressContainer}>
        <p>
          Warranty {percentComplete === 1 ? "expired" : "expires"}{" "}
          {expirationDate}
        </p>
        <progress value={percentComplete} id={styles.progress} />
      </div>
      <div className={styles.tags}>
        {product.tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className={styles.content}>
        <div className={styles.field}>
          <p className={styles.fieldLabel}>Purchase Date</p>
          <p className={styles.fieldValue}>{product.purchaseDate}</p>
        </div>
        <div className={styles.field}>
          <p className={styles.fieldLabel}>Warranty Length</p>
          <p className={styles.fieldValue}>
            {product.warrantyLength} {formatWarrantyLengthUnit()}
          </p>
        </div>
        <div className={styles.field}>
          <p className={styles.fieldLabel}>Notes</p>
          <p className={styles.fieldValue}>{product.notes || <RemoveIcon />}</p>
        </div>
        {product?.extraFields?.length > 0 &&
          product.extraFields.map((field) => (
            <div className={styles.field} key={field.id}>
              <p className={styles.fieldLabel}>{field.label}</p>
              <p className={styles.fieldValue}>{field.value}</p>
            </div>
          ))}
        <div className={styles.files}>
          <p className={styles.fieldLabel}>Files</p>
          <div className={styles.filesContainer}>
            {fileList.length > 0 ? (
              fileList.map((file) => (
                <div className={styles.file} key={file.name}>
                  <a
                    key={file.name}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.fileLink}
                  >
                    {file.name}
                  </a>
                  <button>
                    <DeleteIcon />
                  </button>
                </div>
              ))
            ) : (
              <RemoveIcon />
            )}
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          onClick={() =>
            setDrawerContent({
              component: "EDIT_PRODUCT",
              params: { availableTags, product },
            })
          }
          id={styles.editButton}
        >
          <EditIcon />
          Edit
        </button>
        <button onClick={deleteProduct} id={styles.deleteButton}>
          <DeleteIcon />
          Delete
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
