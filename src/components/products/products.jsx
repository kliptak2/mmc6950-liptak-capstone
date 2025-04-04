import { useState, useEffect, useContext } from "react";
import {
  collection,
  onSnapshot,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import Select from "react-select";
import { FirebaseContext } from "../../context/context";
import useUserStore from "../../state/user";
import useSystemStore from "../../state/system";
import { isEqual } from "lodash";
import { DateTime } from "luxon";
import styles from "../../styles/products.module.css";
import AddIcon from "@mui/icons-material/Add";
import SortIcon from "@mui/icons-material/Sort";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import * as Popover from "@radix-ui/react-popover";
import clsx from "clsx";

const Products = () => {
  const { db, storage } = useContext(FirebaseContext);

  const setDrawerOpen = useSystemStore((state) => state.setDrawerOpen);
  const setDrawerContent = useSystemStore((state) => state.setDrawerContent);

  const products = useUserStore((state) => state.products);
  const setProducts = useUserStore((state) => state.setProducts);
  const user = useUserStore((state) => state.user);

  const [allTags, setAllTags] = useState([]);
  const [localProducts, setLocalProducts] = useState([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("createdAtDesc");

  const sortOptions = [
    { value: "createdAtDesc", label: "Newest First" },
    { value: "createdAtAsc", label: "Oldest First" },
    { value: "nameAsc", label: "Name A-Z" },
    { value: "nameDesc", label: "Name Z-A" },
  ];

  useEffect(() => {
    const unsubscribeProducts = onSnapshot(
      query(
        collection(db, `users/${user.uid}/products`),
        orderBy("createdAt", "desc")
      ),
      (snapshot) => {
        console.log("snapshot");
        // If the products are the same, don't update the state
        // This is to prevent infinite render loops
        if (
          products.length === snapshot.docs.length &&
          products.every((product) => {
            const existingDoc = snapshot.docs.find(
              (doc) => doc.id === product.id
            );

            if (!existingDoc) {
              return false;
            }

            return isEqual(product, {
              id: existingDoc.id,
              ...existingDoc.data(),
            });
          })
        ) {
          setLocalProducts(products);
          setAllTags(
            products.reduce((acc, product) => {
              product.tags?.forEach((tag) => {
                if (!acc.includes(tag)) {
                  acc.push(tag);
                }
              });
              return acc;
            }, [])
          );
          return;
        }

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        switch (sortOption) {
          case "createdAtDesc":
            setLocalProducts(
              data.sort(
                (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
              )
            );
            break;
          case "createdAtAsc":
            setLocalProducts(
              data.sort(
                (a, b) => a.createdAt.toMillis() - b.createdAt.toMillis()
              )
            );
            break;
          case "nameAsc":
            setLocalProducts(data.sort((a, b) => a.name.localeCompare(b.name)));
            break;
          case "nameDesc":
            setLocalProducts(data.sort((a, b) => b.name.localeCompare(a.name)));
            break;
          default:
            setLocalProducts(data);
        }

        setProducts(data);

        const allTags = data.reduce((acc, product) => {
          product.tags?.forEach((tag) => {
            if (!acc.includes(tag)) {
              acc.push(tag);
            }
          });
          return acc;
        }, []);

        console.log(allTags);

        setAllTags(allTags);
      }
    );

    return () => {
      unsubscribeProducts();
    };
  }, []);

  const searchProducts = (searchTerm) => {
    setSearchTerm(searchTerm);
    const filteredLocalProducts = [...products].filter((product) => {
      return product.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    switch (sortOption) {
      case "createdAtDesc":
        setLocalProducts(
          filteredLocalProducts.sort(
            (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
          )
        );
        break;
      case "createdAtAsc":
        setLocalProducts(
          filteredLocalProducts.sort(
            (a, b) => a.createdAt.toMillis() - b.createdAt.toMillis()
          )
        );
        break;
      case "nameAsc":
        setLocalProducts(
          filteredLocalProducts.sort((a, b) => a.name.localeCompare(b.name))
        );
        break;
      case "nameDesc":
        setLocalProducts(
          filteredLocalProducts.sort((a, b) => b.name.localeCompare(a.name))
        );
        break;
      default:
        setLocalProducts([...filteredLocalProducts]);
    }
  };

  const handleSortChange = (selectedOption) => {
    console.log(selectedOption);
    setSortOption(selectedOption.value);

    switch (selectedOption.value) {
      case "createdAtDesc":
        setLocalProducts(
          [...products].sort(
            (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
          )
        );
        break;
      case "createdAtAsc":
        setLocalProducts(
          [...products].sort(
            (a, b) => a.createdAt.toMillis() - b.createdAt.toMillis()
          )
        );
        break;
      case "nameAsc":
        setLocalProducts(
          [...products].sort((a, b) => a.name.localeCompare(b.name))
        );
        break;
      case "nameDesc":
        setLocalProducts(
          [...products].sort((a, b) => b.name.localeCompare(a.name))
        );
        break;
      default:
        setLocalProducts([...products]);
    }
  };

  const getRemainingWarrantyLength = (productId) => {
    const product = products.find((product) => product.id === productId);

    console.log(product);

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

  return (
    <div>
      <button
        onClick={() => {
          console.log("Add product");
          setDrawerOpen(true);
          setDrawerContent({
            component: "ADD_PRODUCT",
            params: { availableTags: allTags },
          });
        }}
        className={styles.addProductButton}
      >
        <AddIcon />
      </button>
      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <SearchIcon />
          {!searchTerm && (
            <label htmlFor="search" id={styles.searchLabel}>
              Search
            </label>
          )}
          <input
            type="text"
            onChange={(e) => {
              searchProducts(e.target.value);
            }}
            value={searchTerm}
            id={styles.searchInput}
          />
          <button
            disabled={!searchTerm}
            onClick={() => {
              setSearchTerm("");
              searchProducts("");
            }}
            className={styles.clearSearchButton}
            style={{ visibility: searchTerm ? "visible" : "hidden" }}
          >
            <CloseOutlinedIcon />
          </button>
        </div>
        <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
          <Popover.Trigger asChild>
            <button className={styles.sortButton}>
              <SortIcon fontSize="large" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className={styles.popoverContent}
              align="start"
              side="left"
            >
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    handleSortChange(option);
                    setPopoverOpen(false);
                  }}
                  className={clsx(
                    option.value === sortOption && styles.activeSortOption
                  )}
                >
                  <CheckIcon />
                  {option.label}
                </button>
              ))}
              <Popover.Arrow
                className={styles.popoverArrow}
                data-activeIndex={sortOptions.findIndex(
                  (el) => el.value === sortOption
                )}
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
      <div className={styles.productList}>
        {localProducts.map((product) => {
          const { percentComplete, expirationDate } =
            getRemainingWarrantyLength(product.id);

          return (
            <div
              key={product.id}
              className={styles.productCard}
              onClick={() => {
                setDrawerOpen(true);
                setDrawerContent({
                  component: "PRODUCT_DETAILS",
                  params: { productId: product.id, availableTags: allTags },
                });
              }}
            >
              {product.previewImg ? (
                <img />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <CameraAltOutlinedIcon fontSize="large" />
                </div>
              )}
              <div className={styles.productInfo}>
                <h3 style={{ width: "fit-content" }}>{product.name}</h3>
                <div>
                  <p>
                    Warranty {percentComplete === 1 ? "expired" : "expires"}{" "}
                    {expirationDate}
                  </p>
                  <progress value={percentComplete} />
                </div>
                <div className={styles.tags}>
                  {product.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Products;
