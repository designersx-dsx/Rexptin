import React, { useEffect, useState } from "react";

const ForcePortraitOnly = () => {
  const [isLandscape, setIsLandscape] = useState(false);

  const checkOrientation = () => {
    // Prefer matchMedia, fallback to width/height
    const landscapeByMedia =
      window.matchMedia &&
      window.matchMedia("(orientation: landscape)").matches;

    const landscapeBySize = window.innerWidth > window.innerHeight;

    setIsLandscape(landscapeByMedia || landscapeBySize);
  };

  useEffect(() => {
    // Initial check
    checkOrientation();

    // Update on resize / orientation change
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  if (!isLandscape) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#000",
        color: "#fff",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "18px",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <svg
        width="50"
        height="50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        style={{ marginBottom: "10px" }}
      >
        {/* <path d="M4 12h16M12 4v16" /> */}
        <path d="M8 16c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      </svg>
      Please rotate your device to portrait mode to continue.
      <br />
      <small>Turn off your phone’s rotation lock if this screen stays stuck.</small>
    </div>
  );
};

export default ForcePortraitOnly;
