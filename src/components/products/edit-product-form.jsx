import { doc, updateDoc } from "firebase/firestore";

const EditProductForm = ({ editProduct, product }) => {
  return (
    <div style={{ border: "1px solid black", padding: "0.25rem" }}>
      <h3>Edit Product</h3>
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          width: "300px",
          alignItems: "flex-start",
        }}
        onSubmit={editProduct}
      >
        <label htmlFor="name">
          Name<sup>*</sup>
        </label>
        <input type="text" name="name" required defaultValue={product.name} />
        <label htmlFor="category">Category</label>
        <input
          type="text"
          name="category"
          required
          defaultValue={product.category}
        />
        <label htmlFor="purchaseDate">Purchase Date</label>
        <input
          type="date"
          name="purchaseDate"
          required
          defaultValue={product.purchaseDate}
        />
        <label htmlFor="warrantyLength">Warranty Length</label>
        <input
          type="text"
          name="warrantyLength"
          required
          defaultValue={product.warrantyLength}
        />
        <label htmlFor="warrantyLengthUnit">Warranty Length Unit</label>
        <select
          name="warrantyLengthUnit"
          required
          defaultValue={product.warrantyLengthUnit}
        >
          <option value="days">Days</option>
          <option value="months">Months</option>
          <option value="years">Years</option>
        </select>
        <label htmlFor="notes">Notes</label>
        <textarea name="notes" defaultValue={product.notes} />
        <button type="submit">Edit Product</button>
      </form>
    </div>
  );
};

export default EditProductForm;
