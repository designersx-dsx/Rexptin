import React, { useState, useEffect } from "react";
import styles from "./EditBusinessDetail.module.css";
import EditHeader from "../EditHeader/EditHeader";
import SectionHeader from "../SectionHeader/SectionHeader";
import AnimatedButton from "../AnimatedButton/AnimatedButton";
import { useAgentCreator } from "../../hooks/useAgentCreator";
import decodeToken from "../../lib/decodeToken";
import { useLocation, useNavigate } from "react-router-dom";
import PopUp from "../Popup/Popup";
import axios from "axios";
import getKnowledgeBaseName from "../../utils/getKnowledgeBaseName";
import { API_BASE_URL, getAgentFiles } from "../../Store/apiStore";
import { useDashboardStore } from "../../Store/agentZustandStore";
import { red } from "@mui/material/colors";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const EditBusinessDetail = () => {
  const agentnm = sessionStorage.getItem("agentName");
  const [businessName, setBusinessName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [aboutBussiness, setAboutBusiness] = useState("");
  const [loading, setLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("us");
  const [street_number, setStreet_number] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postal_code, setPostal_code] = useState("");
  const [country_code, setCountry_code] = useState("");
  const [state_code, setState_code] = useState("");
  const token = localStorage.getItem("token");
  const decodeTokenData = decodeToken(token);
  const userId = decodeTokenData?.id;
  const navigate = useNavigate();
  const EditingMode1 = localStorage.getItem("UpdationMode");
  const { setHasFetched } = useDashboardStore();
  const agentCode = sessionStorage.getItem("agentCode") || "";
  const [originalData, setOriginalData] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const location = useLocation();
  const { isChanged } = location.state || {};
  const { handleCreateAgent } = useAgentCreator({
    stepValidator: () => "EditBusinessDetail",
    setLoading,
    setPopupMessage,
    setPopupType,
    setShowPopup,
    navigate,
    setHasFetched,
  });

  useEffect(()=>{
    if(isChanged){
      setIsDirty(isChanged)
    }
  },[isChanged])

  useEffect(() => {
    const storedDetails = sessionStorage.getItem("placeDetailsExtract");
    if (storedDetails) {
      const details = JSON.parse(storedDetails);
      setBusinessName(details?.businessName || "");
      setPhoneNumber(details.internationalPhone || details?.phone || "");
      setAddress(details?.address || "");
      setEmail(details?.email || "");
      setAboutBusiness(details?.aboutBusiness || details?.aboutBussiness || "");

     setOriginalData({
        businessName: details?.businessName || "",
        phoneNumber: details.internationalPhone || details?.phone || "",
        address: details?.address || "",
        email: details?.email || "",
        aboutBussiness: details?.aboutBusiness || details?.aboutBussiness || "",
        street_number: details?.street_number || "",
        city: details?.city || "",
        state: details?.state || "",
        postal_code: details?.postal_code || "",
        country: details?.country || "",
      });
    }
    if (EditingMode1 != "ON") {
      const details = JSON.parse(storedDetails);
      setAboutBusiness(details?.aboutBusiness || details?.aboutBussiness || "");
    }
  }, []);
  const handleInputChange = (field, value) => {
    const currentData = JSON.parse(
      sessionStorage.getItem("placeDetailsExtract") || "{}"
    );
    const updatedData = { ...currentData, [field]: value };
    sessionStorage.setItem("placeDetailsExtract", JSON.stringify(updatedData));
    switch (field) {
      case "businessName":
        setBusinessName(value);
        break;
      case "phone":
      case "internationalPhone":
        setPhoneNumber(value);
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
    
      const isChanged =
    (field === "businessName" && value !== originalData.businessName) ||
    (field === "phone" && value !== originalData.phoneNumber) ||
    (field === "internationalPhone" && value !== originalData.phoneNumber) ||
    (field === "address" && value !== originalData.address) ||
    (field === "email" && value !== originalData.email) ||
    (field === "aboutBussiness" && value !== originalData.aboutBussiness);

  setIsDirty(isChanged);
  };
  const formatLabel = (str) =>
    str
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .replace(/_/g, " ");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }

    if (emailError) {
      return;
    }
    try {
      setLoading(true);
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
      const displayBusinessName = sessionStorage.getItem("displayBusinessName");
      const packageName = sessionStorage.getItem("package") || "Free";
      const stepEditingMode = localStorage.getItem("UpdationModeStepWise");
      const EditingMode = localStorage.getItem("UpdationMode");
      const googleListing = sessionStorage.getItem("googleListing");
      const sessionSelectedSiteMapUrls = JSON.parse(sessionStorage.getItem("scrapedUrls"))
      const agentCount = 0;
      if (!businessName || !address || !phoneNumber) {
        setShowPopup(true);
        setPopupType("failed");
        setPopupMessage("Please fill all required fields.");
        return;
      }
      const updatedPlaceDetails = {
        ...placeDetails,
        businessName: businessName || placeDetails?.businessName,
        phone: phoneNumber,
        address: address,
        email: email,
        aboutBussiness: aboutBussiness,
        // name: businessName || placeDetails?.businessName || "",
      };
      sessionStorage.setItem(
        "placeDetailsExtract",
        JSON.stringify(updatedPlaceDetails)
      );

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
        street_number: placeDetails.street_number || "",
        city: placeDetails.city,
        state: placeDetails.state,
        country: placeDetails.country,
        postal_code: placeDetails.postal_code,
      };
      const placeDetailsForKBT = JSON.parse(
        sessionStorage.getItem("placeDetailsExtract") || "{}"
      );
      const readableDetails = Object?.entries(placeDetailsForKBT)
        .map(
          ([key, value]) =>
            `${formatLabel(key)}: ${
              Array.isArray(value) ? value.join(", ") : value || "N/A"
            }`
        )
        .join("\n");

      const knowledgeBaseText = [
        {
          title: "Business Details",
          text: readableDetails,
        },
      ];
      //extractAddressFields
      function extractAddressFields(addressComponents) {
        const getComponent = (primaryType, fallbackType = null) =>
          addressComponents.find(
            (comp) =>
              comp.types.includes(primaryType) ||
              (fallbackType && comp.types.includes(fallbackType))
          )?.long_name || "";

        return {
          city: getComponent("locality", "sublocality_level_1"),
          state: getComponent("administrative_area_level_1"),
          country: getComponent("country"),
          postal_code: getComponent("postal_code"),
          street_number: getComponent("street_number"),
          state_code: getComponent("administrative_area_level_1", null, true),
          country_code: getComponent("country", null, true),
        };
      }
      const addressFields = extractAddressFields(
        placeDetails?.address_components || []
      );
      setCity(addressFields.city);
      setState(addressFields.state);
      setCountry(addressFields.country);
      setPostal_code(addressFields.postal_code);
      setStreet_number(addressFields.street_number);
      setCountry_code(addressFields.country_code);
      setCountry_code(addressFields.state_code);
      setState_code(addressFields.street_number);

      const rawUrl = aboutBusinessForm.businessUrl?.trim();
      const mergedUrls = [];
      if (sessionSelectedSiteMapUrls?.length > 0) {
        mergedUrls.push(
          ...sessionSelectedSiteMapUrls
            ?.filter((item) => item.checkedStatus)
            ?.map((item) => item.url)
        );
      } else {
        // If no sitemap, at least push rawUrl
        if (rawUrl) mergedUrls.push(rawUrl);
      }
      if (googleListing) {
        mergedUrls.push(googleListing); 
      }

      // const mergedUrls = rawUrl ? [rawUrl] : [];
      const formData = new FormData();
      const formData2 = new FormData();
      const formData3 = new FormData();
      let agentId = localStorage.getItem("agent_id");
      let knowledge_Base_ID = knowledgeBaseId;

      if (
        knowledge_Base_ID !== null &&
        knowledge_Base_ID !== undefined &&
        knowledge_Base_ID !== "null" &&
        knowledge_Base_ID !== "undefined" &&
        knowledge_Base_ID !== ""
      ) {
        try {
          const sourcesResp = await axios.delete(
            `https://api.retellai.com/delete-knowledge-base/${knowledge_Base_ID}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } catch (error) {
          console.log("error while removing prev Knowledgbase ", error);
        }
      }
      const filesResponse = await getAgentFiles(agentId);
      const existingFiles = filesResponse?.files || [];

      if (existingFiles.length > 0) {
        for (const file of existingFiles) {
          const byteCharacters = atob(file.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const fileBlob = new Blob([byteArray], { type: file.mimetype });

          const fileObject = new File([fileBlob], file.name, {
            type: file.mimetype,
          });
          formData.append("knowledge_base_files", fileObject);
        }
      }
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
      formData2.append("googleUrl", aboutBusinessForm?.googleListing);
      formData2.append("webUrl", aboutBusinessForm?.businessUrl?.trim());
      formData2.append("aboutBusiness", aboutBussiness);
      formData2.append("additionalInstruction", aboutBusinessForm?.note || "");
      formData2.append("agentId", localStorage.getItem("agent_id"));
      formData2.append("googleBusinessName", displayBusinessName || "");
      formData2.append("address1", businessData?.address);
      formData2.append("businessEmail", email);
      formData2.append("scrapedUrls", JSON.stringify(sessionSelectedSiteMapUrls) || []);
      formData2.append(
        "businessName",
        placeDetails?.businessName || businessName
      );
      formData2.append("phoneNumber", phoneNumber);
      formData2.append("isGoogleListing", aboutBusinessForm?.noGoogleListing);
      formData2.append("isWebsiteUrl", aboutBusinessForm?.noBusinessWebsite);
      formData2.append("city", businessData?.city || city);
      formData2.append("state", businessData?.state || state);
      formData2.append("country", businessData?.country || country);
      formData2.append("postal_code", businessData?.postal_code || postal_code);
      formData2.append(
        "street_number",
        businessData?.street_number || street_number
      );

      try {
        const response = await axios.post(
          "https://api.retellai.com/create-knowledge-base",
          formData,
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
        formData2.append("knowledge_base_name", knowledgeBaseName);

        knowledge_Base_ID = response?.data?.knowledge_base_id;
        sessionStorage.setItem("knowledgeBaseId", knowledge_Base_ID);
      } catch (error) {
        console.log("error while adding knowlde create-knowledge-base", error);
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

      if (EditingMode === "ON" && knowledge_Base_ID) {
        handleCreateAgent();
        setHasFetched(false);
      }

      // }
    } catch (error) {
      console.log(error);
      if (error?.response?.status === 422) {
        setShowPopup(true);
        setPopupType("failed");
        setPopupMessage(
          "Knowledge base is currently updating. Try again later."
        );
      } else {
        setShowPopup(true);
        setPopupType("failed");
        console.error("Submission failed:", error);
        setPopupMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  //initAddressAutocomplete
  const initAddressAutocomplete = () => {
    const autocomplete = new window.google.maps.places.Autocomplete(
      document.getElementById("google-address-autocomplete"),
      //Fetch Only location
      //google-address-autocomplete
      {
        types: ["geocode"],
        fields: ["address_components", "formatted_address", "geometry", "url"],
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
        const extracted=extractAndStoreAddressComponents(place);
      
        const changed =
      businessName !== originalData.businessName ||
      phoneNumber !== originalData.phoneNumber ||
      email !== originalData.email ||
      aboutBussiness !== originalData.aboutBussiness ||
      place.formatted_address !== originalData.address ||
      extracted.street_number !== originalData.street_number ||
      extracted.city !== originalData.city ||
      extracted.state !== originalData.state ||
      extracted.postal_code !== originalData.postal_code ||
      extracted.country !== originalData.country;

    setIsDirty(changed);
      }
    });
  };
  //extractAndStoreAddressComponents
  const extractAndStoreAddressComponents = (place) => {
    if (!place || !place.address_components) {
      console.error("Invalid place object:", place);
      return;
    }

    const components = place.address_components;
    const getComponent = (
      primaryType,
      fallbackType = null,
      useShort = false
    ) => {
      const comp = components.find(
        (c) =>
          c.types.includes(primaryType) ||
          (fallbackType && c.types.includes(fallbackType))
      );
      return comp ? (useShort ? comp.short_name : comp.long_name) : "";
    };

    const addressDetails = {
      street_number: getComponent("street_number"),
      route: getComponent("route"),
      city: getComponent("locality") || getComponent("sublocality_level_1"),
      state: getComponent("administrative_area_level_1"),
      country: getComponent("country"),
      postal_code: getComponent("postal_code"),
      country_code: getComponent("country", null, true),
      state_code: getComponent("administrative_area_level_1", null, true),
      full_address: place.formatted_address || "",
    };
    // Save to sessionStorage
    const currentDetails = JSON.parse(
      sessionStorage.getItem("placeDetailsExtract") || "{}"
    );

    const updatedDetails = {
      ...currentDetails,
      ...addressDetails,
      address_components: components,
    };

    sessionStorage.setItem(
      "placeDetailsExtract",
      JSON.stringify(updatedDetails)
    );
    return addressDetails;
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
  return (
    <>
      <EditHeader title="Edit Agent " agentName={agentnm} />
      <div className={styles.Maindiv}>
        <SectionHeader
          heading="Business Details"
          subheading="Verify or Update your Business Details we got from your public listings"
          highlight=""
        />
      </div>

      <div className={styles.container}>
        <div className={styles.inputSection}>
          <label className={styles.label}>Business Name</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Your Business Name"
            value={businessName}
            onChange={(e) => handleInputChange("businessName", e.target.value)}
          />
        </div>

        <div className={styles.inputSection}>
          <label className={styles.label}>Phone Number</label>
          <PhoneInput
            country={selectedCountry}
            value={phoneNumber}
            onChange={(phone, countryData) => {
              const fullPhone = phone.startsWith("+") ? phone : `+${phone}`;
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
          />
        </div>
        <div className={styles.inputSection}>
          <label className={styles.label}>Address</label>
          {/* <input
            type="text"
            className={styles.input}
            placeholder="Your Business Location "
            maxLength={150}
            value={address}
            onChange={(e) => handleInputChange("address", e.target.value)}

          /> */}
          <input
            id="google-address-autocomplete"
            type="text"
            className={styles.input}
            value={address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="Business Address"
            required
            maxLength={300}
          />
        </div>

        <div className={styles.inputSection}>
          <label className={styles.label}>Business Email</label>
          <input
            type="email"
            className={styles.input}
            placeholder="Business Email Address"
            value={email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            onBlur={(e) => {
              const value = e.target.value;
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

              if (value && !emailRegex.test(value)) {
                setEmailError("Please enter a valid email address.");
              } else {
                setEmailError("");
              }
            }}
          />
          {emailError && <p style={{ color: "red" }}>{emailError}</p>}
        </div>

        <div className={styles.inputSection}>
          <label className={styles.label}>
            Business Intro for Your Agent to know
          </label>
          <textarea
            rows="3"
            cols="50"
            className={styles.textarea}
            placeholder="Write an Intro for your Business here"
            value={aboutBussiness}
            onChange={(e) =>
              handleInputChange("aboutBussiness", e.target.value)
            }
          >
            {" "}
          </textarea>
        </div>

        <div className={styles.stickyWrapper} onClick={handleSubmit}>
          <AnimatedButton label="Save" isLoading={loading} disabled={!isDirty}/>
        </div>
        {showPopup && (
          <PopUp
            type={popupType}
            onClose={() => {
              setShowPopup(false);
            }}
            message={popupMessage}
            onConfirm={() => {}}
          />
        )}
      </div>
    </>
  );
};

export default EditBusinessDetail;
