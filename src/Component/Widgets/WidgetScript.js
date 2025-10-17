import React, { useState, useEffect } from "react";
import styles from "./Widgets.module.css";
import { API_BASE_URL, updateAgentWidgetDomain, validateWebsite } from "../../Store/apiStore";
import PopUp from "../Popup/Popup";
import Loader from "../Loader/Loader";
const WidgetScript = ({ isAgentDetails, refreshFuntion, alertPopUp }) => {
  const url = isAgentDetails?.business?.webUrl || ""
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [existingDomain, setExistingDomain] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generateMode, setGenerateMode] = useState(false);
  // Each domain input keeps value, isVerified, loading, error, debounceTimer
  const [domainInputs, setDomainInputs] = useState([
    { value: url, isVerified: false, loading: false, error: "", debounceTimer: null },
  ]);
  const agentId = isAgentDetails.agent_id;
  const scriptText = `<script id="rex-widget-script" src="https://rexptin.vercel.app/widget.js?agentId=${agentId}"></script>`;
  // Load existing domains on mount or update
  useEffect(() => {
    if (typeof isAgentDetails.agentWidgetDomain === "string") {
      try {
        const parsed = JSON.parse(isAgentDetails.agentWidgetDomain);
        setExistingDomain(Array.isArray(parsed) ? parsed : []);
      } catch {
        setExistingDomain([]);
      }
    } else if (Array.isArray(isAgentDetails.agentWidgetDomain)) {
      setExistingDomain(isAgentDetails.agentWidgetDomain);
    }
  }, [isAgentDetails]);

  // Update single domain input by index
  const updateDomainInput = (index, newProps) => {
    setDomainInputs((prev) => {
      const newInputs = [...prev];
      newInputs[index] = { ...newInputs[index], ...newProps };
      return newInputs;
    });
  };

  // Handle input changes and trigger validation debounce (no API add here)
  const handleDomainChange = (index, value) => {
    updateDomainInput(index, { value, isVerified: false, error: "", loading: true });
  };

  // Add new empty domain input
  const handleAddDomainInput = () => {
    setDomainInputs((prev) => [...prev, { value: "", isVerified: false, loading: false, error: "", debounceTimer: null }]);
  };

  // Remove domain input by index and clear debounce timer if any
  const handleRemoveDomainInput = (index) => {
    setDomainInputs((prev) => {
      const newInputs = [...prev];
      if (newInputs[index].debounceTimer) clearTimeout(newInputs[index].debounceTimer);
      newInputs.splice(index, 1);
      return newInputs;
    });
  };

  // Validate domains only - debounce + validate URL, mark verified or error
  useEffect(() => {
    domainInputs.forEach((input, index) => {
      if (input.debounceTimer) clearTimeout(input.debounceTimer);

      if (!input.value.trim()) {
        updateDomainInput(index, { isVerified: false, error: "", loading: false, debounceTimer: null });
        return;
      }

      updateDomainInput(index, { loading: true });

      const timer = setTimeout(async () => {
        try {
          const res = await validateWebsite(input.value.trim());
          if (res.valid) {
            updateDomainInput(index, { isVerified: true, error: "", loading: false, debounceTimer: null });
          } else {
            updateDomainInput(index, { isVerified: false, error: "Invalid URL", loading: false, debounceTimer: null });
          }
        } catch {
          updateDomainInput(index, { isVerified: false, error: "Validation failed", loading: false, debounceTimer: null });
        }
      }, 600);

      updateDomainInput(index, { debounceTimer: timer });
    });

    return () => {
      domainInputs.forEach((input) => {
        if (input.debounceTimer) clearTimeout(input.debounceTimer);
      });
    };
  }, [domainInputs.map((input) => input.value).join()]);

  // On clicking Generate Code, add all verified domains via API, update existingDomain and show code
  const handleGenerateCode = async () => {
    setLoading(true);
    try {
      // Filter all verified, non-empty domains
      const verifiedDomains = domainInputs
        .filter((input) => input.isVerified && input.value.trim() !== "")
        .map((input) => input.value.trim());
      // Filter out already existing domains
      const domainsToAdd = verifiedDomains.filter(
        (d) => !existingDomain.find((ex) => ex.domain === d)
      );
      for (const domain of domainsToAdd) {
        console.log("HELLO")
        await updateAgentWidgetDomain(agentId, domain);
      }
      setExistingDomain((prev) => {
        const combined = [...prev];
        domainsToAdd.forEach((d) => {
          if (!combined.find((ex) => ex.domain === d)) combined.push({ domain: d });
        });
        return combined;
      });
      setDomainInputs([{ value: "", isVerified: false, loading: false, error: "", debounceTimer: null }]);
      setGenerateMode(true);
      refreshFuntion();
    } catch (err) {
      alertPopUp("true", "Failed to add domains!", "fail");
    } finally {
      setLoading(false);
    }
  };

  // Email handling code (unchanged)
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleAddEmails = () => {
    const rawEmails = emailInput.split(",").map((e) => e.trim()).filter(Boolean);
    const validEmails = rawEmails.filter(validateEmail);
    const invalidEmails = rawEmails.filter((e) => !validateEmail(e));

    if (invalidEmails.length > 0) {
      setError(`Invalid email(s): ${invalidEmails.join(", ")}`);
      return;
    }

    setEmails((prev) => [...prev, ...validEmails]);
    setEmailInput("");
    setError("");
  };

  const handleDelete = (index) => {
    setEmails((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSend = async () => {
    if (emails.length === 0) {
      setError("Please add at least one valid email.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/agent/sendScriptToEmail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emails, script: scriptText }),
      });
      await res.json();
      alertPopUp("true", "Script sent successfully!", "success");
      setEmails([]);
      setShowModal(false);
    } catch (err) {
      alertPopUp("true", "Failed to send emails!", "fail");
    } finally {
      setLoading(false);
    }
  };

  // Prefill domain input with last existing domain if inputs empty
  useEffect(() => {
    if (existingDomain.length > 0) {
      const lastDomain = existingDomain[existingDomain.length - 1].domain;
      if (domainInputs.length === 1 && domainInputs[0].value.trim() === "") {
        setDomainInputs([
          { value: lastDomain, isVerified: false, loading: true, error: "", debounceTimer: null },
        ]);
      }
    }
  }, [existingDomain]);
  console.log('domainInputs', domainInputs)

  // Render domain inputs
  const renderDomainInputs = () => (
    <div className={styles.container}>
      <h3>Enter your Website URL(s)</h3>
      <p className={styles.noteText}>Note: The widget will only work on the domains you add.</p>

      <div className={styles.forScroll}>
        {domainInputs.map((input, index) => (
          <div key={index} className={styles.domainInputRow}>
            <div className={styles.InputMain}>
              <input
                type="URL"
                placeholder="e.g., https://example.com"
                value={input.value}
                // onChange={(e) => handleDomainChange(index, e.target.value)}
                onKeyDown={(e) => {
                  const prefix = "https://";
                  if (
                    input.value.length <= prefix.length &&
                    (e.key === "Backspace" || e.key === "Delete" || e.key === "ArrowLeft")
                  ) {
                    e.preventDefault(); // block backspace inside https://
                  }
                }}
                onChange={(e) => {
                  let val = e.target.value.toLowerCase().replace(/\s/g, ""); // lowercase & no spaces
                  if (!val.startsWith("https://")) {
                    val = "https://" + val.replace(/^https?:\/\//, ""); // ensure https://
                  }
                  handleDomainChange(index, val);
                }}

                className={styles.inputField}
                disabled={loading}
              />
              {input.loading ? (
                <p className={styles.loader}><Loader size={16} /></p>
              ) : input.isVerified ? (
                <p className={styles.verified} title="Verified"> <input type="checkbox" name="" value="" checked /></p>
              ) : input.value ? (
                <p className={styles.notVerified} title="Not Verified">X</p>
              ) : null}
            </div>


            {domainInputs.length > 1 && (
              <button
                onClick={() => handleRemoveDomainInput(index)}
                className={styles.removeBtn}
                title="Remove this domain input"
                disabled={loading}
              >
                X
              </button>
            )}

            {input.error && <p style={{ color: "red", marginTop: 4 }}>{input.error}</p>}
          </div>
        ))}
      </div>


      <div className={styles.BottomBtnAddGen}>

        {domainInputs[0].value !== '' &&
          <button
            className={styles.addNewInputBtn}
            onClick={handleAddDomainInput}
            disabled={loading}
          >
            Add more +
          </button>
        }

        {(existingDomain.length > 0 || domainInputs.some(input => input.isVerified)) && (
          <button
            className={styles.generateCodeBtn}
            onClick={handleGenerateCode}
            disabled={loading}
          >
            {loading ? "Processing..." : "Generate Code"}
          </button>
        )}
      </div>
      <div className={styles.guideNote}>
        <p className={styles.noteText}> Need help Integrating the AI Receptionist Widget?{" "}
          <a
            href="/widget-guide"
            target="_blank"
            rel="noopener noreferrer"
          >
            click here</a>
        </p>
      </div>

    </div>
  );

  return (
    <div className={styles.container}>
      {!generateMode && renderDomainInputs()}

      {generateMode && !showModal && (
        <>
          <button className={styles.backBtn} onClick={() => setGenerateMode(false)}><img src="svg/back-Btn.svg" alt="back-Btn" /></button>
          <h3 className={styles.title}>Widget Script</h3>
          <div className={styles.forScroll}>
            <div className={styles.domainList}>
              <strong>Allowed Domains:</strong>
              <ul>
                {existingDomain.map((d, i) => (
                  <li key={`d-${i}`}>{d.domain}</li>
                ))}
              </ul>
            </div>

            <div className={styles.scriptBox}>
              <button
                className={styles.copyButton}
                onClick={() => {
                  navigator.clipboard.writeText(scriptText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <br />
              <pre className={styles.scriptText}>{scriptText}</pre>
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button className={styles.emailBtn} onClick={() => setShowModal(true)}>Send to Developer</button>
          </div>
        </>
      )}

      {showModal && (
        <div className={styles.modalContainer}>
          <button className={styles.backBtn} onClick={() => setShowModal(false)}><img src="svg/back-Btn.svg" alt="back-Btn" /></button>
          <h3>Send Script to Developer</h3>
          <div className={styles.modalInfo}>
            <input
              type="text"
              placeholder="Enter your email address"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onBlur={handleAddEmails}
              className={styles.inputField}
              disabled={loading}
            />

          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div className={styles.forScroll}>
            <ul className={styles.listType}>
              {emails.map((e, idx) => (
                <li key={idx}>
                  {e} <button onClick={() => handleDelete(idx)} disabled={loading} className={styles.Cross}><span >X</span></button>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.modalActions}>
            <button onClick={handleSend} disabled={loading} className={styles.sendEmail}>
              {loading ? <div className={styles.loaderDiv}><Loader size={18} />&nbsp;&nbsp; &nbsp;Sending</div> : "Send Emails"}
            </button>

            <button className={styles.adddBtn} onClick={handleAddEmails} disabled={loading}>Add</button>
          </div>
        </div>

      )}

      {showPopup && (
        <PopUp type={popupType} message={popupMessage} onClose={() => setShowPopup(false)} />
      )}
    </div>
  );
};

export default WidgetScript;