import React from "react";
import { Link } from "react-router-dom";
import "./BookCard.css";

const BookCard = ({ book }) => {
  // Get the logged-in user from localStorage (or any global state management you use)
  const currentUser = localStorage.getItem("loggedInUser");

  return (
    <div className="bigDiv">
      <div className="book-card">
        <h3>{book.title}</h3>
        <p>Price: ₹{book.price}</p>
        {book.image && (
          <img
            src={`http://127.0.0.1:8000${book.image}`}
            alt={book.title}
            style={{ width: "200px", height: "auto" }}
          />
        )}
        <p></p>
        {/* Check if currentUser exists, otherwise show login prompt */}
        {currentUser ? (
          <Link to={`/${currentUser}/books/${book.id}`}>View Details</Link>
        ) : (
          <p>Please log in to view details</p>
        )}
      </div>
    </div>
  );
};

export default BookCard;
