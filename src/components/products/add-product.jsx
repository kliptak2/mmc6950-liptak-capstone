import { useState, useContext } from "react";
import CreateableSelect from "react-select/creatable";
import DeleteIcon from "@mui/icons-material/Delete";
import { FirebaseContext } from "../../context/context";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import useSystemStore from "../../state/system";
import useUserStore from "../../state/user";

const AddProductForm = ({ availableTags }) => {
  const { db, storage } = useContext(FirebaseContext);

  const setModalOpen = useSystemStore((state) => state.setModalOpen);
  const setModalContent = useSystemStore((state) => state.setModalContent);

  const user = useUserStore((state) => state.user);

  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [tags, setTags] = useState([]);
  const [warrantyLength, setWarrantyLength] = useState("");
  const [warrantyLengthUnit, setWarrantyLengthUnit] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("submitting");

    const fileNames = await Promise.all(
      files.map(async (file) => {
        const storageRef = ref(storage, `${user.uid}/${file.name}`);
        await uploadBytes(storageRef, file);
        return file.name;
      })
    );

    const docRef = await addDoc(collection(db, `users/${user.uid}/products`), {
      createdAt: serverTimestamp(),
      files: fileNames,
      name,
      notes,
      purchaseDate,
      tags,
      warrantyLength,
      warrantyLengthUnit,
    });

    console.log("Document written with ID: ", docRef.id);

    setModalOpen(false);
    setModalContent({ component: "", params: null });
  };

  return (
    <div>
      <h3>Add Product</h3>
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          width: "600px",
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
        <label htmlFor="files">Add Images or Files</label>
        <input
          type="file"
          name="files"
          multiple
          onChange={(e) => {
            console.log(e.target.files);
            if (!e.target.files || !e.target.files.length) {
              return;
            }

            setFiles(...files, Array.from(e.target.files));
          }}
        />
        {files.map((file) => (
          <div
            key={file.name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              backgroundColor: "#f4efee",
              margin: "0.25rem 0",
            }}
          >
            <p style={{ textAlign: "left", width: "fit-content" }}>
              {file.name}
            </p>
            <button
              onClick={() => setFiles(files.filter((f) => f !== file))}
              style={{ backgroundColor: "transparent", border: "none" }}
            >
              <DeleteIcon />
            </button>
          </div>
        ))}
        <button
          style={{
            margin: "1rem auto",
          }}
          type="submit"
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProductForm;
