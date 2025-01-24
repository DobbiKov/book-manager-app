import { useContext, useState } from "react"
import { invoke } from "@tauri-apps/api/core";
import { open } from '@tauri-apps/plugin-dialog';
import { ShowCreateBookContext } from "./contexts"

export default function AddBook() {
    const {show_add, setShow_add} = useContext(ShowCreateBookContext);
  const [name, setName] = useState("");
  const [fileFieldText, setFileFieldText] = useState("Click here to add a file");
  const [path, setPath] = useState("");
  const [section, setSection] = useState("");
  const [nameError, setNameError] = useState("");
  const [pathError, setPathError] = useState("");

  const handleAddClick = () => {
      async function temp() {
          const selected = await open({
              multiple: false,
              directory: false,
          });
          setPath(selected);
          setFileFieldText(selected);
      }
      temp();
  }
  const handleAdd = () => {
      console.log(path);
    let valid = true;

    if (!name.trim()) {
      setNameError("Name is required.");
      valid = false;
    } else {
      setNameError("");
    }

    if (!path.trim()) {
      setPathError("Path is required.");
      valid = false;
    } else {
      setPathError("");
    }

    if (valid) {
        async function temp(){
            await invoke("add_book", { bk: 
                {name:name, path:path, section:section}
            })
        .then(res => {setShow_add(false);})
        .catch(err => {
            setNameError(""); 
            setPathError(""); 
            if(err.error_type == "name_error"){
                setNameError(err.error_message);
            }
            if(err.error_type == "path_error"){
                setPathError(err.error_message);
            }
        });

        }
        temp()
    }
  };

  if (!show_add) return null;
    return( 
        <div className={ `popup-overlay ${show_add ? "" : "dontshow"}` }>
          <div className="popup-box">
            <h2>Add a Book</h2>

            <div className="popup-field">
              <label>Book Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter the book name"
              />
              {nameError && <p className="error-text">{nameError}</p>}
            </div>

            <div className="popup-field">
              <label>File Path</label>
              <input
                type="button"
                value={ fileFieldText }
                onClick={handleAddClick}
              />
              {pathError && <p className="error-text">{pathError}</p>}
            </div>

            <div className="popup-field">
              <label>Section (Optional)</label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="Enter section (if any)"
              />
            </div>

            <div className="popup-buttons">
              <button className="popup-btn confirm" onClick={handleAdd}>
                Add
              </button>
              <button className="popup-btn cancel" onClick={() => {setShow_add(false);}}>
                Close
              </button>
            </div>
          </div>
        </div>
    )
}
