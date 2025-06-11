import React, { useState, useRef, useEffect } from "react";
import styles from "../SignUp/SignUp.module.css";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, LoginWithEmailOTP, verifyEmailOTP } from "../../Store/apiStore";
import PopUp from "../Popup/Popup";
import Loader from "../Loader/Loader";
import useUser from "../../Store/Context/UserContext";

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
  const [verifiedUser, setVerifiedUser] = useState(false);
  const inputRefs = useRef([]);
  const { user, setUser } = useUser();
  const [resendTimer, setResendTimer] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);

// const navigate = useNavigate();

  useEffect(() => {
    // Push dummy state to prevent actual back
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      // Instead of going back, force redirect
      navigate('/', { replace: true }); // Or use any public page
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  useEffect(() => {
    let timerInterval = null;

    if (resendTimer > 0) {
      timerInterval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setIsResendDisabled(false);
      clearInterval(timerInterval);
    }

    return () => clearInterval(timerInterval);
  }, [resendTimer]);

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
      console.log('response',response)
      if (response?.status === 200) {
        localStorage.setItem("token", response.data.token);
        sessionStorage.clear();
        setPopupType("success");
        setShowPopup(true);
        setPopupMessage("OTP Verified successfully!");
        if (verifiedUser) {
          setUser({
            name: response?.data?.user?.name || "",
            profile: `${API_BASE_URL?.split('/api')[0]}${response?.data?.user?.profile?.split('public')[1] }`|| "images/camera-icon.avif",
            subscriptionDetails: {},
          });
          navigate("/dashboard");
        } else {
          setUser({
            name: response?.data?.user?.email || "",
            profile: `${API_BASE_URL}${response?.data?.user?.profile?.split('public')[1] }`|| "images/camera-icon.avif",
            subscriptionDetails: {},
          });
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
        setVerifiedUser(response.data.verifiedStatus);
        setShowPopup(true);
        setPopupType("success");
        setPopupMessage("OTP sent successfully!");
        setOtpSent(true);
        setResendTimer(120);
        setIsResendDisabled(true);
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
    if (
      showPopup &&
      popupType === "success" &&
      popupMessage === "OTP sent successfully!"
    ) {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showPopup, popupType, popupMessage]);



  const [step, setStep] = useState(0);

  useEffect(() => {
    const played = sessionStorage.getItem("loginAnimationPlayed");

    if (!played) {
      const delays = [150, 250, 350, 450, 550];

      const timers = delays.map((delay, index) =>
        setTimeout(() => setStep(index + 1), delay)
      );

      setTimeout(() => {
        sessionStorage.setItem("loginAnimationPlayed", "true");
      }, 700);

      return () => timers.forEach(clearTimeout);
    } else {
      setStep(5);
    }
  }, []);


  useEffect(() => {
    if (otpSent && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [otpSent]);
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
        <div className={`${styles.mask} ${styles.maskZoomFadeIn}`}>
          <img src="images/Mask.png" alt="Mask.png" />
        </div>
        <div className={`${styles.logimg} ${step >= 1 ? styles.animate1 : ""}`}>
          <img
            className={styles.logo}
            src="svg/Rexpt-Logo.svg"
            alt="Rexpt-Logo"
          />
        </div>
        <div className={`${styles.Maincontent} ${step >= 2 ? styles.animate2 : ""}`}>
          <div className={styles.welcomeTitle}>
            <h1>Log In to your Account</h1>
          </div>
        </div>

        <div className={styles.container} >
          {!otpSent && (
            <>
              <div className={`${styles.labReq} ${step >= 3 ? styles.animate3 : ""}`}>
                <div className={styles.Dblock}>
                  <input
                    type="email"
                    className={`${styles.emailInput} ${emailError ? styles.inputError : ""
                      }`}
                    placeholder="Johnvick@gmail.com"
                    value={email}
                    onChange={handleEmailChange}
                    required
                  />
                </div>
                {emailError && (
                  <p className={styles.inlineError}>{emailError}</p>
                )}
              </div>
              <div className={`${styles.btnTheme} ${step >= 4 ? styles.animate4 : ""}`} onClick={handleSendOTP}>

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
              <div
                className={styles.resendContainer}
                style={{ marginBottom: "12px" }}
              >
                <button
                  type="button"
                  className={styles.resendButton}
                  onClick={handleSendOTP}
                  disabled={isResendDisabled}
                  style={{
                    cursor: isResendDisabled ? "not-allowed" : "pointer",
                    opacity: isResendDisabled ? 0.5 : 1,
                    background: "none",
                    border: "none",
                    color: "#6524EB",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {isResendDisabled
                    ? `Resend OTP in ${Math.floor(resendTimer / 60)
                      .toString()
                      .padStart(2, "0")}:${(resendTimer % 60)
                        .toString()
                        .padStart(2, "0")}`
                    : "Resend OTP"}
                </button>
              </div>

              <div className={styles.Btn} onClick={handleLoginClick}>
                <div type="submit">
                  <div className={styles.btnTheme}>
                    <img src="svg/svg-theme.svg" alt="" />
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
          <div className={`${styles.Maincontent2} ${step >= 5 ? styles.animate5 : ""}`}>
            <div className={styles.divider}>
              <hr className={styles.line} />
              <span className={styles.text}>Or continue with</span>
              <hr className={styles.line} />
            </div>

            <div className={styles.socialMedia}>

              <img src="svg/Coming-Soon.svg" />

              {/* <img src="svg/google.svg" alt="" />
            <img src="svg/facbook.svg" alt="" />
            <img src="svg/apple.svg" alt="" /> */}
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
    </>
  );
};

export default SignUp;
