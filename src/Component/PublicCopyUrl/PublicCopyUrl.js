import React, { useState } from "react";
import styles from "./PublicCopyUrl.module.css";
import { modifyAgentFields } from "../../Store/apiStore";
import { useDashboardStore } from "../../Store/agentZustandStore";
import { Pencil } from "lucide-react"; 
const PublicCopyUrl = ({ agent, isRefresh }) => {
  const { setHasFetched } = useDashboardStore();

  const [ventryUrl, setVentryUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Base URLs
  const defaultPublicUrl = `${process.env.REACT_APP_PUBLIC_WIDGET_DOMAIN}?agent=${agent?.agentCode}`;
  const ventryPublicUrl = agent?.ventryUrl
    ? `${process.env.REACT_APP_PUBLIC_WIDGET_DOMAIN}?${agent?.ventryUrl}`
    : null;

  const finalUrl = ventryPublicUrl || defaultPublicUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddOrUpdateVentryUrl = async () => {
    const trimmedValue = ventryUrl.trim();
    if (!trimmedValue) {
      setMessage({ type: "error", text: "Please enter a valid Ventry URL" });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const agentId = agent?.agent_id;
      const res = await modifyAgentFields(agentId, trimmedValue);

      if (res?.success) {
        setMessage({
          type: "success",
          text: isEditing ? "Ventry URL updated successfully!" : "Ventry URL added successfully!",
        });
        setVentryUrl("");
        setHasFetched(true);
        isRefresh();
        setIsEditing(false);
      } else {
        setMessage({
          type: "error",
          text:
            res?.data?.response?.data?.message ||
            "Failed to update Ventry URL",
        });
      }
    } catch (error) {
      console.error("Error updating Ventry URL:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Public URL</h2>

        {/* URL display + Copy + Edit */}
        <div className={styles.urlBox}>
          <input
            type="text"
            readOnly
            value={finalUrl}
            className={styles.urlInput}
          />
          <button onClick={handleCopy} className={styles.copyBtn}>
            {copied ? "Copied!" : "Copy"}
          </button>

          {/* Show Edit button if ventryUrl exists */}
          {agent?.ventryUrl && !isEditing && (
            
            <button
              onClick={() => {
                setIsEditing(true);
                setVentryUrl(agent?.ventryUrl || "");
              }}
              className={`${styles.iconBtn} ${styles.editBtn}`}
                title="Edit keyboard"

            >
              <Pencil size={20} strokeWidth={2} />


            </button>
          )}
        </div>

        {/* Add/Edit Input section */}
        {(!agent?.ventryUrl || isEditing) && (
          <>
            <div className={styles.inputSection}>
              <label className={styles.label}>
                {isEditing ? "Edit Keyword" : "Add Keyword"}
              </label>
              <input
                type="text"
                value={ventryUrl}
                onChange={(e) => setVentryUrl(e.target.value)}
                placeholder="Enter Keyword"
                className={styles.input}
                maxLength={30}
              />
            </div>

            <div className={styles.actionBtns}>
                <br/>
              <button
                onClick={handleAddOrUpdateVentryUrl}
                className={styles.addBtn}
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : isEditing
                  ? "Update Ventry URL"
                  : "Add Ventry URL"}
              </button>

              {isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setVentryUrl("");
                    setMessage({ type: "", text: "" });
                  }}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              )}
            </div>
          </>
        )}

        {/* Message */}
        {message.text && (
          <p
            className={`${styles.message} ${
              message.type === "success" ? styles.success : styles.error
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
};

export default PublicCopyUrl;
