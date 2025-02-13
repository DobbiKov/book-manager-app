import { useState, useEffect, useCallback, createContext } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";
import Book from "./Book.jsx"
import QuestionBox from "./questionBox";
import { QuestionContext, ShowCreateBookContext } from "./contexts.js";
import { QuestionBoxCont } from "./questionBoxCont.js";
import AddBook from "./AddBook.jsx";

function App() {
    const [cont, setCont] = useState(new QuestionBoxCont("", "", "", "", () => {}, () => {}, false))
    const [show_add, setShow_add] = useState(false);
    const [books, setBooks] = useState([]);
    const [books_loaded, setBooks_loaded] = useState(false);
    
    useEffect(() => {
        async function temp_use_eff(){
            let _books = await invoke("get_books");
            setBooks(_books);
            console.log(_books);
            setBooks_loaded(true);

            const event_update_books = await listen("update-books", (event) => {
                setBooks(event.payload.books);
            });
        }
        temp_use_eff();
    }, []);

    const render_books = useCallback((_books) => {
        return(
                    <div className="book-list">
                    {
                        _books.map(( book ) => 
                            <Book name={book.name} path={book.path} section={book.section} favourite={book.favourite}/>
                        )
                    }
                    </div>
        )
    }, []);

  return (
      <ShowCreateBookContext.Provider value={{show_add, setShow_add}}>
      <QuestionContext.Provider value={{cont, setCont}}>
        <QuestionBox/>
        <AddBook/> 
        <button
              onClick={() => 
                  {
                    setShow_add(true);
                  }}
              style={{
                marginLeft: "10px",
                backgroundColor: "black",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              ➕Add Book 
            </button>
        <main className="container">
          {
              !books_loaded
              ?
              (<h2>Waiting for books</h2>)
              :
              render_books(books)
          }
        </main>
      </QuestionContext.Provider>
      </ShowCreateBookContext.Provider>
  );
}

export default App;
