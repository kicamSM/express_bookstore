process.env.NODE_ENV = "test"

const request = require("supertest");
const db = require("../db");
const app = require("../app");
const Book = require("../models/book");

async function createData() {
    await db.query("DELETE FROM books");
    // await db.query("SELECT setval('invoices_id_seq', 1, false)");
    // this is setting the value of the invoices Id to one
    
    await db.query(`INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year) VALUES ('000001', 'https/cheyenneRollerDerby', 'SockHer Blue', 'english', 265, 'Derby Inc', 'Derby 101', 2023)`);
};

beforeEach(createData);

describe('GET /books/', function () {
    
    test('gets all books', async function() {
    const res = await request(app).get("/books/");
    expect(res.body).toEqual({
        "books": [{
            "isbn": "000001",
            "amazon_url": "https/cheyenneRollerDerby",
            "author": "SockHer Blue",
            "language": "english",
            "pages": 265,
            "publisher": "Derby Inc",
            "title": "Derby 101",
            "year": 2023
          }],
        });
    })

})

describe('GET /books/:isbn', function () {
    
    test('gets single book by isbn code', async function() {
    const res = await request(app).get("/books/000001");
    expect(res.body).toEqual({
        "book": {
            "isbn": "000001",
            "amazon_url": "https/cheyenneRollerDerby",
            "author": "SockHer Blue",
            "language": "english",
            "pages": 265,
            "publisher": "Derby Inc",
            "title": "Derby 101",
            "year": 2023
          },
        });
    })

    test('gets single book by isbn code failure', async function() {
        const res = await request(app).get("/books/5555");
        expect(res.body).toEqual({
                "error": {
                    "message": "There is no book with an isbn '5555",
                    "status": 404
                }
            });
        })


    
})

describe('POST /books/', function () {
    
    test('adds new book to books', async function() {
    const res = await request(app).post("/books/").send({
        "isbn": "000002",
        "amazon_url": "http://huckSin",
        "author": "Huck Sin",
        "language": "english",
        "pages": 200,
        "publisher": "Derby Inc",
        "title": "Bad Ass Jamming",
        "year": 2023
      });
    expect(res.body).toEqual({
        "book": {
            "isbn": "000002",
            "amazon_url": "http://huckSin",
            "author": "Huck Sin",
            "language": "english",
            "pages": 200,
            "publisher": "Derby Inc",
            "title": "Bad Ass Jamming",
            "year": 2023
            },
        });
    })

    test('attempts to add new book to books with double isbn', async function() {
        const res = await request(app).post("/books/").send({
            "isbn": "8888",
            "isbn": "8888",
            "amazon_url": "http://Spiders",
            "author": "Spider Monkey",
            "language": "english",
            "pages": 200,
            "publisher": "Derby Inc",
            "title": "Spiders Can Fly",
            "year": 2023
          });
        expect(res.body).toEqual({
            "book": {
                "isbn": "8888",
                "amazon_url": "http://Spiders",
                "author": "Spider Monkey",
                "language": "english",
                "pages": 200,
                "publisher": "Derby Inc",
                "title": "Spiders Can Fly",
                "year": 2023
              },
            });
        })



    test('fails to post new book no amazon_url', async function() {
        const res = await request(app).post("/books/").send({
            "isbn": "000003",
            "author": "Strikeher",
            "language": "english",
            "pages": 100,
            "publisher": "Derby Inc",
            "title": "The Art of Skating",
            "year": 2023
          })
        expect(res.body).toEqual({
            "error": {
                "message": [
                    "instance requires property \"amazon_url\""
                ],
                "status": 400
            }
        });
    }) 

    test('attempts to add book wtih negative pages', async function() {
        const res = await request(app).post("/books/").send({
            "isbn": "000003",
            "amazon_url": "http://strikeHer",
            "author": "Strikeher",
            "language": "english",
            "pages": -168,
            "publisher": "Derby Inc",
            "title": "The Art of Skating",
            "year": 2023
          })
        expect(res.body).toEqual({
            "error": {
                "message": [
                    "instance.pages must be greater than or equal to 1"
                ],
                "status": 400
            }
        });
    }) 
})

describe('PUT /books/:isbn', function () {
    
    test('Edits existing book', async function() {
    const res = await request(app).put("/books/000001").send({
        "isbn": "000001",
        "amazon_url": "https/cheyenneRollerDerby",
        "author": "SockHer Blue",
        "language": "english",
        "pages": 265,
        "publisher": "Derby Inc",
        "title": "THIS IS THE NEW BOOK!!!!!",
        "year": 2023
      });
    expect(res.body).toEqual({
        "book": {
            "isbn": "000001",
            "amazon_url": "https/cheyenneRollerDerby",
            "author": "SockHer Blue",
            "language": "english",
            "pages": 265,
            "publisher": "Derby Inc",
            "title": "THIS IS THE NEW BOOK!!!!!",
            "year": 2023
          },
        });
    })

    test('fails to locate existing book', async function() {
        const res = await request(app).put("/books/9999").send({
            "isbn": "9999",
            "amazon_url": "https/cheyenneRollerDerby",
            "author": "Strikeher",
            "language": "english",
            "pages": 100,
            "publisher": "Derby Inc",
            "title": "The Art of Skating",
            "year": 2023
          })
        expect(res.body).toEqual({
            "error": {
                "message": "There is no book with an isbn '9999",
                "status": 404
            }
        });
    }) 
})

describe('DELETE books/:isbn/', function () {

    test('deletes existing company', async function() {
        const res = await request(app).delete("/books/000001");
        expect(res.body).toEqual({
            "message": "Book deleted"
        });
        })

    })


afterAll(async () => {
    await db.end()
  })