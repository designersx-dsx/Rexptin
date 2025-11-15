import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "../AboutBusiness/AboutBusiness.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import PopUp from "../Popup/Popup";
import Loader from "../Loader/Loader";
import Modal2 from "../Modal2/Modal2";
import {
  API_BASE_URL,
  listAgents,
  listSiteMap,
  validateWebsite,
} from "../../Store/apiStore";
import decodeToken from "../../lib/decodeToken";
import { useAgentCreator } from "../../hooks/useAgentCreator";
import useCheckAgentCreationLimit from "../../hooks/useCheckAgentCreationLimit";
// Convert data URL → File (used when re-hydrating)
// fkjdsfds
// flkdskfds
// fsdm;lfmds
const dataURLtoFile = (dataUrl, fileName = "file") => {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const bytes = atob(base64);
  const buf = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
  return new File([buf], fileName, { type: mime });
};
const AboutBusiness = forwardRef(
  (
    {
      onNext,
      onBack,
      onValidationError,
      onSuccess,
      onFailed,
      setLoading,
      onStepChange,
      onSiteMap,
      selectedSiteMapUrls,
      onRequestNoGMBConfirm,
    },
    ref
  ) => {
    const aboutBusinessForm1 = JSON.parse(
      sessionStorage.getItem("aboutBusinessForm") || "{}"
    );
    const [noGoogleListing, setNoGoogleListing] = useState(
      aboutBusinessForm1?.noGoogleListing || false
    );
    const [noBusinessWebsite, setNoBusinessWebsite] = useState(
      aboutBusinessForm1?.noBusinessWebsite || false
    );
    const [files, setFiles] = useState([]);
    const [businessUrl, setBusinessUrl] = useState("");
    const [googleListing, setGoogleListing] = useState("");
    const [aboutBusiness, setAboutBusiness] = useState("");
    const [note, setNote] = useState("");
    const [placeDetails, setPlaceDetails] = useState(null);
    // Inline error states
    const [businessUrlError, setBusinessUrlError] = useState("");
    const [popupType, setPopupType] = useState(null);
    const [popupMessage, setPopupMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    // const [loading, setLoading] = useState(false);
    const [agentCount, setAgentCount] = useState(0);
    const HTTPS_PREFIX = "https://";
    const PREFIX_LEN = HTTPS_PREFIX.length;
    const navigate = useNavigate();
    const token = localStorage.getItem("token") || "";
    const decodeTokenData = decodeToken(token);
    const [userId, setUserId] = useState(decodeTokenData?.id || "");
    const [isVerified, setIsVerified] = useState(false);
    const [urlVerificationInProgress, setUrlVerificationInProgress] =
      useState(false);
    const [displayBusinessName, setDisplayBusinessName] = useState("");
    const sessionBusinessiD = JSON.parse(sessionStorage.getItem("bId"));
    const EditingMode = localStorage.getItem("UpdationMode");
    const [placeInfoText, setPlaceInfoText] = useState("");
    const viewSiteModal = sessionStorage.getItem("viewSiteMap");
    const [shouldFocusBack, setShouldFocusBack] = useState(false);
    const setHasFetched = true;
    const typingTimeoutRef = useRef(null);
    const inputRefWebSiteUrl = useRef(null);
    const noBusinessWebsiteRef = useRef(noBusinessWebsite);

    useEffect(() => {
      noBusinessWebsiteRef.current = noBusinessWebsite;
    }, [noBusinessWebsite]);

    const { handleCreateAgent } = useAgentCreator({
      stepValidator: () => "AboutBusiness",
      setLoading,
      setPopupMessage,
      setPopupType,
      setShowPopup,
      navigate,
      setHasFetched,
    });

    const { isLimitExceeded, CheckingUserLimit } =
      useCheckAgentCreationLimit(userId);

    const [selectedUrls, setSelectedUrls] = useState([]);

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
    const prevPlaceIdRef = useRef(null);
    const lastAutoFilledUrlRef = useRef("");

    const askParentForNoGMBConfirm = () => {
      onRequestNoGMBConfirm?.({
        onConfirm: () => {
          // user confirmed → set checked and clear GMB data
          setNoGoogleListing(true);

          const form = JSON.parse(
            sessionStorage.getItem("aboutBusinessForm") || "{}"
          );
          form.noGoogleListing = true;
          sessionStorage.setItem("aboutBusinessForm", JSON.stringify(form));
          setGoogleListing("");
          setDisplayBusinessName("");
          sessionStorage.removeItem("googleListing");
          sessionStorage.removeItem("displayBusinessName");

          const form1 = JSON.parse(
            sessionStorage.getItem("placeDetailsExtract") || "{}"
          );
          const clearedGoogleData = {
            name: "",
            address: "",
            phone: "",
            internationalPhone: "",
            website: "",
            rating: "",
            totalRatings: "",
            hours: [],
            businessStatus: "",
            categories: [],
            aboutBussiness: form1?.aboutBusiness || form1?.aboutBussiness || "",
            businessName: "",
          };
          const updatedForm = { ...form1, ...clearedGoogleData };
          sessionStorage.setItem(
            "placeDetailsExtract",
            JSON.stringify(updatedForm)
          );
        },
        onCancel: () => {
          // user cancelled → keep it unchecked
          setNoGoogleListing(false);
          const form = JSON.parse(
            sessionStorage.getItem("aboutBusinessForm") || "{}"
          );
          form.noGoogleListing = false;
          sessionStorage.setItem("aboutBusinessForm", JSON.stringify(form));
        },
      });
    };

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
        return "https://" + v;
      } catch {
        return "";
      }
    };

    const maybeAutofillWebsite = (place) => {
      if (noBusinessWebsiteRef.current) return;

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

    const filterCompanyPages = (urls) => {
      return urls.filter((url) =>
        companyKeywords.some((keyword) => url.toLowerCase().includes(keyword))
      );
    };

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
          sessionStorage.setItem("displayBusinessName", businessName);
          fetchPlaceDetails(place.place_id);
        }
      });
    };
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
              address_components: result.address_components || [],
            };

            const updatedForm = { ...form1, ...businessData };
            sessionStorage.setItem(
              "placeDetailsExtract",
              JSON.stringify(updatedForm)
            );

            setPlaceInfoText(JSON.stringify(result, null, 2));
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
        place.address_components.find((c) => c.types.includes("postal_code"))
          ?.long_name,
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
      try {
        const result = await validateWebsite(url);
        if (result.valid) {
          setIsVerified(true);
          setBusinessUrlError("");
          sessionStorage.setItem("businessUrl", url);
          localStorage.setItem("isVerified", true);
          const res = await listSiteMap(url);
          const filteredUrls = filterCompanyPages(res.urls);
          if (!filteredUrls.includes(url)) {
            filteredUrls.unshift(url);
          }
          sessionStorage.setItem("urls", JSON.stringify(filteredUrls));
          onSiteMap({ status: true, data: filteredUrls, addOnUrl: url });
          sessionStorage.setItem("viewSiteMap", true);
          setUrlVerificationInProgress(false);
          return true;
        } else {
          setIsVerified(false);
          setBusinessUrlError("Invalid URL");
          localStorage.setItem("isVerified", false);
          setUrlVerificationInProgress(false);
          if (url.trim()) {
            setShouldFocusBack(true);
          }
          return false;
        }
      } catch (error) {
        setIsVerified(false);
        setBusinessUrlError("Verification failed");
        localStorage.setItem("isVerified", false);
        setUrlVerificationInProgress(false);
        setShouldFocusBack(true);

        return false;
      }
    };

    useEffect(() => {
      const savedVerifiedStatus = localStorage.getItem("isVerified");
      if (savedVerifiedStatus !== null) {
        setIsVerified(savedVerifiedStatus === "true");
      }
    }, []);

    const handleBlur = (e) => {
      if (businessUrl.trim()) {
        handleUrlVerification(businessUrl);
      }
    };

    const handleInputChange = (e) => {
      lastAutoFilledUrlRef.current = "";
      let v = e.target.value.trim();
      v = v.replace(/^https?:\/\//i, "");
      v = v.replace(/\s+/g, "").toLowerCase();
      const final = "https://" + v;

      setBusinessUrl(final);
      setNoBusinessWebsite(false);

      if (businessUrlError) {
        setBusinessUrlError("");
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        const domainRegex = /^[\w-]+(\.[\w-]{2,})+$/i;
        if (domainRegex.test(v)) {
          handleUrlVerification(final);
        }
      }, 500);
    };
    useEffect(() => {
      if (token) {
        setUserId(decodeTokenData.id || "");
      }
    }, [token]);

    useEffect(() => {
      const savedData = JSON.parse(
        sessionStorage.getItem("aboutBusinessForm") || "{}"
      );

      // 1️⃣ Restore checkbox states first
      if (typeof savedData.noGoogleListing === "boolean") {
        setNoGoogleListing(savedData.noGoogleListing);
      }
      if (typeof savedData.noBusinessWebsite === "boolean") {
        setNoBusinessWebsite(savedData.noBusinessWebsite);
      }

      // 2️⃣ Only restore website URL if user *does* have a website
      if (!savedData.noBusinessWebsite && savedData.businessUrl) {
        setBusinessUrl(savedData.businessUrl);
      }

      if (localStorage.getItem("UpdationMode") == "ON") {
        if (!savedData.noBusinessWebsite && savedData.businessUrl) {
          setBusinessUrl(savedData.businessUrl);
        }

        if (savedData.aboutBusiness) setAboutBusiness(savedData.aboutBusiness);
        if (savedData.note) setNote(savedData.note);
        if (savedData.googleListing) {
          setGoogleListing(savedData.googleListing);
        }

        if (Array.isArray(savedData.files) && savedData.files.length) {
          const rebuiltFiles = savedData.files.map((d, i) =>
            dataURLtoFile(d, `file${i + 1}`)
          );
          setFiles(rebuiltFiles);
        }
      }
    }, []);

    useEffect(() => {
      if (noBusinessWebsite) {
        setBusinessUrl("");
        setIsVerified(false);
        setBusinessUrlError("");
        sessionStorage.removeItem("businessUrl");
      }
    }, [noBusinessWebsite]);

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
        if (aboutBusinessForm.noGoogleListing === true) {
          setNoGoogleListing(true);
        } else {
          setNoGoogleListing(false);
        }

        if (aboutBusinessForm.noBusinessWebsite === true) {
          setNoBusinessWebsite(true);
          setIsVerified(true);
        } else {
          setNoBusinessWebsite(false);
        }
      }
    }, [googleListing, businessUrl]);

    const fetchAgentCountFromUser = async () => {
      try {
        const response = await listAgents();
        const filterAgents = await response.filter(
          (res) => res.userId === userId
        );
        setAgentCount(filterAgents.length);
      } catch (error) {
        console.log(error);
      }
    };
    const handleContinue = (e) => {
      sessionStorage.setItem(
        "aboutBusinessForm",
        JSON.stringify({
          businessUrl,
          googleListing,
          aboutBusiness,
          note,
          noGoogleListing,
          noBusinessWebsite,
        })
      );
      onStepChange?.(4);
    };
    const handleSkip = (e) => {
      e.preventDefault();
      setPopupType("confirm");
      setPopupMessage(
        "This step is essential for your agent to understand your business context. You can always update these settings later as needed."
      );
      setShowPopup(true);
    };
    const confirmSkip = () => {
      setShowPopup(false);
      navigate("/steps");
    };
    useEffect(() => {
      const savedGoogleListing = sessionStorage.getItem("googleListing");
      const savedDisplayBusinessName = sessionStorage.getItem(
        "displayBusinessName"
      );

      if (savedGoogleListing) {
        setGoogleListing(savedGoogleListing);
      }

      if (savedDisplayBusinessName) {
        setDisplayBusinessName(savedDisplayBusinessName);
      }
    }, []);

    useEffect(() => {
      fetchAgentCountFromUser();
    }, []);

    const handleSaveEdit = (e) => {
      e.preventDefault();
      sessionStorage.setItem(
        "aboutBusinessForm",
        JSON.stringify({
          businessUrl,
          googleListing,
          aboutBusiness,
          note,
        })
      );
      setTimeout(() => {
        handleCreateAgent();
      }, 800);
    };
    useEffect(() => {
      if (!CheckingUserLimit && isLimitExceeded && !EditingMode) {
        setShowPopup(true);
        setPopupType("failed");
        setPopupMessage(
          "Agent creation limit exceeded. Please upgrade your plan!"
        );
      }
    }, [CheckingUserLimit, isLimitExceeded]);
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
    // if (CheckingUserLimit) return;
    const handleClosePopup = () => {
      if (!CheckingUserLimit && isLimitExceeded && !EditingMode) {
        navigate("/dashboard");
        setShowPopup(false);
      } else {
        setShowPopup(false);
      }
    };
    //Using Error Handling
    useImperativeHandle(ref, () => ({
      validate: () => {
        let hasError = false;
        const isWebsiteValid = businessUrl && isVerified;
        const isGoogleListingValid = googleListing.trim();

        // Google Listing validation
        if (!isGoogleListingValid && !noGoogleListing) {
          onValidationError?.({
            type: "failed",
            message:
              "Please provide a Google Listing or check the box if you don't have one.",
          });
          hasError = true;
        }

        // Website validation
        if (!isWebsiteValid && !noBusinessWebsite) {
          onValidationError?.({
            type: "failed",
            message:
              "Please provide a valid website or check the box if you don't have one.",
          });
          hasError = true;
        }

        return !hasError;
      },

      save: async () => {
        handleContinue();
      },
    }));

  const SCROLL_OFFSET = 80; 

