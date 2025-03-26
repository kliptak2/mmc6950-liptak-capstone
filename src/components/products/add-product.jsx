import { useState, useContext, useEffect } from "react";
import CreateableSelect from "react-select/creatable";
import DeleteIcon from "@mui/icons-material/Delete";
import { FirebaseContext } from "../../context/context";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import useSystemStore from "../../state/system";
import useUserStore from "../../state/user";
import * as Popover from "@radix-ui/react-popover";
import { v4 as uuidv4 } from "uuid";

const AddProductForm = ({ availableTags }) => {
  const { db, storage } = useContext(FirebaseContext);

  const setModalOpen = useSystemStore((state) => state.setModalOpen);
  const setModalContent = useSystemStore((state) => state.setModalContent);

  const user = useUserStore((state) => state.user);

  const [errors, setErrors] = useState([]);
  const [extraFields, setExtraFields] = useState([]);
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState("");
  const [tags, setTags] = useState([]);
  const [warrantyLength, setWarrantyLength] = useState("");
  const [warrantyLengthUnit, setWarrantyLengthUnit] = useState("");

  useEffect(() => {
    const fieldLabelsAndCounts = extraFields.reduce((acc, field) => {
      if (acc[field.label]) {
        acc[field.label]++;
      } else {
        acc[field.label] = 1;
      }
      return acc;
    }, {});

    for (const key in fieldLabelsAndCounts) {
      if (fieldLabelsAndCounts[key] > 1) {
        setErrors([...errors, key]);
      }
    }
  }, [extraFields]);

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

    const docBody = {
      createdAt: serverTimestamp(),

      files: fileNames,
      name,
      notes,
      purchaseDate,
      tags,
      warrantyLength,
      warrantyLengthUnit,
    };

    if (extraFields.length) {
      docBody.extraFields = extraFields;
    }

    const docRef = await addDoc(
      collection(db, `users/${user.uid}/products`),
      docBody
    );

    console.log("Document written with ID: ", docRef.id);

    setModalOpen(false);
    setModalContent({ component: "", params: null });
  };

  const addNewField = (type) => {
    const newField = {
      id: uuidv4(),
      type,
      value: "",
      label: type.charAt(0).toUpperCase() + type.slice(1),
    };
    setExtraFields([...extraFields, newField]);
    setPopoverOpen(false);
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
        {extraFields.map((field, index) => (
          <div key={`extraField-${field.type}-${field.title}`}>
            <label htmlFor={`extraField-${field.type}-${field.title}`}>
              {field.label}
            </label>
            <input
              type={field.type}
              name={`extraField-${field.type}-${field.title}`}
              value={field.value}
              onChange={(e) => {
                const newFields = [...extraFields];
                newFields[index] = e.target.value;
                setExtraFields(newFields);
              }}
            />
          </div>
        ))}
        <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              style={{
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#007bff",
              }}
              onClick={() => setPopoverOpen(true)}
            >
              Add Extra Field
            </button>
          </Popover.Trigger>
          <Popover.Content
            side="top"
            style={{
              backgroundColor: "white",
              border: "1px solid #ccc",
              padding: "0.5rem",
              margin: 0,
            }}
          >
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li
                onClick={() => addNewField("text")}
                style={{ padding: "0.5rem" }}
              >
                Text
              </li>
              <li
                onClick={() => addNewField("date")}
                style={{ padding: "0.5rem" }}
              >
                Date
              </li>
            </ul>
          </Popover.Content>
        </Popover.Root>
        <button
          style={{
            margin: "1rem auto",
          }}
          type="submit"
          disabled={errors.length > 0}
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProductForm;
