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
    const [is_sort_by_sec, setIsSortBySec] = useState(false);
    
    useEffect(() => {
        async function temp_use_eff(){
            let _books = await invoke("get_books");
            handleSetBooks(_books);
            console.log(_books);
            setBooks_loaded(true);

            const event_update_books = await listen("update-books", async (event) => {
                handleSetBooks(event.payload.books);
                if(is_sort_by_sec){

                  let books_by_sec = await invoke("get_books_sorted_by_section");
                  setBooks(books_by_sec);
                }
            });
        }
        temp_use_eff();
    }, []);

    const handleSetBooks = (books) => {
        setBooks( [{section: "Main", books: books}])
    }

    const render_books = useCallback((book_secs) => {
        return(
            <div className="list_of_secs">
                    {
                        book_secs.map(( obj ) => 
                        <div className="section">
                            <p>{obj.section}</p>
                            <div className="book-list">
                                {
                                    obj.books.map(( book ) => 
                                        <Book name={book.name} path={book.path} section={book.section} favourite={book.favourite}/>
                                    )
                                }
                            </div>
                        </div>
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
        <button
              onClick={async () => 
                  {
                      if(!is_sort_by_sec){
                          let books_by_sec = await invoke("get_books_sorted_by_section");
                          setBooks(books_by_sec);
                          console.log(books_by_sec);
                      }
                      else{
                          let _books = await invoke("get_books");
                          handleSetBooks(_books);
                      }
                      setIsSortBySec(!is_sort_by_sec);
                  }}
              style={{
                marginLeft: "10px",
                backgroundColor:  is_sort_by_sec == true ? "green" : "grey" ,
                color: "white", 
                border: "none",
                cursor: "pointer",
              }}
            >
              🔀Sort by section
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
