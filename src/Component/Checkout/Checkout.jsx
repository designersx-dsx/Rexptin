import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import styles from "./checkout.module.css";
import { API_BASE_URL } from "../../Store/apiStore";
import PopUp from "../Popup/Popup";
import CountdownPopup from "../CountDownPopup/CountdownPopup";
import { useLocation, useNavigate } from "react-router-dom";
import { Label } from "recharts";
import Select from "react-select";

// const stripePromise = loadStripe(
//   "pk_live_51RYjjKSCQQfKS3WDzVLb6c2Xk6Gdt2NaJ7pF5eWRDk345NQY1TNBOgxy5CUYCWAsWsqU1pJx8Bi56Ue7U5vg2Noe00HMCU3IXV"
// );
const stripePromise = loadStripe(
  "pk_test_51RQodQ4T6s9Z2zBzHe6xifROxlIMVsodSNxf2MnmDX3AwkI44JT3AjDuyQZEoZq9Zha69WiA8ecnXZZ2sw9iY5sP007jJUxE52"
);

function CheckoutForm({
  customerId,
  priceId,
  email,
  onSubscriptionSuccess,
  userId,
  disabled,
  agentId,
  locationPath,
  price,
  subscriptionId,
  // onPaymentConfirm
}) {
  const stripe = useStripe();
  const elements = useElements();

  // Step state (1 or 2)
  const [step, setStep] = useState(1);

  const navigate = useNavigate();

  const location = useLocation();

  const currentLocation = location.pathname;

  // Billing & company state
  const [companyName, setCompanyName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [planPrice, setPlanPrice] = useState(price);
  // Card details
  const [billingName, setBillingName] = useState("");

  // Errors
  const [errors, setErrors] = useState({});

  // Loading and messages
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [popupType, setPopupType] = useState("");
  const [popupMessage, setPopupMessage] = useState("");

  const VALID_COUNTRY_CODES = new Set([
    "AF",
    "AX",
    "AL",
    "DZ",
    "AS",
    "AD",
    "AO",
    "AI",
    "AQ",
    "AG",
    "AR",
    "AM",
    "AW",
    "AU",
    "AT",
    "AZ",
    "BS",
    "BH",
    "BD",
    "BB",
    "BY",
    "BE",
    "BZ",
    "BJ",
    "BM",
    "BT",
    "BO",
    "BQ",
    "BA",
    "BW",
    "BV",
    "BR",
    "IO",
    "BN",
    "BG",
    "BF",
    "BI",
    "KH",
    "CM",
    "CA",
    "CV",
    "KY",
    "CF",
    "TD",
    "CL",
    "CN",
    "CX",
    "CC",
    "CO",
    "KM",
    "CG",
    "CD",
    "CK",
    "CR",
    "CI",
    "HR",
    "CU",
    "CW",
    "CY",
    "CZ",
    "DK",
    "DJ",
    "DM",
    "DO",
    "EC",
    "EG",
    "SV",
    "GQ",
    "ER",
    "EE",
    "SZ",
    "ET",
    "FK",
    "FO",
    "FJ",
    "FI",
    "FR",
    "GF",
    "PF",
    "TF",
    "GA",
    "GM",
    "GE",
    "DE",
    "GH",
    "GI",
    "GR",
    "GL",
    "GD",
    "GP",
    "GU",
    "GT",
    "GG",
    "GN",
    "GW",
    "GY",
    "HT",
    "HM",
    "VA",
    "HN",
    "HK",
    "HU",
    "IS",
    "IN",
    "ID",
    "IR",
    "IQ",
    "IE",
    "IM",
    "IL",
    "IT",
    "JM",
    "JP",
    "JE",
    "JO",
    "KZ",
    "KE",
    "KI",
    "KP",
    "KR",
    "KW",
    "KG",
    "LA",
    "LV",
    "LB",
    "LS",
    "LR",
    "LY",
    "LI",
    "LT",
    "LU",
    "MO",
    "MG",
    "MW",
    "MY",
    "MV",
    "ML",
    "MT",
    "MH",
    "MQ",
    "MR",
    "MU",
    "YT",
    "MX",
    "FM",
    "MD",
    "MC",
    "MN",
    "ME",
    "MS",
    "MA",
    "MZ",
    "MM",
    "NA",
    "NR",
    "NP",
    "NL",
    "NC",
    "NZ",
    "NI",
    "NE",
    "NG",
    "NU",
    "NF",
    "MK",
    "MP",
    "NO",
    "OM",
    "PK",
    "PW",
    "PS",
    "PA",
    "PG",
    "PY",
    "PE",
    "PH",
    "PN",
    "PL",
    "PT",
    "PR",
    "QA",
    "RE",
    "RO",
    "RU",
    "RW",
    "BL",
    "SH",
    "KN",
    "LC",
    "MF",
    "PM",
    "VC",
    "WS",
    "SM",
    "ST",
    "SA",
    "SN",
    "RS",
    "SC",
    "SL",
    "SG",
    "SX",
    "SK",
    "SI",
    "SB",
    "SO",
    "ZA",
    "GS",
    "SS",
    "ES",
    "LK",
    "SD",
    "SR",
    "SJ",
    "SE",
    "CH",
    "SY",
    "TW",
    "TJ",
    "TZ",
    "TH",
    "TL",
    "TG",
    "TK",
    "TO",
    "TT",
    "TN",
    "TR",
    "TM",
    "TC",
    "TV",
    "UG",
    "UA",
    "AE",
    "GB",
    "US",
    "UM",
    "UY",
    "UZ",
    "VU",
    "VE",
    "VN",
    "VG",
    "VI",
    "WF",
    "EH",
    "YE",
    "ZM",
    "ZW",
  ]);

  const COUNTRY_OPTIONS = Array.from(VALID_COUNTRY_CODES)
    .sort()
    .map((code) => ({ value: code, label: code }));

  // Validate step 1 fields before going next
  const validateStep1 = () => {
    const newErrors = {};
    if (!addressLine1.trim())
      newErrors.addressLine1 = "Address Line 1 is required.";
    if (!city.trim()) newErrors.city = "City is required.";
    if (!state.trim()) newErrors.state = "State / Province is required.";
    if (!postalCode.trim()) newErrors.postalCode = "Postal Code is required.";
    if (!country.trim()) {
      newErrors.country = "Country is required.";
    } else if (!VALID_COUNTRY_CODES.has(country.toUpperCase())) {
      newErrors.country = "Please enter a valid 2-letter ISO country code.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    sessionStorage.removeItem("priceId");
    // Call next API here and navigate to the dashboard
    await callNextApiAndRedirect();
  };

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
          agentId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setPopupType("success");
        setPopupMessage("Agent Upgraged successfully!");
        setTimeout(() => {
          navigate("/dashboard", {
            state: { currentLocation: currentLocation },
          });
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

  // Handle subscription payment
  // const handleSubmit = async () => {
  //   const newErrors = {};
  //   if (!billingName.trim())
  //     newErrors.billingName = "Name on card is required.";
  //   if (Object.keys(newErrors).length) {
  //     setErrors(newErrors);
  //     return;
  //   }
  //   setErrors({});
  //   setMessage("");
  //   setLoading(true);

  //   if (!stripe || !elements) {
  //     setMessage("Stripe has not loaded yet.");
  //     setLoading(false);
  //     return;
  //   }

  //   const cardNumberElement = elements.getElement(CardNumberElement);

  //   const { error, paymentMethod } = await stripe.createPaymentMethod({
  //     type: "card",
  //     card: cardNumberElement,
  //     billing_details: {
  //       name: billingName,
  //       email,
  //       address: {
  //         line1: addressLine1,
  //         line2: addressLine2,
  //         city,
  //         state,
  //         postal_code: postalCode,
  //         country,
  //       },
  //     },
  //   });

  //   if (error) {
  //     setMessage(`❌ ${error.message}`);
  //     setPopupType("failed");
  //     setPopupMessage(error.message);
  //     setLoading(false);
  //     return;
  //   }

  //   try {
  //     let data;
  //     // console.log("subscriptionId", subscriptionId);
  //     if (subscriptionId) {
  //       console.log("upgrade runn");
  //       const res = await fetch(`${API_BASE_URL}/upgrade-customer-stripe`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           customerId,
  //           priceId,
  //           paymentMethodId: paymentMethod.id,
  //           userId,
  //           email,
  //           promotionCode: promoCodeSend,
  //           companyName,
  //           gstNumber,
  //           billingAddress: {
  //             line1: addressLine1,
  //             line2: addressLine2,
  //             city,
  //             state,
  //             postalCode,
  //             country,
  //           },
  //           subscriptionId: subscriptionId,
  //           // promotionCode:"FREE99"
  //         }),
  //       });
  //       data = await res.json();
  //     } else {
  //       console.log("create  runn");
  //       const res = await fetch(`${API_BASE_URL}/subscribe`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           customerId,
  //           priceId,
  //           paymentMethodId: paymentMethod.id,
  //           userId,
  //           email,
  //           promotionCode: promoCodeSend,
  //           companyName,
  //           gstNumber,
  //           billingAddress: {
  //             line1: addressLine1,
  //             line2: addressLine2,
  //             city,
  //             state,
  //             postalCode,
  //             country,
  //           },
  //           // promotionCode:"FREE99"
  //         }),
  //       });
  //       data = await res.json();
  //     }

  //     if (data.error) {
  //       setMessage(`❌ ${data.error}`);
  //       setPopupType("failed");
  //       setPopupMessage(data.error);
  //       setLoading(false);
  //       return;
  //     }

  //     // ✅ Handle client secret (SCA / 3DS confirmation)
  //     if (data.clientSecret) {
  //       const { error: confirmError, paymentIntent } =
  //         await stripe.confirmCardPayment(data.clientSecret);

  //       if (confirmError) {
  //         setMessage(`❌ ${confirmError.message}`);
  //         setPopupType("failed");
  //         setPopupMessage(confirmError.message);
  //         setLoading(false);
  //         return;
  //       }
  //       if (paymentIntent?.status === "succeeded" && subscriptionId) {
  //         // onPaymentConfirm();
  //         try {
  //           const res = await fetch(`${API_BASE_URL}/cancel-subscription`, {
  //             method: "POST",
  //             headers: { "Content-Type": "application/json" },
  //             body: JSON.stringify({ subscriptionId }),
  //           });
  //           const result = await res.json();

  //           if (!res.ok) {
  //             console.error(
  //               "❌ Failed to cancel subscription:",
  //               result.error || result.message
  //             );
  //           }
  //         } catch (error) {
  //           console.error("❌ Network error canceling subscription:", error);
  //           // Optional: show UI feedback
  //         }
  //       }

  //       if (
  //         locationPath === "/update" &&
  //         agentId !== undefined &&
  //         agentId !== null
  //       ) {
  //         setShowCountdownPopup(true);
  //       } else {
  //         // onPaymentConfirm();
  //         setMessage("Subscription successful!");
  //         setPopupType("success");
  //         setPopupMessage("Subscription successful!");
  //       }
  //     } else {
  //       // Show the countdown popup if locationPath is "/dashboard" and agentId is neither undefined nor null
  //       if (
  //         locationPath === "/dashboard" &&
  //         agentId !== undefined &&
  //         agentId !== null
  //       ) {
  //         setShowCountdownPopup(true);
  //       } else {
  //         setMessage("Subscription successful!");
  //         setPopupType("success");
  //         setPopupMessage("Subscription successful!");
  //       }
  //     }
  //   } catch (err) {
  //     setMessage("❌ Failed to subscribe.");
  //     setPopupType("failed");
  //     setPopupMessage("Failed to subscribe.");
  //   }

  //   setLoading(false);
  // };

  // Handle with Setup Intent

  //   const handleSubmit = async () => {
  //     const newErrors = {};
  //     if (!billingName.trim())
  //       newErrors.billingName = "Name on card is required.";
  //     if (Object.keys(newErrors).length) {
  //       setErrors(newErrors);
  //       return;
  //     }
  //     setErrors({});
  //     setMessage("");
  //     setLoading(true);

  //     if (!stripe || !elements) {
  //       setMessage("Stripe has not loaded yet.");
  //       setLoading(false);
  //       return;
  //     }

//   const handleSubmit = async () => {
//     const newErrors = {};
//     if (!billingName.trim())
//       newErrors.billingName = "Name on card is required.";
//     if (Object.keys(newErrors).length) {
//       setErrors(newErrors);
//       return;
//     }
//     setErrors({});
//     setMessage("");
//     setLoading(true);

//     if (!stripe || !elements) {
//       setMessage("Stripe has not loaded yet.");
//       setLoading(false);
//       return;
//     }

//     const cardNumberElement = elements.getElement(CardNumberElement);

//     // 1. Create SetupIntent from backend
// const setupIntentRes = await fetch(`${API_BASE_URL}/create-setup-intent`, {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ customerId }),
// });
// const { clientSecret: setupIntentClientSecret, error: setupError } = await setupIntentRes.json();
// console.log("setupIntentRes",setupIntentRes)

// if (setupError) {
//   setMessage(`❌ ${setupError}`);
//   setPopupType("failed");
//   setPopupMessage(setupError);
//   setLoading(false);
//   return;
// }

// // 2. Confirm SetupIntent (RBI compliant)
// const { error: confirmSetupError, setupIntent } = await stripe.confirmCardSetup(setupIntentClientSecret, {
//   payment_method: {
//     card: cardNumberElement,
//     billing_details: {
//       name: billingName,
//       email,
//       address: {
//         line1: addressLine1,
//         line2: addressLine2,
//         city,
//         state,
//         postal_code: postalCode,
//         country,
//       },
//     },
//   },
// });

// console.log("confirmSetupError",confirmSetupError)

// if (confirmSetupError) {
//   setMessage(`❌ ${confirmSetupError.message}`);
//   setPopupType("failed");
//   setPopupMessage(confirmSetupError.message);
//   setLoading(false);
//   return;
// }

// console.log("setupIntent",setupIntent)

// const paymentMethodId = setupIntent.payment_method;


//     try {
//       let data;
//       // console.log("subscriptionId", subscriptionId);
//       if (subscriptionId) {
//         console.log("upgrade runn");
//         const res = await fetch(`${API_BASE_URL}/upgrade-customer-stripe`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             customerId,
//             priceId,
//             paymentMethodId: paymentMethodId,
//             userId,
//             email,
//             promotionCode: promoCodeSend,
//             companyName,
//             gstNumber,
//             billingAddress: {
//               line1: addressLine1,
//               line2: addressLine2,
//               city,
//               state,
//               postalCode,
//               country,
//             },
//             subscriptionId: subscriptionId,
//             // promotionCode:"FREE99"
//           }),
//         });
//         data = await res.json();
//       } else {
//         console.log("create  runn");
//         const res = await fetch(`${API_BASE_URL}/subscribe`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             customerId,
//             priceId,
//             paymentMethodId: paymentMethodId,
//             userId,
//             email,
//             promotionCode: promoCodeSend,
//             companyName,
//             gstNumber,
//             billingAddress: {
//               line1: addressLine1,
//               line2: addressLine2,
//               city,
//               state,
//               postalCode,
//               country,
//             },
//             // promotionCode:"FREE99"
//           }),
//         });
//         data = await res.json();
//       }

//       if (data.error) {
//         setMessage(`❌ ${data.error}`);
//         setPopupType("failed");
//         setPopupMessage(data.error);
//         setLoading(false);
//         return;
//       }

//       // ✅ Handle client secret (SCA / 3DS confirmation)
//       if (data.clientSecret) {
//         const { error: confirmError, paymentIntent } =
//           await stripe.confirmCardPayment(data.clientSecret);

//         if (confirmError) {
//           setMessage(`❌ ${confirmError.message}`);
//           setPopupType("failed");
//           setPopupMessage(confirmError.message);
//           setLoading(false);
//           return;
//         }
//         if (paymentIntent?.status === "succeeded" && subscriptionId) {
//           // onPaymentConfirm();
//           try {
//             const res = await fetch(`${API_BASE_URL}/cancel-subscription`, {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({ subscriptionId }),
//             });
//             const result = await res.json();

//             if (!res.ok) {
//               console.error(
//                 "❌ Failed to cancel subscription:",
//                 result.error || result.message
//               );
//             }
//           } catch (error) {
//             console.error("❌ Network error canceling subscription:", error);
//             // Optional: show UI feedback
//           }
//         }

//         if (
//           locationPath === "/update" &&
//           agentId !== undefined &&
//           agentId !== null
//         ) {
//           setShowCountdownPopup(true);
//         } else {
//           // onPaymentConfirm();
//           setMessage("Subscription successful!");
//           setPopupType("success");
//           setPopupMessage("Subscription successful!");
//         }
//       } else {
//         // Show the countdown popup if locationPath is "/dashboard" and agentId is neither undefined nor null
//         if (
//           locationPath === "/dashboard" &&
//           agentId !== undefined &&
//           agentId !== null
//         ) {
//           setShowCountdownPopup(true);
//         } else {
//           setMessage("Subscription successful!");
//           setPopupType("success");
//           setPopupMessage("Subscription successful!");
//         }
//       }
//     } catch (err) {
//       setMessage("❌ Failed to subscribe.");
//       setPopupType("failed");
//       setPopupMessage("Failed to subscribe.");
//     }

//     setLoading(false);
//   };

// with Checkout

const handleSubmit = async () => {
  setLoading(true);
  setMessage("");
  setErrors({});

  // Optional: Validate required fields (like billingName, email, etc.)
  // const newErrors = {};
  // if (!billingName.trim()) newErrors.billingName = "Name on card is required.";
  // if (Object.keys(newErrors).length) {
  //   setErrors(newErrors);
  //   setLoading(false);
  //   return;
  // }
  let url = ''
  if(subscriptionId || locationPath==="/update"){
   
    url = "http://localhost:3000/thankyou/update"
  }
  else{
     url ="http://localhost:3000/thankyou/create"
  }

  try {
    const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        priceId,
        promotionCode: promoCodeSend,
        userId,
        companyName,
        gstNumber,
        url : url
      }),
    });


  //     const cardNumberElement = elements.getElement(CardNumberElement);

  //     // 1. Create SetupIntent from backend
  // const setupIntentRes = await fetch(`${API_BASE_URL}/create-setup-intent`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ customerId }),
  // });
  // const { clientSecret: setupIntentClientSecret, error: setupError } = await setupIntentRes.json();
  // console.log("setupIntentRes",setupIntentRes)

  // if (setupError) {
  //   setMessage(`❌ ${setupError}`);
  //   setPopupType("failed");
  //   setPopupMessage(setupError);
  //   setLoading(false);
  //   return;
  // }

  // // 2. Confirm SetupIntent (RBI compliant)
  // const { error: confirmSetupError, setupIntent } = await stripe.confirmCardSetup(setupIntentClientSecret, {
  //   payment_method: {
  //     card: cardNumberElement,
  //     billing_details: {
  //       name: billingName,
  //       email,
  //       address: {
  //         line1: addressLine1,
  //         line2: addressLine2,
  //         city,
  //         state,
  //         postal_code: postalCode,
  //         country,
  //       },
  //     },
  //   },
  // });

  // console.log("confirmSetupError",confirmSetupError)

  // if (confirmSetupError) {
  //   setMessage(`❌ ${confirmSetupError.message}`);
  //   setPopupType("failed");
  //   setPopupMessage(confirmSetupError.message);
  //   setLoading(false);
  //   return;
  // }

  // console.log("setupIntent",setupIntent)

  // const paymentMethodId = setupIntent.payment_method;

  //     try {
  //       let data;
  //       // console.log("subscriptionId", subscriptionId);
  //       if (subscriptionId) {
  //         console.log("upgrade runn");
  //         const res = await fetch(`${API_BASE_URL}/upgrade-customer-stripe`, {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             customerId,
  //             priceId,
  //             paymentMethodId: paymentMethodId,
  //             userId,
  //             email,
  //             promotionCode: promoCodeSend,
  //             companyName,
  //             gstNumber,
  //             billingAddress: {
  //               line1: addressLine1,
  //               line2: addressLine2,
  //               city,
  //               state,
  //               postalCode,
  //               country,
  //             },
  //             subscriptionId: subscriptionId,
  //             // promotionCode:"FREE99"
  //           }),
  //         });
  //         data = await res.json();
  //       } else {
  //         console.log("create  runn");
  //         const res = await fetch(`${API_BASE_URL}/subscribe`, {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({
  //             customerId,
  //             priceId,
  //             paymentMethodId: paymentMethodId,
  //             userId,
  //             email,
  //             promotionCode: promoCodeSend,
  //             companyName,
  //             gstNumber,
  //             billingAddress: {
  //               line1: addressLine1,
  //               line2: addressLine2,
  //               city,
  //               state,
  //               postalCode,
  //               country,
  //             },
  //             // promotionCode:"FREE99"
  //           }),
  //         });
  //         data = await res.json();
  //       }

  //       if (data.error) {
  //         setMessage(`❌ ${data.error}`);
  //         setPopupType("failed");
  //         setPopupMessage(data.error);
  //         setLoading(false);
  //         return;
  //       }

  //       // ✅ Handle client secret (SCA / 3DS confirmation)
  //       if (data.clientSecret) {
  //         const { error: confirmError, paymentIntent } =
  //           await stripe.confirmCardPayment(data.clientSecret);

  //         if (confirmError) {
  //           setMessage(`❌ ${confirmError.message}`);
  //           setPopupType("failed");
  //           setPopupMessage(confirmError.message);
  //           setLoading(false);
  //           return;
  //         }
  //         if (paymentIntent?.status === "succeeded" && subscriptionId) {
  //           // onPaymentConfirm();
  //           try {
  //             const res = await fetch(`${API_BASE_URL}/cancel-subscription`, {
  //               method: "POST",
  //               headers: { "Content-Type": "application/json" },
  //               body: JSON.stringify({ subscriptionId }),
  //             });
  //             const result = await res.json();

  //             if (!res.ok) {
  //               console.error(
  //                 "❌ Failed to cancel subscription:",
  //                 result.error || result.message
  //               );
  //             }
  //           } catch (error) {
  //             console.error("❌ Network error canceling subscription:", error);
  //             // Optional: show UI feedback
  //           }
  //         }

  //         if (
  //           locationPath === "/update" &&
  //           agentId !== undefined &&
  //           agentId !== null
  //         ) {
  //           setShowCountdownPopup(true);
  //         } else {
  //           // onPaymentConfirm();
  //           setMessage("Subscription successful!");
  //           setPopupType("success");
  //           setPopupMessage("Subscription successful!");
  //         }
  //       } else {
  //         // Show the countdown popup if locationPath is "/dashboard" and agentId is neither undefined nor null
  //         if (
  //           locationPath === "/dashboard" &&
  //           agentId !== undefined &&
  //           agentId !== null
  //         ) {
  //           setShowCountdownPopup(true);
  //         } else {
  //           setMessage("Subscription successful!");
  //           setPopupType("success");
  //           setPopupMessage("Subscription successful!");
  //         }
  //       }
  //     } catch (err) {
  //       setMessage("❌ Failed to subscribe.");
  //       setPopupType("failed");
  //       setPopupMessage("Failed to subscribe.");
  //     }

  //     setLoading(false);
  //   };

  // with Checkout

  const handleSubmit = async () => {
    console.log("run");
    setLoading(true);
    setMessage("");
    setErrors({});

    // Optional: Validate required fields (like billingName, email, etc.)
    const newErrors = {};
    // if (!billingName.trim()) newErrors.billingName = "Name on card is required.";
    // if (Object.keys(newErrors).length) {
    //   setErrors(newErrors);
    //   setLoading(false);
    //   return;
    // }
    let url = "";
    if (subscriptionId || locationPath === "/update") {
  const queryParams = new URLSearchParams();

  if (subscriptionId) queryParams.append("subscriptionId", subscriptionId);
  if (agentId) queryParams.append("agentId", agentId);
  if (userId) queryParams.append("userId", userId);

  url = `http://localhost:3000/thankyou/update?${queryParams.toString()}`;

    } else {
      url = "http://localhost:3000/thankyou/create";
    }

    try {
      const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          priceId,
          promotionCode: promoCodeSend,
          userId,
          companyName,
          gstNumber,
          url: url,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setMessage(`❌ ${data.error}`);
        setPopupType("failed");
        setPopupMessage(data.error);
      } else if (data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      console.error("Checkout session error:", err);
      setMessage("❌ Failed to initiate Stripe Checkout.");
      setPopupType("failed");
      setPopupMessage("Failed to initiate Stripe Checkout.");
    }

    setLoading(false);
  };

  const [promoCode, setPromoCode] = useState("");
  const [promoCodeSend, setpromoCodeSend] = useState("");

  const [promoError, setPromoError] = useState("");
  const [discount, setDiscount] = useState(null);

  const handleApplyPromo = async (code) => {
    setpromoCodeSend(code);
    const res = await fetch(`${API_BASE_URL}/checkPromtoCode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    if (res.ok) {
      const discountValue = data.discount;
      const finalPrice = price - (discountValue / 100) * price;

      setDiscount(discountValue);
      setPlanPrice(finalPrice.toFixed(2)); // Optional: round to 2 decimal places
      setPromoError("");
    } else {
      setPromoError(data.error);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setpromoCodeSend("");
    setPromoError("");
    setDiscount(null);
    setPlanPrice(price); // reset to original
  };

  return (
    <div className={styles.checkoutForm}>
      {/* {step === 1 && (
        <div className={styles.checkoutFormMain}>
          <h3>Billing Address & Company Details</h3>

          <label>Address Line 1 *</label>
          <input
            type="text"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            className={styles.input}
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
            className={styles.input}
          />

          <label>City *</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={styles.input}
            required
          />
          {errors.city && <p className={styles.errorMsg}>{errors.city}</p>}

          <label>State / Province *</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className={styles.input}
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
          <Select
            className={styles.reactSelect}
            classNamePrefix="react-select"
            options={COUNTRY_OPTIONS}
            value={COUNTRY_OPTIONS.find((opt) => opt.value === country)}
            onChange={(selected) => setCountry(selected.value)}
            placeholder="Select Country"
            isSearchable
            menuPlacement="top"
          />
          {errors.country && (
            <p className={styles.errorMsg}>{errors.country}</p>
          )}

          <button
            type="button"
            onClick={handleNext}
            className={styles.button}
            style={{ marginTop: "1rem" }}
          >
            Next
          </button>
        </div>
      )} */}

      {step === 1 && (
        <>
          {/* <h3>Card Details</h3>

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

          <label>Card Number</label>
          <div className={styles.cardBox}>
            <CardNumberElement className={styles.cardInput} />
          </div>

          <label>Expiry Date (MM/YY)</label>
          <div className={styles.cardBox}>
            <CardExpiryElement className={styles.cardInput} />
          </div>

          <label>CVC</label>
          <div className={styles.cardBox}>
            <CardCvcElement className={styles.cardInput} />
          </div>

          <label> Have a Coupen Code ?</label>
          <div className={styles.Applybox}>
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className={styles.input}
              placeholder="Enter Promo Code"
              disabled={!!discount}
            />

            <button
              className={styles.applyButton2}
              onClick={() => handleApplyPromo(promoCode)}
            >
              Apply
            </button>
          </div>

          {promoError && <p style={{ color: "red" }}>{promoError}</p>}
          {discount && (
            <div className={styles.promoAppliedBox}>
              <span>✅ Promo applied: {discount}% off</span>
              <button
                type="button"
                onClick={handleRemovePromo}
                className={styles.removePromoBtn}
                title="Remove promo code"
              >
                ❌
              </button>
            </div>
          )} */}

          <button
            type="button"
            onClick={handleSubmit}
            className={styles.button}
            style={{ marginTop: "1rem" }}
            disabled={loading}
          >
            {loading ? "Processing..." : `Pay $${planPrice}`}
          </button>
        </>
      )}

      <PopUp
        type={popupType}
        message={popupMessage}
        onClose={() => {
          setPopupType("");
          setPopupMessage("");
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

export default function Checkout(props) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
