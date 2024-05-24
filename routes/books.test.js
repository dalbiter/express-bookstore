process.env.NODE_ENV = "test";

const request = require('supertest');
const app = require('../app');
const db = require('../db')

let testBook;
let book =
    {
        isbn: "0691161518",
        amazon_url: "http://a.co/eobPtX2",
        author: "Matthew Lane",
        language: "english",
        pages: 264,
        publisher: "Princeton University Press",
        title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        year: 2017
    };
let bookAltered =
    {
        isbn: "0691161518",
        amazon_url: "http://a.co/eobPtX2",
        author: "Matthew Lane edited",
        language: "english edited",
        pages: 264,
        publisher: "Princeton University Press edited",
        title: "Power-Up: Unlocking the Hidden Mathematics in Video Games edited",
        year: 2017
    };
let book2 =
    {
        isbn: "0691161519",
        amazon_url: "http://a.co/eobPtX3",
        author: "Dan albiter",
        language: "russian",
        pages: 240,
        publisher: "rutgers University Press",
        title: "Peace and War",
        year: 1824
    };


beforeEach( async () => {
    const { isbn, amazon_url, author, language, pages, publisher, title, year } = book
    const result = await db.query(
        `INSERT INTO books
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING isbn`,
        [isbn, amazon_url, author, language, pages, publisher, title, year]
    )
    testBook = result.rows[0]
});

afterEach( async () => {
    await db.query("DELETE FROM books");
})

afterAll( async () => {
    await db.end();
})

describe("GET /books", () => {
    test(" Get array with one book", async () => {
        const res = await request(app).get('/books');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({books: [book]});
    })
});

describe("GET /books/:isbn", () => {
    test("Get one book by isbn number", async () => {
        const res = await request(app).get(`/books/${book.isbn}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({book: book});
    })
});

describe("POST /books", () => {
    test("Create a new book and save to db", async () => {
        const res = await request(app).post('/books').send(book2);
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({book: book2})
    });

    test("Invalid data responds with error stack and 400", async () => {
        const res = await request(app).post('/books').send("data")
        expect(res.statusCode).toBe(400)
    });
});

describe("PUT /books/:isbn", () => {
    test("Updates a book and saves to db", async () => {
        const res = await request(app).put(`/books/${book.isbn}`).send(bookAltered);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({book: bookAltered})
    });

    test("Invalid data responds with error stack and 400", async () => {
        const res = await request(app).put(`/books/${book2.isbn}`).send("data")
        expect(res.statusCode).toBe(400)
    });
});