use crate::book::Book;
pub struct SecBooks {
    pub section: String,
    pub books: Vec<Book>,
}

impl SecBooks {
    pub fn from_vec_tuple(from: (String, Vec<book_lib::book::Book>)) -> SecBooks {
        let bks: Vec<book_lib::book::Book> = from.1;
        let bks2 = bks.iter().map(|x| Book::ext_book_to_book(x)).collect();
        SecBooks {
            section: from.0,
            books: bks2,
        }
    }
}

pub fn convert_sorted_by_section_from_book_lib(
    input: Vec<(String, Vec<book_lib::book::Book>)>,
) -> Vec<SecBooks> {
    input
        .into_iter()
        .map(|x| SecBooks::from_vec_tuple(x))
        .collect()
}
