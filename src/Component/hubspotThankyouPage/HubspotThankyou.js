import axios from "axios";
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_BASE_URL, verifyOrCreateUser } from "../../Store/apiStore";
import styles from "./ThankYouPage.module.css";

const ThankYouPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showEmailMismatchPopup, setShowEmailMismatchPopup] = useState(false);

  const ownerEmail = searchParams.get("ownerEmail");
  const ownerName = searchParams.get("ownerName");
  const fullOtp = "notRequired";

  const handleProceed = async () => {
    try {
      if (!ownerEmail) {
        console.warn("Missing required info to verify.");
        return;
      }

      const storedEmail = localStorage.getItem("userEmail");
      const onboardComplete =
        localStorage.getItem("onboardComplete") === "true";

      // Case 1: Email mismatch → show modal
      if (storedEmail && storedEmail !== ownerEmail) {
        setShowEmailMismatchPopup(true);
        return; // stop further execution until user confirms
      }

      // Case 2: User already onboarded and same email → go to dashboard
      if (storedEmail === ownerEmail && onboardComplete) {
        navigate("/dashboard");
        return;
      }

      // Case 3: New user or onboarding not complete → verify or create, then go to /details
      const data = await verifyOrCreateUser(ownerEmail, fullOtp);

      if (data?.res1) {
        const verifyStatus = data?.res1?.data?.verifiedStatus === true;

        if (verifyStatus) {
          const userData = {
            name: data?.res?.data?.user?.name || "",
            profile:
              `${API_BASE_URL?.split("/api")[0]}${
                (data?.res?.data?.profile || "").split("public")[1] || ""
              }` || "images/camera-icon.avif",
            subscriptionDetails: {},
          };

          localStorage.setItem("userEmail", ownerEmail);
          localStorage.setItem("token", data.res?.data?.token || "");
        }

        navigate(`/details?name=${encodeURIComponent(ownerName || "")}`);
        return;
      }

      navigate(`/details?name=${encodeURIComponent(ownerName || "")}`);
    } catch (error) {
      console.error("Error during login or redirect:", error);
      navigate("/error?message=login_failed");
    }
  };

  const handlePopupConfirm = () => {
    // Clear old session
    localStorage.removeItem("onboardComplete");
    localStorage.removeItem("paymentDone");
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");

    // Redirect to onboarding/signup page
    navigate(`/signup`);
  };

  useEffect(() => {
    if (!ownerEmail || !ownerName) {
      console.warn("Missing params:", { ownerEmail, ownerName });
    }
  }, [ownerEmail, ownerName]);

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.iconWrapper}>
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.checkIcon}
          >
            <circle cx="12" cy="12" r="11" fill="#5F33E1" />
            <path
              d="M20 6L9 17L4 12"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className={styles.title}>
          Your app has been successfully connected
        </h1>

        <button onClick={handleProceed} className={styles.proceedButton}>
          Let’s Started
        </button>
      </div>

      {/* Email mismatch modal */}
      {showEmailMismatchPopup && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Email Mismatch</h2>
            <p>Please login with your HubSpot email to continue.</p>
            <button onClick={handlePopupConfirm} className={styles.modalButton}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThankYouPage;
