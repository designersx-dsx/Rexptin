import React, { useState } from "react";
import styles from "../AboutBusiness/AboutBusiness.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PopUp from "../Popup/Popup";
import Loader from "../Loader/Loader";

function AboutBusiness() {
  const [files, setFiles] = useState([]);
  const [businessUrl, setBusinessUrl] = useState("");
  const [googleListing, setGoogleListing] = useState("");
  const [aboutBusiness, setAboutBusiness] = useState("");
  const [note, setNote] = useState("");

  // Inline error states
  const [businessUrlError, setBusinessUrlError] = useState("");
  const [googleListingError, setGoogleListingError] = useState("");
  const [aboutBusinessError, setAboutBusinessError] = useState("");
  const [filesError, setFilesError] = useState("");

  // Submission flags
  const [businessUrlSubmitted, setBusinessUrlSubmitted] = useState(false);
  const [googleListingSubmitted, setGoogleListingSubmitted] = useState(false);
  const [aboutBusinessSubmitted, setAboutBusinessSubmitted] = useState(false);
  const [filesSubmitted, setFilesSubmitted] = useState(false);

  const [popupType, setPopupType] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length > 5) {
      alert("You can only upload a maximum of 5 files.");
      return;
    }

    setFiles(selectedFiles);
    if (filesSubmitted) setFilesError(validateFiles(selectedFiles));
  };

  const isValidUrl = (url) => {
    const pattern = new RegExp(
      "^(https?:\\/\\/)?" +
      "((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|" +
      "((\\d{1,3}\\.){3}\\d{1,3}))" +
      "(\\:\\d+)?(\\/[-a-zA-Z\\d%@_.~+&:]*)*" +
      "(\\?[;&a-zA-Z\\d%@_.,~+&:=-]*)?" +
      "(\\#[-a-zA-Z\\d_]*)?$",
      "i"
    );
    return !!pattern.test(url);
  };

  const validateBusinessUrl = (url) => {
    if (!url.trim()) return "Business URL is required.";
    if (!isValidUrl(url.trim())) return "Please enter a valid URL.";
    return "";
  };

  const validateGoogleListing = (url) => {
    if (!url.trim()) return "Google Listing URL is required.";
    if (!isValidUrl(url.trim())) return "Please enter a valid URL.";
    return "";
  };

  const validateAboutBusiness = (text) => {
    if (!text.trim()) return "Business description is required.";
    return "";
  };

  const validateFiles = (filesArray) => {
    if (filesArray.length === 0) return "At least one file must be uploaded.";
    return "";
  };

  const validateForm = () => {
    const urlError = validateBusinessUrl(businessUrl);
    // const listingError = validateGoogleListing(googleListing);
    // const aboutError = validateAboutBusiness(aboutBusiness);
    // const fileErr = validateFiles(files);

    setBusinessUrlError(urlError);
    // setGoogleListingError(listingError);
    // setAboutBusinessError(aboutError);
    // setFilesError(fileErr);

    return !urlError
    // && !listingError && !aboutError && !fileErr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusinessUrlSubmitted(true);
    setGoogleListingSubmitted(true);
    setAboutBusinessSubmitted(true);
    setFilesSubmitted(true);

    if (!validateForm()) return;

    const business = JSON.parse(sessionStorage.getItem("businessDetails"));

    const mergedUrls = [businessUrl.trim()];

    const formData = new FormData();
    const today = new Date().toISOString().split("T")[0];
    const knowledgeBaseName = `${business?.businessName || "Business"}-${today}`;

    formData.append("knowledge_base_name", knowledgeBaseName);
    formData.append("knowledge_base_urls", JSON.stringify(mergedUrls));
    // formData.append("knowledge_base_texts", JSON.stringify(aboutBusiness)); // Optional
    console.log(knowledgeBaseName, JSON.stringify(mergedUrls))
    files.forEach((file) => {
      formData.append("knowledge_base_files", file);
    });
    console.log(formData, "formData")
    try {
      setLoading(true);
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

      sessionStorage.setItem("knowledgeBaseId", response.data.knowledge_base_id);

      setPopupType("success");
      setPopupMessage("Knowledge base created successfully!");
      setShowPopup(true);

      setTimeout(() => navigate("/steps"), 1500);
    } catch (error) {
      console.error("Upload failed:", error.response?.data?.message || error.message);
      setPopupType("failed");
      setPopupMessage(error.response?.data?.message || "Internal Server Error");
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };
  const handleSkip=()=>{
    navigate("/steps")
  }
  return (
    <>
      <div>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>About Your Business</h1>
          </div>
          <form className={styles.formContainer} onSubmit={handleSubmit}>
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="business-url">URL (Website)</label>
                <input
                  id="business-url"
                  type="text"
                  placeholder="https://your website url"
                  value={businessUrl}
                  onChange={(e) => {
                    setBusinessUrl(e.target.value);
                    if (businessUrlSubmitted)
                      setBusinessUrlError(validateBusinessUrl(e.target.value));
                  }}
                />

              </div>
              {businessUrlSubmitted && businessUrlError && (
                <p className={styles.inlineError}>{businessUrlError}</p>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="google-listing">Google Listing</label>
                <input
                  id="google-listing"
                  type="text"
                  placeholder="Url"
                  value={googleListing}
                  onChange={(e) => {
                    setGoogleListing(e.target.value);
                    if (googleListingSubmitted)
                      setGoogleListingError(validateGoogleListing(e.target.value));
                  }}
                />

              </div>
              {googleListingSubmitted && googleListingError && (
                <p className={styles.inlineError}>{googleListingError}</p>
              )}
              <div className={styles.formGroup}>
                <label htmlFor="about-business">More About your Business</label>
                <input
                  id="about-business"
                  type="text"
                  placeholder="Describe"
                  value={aboutBusiness}
                  onChange={(e) => {
                    setAboutBusiness(e.target.value);
                    if (aboutBusinessSubmitted)
                      setAboutBusinessError(validateAboutBusiness(e.target.value));
                  }}
                />

              </div>
              {aboutBusinessSubmitted && aboutBusinessError && (
                <p className={styles.inlineError}>{aboutBusinessError}</p>
              )}
              <div className={styles.formGroup}>
                <label htmlFor="file-upload">File Upload</label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                />

              </div>
              {filesSubmitted && filesError && (
                <p className={styles.inlineError}>{filesError}</p>
              )}
              <div className={styles.formGroup}>
                <label htmlFor="additional-note">Additional Note</label>
                <textarea
                  id="additional-note"
                  placeholder="Note"
                  rows="4"
                  cols="50"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
              </div>
              <div onClick={handleSkip} className={styles.skipButton}>
                <button>Skip for now</button>
              </div>
              <div>
                <button type="submit" className={styles.btnTheme} disabled={loading}>
                  <img src="images/svg-theme.svg" alt="" />
                  {loading ? (
                    <>
                      Add <Loader size={20} />
                    </>
                  ) : (
                    <p>Continue</p>
                  )}
                </button>
              </div>
            </div>
          </form>
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
}

export default AboutBusiness;
