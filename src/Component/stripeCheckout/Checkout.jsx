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
}) {
  const stripe = useStripe();
  const elements = useElements();

  // Step state (1 or 2)
  const [step, setStep] = useState(1);

  // Billing & company state
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

  const VALID_COUNTRY_CODES = new Set([
  "AF","AX","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ",
  "BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR",
  "IO","BN","BG","BF","BI","KH","CM","CA","CV","KY","CF","TD","CL","CN","CX","CC",
  "CO","KM","CG","CD","CK","CR","CI","HR","CU","CW","CY","CZ","DK","DJ","DM","DO",
  "EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF",
  "GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY",
  "HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM",
  "JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY",
  "LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX",
  "FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI",
  "NE","NG","NU","NF","MK","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH",
  "PN","PL","PT","PR","QA","RE","RO","RU","RW","BL","SH","KN","LC","MF","PM","VC",
  "WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS",
  "SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK",
  "TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","US","UM","UY","UZ","VU",
  "VE","VN","VG","VI","WF","EH","YE","ZM","ZW"
]);

  // Validate step 1 fields before going next
  const validateStep1 = () => {
  const newErrors = {};
  if (!addressLine1.trim()) newErrors.addressLine1 = "Address Line 1 is required.";
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

  // Handle subscription payment
  const handleSubmit = async () => {
    const newErrors = {};
    if (!billingName.trim()) newErrors.billingName = "Name on card is required.";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setMessage("");
    setLoading(true);

    if (!stripe || !elements) {
      setMessage("Stripe has not loaded yet.");
      setLoading(false);
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardNumberElement,
      billing_details: {
        name: billingName,
        email,
        address: {
          line1: addressLine1,
          line2: addressLine2,
          city,
          state,
          postal_code: postalCode,
          country,
        },
      },
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
      setPopupType("failed");
      setPopupMessage(error.message);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          priceId,
          paymentMethodId: paymentMethod.id,
          userId,
          email,
          companyName,
          gstNumber,
          billingAddress: {
            line1: addressLine1,
            line2: addressLine2,
            city,
            state,
            postalCode,
            country,
          },
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessage(`❌ ${data.error}`);
        setPopupType("failed");
        setPopupMessage(data.error);
      } else {
        setMessage("✅ Subscription successful!");
        setPopupType("success");
        setPopupMessage("Subscription successful!");
      }
    } catch (err) {
      setMessage("❌ Failed to subscribe.");
      setPopupType("failed");
      setPopupMessage("Failed to subscribe.");
    }

    setLoading(false);
  };

  return (
    <div className={styles.checkoutForm}>
      {step === 1 && (
        <>
          <h3>Billing Address & Company Details</h3>

          <label>Address Line 1 *</label>
          <input
            type="text"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            className={styles.input}
            required
          />
          {errors.addressLine1 && <p className={styles.errorMsg}>{errors.addressLine1}</p>}

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
          {errors.postalCode && <p className={styles.errorMsg}>{errors.postalCode}</p>}

          <label>Country *</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={styles.input}
            required
            placeholder="ISO country code, e.g. US"
          />
          {errors.country && <p className={styles.errorMsg}>{errors.country}</p>}

          <label>Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={styles.input}
          />

          <label>GST Number</label>
          <input
            type="text"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value)}
            className={styles.input}
          />

          <button
            type="button"
            onClick={handleNext}
            className={styles.button}
            style={{ marginTop: "1rem" }}
          >
            Next
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h3>Card Details</h3>

          <label>Name on Card *</label>
          <input
            type="text"
            value={billingName}
            onChange={(e) => setBillingName(e.target.value)}
            className={styles.input}
            required
          />
          {errors.billingName && <p className={styles.errorMsg}>{errors.billingName}</p>}

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

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !stripe || disabled}
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
          // if (popupType === "success") onSubscriptionSuccess?.();
        }}
      />

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