import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate(); // Hook for navigation

  return (
    <div className="Pages">
      <h1>Welcome</h1>
      <p>Find your favorite books here!</p>

      <Button
        variant="outlined"
        color="transparent"
        style={{ marginRight: "10px" }}
        onClick={() => navigate("/register")} // Navigate to register page
      >
        Register
      </Button>
      <Button
        variant="outlined"
        color="transparent"
        onClick={() => navigate("/login")} // Navigate to login page
      >
        Login
      </Button>
    </div>
  );
};

export default HomePage;