const handleFocus = (e) => {
  const el = e.target;
  setTimeout(() => {
    const rect = el.getBoundingClientRect();
    const absoluteTop = rect.top + window.scrollY;

    window.scrollTo({
      top: absoluteTop - SCROLL_OFFSET, 
      behavior: "smooth",
    });
  }, 200);
};



    const handleViewSelectedUrl = (e) => {
      e.preventDefault();
      const urls = JSON.parse(sessionStorage.getItem("urls")) || [];
      onSiteMap({ status: true, data: urls, addOnUrl: businessUrl });
    };
    useEffect(() => {
      if (businessUrl.length <= 8) {
        setShouldFocusBack(false);
        return;
      }

      if (shouldFocusBack) {
        inputRefWebSiteUrl.current?.focus();
        setShouldFocusBack(false);
      }
    }, [shouldFocusBack, businessUrl]);
    useEffect(() => {
      if (noBusinessWebsite) return;

      const place = JSON.parse(
        sessionStorage.getItem("placeDetailsExtract") || "{}"
      );
      if (!businessUrl && place?.website) {
        const normalized = normalizeWebsite(place.website);
        if (normalized) {
          setBusinessUrl(normalized);
          // immediately verify the prefilled url
          handleUrlVerification(normalized);
        }
      }
    }, []);
    useEffect(() => {
      if (noBusinessWebsite) return;
      if (!placeDetails?.website) return;

      const normalized = normalizeWebsite(placeDetails.website);
      // Only set if the user hasn't started typing (empty or just the forced prefix)
      if (normalized && (!businessUrl || businessUrl === HTTPS_PREFIX)) {
        setBusinessUrl(normalized);
        handleUrlVerification(normalized);
      }
    }, [placeDetails, noBusinessWebsite]);

    return (
      <>
        <div>
          <div className={styles.container}>
            <div className={styles.header}>
              {/* <h1>
              {EditingMode
                ? "Edit: Your business Listing"
                : "Your business Listing"}
            </h1> */}
            </div>
            <form className={styles.formContainer}>
              <div className={styles.form}>
                <div>
                  <div className={styles.formGroup}>
                    <label htmlFor="google-autocomplete">
                      Google My Business
                      <span className={styles.requiredStar1}>*</span>
                    </label>
                    <input
                      id="google-autocomplete"
                      type="text"
                      autoComplete="off"
                      placeholder="Type the name of your Business to Search"
                      value={displayBusinessName}
                      // onChange={(e) => setGoogleListing(e.target.value)}
                      onChange={(e) => {
                        setDisplayBusinessName(e.target.value);
                      }}
                      required
                      disabled={noGoogleListing}
                    />
                  </div>
                  <div className={styles.checkboxRow}>
                    <input
                      id="no-google-listing"
                      type="checkbox"
                      className={styles.customCheckbox}
                      checked={noGoogleListing}
                      onChange={(e) => {
                        const checked = e.target.checked;

                        if (checked) {
                          // Ask parent to open the confirm modal
                          askParentForNoGMBConfirm();
                        } else {
                          // direct uncheck → just clear flag
                          setNoGoogleListing(false);
                          const form = JSON.parse(
                            sessionStorage.getItem("aboutBusinessForm") || "{}"
                          );
                          form.noGoogleListing = false;
                          sessionStorage.setItem(
                            "aboutBusinessForm",
                            JSON.stringify(form)
                          );
                        }
                      }}
                      onFocus={handleFocus}
                    />
                    <label htmlFor="no-google-listing">
                      I do not have Google My Business Listing
                    </label>
                  </div>
                </div>
                <hr className={styles.fieldDivider} />
                <div className={styles.labReq}>
                  <div className={styles.formGroup}>
                    <div className={styles.Dblock}>
                      <label htmlFor="business-url">
                        Website (URL)
                        <span className={styles.requiredStar}>*</span>{" "}
                      </label>
                      <div className={styles.inputFlex}>
                        <input
                          id="https://your-website-url"
                          type="url"
                          placeholder="https://your website url"
                          value={businessUrl}
                          autoComplete="off"
                          inputMode="url"
                          ref={inputRefWebSiteUrl}
                          // onBlur={handleBlur}

                          list="url-suggestions"
                          style={{ width: "100%" }}
                          onKeyDown={(e) => {
                            const { key, target } = e;
                            if (key !== "Backspace" && key !== "Delete") return;
                            const { selectionStart, selectionEnd, value } =
                              target;
                            const fullSelection =
                              selectionStart === 0 &&
                              selectionEnd === value.length;

                            if (fullSelection) {
                              e.preventDefault();
                              setBusinessUrl(HTTPS_PREFIX);
                              // Put caret after the prefix
                              requestAnimationFrame(() =>
                                target.setSelectionRange(PREFIX_LEN, PREFIX_LEN)
                              );
                              return;
                            }
                            if (selectionStart <= PREFIX_LEN)
                              e.preventDefault();
                          }}
                          disabled={
                            noBusinessWebsite || urlVerificationInProgress
                          }
                          onInput={handleInputChange}
                          onFocus={handleFocus}
                        />
                        <div className={styles.verifyStatus}>
                          {urlVerificationInProgress ? (
                            <Loader size={20} />
                          ) : (
                            isVerified !== null &&
                            businessUrl &&
                            !noBusinessWebsite && (
                              <span
                                className={
                                  isVerified
                                    ? styles.validIcon
                                    : styles.invalidIcon
                                }
                              >
                                {isVerified === true ? "✔️" : "❌"}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                    {/* <div>
                    {(businessUrl.length > 8 && isVerified && viewSiteModal && !noBusinessWebsite) && <button disabled={urlVerificationInProgress} className={styles.modalViewBtn} onClick={handleViewSelectedUrl}>View</button>}
                  </div> */}
                  </div>

                  <div className={styles.checkboxRow}>
                    <input
                      id="no-business-website"
                      type="checkbox"
                      className={styles.customCheckbox}
                      checked={noBusinessWebsite}
                      disabled={urlVerificationInProgress}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setNoBusinessWebsite(checked);

                        const aboutBusinessForm = JSON.parse(
                          sessionStorage.getItem("aboutBusinessForm") || "{}"
                        );
                        aboutBusinessForm.noBusinessWebsite = checked;
                        sessionStorage.setItem(
                          "aboutBusinessForm",
                          JSON.stringify(aboutBusinessForm)
                        );

                        if (checked) {
                          setBusinessUrl("");
                          setIsVerified(null);
                          setBusinessUrlError("");
                          sessionStorage.removeItem("businessUrl");
                        }
                      }}
                    />
                    <label
                      htmlFor="no-business-website"
                      className={styles.iHaveNot}
                      // disabled={urlVerificationInProgress}
                    >
                      I do not have a business website
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </div>
          {showPopup && (
            <PopUp
              type={popupType}
              onClose={() => handleClosePopup()}
              message={popupMessage}
              onConfirm={confirmSkip}
            />
          )}
        </div>
      </>
    );
  }
);

export default AboutBusiness;
