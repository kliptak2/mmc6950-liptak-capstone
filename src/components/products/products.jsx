import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import EditProductForm from "./edit-product-form";
import AddProductForm from "./add-product";
import Select from "react-select";

const Products = ({ db, uid }) => {
  const [allTags, setAllTags] = useState([]);
  const [productsMaster, setProductsMaster] = useState([]);
  const [products, setProducts] = useState([]);
  const [prodToEdit, setProdToEdit] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState("createdAtDesc");

  const sortOptions = [
    { value: "createdAtDesc", label: "Newest First" },
    { value: "createdAtAsc", label: "Oldest First" },
  ];

  useEffect(() => {
    const unsubscribeProducts = onSnapshot(
      query(
        collection(db, `users/${uid}/products`),
        orderBy("createdAt", "desc")
      ),
      (snapshot) => {
        snapshot.docs.forEach((doc) => {
          console.log(doc.data().createdAt.toDate());
        });
        setProducts(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setProductsMaster(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );

        const tags = snapshot.docs.flatMap((doc) => doc.data().tags || []);

        setAllTags([...new Set(tags)].sort());
      }
    );

    return () => {
      unsubscribeProducts();
    };
  }, []);

  const addProduct = async (productData) => {
    console.log(productData);

    // Add a new document with a generated id.
    await addDoc(collection(db, `users/${uid}/products`), {
      ...productData,
      createdAt: serverTimestamp(),
    });
  };

  const editProduct = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const productData = Object.fromEntries(formData.entries());
    console.log(productData);

    // Add a new document with a generated id.
    await updateDoc(
      doc(db, `users/${uid}/products/${prodToEdit.id}`),
      productData
    );

    setProdToEdit(null);
  };

  const searchProducts = (searchTerm) => {
    for (let i = 0; i < 5; i++) {
      console.log(productsMaster[i].name);
    }

    if (searchTerm) {
      const filteredProducts = productsMaster.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setProducts(filteredProducts);
    } else {
      setProducts(productsMaster);
    }
  };

  return (
    <div>
      <h2>Products</h2>
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
            onChange={(selectedOption) => {
              console.log(selectedOption);
              console.log(products);
              setSortOption(selectedOption.value);
              const sortedProducts = products.sort((a, b) => {
                console.log(a.createdAt.seconds, b.createdAt.seconds);
                if (selectedOption.value === "createdAtDesc") {
                  return b.createdAt.toMillis() - a.createdAt.toMillis();
                } else {
                  return a.createdAt.toMillis() - b.createdAt.toMillis();
                }
              });

              console.log(
                sortedProducts.map((product) => product.createdAt.toDate())
              );
              setProducts(sortedProducts);
            }}
            value={sortOptions.find((option) => option.value === sortOption)}
          />
          <button
            style={{ backgroundColor: showFilters ? "lightblue" : "#f9f9f9" }}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filter
          </button>
          {showFilters && (
            <Select
              isMulti
              options={allTags.map((tag) => ({ value: tag, label: tag }))}
              onChange={(selectedTags) => {
                const tags = selectedTags.map((tag) => tag.value);
                const filteredProducts = productsMaster.filter((product) =>
                  tags.every((tag) => product.tags?.includes(tag))
                );
                setProducts(filteredProducts);
              }}
            />
          )}
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
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid black",
              padding: "0.5rem",
              minWidth: "150px",
            }}
          >
            <button onClick={() => setProdToEdit(product)}>Edit</button>
            <h3 style={{ width: "fit-content" }}>{product.name}</h3>
            <p style={{ width: "fit-content" }}>{product.purchaseDate}</p>
            <p style={{ width: "fit-content" }}>
              {product.warrantyLength} {product.warrantyLengthUnit}
            </p>
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

            <button
              onClick={() =>
                deleteDoc(doc(db, `users/${uid}/products/${product.id}`))
              }
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <hr />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <AddProductForm addProduct={addProduct} availableTags={allTags} />
        {prodToEdit && (
          <EditProductForm editProduct={editProduct} product={prodToEdit} />
        )}
      </div>
    </div>
  );
};

export default Products;
