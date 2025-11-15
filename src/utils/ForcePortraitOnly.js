import React, { useEffect, useState } from "react";

const MOBILE_MAX_WIDTH = 1024; // px – adjust if your breakpoint is different

const ForcePortraitOnly = () => {
  const [isLandscape, setIsLandscape] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  const updateState = () => {
    if (typeof window === "undefined") return;

    // Detect mobile by viewport width (you can tweak this)
    const mobileByWidth = window.innerWidth <= MOBILE_MAX_WIDTH;

    // Detect orientation
    const landscapeByMedia =
      window.matchMedia &&
      window.matchMedia("(orientation: landscape)").matches;

    const landscapeBySize = window.innerWidth > window.innerHeight;

    setIsMobile(mobileByWidth);
    setIsLandscape(landscapeByMedia || landscapeBySize);
  };

  useEffect(() => {
    // Initial check
    updateState();

    // Update on resize / orientation change
    window.addEventListener("resize", updateState);
    window.addEventListener("orientationchange", updateState);

    return () => {
      window.removeEventListener("resize", updateState);
      window.removeEventListener("orientationchange", updateState);
    };
  }, []);

  // ✅ Only block when it's a *mobile* viewport AND in landscape
  if (!isMobile || !isLandscape) return null;

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
        {/* simple icon */}
        <path d="M8 16c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      </svg>
      Please rotate your device to portrait mode to continue.
      <br />
      <small>
        Turn off your phone’s rotation lock if this screen stays stuck.
      </small>
    </div>
  );
};

export default ForcePortraitOnly;
