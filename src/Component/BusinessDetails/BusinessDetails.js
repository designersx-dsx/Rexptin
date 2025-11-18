import React, {
  useEffect, useState, useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "../BusinessDetails/BusinessDetails.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import PopUp from "../Popup/Popup";
import decodeToken from "../../lib/decodeToken";
import { getUserAgentMergedDataForAgentUpdate } from "../../Store/apiStore";
import { useAgentCreator } from "../../hooks/useAgentCreator";
import Loader from "../Loader/Loader";
import useCheckAgentCreationLimit from "../../hooks/useCheckAgentCreationLimit";
import { businessTypes } from "../../lib/businessCategories"
const BusinessDetails = forwardRef(({ onNext, onBack, onValidationError, onStepChange }, ref) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [subType, setSubType] = useState("")
  const [businessName, setBusinessName] = useState("");
  const [businessSize, setBusinessSize] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [Loading, setLoading] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const token = localStorage.getItem("token");
  const decodeTokenData = decodeToken(token);
  const userId = decodeTokenData?.id;
  const stepEditingMode = localStorage.getItem('UpdationModeStepWise')
  const EditingMode = localStorage.getItem('UpdationMode')
  const setHasFetched = true
  const listRef = useRef(null);
   const isIphone = /iPhone|iPod/i.test(navigator.userAgent);
  const { handleCreateAgent } = useAgentCreator({
    stepValidator: () => "BusinessDetails",
    setLoading,
    setPopupMessage,
    setPopupType,
    setShowPopup,
    navigate,
    setHasFetched,
  });
  const [businessNameError, setBusinessNameError] = useState("");
  const [businessSizeError, setBusinessSizeError] = useState("");
  const [businessTypeError, setBusinessTypeError] = useState("");
  const [serviesTypeError, setServiesTypeError] = useState("");
  const [errors, setErrors] = useState({});
  // Submission state trackers
  const [businessTypeSubmitted, setBusinessTypeSubmitted] = useState(false);
  const [businessNameSubmitted, setBusinessNameSubmitted] = useState(false);
  const [businessSizeSubmitted, setBusinessSizeSubmitted] = useState(false);
  const [customBuisness, setcustomBuisness] = useState("");
  const [prevBuisnessType, setprevBuisnessType] = useState("");
  const { isLimitExceeded, CheckingUserLimit } = useCheckAgentCreationLimit(userId);
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("businessDetails");
      if (stored && stored !== "undefined" && stored !== "null") {
        const businessDetails = JSON.parse(stored);
        if (businessDetails) {
          setBusinessType(businessDetails.businessType || "");
          setprevBuisnessType(businessDetails.businessType || "");
          setBusinessName(businessDetails.businessName || "");
          setBusinessSize(businessDetails.businessSize || "");
          setcustomBuisness(businessDetails.customBuisness || "");
        }
      }
    } catch (err) {
      console.error("Failed to parse businessDetails from sessionStorage:", err);
    }
  }, []);
  const validateBusinessSize = (value) => {
    if (!value?.trim()) return "Business size is required.";
    const allowedValues = [
      "1 to 10 employees",
      "10 to 50 employees",
      "50 to 100 employees",
      "100 to 250 employees",
      "250 to 500 employees",
      "500 to 1000 employees",
      "1000+ employees"
    ];
    if (!allowedValues?.includes(value)) {
      return "Invalid business size selected.";
    }
    return "";
  };

  const validateServices = (value) => {
    if (businessType === "Other" && !value.trim()) {
      return "Business type is required.";
    }
    return "";
  };

  const handleBusinessSizeChange = (e) => {
    setBusinessSize(e.target.value);
  };

  const handleBusinessTypeChange = (item) => {
    setSubType(item.subType)
    setBusinessType(item.businessType);
    sessionStorage.setItem("subType", item.subType);

    if (item.businessType !== "Other") {
      setcustomBuisness(""); // Clear textbox if not "Other"
      updateSessionBusinessDetails("businessType", item.businessType);
      sessionStorage.removeItem("showInput");
    }
    updateSessionBusinessDetails("businessType", item.businessType);
    if (businessTypeSubmitted) {
      setBusinessTypeError("");
    }
  };
  const updateSessionBusinessDetails = (key, value) => {
    let existing = {};
    try {
      const stored = sessionStorage.getItem("businessDetails");

      if (stored && stored !== "undefined" && stored !== "null") {
        existing = JSON.parse(stored);
        // selectedServices
        sessionStorage.removeItem("selectedServices");
        sessionStorage.removeItem("businesServices");
      }
    } catch (e) {
      console.error("Error parsing sessionStorage businessDetails:", e);
    }

    const updated = {
      ...existing,
      [key]: value,
    };
    sessionStorage.setItem("businessDetails", JSON.stringify(updated));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredBusinessTypes = (searchTerm) => {
    if (!searchTerm) {
      // Agar search empty hai, to sirf selected show karna hai
      if (subType && businessType) {
        const selected = businessTypes.find((bt) =>
          (bt.subtypes || []).includes(subType)
        );
        if (selected) {
          return [{
            businessType: selected.type,
            subType,
            icon: selected.icon,
          }];
        }
      }
      return [];
    }


    let results = [];

    businessTypes.forEach((item) => {
      // search in subtype (main description)

      // search in subtypes array
      (item.subtypes || []).forEach((sub) => {
        if (sub.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            businessType: item.type,
            subType: sub,
            icon: item.icon
          });
        }
      });

      // search in type itself
      if (item.type.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({
          businessType: item.type,
          subType: item.subtype,
          icon: item.icon
        });
      }
    });
    return results;
  };
  const handleLoginClick = () => {
    // Mark all as submitted to show errors
    setBusinessTypeSubmitted(true);
    setBusinessNameSubmitted(true);
    setBusinessSizeSubmitted(true);

    // Validate all fields
    let hasError = false;

    if (prevBuisnessType != businessType) {
      sessionStorage.removeItem("selectedServices");
      sessionStorage.removeItem("selectedCustomServices");
      const raw = sessionStorage.getItem("businesServices");
      let previous = {};
      try {
        previous = raw ? JSON.parse(raw) : {};
      } catch (err) {
        console.error("Failed to parse businesServices:", err);
      }

      const updatedBusinessServices = {
        selectedService: [],
        email: previous.email,
      };
      sessionStorage.setItem("businesServices", JSON.stringify(updatedBusinessServices));
    }

    if (!businessType) {
      setBusinessTypeError("Please select a business type.");
      hasError = true;
    } else {
      setBusinessTypeError("");
    }
    // const sizeError = validateBusinessSize(businessSize);
    // if (sizeError) {
    //   setBusinessSizeError(sizeError);
    //   hasError = true;
    // } else {
    //   setBusinessSizeError("");
    // }
    const serviceError = validateServices(customBuisness);
    if (serviceError) {
      setErrors((prev) => ({ ...prev, customBuisness: serviceError }));
      hasError = true;
    } else {
      setErrors((prev) => ({ ...prev, customBuisness: "" }));
    }
    if (hasError) return;
    let businessData;
    // No errors - proceed
    if (businessType === "Other" && customBuisness.trim()) {
      businessData = {
        userId,
        businessType: "Other",
        customBuisness: customBuisness.trim(),
        businessName: businessName.trim(),
        businessSize,
      };
      if (businessSize) {
        businessData.businessSize = businessSize;
      }
      // navigate("/about-business-next");
    } else {
      businessData = {
        userId,
        businessType,
        businessName: businessName.trim(),
        businessSize,
      };
      if (businessSize) {
        businessData.businessSize = businessSize;
      }
      // navigate("/business-services");
    }
    sessionStorage.setItem("businessDetails", JSON.stringify(businessData));
    onStepChange?.(1);
  };
  const handleSaveEdit = (e) => {
    e.preventDefault();

    if (prevBuisnessType != businessType) {
      sessionStorage.removeItem("selectedServices");
      sessionStorage.removeItem("selectedCustomServices");
      const raw = sessionStorage.getItem("businesServices");
      let previous = {};
      try {
        previous = raw ? JSON.parse(raw) : {};
      } catch (err) {
        console.error("Failed to parse businesServices:", err);
      }

      const updatedBusinessServices = {
        selectedService: [],
        email: previous.email,
      };
      sessionStorage.setItem("businesServices", JSON.stringify(updatedBusinessServices));
    }
    const businessData = {
      userId,
      businessType,
      businessName: businessName.trim(),
      customBuisness: customBuisness.trim(),
      businessSize,
    };
    sessionStorage.setItem("businessDetails", JSON.stringify(businessData));
    if (prevBuisnessType != businessType) {
      setPopupType("confirm");
      setPopupMessage("Business type changed please change the related business services!");
      setShowPopup(true);
    }
    else {
      handleCreateAgent()
    }
  };
  //Using Error Handling
  useImperativeHandle(ref, () => ({
    validate: () => {
      // Validate business type

      if (!businessType) {

        setBusinessTypeError("Please select a business type.");
        onValidationError?.({
          type: "failed",
          message: "Please select a business type.",
        });
        return false;
      } else {
        setBusinessTypeError("");
      }


      // useEffect(() => {
      //   if (!CheckingUserLimit && isLimitExceeded && !EditingMode) {
      //     setShowPopup(true);
      //     setPopupType('failed');
      //     setPopupMessage("Agent creation limit exceeded. Please upgrade your plan!");
      //   }
      // }, [CheckingUserLimit, isLimitExceeded]);

      // if (CheckingUserLimit) return 

      // Validate business size
      // if (!businessSize) {
      //   setBusinessSizeError("Please select a business size.");
      //   onValidationError?.({
      //     type: "failed",
      //     message: "Please select a business size.",
      //   });
      //   return false;
      // } else {
      //   setBusinessSizeError("");
      // }
      // Validate custom business if "Other" is selected
      const serviceError = validateServices(customBuisness);
      if (serviceError) {
        setErrors((prev) => ({ ...prev, customBuisness: serviceError }));
        onValidationError?.({
          type: "failed",
          message: serviceError,
        });
        return false;
      } else {
        setErrors((prev) => ({ ...prev, customBuisness: "" }));
      }


      return true; // No errors
    },
    save: async () => {
      handleLoginClick()
    }
  }));
  const handleClosePopup = () => {
    if (!CheckingUserLimit && isLimitExceeded && !EditingMode) {
      navigate('/dashboard');
      setShowPopup(false);
    } else {
      setShowPopup(false);
    }
  }
  useEffect(() => {
    if (!CheckingUserLimit && isLimitExceeded && !EditingMode) {
      setShowPopup(true);
      setPopupType('failed');
      setPopupMessage("Agent creation limit exceeded. Please upgrade your plan!");
    }
  }, [CheckingUserLimit, isLimitExceeded]);
  useEffect(() => {
    const savedBusinessType = sessionStorage.getItem("businessType");
    const savedSubType = sessionStorage.getItem("subType");

    if (savedBusinessType) setBusinessType(savedBusinessType);
    if (savedSubType) setSubType(savedSubType);
  }, []);
  const scrollListIntoView = () => {
    if (listRef.current) {
      listRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };
  return (
    <div className={styles.container}>
      {/* <h1 className={styles.title}>{EditingMode ? ' Edit: Business Details' : 'Business Details'}</h1> */}
      <div className={styles.searchBox} ref={listRef}>
        <span className={styles.searchIcon}>
          <img src="svg/Search-Icon.svg" alt="Search icon" />
        </span>
        <input
          type="text"
          placeholder="Quick find Business type"
          className={styles.searchInput}
          value={searchTerm}

          onChange={(e) => {
            handleSearchChange(e);
            // setTimeout(scrollListIntoView, 300);
          }}

          onFocus={((e) => {
            setTimeout(scrollListIntoView, 300);
          })
          }
          onClick={() => {
            setTimeout(scrollListIntoView, 300);
          }}
        />
      </div>
      <div className={styles.ListDiv} >
        <div className={styles.optionList}>
          {filteredBusinessTypes(searchTerm).length > 0 ? (
            filteredBusinessTypes(searchTerm).map((item, index) => (
              <label className={styles.option} key={index}>
                <div className={styles.forflex}>
                  <div className={styles.icon}>
                    <img
                      src={item.icon}
                      alt={`${item.type} icon`}
                      className={styles.iconImg}
                    />
                  </div>
                  <div className={styles.strongDiv}>
                    <strong>{item.subType}</strong>
                    <p className={styles.subType}>{item.businessType}</p>
                  </div>
                </div>

                <div>
                  <input
                    type="radio"
                    name="businessType"
                    value={item.subType}
                    checked={subType === item.subType}
                    onChange={() => handleBusinessTypeChange(item)}
                  />
                </div>
              </label>
            ))
          ) : (
            <p className={styles.noItemFound}>Lets Find Your Business</p>
          )}

        </div>
      </div>


      {businessTypeSubmitted && businessTypeError && (
        <p className={styles.inlineError}>{businessTypeError}</p>
      )}


      {/* Conditional textbox for "Other" */}
      {businessType === "Other" && (
        <div className={styles.labReq}>
          <div className={styles.inputGroup}>
            <div className={styles.Dblock}>
              <label>Business Type<span className={styles.requiredField}> *</span></label>
              <input
                type="text"
                placeholder="Enter your service name"
                value={customBuisness}
                onChange={(e) => setcustomBuisness(e.target.value)}
                className={businessNameError ? styles.inputError : ""}
              />
              {errors.customBuisness && (
                <p className={styles.inlineError}>{errors.customBuisness}</p>
              )}
            </div>
          </div>
        </div>
      )}
      {showPopup && (
        <PopUp
          type={popupType}
          onClose={() => handleClosePopup()}
          message={popupMessage}
          onConfirm={handleCreateAgent}
        />
      )}
    </div>
  );
});

export default BusinessDetails;

