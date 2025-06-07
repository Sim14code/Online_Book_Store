import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LikedPage.css";

const LikedBooks = () => {
  const [likedBooks, setLikedBooks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Move userId outside of useEffect to make it available to the whole component
  const userId = localStorage.getItem("loggedInUser");

  useEffect(() => {
    if (!userId) {
      setError("User not authenticated. Redirecting to login...");
      setLoading(false);
      navigate("/login");
      return;
    }

    const fetchLikedBooks = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/${userId}/liked-books/`,
          {
            method: "GET",
          }
        );
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Liked books not found for this user.");
          } else {
            throw new Error(
              "Error fetching liked books. Please try again later."
            );
          }
        }
        const data = await response.json();
        setLikedBooks(Array.isArray(data.liked_books) ? data.liked_books : []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedBooks();
  }, [navigate, userId]); // add userId to dependencies array

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="main">
        <h3>Liked Books</h3>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {likedBooks.length === 0 ? (
          <p>No books liked yet. Browse and like some books!</p>
        ) : (
          <div className="display">
            <ul>
              {likedBooks.map((book) => (
                <div className="book" key={book.id}>
                  <li>
                    <div className="bookitem">
                      {/* Use userId here */}
                      <Link to={`/${userId}/books/${book.id}`}>
                        {book.title}
                      </Link>
                      <p>Author: {book.author}</p>
                      {book.image && (
                        <img
                          src={`http://127.0.0.1:8000${book.image}`}
                          style={{ width: "200px", height: "auto" }}
                        />
                      )}
                    </div>
                  </li>
                </div>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedBooks;
