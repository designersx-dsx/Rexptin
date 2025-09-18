import React, { useRef, useState, useEffect, useContext } from "react";
import styles from "../EditProfile/EditProfile.module.css";
import Refferal from "../Refferal/Refferal";
import MySubscription from "../MySubscription/MySubscription";
import BillingInvoices from "../BillingInvoices/BillingInvoices";
import {
  API_BASE_URL,
  getEndUserSubscriptions_Billings,
  deleteUser,
  getUserDetails,
  LoginWithEmailOTP,
  updateEmailSendOtp,
  updateUserDetails,
  verifyEmailOTP,
} from "../../Store/apiStore";
import UploadProfile from "../Popup/profilePictureUpdater/UploadProfile";
import decodeToken from "../../lib/decodeToken";
import PopUp from "../Popup/Popup";
import useUser from "../../Store/Context/UserContext";
import { useNavigate } from "react-router-dom";
import Loader2 from "../Loader2/Loader2";

import Loader from "../Loader/Loader";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import axios from "axios";
import { RefreshContext } from "../PreventPullToRefresh/PreventPullToRefresh";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import { useDashboardStore } from "../../Store/agentZustandStore";



const EditProfile = () => {

  const { setHasFetched } =
    useDashboardStore();
  const fileInputRef = useRef(null);
  const sectionRef = useRef(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const token = localStorage.getItem("token");
  const decodeTokenData = decodeToken(token);
  const userId = decodeTokenData?.id;
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addLoading, addSetLoading] = useState(false);
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [showDashboardReferral, setShowDashboardReferral] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Payg states
  const params = new URLSearchParams(window.location.search);
  const isPayg = params.get('isPayg');
  // console.log("isPayg:", isPayg);
  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  const [customerId, setcustomerId] = useState()
  const [userId1, setuserId1] = useState()


  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    profilePicture: "",
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);
  const [otpEmail, setOtpEmail] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const isOtpFilled = otp.every((digit) => digit !== "");
  const [subscriptionDetails, setSubscriptionDetails] = useState({});
  const isRefreshing = useContext(RefreshContext);
  const [redirectButton, setRedirectButton] = useState(false);

  const [zapierVisible, setZapierVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);


  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [showDisableConfirmModal, setShowDisableConfirmModal] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);
  const [clientVisible, setClientVisible] = useState(false);
  const [copiedZapier, setCopiedZapier] = useState(false);
  const [copiedClient, setCopiedClient] = useState(false);





  const openUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const urlParams = new URLSearchParams(window.location.search);
  const isPayg1 = urlParams.get('isPayg');
  useEffect(() => {
    if (isPayg1 === "true") {
      localStorage.setItem("isPayg", true)
      setPaygEnabled(true)
      setPopupType("success");
      setPopupMessage("Pay As You Go Activated successfully.");
      setShowPopup(true);
    }
  }, [])

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  const handleUpload = (imageUrl) => {
    setUploadedImage(imageUrl);
    setFormData((prev) => ({
      ...prev,
      profilePicture: imageUrl,
    }));
  };

  const isDataChanged = () => {
    if (!initialData) return false;

    const { name, email, phone, address } = formData;
    const {
      name: initialName,
      email: initialEmail,
      phone: initialPhone,
      address: initialAddress,
    } = initialData;

    return (
      name !== initialName ||
      email !== initialEmail ||
      phone !== initialPhone ||
      address !== initialAddress
    );
  };
  const getEndUserSubscriptions = async () => {
    try {
      const data = await getEndUserSubscriptions_Billings(userId);
      // console.log("User subscription Data:", data);
      setSubscriptionDetails(data)
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }
  const [zapApikey, setZapApikey] = useState("")
  const [clientId, setClientId] = useState("")
  const fetchUser = async () => {
    try {
      if (!isRefreshing) { setLoading(true); }

      const user = await getUserDetails(userId, token);

      setZapApikey(user?.ZapApikey)
      setClientId(user?.client_id)
      setcustomerId(user?.customerId)
      setuserId1(user?.userId)
      setReferralCode(user?.referralCode);
      setShowDashboardReferral(user?.showreferralfloating);
      localStorage.setItem(
        "showreferralfloating",
        user?.showreferralfloating
      );
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        profilePicture: `${API_BASE_URL?.split("/api")[0]}${user?.profilePicture?.split("public")[1]
          }`,
      });
      setInitialData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        profilePicture: `${API_BASE_URL?.split("/api")[0]}${user?.profilePicture?.split("public")[1]
          }`,
      });
    } catch (error) {
      console.error(error);
      alert("Failed to load user details.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);
  useEffect(() => {
    if (!userId) return;
    getEndUserSubscriptions();
  }, [userId]);
  useEffect(() => {
    if (isRefreshing) {
      getEndUserSubscriptions();
      fetchUser();
    }
  }, [isRefreshing])
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email" && value !== initialData?.email) {
      setEmailVerified(false);
      setOtpSent(false);
      setOtp(["", "", "", "", "", ""]);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSendOTP = async () => {
    try {
      setSendOtpLoading(true);
      await updateEmailSendOtp(formData.email, userId);
      setOtpSent(true);
      setOtpEmail(formData.email);
      setResendTimer(60);
      setIsResendDisabled(true);
      setShowPopup(true);
      setPopupType("success");
      setPopupMessage("One Time Password sent successfully!");
      const timerInterval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      // alert("Failed to send OTP. Please try again.");
      if (error.status == 409) {
        // setEmailVerified(true);
        setOtpSent(false);
        setShowPopup(true);
        setPopupType("failed");
        setPopupMessage(
          error?.response?.data.error || "Failed to send OTP. Please try again."
        );
        setOtpSent(true);
      } else {
        setOtpSent(false);
        setShowPopup(true);
        setPopupType("failed");
        setPopupMessage(
          error?.response?.data.error || "Failed to send OTP. Please try again."
        );
      }
    } finally {
      setSendOtpLoading(false);
    }
  };
  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const handleVerifyOtp = async () => {
    try {
      setIsVerifyingOtp(true);
      const code = otp.join("");

      // API to verify
      const verified = await verifyEmailOTP(otpEmail, code); // <-- create this API

      if (verified) {
        setEmailVerified(true);
        setShowPopup(true);
        setPopupType("success");
        setPopupMessage("Email verified successfully!");
      } else {
        setShowPopup(true);
        setPopupType("failed");
        setPopupMessage("Incorrect OTP. Try again.");
      }
    } catch (err) {
      setShowPopup(true);
      setPopupType("failed");
      setPopupMessage("Verification failed.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Optional Name Validation
    if (!formData.name) {
      newErrors.name = "Name is required.";
    }
    // Conditional Email & Phone validation
    if (!formData.email && !formData.phone) {
      newErrors.email = "Email is required if phone is not provided.";
      newErrors.phone = "Phone is required if email is not provided.";
    } else {
      if (
        formData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ) {
        newErrors.email = "Invalid email format.";
      }

      if (formData.phone) {
        const cleanedPhone = formData.phone.replace(/[\s()-]/g, ""); // remove spaces, parentheses, dashes
        if (!/^\+?\d{12,15}$/.test(cleanedPhone)) {
          newErrors.phone = "Enter a valid phone number with country code.";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      addSetLoading(true);

      const response = await updateUserDetails(userId, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      });
      // console.log(response.user.profilePicture, "response42343243242");
      setUser({ name: formData?.name, profile: formData?.profilePicture });

      setInitialData({ ...formData });
      setShowPopup(true);
      setPopupType("success");
      setPopupMessage("Profile updated successfully!");
      setTimeout(() => {
        handleClosePopup();
      }, 2000);
      setIsEditing(false);

    } catch (error) {
      console.error(error);
      setShowPopup(true);
      setPopupType("failed");
      setPopupMessage("Failed to update profile.");
    } finally {
      addSetLoading(false);
    }
  };
  const handleClosePopup = () => {
    setShowPopup(false);
    setRedirectButton(false)
  };
  const handleBack = () => {
    if (isPayg1) {
      navigate("/dashboard")
      return
    }
    navigate(-1);
  };
  const nevigate = useNavigate();


  const [paygEnabled, setPaygEnabled] = useState(localStorage.getItem("isPayg") || false);
  // const PaygSubscriptionId = subscriptionDetails.invoices
  //   ?.filter(invoice =>
  //     invoice.plan_name === "Extra Minutes"
  //     // invoice.plan_name === "PAYG Extra" // LIVE ACCOUNT
  //     && invoice.status !== "canceled") // Filter by plan and status
  //   .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort by latest created_at
  //   .map(invoice => invoice.subscription_id)[0]; // Get the subscription_id of the latest invoice
  // console.log("PaygSubscriptionId", subscriptionDetails.invoices)

  const PaygSubscriptionId = subscriptionDetails.invoices
    ?.filter(invoice => {
      if (invoice.plan_name !== "Extra Minutes" || invoice.status === "canceled") {
        // if (invoice.plan_name !== "PAYG Extra" || invoice.status === "canceled") {
        return false;
      }

      // Parse metadata safely
      let metadata = {};
      try {
        metadata = typeof invoice.metadata === "string"
          ? JSON.parse(invoice.metadata)
          : invoice.metadata || {};
      } catch (err) {
        console.error("Error parsing metadata:", err);
      }

      // Skip if assign_number_plan is true
      return metadata.assign_number_plan !== true;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // latest first
    .map(invoice => invoice.subscription_id)[0]; // get first sub id

  // console.log("PaygSubscriptionId", PaygSubscriptionId);



  const handlePaygToggle = async () => {

    const hasByAdminAgent =
      Array.isArray(subscriptionDetails?.agents) &&
      subscriptionDetails.agents.some(a => a?.subscriptionId === "byAdmin");


    if (hasByAdminAgent) {
      // return
    } else if (subscriptionDetails.invoices.length === 0) {
      setRedirectButton(true)
      setShowPopup(true);
      setPopupType("failed");
      setPopupMessage("To enable Pay As You Go, please ensure you have an active subscription.");
      return
    }




    const isCurrentlyEnabled = paygEnabled;

    if (!isCurrentlyEnabled) {
      setShowConfirmModal(true); // Show confirmation modal first
      return;
    }

    if (isCurrentlyEnabled) {
      setShowDisableConfirmModal(true); // Show confirmation modal
      return;
    }

    if (isCurrentlyEnabled) {
      console.log("Cancel Run")
      try {
        const cancelResponse = await fetch(`${API_BASE}/cancel-subscription-schedule`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ subscriptionId: PaygSubscriptionId }),
        });
        if (cancelResponse.ok) {
          localStorage.removeItem("isPayg")
          setShowPopup(true)
          setPopupMessage("Your PAYG Stripe has been deactivated. All active PAYG agents will be disabled.");
          setPopupType("failed"); // Pop-up for disabled
          setPaygEnabled(false)


          // Step 3: Disable PAYG for all agents by calling the payg-agents-disabled API
          const disablePaygResponse = await fetch(`${API_BASE}/payg-agents-disabled`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subscriptionId: PaygSubscriptionId }),  // Assuming PaygSubscriptionId is related to customerId
          });

          if (disablePaygResponse.ok) {
            console.log("✅ PAYG agents disabled successfully.");
          } else {
            console.log("❌ Failed to disable PAYG agents.");
          }
        }


        if (!cancelResponse.ok) {
          console.error('Failed to cancel the subscription schedule.');
          return;
        }
        // Subscription cancelled successfully, now proceed to disable PAYG
      } catch (error) {
        console.error('Error canceling subscription:', error);
        return;
      }
    }
    else {
      console.log("checkout Run")
      // console.log("d",window.location.origin)
      const currentUrl = window.location.origin
      const requestData = {
        customerId: customerId,
        priceId: "price_1Rng5W4T6s9Z2zBzhMctIN38", // Extra Minutes
        // priceId: "price_1RvBOrSCQQfKS3WDNZNTpIHS", // PAYG Extra
        promotionCode: "",
        userId: userId1,
        // agentId: agentID,
        url: `${currentUrl}/edit-profile?isPayg=true`,
        cancelUrl: `${currentUrl}/edit-profile?isPayg=false`,
        subscriptionId: PaygSubscriptionId
      };

      try {
        const t = localStorage.getItem("t")
        if (t) {
          const response = await fetch(`${API_BASE}/payg-subscription-handle`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestData)
          });

          // console.log("response2222",response.json())

          if (response.ok) {
            const responseData = await response.json();
            if (responseData.checkoutUrl) {
              // localStorage.setItem("isPayg", true)
              window.location.href = responseData.checkoutUrl;
            }
            else if (responseData.subscription) {
              setShowPopup(true)
              console.log("resume Succesfully")
              setPopupMessage("Payg resume Succesfully ");
              setPopupType("success");
              localStorage.setItem("isPayg", true)
              setPaygEnabled(true)
            }

            console.log('API response:', responseData); // You can handle the API response heree
          } else {
            console.error('Failed to send the request');
          }
        }

      } catch (error) {
        console.error('Error:', error);
      }

    }
  }
  const maskKey = (key) => '•'.repeat(key?.length || 10);
  const handleEnablePaygConfirmed = async () => {
    setConfirmLoading(true);

    try {
      const currentUrl = window.location.origin;
      const requestData = {
        customerId,
        // priceId: "price_1Rng5W4T6s9Z2zBzhMctIN38", // EXTRA MINUTES
        priceId: "price_1RvBOrSCQQfKS3WDNZNTpIHS", // PAYG Extra
        promotionCode: "",
        userId: userId1,
        url: `${currentUrl}/edit-profile?isPayg=true`,
        cancelUrl: `${currentUrl}/edit-profile?isPayg=false`,
        subscriptionId: PaygSubscriptionId
      };

      const response = await fetch(`${API_BASE}/payg-subscription-handle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData)
      });

      const responseData = await response.json();

      if (response.ok) {
        if (responseData.checkoutUrl) {
          window.location.href = responseData.checkoutUrl;
        } else if (responseData.subscription) {
          localStorage.setItem("isPayg", true);
          setPaygEnabled(true);

          // Close confirmation modal, open info popup
          setShowConfirmModal(false);
          setConfirmLoading(false);
          setPopupType("success");
          setPopupMessage("Pay As You Go resumed successfully.");
          setShowPopup(true);
        }
      } else {
        console.error('Failed to activate PAYG');
        setConfirmLoading(false);
      }
    } catch (error) {
      console.error('Error enabling PAYG:', error);
      setConfirmLoading(false);
    }
  };

  const handleDisablePaygConfirmed = async () => {
    setDisableLoading(true);
    try {
      const cancelResponse = await fetch(`${API_BASE}/cancel-subscription-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscriptionId: PaygSubscriptionId }),
      });

      if (cancelResponse.ok) {
        localStorage.removeItem("isPayg");
        setPaygEnabled(false);

        const disablePaygResponse = await fetch(`${API_BASE}/payg-agents-disabled`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ subscriptionId: PaygSubscriptionId }),
        });

        if (disablePaygResponse.ok) {
          console.log("✅ PAYG agents disabled successfully.");
        } else {
          console.log("❌ Failed to disable PAYG agents.");
        }

        // Close confirm modal, show final popup
        setShowDisableConfirmModal(false);
        setShowPopup(true);
        setPopupMessage("Your PAYG subscription has been deactivated. All active PAYG agents are now disabled.");
        setPopupType("failed");
        setHasFetched(false)
      } else {
        console.error("Failed to cancel PAYG subscription.");
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
    } finally {
      setDisableLoading(false);
    }
  };

  const [glow, setGlow] = useState(false);


  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#payg-toggle") {
      // const el = document.getElementById("payg-toggle");
      // if (el) {
      //   el.scrollIntoView({ behavior: "smooth", block: "start" });
      // }
      setGlow(true)
      setTimeout(() => {
        sectionRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }, []);


  const handleEditSection = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };





  return (
    <>
      {loading ? (
        <Loader2 />
      ) : (
        <>
          <div className={styles.card}>
            <div className={styles.profileBack}>
              <div className={styles.backIcon}>
                <img
                  src="svg/Notification.svg"
                  alt="Back-icon"
                  className={styles.imageIcon}
                  onClick={() => isPayg === "true" ? navigate('/dashboard') : handleBack()}
                />
                <p>My Account</p>
              </div>

              <div className={styles.profilePic}>
                <button
                  onClick={openUploadModal}
                  style={{ all: "unset", cursor: "pointer" }}
                >
                  {formData?.profilePicture ? (
                    <img
                      src={uploadedImage || formData.profilePicture}
                      onError={(e) => {
                        e.target.src = "/svg/profile-icon.svg";
                      }}
                      alt="Profile"
                    />
                  ) : (
                    <img
                      src={"/svg/profile-icon.svg"}
                      onError={(e) => {
                        e.target.src = "/svg/profile-icon.svg";
                      }}
                      alt="Profile"
                    />
                  )}

                  <span className={styles.editIcon}>
                    <img src="svg/edit-icon.svg" alt="edit" />
                  </span>
                </button>
              </div>
            </div>

            <div className={styles.allsectionDiv}>
              <div className={styles.infoSection}>
                <div className={styles.header}>
                  <h3>Personal Info</h3>
                  {isEditing ? (
                    <span className={styles.editText} onClick={handleCancel}>
                      <img
                        src="/svg/CrosSvg.svg" // You can change the icon if needed
                        className={styles.PurpolIcon}
                      />
                      Cancel
                    </span>
                  ) : (
                    <span className={styles.editText} onClick={handleEditSection}>
                      <img
                        src="/svg/edit-icon2.svg"
                        className={styles.PurpolIcon}
                      />
                      Edit
                    </span>
                  )}
                </div>

                <div className={styles.Part}>
                  <img src="svg/line-Profile.svg" />
                  <div className={styles.infoItem}>
                    <label>Name</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      name="name"
                      maxLength={100}
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && (
                      <p className={styles.error}>{errors.name}</p>
                    )}
                    <hr className={styles.hrLine} />
                  </div>
                </div>

                <div className={styles.Part}>
                  <img src="svg/line-email.svg" />
                  <div className={styles.infoItem}>
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      readOnly
                    />
                    {errors.email && (
                      <p className={styles.error}>{errors.email}</p>
                    )}
                    <hr className={styles.hrLine} />
                  </div>
                </div>

                {!emailVerified && formData.email !== initialData?.email && (
                  <>
                    {/* Show Send OTP Button */}
                    {!otpSent && (
                      <div
                        className={styles.Btn}
                        onClick={() => {
                          if (
                            !formData.email ||
                            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                          ) {
                            setShowPopup(true);
                            setPopupType("failed");
                            setPopupMessage(
                              "Please enter a valid email before sending OTP."
                            );
                            return;
                          }
                          handleSendOTP();
                        }}
                      >
                        <div className={styles.btnTheme}>
                          <img src="svg/svg-theme.svg" alt="" />
                          <p>
                            {sendOtpLoading ? <Loader size={18} /> : "Send OTP"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Show OTP Input UI if OTP sent */}
                    {otpSent && (
                      <>
                        {/* {formData.email && (
                        <p className={styles.codeText}>
                          Email has been sent to <strong>{formData.email}</strong>
                        </p>
                      )} */}
                        <p className={styles.codeText}>
                          Enter the code sent to your email
                        </p>
                        <br />
                        <div className={styles.otpContainer}>
                          {[...Array(6)].map((_, i) => (
                            <input
                              key={i}
                              maxLength="1"
                              value={otp[i]}
                              onChange={(e) =>
                                handleOtpChange(e.target.value, i)
                              }
                              className={styles.otpInput}
                              onKeyDown={(e) => handleKeyDown(e, i)}
                              ref={(el) => (inputRefs.current[i] = el)}
                              inputMode="numeric"
                              type="tel"
                            />
                          ))}
                        </div>

                        {/* Resend OTP */}
                        <div className={styles.resendContainer}>
                          <button
                            type="button"
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
                            {isResendDisabled
                              ? `Resend OTP in ${String(
                                Math.floor(resendTimer / 60)
                              ).padStart(2, "0")}:${String(
                                resendTimer % 60
                              ).padStart(2, "0")}`
                              : "Resend OTP"}
                          </button>
                        </div>
                        {/* Verify Button */}
                        <div
                          className={styles.Btn}
                          onClick={
                            isOtpFilled && !isVerifyingOtp
                              ? handleVerifyOtp
                              : undefined
                          }
                          style={{
                            opacity: isOtpFilled && !isVerifyingOtp ? 1 : 0.5,
                            pointerEvents:
                              isOtpFilled && !isVerifyingOtp ? "auto" : "none",
                            cursor:
                              isOtpFilled && !isVerifyingOtp
                                ? "pointer"
                                : "not-allowed",
                          }}
                        >
                          <div type="submit">
                            <div className={styles.btnTheme}>
                              <img src="svg/svg-theme.svg" alt="" />
                              <p>
                                {isVerifyingOtp ? (
                                  <Loader size={17} />
                                ) : (
                                  "Verify Email"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
                <div className={styles.Part}>
                  <img src="svg/line-Call.svg" />
                  <div className={styles.infoItem}>
                    <label>Phone Number</label>
                    <PhoneInput
                      country={"in"}
                      value={formData.phone}
                      disabled={!isEditing}
                      className={styles.phoneInput}
                      onChange={(val) => {
                        setFormData((prev) => ({
                          ...prev,
                          phone: val,
                        }));
                        if (errors.phone) {
                          setErrors((prev) => ({ ...prev, phone: "" }));
                        }
                      }}
                      inputClass={errors.phone ? styles.inputError : ""}
                      inputProps={{
                        name: "phone",
                        required: true,
                        autoFocus: false,
                      }}
                    />
                    {errors.phone && (
                      <p className={styles.error}>{errors.phone}</p>
                    )}
                    <hr className={styles.hrLine} />
                  </div>
                </div>
                <div className={styles.Part}>
                  <img src="svg/line-address.svg" />
                  <div className={styles.infoItem}>
                    <label>Home address</label>
                    <textarea
                      name="address"
                      placeholder="Please enter address"
                      value={formData.address}
                      onChange={handleChange}
                      maxLength={10000}
                      disabled={!isEditing}
                    />
                    <hr className={styles.hrLine} />
                  </div>


                </div>
                <div
                  type="submit"
                  onClick={
                    isDataChanged() && !addLoading
                      ? formData.email === initialData?.email || emailVerified
                        ? handleSubmit
                        : () => {
                          setShowPopup(true);
                          setPopupType("failed");
                          setPopupMessage(
                            "Please verify your new email before saving."
                          );
                        }
                      : undefined
                  }
                  style={{
                    opacity:
                      isDataChanged() &&
                        (formData.email === initialData?.email || // email not changed
                          (formData.email !== initialData?.email &&
                            emailVerified)) // email changed & verified
                        ? 1
                        : 0.5,
                    pointerEvents:
                      isDataChanged() &&
                        (formData.email === initialData?.email ||
                          (formData.email !== initialData?.email &&
                            emailVerified)) &&
                        !addLoading
                        ? "auto"
                        : "none",
                    cursor:
                      isDataChanged() &&
                        (formData.email === initialData?.email ||
                          (formData.email !== initialData?.email &&
                            emailVerified)) &&
                        !addLoading
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  {isEditing && <div className={styles.btnTheme}>
                    <img src="svg/svg-theme.svg" alt="" />
                    <p>
                      {addLoading ? (
                        <>
                          Saving... &nbsp; <Loader size={18} />
                        </>
                      ) : (
                        "Save"
                      )}
                    </p>
                  </div>}
                </div>
              </div>
              <div className={`${styles.infoSection} ${glow ? styles.glowOnce : ""}`}
                ref={sectionRef} id="payg-toggle">
                <div className={styles.toggleContainer1}>
                  <div className={styles.toggleTextAbove}>Enable Pay as you go Feature</div>
                  <label className={styles.toggleLabel1}>
                    <input
                      type="checkbox"
                      checked={paygEnabled}
                      onChange={handlePaygToggle}
                      className={styles.toggleInput1}
                    />
                    <span
                      className={`${styles.toggleSlider1} ${paygEnabled ? styles.active1 : ''}`}
                    // className={`${styles.toggleSlider1} ${styles.active1}`}
                    />
                  </label>
                </div>
              </div>
              {/* Zapier Section */}
              {/* <div className={styles.infoSection} style={{ marginTop: '20px' }}>
                <div className={styles.toggleTextAbove} style={{ marginBottom: '8px' }}>
                  Get your Zapier key & Client Key
                  <i
                    onClick={() => setZapierVisible(!zapierVisible)}
                    style={{ cursor: 'pointer', marginLeft: '20px' }}
                    title={zapierVisible ? 'Hide Key' : 'Show Key'}
                    className={`fas ${zapierVisible ? 'fa-eye-slash' : 'fa-eye'}`}
                  ></i>
                  {zapierVisible && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(zapApikey);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        background: '#f5f5f5',
                        fontSize: '12px',
                        cursor: 'pointer',
                        position: "absolute",
                        right: "0px",
                        top: "2px"
                      }}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
                <div className={styles.toggleContainer1}>
                  {zapierVisible && (
                    <div
                      style={{
                        borderRadius: '5px',
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                      }}
                    >
                      <div style={{ marginTop: '5px' }}>
                        {zapApikey}
                      </div>
                    </div>
                  )}
                </div>
              </div> */}

              <div className={styles.infoSection} style={{ marginTop: '20px' }}>
                <h2 className={styles.heading}>Keys & Credentials</h2><br />

                {/* Client Key Section */}
                <div className={styles.keyContainer} style={{ marginBottom: '16px' }}>
                  <div className={styles.toggleTextAbove} style={{ marginBottom: '8px' }}>
                    Client Id
                    <i
                      onClick={() => setClientVisible(!clientVisible)}
                      style={{ cursor: 'pointer', marginLeft: '12px' }}
                      title={clientVisible ? 'Hide Key' : 'Show Key'}
                      className={`fas ${clientVisible ? 'fa-eye-slash' : 'fa-eye'}`}
                    ></i>
                  </div>
                  <div
                    style={{
                      borderRadius: '5px',
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                      padding: '8px',
                      background: '#f9f9f9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <span>{clientVisible ? clientId : maskKey(clientId)}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(clientId);
                        setCopiedClient(true);
                        setTimeout(() => setCopiedClient(false), 2000);
                      }}
                      disabled={!clientVisible}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        background: clientVisible ? '#f5f5f5' : '#e0e0e0',
                        fontSize: '12px',
                        cursor: clientVisible ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {copiedClient ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Zapier Key Section */}
                <div className={styles.keyContainer}>
                  <div className={styles.toggleTextAbove} style={{ marginBottom: '8px' }}>
                    Zap Key
                    <i
                      onClick={() => setZapierVisible(!zapierVisible)}
                      style={{ cursor: 'pointer', marginLeft: '12px' }}
                      title={zapierVisible ? 'Hide Key' : 'Show Key'}
                      className={`fas ${zapierVisible ? 'fa-eye-slash' : 'fa-eye'}`}
                    ></i>
                  </div>
                  <div
                    style={{
                      borderRadius: '5px',
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                      padding: '8px',
                      background: '#f9f9f9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <span>{zapierVisible ? zapApikey : maskKey(zapApikey)}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(zapApikey);
                        setCopiedZapier(true);
                        setTimeout(() => setCopiedZapier(false), 2000);
                      }}
                      disabled={!zapierVisible}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        background: zapierVisible ? '#f5f5f5' : '#e0e0e0',
                        fontSize: '12px',
                        cursor: zapierVisible ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {copiedZapier ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
              <div className={styles.RefferalMain}>
              </div>
              <br></br>
              {/* <div className={styles.RefferalMain}>
                 <Refferal
                  referralCode={referralCode}
                  setShowDashboardReferral={setShowDashboardReferral}
                  showDashboardReferral={showDashboardReferral}
                  userId={userId}
                /> 
              </div> */}
              <div className={styles.mySubscription}>
                <MySubscription agents={subscriptionDetails?.agents || []} />
              </div>
              <div className={styles.billingInvoice}>
                <BillingInvoices invoices={subscriptionDetails?.invoices || []} />
              </div>
            </div>
            <div className={styles.deleteSection}>
              <button
                className={styles.deleteButton}
                onClick={() => nevigate("/delete-account")}
              >
                <img src="/svg/delete-icon.svg" alt="delete" />
                Delete Profile
              </button>
            </div>
          </div>
          {isUploadModalOpen && (
            <UploadProfile
              onClose={closeUploadModal}
              onUpload={handleUpload}
              currentProfile={
                uploadedImage ||
                formData.profilePicture ||
                "Images/editProfile.png"
              }
            />
          )}
        </>
      )}
      {showPopup && (
        <PopUp
          type={popupType}
          onClose={() => handleClosePopup()}
          message={popupMessage}
          extraButton={
            redirectButton
              ? {
                label: "Redirect",
                onClick: () => navigate("/dashboard"),
              }
              : undefined
          }
        />
      )}


      <ConfirmModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Enable Pay As You Go"
        message="Enabling Pay As You Go gives your account unlimited flexibility — no more minute caps. Once your current plan minutes are used, you can activate/deactivate PAYG for your agents, and billing will start based on usage."
        type="info"
        confirmText={confirmLoading ? "Processing..." : "Yes"}
        cancelText="Later"
        showCancel={true}
        isLoading={confirmLoading}
        onConfirm={handleEnablePaygConfirmed}
      />

      <ConfirmModal
        show={showDisableConfirmModal}
        onClose={() => setShowDisableConfirmModal(false)}
        title="Disable Pay As You Go?"
        message="Are you sure you want to disable Pay As You Go? All active PAYG agents will be deactivated immediately. Your final bill will be generated at the end of your current PAYG billing cycle and will be automatically deducted from your account."
        type="warning"
        confirmText={disableLoading ? "Disabling..." : "Yes, Disable"}
        cancelText="Cancel"
        showCancel={true}
        isLoading={disableLoading}
        onConfirm={handleDisablePaygConfirmed}
      />




    </>
  );
};

export default EditProfile;
