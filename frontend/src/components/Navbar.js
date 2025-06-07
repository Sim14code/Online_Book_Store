import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const userId = localStorage.getItem("loggedInUserId");

  return (
    <nav className="navbar">
      <h1>Online Bookspace</h1>
      <div className="links">
        <Link to="/">Home</Link>
        <Link to="/${userId}/liked-books">Liked Books</Link>
        <Link to="/About">About</Link>
        <Link to="/${userId}/books">Explore Books</Link>
      </div>
    </nav>
  );
};

export default Navbar;
