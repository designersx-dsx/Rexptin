import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../BusinessListing/BusinessListing.module.css";
import { API_BASE_URL, fetchAvailablePhoneNumberByCountry, getPhoneNumberAccordingToCountry } from "../../Store/apiStore";
import PopUp from "../Popup/Popup";
import Loader from "../Loader/Loader";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useAgentCreator } from "../../hooks/useAgentCreator";
import getKnowledgeBaseName from "../../utils/getKnowledgeBaseName";
import decodeToken from "../../lib/decodeToken";
const BusinessListing = forwardRef(
  (
    {
      onNext,
      onBack,
      onValidationError,
      onSuccess,
      onFailed,
      setLoading,
      onStepChange,
      loading,
    },
    ref
  ) => {
    const [businessName, setBusinessName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [aboutBussiness, setAboutBusiness] = useState("");
    // const [loading, setLoading] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [popupType, setPopupType] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const token = localStorage.getItem("token");
    const decodeTokenData = decodeToken(token);
    const userId = decodeTokenData?.id;
    const agentCode = sessionStorage.getItem("AgentCode");
    const navigate = useNavigate();
    const EditingMode1 = localStorage.getItem("UpdationMode");
    const [selectedCountry, setSelectedCountry] = useState("us");
    const [street_number, setStreet_number] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [country, setCountry] = useState("");
    const [postal_code, setPostal_code] = useState("");
    const [country_code, setCountry_code] = useState("");
    const [state_code, setState_code] = useState("");
    const listRef = useRef(null);
    const setHasFetched = true;
    const { handleCreateAgent } = useAgentCreator({
      stepValidator: () => "BusinessListing",
      setLoading,
      setPopupMessage,
      setPopupType,
      setShowPopup,
      navigate,
      setHasFetched,
    });
    const containsSpecialChars = (str) => /[!@#$%^&*(),.?":{}|<>]/.test(str);
    const containsEmoji = (str) =>
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])/g.test(
        str
      );
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    useEffect(() => {
      const storedDetails = sessionStorage.getItem("placeDetailsExtract");
      if (storedDetails) {
        const details = JSON.parse(storedDetails);
        setBusinessName(details?.businessName || "");
        setPhoneNumber(details.internationalPhone || details?.phone);
        setAddress(details?.address || "");
        setEmail(details?.email || "");
        setAboutBusiness(
          details?.aboutBusiness || details?.aboutBussiness || ""
        );
      }
      if (EditingMode1 != "ON") {
        const details = JSON.parse(storedDetails);
        setAboutBusiness(
          details?.aboutBusiness || details?.aboutBussiness || ""
        );
      }
    }, []);

    const handleInputChange = (field, value) => {
      const currentData = JSON.parse(
        sessionStorage.getItem("placeDetailsExtract") || "{}"
      );
      const updatedData = { ...currentData, [field]: value };
      sessionStorage.setItem(
        "placeDetailsExtract",
        JSON.stringify(updatedData)
      );

      switch (field) {
        case "businessName":
          setBusinessName(value);
          break;
        case "phone":
        case "internationalPhone":
          const formattedPhone = value.startsWith("+") ? value : `+${value}`;
          setPhoneNumber(formattedPhone);
          break;

        case "address":
          setAddress(value);
          break;
        case "email":
          setEmail(value);
          break;
        case "aboutBussiness":
          setAboutBusiness(value);
          break;
        default:
          break;
      }
    };
    const formatLabel = (str) =>
      str
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase())
        .replace(/_/g, " ");

    const handleSubmit = async (e) => {
      if (e) e.preventDefault();
      if (loading) return;
      try {
        setLoading(true);
        const phoneNumberObj = parsePhoneNumberFromString(
          phoneNumber,
          selectedCountry
        );

        if (!phoneNumberObj || !phoneNumberObj.isValid()) {
          setLoading(false);
          setPopupType("failed");
          setPopupMessage("Please enter a valid phone number.");
          setShowPopup(true);

          return;
        }

        const aboutBusinessForm = JSON.parse(
          sessionStorage.getItem("aboutBusinessForm") || "{}"
        );
        const placeDetails = JSON.parse(
          sessionStorage.getItem("placeDetailsExtract") || "{}"
        );
        const business = JSON.parse(
          sessionStorage.getItem("businessDetails") || "{}"
        );
        const sessionBusinessiD = JSON.parse(sessionStorage.getItem("bId"));
        const knowledgeBaseId = sessionStorage.getItem("knowledgeBaseId");
        const displayBusinessName = sessionStorage.getItem(
          "displayBusinessName"
        );
        const packageName = sessionStorage.getItem("package") || "Free";
        const stepEditingMode = localStorage.getItem("UpdationModeStepWise");
        const EditingMode = localStorage.getItem("UpdationMode");
        const agentCount = 0;
        if (!businessName || !address || !phoneNumber) {
          setPopupType("failed");
          setPopupMessage("Please fill all required fields.");
          setShowPopup(true);

          return;
        }
        const packageMap = {
          Free: 1,
          Starter: 2,
          Scaler: 3,
          Growth: 4,
          Corporate: 5,
          Enterprise: 6,
        };
        const packageValue = packageMap[packageName] || 1;
        const knowledgeBaseName = await getKnowledgeBaseName(
          business,
          userId,
          packageValue,
          agentCode
        );
        //extractAddressFields
        const extractAddressFields = (addressComponents) => {
          const getComponent = (
            primaryType,
            fallbackType = null,
            useShort = false
          ) => {
            const comp = addressComponents.find(
              (c) =>
                c.types.includes(primaryType) ||
                (fallbackType && c.types.includes(fallbackType))
            );
            return comp ? (useShort ? comp.short_name : comp.long_name) : "";
          };

          return {
            city: getComponent("locality", "sublocality_level_1"),
            state: getComponent("administrative_area_level_1"),
            state_code: getComponent("administrative_area_level_1", null, true),
            country: getComponent("country"),
            country_code: getComponent("country", null, true),
            postal_code: getComponent("postal_code"),
            street_number: getComponent("street_number"),
            route: getComponent("route"),
          };
        };

        // After extracting address fields, set them in the state and session storage
        const addressFields = extractAddressFields(
          placeDetails?.address_components || []
        );


        // Update the state
        setCity(addressFields.city);
        setState(addressFields.state); // Ensure the state is updated here
        setCountry(addressFields.country);
        setPostal_code(addressFields.postal_code);
        setStreet_number(addressFields.street_number);
        setCountry_code(addressFields.country_code);
        setState_code(addressFields.state_code);

        const updatedPlaceDetails = {
          ...placeDetails,
          businessName: businessName || placeDetails?.businessName,
          phone: phoneNumber,
          address: address,
          email: email,
          aboutBussiness: aboutBussiness,
          city: addressFields.city,
          state: addressFields.state,
          country: addressFields.country,
          postal_code: addressFields.postal_code,
          street_number: addressFields.street_number,
          country_code: addressFields.country_code,
          state_code: addressFields.state_code,
        };

        sessionStorage.setItem(
          "placeDetailsExtract",
          JSON.stringify(updatedPlaceDetails)
        );

        //Get Details From GMB
        const businessData = {
          businessName: businessName || placeDetails?.businessName || "",
          address: placeDetails?.address || address,
          phone: placeDetails?.phone || phoneNumber,
          website: placeDetails?.website || aboutBusinessForm.businessUrl,
          rating: placeDetails?.rating || "",
          totalRatings: placeDetails?.totalRatings || "",
          hours: Array.isArray(placeDetails?.hours)
            ? placeDetails.hours.join(" | ")
            : "",
          businessStatus: placeDetails?.businessStatus || "",
          categories: Array.isArray(placeDetails?.categories)
            ? placeDetails.categories.join(", ")
            : "",
          email: email,
          aboutBussiness: aboutBussiness,
          city: addressFields?.city,
          state: addressFields?.state,
          country: addressFields?.country,
          postal_code: addressFields?.postal_code,
          street_number: addressFields?.street_number,
          country_code: addressFields?.country_code,
          state_code: addressFields?.state_code,
          // setCountry_code()
          // setCountry_code()
        };
        const placeDetailsForKBT = JSON.parse(
          sessionStorage.getItem("placeDetailsExtract") || "{}"
        );
        const readableDetails = Object?.entries(placeDetailsForKBT)
          .map(
            ([key, value]) =>
              `${formatLabel(key)}: ${Array.isArray(value) ? value.join(", ") : value || "N/A"
              }`
          )
          .join("\n");

        const knowledgeBaseText = [
          {
            title: "Business Details",
            text: readableDetails,
          },
        ];
        const mergedUrls = [];
        const rawUrl = aboutBusinessForm.businessUrl?.trim();
        const sessionSelectedSiteMapUrls = JSON.parse(sessionStorage.getItem("selectedSiteMapUrls"))

        if (sessionSelectedSiteMapUrls?.length > 0) {
          // Push all selected (checkedStatus: true)
          mergedUrls.push(
            ...sessionSelectedSiteMapUrls
              .filter((item) => item.checkedStatus)
              .map((item) => item.url)
          );
        } else {
          // If no sitemap, at least push rawUrl
          if (rawUrl) mergedUrls.push(rawUrl);
        }
        if (aboutBusinessForm?.googleListing) {
          mergedUrls.push(aboutBusinessForm?.googleListing);

        }
        // const mergedUrls = rawUrl ? [rawUrl] : [];
        const formData = new FormData();
        const formData2 = new FormData();
        const formData3 = new FormData();
        if (mergedUrls.length > 0) {
          formData.append("knowledge_base_urls", JSON.stringify(mergedUrls));
          formData3.append("knowledge_base_urls", JSON.stringify(mergedUrls));
        }
        formData.append("knowledge_base_name", knowledgeBaseName);
        formData.append("enable_auto_refresh", "true");
        formData.append(
          "knowledge_base_texts",
          JSON.stringify(knowledgeBaseText)
        );
        formData2.append("knowledge_base_texts", JSON.stringify(businessData));
        //Crate Knowledge Base
        formData2.append("googleUrl", aboutBusinessForm.googleListing);
        formData2.append("webUrl", aboutBusinessForm.businessUrl.trim());
        formData2.append("aboutBusiness", aboutBussiness);
        formData2.append("additionalInstruction", aboutBusinessForm.note || "");
        formData2.append("agentId", localStorage.getItem("agent_id"));
        formData2.append("googleBusinessName", displayBusinessName || "");
        formData2.append("address1", businessData.address);
        formData2.append("businessEmail", email);
        formData2.append("city", businessData?.city || city);
        formData2.append("state", businessData?.state || state);
        formData2.append("scrapedUrls", JSON.stringify(sessionSelectedSiteMapUrls) || []);
        formData2.append("state_code", businessData?.state_code || state_code);
        formData2.append(
          "country_code",
          businessData?.country_code || country_code
        );
        formData2.append("country", businessData?.country || country);
        formData2.append(
          "postal_code",
          businessData?.postal_code || postal_code
        );
        formData2.append(
          "street_number",
          businessData?.street_number || street_number
        );
        formData2.append(
          "businessName",
          placeDetails?.businessName || businessName
        );
        formData2.append("phoneNumber", phoneNumber);
        formData2.append("isGoogleListing", aboutBusinessForm.noGoogleListing);
        formData2.append("isWebsiteUrl", aboutBusinessForm.noBusinessWebsite);
        formData3.append(
          "knowledge_base_texts",
          JSON.stringify(knowledgeBaseText)
        );
        let knowledge_Base_ID = knowledgeBaseId;

        if (
          knowledge_Base_ID !== null &&
          knowledge_Base_ID !== undefined &&
          knowledge_Base_ID !== "null" &&
          knowledge_Base_ID !== "undefined" &&
          knowledge_Base_ID !== ""
        ) {
          const response = await axios.post(
            `https://api.retellai.com/add-knowledge-base-sources/${knowledge_Base_ID}`,
            formData3,
            {
              headers: {
                Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          formData2.append(
            "knowledge_base_id",
            response?.data?.knowledge_base_id
          );
        } else {
          const response = await axios.post(
            "https://api.retellai.com/create-knowledge-base",
            formData,
            {
              headers: {
                Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
              },
            }
          );
          formData2.append(
            "knowledge_base_id",
            response?.data?.knowledge_base_id
          );
          formData2.append("knowledge_base_name", knowledgeBaseName);

          knowledge_Base_ID = response?.data?.knowledge_base_id;
          sessionStorage.setItem("knowledgeBaseId", knowledge_Base_ID);
        }

        await axios.patch(
          `${API_BASE_URL}/businessDetails/updateKnowledeBase/${sessionBusinessiD}`,
          formData2,
          {
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        //getNumberAccording to Country


        if (stepEditingMode === "ON" && knowledge_Base_ID) {
          handleCreateAgent();
        }

        if (stepEditingMode !== "ON") {
          if (onSuccess) {
            onSuccess({
              message: "Knowledge base created successfully!",
            });
            setTimeout(() => {
              onStepChange?.(5);
            }, 2000);

            // First attempt: Country + State + City
            await getPhoneNumberAccordingToCountry(token,
              businessData?.country_code || country_code,
              "",
              "")
          }
        } else {
          setShowPopup(true);
          setPopupType("success");
          setPopupMessage("Knowledge base updated successfully!");
          setTimeout(() => {
            navigate("/agent-detail", {
              state: {
                agentId: localStorage.getItem("agent_id"),
                bussinesId: sessionBusinessiD,
              },
            });
          }, 1000);
        }
      } catch (error) {
        console.log(error);

        if (error?.response?.status === 422) {
          if (onFailed) {
            onFailed({
              message: "Knowledge base is currently updating. Try again later.",
            });
          }
        } else {
          if (onFailed) {
            onFailed({
              message: "Knowledge base is currently updating. Try again later.",
            });
          }
        }
      } finally {
        setLoading(false);
      }
    };
    //Using Error Handling
    useImperativeHandle(ref, () => ({
      validate: () => {
        let hasError = false;
        const phoneNumberObj = parsePhoneNumberFromString(
          phoneNumber,
          selectedCountry
        );

        if (!businessName.trim()) {
          hasError = true;
          onValidationError?.({
            type: "failed",
            message: "Please enter the business name.",
          });
        } else if (containsEmoji(businessName)) {
          hasError = true;
          onValidationError?.({
            type: "failed",
            message:
              "Business name cannot contain special characters or emojis.",
          });
        } else if (!address.trim()) {
          hasError = true;
          onValidationError?.({
            type: "failed",
            message: "Please enter the business address.",
          });
        } else if (containsEmoji(address)) {
          hasError = true;
          onValidationError?.({
            type: "failed",
            message: "Address cannot contain emojis.",
          });
        } else if (!phoneNumber.trim()) {
          hasError = true;
          onValidationError?.({
            type: "failed",
            message: "Please enter a valid phone number.",
          });
        } else if (!phoneNumberObj || !phoneNumberObj.isValid()) {
          hasError = true;
          onValidationError?.({
            type: "failed",
            message: "Please enter a valid phone number.",
          });
        } else if (
          containsSpecialChars(phoneNumber) ||
          containsEmoji(phoneNumber)
        ) {
          hasError = true;
          onValidationError?.({
            type: "failed",
            message:
              "Phone number cannot contain special characters or emojis.",
          });
        } else if (email.trim() && !isValidEmail(email)) {
          hasError = true;
          onValidationError?.({
            type: "failed",
            message: "Please enter a valid email address.",
          });
        } else if (
          aboutBussiness.trim() &&
          (containsSpecialChars(aboutBussiness) ||
            containsEmoji(aboutBussiness))
        ) {
          hasError = true;
          onValidationError?.({
            type: "failed",
            message:
              "About Business cannot contain special characters or emojis.",
          });
        }

        return !hasError;
      },
      save: async () => {
        handleSubmit();
      },
    }));
    //initAddressAutocomplete
    const initAddressAutocomplete = () => {
      const autocomplete = new window.google.maps.places.Autocomplete(
        document.getElementById("google-address-autocomplete"),
        //Fetch Only location
        //google-address-autocomplete
        {
          types: ["geocode"],
          fields: [
            "address_components",
            "formatted_address",
            "geometry",
            "url",
          ],
        }
        // {
        //   types: ["establishment"],
        //   fields: ["place_id", "name", "url"],
        // }
      );
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (place.formatted_address) {
          const addressComponents = place.address_components || [];
          setAddress(place.formatted_address);
          extractAndStoreAddressComponents(place.address_components);

          // Update sessionStorage
          const currentDetails = JSON.parse(
            sessionStorage.getItem("placeDetailsExtract") || "{}"
          );
          const updatedDetails = {
            ...currentDetails,
            address: place.formatted_address,
            address_components: addressComponents,
          };
          sessionStorage.setItem(
            "placeDetailsExtract",
            JSON.stringify(updatedDetails)
          );
        }
      });
    };
    //extractAndStoreAddressComponents
    const extractAndStoreAddressComponents = (components) => {
      const getComponent = (type) =>
        components.find((c) => c.types.includes(type))?.long_name || "";
      const addressDetails = {
        street_number: getComponent("street_number"),
        route: getComponent("route"),
        city: getComponent("locality") || getComponent("sublocality_level_1"),
        state: getComponent("administrative_area_level_1"),
        country: getComponent("country"),
        postal_code: getComponent("postal_code"),
      };

    };
    //initAddressAutocomplete
    useEffect(() => {
      const interval = setInterval(() => {
        if (window.google?.maps?.places) {
          const input = document.getElementById("google-address-autocomplete");
          if (input) {
            initAddressAutocomplete();
            clearInterval(interval);
          }
        }
      }, 300);

    }, []);
    //check is this webview or not 
    const isAndroidApp = () => /Android/i.test(navigator.userAgent) && window.ReactNativeWebView;
    const isIOSApp = () => /iPhone|iPad|iPod/i.test(navigator.userAgent) && window.webkit;
    const handleFocus = (e) => {
      if (isAndroidApp() || isIOSApp()) {
        setTimeout(() => {
          // Method 1: Smooth scroll to element
          e.target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 300);
      }
    };
    const scrollListIntoView = () => {
      if (listRef.current) {
        listRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    };

    return (
      <div className={styles.container}>
        <form className={styles.formContainer} onSubmit={handleSubmit}>
          <div className={styles.form} ref={listRef}>
            <div className={styles.labReq}>
              <div className={styles.formGroup} >
                <label>
                  Business Name <span className={styles.requiredStar1}>*</span>
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => {
                    const value = e.target.value;
                    const noNumbersOrEmojis = value
                      .replace(/[0-9]/g, "") // remove digits
                      .replace(
                        /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])/g,
                        ""
                      );
                    handleInputChange("businessName", noNumbersOrEmojis);
                    setTimeout(scrollListIntoView, 300);
                  }}
                  placeholder="Your Business Name"
                  required
                  maxLength={50}
                  onFocus={((e) => {
                    handleFocus(e)
                    setTimeout(scrollListIntoView, 300);

                  })

                  }
                  onClick={() => {
                    setTimeout(scrollListIntoView, 100);
                  }}

                />{" "}
              </div>

              <div className={styles.formGroup}>
                <label>
                  Phone Number <span className={styles.requiredStar1}>*</span>
                </label>
                <PhoneInput
                  country={selectedCountry}
                  value={phoneNumber}
                  onChange={(phone, countryData) => {
                    const fullPhone = phone.startsWith("+")
                      ? phone
                      : `+${phone}`;
                    setPhoneNumber(fullPhone);
                    setSelectedCountry(countryData?.countryCode || "us");
                    handleInputChange("phone", fullPhone);
                  }}
                  inputStyle={{
                    width: "100%",
                    height: "40px",
                    paddingLeft: "45px",
                    borderRadius: "5px",
                  }}
                  placeholder="+1 (123)456-7890"
                  required
                  onFocus={
                    handleFocus}
                  onClick={() => {
                    setTimeout(scrollListIntoView, 300);
                  }}
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  Address <span className={styles.requiredStar1}>*</span>
                </label>
                {/* <input
                  type="text"
                  value={address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Business Address"
                  required
                  maxLength={100}
                /> */}
                <input
                  id="google-address-autocomplete"
                  type="text"
                  value={address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Business Address"
                  required
                  maxLength={300}
                  onFocus={handleFocus}
                  onClick={() => {
                    setTimeout(scrollListIntoView, 300);
                  }}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Business Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Business Email Address"
                  onFocus={handleFocus}
                // onClick={() => {
                //   setTimeout(scrollListIntoView, 300);
                // }}
                />
              </div>

              <div className={styles.formGroup}>
                <label>About My Business</label>
                <textarea
                  rows="3"
                  value={aboutBussiness}
                  onChange={(e) =>
                    handleInputChange("aboutBussiness", e.target.value)
                  }
                  placeholder="Describe"
                  maxLength={200}
                  onFocus={handleFocus}

                />
              </div>

              {/* <div className={styles.fixedBtn}>
            <button
              type="submit"
              className={styles.btnTheme}
              disabled={loading}       style={{ pointerEvents: loading ? "none" : "auto", opacity: loading ? 0.6 : 1 }}
            >
              <img alt="" src="svg/svg-theme.svg" />
              <p  className="subBtn">{loading ? <>Saving &nbsp; <Loader size={18} /></> : "Submit"}</p>
            </button>
          </div> */}
            </div>
          </div>
        </form>
        {showPopup && (
          <PopUp
            type={popupType}
            message={popupMessage}
            onClose={() => setPopupMessage("")}
          />
        )}
      </div>
    );
  }
);

export default BusinessListing;
