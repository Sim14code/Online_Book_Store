import React from "react";
import "./Footer.css"; // Import the CSS file

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="copyright">
          <p>&copy; {new Date().getFullYear()} Books. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
