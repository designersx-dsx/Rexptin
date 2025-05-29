// import React, { useState, useRef, useEffect } from "react";
// import styles from "../SignUp/SignUp.module.css";
// import { useNavigate } from "react-router-dom";
// import { LoginWithEmailOTP, verifyEmailOTP } from "../../Store/apiStore";
// import PopUp from "../Popup/Popup";
// import Loader from "../Loader/Loader";

// const SignUp = () => {
//   const navigate = useNavigate();
//   const [otpSent, setOtpSent] = React.useState(false);
//   const [email, setEmail] = React.useState("");
//   const [emailError, setEmailError] = React.useState("");
//   const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
//   const [showPopup, setShowPopup] = useState(false);
//   const [popupType, setPopupType] = useState(null);
//   const [popupMessage, setPopupMessage] = useState("");
//   const [isLoading, setLoading] = useState(false);
//   const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
//   const [emailTouched, setEmailTouched] = useState(false);
//   const [emailSubmitted, setEmailSubmitted] = useState(false);
//   const [verifiedUser, setVerifiedUser] = useState(false)
//   const inputRefs = useRef([]);
//   const validateEmail = (email) => {
//     if (!email) {
//       if (emailSubmitted) {
//         return "Email is required.";
//       }
//       return "";
//     }
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) return "Please enter a valid email address.";
//     return "";
//   };


//   const handleEmailChange = (e) => {
//     const val = e.target.value;
//     setEmail(val);
//     // setEmailTouched(true);
//     // if (emailSubmitted) {
//     //   setEmailError(validateEmail(val));
//     // } else {
//     //   setEmailError("");
//     // }
//   };

//   const handleLoginClick = async () => {
//     const fullOtp = otp.join("");
//     if (fullOtp.length !== 6) {
//       setShowPopup(true);
//       setPopupType("failed");
//       setPopupMessage("Please enter a valid 6-digit OTP.");
//       return;
//     }
//     setIsVerifyingOtp(true);
//     try {
//       const response = await verifyEmailOTP(email, fullOtp);

//       if (response?.status === 200) {
//         localStorage.setItem("token", response.data.token);
//         sessionStorage.clear();
//         setPopupType("success");
//         setShowPopup(true);
//         setPopupMessage("OTP Verified successfully!");
//         if (verifiedUser) {
//           navigate("/dashboard")
//         }
//         else {
//           navigate("/details");
//         }

//       } else {
//         console.error("Failed to send OTP");
//         setPopupType("failed");
//         setShowPopup(true);
//         setPopupMessage(
//           "Failed to send OTP. Please try again." || "Internal Server Error"
//         );
//       }
//     } catch (error) {
//       setPopupType("failed");
//       setShowPopup(true);
//       setPopupMessage(error?.response?.data.error || "Internal Server Error");
//       console.error("Error sending OTP:", error);
//     } finally {
//       setIsVerifyingOtp(false);
//     }
//   };

//   const handleSendOTP = async () => {
//     setEmailTouched(true);
//     const emailValidationMsg = validateEmail(email);
//     setEmailError(emailValidationMsg);
//     if (emailValidationMsg) {
//       return;
//     }
//     setEmailError("");
//     // setIsVerifyingOtp(true);
//     try {

//       const response = await LoginWithEmailOTP(email)
//       console.log(response)

//       if (response?.status === 200) {

//         setVerifiedUser(response.data.verifiedStatus)
//         setShowPopup(true);
//         setPopupType("success");
//         setPopupMessage("OTP sent successfully!");
//         setOtpSent(true);
//       } else {
//         console.error("Failed to send OTP");
//         setShowPopup(true);
//         setPopupType("failed");
//         setPopupMessage("Failed to send OTP. Please try again.");
//       }
//     } catch (error) {
//       setShowPopup(true);
//       setPopupType("failed");
//       setPopupMessage(error?.response?.data.error || "Internal Server Error");
//       console.error("Error sending OTP:", error);
//     } finally {
//       // setIsVerifyingOtp(false);
//     }
//   };

//   const handleOtpChange = (value, index) => {
//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);
//     if (value && index < 5) {
//       const nextInput = document.getElementById(`otp-${index + 1}`);
//       if (nextInput) nextInput.focus();
//     }
//   };

//   const handleKeyDown = (e, index) => {
//     if (e.key === "Backspace" && !otp[index] && index > 0) {
//       inputRefs.current[index - 1].focus();
//     }
//   };
//   useEffect(() => {
//     if (showPopup && popupType === "success" && popupMessage === "OTP sent successfully!") {
//       const timer = setTimeout(() => {
//         setShowPopup(false);
//       }, 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [showPopup, popupType, popupMessage]);
import React, { useState, useRef, useEffect } from "react";
import styles from "../SignUp/SignUp.module.css";
import { useNavigate } from "react-router-dom";
import { LoginWithEmailOTP, verifyEmailOTP } from "../../Store/apiStore";
import PopUp from "../Popup/Popup";
import Loader from "../Loader/Loader";

