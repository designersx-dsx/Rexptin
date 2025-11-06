import React from "react";
import styles from "./AttachmentPreviewModal.module.css";
const AttachmentPreviewModal = ({ isOpen, onClose, attachments }) => {
  if (!isOpen) return null;

  // Server base URL for fetching attachments
  const SERVER_BASE_URL_Temp= process.env.REACT_APP_API_BASE_URL ;
  const SERVER_BASE_URL =SERVER_BASE_URL_Temp.split('/api')[0];
    console.log('SERVER_BASE_URL',SERVER_BASE_URL)
  // Log raw attachments for debugging
  console.log("Raw attachments in modal:", attachments);

  // Parse attachments to ensure it's an array
  const parsedAttachments = (() => {
    if (!attachments) return []; // Handle null or undefined
    if (typeof attachments === "string") {
      try {
        const parsed = JSON.parse(attachments);
        return Array.isArray(parsed) ? parsed : [parsed]; // Wrap object in array
      } catch (e) {
        console.error("Failed to parse attachments:", e);
        return attachments.trim() ? [{ url: attachments, filename: "attachment" }] : []; // Treat string as single URL
      }
    }
    if (Array.isArray(attachments)) return attachments; // Handle array
    if (typeof attachments === "object") return [attachments]; // Handle object
    console.warn("Unexpected attachments type:", typeof attachments);
    return []; // Handle unexpected types
  })();

  // Add server base URL to attachment URLs
  const formattedAttachments = parsedAttachments.map((attachment) => {
    const url = typeof attachment === "string" ? attachment : attachment.url;
    const filename = attachment.filename || "attachment";
    return {
      ...attachment,
      url: url.startsWith("http") ? url : `${SERVER_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`,
      filename,
    };
  });

  console.log("Formatted attachments:", formattedAttachments);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>View Attachments</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            X
          </button>
        </div>
        <div className={styles.modalBody}>
          {Array.isArray(formattedAttachments) && formattedAttachments.length > 0 ? (
            <div className={styles.attachmentList}>
              {formattedAttachments.map((file, idx) => {
                const fileUrl = file.url;
                const isImage = file.type?.startsWith("image/");
                const isPDF = file.type?.includes("pdf");
                const isText = file.type?.startsWith("text/");

                // console.log(`File ${idx + 1}:`, { fileUrl, isImage, isPDF, isText });

                return (
                  <div key={idx} className={styles.attachmentItem}>
                    {isImage && (
                      <img
                        src={fileUrl}
                        alt={file.filename}
                        className={styles.imagePreview}
                        onError={(e) => {
                          console.error("Image failed to load:", fileUrl);
                          e.target.style.display = "none"; // Hide broken images
                        }}
                      />
                    )}
                    {isPDF && (
                      <iframe
                        src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        title={file.filename}
                        className={styles.pdfPreview}
                      />
                    )}
                    {isText && (
                      <div className={styles.textPreview}>
                        <iframe
                          src={fileUrl}
                          title={file.filename}
                          className={styles.textIframe}
                        />
                      </div>
                    )}
                    {!isImage && !isPDF && !isText && (
                      <div className={styles.fallbackPreview}>
                        <p>{file.filename}</p>
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.viewLink}
                        >
                          Download File
                        </a>
                      </div>
                    )}
                    <p className={styles.attachmentName}>{file.filename}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.noAttachments}>No attachments available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttachmentPreviewModal;
