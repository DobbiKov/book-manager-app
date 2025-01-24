use book_lib::db::CreateBookError;
use errors::AddBookError;
use serde::Serialize;
use std::process;
use tauri::{utils::config::Updater, Emitter, Window};

mod book;
mod errors;

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
    let conn = book_lib::db::connect_to_db();
    let res_books = book_lib::db::get_books(&conn);

    let ret_books: Vec<book::Book> = res_books
        .unwrap_or_default()
        .into_iter()
        .map(book::Book::ext_book_to_book)
        .collect();

    ret_books
}

#[tauri::command]
fn delete_book(window: Window, name: String) {
    let conn = book_lib::db::connect_to_db();
    // TODO, result of deleting
    let _ = book_lib::db::remove_book(&conn, &name);

    let books = get_books();
    window
        .emit("update-books", UpdateBooksPaylod { books })
        .unwrap();
}

#[tauri::command]
fn add_book(window: Window, bk: book::Book) -> Result<String, AddBookError> {
    let conn = book_lib::db::connect_to_db();
    if let (false, _) = book_lib::help::is_correct_path(&bk.path) {
        return Err(AddBookError::init(
            "path_error".to_string(),
            "The path is incorrect".to_string(),
        ));
    }
    if !book_lib::help::is_pdf(&bk.path) {
        return Err(AddBookError::init(
            "path_error".to_string(),
            "the provided file is not a pdf".to_string(),
        ));
    }
    // TODO, result of deleting
    match book_lib::db::create_book(&conn, &bk.to_book_lib()) {
        Ok(_) => {
            let books = get_books();
            window
                .emit("update-books", UpdateBooksPaylod { books })
                .unwrap();
            Ok("The book is created successfully".to_string())
        }
        Err(book_lib::db::CreateBookError::BookWithNameExists) => Err(AddBookError::init(
            "name_error".to_string(),
            "A book with the same name already exists".to_string(),
        )),
        Err(book_lib::db::CreateBookError::Other) => Err(AddBookError::init(
            "name_error".to_string(),
            "something went wrong".to_string(),
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
            add_book
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
