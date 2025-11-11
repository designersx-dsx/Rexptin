import React, { useState, useEffect } from "react";
import styles from "../Details/Details.module.css";
import { useNavigate, useSearchParams , useLocation} from "react-router-dom";
import PopUp from "../Popup/Popup";
import axios from "axios";
import { API_BASE_URL, sendEmailToOwner } from "../../Store/apiStore";
import decodeToken from "../../lib/decodeToken";
import Loader from "../Loader/Loader";
import useUser from "../../Store/Context/UserContext";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useRef } from "react";
import AnimatedButton from "../AnimatedButton/AnimatedButton";
const Details = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [startExit, setStartExit] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [phoneSubmitted, setPhoneSubmitted] = useState(false);
  const token = localStorage.getItem("token");
  const decodeTokenData = decodeToken(token);
  const userId = decodeTokenData?.id;
  const { user, setUser } = useUser();
  const [country, setCountry] = useState("us");
  const referralCode = sessionStorage.getItem("referredBy") || "";
  const referredByName = sessionStorage.getItem("referredByName") || "";
  const [userDetails , setUserDetails] = useState()
  const phoneInputRef = useRef(null);
    const location = useLocation();
 
  const handleFlagClick = () => {
    const container = phoneInputRef.current;
    if (container) {
      container.classList.add("fullscreenCountryDropdown");
    }

    // Optionally close it on outside click
    const handleOutsideClick = (event) => {
      if (container && !container.contains(event.target)) {
        container.classList.remove("fullscreenCountryDropdown");
        document.removeEventListener("click", handleOutsideClick);
      }
    };

    document.addEventListener("click", handleOutsideClick);
  };
  useEffect(() => {
    const nameFromParams = searchParams.get("name");
    if (nameFromParams) {
      const decodedName = decodeURIComponent(nameFromParams);
      setName(decodedName);
    }
    if (sessionStorage.getItem("OwnerDetails")) {
      const ownerDetails = JSON.parse(sessionStorage.getItem("OwnerDetails"));
      setName(ownerDetails.name || "");
      setPhone(ownerDetails.phone || "");
    }
  }, [searchParams]);

  const containsEmoji = (text) => {
    return /[\p{Emoji_Presentation}\u200d]/u.test(text);
  };

  const validateName = (value) => {
    if (!value.trim()) return "Name is required.";
    if (containsEmoji(value)) return "Emojis are not allowed in the name.";
    if (/[^a-zA-Z\s.'-]/.test(value))
      return "Name contains invalid characters.";
    if (value.trim().length < 2) return "Name must be at least 2 characters.";
    return "";
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (nameSubmitted) {
      setNameError(validateName(val));
    } else {
      setNameError("");
    }
  };
  const handleLoginClick = async () => {
    setNameSubmitted(true);
    setPhoneSubmitted(true);

    const nError = validateName(name);
    const pError = validatePhone(phone);

    setNameError(nError);
    setPhoneError(pError);

    if (nError) return;
    if (pError) return;
    setLoading(true);

    try {
      const localDateTime = new Date().toLocaleString();
      const response = await axios.put(
        `${API_BASE_URL}/endusers/users/${userId}`,
        {
          name: name.trim(),
          phone,
          referredBy: referralCode || "",
          referredByName: referredByName || "",
          referredOn: localDateTime,
          userType: 0,
          verifyDetails: true,
        }
      );
      if (response.status === 200) {
        setStartExit(true);
        sessionStorage.setItem(
          "OwnerDetails",
          JSON.stringify({ name: name.trim(), phone })
        );
        setUser({ name: name });
        setTimeout(() => {
          localStorage.setItem("onboardComplete", "true");
          navigate("/steps");
        }, 400);
        const email = localStorage.getItem("userEmail");
        sendEmailToOwner(email, name, phone);
      } else {
        setPopupType("failed");
        setPopupMessage("Update failed. Please try again.");
        setShowPopup(true);
      }
    } catch (error) {
      setPopupType("failed");
      setPopupMessage("An error occurred during update.");
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };
  const [step, setStep] = useState(0);

  useEffect(() => {
    const played = sessionStorage.getItem("personalDetailsAnimationPlayed");

    if (!played) {
      const delays = [150, 300, 450, 550];
      const timers = delays.map((delay, index) =>
        setTimeout(() => setStep(index + 1), delay)
      );

      sessionStorage.setItem("personalDetailsAnimationPlayed", "true");

      return () => timers.forEach(clearTimeout);
    } else {
      setStep(4);
    }
  }, []);
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = (e) => {
      window.history.pushState(null, "", window.location.href);
      const confirmExit = window.confirm(
        "Are you sure you want to leave? You might lose unsaved changes."
      );
      if (!confirmExit) {
        window.close();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
  useEffect(() => {
    const fetchCountryByIP = async () => {
      try {
        const response = await axios.get("https://ipapi.co/json/");
        const userCountry = response.data.country_code?.toLowerCase();
        if (userCountry) {
          setCountry("us" || userCountry);
        }
      } catch (error) {
        console.error("Could not fetch country by IP:", error);
      }
    };

    fetchCountryByIP();
  }, []);

  const validatePhone = (value) => {
    if (!value || value.trim() === "") return ""; // optional

    if (value.length < 10) return "Phone number must be at least 10 digits.";

    try {
      const phoneNumber = parsePhoneNumberFromString("+" + value);
      if (!phoneNumber) return "Invalid phone number format.";
      if (!phoneNumber.isValid()) return "Invalid number for selected country.";
      return "";
    } catch (error) {
      return "Invalid phone number.";
    }
  };

 
  const fetchUserDetails = async () => {
        try {
         
          const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/auth/getUserDetails`, {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          const user = res.data.user;
          console.log("✅ User Details:", user);
           setUser({ name: user.name });
          setUserDetails(user)
         
          // store important details
        
         
        } catch (err) {
          console.error("❌ Error fetching user details:", err);
        
        } finally {
         
        }
      };
      useEffect(()=>{
        fetchUserDetails()
      }, [])
      useEffect(() => {
  if (userDetails?.name) {
    setName(userDetails.name);  // ✅ Pre-fill name when user details load
  }
}, [userDetails]);


  return (
    <>
      <div className={styles.signUpContainer}>
        <div className={styles.StartMain}>
          <div>
            <img src="images/Ellipse 6.png" alt="Ellipse 6" />
            <img src="images/Ellipse 7.png" alt="Ellipse 7" />
            <img src="images/Ellipse 8.png" alt="Ellipse 8" />
            <img src="images/Ellipse 9.png" alt="Ellipse 9" />
            <img src="images/Ellipse 10.png" alt="Ellipse 10" />
            <img src="images/Ellipse 11.png" alt="Ellipse 11" />
          </div>
        </div>
        <div className={styles.pageWrapper}>
          <div className={`${styles.mask} ${styles.maskZoomFadeIn}`}>
            <img src="images/Mask.png" alt="Mask" />
          </div>
          <div className={styles.logimg2}>
            <div
              className={`${styles.logimg} ${styles.animateStep} ${
                step >= 1 ? styles.animateStep1 : ""
              }`}
            >
              <img
                className={styles.logo}
                src="svg/Rexpt-Logo.svg"
                alt="Rexpt-Logo"
              />
            </div>
          </div>

          <div
            className={`${styles.Maincontent} ${styles.animateStep} ${
              step >= 2 ? styles.animateStep2 : ""
            }`}
          >
            <div className={styles.welcomeTitle}>
              <h1>Personal Details</h1>
            </div>
          </div>

          <div
            className={`${styles.container} ${styles.animateStep} ${
              step >= 3 ? styles.animateStep3 : ""
            }`}
          >
            <div className={styles.labReq}>
              <div className={styles.Dblock}>
                <label className={styles.label}>Name</label>
                <input
                  type="text"
                  className={`${styles.input} ${
                    nameError ? styles.inputError : ""
                  }`}
                  placeholder="Your name"
                  maxLength={150}
                  value={name}
                  onChange={handleNameChange}
                />
              </div>
              {nameError && <p className={styles.inlineError}>{nameError}</p>}
            </div>
            <div className={styles.labReq}>
              <div className={styles.Dblock}>
                <label className={styles.label}>Phone Number (Optional)</label>
                <PhoneInput
                  ref={phoneInputRef}
                  country={country}
                  enableSearch={true}
                  value={phone}
                  onChange={(val, countryData) => {
                    setPhone(val);
                    if (phoneSubmitted) {
                      setPhoneError(validatePhone(val));
                    } else {
                      setPhoneError("");
                    }
                  }}
                  onClickFlag={handleFlagClick}
                  inputClass={`${styles.input} ${
                    phoneError ? styles.inputError : ""
                  }`}
                />
              </div>
              {phoneError && <p className={styles.inlineError}>{phoneError}</p>}
            </div>
          </div>

          <div
            className={`${styles.Btn} ${styles.animateStep} ${
              step >= 4 ? styles.animateStep4 : ""
            }`}
            onClick={handleLoginClick}
          >
            <div type="submit">
              <div className={styles.btnTheme}>
                <AnimatedButton
                  isLoading={loading}
                  label="Continue"
                  bottom="50px"
                />
              </div>
            </div>
          </div>

          {showPopup && (
            <PopUp
              type={popupType}
              onClose={() => setShowPopup(false)}
              message={popupMessage}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Details;
