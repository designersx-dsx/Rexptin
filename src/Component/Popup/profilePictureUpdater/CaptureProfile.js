import React, { useEffect, useRef, useState } from "react";
import styles from "./CaptureProfile.module.css";

function CaptureProfile({ onClose, onCapture }) {
  const videoRef = useRef(null); 
  const [error, setError] = useState(""); 

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError(`Error accessing camera: ${err.message}`);
    }
  };

  // Stop the camera (stop all tracks)
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => {
        track.stop();  // Stop each track (video/audio)
      });
      videoRef.current.srcObject = null;  // Clear the srcObject
    }
  };

  // Capture the image and send it to parent
  const captureImage = () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (videoRef.current) {
      const video = videoRef.current;
      const { videoWidth, videoHeight } = video;
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      context.drawImage(video, 0, 0, videoWidth, videoHeight);
      const img = canvas.toDataURL("image/png");

      // Sending image to the parent component
      onCapture(img);

      // Stop the camera after capturing the image
      stopCamera();
    }
  };

  // Handle modal close (stop camera)
  const handleClose = () => {
    stopCamera();  // Stop the camera when modal is closed
    onClose(); // Call the onClose prop to close the modal
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <h2>Capture Profile Picture</h2>
        <div className={styles.cameraContainer}>
          <video ref={videoRef} autoPlay width="100%" height="auto" />
          <div className={styles.cameraControls}>
            <button className={styles.captureButton} onClick={captureImage}>
              Capture
            </button>
            <button className={styles.cancelButton} onClick={handleClose}>
              Cancel
            </button>
            <button className={styles.stopButton} onClick={stopCamera}>
              Stop Camera
            </button>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

export default CaptureProfile;

