import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import styles from "./UploadProfile.module.css";
import { API_BASE_URL, updateProfilePicture } from "../../../Store/apiStore";
import decodeToken from "../../../lib/decodeToken";
import useUser from "../../../Store/Context/UserContext";
import imageCompression from "browser-image-compression";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../../utils/cropImageHelper";

const compressImage = async (imageFile) => {
  const options = {
    maxSizeMB: 0.1,          
    maxWidthOrHeight: 800,    
    useWebWorker: true,
  };
  try {
    const compressedFile = await imageCompression(imageFile, options);
    return compressedFile;
  } catch (error) {
    console.error("Compression error:", error);
    return imageFile;
  }
};

const UploadProfile = ({ onClose, onUpload }) => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const webcamRef = useRef(null);
  const token = localStorage.getItem("token") || "";
  const decodeTokenData = decodeToken(token);
  const [userId] = useState(decodeTokenData?.id || "");
  const [profile, setProfile] = useState(null);
  const { user, setUser } = useUser();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  // Helper to stop webcam stream
  const stopWebcamStream = () => {
    const stream = webcamRef.current?.video?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    event.stopPropagation();
    const file = event.target.files[0];
    if (file) {
      const compressed = await compressImage(file);
      setProfile(compressed);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        setCapturedImage(null);
        stopWebcamStream();
        setIsCropping(true); 
        setIsWebcamOpen(false);
      };
      reader.readAsDataURL(compressed);
    }
  };

  // Capture image from webcam
  const captureImage = async (e) => {
    e.stopPropagation();
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setUploadedImage(null);
      setIsCropping(true); 


      // Convert to Blob
      const byteString = atob(imageSrc.split(",")[1]);
      const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const file = new File([blob], "webcam.jpg", { type: mimeString });

      const compressed = await compressImage(file);

      setProfile(compressed);

      stopWebcamStream();
      setIsWebcamOpen(false);
    }
  };

  // Toggle webcam
  const toggleWebcam = (e) => {
    e.stopPropagation();
    if (isWebcamOpen) stopWebcamStream();
    setIsWebcamOpen(!isWebcamOpen);
    setUploadedImage(null);
    setCapturedImage(null);
    setCameraError(null);
  };

  // Save image to server
  const saveImageToServer = async (e) => {
    if (!profile) return;
    const formData = new FormData();
    formData.append("profilePicture", profile);

    try {
      const response = await updateProfilePicture(userId, formData);
      const newProfilePicture = `${API_BASE_URL?.split("/api")[0]}${response?.profilePicture?.split("/public")[1]
        }`;
      setUser({ ...user, profile: newProfilePicture });
      onUpload(capturedImage || uploadedImage);
      onClose();
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };

  const handleSave = (e) => {
    if (uploadedImage || capturedImage) {
      saveImageToServer();
      stopWebcamStream();
    }
    stopWebcamStream();
  };

  // Handle camera permission errors
  useEffect(() => {
    if (isWebcamOpen) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => setCameraError(null))
        .catch((err) => {
          setCameraError("Camera access denied or unavailable.");
          console.error("Camera error:", err);
        });
    }
  }, [isWebcamOpen]);

  return (
    <div className={styles.modalBackdrop} >
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Update Profile Picture</h2>

        {/* Error */}
        {cameraError && <div className={styles.errorMessage}>{cameraError}</div>}
        {/* Webcam or Upload */}
        <div className={styles.optionsContainer}>
          {isWebcamOpen ? (
            <div className={styles.webcamContainer}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className={styles.webcam}
                videoConstraints={{ facingMode: "user" }}
                onUserMediaError={(err) =>
                  setCameraError("Failed to access camera: " + err.message)
                }
              />
              <div className={styles.webcamButtons}>
                <button onClick={captureImage} className={styles.captureButton}>
                  Capture
                </button>
                <button onClick={toggleWebcam} className={styles.closeWebcamButton}>
                  Close Camera
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.uploadContainer}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className={styles.fileInput}
              />
              {!uploadedImage && !capturedImage && (
                <button onClick={toggleWebcam} className={styles.webcamButton}>
                  Capture with Camera
                </button>
              )}
            </div>
          )}
        </div>

        {/* Re-upload or Re-capture */}
        {(capturedImage) && !isWebcamOpen && (
          <div className={styles.retryButtonContainer}>
            <button onClick={toggleWebcam} className={styles.webcamButton}>
              {uploadedImage ? "Re-upload" : "Re-capture"}
            </button>
          </div>
        )}

        {/* Save and Close */}
        <div className={styles.buttons}>

          <button
            onClick={() => {
              stopWebcamStream(); // stop stream on close
              onClose();
            }}
            className={styles.closeButton}
          >
            Close
          </button>

          {isCropping && (uploadedImage || capturedImage) && (
            <div className={styles.cropperOverlay}>
              <div className={styles.cropContainer}>
                <Cropper
                  image={uploadedImage || capturedImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                />
              </div>

              <div className={styles.cropButtons}>
                <button
                  className={styles.cancelCropButton}
                  onClick={() => setIsCropping(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.applyCropButton}
                  onClick={async () => {
                    const imageSrc = uploadedImage || capturedImage;
                    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
                    const croppedFile = new File([croppedBlob], "cropped.jpg", {
                      type: "image/jpeg",
                    });
                    const compressed = await compressImage(croppedFile);
                    setProfile(compressed);
                    setUploadedImage(URL.createObjectURL(croppedBlob));
                    setIsCropping(false);
                  }}
                >
                  Apply Crop
                </button>
              </div>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={!uploadedImage && !capturedImage}
            className={
              uploadedImage || capturedImage
                ? styles.saveButton
                : styles.disabledButton
            }
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadProfile;
