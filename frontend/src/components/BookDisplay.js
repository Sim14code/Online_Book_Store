import React from "react";
import BookCard from "./BookCard";

const BookDisplay = ({ books }) => {
  return (
    <div className="bigDiv">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
};

export default BookDisplay;
