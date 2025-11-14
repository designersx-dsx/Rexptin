// src/hooks/useUTMParams.js
import { useEffect, useState } from "react";

export default function useUTMParams() {
  const [utmData, setUtmData] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    const utmParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_id",
      "utm_term",
      "utm_content",
    ];

    const data = {};

    utmParams.forEach((param) => {
      const value = urlParams.get(param);
      if (value) {
        data[param] = value;
      }
    });

    // If any UTM data is found → save to localStorage
    if (Object.keys(data).length > 0) {
      localStorage.setItem("utm_data", JSON.stringify(data));
      setUtmData(data);
    } else {
      // Else load existing data from localStorage if already saved
      const storedData = localStorage.getItem("utm_data");
      if (storedData) {
        setUtmData(JSON.parse(storedData));
      }
    }
  }, []);

  return utmData;
}
