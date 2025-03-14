use book_lib::db::CreateBookError;
use errors::AddBookError;
use sec_books::SecBooks;
use serde::Serialize;
use std::process;
use tauri::{utils::config::Updater, Emitter, Window};

mod book;
mod errors;
mod sec_books;

#[derive(Serialize, Clone)]
struct UpdateBooksPaylod {
    books: Vec<book::Book>,
}
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_books() -> Vec<book::Book> {
    let conn = book_lib::db::setup();
    let res_books = book_lib::get_books(&conn);

    let ret_books: Vec<book::Book> = res_books
        .unwrap_or_default()
        .into_iter()
        .map(book::Book::ext_book_to_book)
        .collect();

    book::sort_books_by_favourite(ret_books, book::SortByFavbouriteOrder::Descending)
}

#[tauri::command]
fn delete_book(window: Window, name: String) {
    let conn = book_lib::db::setup();
    // TODO, result of deleting
    let _ = book_lib::remove_book(&conn, &name);

    let books = get_books();
    window
        .emit("update-books", UpdateBooksPaylod { books })
        .unwrap();
}

#[tauri::command]
fn add_book(window: Window, bk: book::Book) -> Result<String, AddBookError> {
    let conn = book_lib::db::setup();
    // TODO, result of deleting
    match book_lib::create_book(&conn, &bk.to_book_lib()) {
        Ok(_) => {
            let books = get_books();
            window
                .emit("update-books", UpdateBooksPaylod { books })
                .unwrap();
            Ok("The book is created successfully".to_string())
        }
        Err(book_lib::CreateBookError::BookNameAlreadyUsed) => Err(AddBookError::init(
            "name_error".to_string(),
            "A book with the same name already exists".to_string(),
        )),
        Err(book_lib::CreateBookError::OtherError) => Err(AddBookError::init(
            "name_error".to_string(),
            "something went wrong".to_string(),
        )),
        Err(book_lib::CreateBookError::ProvidedPathIsNotPdf) => Err(AddBookError::init(
            "path_error".to_string(),
            "the provided file is not a pdf".to_string(),
        )),
        Err(book_lib::CreateBookError::ProvidedPathIsIncorrect) => Err(AddBookError::init(
            "path_error".to_string(),
            "The path is incorrect".to_string(),
        )),
    }
}

#[tauri::command]
fn open_path(path: String) -> Result<String, String> {
    if let (false, _) = book_lib::help::is_correct_path(&path) {
        return Err("the path is incorrect".to_string());
    }
    if !book_lib::help::is_pdf(&path) {
        return Err("the provided file is not pdf".to_string());
    }
    match process::Command::new("open")
        .args(["-a", "Skim", path.as_str()])
        .output()
    {
        Ok(_) => Ok("".to_string()),
        Err(_) => Err("something went wrong".to_string()),
    }
}

#[tauri::command]
fn open_book(name: String) -> Result<String, String> {
    let conn = book_lib::db::setup();
    match book_lib::open_book(&conn, &name) {
        Ok(_) => Ok("The book has been successfully opened!".to_string()),
        Err(err) => match err {
            book_lib::OpenBookError::BookDoesNotExist => Err("book doesn't exists".to_string()),
            book_lib::OpenBookError::PathIsIncorrect => Err("the path is incorrect".to_string()),
            book_lib::OpenBookError::FileIsNotPDF => {
                Err("the provided file is not pdf".to_string())
            }
            book_lib::OpenBookError::OtherError => Err("unexpected error".to_string()),
        },
    }
}

#[tauri::command]
fn update_favourite_book(window: Window, name: String, favourite: bool) -> Result<(), String> {
    let conn = book_lib::db::setup();
    let res = book_lib::update_favourite(&conn, &name, favourite);
    match res {
        Ok(_) => {
            let books = get_books();
            window
                .emit("update-books", UpdateBooksPaylod { books })
                .unwrap();
            Ok(())
        }
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn get_books_sorted_by_section(window: Window) -> Result<Vec<SecBooks>, String> {
    let conn = book_lib::db::setup();
    let books = match book_lib::get_books(&conn) {
        Ok(bks) => bks,
        Err(e) => {
            return Err(match e {
                book_lib::GetBooksError::BookOrTableDoesnotExist => "Unexpected error".to_string(),
                book_lib::GetBooksError::NoBooks => "There's no books!".to_string(),
            })
        }
    };
    let books_by_sec = book_lib::book::sort_books_by_section(books);
    let res = sec_books::convert_sorted_by_section_from_book_lib(books_by_sec);
    Ok(res)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_books,
            open_path,
            delete_book,
            add_book,
            open_book,
            update_favourite_book,
            get_books_sorted_by_section
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
