import React, { useState, useRef, useEffect } from 'react';
import EditHeader from '../EditHeader/EditHeader';
import styles from '../EditBusinessType/EditBusinessType.module.css';
import AnimatedButton from '../AnimatedButton/AnimatedButton';

import Tooltip from '../TooltipSteps/Tooltip';

import decodeToken from '../../lib/decodeToken';
import PopUp from '../Popup/Popup';
import { useAgentCreator } from '../../hooks/useAgentCreator';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../Store/agentZustandStore';
import { businessTypes } from "../../lib/businessCategories"

const EditBusinessType = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [businessType, setBusinessType] = useState("");
  const [subType, setSubType] = useState("")
  const [businessSize, setBusinessSize] = useState("")
  const [customBuisness, setcustomBuisness] = useState("");
  const [prevBuisnessType, setprevBuisnessType] = useState("");
  const [businessNameError, setBusinessNameError] = useState("");
  const [businessSizeError, setBusinessSizeError] = useState("");
  const [businessTypeError, setBusinessTypeError] = useState("");
  const [serviesTypeError, setServiesTypeError] = useState("");
  const [errors, setErrors] = useState({});
  const token = localStorage.getItem("token");
  const decodeTokenData = decodeToken(token);
  const agentnm = sessionStorage.getItem("agentName");
  const [businessTypeSubmitted, setBusinessTypeSubmitted] = useState(false);
  const [businessNameSubmitted, setBusinessNameSubmitted] = useState(false);
  const [businessSizeSubmitted, setBusinessSizeSubmitted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [Loading, setLoading] = useState(null);
  const navigate = useNavigate();
  const { setHasFetched } = useDashboardStore();
  const userId = decodeTokenData?.id;
  const selectedRef = useRef(null);
  const [isChanged, setIsChanged] = useState(false);
  const [initialDetails, setInitialDetails] = useState(null);
  const subType1 = sessionStorage.getItem("subType");
  const { handleCreateAgent } = useAgentCreator({
    stepValidator: () => "EditBusinessType",
    setLoading,
    setPopupMessage,
    setPopupType,
    setShowPopup,
    navigate,
    setHasFetched,
  });

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [businessType]);
  const filteredBusinessTypes = (searchTerm) => {
    if (!searchTerm) {
      // Agar search empty hai, to sirf selected show karna hai
      if (subType && businessType) {
        const selected = businessTypes.find((bt) =>
          (bt.subtypes || []).includes(businessType)
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
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("businessDetails");

      if (stored && stored !== "undefined" && stored !== "null") {
        const businessDetails = JSON.parse(stored);
        
        setInitialDetails(businessDetails);
        if (businessDetails) {
          setBusinessType(businessDetails?.businessType || "");
          setprevBuisnessType(businessDetails?.businessType || "");
          if (!sessionStorage.getItem("prevBuisnessType")) {
            sessionStorage.setItem("prevBuisnessType", businessDetails?.businessType)
          }
          setBusinessSize(businessDetails?.businessSize || "");
          setcustomBuisness(businessDetails?.customBuisness || "");
        }
      }
    } catch (err) {
      console.error("Failed to parse businessDetails from sessionStorage:", err);
    }
  }, []);

  const handleBusinessSizeChange = (e) => {
    setBusinessSize(e.target.value);
  };

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
  const handleBusinessTypeChange = (item) => {
    // console.log(e.target.value)
    setSubType(item.subType);
    setBusinessType(item.businessType);


    if (item.businessType !== "Other") {
      setcustomBuisness(""); // Clear textbox if not "Other"
      updateSessionBusinessDetails("businessType", item.businessType);
      sessionStorage.removeItem("showInput");
    }
    updateSessionBusinessDetails("businessType", item.businessType);
    updateSessionBusinessDetails("subType", item.subType);

    // console.log("businessTypeSubmitted", businessTypeSubmitted);
    if (businessTypeSubmitted) {
      setBusinessTypeError("");
    }


  };

  const handlesave = () => {
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
        businessSize,
      };
      // navigate("/about-business-next");
    } else {
      businessData = {
        userId,
        businessType,
        businessSize,
        subType
      };

      // navigate("/business-services");
    }
    sessionStorage.setItem("businessDetails", JSON.stringify(businessData));
    // console.log('dsdsdsdsd',prevBuisnessType, businessType)
    if (sessionStorage.getItem("prevBuisnessType") != businessType) {
      setPopupType("confirm");
      setPopupMessage(
        "Business type changed please change the related business services!"
      );
      setShowPopup(true);
    } else {
      handleCreateAgent();
      // setHasFetched(false)

    }

  };
  useEffect(() => {
    try {
      if (initialDetails) {
        const isTypeChanged = initialDetails?.businessType !== businessType;
        const isSubTypeChanged = initialDetails?.subType !== subType;

        const isCustomChanged = (initialDetails?.customBuisness || "") !== customBuisness;
        // setIsChanged(isTypeChanged, isSubTypeChanged, isCustomChanged);
        setIsChanged(isTypeChanged || isSubTypeChanged || isCustomChanged);

      } else {
        setIsChanged(true);
      }
    } catch (err) {
      console.error("Failed to parse businessDetails from sessionStorage:", err);
      setIsChanged(true);
    }
  }, [businessType, customBuisness, initialDetails, subType]);
  useEffect(() => {
    setSubType(subType1)
  }, [])
  return (
    <>
      <EditHeader title='Edit Agent ' agentName={agentnm} />
      <div className={styles.Maindiv}>
        <div className={styles.headerWrapper}>
          <h2 className={styles.heading}>Select Category</h2>
          <p className={styles.subheading}>Select category     best describes your business type</p>

        </div>


        <div className={styles.section}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>
              <img src='svg/Search-Icon.svg' alt='Search icon' />
            </span>
            <input
              type='text'
              placeholder='Quick find Business type'
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.ListDiv}>
            <div className={styles.optionList}>
              {/* {filteredBusinessTypes.length > 0 ? (
                // filteredBusinessTypes
                [...filteredBusinessTypes]
                  .sort((a, b) => a.type.localeCompare(b.type))
                  .map((item, index) => (
                    <label className={styles.option} key={index}  ref={businessType === item.type ? selectedRef : null}> 
                      <div className={styles.forflex}>
                        <div className={styles.icon}>
                          <img src={item.icon} alt={`${item.type} icon`} className={styles.iconImg} />
                        </div>
                        <div className={styles.strongDiv}>
                          <strong>{item.type}</strong>
                          <p className={styles.subType}>{item.subtype}</p>
                        </div>
                      </div>

                      <div>
                        <input
                          type='radio'
                          name='businessType'
                          value={item.type}
                          checked={businessType === item.type}
                          onChange={handleBusinessTypeChange}
                          
                        />
                      </div>
                    </label>
                  ))
              ) : (
                <div className={styles.noResult}>No results found</div>
              )} */}
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
          {/* <div className={styles.inputGroup}>
            <label>Business Size (Number of Emp.)</label>
            <select className={styles.selectInput}
              value={businessSize}
              onChange={handleBusinessSizeChange}
            >
              <option value="" disabled className={styles.selectOption}>
                Number of Employe
              </option>
              <option value="1 to 10 employees" className={styles.selectOption}>
                1 to 10 employees
              </option>
              <option value="10 to 50 employees" className={styles.selectOption}>
                10 to 50 employees
              </option>
              <option value="50 to 100 employees" className={styles.selectOption}>
                50 to 100 employees
              </option>
              <option value="100 to 250 employees" className={styles.selectOption}>
                100 to 250 employees
              </option>
              <option value="250 to 500 employees" className={styles.selectOption}>
                250 to 500 employees
              </option>
              <option value="500 to 1000 employees" className={styles.selectOption}>
                500 to 1000 employees
              </option>
              <option value="1000+ employees" className={styles.selectOption}>
                1000+ employees
              </option>
            </select>


          </div> */}
          <div className={styles.stickyWrapper}
            // onClick={handlesave}
            style={{
              position: "sticky",
              bottom: 0,
              backgroundColor: "white",
              padding: "8px",
              opacity: isChanged ? 1 : 0.5,
              cursor: isChanged ? "pointer" : "not-allowed"
            }}
            onClick={isChanged ? handlesave : undefined}
          >
            <AnimatedButton label="Save" isLoading={Loading} position={{ position: 'relative' }} disabled={!isChanged} />
          </div>
        </div>
        {showPopup && (
          <PopUp
            type={popupType}
            onClose={() => { setShowPopup(false) }}
            message={popupMessage}
            onConfirm={() => navigate('/edit-services-offered')}
          />
        )}
      </div>
    </>
  );
};

export default EditBusinessType;
