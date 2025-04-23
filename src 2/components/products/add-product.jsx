import { useState, useContext, useRef } from "react";
import CreateableSelect from "react-select/creatable";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import { FirebaseContext } from "../../context/context";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import useSystemStore from "../../state/system";
import useUserStore from "../../state/user";
import * as Popover from "@radix-ui/react-popover";
import { v4 as uuidv4 } from "uuid";
import styles from "../../styles/add-product.module.css";

const AddProductForm = ({ availableTags }) => {
  const { db, storage } = useContext(FirebaseContext);

  const setDrawerOpen = useSystemStore((state) => state.setDrawerOpen);
  const setDrawerContent = useSystemStore((state) => state.setDrawerContent);

  const user = useUserStore((state) => state.user);
  const [extraFields, setExtraFields] = useState([]);
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [purchaseDate, setPurchaseDate] = useState("");
  const [tags, setTags] = useState([]);
  const [warrantyLength, setWarrantyLength] = useState("0");
  const [warrantyLengthUnit, setWarrantyLengthUnit] = useState("months");

  const fileInputRef = useRef(null);
  const ignoreClickRef = useRef(false);
  const previewImgInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (ignoreClickRef.current) {
      return;
    }
    ignoreClickRef.current = true;

    console.log("submitting");

    let previewImgName = null;

    if (previewImg) {
      const storageRef = ref(storage, `${user.uid}/${previewImg.file.name}`);
      await uploadBytes(storageRef, previewImg.file);
      previewImgName = previewImg.file.name;
    }

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
      previewImg: previewImgName,
      purchaseDate,
      tags,
      warrantyLength,
      warrantyLengthUnit,
    };

    if (extraFields.length) {
      docBody.extraFields = extraFields.filter((field) => field.value);
    }

    const docRef = await addDoc(
      collection(db, `users/${user.uid}/products`),
      docBody
    );

    console.log("Document written with ID: ", docRef.id);

    setDrawerOpen(false);
    setDrawerContent({ component: "", params: null });
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
    <div className={styles.container}>
      <h2>Add Product</h2>
      <div className={styles.content}>
        <input
          ref={previewImgInputRef}
          type="file"
          id="preview-img"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                console.log(reader, reader.result);
                setPreviewImg({
                  file: file,
                  url: reader.result,
                });
              };
              reader.readAsDataURL(file);
            }
          }}
          style={{ display: "none" }}
        />
        {previewImg ? (
          <div
            id={styles.previewImgWrapper}
            onClick={() => previewImgInputRef.current.click()}
          >
            <img
              id={styles.previewImg}
              src={previewImg.url}
              width={100}
              height={100}
            />
            <span className={styles.addPreview}>
              <AddIcon />
            </span>
          </div>
        ) : (
          <div
            id={styles.previewPlaceholder}
            onClick={() => previewImgInputRef.current.click()}
          >
            <CameraAltOutlinedIcon fontSize="large" />
            <span className={styles.addPreview}>
              <AddIcon />
            </span>
          </div>
        )}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputWrapper}>
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
          </div>
          <div className={styles.inputWrapper}>
            <label htmlFor="purchaseDate">
              Purchase Date<sup>*</sup>
            </label>
            <input
              type="date"
              name="purchaseDate"
              required
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>
          <div className={styles.inputWrapper}>
            <label htmlFor="warrantyLength">
              Warranty Length<sup>*</sup>
            </label>
            <div className={styles.warrantyInputs}>
              <input
                type="number"
                name="warrantyLength"
                required
                value={warrantyLength}
                onChange={(e) => setWarrantyLength(e.target.value)}
                min={0}
              />
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
            </div>
          </div>
          <div className={styles.inputWrapper}>
            <label htmlFor="notes">Notes</label>
            <textarea
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
            />
          </div>
          {extraFields.map((field, index) => (
            <div
              key={`extraField-${field.type}-${field.title}`}
              className={styles.inputWrapper}
            >
              <input
                type="text"
                name={`extraField-${field.type}-${field.title}`}
                value={field.label}
                onChange={(e) => {
                  const newFields = [...extraFields];
                  newFields[index].label = e.target.value;
                  setExtraFields(newFields);
                }}
                className={styles.fieldLabelInput}
              />
              <input
                type={field.type}
                name={`extraField-${field.type}-${field.title}`}
                value={field.value}
                onChange={(e) => {
                  const newFields = [...extraFields];
                  newFields[index].value = e.target.value;
                  setExtraFields(newFields);
                }}
                className={styles.fieldInput}
              />
            </div>
          ))}
          <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
            <Popover.Trigger asChild>
              <button
                type="button"
                className={styles.popoverTrigger}
                onClick={() => setPopoverOpen(true)}
              >
                <AddIcon />
                Add Extra Field
              </button>
            </Popover.Trigger>
            <Popover.Content side="top" className={styles.popoverContent}>
              <button onClick={() => addNewField("text")}>Text</button>
              <button onClick={() => addNewField("date")}>Date</button>
            </Popover.Content>
          </Popover.Root>
          <div>
            <label htmlFor="tags">Tags</label>
            <CreateableSelect
              isMulti
              options={availableTags.map((tag) => ({
                value: tag,
                label: tag,
              }))}
              onChange={(tags) => {
                setTags(tags.map((tag) => tag.value));
              }}
              name="tags"
              styles={{
                container: (provided) => ({
                  ...provided,
                  padding: "0.5rem",
                  borderRadius: "12px",
                  border: "1px solid #c7ccd1",
                }),
                control: (provided) => ({
                  ...provided,
                  border: "none",
                  ":hover": {
                    borderColor: "none",
                  },
                }),
                group: (provided) => ({
                  ...provided,
                  padding: 0,
                }),
                groupHeading: () => ({
                  borderBottom: "1px solid #606265",
                  color: "#606265",
                  marginBottom: "0.25rem",
                  padding: "1rem 0 0 0.5rem",
                }),
                option: (provided, { isSelected }) => ({
                  ...provided,
                  color: "#232b2b",
                  display: "flex",
                  alignItems: "center",
                  ":hover": {
                    backgroundColor: "#d1cbc9",
                  },
                  "> svg": {
                    marginRight: "0.5rem",
                  },
                }),
                valueContainer: (provided) => ({
                  ...provided,
                  border: "none",
                }),
                singleValue: (provided, { data }) => ({
                  ...provided,
                  border: "none",
                }),
                dropdownIndicator: (provided) => ({
                  ...provided,
                  color: "#606265",
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: "black",
                  fontSize: "0.8rem",
                }),
                indicatorSeparator: (provided) => ({
                  ...provided,
                  display: "none",
                }),
                indicatorsContainer: (provided) => ({
                  ...provided,
                  padding: "0 0.5rem",
                }),
              }}
            />
          </div>
          <div className={styles.inputWrapper}>
            <input
              ref={fileInputRef}
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
              // id={styles.fileInput}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className={styles.fileButton}
            >
              <AddIcon />
              Add Images or Files
            </button>
          </div>
          {files.map((file) => (
            <div key={file.name} className={styles.fileItem}>
              <p>{file.name}</p>
              <button onClick={() => setFiles(files.filter((f) => f !== file))}>
                <DeleteIcon />
              </button>
            </div>
          ))}
        </form>
      </div>
      <button
        onClick={handleSubmit}
        disabled={!name || !purchaseDate || !warrantyLength}
        id={styles.submitButton}
      >
        <SaveIcon />
        Save
      </button>
    </div>
  );
};

export default AddProductForm;