const SignUp = () => {
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
   const [verifiedUser, setVerifiedUser] = useState(false)
  const inputRefs = useRef([]);

const validateEmail = (email) => {
  if (!email) {
    if (!emailTouched || emailSubmitted) {
      return "Email is required.";
    }
    return "";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address.";
  return "";
};

const handleEmailChange = (e) => {
  const val = e.target.value;
  setEmail(val);
  setEmailTouched(true);

  if (showPopup) setShowPopup(false);

  if (emailSubmitted) {
    setEmailError(validateEmail(val));
  } else {
    setEmailError("");
  }
};

const handleLoginClick = async () => {
  const emailValidationMsg = validateEmail(email);
  setEmailError(emailValidationMsg);

  if (emailValidationMsg) {
    // Return early, no popup for email validation error
    return;
  }

  const fullOtp = otp.join("");
  if (fullOtp.length !== 6) {
    setShowPopup(true);
    setPopupType("failed");
    setPopupMessage("Please enter a valid 6-digit OTP.");
    return;
  }

  setIsVerifyingOtp(true);
  try {
    const response = await verifyEmailOTP(email, fullOtp);

    if (response?.status === 200) {
      localStorage.setItem("token", response.data.token);
      sessionStorage.clear();
      setPopupType("success");
      setShowPopup(true);
      setPopupMessage("OTP Verified successfully!");
           if (verifiedUser) {
          navigate("/dashboard")
        }
        else {
          navigate("/details");
        }
    } else {
      setPopupType("failed");
      setShowPopup(true);
      setPopupMessage("Failed to verify OTP. Please try again.");
    }
  } catch (error) {
    setPopupType("failed");
    setShowPopup(true);
    setPopupMessage(error?.response?.data.error || "Internal Server Error");
  } finally {
    setIsVerifyingOtp(false);
  }
};
 const handleSendOTP = async () => {
  setEmailTouched(true);
  setEmailSubmitted(true);
  const emailValidationMsg = validateEmail(email);
  setEmailError(emailValidationMsg);

  if (emailValidationMsg) {
    // Return early, no popup
    return;
  }

  setEmailError("");
  setIsVerifyingOtp(true);
  try {
    const response = await LoginWithEmailOTP(email);
    if (response?.status === 200) {
      setVerifiedUser(response.data.verifiedStatus)
      setShowPopup(true);
      setPopupType("success");
      setPopupMessage("OTP sent successfully!");
      setOtpSent(true);
    } else {
      setShowPopup(true);
      setPopupType("failed");
      setPopupMessage("Failed to send OTP. Please try again.");
    }
  } catch (error) {
    setShowPopup(true);
    setPopupType("failed");
    setPopupMessage(error?.response?.data.error || "Internal Server Error");
  } finally {
    setIsVerifyingOtp(false);
  }
};


  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
 useEffect(() => {
    if (showPopup && popupType === "success" && popupMessage === "OTP sent successfully!") {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 1000); 
      return () => clearTimeout(timer);
    }
  }, [showPopup, popupType, popupMessage]);
  return (
    <>
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
      <div className={styles.pageEnterAnimation}>
        <div className={`${styles.mask} ${styles.animate1}`}>
          <img src="images/Mask.png" alt="Mask.png" />
        </div>
        <div className={`${styles.logimg} ${styles.animate2}`}>
          <img
            className={styles.logo}
            src="svg/Rexpt-Logo.svg"
            alt="Rexpt-Logo"
          />
        </div>
        <div className={`${styles.Maincontent} ${styles.animate3}`}>
          <div className={styles.welcomeTitle}>
            <h1>Log In to your Account</h1>
          </div>
        </div>
        <div className={`${styles.container} ${styles.animate4}`}>
          {!otpSent && (
            <>
              <input
                type="email"
                className={`${styles.emailInput} ${emailError ? styles.inputError : ""
                  }`}
                placeholder="Johnvick@gmail.com"
                value={email}
                onChange={handleEmailChange}
                required
              />
              {emailError && <p className={styles.inlineError}>{emailError}</p>}

              <div className={styles.btnTheme} onClick={handleSendOTP}>
                <img src="svg/svg-theme2.svg" alt="" />
                <p>
                  {" "}
                  {isVerifyingOtp ? (
                    <>
                      <Loader size={17} />
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </p>
              </div>
            </>
          )}

          {/* OTP Input Fields & Continue Button */}
          {otpSent && (
            <>
              <p className={styles.codeText}>
                Enter the code sent to your email
              </p>

              {/* <div className={styles.otpContainer}>
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    maxLength="1"
                    value={otp[i]}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    className={styles.otpInput}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    ref={(el) => (inputRefs.current[i] = el)}
                    onInput={(e) => {
                      const target = e.target;
                      target.value = target.value.replace(/[^0-9]/g, "");
                    }}
                  />
                ))}
              </div> */}
              <div className={styles.otpContainer}>
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    maxLength="1"
                    value={otp[i]}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    className={styles.otpInput}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    ref={(el) => (inputRefs.current[i] = el)}
                    onInput={(e) => {
                      const target = e.target;
                      target.value = target.value.replace(/[^0-9]/g, "");
                    }}
                    inputMode="numeric"
                    type="tel"
                  />
                ))}
              </div>

              <div className={styles.Btn} onClick={handleLoginClick}>
                <div type="submit">
                  <div className={styles.btnTheme}>
                    <img src="images/svg-theme.svg" alt="" />
                    <p>
                      {isVerifyingOtp ? (
                        <>
                          <Loader size={17} />
                        </>
                      ) : (
                        "Continue"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className={styles.divider}>
            <hr className={styles.line} />
            <span className={styles.text}>Or continue with</span>
            <hr className={styles.line} />
          </div>

          <div className={styles.socialMedia}>
            <img src="svg/google.svg" alt="" />
            <img src="svg/facbook.svg" alt="" />
            <img src="svg/apple.svg" alt="" />
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
    </>
  );
};

export default SignUp;
