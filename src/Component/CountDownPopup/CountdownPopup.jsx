import React, { useState, useEffect } from "react";
import "./CountdownPopup.css";

const CountdownPopup = ({ onClose, onFinish }) => {
  const [remainingTime, setRemainingTime] = useState(80); // 2 minutes in seconds
  const [popupMessage, setPopupMessage] = useState(
    `Processing... Please wait for ${remainingTime} seconds.`
  );

  useEffect(() => {
    // Countdown logic
    const countdownInterval = setInterval(() => {
      setRemainingTime((prev) => prev - 1);
    }, 1000); // Every second

    // When the time runs out
    if (remainingTime === 0) {
      clearInterval(countdownInterval);
      setPopupMessage("Processing done. Continuing...");
      onFinish(); // Continue with the next process (e.g., alert or redirect)
    }

    return () => clearInterval(countdownInterval); // Clean up interval on unmount
  }, [remainingTime, onFinish]);

  useEffect(() => {
    if (remainingTime > 0) {
      setPopupMessage(
        `Processing... Please wait for ${remainingTime} seconds.`
      );
    }
  }, [remainingTime]);

  // Circular progress animation
  const progress = (remainingTime / 120) * 100; // Calculate percentage for progress

  const overlayStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0, 0, 0, 0.4)", // Semi-transparent background
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999, // Ensure the popup is on top
    opacity: 1,
    transition: "opacity 0.3s ease",
  };

  const popupStyles = {
    background: "white",
    borderRadius: "12px",
    padding: "30px",
    width: "70%",
    maxWidth: "400px",
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
    transition: "transform 0.3s ease",
    transform: remainingTime === 0 ? "scale(0.7)" : "scale(1)", // Scale animation based on countdown
  };

  const messagestyle = {
    marginTop: "15px",
    fontSize: "20px",
  };

  return (
    <div style={overlayStyles}>
      <div style={popupStyles}>
        <div className="mainLoader">
        <div class="spinner">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        </div>
        <h2 style={messagestyle}>{popupMessage}</h2>
      </div>
    </div>
  );
};

export default CountdownPopup;
