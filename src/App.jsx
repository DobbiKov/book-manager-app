import React, { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";
import Book from "./Book.jsx";
import QuestionBox from "./questionBox";
import AddBook from "./AddBook.jsx";
import { QuestionContext, ShowCreateBookContext } from "./contexts.jsx";
import { QuestionBoxCont } from "./questionBoxCont.js";

function App() {
  // State for the question box
  const [questionBoxCont, setQuestionBoxCont] = useState(
    new QuestionBoxCont("", "", "", "", () => {}, () => {}, false)
  );
  // State to control the Add Book modal
  const [showAddBook, setShowAddBook] = useState(false);
  // Books state is an array of section objects.
  const [books, setBooks] = useState([]);
  // Flag to know when books have been loaded
  const [booksLoaded, setBooksLoaded] = useState(false);
  // Flag to toggle sorting by section
  const [isSortedBySection, setIsSortedBySection] = useState(false);

  // A ref to always have the latest isSortedBySection value inside event listeners.
  const isSortedBySectionRef = useRef(isSortedBySection);
  useEffect(() => {
    isSortedBySectionRef.current = isSortedBySection;
  }, [isSortedBySection]);

  // Helper function that wraps a plain books array into a default "Main" section.
  const wrapBooksInSection = (booksArray) => [{ section: "Main", books: booksArray }];

  // Effect to fetch books on mount and set up event listeners for updates.
  useEffect(() => {
    async function fetchBooksAndSetupListener() {
      try {
        // Initial fetch
        const initialBooks = await invoke("get_books");
        setBooks(wrapBooksInSection(initialBooks));
        console.log("Initial books:", initialBooks);
        setBooksLoaded(true);

        // Listen for book update events.
        await listen("update-books", async (event) => {
          const updatedBooks = event.payload.books;
          // Wrap the updated books in the default section.
          setBooks(wrapBooksInSection(updatedBooks));

          // If the user has sorted by section, fetch sorted books.
          if (isSortedBySectionRef.current) {
            const sortedBooks = await invoke("get_books_sorted_by_section");
            setBooks(sortedBooks);
          }
        });
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    }

    fetchBooksAndSetupListener();
  }, []);

  // Callback to render the list of book sections.
  const renderBooks = useCallback((bookSections) => (
    <div className="list_of_secs">
      {bookSections.map((sectionObj, sectionIndex) => (
        <div className="section" key={sectionIndex}>
          <p>{sectionObj.section}</p>
          <div className="book-list">
            {sectionObj.books.map((book, bookIndex) => (
              <Book
                key={bookIndex}
                name={book.name}
                path={book.path}
                section={book.section}
                favourite={book.favourite}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  ), []);

  // Toggle the sort state and fetch the appropriate data.
  const toggleSortBySection = async () => {
    try {
      if (!isSortedBySection) {
        const sortedBooks = await invoke("get_books_sorted_by_section");
        setBooks(sortedBooks);
        console.log("Sorted books:", sortedBooks);
      } else {
        const initialBooks = await invoke("get_books");
        setBooks(wrapBooksInSection(initialBooks));
      }
      setIsSortedBySection((prev) => !prev);
    } catch (error) {
      console.error("Error toggling sort:", error);
    }
  };

  return (
    <ShowCreateBookContext.Provider value={{ show_add: showAddBook, setShow_add: setShowAddBook }}>
      <QuestionContext.Provider value={{ cont: questionBoxCont, setCont: setQuestionBoxCont }}>
        <QuestionBox />
        <AddBook />
        <div className="button-group">
          <button onClick={() => {setShowAddBook(true); console.log(showAddBook);}} className="add-book-button">
            ➕ Add Book
          </button>
          <button
            onClick={toggleSortBySection}
            className="sort-button"
            style={{
              marginLeft: "10px",
              backgroundColor: isSortedBySection ? "green" : "grey",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            🔀 Sort by section
          </button>
        </div>
        <main className="container">
          {!booksLoaded ? <h2>Waiting for books...</h2> : renderBooks(books)}
        </main>
      </QuestionContext.Provider>
    </ShowCreateBookContext.Provider>
  );
}

export default App;

