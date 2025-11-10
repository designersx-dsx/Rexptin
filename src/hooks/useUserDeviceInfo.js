import { useEffect, useState } from "react";
import axios from "axios";

export default function useUserDeviceInfo() {
    const [info, setInfo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                //  Step 1: Browser + System Details
                const ua = navigator.userAgent || "";
                const platform = navigator.platform || "";
                const vendor = navigator.vendor || "";
                const languages = navigator.languages || [navigator.language];
                const cookieEnabled = navigator.cookieEnabled;
                const hardwareConcurrency = navigator.hardwareConcurrency || null;
                const deviceMemory = navigator.deviceMemory || null;
                const screenSize = {
                    width: window.screen?.width,
                    height: window.screen?.height,
                    availWidth: window.screen?.availWidth,
                    availHeight: window.screen?.availHeight,
                    orientation:
                        (window.screen?.orientation &&
                            window.screen.orientation.type) ||
                        null,
                    pixelRatio: window.devicePixelRatio || 1,
                };
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const timezoneOffset = new Date().getTimezoneOffset();
                const language = navigator.language || null;
                const connection =
                    navigator.connection ||
                    navigator.mozConnection ||
                    navigator.webkitConnection ||
                    null;

                const uaData = navigator.userAgentData
                    ? {
                        brands:
                            navigator.userAgentData.brands ||
                            navigator.userAgentData.uaList ||
                            null,
                        mobile: navigator.userAgentData.mobile,
                        platform: navigator.userAgentData.platform,
                    }
                    : null;

                //  Step 2: Lightweight UA parsing
                const simpleParseUA = (uaString) => {
                    const re =
                        /(Firefox|Chrome|Edge|CriOS|Safari|Opera|OPR|SamsungBrowser|UCBrowser|Brave)\/? ?([0-9.|a-zA-Z.]*)/i;
                    const match = uaString.match(re);
                    if (!match) return { name: "Unknown", version: null };
                    let name = match[1];
                    const version = match[2] || null;
                    if (name === "OPR") name = "Opera";
                    if (name === "CriOS") name = "Chrome (iOS)";
                    return { name, version };
                };

                const browser = simpleParseUA(ua);

                //  Step 3: Get IP + Location Data
                const response = await axios.get(
                    "https://ipinfo.io/json"
                );
                const data = response?.data || {};

                //  Step 4: Merge everything together
                const result = {
                    //  Location Info
                    ip: data.ip || null,
                    city: data.city || null,
                    region: data.region || null,
                    country: data.country || null,
                    postal: data.postal || null,
                    loc: data.loc || null, // "lat,long"
                    org: data.org || null,
                    timezone: data.timezone || timezone,
                    hostname: data.hostname || null,
                    //  Currency (basic mapping)
                    currency: data.country,

                    // System Info
                    userAgent: ua,
                    userAgentData: uaData,
                    platform,
                    vendor,
                    languages,
                    language,
                    cookieEnabled,
                    hardwareConcurrency,
                    deviceMemory,
                    screen: screenSize,
                    timezoneOffset,
                    connection: connection
                        ? {
                            effectiveType: connection.effectiveType || null,
                            downlink: connection.downlink || null,
                            rtt: connection.rtt || null,
                            saveData: connection.saveData || null,
                        }
                        : null,

                    //  Parsed browser info
                    browser,

                    //  Metadata
                    timestamp: new Date().toISOString(),
                };

                setInfo(result);
            } catch (error) {
                console.error("Error fetching device/location info:", error);
                setInfo({ error: "Unable to fetch user info" });
            }
        };



        fetchData();
    }, []);

    return info;
}
