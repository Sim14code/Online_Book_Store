import React, { useState, useEffect } from "react";
import BookCard from "./BookCard";
import SearchBar from "./SearchBar";
import { useNavigate } from "react-router-dom"; // For navigation
import "./BookList.css";

function BookList() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [error, setError] = useState(""); // Add error state
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");

    if (!user) {
      navigate("/login");
      return;
    }

    setIsLoading(true); // Start loading state

    fetch(`http://127.0.0.1:8000/api/${user}/books/`)
      .then((response) => response.json())
      .then((data) => {
        setBooks(data);
        setFilteredBooks(data);
      })
      .catch((error) => {
        console.error("Error fetching books:", error);
        setError("Failed to load books. Please try again.");
      })
      .finally(() => setIsLoading(false)); // End loading state
  }, [navigate]);

  const handleSearch = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    const filtered = books.filter(
      (book) =>
        book.title.toLowerCase().includes(lowerCaseQuery) ||
        book.author.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredBooks(filtered);
  };

  return (
    <div className="all">
      <SearchBar onSearch={handleSearch} />
      <div className="BookCard">
        {isLoading ? (
          <p>Loading books...</p> // Show loading message
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p> // Show error message
        ) : filteredBooks.length > 0 ? (
          filteredBooks.map((book) => <BookCard key={book.id} book={book} />)
        ) : (
          <p>No books available. Please check back later.</p>
        )}
      </div>
    </div>
  );
}

export default BookList;
