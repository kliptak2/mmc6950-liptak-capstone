import { useState } from "react";
import CreateableSelect from "react-select/creatable";

const AddProductForm = ({ addProduct, availableTags }) => {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [tags, setTags] = useState([]);
  const [warrantyLength, setWarrantyLength] = useState("");
  const [warrantyLengthUnit, setWarrantyLengthUnit] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    addProduct({
      name,
      notes,
      purchaseDate,
      tags,
      warrantyLength,
      warrantyLengthUnit,
    });

    setName("");
    setNotes("");
    setPurchaseDate("");
    setTags([]);
    setWarrantyLength("");
    setWarrantyLengthUnit("");
  };

  return (
    <div style={{ border: "1px solid black", padding: "0.25rem" }}>
      <h3>Add Product</h3>
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          width: "300px",
          alignItems: "flex-start",
        }}
        onSubmit={handleSubmit}
      >
        <label htmlFor="name">
          Name<sup>*</sup>
        </label>
        <input
          type="text"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label htmlFor="purchaseDate">Purchase Date</label>
        <input
          type="date"
          name="purchaseDate"
          required
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
        />
        <label htmlFor="warrantyLength">Warranty Length</label>
        <input
          type="text"
          name="warrantyLength"
          required
          value={warrantyLength}
          onChange={(e) => setWarrantyLength(e.target.value)}
        />
        <label htmlFor="warrantyLengthUnit">Warranty Length Unit</label>
        <select
          name="warrantyLengthUnit"
          required
          value={warrantyLengthUnit}
          onChange={(e) => setWarrantyLengthUnit(e.target.value)}
        >
          <option value="days">Days</option>
          <option value="months">Months</option>
          <option value="years">Years</option>
        </select>
        <label htmlFor="notes">Notes</label>
        <textarea
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <CreateableSelect
          isMulti
          options={availableTags.map((tag) => ({
            value: tag,
            label: tag,
          }))}
          onChange={(tags) => {
            setTags(tags.map((tag) => tag.value));
          }}
        />
        <button type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default AddProductForm;
