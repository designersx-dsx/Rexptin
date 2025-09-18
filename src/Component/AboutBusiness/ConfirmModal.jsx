import React, { useEffect, useRef } from "react";
import styles from "./ConfirmModal.module.css";

const ConfirmModal = ({
  open,
  title = "Continue without a Google Business Profile?",
  message,
  onConfirm,
  onClose,
  confirmText = "Continue",
  cancelText = "Go back",
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    dialogRef.current?.focus();
    return () => prev?.focus();
  }, [open]);

  if (!open) return null;

  const onKeyDown = (e) => {
    if (e.key === "Escape") onClose?.();
  };

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmTitle"
        aria-describedby="confirmMsg"
        onMouseDown={(e) => e.stopPropagation()}
        tabIndex={-1}
        ref={dialogRef}
        onKeyDown={onKeyDown}
      >
        <div className={styles.header}>
          <h3 id="confirmTitle">{title}</h3>
          <button
            className={styles.closeBtn}
            aria-label="Close dialog"
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className={styles.body}>
          <p id="confirmMsg">{message}</p>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
