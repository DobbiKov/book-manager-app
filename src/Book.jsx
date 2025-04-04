import { invoke } from "@tauri-apps/api/core";
import { useContext, useState } from "react";
import { QuestionContext } from "./contexts";
import { QuestionBoxCont } from "./questionBoxCont";


const Book = ({path, name, section, favourite}) => {
    const [error, setError] = useState("");
    const {cont, setCont} = useContext(QuestionContext);
    const onClickHandler = async (e) => {
       await invoke("open_book", {name})
        .then(res => {})
        .catch(err_mess => {setError(err_mess)});
    };

    const onFavouriteClickHandler = async (e) => {
        console.log("on click favourite");
        console.log(name);
        await invoke("update_favourite_book", {name: name, favourite: !favourite})
            .then(res => {console.log("got it!")})
            .catch(err_mess => {setError(err_mess)})
    }

    const getFavouriteFill = (_fav) => {
        if(_fav == true) return "black";
        return "none";
    }
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
        <button className="star-btn" onClick={onFavouriteClickHandler}>
            <svg className="outlined" width="24" height="24" viewBox="0 0 24 24">
                <polygon points="12,2 15,9 22,9 16.5,14 18,21 12,17 6,21 7.5,14 2,9 9,9" stroke="black" strokeWidth="2" fill={`${getFavouriteFill(favourite)}`}/>
            </svg>
        </button>
        </div> 
    );
};

export default Book;
