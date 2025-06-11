import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "./checkout.module.css";
import decodeToken from "../../lib/decodeToken";

export default function PaypalCheckout() {
  const location = useLocation();
  const priceId = "P-92L204703V260960BNBD3T2A";
  const locationPath = location.state?.locationPath1 || null;
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  // Decode user from token if available
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const result = decodeToken(token);
      setUserDetails(result);
    }
  }, []);

  const createSubscriptionHandler = async () => {
    if (!email || !contact) {
      setMessage("Please enter both email and contact number.");
      return;
    }

    setMessage("Redirecting to PayPal...");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/p-create-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: "P-92L204703V260960BNBD3T2A",
          returnUrl: `http://localhost:3000/pcheckout`,
          cancelUrl: `http://localhost:3000/pcheckout`,
          givenName: userDetails?.firstName || "John",
          surname: userDetails?.lastName || "Doe",
          emailAddress: email,
          brandName: "DesignersX",
          locale: "en-US",
        }),
      });

      const data = await res.json();
      if (data.error || !data.approvalUrl) {
        setMessage("Failed to create PayPal subscription.");
        return;
      }

      // Redirect user to PayPal approval page
      window.location.href = data.approvalUrl;

      if (!res.ok) {
        const error = await res.json();
        console.error("PayPal subscription creation error:", error);
        setMessage(error.error || "Subscription creation failed.");
        return;
      }
    } catch (err) {
      console.error("PayPal subscription error:", err);
      setMessage("An error occurred while redirecting to PayPal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Subscribe with PayPal</h2>

      <div className={styles.inputMain}>
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />

        <label>Phone</label>
        <input
          type="tel"
          placeholder="Enter your contact number"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className={styles.input}
        />
      </div>

      <button
        onClick={createSubscriptionHandler}
        className={styles.button}
        disabled={loading}
      >
        {loading ? "Processing..." : "Subscribe via PayPal"}
      </button>

      {message && <p className={styles.message2}>{message}</p>}
    </div>
  );
}
