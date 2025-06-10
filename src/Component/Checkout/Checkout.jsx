import React, { useState , useEffect } from "react";
import styles from "./checkout.module.css";
import PopUp from "../Popup/Popup";
import { useLocation, useNavigate } from "react-router-dom";
import CountdownPopup from "../CountDownPopup/CountdownPopup";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Checkout({
  customerId,
  priceId,
  email,
  onSubscriptionSuccess,
  userId,
  
  agentId,
  locationPath,
}) {
  // Step state (1 or 2)
  const [step, setStep] = useState(1);
  // console.log("lstSTep", agentId);
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  // Card details
  const [billingName, setBillingName] = useState("");

  // Errors
  const [errors, setErrors] = useState({});

  // Loading and messages
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [popupType, setPopupType] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
const [disabled, setDisabled] = useState(true); 
  // Validate step 1 fields before going next
  const validateStep1 = () => {
    const newErrors = {};

    if (!addressLine1.trim()) newErrors.addressLine1 = "Address Line 1 is required.";
    if (!city.trim()) newErrors.city = "City is required.";
    if (!state.trim()) newErrors.state = "State / Province is required.";
    if (!postalCode.trim()) newErrors.postalCode = "Postal Code is required.";
    if (!country.trim()) {
      newErrors.country = "Country is required.";
    }

    // If there are errors, disable the Next button
    setErrors(newErrors);
    setDisabled(Object.keys(newErrors).length > 0);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Trigger validation on form field change
  useEffect(() => {
    validateStep1(); // Run validation whenever the fields change
  }, [addressLine1, city, state, postalCode, country]);

  // Handle next button on step 1
  const handleNext = () => {
    if (validateStep1()) {
      setErrors({});
      setStep(2);
    }
  };

  const [showCountdownPopup, setShowCountdownPopup] = useState(false);

  const handlePopupClose = () => {
    setShowCountdownPopup(false);
  };

  const handlePopupFinish = async () => {
    setShowCountdownPopup(false);
    setMessage("Subscription successful!");
    setPopupType("success");
    setPopupMessage("Subscription successful!");
    // Call next API here and navigate to the dashboard
    await callNextApiAndRedirect();
  };
  // Call the next API to finish user subscription and navigate to the dashboard
  const callNextApiAndRedirect = async () => {
    console.log("agentID", agentId);
    console.log("userId", userId);
    try {
      const res = await fetch(`${API_BASE_URL}/agent/updateFreeAgent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          agentId, // Send agentId along with userId as per your API
        }),
      });

      const data = await res.json();

      if (data.success) {
        // After successful API call, navigate to the dashboard
        setPopupType("success");
        setPopupMessage("Agent Upgraged successfully!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setMessage("Error completing subscription.");
        setPopupType("failed");
        setPopupMessage("Error completing subscription.");
      }
    } catch (error) {
      console.error("Error calling next API:", error);
      setMessage("Error completing subscription.");
      setPopupType("failed");
      setPopupMessage("Error completing subscription.");
    }
  };
  // Use useLocation to get the current location path
  const location = useLocation();
  // console.log("Current path:", location.pathname);

  // Handle subscription payment via Razorpay
  const handleSubmit = async () => {
    const newErrors = {};
    if (!billingName.trim())
      newErrors.billingName = "Name on card is required.";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setMessage("");
    setLoading(true);

    if (!priceId || !customerId || !email) {
      setMessage("Missing required data to proceed with payment.");
      setLoading(false);
      return;
    }

    if (!window.Razorpay) {
      setMessage("Razorpay SDK not loaded. Please reload the page.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/create-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: priceId,
          customer_id: customerId,
          billingDetails: {
            name: billingName,
            email,
            companyName,
            gstNumber,
            address: {
              line1: addressLine1,
              line2: addressLine2,
              city,
              state,
              postalCode,
              country,
            },
          },
          userId,
        }),
      });

      if (!res.ok) throw new Error("Subscription creation failed");

      const subscription = await res.json();

      if (!subscription.id) {
        setMessage("Subscription creation failed: Missing subscription id");
        setLoading(false);
        return;
      }

      setMessage("Opening Razorpay checkout...");

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        subscription_id: subscription.id,
        name: billingName,
        description: "Subscription Payment",
        prefill: {
          email,
          name: billingName,
        },
        handler: async function (response) {
          console.log(response, "ressss");
          setMessage("Verifying payment...");
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // Show the countdown popup
              if (locationPath === "/dashboard") {
                setShowCountdownPopup(true);
              } else {
                setMessage("Subscription successful!");
                setPopupType("success");
                setPopupMessage("Subscription successful!");
              }
              // Show the countdown popup
            } else {
              setMessage("Payment verification failed.");
              setPopupType("failed");
              setPopupMessage("Payment verification failed.");
            }
          } catch (err) {
            setMessage(" Error verifying payment.");
            setPopupType("failed");
            setPopupMessage("Error verifying payment.");
          }
          setLoading(false);
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setMessage(` ${err.message}`);
      setPopupType("failed");
      setPopupMessage(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.checkoutForm}>
      {step === 1 && (
        <>
          <h3 className={styles.billingNameH3}>
            Billing Address & Company Details
          </h3>

          <label>Address Line 1 *</label>
          <input
            type="text"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            className={styles.input2}
            required
          />
          {errors.addressLine1 && (
            <p className={styles.errorMsg}>{errors.addressLine1}</p>
          )}

          <label>Address Line 2</label>
          <input
            type="text"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            className={styles.input2}
          />

          <label>City *</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={styles.input2}
            required
          />
          {errors.city && <p className={styles.errorMsg}>{errors.city}</p>}

          <label>State / Province *</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className={styles.input2}
            required
          />
          {errors.state && <p className={styles.errorMsg}>{errors.state}</p>}

          <label>Postal Code *</label>
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className={styles.input}
            required
          />
          {errors.postalCode && (
            <p className={styles.errorMsg}>{errors.postalCode}</p>
          )}

          <label>Country *</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={styles.input2}
            required
            placeholder="ISO country code, e.g. US"
          />
          {errors.country && (
            <p className={styles.errorMsg}>{errors.country}</p>
          )}

          <button
            type="button"
            onClick={handleNext}
            className={styles.button}
            disabled={disabled}
          >
            Next
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h3 className={styles.LabelH3}>Payment</h3>

          <label>Name on Card *</label>
          <input
            type="text"
            value={billingName}
            onChange={(e) => setBillingName(e.target.value)}
            className={styles.input}
            required
          />
          {errors.billingName && (
            <p className={styles.errorMsg}>{errors.billingName}</p>
          )}

          {/* Razorpay uses hosted checkout modal; no card fields here */}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || disabled}
            className={styles.button}
            style={{ marginTop: "1rem" }}
          >
            {loading ? "Processing..." : "Subscribe"}
          </button>
        </>
      )}

      <PopUp
        type={popupType}
        message={popupMessage}
        onClose={() => {
          setPopupType("");
          setPopupMessage("");
          // Check if the current path is /checkout, if not, call onSubscriptionSuccess
          if (popupType === "success" && locationPath !== "/dashboard") {
            onSubscriptionSuccess?.();
          }
        }}
      />

      {/* Show the countdown popup if needed */}
      {showCountdownPopup && (
        <CountdownPopup
          onClose={handlePopupClose}
          onFinish={handlePopupFinish}
        />
      )}

      {message && !popupMessage && <p className={styles.message}>{message}</p>}
    </div>
  );
}

export default Checkout;
