import React, { useEffect, useState, useRef } from "react";
import styles from "../EditPublic/EditPublic.module.css";
import EditHeader from "../EditHeader/EditHeader";
import SectionHeader from "../SectionHeader/SectionHeader";
import AnimatedButton from "../AnimatedButton/AnimatedButton";
import { useNavigate, useLocation } from "react-router-dom";
import { listSiteMap, validateWebsite } from "../../Store/apiStore";
import Loader from "../Loader/Loader";
import decodeToken from "../../lib/decodeToken";
import { useAgentCreator } from "../../hooks/useAgentCreator";
import PopUp from "../Popup/Popup";
import { useDashboardStore } from "../../Store/agentZustandStore";
import Modal2 from "../Modal2/Modal2";

// Match AboutBusiness behaviour: enforce https:// (no www)
const HTTPS_PREFIX = "https://";
const PREFIX_LEN = HTTPS_PREFIX.length;

const EditPublic = () => {
  const agentnm = sessionStorage.getItem("agentName");
  const stepEditingMode = localStorage.getItem("UpdationModeStepWise");
  const EditingMode = localStorage.getItem("UpdationMode");
  const token = localStorage.getItem("token") || "";
  const decodeTokenData = decodeToken(token);
  const [userId, setUserId] = useState(decodeTokenData?.id || "");
  const navigate = useNavigate();
  const location = useLocation();
  const [placeDetails, setPlaceDetails] = useState(null);
  const [originalForm, setOriginalForm] = useState(null);
  const [currentForm, setcurrentForm] = useState(null);

  const [loading, setLoading] = useState(true);
  const [googleListing, setGoogleListing] = useState("");
  const [displayBusinessName, setDisplayBusinessName] = useState(
    sessionStorage.getItem("displayBusinessName")
  );
  const [businessUrl, setBusinessUrl] = useState("");
  const [noGoogleListing, setNoGoogleListing] = useState(false);
  const [noBusinessWebsite, setNoBusinessWebsite] = useState(false);
  const [businessUrlError, setBusinessUrlError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [urlVerificationInProgress, setUrlVerificationInProgress] =
    useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const { setHasFetched } = useDashboardStore();
  const [showSiteMapUrls, setShowSiteMapUrls] = useState([]);
  const [showSiteMapModal, setShowSiteMapModal] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState([]);
  const [addOnUrl, setAddOnUrl] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Refs for autofill logic (mirrors AboutBusiness)
  const prevPlaceIdRef = useRef(null);
  const lastAutoFilledUrlRef = useRef("");
  const typingTimeoutRef = useRef(null);
  const inputRefWebSiteUrl = useRef(null);
  const shouldFocusBackRef = useRef(false);

  const companyKeywords = [
    "about",
    "our-story",
    "our-company",
    "who-we-are",
    "contact",
    "products",
    "services",
    "solutions",
    "what-we-do",
    "offerings",
    "blog",
    "news",
    "resources",
    "insights",
    "faq",
    "help",
    "pricing",
    "plans",
    "privacy",
    "terms-and-conditions",
    "terms-of-use",
    "case-studies",
    "projects",
    "portfolio",
    "testimonials",
    "reviews",
  ];

  const filterCompanyPages = (urls) => {
    return urls.filter((url) =>
      companyKeywords.some((keyword) => url.toLowerCase().includes(keyword))
    );
  };

  // Normalization util (copied from AboutBusiness)
  const normalizeWebsite = (raw) => {
    if (!raw) return "";
    try {
      let v = String(raw)
        .trim()
        .replace(/https?:\/\/(www\.)?/i, "");
      v = v.split("/")[0].toLowerCase().replace(/\s+/g, "");
      if (!v) return "";
      const domainRegex = /^[\w-]+(\.[\w-]{2,})+$/i;
      if (!domainRegex.test(v)) return "";
      return "https://" + v; // no www
    } catch {
      return "";
    }
  };

  // Autofill website from Google Place (same behaviour as AboutBusiness)
  const maybeAutofillWebsite = (place) => {
    if (noBusinessWebsite) return;

    const normalized = normalizeWebsite(place?.website);
    const isNewPlace = prevPlaceIdRef.current !== place?.place_id;
    const shouldOverwrite =
      isNewPlace ||
      !businessUrl ||
      businessUrl === HTTPS_PREFIX ||
      businessUrl === lastAutoFilledUrlRef.current;

    if (shouldOverwrite) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      if (normalized) {
        setBusinessUrl(normalized);
        lastAutoFilledUrlRef.current = normalized;
        handleUrlVerification(normalized);
      } else {
        setBusinessUrl("");
        setIsVerified(null);
        setBusinessUrlError("");
        sessionStorage.removeItem("businessUrl");
      }
    }

    prevPlaceIdRef.current = place?.place_id || null;
  };

  // 🕒 Debounce manual typing verification (500ms)
  const scheduleVerify = (final, v) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    const domainRegex = /^[\w-]+(\.[\w-]{2,})+$/i;
    typingTimeoutRef.current = setTimeout(() => {
      if (domainRegex.test(v)) {
        handleUrlVerification(final);
      }
    }, 500);
  };

  // Agent creation hook
  const { handleCreateAgent } = useAgentCreator({
    stepValidator: () => "EditBusinessType",
    setLoading,
    setPopupMessage,
    setPopupType,
    setShowPopup,
    navigate,
    setHasFetched,
  });

  const agentName = sessionStorage.getItem("agentName") || "Agent";

  const initAutocomplete = () => {
    const autocomplete = new window.google.maps.places.Autocomplete(
      document.getElementById("google-autocomplete"),
      {
        types: ["establishment"],
        fields: ["place_id", "name", "url"],
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.place_id) {
        const businessUrl = place.url;
        const businessName = place.name;
        setGoogleListing(businessUrl);
        setDisplayBusinessName(businessName);
        sessionStorage.setItem("googleListing", businessUrl);
        setcurrentForm((prev) => ({
          ...prev,
          googleListing: businessUrl,
        }));
        sessionStorage.setItem("displayBusinessName", businessName);
        fetchPlaceDetails(place.place_id);
      }
    });
  };

  function extractAddressFields(addressComponents) {
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
      country: getComponent("country"),
      postal_code: getComponent("postal_code"),
      street_number: getComponent("street_number"),
      state_code: getComponent("administrative_area_level_1", null, true),
      country_code: getComponent("country", null, true),
    };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google?.maps?.places) {
        initAutocomplete();
        clearInterval(interval);
      }
    }, 300);
  }, []);

  useEffect(() => {
    if (EditingMode === "ON" && !noBusinessWebsite) {
      handleBlur();
    }
  }, [EditingMode, noBusinessWebsite]);

  const fetchPlaceDetails = (placeId) => {
    setLoading(true);
    const service = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );
    service.getDetails(
      {
        placeId,
        fields: [
          "place_id",
          "name",
          "url",
          "website",
          "formatted_address",
          "international_phone_number",
          "formatted_phone_number",
          "opening_hours",
          "rating",
          "user_ratings_total",
          "business_status",
          "types",
          "address_components",
        ],
      },
      (result, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setPlaceDetails(result);
          generateGoogleListingUrl(result);
          const form1 = JSON.parse(
            sessionStorage.getItem("placeDetailsExtract") || "{}"
          );
          const addressFields = extractAddressFields(
            result?.address_components || []
          );

          const businessData = {
            businessName: result.name || "",
            address: result.formatted_address || "",
            phone:
              result.international_phone_number ||
              result.formatted_phone_number ||
              "",
            internationalPhone: result.international_phone_number || "",
            website: result.website || "",
            rating: result.rating || "",
            totalRatings: result.user_ratings_total || "",
            hours: result.opening_hours?.weekday_text || [],
            businessStatus: result.business_status || "",
            categories: result.types || [],
            street_number: addressFields.street_number || "",
            city: addressFields.city,
            state: addressFields.state,
            country: addressFields.country,
            postal_code: addressFields.postal_code,
            state_code: addressFields.state_code,
            country_code: addressFields.country_code,
          };

          const updatedForm = {
            ...form1,
            ...businessData,
          };
          sessionStorage.setItem(
            "placeDetailsExtract",
            JSON.stringify(updatedForm)
          );

          // NEW: auto-fill website like AboutBusiness
          maybeAutofillWebsite(result);
        } else {
          console.error("Place details fetch failed:", status);
        }
        setLoading(false);
      }
    );
  };

  const generateGoogleListingUrl = (place) => {
    const address = [
      place.address_components.find((c) => c.types.includes("street_number"))
        ?.long_name,
      place.address_components.find((c) => c.types.includes("route"))
        ?.long_name,
      place.address_components.find((c) => c.types.includes("premise"))
        ?.long_name,
      place.address_components.find((c) => c.types.includes("subpremise"))
        ?.long_name,
      place.address_components.find((c) =>
        c.types.includes("sublocality_level_1")
      )?.long_name,
      place.address_components.find((c) => c.types.includes("locality"))
        ?.long_name,
      place.address_components.find((c) =>
        c.types.includes("administrative_area_level_2")
      )?.long_name,
      place.address_components.find((c) =>
        c.types.includes("administrative_area_level_1")
      )?.long_name,
    ]
      .filter(Boolean)
      .join(" ");

    const googleLink = `https://www.google.com/search?q=${encodeURIComponent(
      place.name + " " + address
    )}`;
    setGoogleListing(googleLink);
  };

  const handleUrlVerification = async (url) => {
    setUrlVerificationInProgress(true);
    const result = await validateWebsite(url);
    if (result.valid) {
      setIsVerified(true);
      setBusinessUrlError("");
      const canonical = normalizeWebsite(url) || url;
      setBusinessUrl(canonical);
      sessionStorage.setItem("businessUrl", canonical);
      localStorage.setItem("isVerified", true);

      const scrapedUrls = JSON.parse(
        sessionStorage.getItem("scrapedUrls") || "[]"
      );
      if (
        originalForm?.businessUrl !== businessUrl ||
        scrapedUrls.length === 0
      ) {
        const res = await listSiteMap(url);
        const filteredUrls = filterCompanyPages(res.urls);
        if (!filteredUrls.includes(url)) filteredUrls.unshift(url);

        const formattedUrls = filteredUrls?.map((link) => ({
          url: link,
          checkedStatus: true,
        }));
        setcurrentForm((prev) => ({ ...prev, siteMapUrls: formattedUrls }));
        setShowSiteMapUrls(formattedUrls);
        setAddOnUrl(url);
        sessionStorage.setItem("scrapedUrls", JSON.stringify(formattedUrls));
      } else {
        const urls = JSON.parse(sessionStorage.getItem("scrapedUrls")) || [];
        setShowSiteMapUrls(urls);
      }
    } else {
      setIsVerified(false);
      setBusinessUrlError("Invalid URL");
      localStorage.setItem("isVerified", false);
      // Focus back to input like AboutBusiness if user typed something invalid
      if (url?.trim()) shouldFocusBackRef.current = true;
    }
    setUrlVerificationInProgress(false);
  };

  useEffect(() => {
    const savedVerifiedStatus = localStorage.getItem("isVerified");
    if (savedVerifiedStatus !== null) {
      setIsVerified(savedVerifiedStatus === "true");
    }
  }, []);

  const handleBlur = () => {
    if (businessUrl?.trim()) {
      handleUrlVerification(businessUrl);
    }
  };

  const handleInputChange = (e) => {
    setIsInitialLoad(false);
    lastAutoFilledUrlRef.current = "";
    let v = e.target.value.trim();
    v = v.replace(/^https?:\/\//i, "");
    v = v.split("/")[0];
    v = v.replace(/\s+/g, "").toLowerCase();
    const final = HTTPS_PREFIX + v;

    setBusinessUrl(final);
    setcurrentForm((prev) => ({ ...prev, businessUrl: final }));
    setNoBusinessWebsite(false);
    if (businessUrlError) setBusinessUrlError("");

    // debounce verify
    scheduleVerify(final, v);
  };

  // Prevent deleting the forced prefix (like AboutBusiness)
  const handleWebsiteKeyDown = (e) => {
    const { key, target } = e;
    if (key !== "Backspace" && key !== "Delete") return;
    const { selectionStart, selectionEnd, value } = target;
    const fullSelection =
      selectionStart === 0 && selectionEnd === value?.length;

    if (fullSelection) {
      e.preventDefault();
      setBusinessUrl(HTTPS_PREFIX);
      requestAnimationFrame(() =>
        target.setSelectionRange(PREFIX_LEN, PREFIX_LEN)
      );
      return;
    }
    if (selectionStart <= PREFIX_LEN) e.preventDefault();
  };

  // Focus back after invalid attempt
  useEffect(() => {
    if (!businessUrl || businessUrl.length <= PREFIX_LEN) {
      shouldFocusBackRef.current = false;
      return;
    }
    if (shouldFocusBackRef.current) {
      inputRefWebSiteUrl.current?.focus();
      shouldFocusBackRef.current = false;
    }
  }, [businessUrl]);

  useEffect(() => {
    if (token) setUserId(decodeTokenData.id || "");
  }, [token]);

  useEffect(() => {
    if (localStorage.getItem("UpdationMode") == "ON") {
      const savedData = JSON.parse(
        sessionStorage.getItem("aboutBusinessForm") || "{}"
      );
      setOriginalForm({
        googleListing: savedData.googleListing || "",
        businessUrl: savedData.businessUrl || "",
        isWebsiteUrl: savedData.businessUrl ? 1 : 0,
        isGoogleListing: savedData.googleListing ? 1 : 0,
        siteMapUrls: JSON.parse(sessionStorage.getItem("scrapedUrls") || "[]"),
      });
      setcurrentForm({
        googleListing: savedData.googleListing || "",
        businessUrl: savedData.businessUrl || "",
        isWebsiteUrl: savedData.businessUrl ? 1 : 0,
        isGoogleListing: savedData.googleListing ? 1 : 0,
        siteMapUrls: JSON.parse(sessionStorage.getItem("scrapedUrls") || "[]"),
      });

      if (savedData.businessUrl) setBusinessUrl(savedData.businessUrl);
      if (savedData.googleListing) setGoogleListing(savedData.googleListing);

      if (typeof savedData.noGoogleListing === "boolean")
        setNoGoogleListing(savedData.noGoogleListing);
      if (typeof savedData.noBusinessWebsite === "boolean")
        setNoBusinessWebsite(savedData.noBusinessWebsite);
    } else {
      const savedData = JSON.parse(
        sessionStorage.getItem("aboutBusinessForm") || "{}"
      );
      if (savedData) {
        if (savedData.businessUrl) setBusinessUrl(savedData.businessUrl);
        if (typeof savedData.noBusinessWebsite === "boolean")
          setNoBusinessWebsite(savedData.noBusinessWebsite);
      }
    }
  }, []);

  useEffect(() => {
    const aboutBusinessForm = JSON.parse(
      sessionStorage.getItem("aboutBusinessForm") || "{}"
    );
    if (EditingMode == "ON") {
      const noListing =
        !aboutBusinessForm.googleListing?.trim() && !googleListing?.trim();
      const noWebsite =
        !aboutBusinessForm.businessUrl?.trim() && !businessUrl?.trim();

      if (noListing) {
        setNoGoogleListing(true);
        aboutBusinessForm.noGoogleListing = true;
        sessionStorage.setItem(
          "aboutBusinessForm",
          JSON.stringify(aboutBusinessForm)
        );
      }

      if (noWebsite) {
        setNoBusinessWebsite(true);
        setIsVerified(true);
        aboutBusinessForm.noBusinessWebsite = true;
        sessionStorage.setItem(
          "aboutBusinessForm",
          JSON.stringify(aboutBusinessForm)
        );
      }
    } else {
      if (aboutBusinessForm.noGoogleListing === true) setNoGoogleListing(true);
      else setNoGoogleListing(false);

      if (aboutBusinessForm.noBusinessWebsite === true) {
        setNoBusinessWebsite(true);
        setIsVerified(true);
      } else setNoBusinessWebsite(false);
    }
  }, [googleListing, businessUrl]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google?.maps?.places) {
        const input = document.getElementById("google-autocomplete");
        if (input) {
          initAutocomplete();
          clearInterval(interval);
        }
      }
    }, 300);
  }, []);

  // Prefill from saved place details (parity with AboutBusiness)
  useEffect(() => {
    if (noBusinessWebsite) return;
    const place = JSON.parse(
      sessionStorage.getItem("placeDetailsExtract") || "{}"
    );
    if (!businessUrl && place?.website) {
      const normalized = normalizeWebsite(place.website);
      if (normalized) {
        setBusinessUrl(normalized);
        handleUrlVerification(normalized);
      }
    }
  }, []);

  // If placeDetails updates and has a website, autofill it (parity with AboutBusiness)
  useEffect(() => {
    if (noBusinessWebsite) return;
    if (!placeDetails?.website) return;
    const normalized = normalizeWebsite(placeDetails.website);
    if (normalized && (!businessUrl || businessUrl === HTTPS_PREFIX)) {
      setBusinessUrl(normalized);
      handleUrlVerification(normalized);
    }
  }, [placeDetails, noBusinessWebsite]);

  const handleContinue = (e) => {
    e.preventDefault();

    const isWebsiteValid = businessUrl && isVerified;
    const isGoogleListingValid = googleListing.trim();
    if (!isGoogleListingValid && !noGoogleListing) {
      setPopupType("failed");
      setPopupMessage(
        "Please provide a Google Listing or check the box if you don't have one."
      );
      setShowPopup(true);
      return;
    }
    if (!isWebsiteValid && !noBusinessWebsite) {
      setPopupType("failed");
      setPopupMessage(
        "Please provide a valid website or check the box if you don't have one."
      );
      setShowPopup(true);
      return;
    }

    sessionStorage.setItem(
      "aboutBusinessForm",
      JSON.stringify({
        businessUrl,
        googleListing,
        noGoogleListing,
        noBusinessWebsite,
      })
    );
    navigate("/edit-business-detail", { state: { isChanged: true } });
  };

  const isFormChanged = () => {
    if (!originalForm || !currentForm) return false;
    if (originalForm.businessUrl !== currentForm.businessUrl) return true;
    if (originalForm.googleListing !== currentForm.googleListing) return true;
    if (originalForm.displayBusinessName !== currentForm.displayBusinessName)
      return true;
    if (originalForm.isWebsiteUrl !== currentForm.isWebsiteUrl) return true;
    if (originalForm.isGoogleListing !== currentForm.isGoogleListing)
      return true;
    const origUrls = originalForm.siteMapUrls || [];
    const currUrls = currentForm.siteMapUrls || [];
    if (origUrls.length !== currUrls.length) return true;
    for (let i = 0; i < origUrls.length; i++) {
      if (
        origUrls[i].url !== currUrls[i].url ||
        origUrls[i].checkedStatus !== currUrls[i].checkedStatus
      )
        return true;
    }
    return false;
  };

  const handleViewSelectedUrl = (e) => {
    e.preventDefault();
    if (!isVerified) return;
    handleSelectAll();
    if (showSiteMapUrls?.length > 0) return;
    const urls = JSON.parse(sessionStorage.getItem("scrapedUrls")) || [];
    setShowSiteMapUrls(urls);
  };

  const handleSelectAll = () => {
    if (showSiteMapUrls.length > 0) {
      const allSelected = showSiteMapUrls.every((u) => u.checkedStatus);
      const updatedUrls = showSiteMapUrls.map((urlItem) => ({
        ...urlItem,
        checkedStatus: !allSelected,
      }));
      setShowSiteMapUrls(updatedUrls);
      const selected = !allSelected ? updatedUrls.map((u) => u.url) : [];
      setSelectedUrls(selected);
      sessionStorage.setItem("scrapedUrls", JSON.stringify(updatedUrls));
      sessionStorage.setItem("selectedUrls", JSON.stringify(selected));
      setcurrentForm((prev) => ({ ...prev, siteMapUrls: updatedUrls }));
    } else {
      const isChecked = !selectedUrls.includes(addOnUrl);
      setSelectedUrls(isChecked ? [addOnUrl] : []);
      setShowSiteMapUrls([{ url: addOnUrl, checkedStatus: isChecked }]);
      sessionStorage.setItem(
        "scrapedUrls",
        JSON.stringify([{ url: addOnUrl, checkedStatus: isChecked }])
      );
      sessionStorage.setItem(
        "selectedUrls",
        JSON.stringify(isChecked ? [addOnUrl] : [])
      );
      setcurrentForm((prev) => ({ ...prev, siteMapUrls: addOnUrl }));
    }
  };

  const handleCheckboxChange = (item) => {
    let updated;
    if (showSiteMapUrls.length > 0) {
      updated = showSiteMapUrls.map((u) =>
        u.url === item.url ? { ...u, checkedStatus: !u.checkedStatus } : u
      );
      setShowSiteMapUrls(updated);
      const selected = updated.filter((u) => u.checkedStatus).map((u) => u.url);
      setSelectedUrls(selected);
      setcurrentForm((prev) => ({ ...prev, siteMapUrls: updated }));
    } else {
      const isChecked = !selectedUrls.includes(item.url);
      updated = [{ url: item.url, checkedStatus: isChecked }];
      setSelectedUrls(isChecked ? [item.url] : []);
      setShowSiteMapUrls(updated);
      setcurrentForm((prev) => ({ ...prev, siteMapUrls: updated }));
    }
    sessionStorage.setItem("scrapedUrls", JSON.stringify(updated));
  };

  const isSubmitEnabled =
    showSiteMapUrls.length > 0
      ? showSiteMapUrls.some((u) => u.checkedStatus)
      : selectedUrls.includes(addOnUrl);

  useEffect(() => {
    const sessionSelected = JSON.parse(
      sessionStorage.getItem("selectedSiteMapUrls")
    );
    if (sessionSelected && sessionSelected.length > 0) {
      const checkedUrls = sessionSelected
        .filter((item) => item.checkedStatus)
        .map((item) => item.url);
      setSelectedUrls(checkedUrls);
    }
  }, [showSiteMapUrls]);

  return (
    <>
      <EditHeader title="Edit Agent " agentName={agentnm} />
      <div className={styles.Maindiv}>
        <SectionHeader
          heading="Public Listing"
          subheading="Enter your Google My Business Listing & Website"
        />
      </div>

      <div className={styles.container}>
        <div className={styles.inputSection}>
          <label className={styles.label}>Google My Business</label>
          <input
            type="text"
            id="google-autocomplete"
            className={styles.input}
            placeholder="Type the name of your Business to Search"
            value={displayBusinessName}
            onChange={(e) => {
              setDisplayBusinessName(e.target.value);
              setcurrentForm((prev) => ({
                ...prev,
                displayBusinessName: e.target.value,
              }));
            }}
            disabled={noGoogleListing}
          />
        </div>
        <label className={styles.checkboxContainer}>
          <input
            type="checkbox"
            checked={noGoogleListing}
            onChange={(e) => {
              const checked = e.target.checked;
              setNoGoogleListing(checked);
              setcurrentForm((prev) => ({
                ...prev,
                isGoogleListing: checked ? 0 : 1,
              }));

              const form = JSON.parse(
                sessionStorage.getItem("aboutBusinessForm") || "{}"
              );
              form.isGoogleListing = checked ? 0 : 1;

              if (checked) {
                setGoogleListing("");
                setDisplayBusinessName("");
                sessionStorage.removeItem("googleListing");
                sessionStorage.removeItem("displayBusinessName");
                form.googleListing = "";
                form.displayBusinessName = "";
              } else {
                const prevGoogleListing =
                  sessionStorage.getItem("googleListing");
                const prevDisplayName = sessionStorage.getItem(
                  "displayBusinessName"
                );
                if (prevGoogleListing) {
                  setGoogleListing(prevGoogleListing);
                  form.googleListing = prevGoogleListing;
                }
                if (prevDisplayName) {
                  setDisplayBusinessName(prevDisplayName);
                  form.displayBusinessName = prevDisplayName;
                }
              }

              sessionStorage.setItem("aboutBusinessForm", JSON.stringify(form));
            }}
          />
          <span className={styles.customCheckbox}></span>I do not have Google My
          Business Listing
        </label>

        <hr className={styles.separator} />

        <div className={styles.inputSection}>
          <label className={styles.label}>Website (URL)</label>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              className={styles.input}
              id="https://your-website-url"
              type="url"
              placeholder="https://your website url"
              value={businessUrl}
              inputMode="url"
              autoComplete="url"
              list="url-suggestions"
              style={{ width: "100%" }}
              ref={inputRefWebSiteUrl}
              onKeyDown={handleWebsiteKeyDown}
              disabled={noBusinessWebsite || urlVerificationInProgress}
              onInput={handleInputChange}
            />
            {urlVerificationInProgress ? (
              <Loader size={20} />
            ) : !noBusinessWebsite &&
              businessUrl?.length > HTTPS_PREFIX?.length ? (
              isVerified ? (
                <span style={{ color: "green", fontSize: "20px" }}>✔️</span>
              ) : (
                <span style={{ color: "red", fontSize: "20px" }}>❌</span>
              )
            ) : null}
          </div>
          {businessUrlError && (
            <div style={{ color: "red", marginTop: "4px" }}>
              {businessUrlError}
            </div>
          )}
        </div>

        <label
          disabled={urlVerificationInProgress}
          className={styles.checkboxContainer}
        >
          <input
            className={styles.noBusinessWebsite}
            type="checkbox"
            checked={noBusinessWebsite}
            disabled={urlVerificationInProgress}
            onChange={(e) => {
              const checked = e.target.checked;
              setNoBusinessWebsite(checked);
              setcurrentForm((prev) => ({
                ...prev,
                isWebsiteUrl: checked ? 0 : 1,
              }));
              const form = JSON.parse(
                sessionStorage.getItem("aboutBusinessForm") || "{}"
              );
              form.isWebsiteUrl = checked ? 0 : 1;
              if (checked) {
                setBusinessUrl("");
                setBusinessUrlError("");
                setcurrentForm((prev) => ({ ...prev, businessUrl: "" }));
                sessionStorage.removeItem("businessUrl");
              }
              sessionStorage.setItem("aboutBusinessForm", JSON.stringify(form));
            }}
          />
          <span className={styles.customCheckbox}></span>I do not have a
          business website
        </label>

        <div
          className={styles.stickyWrapper}
          onClick={handleContinue}
          style={{
            pointerEvents: isFormChanged() ? "auto" : "none",
            opacity: isFormChanged() ? 1 : 0.5,
          }}
        >
          <AnimatedButton
            label="Save"
            disabled={!isFormChanged() || urlVerificationInProgress}
          />
        </div>

        {showPopup && (
          <PopUp
            type={popupType}
            onClose={() => {
              setShowPopup(false);
            }}
            message={popupMessage}
          />
        )}

        {showSiteMapModal && (
          <Modal2
            isOpen={showSiteMapModal}
            onClose={() => setShowSiteMapModal(false)}
          >
            <div className={styles.sitemapModal}>
              <div className={styles.sitemapHeader}>
                <input
                  type="checkbox"
                  checked={
                    showSiteMapUrls.length > 0
                      ? selectedUrls.length === showSiteMapUrls.length
                      : selectedUrls.includes(addOnUrl)
                  }
                  onChange={handleSelectAll}
                />
                <label>Select All</label>
              </div>

              <div className={styles.sitemapList}>
                {showSiteMapUrls.length > 0 ? (
                  showSiteMapUrls.map((item, index) => (
                    <label className={styles.sitemapItem} key={index}>
                      <input
                        type="checkbox"
                        checked={item.checkedStatus}
                        onChange={() => handleCheckboxChange(item)}
                      />
                      <span>{item.url}</span>
                    </label>
                  ))
                ) : addOnUrl ? (
                  <label className={styles.sitemapItem}>
                    <input
                      type="checkbox"
                      checked={selectedUrls.includes(addOnUrl)}
                      onChange={() =>
                        handleCheckboxChange({
                          url: addOnUrl,
                          checkedStatus: selectedUrls.includes(addOnUrl),
                        })
                      }
                    />
                    <span>{addOnUrl}</span>
                  </label>
                ) : businessUrl ? (
                  <label className={styles.sitemapItem}>
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() =>
                        handleCheckboxChange({
                          url: businessUrl,
                          checkedStatus: true,
                        })
                      }
                    />
                    <span>{businessUrl}</span>
                  </label>
                ) : null}
              </div>
            </div>
          </Modal2>
        )}
      </div>
    </>
  );
};

export default EditPublic;
