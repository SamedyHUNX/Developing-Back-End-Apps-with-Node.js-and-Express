const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
};

const authenticatedUser = (username, password) => {
  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  return !!user;
};

JWT_SECRET =
  "FDKLJFFJKLFSDNFM,SD,MNFFFNM,SDFGNM,FDSNM,FFSDJKLjhfdsfjkhldffljkd";

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

  return res.status(200).json({ token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.user.username; // Assuming user is authenticated and stored in req.user

  console.log("ISBN:", isbn);
  console.log("Review:", review);
  console.log("Username:", username);

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // Check if the book exists
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Initialize reviews as an array if it doesn't exist
  if (!Array.isArray(book.reviews)) {
    book.reviews = [];
  }

  // Find if the user has already reviewed this book
  const existingReviewIndex = book.reviews.findIndex(
    (r) => r.username === username
  );

  // If the review exists, update it
  if (existingReviewIndex !== -1) {
    book.reviews[existingReviewIndex].review = review;
    return res.status(200).json({ message: "Review updated successfully" });
  } else {
    // If no review exists, add a new one
    book.reviews.push({ username, review });
    return res.status(200).json({ message: "Review added successfully" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!book.reviews || book.reviews.length === 0) {
    return res
      .status(404)
      .json({ message: "No reviews available for this book" });
  }

  const reviewIndex = book.reviews.findIndex((r) => r.username === username);
  if (reviewIndex === -1) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  book.reviews.splice(reviewIndex, 1);

  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
