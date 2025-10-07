import axios from "axios";
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_BASE_URL, verifyOrCreateUser } from "../../Store/apiStore";
import styles from "./ThankYouPage.module.css";

const ThankYouPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const ownerEmail = searchParams.get("ownerEmail");
  const ownerName = searchParams.get("ownerName");
  const fullOtp = "notRequired";

  // const handleProceed = async () => {
  //   try {
  //     if (!ownerEmail) {
  //       console.warn("Missing required info to verify.");
  //       return;
  //     }
  //     const data = await verifyOrCreateUser(ownerEmail, fullOtp);

  //     if (data?.res1) {
  //       const verifyStatus = data?.res1?.data?.verifiedStatus === true;

  //       if (verifyStatus === true) {
  //         const userData = {
  //           name: data?.res?.data?.user?.name || "",
  //           profile:
  //             `${API_BASE_URL?.split("/api")[0]}${
  //               (data?.res?.data?.profile || "").split("public")[1] || ""
  //             }` || "images/camera-icon.avif",
  //           subscriptionDetails: {},
  //         };

  //         localStorage.setItem("onboardComplete", "true");
  //         localStorage.setItem("token", data.res?.data?.token);
  //         localStorage.setItem("onboardComplete", true);
  //         localStorage.setItem("paymentDone", true);
  //       }

  //       navigate(`/details?name=${encodeURIComponent(ownerName || "")}`);
  //       return;
  //     }
  //     navigate(`/details?name=${encodeURIComponent(ownerName || "")}`);
  //   } catch (error) {
  //     console.error("Error during login or redirect:", error);
  //     navigate("/error?message=login_failed");
  //   }
  // };

  const handleProceed = async () => {
    try {
      if (!ownerEmail) {
        console.warn("Missing required info to verify.");
        return;
      }

      const storedEmail = localStorage.getItem("userEmail");
      const onboardComplete =
        localStorage.getItem("onboardComplete") === "true";

      // Case 1: User already onboarded and same email → go to dashboard
      if (storedEmail === ownerEmail && onboardComplete) {
        navigate("/dashboard");
        return;
      }

      // Case 2: New user or different email → verify or create, then go to /details
      const data = await verifyOrCreateUser(ownerEmail, fullOtp);

      if (data?.res1) {
        const verifyStatus = data?.res1?.data?.verifiedStatus === true;

        if (verifyStatus) {
          // Prepare userData for app usage
          const userData = {
            name: data?.res?.data?.user?.name || "",
            profile:
              `${API_BASE_URL?.split("/api")[0]}${
                (data?.res?.data?.profile || "").split("public")[1] || ""
              }` || "images/camera-icon.avif",
            subscriptionDetails: {},
          };

          // Save email and token, but do NOT set onboardComplete yet
          localStorage.setItem("userEmail", ownerEmail);
          localStorage.setItem("token", data.res?.data?.token || "");

          // You can also save userData if needed for app-wide use
          // localStorage.setItem("userData", JSON.stringify(userData));
        }

        // Send user to onboarding/details page
        navigate(`/details?name=${encodeURIComponent(ownerName || "")}`);
        return;
      }

      // Fallback
      navigate(`/details?name=${encodeURIComponent(ownerName || "")}`);
    } catch (error) {
      console.error("Error during login or redirect:", error);
      navigate("/error?message=login_failed");
    }
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
          {/* Updated SVG: Filled circle with white checkmark inside */}
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
    </div>
  );
};

export default ThankYouPage;
