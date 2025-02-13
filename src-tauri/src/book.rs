use serde::{
    ser::{SerializeStruct, Serializer},
    Deserialize, Serialize,
};

#[derive(Deserialize)]
pub struct Book {
    pub path: String,
    pub name: String,
    pub section: Option<String>,
    pub favourite: bool,
}
impl Clone for Book {
    fn clone(&self) -> Self {
        Self {
            path: self.path.clone(),
            name: self.name.clone(),
            section: self.section.clone(),
            favourite: self.favourite.clone(),
        }
    }
}
impl Book {
    pub fn ext_book_to_book(ext_book: book_lib::book::Book) -> Book {
        Book {
            path: ext_book.path,
            name: ext_book.name,
            section: ext_book.section,
            favourite: ext_book.favourite,
        }
    }
    pub fn to_book_lib(&self) -> book_lib::book::Book {
        book_lib::book::Book::init(
            self.name.clone(),
            self.path.clone(),
            self.section.clone(),
            self.favourite.clone(),
        )
    }
}
impl Serialize for Book {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("Book", 4)?;
        state.serialize_field("path", &self.path)?;
        state.serialize_field("name", &self.name)?;
        state.serialize_field("section", &self.section.clone().unwrap_or("".to_string()))?;
        state.serialize_field("favourite", &self.favourite)?;
        state.end()
    }
}
