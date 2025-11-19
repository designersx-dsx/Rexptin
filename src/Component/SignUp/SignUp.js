import React, { useState, useRef, useEffect } from "react";
import styles from "../SignUp/SignUp.module.css";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  API_BASE_URL,
  LoginWithEmailOTP,
  verifyEmailOTP,
} from "../../Store/apiStore";
import { useLayoutEffect } from 'react';
import PopUp from "../Popup/Popup";
import Loader from "../Loader/Loader";
import useUser from "../../Store/Context/UserContext";
import AnimatedButton from "../AnimatedButton/AnimatedButton";
import useUserDeviceInfo from "../../hooks/useUserDeviceInfo";
import useUTMParams from "../../hooks/useUTMParams";

const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [resendEndTime, setResendEndTime] = useState(null);
  const tempReferral = sessionStorage.getItem("referredBy") || "";
  const tempLandingSelectedPlan = sessionStorage.getItem("selectedPlan") || "";
  const tempReferredByName = sessionStorage.getItem("referredByName") || "";
  const isUser = sessionStorage.getItem("isUser") || "";
  const [customerId, setCustomerId] = useState();
  const [renderHtml, setRenderHtml] = useState(false);
  const info = useUserDeviceInfo();
  const utm_data = useUTMParams();
  const listRef = useRef(null);
  useEffect(() => {
    const verifiedDetails = searchParams.get("verifiedDetails")
    const tokenFromParams = searchParams.get("token");
    if (tokenFromParams) {
      localStorage.setItem("token", tokenFromParams);
      localStorage.setItem("onboardComplete", verifiedDetails);
      console.log("✅ Token saved to localStorage:", tokenFromParams);
    }
  }, [searchParams]);


  // Run once on mount, before any effects

  useEffect(() => {
    if (!resendEndTime) return;

    const interval = setInterval(() => {
      const timeLeft = Math.max(
        0,
        Math.floor((resendEndTime - Date.now()) / 1000)
      );
      setResendTimer(timeLeft);

      if (timeLeft <= 0) {
        setIsResendDisabled(false);
        setResendEndTime(null);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [resendEndTime]);

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
    const val = e.target.value.toLowerCase().trim();
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

    if (emailValidationMsg) return;

    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setShowPopup(true);
      setPopupType("failed");
      setPopupMessage("Please enter a valid 6-digit OTP.");
      setRenderHtml(false);
      return;
    }

    setIsVerifyingOtp(true);

    try {
      const response = await verifyEmailOTP(
        email.toLowerCase(),
        fullOtp,
        customerId
      );

      if (response?.status === 200) {
        localStorage.setItem("token", response?.data.token);
        sessionStorage.clear();
        sessionStorage.setItem("referredBy", tempReferral);
        sessionStorage.setItem("selectedPlan", tempLandingSelectedPlan);
        sessionStorage.setItem("referredByName", tempReferredByName);
        sessionStorage.setItem("isUser", isUser);

        if (response?.data?.paymentDone) {
          localStorage.setItem("paymentDone", true);
        }
        localStorage.setItem(
          "showreferralfloating",
          response?.data?.user?.showreferralfloating
        );

        setPopupType("success");
        setShowPopup(true);
        setPopupMessage("One Time Password Verified successfully!");
        setRenderHtml(false);

        const userData = {
          name: response?.data?.user?.name || "",
          profile:
            `${API_BASE_URL?.split("/api")[0]}${response?.data?.user?.profile?.split("public")[1]
            }` || "images/camera-icon.avif",
          subscriptionDetails: {},
        };

        setUser(userData);
        localStorage.setItem(
          "onboardComplete",
          verifiedUser ? "true" : "false"
        );

        if (!response?.data?.user?.verifyDetails) {
          navigate("/details", { replace: true });
        }
        if (response?.data?.paymentDone) {
          navigate(
            response?.data?.user?.verifyDetails ? "/steps" : "/details",
            { replace: true }
          );
        } else {
          navigate(verifiedUser ? "/dashboard" : "/details", { replace: true });
        }
      } else {
        setPopupType("failed");
        setShowPopup(true);
        setPopupMessage(
          "Failed to verify One Time Password. Please try again."
        );
        setRenderHtml(false);
      }
    } catch (error) {
      const msg = error?.response?.data?.error || "Internal Server Error";
      const isHtmlMessage = msg.includes("<a");

      setPopupType("failed");
      setShowPopup(true);
      setPopupMessage(msg);
      setRenderHtml(isHtmlMessage);
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
      return;
    }
    setEmailError("");
    setIsVerifyingOtp(true);
    try {
      const utmPayload = utm_data ? utm_data : null;
      const response = await LoginWithEmailOTP(email, info, utmPayload);
      if (response?.status === 200) {
        setVerifiedUser(response.data.verifiedStatus);
        setShowPopup(true);
        setPopupType("success");
        setPopupMessage("One Time Password sent successfully!");

        setOtpSent(true);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.blur();
        const endTime = Date.now() + 300 * 1000;
        setResendEndTime(endTime);
        setIsResendDisabled(true);
      } else {
        setShowPopup(true);
        setPopupType("failed");
        setPopupMessage("Failed to send One Time Password. Please try again.");
      }
    } catch (error) {
      console.log(error);
      if (error.status === 409) {
        setOtp(["", "", "", "", "", ""]);
        setShowPopup(true);
        setPopupType("failed");
        setPopupMessage(
          error?.response?.data.error || "Failed to send OTP. Please try again."
        );
        setOtpSent(true);
      } else {
        setShowPopup(true);
        setPopupType("failed");
        setPopupMessage(
          error?.response?.data.error || "Failed to send OTP. Please try again."
        );
      }
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
  const [ready, setReady] = useState(false); // NEW add

  useEffect(() => {
    const played = sessionStorage.getItem("loginAnimationPlayed");

    if (!played) {
      const delays = [150, 250, 350, 450, 550];
      const timers = delays.map((delay, index) =>
        setTimeout(() => setStep(index + 1), delay)
      );

      sessionStorage.setItem("loginAnimationPlayed", "true");

      setTimeout(() => {
        setReady(true); // animation done, now render full UI
      }, 700);

      return () => timers.forEach(clearTimeout);
    } else {
      setStep(5);
      setReady(true); // no animation, render directly
    }
  }, []);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("userEmail", email);
  }, [email]);

  useEffect(() => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (!isMobile && otpSent && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [otpSent]);
  useEffect(() => {
    const emailFromParams = searchParams.get("email");
    const otpNotRequired = searchParams.has("otp-not-required");

    if (emailFromParams) {
      const decodedEmail = decodeURIComponent(emailFromParams);
      setEmail(decodedEmail.toLowerCase());

      if (otpNotRequired) {
        setOtpSent(true);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.blur();

        //  Check if there’s an existing timer in localStorage
        const storedEndTime = localStorage.getItem("otpResendEndTime");
        let endTime;

        if (storedEndTime && Date.now() < Number(storedEndTime)) {
          // Continue from existing timer
          endTime = Number(storedEndTime);
        } else {
          // Set new 5-minute timer
          endTime = Date.now() + 300 * 1000;
          localStorage.setItem("otpResendEndTime", endTime);
        }

        setResendEndTime(endTime);
        setIsResendDisabled(true);
      }
    }
  }, [searchParams]);
  const scrollListIntoView = () => {
    if (listRef.current) {
      listRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  };
  return (
    <>
      {ready && (
        <div className={styles.signUpContainer}>
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
              <div className={styles.pageEnterAnimation}>
                <div className={`${styles.mask} ${styles.maskZoomFadeIn}`}>
                  <img src="images/Mask.png" alt="Mask.png" />
                </div>
                <div
                  className={`${styles.logimg} ${step >= 1 ? styles.animate1 : ""
                    }`}
                >
                  <img
                    className={styles.logo}
                    src="svg/Rexpt-Logo.svg"
                    alt="Rexpt-Logo"
                  />
                </div>
                <div
                  className={`${styles.Maincontent} ${step >= 2 ? styles.animate2 : ""
                    }`}
                >
                  <div className={styles.welcomeTitle}>
                    <h1>Log In to your Account</h1>
                    <p>
                      If it doesn’t exist, we’ll create one for you completely
                      free!
                    </p>
                  </div>
                </div>

                <div className={styles.container} ref={listRef}>
                  {!otpSent && (
                    <>
                      <div
                        className={`${styles.labReq} ${step >= 3 ? styles.animate3 : ""
                          }`}
                      >
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
                      <br />
                      <div
                        className={`${styles.btnTheme} ${step >= 4 ? styles.animate4 : ""
                          }`}
                        onClick={handleSendOTP}
                      >
                        <AnimatedButton
                          isLoading={isVerifyingOtp}
                          label="Send One Time Password"
                          // onClick={handleSendOTP}
                          position={{ position: "relative" }}
                        />
                      </div>
                    </>
                  )}

                  {/* OTP Input Fields & Continue Button */}

                  {otpSent && (
                    <>
                      {email && (
                        <p className={styles.codeText}>
                          Email has been sent to <strong>{email}</strong>
                        </p>
                      )}
                      <p className={styles.codeText}>
                        Enter the code sent to your email
                      </p>

                      <div className={styles.otpContainer} >
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
                              target.value = target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                            }}

                            onClick={() => {
                              setTimeout(scrollListIntoView, 300);
                            }}
                            inputMode="numeric"
                            type="tel"
                          />
                        ))}
                      </div>




                      <p className={styles.SpamMessage}>
                        Please check your spam folder if you don’t find it in
                        your main inbox.
                      </p>
                      <div className={styles.resendContainer}>
                        <button
                          type="button"
                          className={styles.resendButton}
                          onClick={handleSendOTP}
                          disabled={isResendDisabled}
                          style={{
                            cursor: isResendDisabled
                              ? "not-allowed"
                              : "pointer",
                            opacity: isResendDisabled ? 0.5 : 1,
                            background: "none",
                            border: "none",
                            color: "#6524EB",
                            fontWeight: "bold",
                            fontSize: "14px",
                          }}
                        >
                          {isResendDisabled && resendTimer > 0
                            ? `Resend One Time Password in ${String(
                              Math.floor(resendTimer / 60)
                            ).padStart(2, "0")}:${String(
                              resendTimer % 60
                            ).padStart(2, "0")}`
                            : "Resend One Time Password"}
                        </button>
                      </div>
                      <br />
                      <div className={styles.Btn} onClick={handleLoginClick}>
                        <div type="submit">
                          <div className={styles.btnTheme}>
                            {/* <div className={styles.imageWrapper}>
                              <img src="svg/svg-theme2.svg" alt="" />
                            </div>
                            <p>
                              {isVerifyingOtp ? (
                                <>
                                  <Loader size={17} />
                                </>
                              ) : (
                                "Continue"
                              )}
                            </p> */}
                            <AnimatedButton
                              isLoading={isVerifyingOtp}
                              label="Continue"
                              position={{ position: "relative" }}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  <div 
                    className={`${styles.Maincontent2} ${step >= 5 ? styles.animate5 : ""
                      }`}
                  >
                    <div className={styles.divider}>
                      <hr className={styles.line} />
                      <span className={styles.text}>Or continue with</span>
                      <hr className={styles.line} />
                    </div>

                    <div className={styles.socialMedia}>
                      <img src="svg/Coming-Soon.svg" />
                    </div>
                    <p className={styles.PrivaceTerms}>
                      By providing your email address & creating an account, you
                      agree to the Rexptin&nbsp;
                      <a
                        href="https://www.rexpt.in/Terms-Condition"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Terms & Conditions
                      </a>
                      &nbsp;and&nbsp;
                      <a
                        href="https://www.rexpt.in/Privacy-Policy"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Privacy Policy
                      </a>
                    </p>
                  </div>
                </div>

                {showPopup && (
                  <PopUp
                    type={popupType}
                    onClose={() => setShowPopup(false)}
                    message={popupMessage}
                    renderHTML={true}
                  />
                )}
              </div>
            </div>
          </>
        </div>
      )}
    </>
  );
};

export default SignUp;
