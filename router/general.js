const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const public_users = express.Router();

// Path to the JSON file
const usersFilePath = path.join(__dirname, "./auth_users.json");

console.log(usersFilePath);

// Helper function to read the JSON file
const readUsersFromFile = () => {
  const usersData = fs.readFileSync(usersFilePath);
  return JSON.parse(usersData);
};

// Helper function to write to the JSON file
const writeUsersToFile = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Read users from the file
  const users = readUsersFromFile();

  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Add new user to the users array
  users.push({ username, password });

  // Write updated users to the file
  writeUsersToFile(users);

  console.log(users);

  return res.status(200).json({ message: "User registered successfully" });
});

module.exports = public_users;

const JWT_SECRET = "your_jwt_secret_key";

// Function to authenticate the user
const authenticatedUser = (username, password) => {
  const users = readUsersFromFile(); // Load users from the file

  console.log("User array:", users); // For debugging

  const user = users.find((user) => user.username === username);

  // Check if username and password match
  if (user && user.password === password) {
    return true;
  } else {
    return false;
  }
};

// Login route
public_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  console.log(username); // Debugging logs
  console.log(password); // Debugging logs

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Authenticate user
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

  return res.status(200).json({ token });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author.toLowerCase();
  const booksByAuthor = [];

  for (const isbn in books) {
    if (books[isbn].author.toLowerCase() === author) {
      booksByAuthor.push(books[isbn]);
    }
  }

  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);
  } else {
    return res
      .status(404)
      .json({ message: "No books found for the specified author" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title.toLowerCase();
  const booksWithTitle = [];

  for (const isbn in books) {
    if (books[isbn].title.toLowerCase() === title) {
      booksWithTitle.push(books[isbn]);
    }
  }

  if (booksWithTitle.length > 0) {
    return res.status(200).json(booksWithTitle);
  } else {
    return res
      .status(404)
      .json({ message: "No books found with the specified title" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  const book = books[isbn];

  if (book) {
    return res
      .status(200)
      .json(book.reviews || { message: "No reviews available for this book" });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

const axios = require("axios");

// Function to get the list of books
const fetchBooks = () => {
  axios
    .get("http://localhost:5000/")
    .then((response) => {
      const books = response.data;

      console.log("Books available:", books);
    })
    .catch((error) => {
      console.error("Error fetching books:", error.message);
    });
};

fetchBooks();

// Function to get book details by ISBN
const fetchBookDetails = async (isbn) => {
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);

    const bookDetails = response.data;

    console.log("Book details:", bookDetails);
  } catch (error) {
    console.error("Error fetching book details:", error.message);
  }
};

fetchBookDetails("1");

//Function to get books by author
const fetchBooksByAuthor = (title) => {
  axios
    .get(`http://localhost:5000/author/${author}`)
    .then((response) => {
      const books = response.data;

      console.log("Book found:", books);
    })
    .catch((error) => {
      console.error("Error fetching books by author:", error.message);
    });
};

fetchBooksByAuthor("unknown");

// Function to get book details by title
const fetchBookDetailsByTitle = (title) => {
  axios
    .get(`http://localhost:5000/title/${title}`)
    .then((response) => {
      const books = response.data;

      console.log("Books found:", books);
    })
    .catch((error) => {
      console.error("Error fetching book details by title:", error.message);
    });
};

fetchBookDetailsByTitle("My book");

module.exports.general = public_users;
