import React, { useEffect, useState } from "react";
import styles from "./Thankyou2.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import Loader2 from "../Loader2/Loader2";
import { API_BASE_URL, verifyEmailOTP, verifyOrCreateUser } from "../../Store/apiStore";
import axios from "axios";
import useUser from "../../Store/Context/UserContext";

function Thankyou2() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); 
  const [isLoadingRequest, setIsLoadingRequest] = useState(false); 
  const [emails, setEmail] = useState()
  const [hasUserCreated, setHasUserCreated] = useState(false);
  const sessionId = new URLSearchParams(location.search).get("session_id");
  const [subcriptionId, setsubcriptionId] = useState();
  const [setSubscriptionDetails, setsetSubscriptionDetails] = useState();
  const [data, setData] = useState()
  const [isSubscriptionDetailsLoading, setIsSubscriptionDetailsLoading] =
    useState(true); 

  const { user, setUser } = useUser();

  useEffect(() => {
    if (!sessionId) return;

    const fetchSessionDetails = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/session-details`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ session_id: sessionId }),
        });
        const data = await res.json();

        // if (data.success && data.session) {
        setsubcriptionId(data.session?.subscription?.id);
        setSessionData(data.session);
        // }
      } catch (err) {
        console.error("Failed to fetch session info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  useEffect(() => {
    if (!subcriptionId) return;

    const fetchSubscriptionDetails = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/subscription-details-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription_id: subcriptionId }),
        });

        const data = await res.json();

        if (!data?.error) {
          setsetSubscriptionDetails(data);
          setIsSubscriptionDetailsLoading(false);
        } else {
          console.warn("No additional subscription data found.");
        }
      } catch (err) {
        console.error("Failed to fetch subscription details:", err);
      } finally {
        setIsSubscriptionDetailsLoading(false); 
        if (!isSubscriptionDetailsLoading && !loading) {
          setLoading(false);
        }
      }
    };

    fetchSubscriptionDetails();
  }, [subcriptionId, sessionId]);

  const formatCurrency = (amount, currency) => {
    if (!amount || !currency) return "N/A";

    // Convert the currency code to uppercase
    const formattedCurrency = currency.toUpperCase();

    const currencySymbols = {
      USD: "$",
      INR: "₹",
      EUR: "€",
      GBP: "£",
      AUD: "A$",
      CAD: "C$",
    };

    // Get the currency symbol based on the formatted currency code
    const symbol = currencySymbols[formattedCurrency] || "";

    return ` ${formattedCurrency} ${symbol}${amount.toLocaleString()}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatISODate = (iso) => {
    if (!iso) return "N/A";
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const customer = sessionData?.customer_details;
  const subscription = sessionData?.subscription;
  const plan = subscription?.items?.data?.[0]?.plan;
  const price = plan?.amount;
  const currency = plan?.currency;
  const createUser = async () => {
    try {
      // Retrieve email and customerId from session data
      const email = sessionData?.customer_details?.email;
      setEmail(email); // Storing the email in state if necessary

      const customerId = sessionData?.customer?.id;
      const fullOtp = "notRequired"; // since you're skipping OTP

      // Make the API call to verify or create the user
      const response = await verifyOrCreateUser(email, fullOtp, customerId);

      const data = await response;
      setData(data); // Store the data in state if necessary

      // Check if the response status is 200 (success)
      if (data?.res?.status === 200) {
        const userId = data?.res?.data?.user?.id;

        // Store necessary data in localStorage
        localStorage.setItem("token", data.res?.data?.token);
        localStorage.setItem("onboardComplete", false);
        localStorage.setItem("paymentDone", true);
        localStorage.setItem("subcriptionIdUrl", subcriptionId);

        sessionStorage.clear(); // Clear sessionStorage once the user is created

        // Attach the user to the subscription
        const attachUserResponse = await fetch(
          `${API_BASE_URL}/pay-as-you-go-userID-attach`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",

            },
            body: JSON.stringify({
              subscriptionId: subcriptionId,
              userId: userId, // Assuming customerId is the userId here
            }),
          }
        );
        const attachUserData = await attachUserResponse.json();

        if (attachUserData.success) {
          console.log(`userId successfully attached to Subscription ${subcriptionId}`);
        } else {
          console.error("Failed to attach userId to subscription:", attachUserData.message);
          // alert("Failed to attach userId to subscription.");
        }

        // Mark the user as created to prevent future API calls
        setHasUserCreated(true);
      } else {
        console.error("Verification failed:", data.data?.error);
        // alert(data.error); // Show the error message if verification failed
      }
    } catch (err) {
      // Catch and log any error that occurs during the process
      console.error("Error during user creation:", err);
      // alert("Something went wrong while creating the user. Please try again.");
    }
  };

  useEffect(() => {
    // Only call createUser if sessionData is available and user creation hasn't been done already
    if (sessionData && !hasUserCreated) {
      createUser();
    }
  }, [sessionData, hasUserCreated]);
  const handleClick = async () => {
    try {
      // Disable the button and show loading
      setIsButtonDisabled(true);
      setIsLoadingRequest(true); // Start loading
      // These values should ideally come from the session or URL
      const email = sessionData?.customer_details?.email;
      const customerId = sessionData?.customer?.id;
      const fullOtp = "notRequired"; // since you're skipping OTP

      if (!email || !customerId) {
        console.warn("Missing required info to verify.");
        return;
      }
      if (data?.res1) {
        const verifyStatus = data?.res1.data.verifiedStatus;
        if (verifyStatus === true) {
          const userData = {
            name: data.res?.data?.user?.name || "",
            profile:
              `${API_BASE_URL?.split("/api")[0]}${data.res?.data?.profile?.split("public")[1]
              }` || "images/camera-icon.avif",
            subscriptionDetails: {},
          };

          setUser(userData);
          localStorage.setItem("onboardComplete", "true");
        }
        navigate(verifyStatus ? "/steps" : "/details", { replace: true });
      }



    } catch (err) {
      console.error("Error during OTP verification:", err);
      // alert("Something went wrong while verifying.");
    } finally {
      // Re-enable the button and hide loading
      setIsButtonDisabled(false);
      setIsLoadingRequest(false); // End loading
    }
  };
  useEffect(() => {
    if (loading || isSubscriptionDetailsLoading) return;
    if (!sessionData || !subcriptionId) return;

      window.gtag("event", "conversion", {
        send_to: "AW-17437749926/M6gmCJzi-v8aEKbl-_pA",
        value: Number(setSubscriptionDetails.planAmount || 1.0),
        currency: (setSubscriptionDetails.currency || "USD").toUpperCase(),
        transaction_id:
          setSubscriptionDetails.subscriptionId ||
          `null`, // unique id to prevent double counting
      });

  }, [setSubscriptionDetails])

  // If the page is still loading, show a loader
  if (loading || isSubscriptionDetailsLoading) {
    return <Loader2 />; // Or any custom loading component you want to show
  }
  return (
    <>
      {subcriptionId ? (
        <div className={styles.container}>
          <div className={styles.Logo}>
            <img src="/svg/Rexpt-Logo.svg" alt="Rexpt-Logo" />
          </div>

          <div className={styles.ThankyouMsg}>
            <div className={styles.title}>Thanks!</div>
            <div className={styles.subtitle}>for your Purchase</div>
            <p className={styles.description}>
              Your payment was successful. We’ve sent you a confirmation email
              with all the details you need.
            </p>
          </div>

          {loading ? (
            <Loader2 />
          ) : (
            <div className={styles.infoBox}>
              <p>Below is some Quick Info for your Reference:</p>

              <div className={styles.row}>
                <span>Name:</span>
                <div className={styles.Right50}>{customer?.name || "N/A"}</div>
              </div>

              <div className={styles.row}>
                <span>Email:</span>
                <div className={styles.Right50}>{customer?.email || "N/A"}</div>
              </div>

              <div className={styles.row}>
                <span>Price & Frequency:</span>
                <div className={styles.Right50}>
                  {formatCurrency(
                    setSubscriptionDetails?.metadata?.original_plan_amount,
                    setSubscriptionDetails?.currency
                  )}{" "}
                  / {plan?.interval || "N/A"}
                </div>
              </div>

              <div className={styles.row}>
                <span>Billed Today:</span>
                <div className={styles.Right50}>
                  {setSubscriptionDetails ? (
                    <>
                      {/* Format the currency for the price */}
                      {formatCurrency(
                        setSubscriptionDetails?.planAmount, // This should be the amount billed today
                        setSubscriptionDetails?.currency // Use the correct currency from the subscription
                      )}{" "}
                      on {/* Format the date for the current period start */}
                      {new Date(
                        setSubscriptionDetails?.currentPeriodStart
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </>
                  ) : (
                    // Fallback values when subscription details are not available
                    "$5,688.60 on July 12, 2025"
                  )}
                </div>
              </div>

              {/* <div className={styles.row}>
            <span>Status:</span>
            <div className={styles.Right50}>
              {subscription?.status || "N/A"}
            </div>
          </div>

          <div className={styles.row}>
            <span>Start Date:</span>
            <div className={styles.Right50}>
              {formatDate(subscription?.start_date)}
            </div>
          </div> */}

              <div className={styles.row}>
                <span>Next Billing:</span>
                <div className={styles.Right50}>
                  {formatISODate(setSubscriptionDetails?.nextRenewalDate)}
                </div>
              </div>

              {setSubscriptionDetails?.invoiceUrl && (
                <div className={styles.row}>
                  <span>Invoice:</span>
                  <div className={styles.Right50}>
                    <a
                      href={setSubscriptionDetails?.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.downloadButton}
                      style={{ color: "purple", textDecoration: "none" }}
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}

              <div className={styles.ButtonTakeME}>
                <button
                  onClick={handleClick}
                  className={styles.dashboardBtn}
                  disabled={isButtonDisabled} // Disable button when loading
                >
                  {isLoadingRequest
                    ? "Redirecting..."
                    : "Take me to Agent Creation"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Loader2 />
      )}
    </>
  );
}

export default Thankyou2;
