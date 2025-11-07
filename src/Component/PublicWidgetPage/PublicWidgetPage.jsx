import React, { useEffect } from "react";

const PublicWidgetPage = ({ agentCode }) => {
useEffect(() => {
    if (!agentCode) return;

    // Remove any previous script
    const existing = document.getElementById("rex-widget-script");
    if (existing) existing.remove();
    // Make agentCode globally available for the widget.js script
    window.REX_AGENT_CODE = agentCode;
    // Create the script element
    const script = document.createElement("script");
    script.src = `${process.env.REACT_APP_PUBLIC_WIDGET_DOMAIN}/public-widget.js`;
    script.id = "rex-widget-script";
    script.async = true;

    document.body.appendChild(script);

    console.log("Widget injected with agent:", agentCode);

    return () => {
      const s = document.getElementById("rex-widget-script");
      if (s) s.remove();
      delete window.REX_AGENT_CODE;
    };
  }, [agentCode]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
    
      <div id="review-widget"></div>
    </div>
  );
}

export default PublicWidgetPage;
