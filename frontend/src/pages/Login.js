import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
require("dotenv").config();

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setMessage("Please fill in all fields.");
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        localStorage.setItem("loggedInUser", username);
        setTimeout(() => {
          navigate(`/${username}/books`);
        }, 1000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Login failed. Please try again.");
      }
    } catch {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/google-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("loggedInUser", data.username);
        setMessage("Google login successful!");
        setTimeout(() => {
          navigate(`/${data.username}/books`);
        }, 1000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Google login failed. Please try again.");
      }
    } catch {
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div
        style={{
          maxWidth: "300px",
          margin: "auto",
          marginTop: "50px",
          backgroundColor: "lightblue",
          color: "indigo",
          padding: "4px",
          paddingBottom: "50px",
        }}
      >
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "10px" }}>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={{ width: "93%", padding: "8px", marginTop: "5px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{ width: "93%", padding: "8px", marginTop: "5px" }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "10px",
              borderColor: "transparent",
              backgroundColor: "indigo",
              fontWeight: "1000",
            }}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setMessage("Google login failed")}
          buttonText="Sign in with Google"
        />
        {message && <p style={{ marginTop: "10px" }}>{message}</p>}
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
