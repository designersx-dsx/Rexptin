import React, { useState, useRef, useEffect } from "react";
import styles from "../TooltipSteps/Tooltip.module.css";

const Tooltip = ({ content }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState("top");
  const iconRef = useRef(null);
  const tooltipRef = useRef(null);

  const images = ["/svg/informtion-icon.svg", "/svg/informtion-icon 2.svg"];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
  if (!showTooltip) return;

  const calculateContentLength = () => {
    if (typeof content === "string") return content.length;

    if (typeof content === "object" && content?.props?.children) {
      const children = content.props.children;
      if (typeof children === "string") return children.length;
      if (Array.isArray(children)) {
        return children.reduce((acc, child) => {
          if (typeof child === "string") return acc + child.length;
          if (typeof child === "object" && child?.props?.children) {
            if (typeof child.props.children === "string") {
              return acc + child.props.children.length;
            }
          }
          return acc;
        }, 0);
      }
    }

    return 0;
  };

  const handlePositioning = () => {
    const rect = iconRef.current?.getBoundingClientRect();
    const spaceAbove = rect?.top || 0;
    const spaceBelow = window.innerHeight - (rect?.bottom || 0);

    const contentLength = calculateContentLength();

    if (contentLength > 200 || (spaceAbove < 90 && spaceBelow > 90)) {
      setTooltipPosition("bottom");
    } else {
      setTooltipPosition("top");
    }
  };

  handlePositioning(); // run once on open
  window.addEventListener("scroll", handlePositioning, true); // attach scroll listener

  return () => {
    window.removeEventListener("scroll", handlePositioning, true);
  };
}, [showTooltip, content]);


  // Auto-change icon
  useEffect(() => {
    if (showTooltip) return;

    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        setFading(false);
      }, 500);
    }, 1500);

    return () => clearInterval(interval);
  }, [showTooltip]);
  const handleClickOutside = (event) => {
    if (
      tooltipRef.current &&
      !tooltipRef.current.contains(event.target) &&
      !iconRef.current.contains(event.target)
    ) {
      setShowTooltip(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleIconClick = () => {
    setShowTooltip((prev) => !prev);
  };

  return (
    <div className={styles.tooltipWrapper}>
      <div
        className={styles.tooltipIcon}
        onClick={handleIconClick}
        ref={iconRef}
      >
        {showTooltip && (
          <div
            className={`${styles.tooltipBox} ${
              tooltipPosition === "bottom" ? styles.bottom : styles.top
            }`}
            ref={tooltipRef}
          >
            <p className={styles.tooltipTitle}>{content}</p>
            <div
              className={`${styles.bubbleGroup} ${
                tooltipPosition === "bottom"
                  ? styles.bubbleTop
                  : styles.bubbleBottom
              }`}
            >
              <div className={styles.bigBubble}></div>
              <div
                className={`${styles.smallBubble} ${
                  tooltipPosition === "bottom" ? styles.bottomDot : ""
                }`}
              />
            </div>
          </div>
        )}
        <img
          key={currentImageIndex}
          src={images[currentImageIndex]}
          alt="info"
          className={`${styles.fadeImage} ${fading ? styles.fadeOut : ""}`}
        />
      </div>
    </div>
  );
};

export default Tooltip;
