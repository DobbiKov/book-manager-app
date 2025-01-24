use serde::Serialize;

#[derive(Serialize)]
pub struct AddBookError {
    error_type: String,
    error_message: String,
}

impl AddBookError {
    pub fn init(error_type: String, error_message: String) -> Self {
        AddBookError {
            error_type,
            error_message,
        }
    }
}
