import React from "react";

import styles from "../Delete/Delete.module.css";
import { useNavigate } from "react-router-dom";
import { deleteUser } from "../../Store/apiStore";
import decodeToken from "../../lib/decodeToken";
import { useState } from "react";
import Loader from "../Loader/Loader";
import PopUp from "../Popup/Popup";
import AnimatedButton from "../AnimatedButton/AnimatedButton";

const Delete = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decodeTokenData = decodeToken(token);
  const userId = decodeTokenData?.id;
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteUser(userId);

      setPopupType("success");
      setPopupMessage("Your account has been deleted successfully.");
      setShowPopup(true);

      setTimeout(() => {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Failed to delete user:", error);
      setPopupType("failed");
      setPopupMessage("Failed to delete account. Please try again.");
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.Logo}>
          <img src="/svg/Rexpt-Logo.svg" alt="Rexpt-Logo" />
        </div>
        <div>
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="50" fill="#6524EB" />
            <path
              d="M70.1572 33.6734H62.1708V30.6508C62.1708 26.9751 59.1486 24 55.4146 24H45.5854C41.8514 24 38.8292 26.9751 38.8292 30.6508V33.6734H30.8428C29.8362 33.6734 29 34.4966 29 35.4875C29 36.4784 29.8362 37.3016 30.8428 37.3016H70.1572C71.1638 37.3016 72 36.4784 72 35.4875C72 34.4966 71.1638 33.6734 70.1572 33.6734ZM42.5148 30.6508C42.5148 28.9818 43.89 27.6281 45.5854 27.6281H55.4146C57.11 27.6281 58.4852 28.9818 58.4852 30.6508V33.6734H42.5148V30.6508ZM31.4579 69.3492C31.4579 73.0249 34.4801 76 38.2141 76H62.7859C66.5199 76 69.5421 73.0249 69.5421 69.3492V40.9297H31.4579V69.3492ZM53.5718 48.7914C53.5718 47.8005 54.408 46.9773 55.4146 46.9773C56.4212 46.9773 57.2574 47.8005 57.2574 48.7914V68.1406C57.2574 69.1315 56.4212 69.9547 55.4146 69.9547C54.408 69.9547 53.5718 69.1315 53.5718 68.1406V48.7914ZM43.7449 48.7914C43.7449 47.8005 44.5811 46.9773 45.5878 46.9773C46.5944 46.9773 47.4306 47.8005 47.4306 48.7914V68.1406C47.4306 69.1315 46.5944 69.9547 45.5878 69.9547C44.5811 69.9547 43.7449 69.1315 43.7449 68.1406V48.7914Z"
              fill="white"
            />
          </svg>
        </div>
        <div className={styles.ThankyouMsg}>
          <div className={styles.title}>Delete</div>
          <div className={styles.subtitle}>your Profile?</div>
          <p className={styles.description}>
            Deleting your profile will permanently remove all your data
            including agents, business information, and usage history.
          </p>
        </div>
        <div className={styles.infoBox}>
          <div className={styles.buttonGroup}>
            <div
              className={styles.button}
              onClick={() => setShowConfirmModal(true)}
            >
              {loading ? (
                <Loader size={18} />
              ) : (
                <img src="/svg/delete-btn2.svg" alt="delete-btn" />
              )}
              {/* <AnimatedButton
                label="Delete"
                onClick={() => setShowConfirmModal(true)}
                disabled={loading}
              ></AnimatedButton> */}
            </div>
            <div
              className={`${styles.button} ${styles.cancelBtn}`}
              onClick={() => navigate(-1)}
            >
              Cancel
            </div>
          </div>

          {/* Your Info Content */}
          <p>This action is irreversible and no refunds will be provided.</p>
        </div>
      </div>
      {showConfirmModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <p>
              <strong>
               Are you sure you want to delete your account?
              </strong>
            </p>
            <div className={styles.modalButtons}>
              <button
                className={styles.deleteConfirmButton}
                onClick={() => {
                  setShowConfirmModal(false);
                  handleDelete();
                }}
              >
                {loading ? <Loader size={18} /> : "Yes, Delete"}
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

export default Delete;
