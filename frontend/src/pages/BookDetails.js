import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Rating } from "@mui/material";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import "./BookDetails.css";

// Dynamically load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject("Razorpay script failed to load");
    document.body.appendChild(script);
  });
};

const BookDetail = () => {
  const { id } = useParams(); // Extract the book ID from the URL
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [currentUser, setCurrentUser] = useState(""); // State to track the logged-in user
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the current user from localStorage
  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
      navigate("/login"); // Redirect to login if not authenticated
    } else {
      setCurrentUser(loggedInUser);
    }
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) return; // Don't fetch if currentUser is not available

    const fetchBookDetails = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/${currentUser}/books/${id}/`
        );
        if (!response.ok) {
          throw new Error("Error fetching book details");
        }
        const data = await response.json();
        setBook(data);
        setIsLiked(data.is_liked); // Set the initial "isLiked" state
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetails();
  }, [id, currentUser]);

  // Toggle like status
  const toggleLike = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/${currentUser}/books/${id}/`,
        {
          method: "POST", // Sending a POST request to toggle like status
        }
      );
      if (!response.ok) {
        throw new Error("Error updating like status");
      }
      const data = await response.json();
      setIsLiked(data.is_liked); // Update the "isLiked" state with the new status
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch reviews
  useEffect(() => {
    if (!currentUser) return; // Don't fetch reviews if currentUser is not available

    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/books/${id}/reviews/`
        );
        if (!response.ok) {
          throw new Error("Error fetching reviews");
        }
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchReviews();
  }, [id, currentUser]);

  const handleRatingChange = (event, value) => {
    setNewRating(value);
  };

  const handleCommentChange = (event) => {
    setNewComment(event.target.value);
  };

  const submitReview = async () => {
    if (!newComment || newRating === 0) {
      alert("Please enter a comment and select a rating.");
      return;
    }

    const reviewData = {
      comment: newComment,
      rating: newRating,
    };

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/books/${id}/reviews/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reviewData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit review.");
      }

      const newReview = await response.json();
      setReviews((prevReviews) => [newReview, ...prevReviews]);
      setNewComment("");
      setNewRating(0);
    } catch (err) {
      console.error(err);
      alert("An error occurred while submitting your review.");
    }
  };

  // Handle "Order Now" button click
  const handleOrder = async () => {
    try {
      console.log("Requesting order creation...");

      if (!book.price || isNaN(book.price) || book.price <= 0) {
        alert("Invalid price value.");
        return;
      }

      // Request server to create an order
      const response = await fetch("http://127.0.0.1:8000/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(book.price) * 100, // Ensure amount is in paise
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await response.json();
      console.log("Order data received:", orderData);

      if (orderData.order_id && orderData.amount && orderData.currency) {
        const options = {
          key: "rzp_test_kyvxGNN08b1Ugb", // Replace with your Razorpay API key
          amount: orderData.amount, // Amount in paise (already converted in backend)
          currency: orderData.currency,
          name: "Online Bookstore",
          description: "Payment for Book Order",
          order_id: orderData.order_id,
          handler: function (response) {
            console.log("Payment successful:", response);
            alert("Payment successful! Your order has been placed.");
          },
          prefill: {
            name: "Customer Name",
            email: "customer@example.com",
            contact: "9876543210",
          },
          theme: {
            color: "#F37254",
          },
        };

        // Ensure Razorpay script is loaded before trying to use it
        await loadRazorpayScript();

        if (typeof window.Razorpay !== "undefined") {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          alert("Razorpay script is not loaded.");
        }
      } else {
        alert("Order creation failed. Please try again.");
      }
    } catch (err) {
      console.error("Error during order creation:", err);
      alert("An error occurred: " + err.message);
    }
  };

  if (isLoading) return <p>Loading book details...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="start">
      <h2>{book.title}</h2>
      <p>Author: {book.author}</p>
      <p>Price: ₹{book.price}</p>
      <div className="Bookdsc">
        <p>{book.description}</p>
      </div>

      <div className="bookimg">
        {book.image && (
          <img
            src={`http://127.0.0.1:8000${book.image}`}
            alt={book.title}
            style={{ width: "200px", height: "auto" }}
          />
        )}
      </div>

      <div className="yourreview">
        <h3>Your Rating and Comment</h3>
        <Rating
          name="new-rating"
          value={newRating}
          onChange={handleRatingChange}
        />
        <TextField
          label="Write your comment here..."
          multiline
          rows={4}
          value={newComment}
          onChange={handleCommentChange}
        />
        <Button variant="contained" color="primary" onClick={submitReview}>
          Submit Review
        </Button>
      </div>

      <div className="reviewsget">
        <h3>Reviews</h3>
        {reviews.length > 0 ? (
          <ul>
            {reviews.map((review) => (
              <li key={review.id}>
                <p>Rating: {review.rating}/5</p>
                <p>{review.comment}</p>
                <p>
                  <small>
                    Posted on:{" "}
                    {new Date(review.created_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </small>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No reviews yet. Be the first to write one!</p>
        )}
      </div>

      <div className="heart-button">
        <Button
          variant={isLiked ? "contained" : "outlined"}
          color={isLiked ? "secondary" : "primary"}
          onClick={toggleLike}
        >
          {isLiked ? "Liked" : "Like"}
        </Button>
      </div>

      <div className="order-button">
        <Button
          variant="contained"
          color="success"
          onClick={handleOrder}
          style={{ marginTop: "20px" }}
        >
          Order Now
        </Button>
      </div>
    </div>
  );
};

export default BookDetail;
