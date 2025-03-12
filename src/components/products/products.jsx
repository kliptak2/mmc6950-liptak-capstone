import { useState, useEffect, useContext } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
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

const Products = () => {
  const { db, storage } = useContext(FirebaseContext);

  const setModalOpen = useSystemStore((state) => state.setModalOpen);
  const setModalContent = useSystemStore((state) => state.setModalContent);

  const products = useUserStore((state) => state.products);
  const setProducts = useUserStore((state) => state.setProducts);
  const user = useUserStore((state) => state.user);

  const [allTags, setAllTags] = useState([]);
  const [localProducts, setLocalProducts] = useState([]);
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

  const deleteProduct = async (id) => {
    const files = products.find((product) => product.id === id).files;

    await Promise.all(
      files.map(async (file) => {
        const storageRef = ref(storage, `${user.uid}/${file}`);
        await deleteObject(storageRef);
      })
    );

    await deleteDoc(doc(db, `users/${user.uid}/products/${id}`));
  };

  const getRemainingWarrantyLength = (productId) => {
    const product = products.find((product) => product.id === productId);

    console.log(product);

    const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const purchaseDate = product.purchaseDate;
    const warrantyLength = product.warrantyLength;
    const warrantyLengthUnit = product.warrantyLengthUnit;

    console.log(purchaseDate, warrantyLength, warrantyLengthUnit);

    const dt = DateTime.fromISO(`${purchaseDate}T00:00:00`, {
      zone: clientTimezone,
    });
    const expirationDate = dt.plus({ [warrantyLengthUnit]: warrantyLength });

    const now = DateTime.now();

    const diff = expirationDate.diff(now, ["years", "months", "days"]);

    console.log(diff);

    if (diff.years <= 0 && diff.months <= 0 && diff.days <= 0) {
      return "Expired";
    }

    return `${diff.years} years, ${diff.months} months, ${Math.round(
      diff.days
    )} days`;
  };

  return (
    <div>
      <h2>Products</h2>
      <button
        onClick={() => {
          setModalOpen(true);
          setModalContent({
            component: "ADD_PRODUCT",
            params: { availableTags: allTags },
          });
        }}
      >
        Add New Product
      </button>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <label htmlFor="sort">Sort By:</label>
          <Select
            name="sort"
            options={sortOptions}
            onChange={handleSortChange}
            value={sortOptions.find((option) => option.value === sortOption)}
          />
        </div>
        <input
          type="text"
          placeholder="Search"
          onChange={(e) => {
            searchProducts(e.target.value);
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        {localProducts.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid black",
              padding: "0.5rem",
              minWidth: "150px",
            }}
          >
            <button
              onClick={() => {
                setModalOpen(true);
                setModalContent({
                  component: "EDIT_PRODUCT",
                  params: { product, availableTags: allTags },
                });
              }}
            >
              Edit
            </button>
            <h3 style={{ width: "fit-content" }}>{product.name}</h3>
            <p style={{ width: "fit-content" }}>{product.purchaseDate}</p>
            <p style={{ width: "fit-content" }}>
              {product.warrantyLength} {product.warrantyLengthUnit}
            </p>
            <p>Warranty remaining: {getRemainingWarrantyLength(product.id)}</p>
            <p style={{ width: "fit-content" }}>{product.notes}</p>
            {product.tags?.length ? (
              <>
                <p>Tags:</p>
                <ul>
                  {product.tags &&
                    product.tags.map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
              </>
            ) : null}

            <button onClick={() => deleteProduct(product.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
