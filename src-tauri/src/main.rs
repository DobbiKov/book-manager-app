// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    loggit::logger::set_log_level(loggit::Level::DEBUG);
    book_manager_lib::run()
}
