import { useState, useContext, useEffect } from "react";
import CreateableSelect from "react-select/creatable";
import DeleteIcon from "@mui/icons-material/Delete";
import { FirebaseContext } from "../../context/context";
import { doc, updateDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import useSystemStore from "../../state/system";
import useUserStore from "../../state/user";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import * as Popover from "@radix-ui/react-popover";
import { v4 as uuidv4 } from "uuid";

const EditProductForm = ({ availableTags, product }) => {
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
    const initialize = async () => {
      setName(product.name);
      setNotes(product.notes);
      setPurchaseDate(product.purchaseDate);
      setTags(product.tags);
      setWarrantyLength(product.warrantyLength);
      setWarrantyLengthUnit(product.warrantyLengthUnit);

      if (!product.files?.length) {
        return;
      }

      const existingFiles = await Promise.all(
        product.files.map(async (file) => {
          const storageRef = ref(storage, `${user.uid}/${file}`);
          const url = await getDownloadURL(storageRef);
          return { name: file, url };
        })
      );

      setFiles(existingFiles);
    };

    initialize();
  }, [product]);

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

    const filesToDelete = product.files.filter(
      (file) => !files.map((f) => f.name).includes(file)
    );

    const filesToUpload = files.filter(
      (file) => !product.files.includes(file.name)
    );

    console.log(filesToDelete);
    console.log(filesToUpload);

    await Promise.all(
      filesToDelete.map(async (file) => {
        const storageRef = ref(storage, `${user.uid}/${file}`);
        await deleteObject(storageRef);
      })
    );

    const fileNames = await Promise.all(
      filesToUpload.map(async (file) => {
        const storageRef = ref(storage, `${user.uid}/${file.name}`);
        await uploadBytes(storageRef, file);
        return file.name;
      })
    );

    const finalFilenames = [
      ...product.files.filter((file) => !filesToDelete.includes(file)),
      ...fileNames,
    ];

    const docBody = {
      createdAt: serverTimestamp(),
      files: finalFilenames,
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

    await updateDoc(
      doc(db, `users/${user.uid}/products/${product.id}`),
      docBody
    );

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
    <div style={{ border: "1px solid black", padding: "0.25rem" }}>
      <h3>Edit Product</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "600px",
          alignItems: "flex-start",
        }}
      >
        <label htmlFor="name">
          Name<sup>*</sup>
        </label>
        <input type="text" name="name" required defaultValue={product.name} />

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

            const updatedFiles = [...files, ...Array.from(e.target.files)];

            console.log(updatedFiles);

            setFiles(updatedFiles);
          }}
        />
        {files.length && (
          <div>
            {files.map((file) => (
              <div
                key={file.name}
                style={{ display: "flex", alignItems: "center" }}
              >
                {file.url ? (
                  <a href={file.url} target="_blank" rel="noreferrer">
                    {file.name}
                    <ExternalLinkIcon />
                  </a>
                ) : (
                  <p>{file.name}</p>
                )}
                <button
                  onClick={() => {
                    console.log("deleting");

                    const updatedFiles = files.filter(
                      (f) => f.name !== file.name
                    );

                    console.log(updatedFiles);

                    setFiles(updatedFiles);
                  }}
                  style={{ backgroundColor: "transparent", border: "none" }}
                >
                  <DeleteIcon />
                </button>
              </div>
            ))}
          </div>
        )}
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
            }}
          >
            <ul>
              <li onClick={() => addNewField("text")}>Text</li>
              <li onClick={() => addNewField("date")}>Date</li>
            </ul>
          </Popover.Content>
        </Popover.Root>
        <button onClick={handleSubmit}>Edit Product</button>
      </div>
    </div>
  );
};

export default EditProductForm;
