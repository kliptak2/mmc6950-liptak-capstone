import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import EditProductForm from "./edit-product-form";

const Products = ({ db, uid }) => {
  const [products, setProducts] = useState([]);
  const [prodToEdit, setProdToEdit] = useState(null);

  useEffect(() => {
    const unsubscribeProducts = onSnapshot(
      collection(db, `users/${uid}/products`),
      (snapshot) => {
        setProducts(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }
    );

    return () => {
      unsubscribeProducts();
    };
  }, []);

  const addProduct = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const productData = Object.fromEntries(formData.entries());
    console.log(productData);

    // Add a new document with a generated id.
    await addDoc(collection(db, `users/${uid}/products`), productData);
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
          <button>Sort</button>
          <button>Filter</button>
        </div>
        <button>Group by Category</button>
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
            <p style={{ width: "fit-content" }}>{product.category}</p>
            <p style={{ width: "fit-content" }}>{product.purchaseDate}</p>
            <p style={{ width: "fit-content" }}>
              {product.warrantyLength} {product.warrantyLengthUnit}
            </p>
            <p style={{ width: "fit-content" }}>{product.notes}</p>

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
        <div style={{ border: "1px solid black", padding: "0.25rem" }}>
          <h3>Add Product</h3>
          <form
            style={{
              display: "flex",
              flexDirection: "column",
              width: "300px",
              alignItems: "flex-start",
            }}
            onSubmit={addProduct}
          >
            <label htmlFor="name">
              Name<sup>*</sup>
            </label>
            <input type="text" name="name" required />
            <label htmlFor="category">Category</label>
            <input type="text" name="category" required />
            <label htmlFor="purchaseDate">Purchase Date</label>
            <input type="date" name="purchaseDate" required />
            <label htmlFor="warrantyLength">Warranty Length</label>
            <input type="text" name="warrantyLength" required />
            <label htmlFor="warrantyLengthUnit">Warranty Length Unit</label>
            <select name="warrantyLengthUnit" required>
              <option value="days">Days</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
            <label htmlFor="notes">Notes</label>
            <textarea name="notes" />
            <button type="submit">Add Product</button>
          </form>
        </div>
        {prodToEdit && (
          <EditProductForm editProduct={editProduct} product={prodToEdit} />
        )}
      </div>
    </div>
  );
};

export default Products;
