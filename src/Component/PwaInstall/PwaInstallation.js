import React, { useEffect, useState } from "react";

const PwaInstallation = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

useEffect(() => {
  const handleBeforeInstallPrompt = (e) => {
    const alreadyShown = localStorage.getItem("installPromptShown");
    if (alreadyShown) return;  // only block if already shown

    e.preventDefault();
    console.log("📱 beforeinstallprompt fired");
    setDeferredPrompt(e);
    setShowPopup(true);  // show your popup
  };

  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

  return () => {
    window.removeEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );
  };
}, []);

const handleInstall = async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === "accepted") {
    console.log("✅ User accepted install");
  } else {
    console.log("❌ User dismissed install");
  }

  // mark as shown no matter what
  localStorage.setItem("installPromptShown", "true"); 
  setDeferredPrompt(null);
  setShowPopup(false);
};


  const handleClose = () => {
    localStorage.setItem("installPromptShown", "true"); // save flag
    setShowPopup(false);
  };
//   if (!showBanner) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        background: "linear-gradient(90deg, #6524EB, #8139FF)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        zIndex: 9999,
        fontFamily: "Inter, sans-serif",
        flexWrap: "wrap",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
      }}
    >
      {/* Left Section: Text */}
      <div style={{ fontSize: "15px", fontWeight: "500" }}>
         Add <strong>Rexpt</strong> to your Home Screen for a better experience!
      </div>

      {/* Right Section: Buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginTop: "6px",
        }}
      >
        <button
          onClick={handleInstall}
          style={{
            background: "white",
            color: "#6524EB",
            border: "none",
            borderRadius: "6px",
            padding: "6px 14px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Install
        </button>

        <button
          onClick={handleClose}
          style={{
            background: "transparent",
            color: "white",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
            lineHeight: "1",
          }}
          aria-label="Close banner"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default PwaInstallation;
