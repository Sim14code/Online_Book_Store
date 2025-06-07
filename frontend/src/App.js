import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import BookList from "./components/BookList";
import BookDetail from "./pages/BookDetails";
import LikedPage from "./pages/LikedPage";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";

const App = () => {
  // Custom component to handle Navbar rendering
  const ConditionalNavbar = () => {
    const location = useLocation();
    const noNavbarPaths = ["/login", "/register"];
    return !noNavbarPaths.includes(location.pathname) ? <Navbar /> : null;
  };

  return (
    <Router>
      <ConditionalNavbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:user/books" element={<BookList />} />
        <Route path="/:user/books/:id" element={<BookDetail />} />
        <Route path=":user/liked-books" element={<LikedPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;
