import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "../BusinessServices/BusinessServices.module.css";
import { useNavigate } from "react-router-dom";
import { validateEmail as validateEmailAPI } from "../../Store/apiStore";
import PopUp from "../Popup/Popup";
import { useAgentCreator } from "../../hooks/useAgentCreator";
import axios from "axios";
import { API_BASE_URL } from "../../Store/apiStore";
import decodeToken from "../../lib/decodeToken";
import Loader from "../Loader/Loader";
import { businessServices } from "../../lib/businessServices"
const BusinessServices = forwardRef(
  (
    {
      onNext,
      onBack,
      onValidationError,
      onSuccess,
      onFailed,
      setLoading,
      onStepChange,
    },
    ref
  ) => {
    const navigate = useNavigate();
    const [businessType, setBusinessType] = useState("Restaurant");
    const [selectedService, setSelectedService] = useState([]);
    const [email, setEmail] = useState("");
    // Error states
    const [serviceError, setServiceError] = useState("");
    const [popupMessage, setPopupMessage] = useState("");
    const [popupType, setPopupType] = useState("");
    //Add More Custom Services
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [customServices, setCustomServices] = useState(() => {
      const saved = sessionStorage.getItem("customServices");
      return saved ? JSON.parse(saved) : [];
    });
    const [showPopup, setShowPopup] = useState(false);
    const EditingMode = localStorage.getItem("UpdationMode");
    const [customServiceSelected, setCustomServiceSelected] = useState(false);
    const checkIfBusinessIdExist = Boolean(sessionStorage.getItem("bId"));
    const token = localStorage.getItem("token");
    const decodeTokenData = decodeToken(token);
    const userId = decodeTokenData?.id;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scrollToBottomRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");
    const selectedBusiness =
      businessServices.find((biz) => biz?.type === businessType) ||
      (businessType === "Other" &&
        businessServices?.find((biz) => biz?.type === "Other Local Business"));
    const listRef = useRef(null);
    const defaultServices = selectedBusiness?.services || [];
    const allServices = [...defaultServices, ...customServices];
    const isIphone = /iPhone|iPod/i.test(navigator.userAgent);
    const flatServices = allServices.flatMap((item) => {
      if (typeof item === "string") return [item];
      if (typeof item === "object" && Array.isArray(item.services)) {
        return item.services;
      }
      return []; // skip invalid entries
    });

    const filteredServices = flatServices.filter(
      (service) =>
        typeof service === "string" &&
        service.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleContinue = async () => {
      if (isSubmitting) return; // Prevent double call
      setIsSubmitting(true);
      const raw = sessionStorage.getItem("businesServices");
      let previous = {};
      try {
        previous = raw ? JSON.parse(raw) : {};
      } catch (err) {
        console.error("Failed to parse businesServices:", err);
      }
      const updatedBusinessServices = {
        ...previous,
        selectedService,
        email,
      };
      sessionStorage.setItem(
        "businesServices",
        JSON.stringify(updatedBusinessServices)
      );
      const businessDetailsRaw = sessionStorage.getItem("businessDetails");
      const businessDetails = businessDetailsRaw
        ? JSON.parse(businessDetailsRaw)
        : {};

      const finalBusinessDetails = {
        ...businessDetails,
        selectedService,
        email,
      };

      sessionStorage.setItem(
        "businessDetails",
        JSON.stringify(finalBusinessDetails)
      );

      sessionStorage.setItem(
        "selectedServices",
        JSON.stringify(selectedService)
      );
      const subType = sessionStorage.getItem("subType")
      try {
        setLoading(true);
        const API_URL = checkIfBusinessIdExist
          ? `${API_BASE_URL}/businessDetails/updateBusinessDetailsByUserIDandBuisnessID/${decodeToken(localStorage.getItem("token")).id
          }?businessId=${sessionStorage.getItem("bId")}`
          : `${API_BASE_URL}/businessDetails/create`;
        const response = await axios({
          method: checkIfBusinessIdExist ? "PATCH" : "POST",
          url: API_URL,
          data: {
            userId: decodeToken(localStorage.getItem("token")).id,
            businessName: finalBusinessDetails.businessName,
            businessSize: finalBusinessDetails.businessSize,
            businessType: finalBusinessDetails.businessType,
            customBuisness: finalBusinessDetails.customBuisness || "",
            buisnessEmail: email,
            buisnessService: selectedService,
            customServices: [],
            subType: subType
          },
        });

        const id = response?.data?.record?.businessId;
        if (!checkIfBusinessIdExist) {
          sessionStorage.setItem("AgentCode", response?.data?.agentCode);
        }
        if (id) {
          sessionStorage.setItem("bId", id);
          sessionStorage.setItem(
            "businessId",
            JSON.stringify({ businessId: id })
          );
        }
        if (onSuccess && !checkIfBusinessIdExist) {
          onSuccess({
            message: "Business details saved successfully",
          });
        }
        setTimeout(() => {
          onStepChange?.(3);
        }, 1000);
      } catch (error) {
        console.error("❌ Error saving business details:", error);
        if (onFailed) {
          onFailed({
            message: "Failed to save business details.",
          });
        }
      } finally {
        setLoading(false);
        setIsSubmitting(false); // Allow retry
      }
    };
    const handleServiceToggle = (service) => {
      const updated = selectedService.includes(service)
        ? selectedService.filter((s) => s !== service)
        : [...selectedService, service];

      setSelectedService(updated);
      setServiceError("");
      setCustomServiceSelected(updated.includes("Other"));

      //  Always store it under `selectedService` key
      const previous = JSON.parse(
        sessionStorage.getItem("businesServices") || "{}"
      );
      sessionStorage.setItem(
        "businesServices",
        JSON.stringify({
          ...previous,
          selectedService: updated,
          email,
        })
      );
    };
    //Using Error Handling
    useImperativeHandle(ref, () => ({
      validate: async () => {
        let hasError = false;
        if (!selectedService || selectedService.length === 0) {
          onValidationError?.({
            type: "failed",
            message: "Please select at least one service.",
          });
          hasError = true;
        }
        return !hasError;
      },
      save: async () => {
        await handleContinue();
      },
    }));
    //Add More Services Functionlaity ;
    const businessDetails = JSON.parse(
      sessionStorage.getItem("businessDetails")
    );
    const businesServices = JSON.parse(
      sessionStorage.getItem("businesServices")
    );
    const handleAddService = () => {
      if (inputValue.trim()) {
        const newServiceName = inputValue.trim();

        const newService = {
          type: "Other Local Business",
          subtype: "Your Journey Begins Here",
          icon: "images/other.png",
          services: [newServiceName],
        };

        const updatedCustomServices = [...customServices, newService];
        const updatedSelectedServices = [...selectedService, newServiceName];

        setCustomServices(updatedCustomServices);
        setSelectedService(updatedSelectedServices);

        sessionStorage.setItem(
          "customServices",
          JSON.stringify(updatedCustomServices)
        );
        sessionStorage.setItem(
          "businesServices",
          JSON.stringify({
            selectedService: updatedSelectedServices,
            email,
          })
        );

        setInputValue("");
        scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    };
    useEffect(() => {
      sessionStorage.setItem("customServices", JSON.stringify(customServices));
    }, [customServices]);
    useEffect(() => {
      const savedCustom = sessionStorage.getItem("customServices");
      const savedSelected = sessionStorage.getItem("businesServices");

      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        setCustomServices(parsed);

        const newCustomServiceStrings = parsed.flatMap((item) => item.services);

        setSelectedService((prev) => {
          const combined = [...new Set([...prev, ...newCustomServiceStrings])];
          return combined;
        });
      }

      if (savedSelected) {
        try {
          const parsed = JSON.parse(savedSelected);
          if (Array.isArray(parsed)) {
            // Fix malformed format
            sessionStorage.setItem(
              "businesServices",
              JSON.stringify({ selectedService: parsed })
            );
            setSelectedService(parsed);
          } else if (parsed?.selectedService) {
            setSelectedService(parsed.selectedService);
          }
        } catch (e) {
          console.error("Error restoring selected services:", e);
        }
      }
    }, []);
    useEffect(() => {
      const savedShowInput = sessionStorage.getItem("showInput");
      if (savedShowInput !== null) {
        setShowInput(JSON.parse(savedShowInput));
      }
    }, []);
    useEffect(() => {
      if (businessDetails?.businessType === "Other") {
        sessionStorage.setItem("showInput", JSON.stringify(true));
      }
    }, [businessDetails]);
    useEffect(() => {
      const businessDetails = JSON.parse(
        sessionStorage.getItem("businessDetails")
      );
      setBusinessType(businessDetails?.businessType);
    }, []);
    useEffect(() => {
      if (showInput && scrollToBottomRef?.current) {
        setTimeout(() => {
          scrollToBottomRef?.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }, [customServices]);
    //check is this webview or not
    const isAndroidApp = () =>
      /Android/i.test(navigator.userAgent) && window.ReactNativeWebView;
    const isIOSApp = () =>
      /iPhone|iPad|iPod/i.test(navigator.userAgent) && window.webkit;

    const handleFocus = (e) => {
      if (isAndroidApp() || isIOSApp()) {
        setTimeout(() => {
          // Method 1: Smooth scroll to element
          e.target.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 300);
      }
    };
    const cardRef = useRef(null);

    useEffect(() => {
      if (showInput && cardRef.current) {
        setTimeout(() => {
          cardRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 150); // thoda delay taaki DOM render complete ho jaye
      }
    }, [showInput]);
    const scrollListIntoView = () => {
      if (listRef.current) {
        listRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    };
    return (
      <div className={styles.container} id="servies" ref={listRef} >
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>
            <img src="svg/Search-Icon.svg" alt="Search icon" />
          </span>
          <input
            type="text"
            placeholder="Quick find Business services"
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setTimeout(scrollListIntoView, 300);
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
        <div className={styles.ListDiv}  >
          <div className={styles.optionList}>
            {filteredServices.length > 0 ? (
              filteredServices
                ?.filter((service) => service !== "Other")
                ?.map((service, index) => (
                  <label className={styles.option} key={index}>
                    <div className={styles.forflex}>
                      <div className={styles.icon}>
                        <img
                          src={selectedBusiness?.icon || "images/other.png"}
                          alt="service-icon"
                          className={styles.iconImg}
                        />
                      </div>
                      <div className={styles.strongDiv}>
                        <strong>{service}</strong>
                        <p className={styles.subType}>
                          {selectedBusiness?.subtype ||
                            "Your Journey Begins Here"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <input
                        type="checkbox"
                        name="service"
                        value={service}
                        checked={selectedService.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                      />
                    </div>
                  </label>
                ))
            ) : (
              <></>
            )}
            <div ref={scrollToBottomRef} style={{ height: 1 }} />
          </div>
          {filteredServices.length == 0 && (
            <p className={styles.notitem}>No item found</p>
          )}
        </div>
        {serviceError && (
          <p style={{ color: "red", marginTop: "5px" }}>{serviceError}</p>
        )}
        {/* Add More Custom Services */}
        <div className={styles.CallTransferMain1}>
          {/* Checkbox to toggle service input */}
          <div className={styles.headrPart}>
            <input
              type="checkbox"
              checked={showInput}
              id="add-more-services"
              onChange={(e) => {
                const checked = e.target.checked;
                setShowInput(checked);
                sessionStorage.setItem("showInput", JSON.stringify(checked));
              }}


              onFocus={((e) => {

                if (isIphone) {
                  // handleIOSFocus(e);
                } else {
                  handleFocus(e)

                }


              })

              }

            />
            <label htmlFor="add-more-services">Add More Services</label>
          </div>

          {/* Input + Add button (only when checkbox is checked) */}
          {showInput && (
            <div className={styles.card} ref={cardRef}>
              <label className={styles.label}>Service Name</label>
              <div className={styles.phoneInput}>
                <input
                  type="text"
                  className={styles.phoneNumberInput}
                  placeholder="Enter Your Service Name"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={((e) => {
                    if (isIphone) {
                      // handleIOSFocus(e);
                    } else {
                      handleFocus(e)
                    }


                  })

                  }
                />
                <button
                  type="button"
                  className={styles.addIcon}
                  onClick={handleAddService}
                >
                  <img src="/svg/addMore-icon.svg" alt="addMore-icon" />
                </button>
              </div>
            </div>
          )}

          {/* Optional display of added services */}
          {/* {customServices.length > 0 && (
          <div className={styles.card}>
            <h4>Added Custom Services:</h4>
            <ul>
              {customServices.map((item, index) => (
                <li key={index}>
                  {item.services[0]} <small>({item.type})</small>
                </li>
              ))}
            </ul>
          </div>
        )} */}
        </div>

        {/* Show PopUp */}
        <PopUp
          type={popupType}
          message={popupMessage}
          onClose={() => setPopupMessage("")}
        />
      </div>
    );
  }
);

export default BusinessServices;
const cleanServiceArray = () => {
  try {
    let raw;
    if (localStorage.getItem("UpdationMode") != "ON") {
      raw = sessionStorage.getItem("businessDetails");
    } else {
      raw = raw = sessionStorage.getItem("businessDetails");
    }
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.selectedService)) {
      return parsed.selectedService;
    } else if (
      typeof parsed?.selectedService === "object" &&
      Array.isArray(parsed.selectedService.selectedService)
    ) {
      return parsed.selectedService.selectedService;
    }
    return [];
  } catch {
    return [];
  }
};
