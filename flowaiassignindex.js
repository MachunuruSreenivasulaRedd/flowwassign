const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Get Book API
app.get("/book/", async (request, response) => {
  const { bookId } = request.params;
  const getBookQuery = `
SELECT * FROM book WHERE book_id=${bookId};`;
  const bookArray = await db.get(getBookQuery);
  response.send(bookArray);
});
//Add Book API
app.post("/books/", async (request, response) => {
  try {
    const bookDetails = request.body;
    const {
      title,
      authorId,
      rating,
      ratingCount,
      reviewCount,
      description,
      pages,
      dateOfPublication,
      editionLanguage,
      price,
      onlineStores,
    } = bookDetails;
    const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;

    const dbResponse = await db.run(addBookQuery);
    const bookId = dbResponse.lastID;
    response.send({ bookid: bookId });
  } catch (e) {
    console.log(e.message);
  }
});
//update book api
app.put("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    const newBookDetails = request.body;

    const {
      title,
      authorId,
      rating,
      ratingCount,
      reviewCount,
      description,
      pages,
      dateOfPublication,
      editionLanguage,
      price,
      onlineStores,
    } = newBookDetails;

    const updateQuery = `UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`;

    const dbResponse = await db.run(updateQuery);

    response.send("updation is successful");
  } catch (e) {
    console.log(e.message);
  }
});
//delete API
app.delete("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    const deleteQuery = `
    DELETE FROM
        book
    WHERE
        book_id = ${bookId};`;

    const dbResponse = await db.run(deleteQuery);
    console.log(dbResponse);
    response.send("deletion is successful");
  } catch (e) {
    console.log(e.message);
  }
});
//Get books of an author
app.get("/author/:authorId/books/", async (request, response) => {
  try {
    const { authorId } = request.params;

    const authorQuery = `
    SELECT *  FROM
        book
    WHERE
        author_id = ${authorId};`;

    const dbResponse = await db.get(authorQuery);
    let dataItem = response.send(dbResponse);
  } catch (e) {
    console.log(e.message);
  }
});
