import React, { useEffect, useState } from "react";
import styles from "./Integrate-agent.module.css";
import HeaderBar from "../HeaderBar/HeaderBar";
import Modal2 from "../Modal2/Modal2";
import { useLocation } from "react-router-dom";
import { API_BASE_URL, deleteDomain, validateWebsite } from "../../Store/apiStore";
import PopUp from "../Popup/Popup";
import { updateAgentWidgetDomain } from "../../Store/apiStore";
import AnimatedButton from "../AnimatedButton/AnimatedButton";
import { useRef } from "react";
import { useDashboardStore } from "../../Store/agentZustandStore";

const IntegrateAgent = () => {
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("failed");
  const [showPopup, setShowPopup] = useState(false);
  const [validatingDomain, setValidatingDomain] = useState(false);
  const location = useLocation();
  const { agentDetails } = location.state || {};
  //  const { agentDetails } = location.state || {};
  const [domains, setDomains] = useState([]);
  const [emails, setEmails] = useState([]);
  const [generateMode, setGenerateMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [sending, setSending] = useState(false);
  const [scriptGenerated, setScriptGenerated] = useState(false);
  const [isDomainFormatValid, setIsDomainFormatValid] = useState(false);
  const [validateTimer, setValidateTimer] = useState(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const [isVerified, setIsVerified] = useState(false);
  const isValidDomainFormat = (domain) => {
    const regex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}$/i;
    return regex.test(domain.trim());
  };
  const { agents, totalCalls, hasFetched, setDashboardData, setHasFetched } = useDashboardStore();
  const agentId = agentDetails?.agent_id;
  const webUrl = agentDetails?.business?.webUrl
  const agentWidgetDomain = agentDetails
  // const script = agentId
  //   ? `<script id="rex-widget-script" src="https://rexptin.vercel.app/widget.js?agentId=${agentId}"></script>`
  //   : "";
 const script = agentId
    ? `<script id="rex-widget-script" src="app.rexpt.in/widget.js?agentId=${agentId}"></script>`
    : "";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDomain, setNewDomain] = useState("");

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddEmails();
    }
  };


  const handleAddEmails = () => {
    const rawEmails = emailInput
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    const validEmails = rawEmails.filter(validateEmail);
    const invalidEmails = rawEmails.filter((e) => !validateEmail(e));

    if (invalidEmails.length > 0) {
      setEmailError(`Invalid email(s): ${invalidEmails.join(", ")}`);
      return;
    }

    const newEmails = validEmails.filter((e) => !emails.includes(e));
    if (newEmails.length > 0) {
      setEmails((prev) => [...prev, ...newEmails]);

      // Remove added emails from input, but keep what's left
      const remainingInput = emailInput
        .split(",")
        .filter((e) => !validateEmail(e.trim()))
        .join(", ");

      setEmailInput(remainingInput); // <-- keep what's left
      setEmailError("");
    }

  };

  const handleDeleteEmail = (index) => {
    setEmails((prev) => prev.filter((_, i) => i !== index));
  };
  useEffect(() => {
    const savedData = localStorage.getItem("widgetSetupData");
    let finalDomains = [];

    // Get domains from saved localStorage
    // if (savedData) {
    //   try {
    //     const parsed = JSON.parse(savedData);
    //     if (Array.isArray(parsed.domains)) {
    //       finalDomains = [...parsed.domains];
    //     }
    //   } catch (e) {
    //     console.error("Failed to parse saved widget data.");
    //   }
    // }

    if (agentDetails) {
      let domainList = [];

      // Handle string or array format from backend
      if (typeof agentDetails.agentWidgetDomain === "string") {
        try {
          const parsed = JSON.parse(agentDetails.agentWidgetDomain);
          domainList = Array.isArray(parsed) ? parsed : [];
        } catch {
          domainList = [];
        }
      } else if (Array.isArray(agentDetails.agentWidgetDomain)) {
        domainList = agentDetails.agentWidgetDomain;
      }

      // Extract strings from object format { domain: "" }
      const normalizedDomains = domainList.map((item) =>
        typeof item === "string" ? item : item?.domain
      );

      // Merge all and remove duplicates
      finalDomains = [...new Set([...finalDomains, ...normalizedDomains])];
    }

    setDomains(finalDomains);
  }, [agentDetails]);



  const showErrorPopup = (msg) => {
    setPopupMessage(msg);
    setPopupType("failed");
    setShowPopup(true);
  };
  const openModal = () => {
    setNewDomain("");
    setIsVerified(false);
    setValidatingDomain(false);
    setIsModalOpen(true);

  };

  const closeModal = () => setIsModalOpen(false);

  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      showErrorPopup("Please enter a domain.");
      return;
    }

    setValidatingDomain(true);
    try {
      const response = await validateWebsite(newDomain.trim());
      if (response.valid) {
        const updatedDomains = [...new Set([...domains, newDomain.trim()])];

        setDomains(updatedDomains); // update state

        for (const domain of updatedDomains) {
          await updateAgentWidgetDomain(agentId, domain);
        }

        setNewDomain("");
        closeModal();
        setScriptGenerated(false);
        setHasFetched(false);
      } else {
        showErrorPopup("Please check your domain. It appears to be invalid.");
      }
    } catch (err) {
      showErrorPopup("Domain validation failed. Try again later.");
    } finally {
      setValidatingDomain(false);
    }
  };



  const handleGenerate = async () => {
    setLoading(true);
    try {
      setGenerateMode(true);
      setScriptGenerated(true);
    } catch (error) {
      console.error("Error in handleGenerate:", error);
      showErrorPopup("Failed to generate script. Try again later.");
    } finally {
      setLoading(false);
    }
  };


  const handleSendScript = async () => {
    const rawEmails = emailInput
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    const validEmails = rawEmails.filter(validateEmail);
    const invalidEmails = rawEmails.filter((e) => !validateEmail(e));

    if (invalidEmails.length > 0) {
      setEmailError(`Invalid email(s): ${invalidEmails.join(", ")}`);
      return;
    }

    const allEmails = [...emails, ...validEmails.filter(e => !emails.includes(e))];
    if (allEmails.length === 0) {
      setEmailError("Please enter at least one valid email.");
      return;
    }

    try {
      setSending(true);
      const res = await fetch(`${API_BASE_URL}/agent/sendScriptToEmail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: allEmails,
          script,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPopupType("success");
        setPopupMessage("Script sent successfully!");
        setShowPopup(true);
        setEmails([]);
        setEmailInput("");
        localStorage.removeItem("widgetSetupData");
      } else {
        throw new Error(data?.message || "Something went wrong");
      }
    } catch (err) {
      setPopupType("failed");
      setPopupMessage("Failed to send script.");
      setShowPopup(true);
    } finally {
      setSending(false);
    }
  };


  const removeDomain = async (index) => {
    const domainToDelete = domains[index];

    try {
      await deleteDomain(agentId, domainToDelete); // Backend API call

      // Update React state
      const newDomains = domains.filter((_, i) => i !== index);
      setDomains(newDomains);
      setScriptGenerated(false);
      setHasFetched(false)
      // Update localStorage
      const savedData = localStorage.getItem("widgetSetupData");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        const filteredLocalDomains = (parsed.domains || []).filter(
          (d) => d !== domainToDelete
        );
        const updatedData = {
          ...parsed,
          domains: filteredLocalDomains,
        };
        localStorage.setItem("widgetSetupData", JSON.stringify(updatedData));
      }
    } catch (error) {
      console.error("Failed to delete domain:", error);
      showErrorPopup("Failed to delete domain. Try again later.");
    }
  };



  const copyScript = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(script)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000); // hide after 2 seconds
        })
        .catch(() => fallbackCopyTextToClipboard(script));
    } else {
      fallbackCopyTextToClipboard(script);
    }
  };

  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.opacity = 0;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("Failed to copy script. Please copy manually.");
    }

    document.body.removeChild(textArea);
  }

  function normalizeUrl(inputUrl) {
    // Remove all leading http:// or https://
    const cleanedUrl = inputUrl.replace(/^(https?:\/\/)+/i, '');

    // Add a single https:// at the beginning
    return `https://${cleanedUrl}`;
  }

  useEffect(() => {
    const persistData = {
      domains,
      emails,
      scriptGenerated,
      generateMode,
    };
    localStorage.setItem("widgetSetupData", JSON.stringify(persistData));
  }, [domains, emails, scriptGenerated, generateMode]);
  return (
    <div className={styles.Mianintegrate}>
      <HeaderBar title="Integrate Agent" />
      <div className={styles.container}>
        <h2>Add Your Website Domain</h2>
        <p>
          Enter the domain where you want to integrate the AI widget. This
          ensures the widget functions correctly on your site.
        </p>
        <br />
        <div className={styles.addDomain} onClick={openModal}>
          <svg
            width="35"
            height="35"
            viewBox="0 0 35 35"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="35" height="35" rx="17.5" fill="#5F33E1" />
            <path
              d="M17.5003 9.47852C18.054 9.47852 18.5029 9.9274 18.5029 10.4811V16.4967H24.5186C25.0723 16.4967 25.5212 16.9456 25.5212 17.4993C25.5212 18.0531 25.0723 18.502 24.5186 18.502H18.5029V24.5176C18.5029 25.0713 18.054 25.5202 17.5003 25.5202C16.9466 25.5202 16.4977 25.0713 16.4977 24.5176V18.502H10.4821C9.92837 18.502 9.47949 18.0531 9.47949 17.4993C9.47949 16.9456 9.92837 16.4967 10.4821 16.4967H16.4977V10.4811C16.4977 9.9274 16.9466 9.47852 17.5003 9.47852Z"
              fill="white"
            />
          </svg>

          <span className={styles.plus}>Add Another Domain</span>
        </div>


        {domains.map((domain, index) => (
          <div className={styles.domainEntry} key={index}>
            <span className={styles.domainSpan}>{domain}</span>
            <button
              onClick={() => removeDomain(index)}
              className={styles.removeBtn}
            >
              <svg
                width="33"
                height="33"
                viewBox="0 0 33 33"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="16.5"
                  y="0.236328"
                  width="23"
                  height="23"
                  rx="11.5"
                  transform="rotate(45 16.5 0.236328)"
                  fill="black"
                />
                <path
                  d="M20.227 12.772C20.4843 13.0293 20.4843 13.4464 20.227 13.7037L17.4318 16.499L20.227 19.2943C20.4843 19.5516 20.4843 19.9687 20.227 20.226C19.9697 20.4833 19.5526 20.4833 19.2953 20.226L16.5 17.4308L13.7047 20.226C13.4474 20.4833 13.0303 20.4833 12.773 20.226C12.5157 19.9687 12.5157 19.5516 12.773 19.2943L15.5682 16.499L12.773 13.7037C12.5157 13.4464 12.5157 13.0293 12.773 12.772C13.0303 12.5147 13.4474 12.5147 13.7047 12.772L16.5 15.5672L19.2953 12.772C19.5526 12.5147 19.9697 12.5147 20.227 12.772Z"
                  fill="white"
                />
              </svg>
            </button>
          </div>
        ))}

        {generateMode && domains.length > 0 && scriptGenerated && (
          <>
            <div className={styles.scriptBox}>
              <label>Widget Script you can add to your website</label>
              <div className={styles.scriptContainer}>
                <p className={styles.scriptText}>{script}</p>
                <button className={styles.copyBtn} onClick={copyScript}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* <div className={styles.emailSection}>
              <label>Send Script to Developer</label>
              <input
                type="text"
                placeholder="Add email addresses separated by commas"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
                  onBlur={handleAddEmails}
                className={styles.emailInput}
              />
              {emailError && <p style={{ color: "red" }}>{emailError}</p>}
            </div>

            <ul>
              {emails.map((email, index) => (
                <li key={index}>
                  {email}
                  <button
                    onClick={() => handleDeleteEmail(index)}
                    className={styles.removeBtn}
                    style={{ marginLeft: "10px" }}
                  >
                    X
                  </button>
                </li>
              ))}
            </ul> */}
            <div className={styles.emailInputWrapper} onClick={() => inputRef.current?.focus()}>
              {emails.map((email, index) => (
                <span className={styles.emailChip} key={index}>
                  {email}
                  <button onClick={() => handleDeleteEmail(index)}>×</button>
                </span>
              ))}

              <input
                ref={inputRef}
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleAddEmails}
                className={styles.emailInputField}
                placeholder="Add email and press Enter. You can add multiple emails."
              />

            </div>
            <br />
            {emailError && (
              <span className={styles.errorChip}>{emailError}</span>
            )}

            <AnimatedButton
              onClick={handleSendScript}
              disabled={sending}
              isLoading={loading}
              label="Send Emails"
              position={{ position: "relative", marginTop: "40px" }}
            />
          </>
        )}
        {(!generateMode || domains.length === 0 || !scriptGenerated) && (
          <AnimatedButton
            onClick={handleGenerate}
            disabled={loading || domains.length === 0}
            isLoading={loading}
            label="Generate Code"
            position={{ position: "relative", marginTop: "40px" }}
          />
        )}

        <a
          href="/widget-guide"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.helpLink}
        >
          Need Help integrate the AI widget?
        </a>

      </div>

      <Modal2
        className={styles.ModalControl}
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <h3 className={styles.Modalheading}>Add Your Domain</h3>
        <p className={styles.ModalPara}>
          Want the widget on another domain? Enter a different address here.
        </p>

        <div className={styles.LinkDiv}>
          <div>


            <input
              type="text"
              placeholder="https://example.com"
              value={newDomain}
              onChange={(e) => {
                let val = normalizeUrl(e.target.value.toLowerCase().replace(/\s/g, ""));
                if (!val.startsWith("https://")) {
                  val = "https://"
                }
                setNewDomain(val);
                setIsVerified(false);
                setValidatingDomain(true);
                setIsDomainFormatValid(isValidDomainFormat(val));

                if (validateTimer) clearTimeout(validateTimer);

                const timer = setTimeout(async () => {
                  try {
                    const res = await validateWebsite(val);
                    if (res.valid) {
                      setIsVerified(true);
                    } else {
                      setIsVerified(false);
                    }
                  } catch {
                    setIsVerified(false);
                  } finally {
                    setValidatingDomain(false);
                  }
                }, 600);

                setValidateTimer(timer);
              }}
              className={styles.modalInput}
              style={{
                paddingRight: "30px",
                borderColor:
                  newDomain && !isVerified && !validatingDomain ? "red" : undefined,
              }}
            />

            {validatingDomain && (
              <p
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "60%",
                  transform: "translateY(-50%)",
                  fontSize: "16px",
                }}
              >
                ⏳
              </p>
            )}

            {isVerified && !validatingDomain && (
              <span className={styles.tickIcon}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 12.5L10 16.5L18 8.5"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>



            )}
          </div>
        </div>

        {!isVerified && newDomain && !validatingDomain && (
          <p style={{ color: "red", fontSize: "13px", marginTop: "5px" }}>
            Please enter a valid and live domain (e.g., https://example.com)
          </p>
        )}


        <AnimatedButton
          onClick={handleAddDomain}
          disabled={!isVerified || validatingDomain}
          isLoading={validatingDomain}
          label="Add Domain"
          position={{ position: 'relative', marginTop: "15px", }}
        />

      </Modal2>



      {showPopup && (
        <PopUp
          type={popupType}
          message={popupMessage}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

export default IntegrateAgent;

