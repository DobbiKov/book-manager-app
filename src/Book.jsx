import { invoke } from "@tauri-apps/api/core";
import { useContext, useState } from "react";
import { QuestionContext } from "./contexts";
import { QuestionBoxCont } from "./questionBoxCont";


const Book = ({path, name, section}) => {
    const [error, setError] = useState("");
    const {cont, setCont} = useContext(QuestionContext);
    const onClickHandler = async (e) => {
       await invoke("open_book", {name})
        .then(res => {})
        .catch(err_mess => {setError(err_mess)});
    };
    return(
        <div className="book-card" >
            <h2 className="book-title" onClick={onClickHandler}>{name}</h2>
        {
            section == "" 
            ?
            (<p>No section</p>)
            :
            (<p className="book-section">{section}</p>)
        }
        {
            error == ""
            ? 
                (<p></p>)
            :
                (<p className="error-book-open">{error}</p>)
        }
        <button
              onClick={() => 
                  {
                     setCont(
                        new QuestionBoxCont(`Are you sure to delete ${name}?`, "", "Yes", "No", 
                            () => {
                                async function temp(){
                                    await invoke("delete_book", {name: name})
                                }
                                temp()
                                setCont(new QuestionBoxCont("", "", "", "", () => {}, () => {}, false))
                            },
                            () => {
                                setCont(new QuestionBoxCont("", "", "", "", () => {}, () => {}, false))
                            },
                            true
                        )
                     ) 
                  }}
              style={{
                marginLeft: "10px",
                backgroundColor: "red",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              🗑️ Delete
            </button>
        </div> 
    );
};

export default Book;
