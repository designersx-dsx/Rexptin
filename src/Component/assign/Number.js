import React, { useState, useEffect, useRef } from "react";
import "./Number.css";
import { useLocation } from "react-router-dom";
import { fetchAvailablePhoneNumberByCountry } from "../../Store/apiStore";

const Number = () => {
    const location = useLocation();
    const [selectedNumber, setSelectedNumber] = useState("");
    const [search, setSearch] = useState("");
    const [country_code, setCountry_code] = useState("");
    const [locality, setLocality] = useState("");
    const [administrative_area, setAdministrative_area] = useState("");
    const [availableNumbers, setAvailableNumbers] = useState([]);
    const stateInputRef = useRef(null);
    const cityInputRef = useRef(null);
const token = localStorage.getItem("token")
// fdfd
    // Extract business details and set fields
    useEffect(() => {
        const businessDetails = location?.state?.agent?.business;
        const country = businessDetails?.country_code || "";
        const state = businessDetails?.state_code || "";
        const city = businessDetails?.city || "";
        console.log("hy")
        console.log(country)
        console.log(city)
        console.log(state)
        setCountry_code(country);
        setLocality(city);
        setAdministrative_area(state);
        console.log(country_code, locality, administrative_area, "country_code, locality, administrative_area")
        if (country_code || locality || administrative_area) {
            fetchAvailablePhoneNumberByCountry(token , country_code, locality, administrative_area , token)
                .then((res) => {
                    setAvailableNumbers(res.data);
                    console.log(res.data, "numbers");
                })
                .catch((error) => {
                    console.error("Failed to fetch phone numbers:", error);
                });
        }
    }, [location]);
    // Init Autocomplete on state and city inputs
    useEffect(() => {
        const interval = setInterval(() => {
            if (window.google?.maps?.places) {
                if (stateInputRef.current && cityInputRef.current) {
                    initAddressAutocomplete(stateInputRef.current, setLocality, "administrative_area_level_1");
                    initAddressAutocomplete(cityInputRef.current, setAdministrative_area, "locality");
                    clearInterval(interval);
                }
            }
        }, 300);
    }, []);

    const initAddressAutocomplete = (inputElement, setStateCode, setStateName, setCountryCode) => {
        const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
            types: ["(regions)"],
            fields: ["address_components", "formatted_address"],
        });

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            const components = place.address_components || [];

            let stateCode = "";
            let stateName = "";
            let countryCode = "";

            components.forEach(component => {
                if (component.types.includes("administrative_area_level_1")) {
                    stateCode = component.short_name;
                    stateName = component.long_name;
                }

                if (component.types.includes("country")) {
                    countryCode = component.short_name;
                }
            });

            if (setStateCode) setAdministrative_area(stateCode);
            // if (setStateName) setStateName(stateName);
            if (setCountryCode) setCountry_code(countryCode);
        });
    };





    const filteredNumbers = availableNumbers.filter((item) =>
        item.phone_number.includes(search)
    );
    useEffect(() => {
        if (country_code || locality || administrative_area) {
            const delayDebounce = setTimeout(() => {
                fetchAvailablePhoneNumberByCountry(token  , country_code, locality, administrative_area , token)
                    .then((res) => {
                        setAvailableNumbers(res.data);
                        console.log("Auto-fetched numbers:", res.data);
                    })
                    .catch((error) => {
                        console.error("Auto-fetch failed:", error);
                    });
            }, 300); // debounce to avoid rapid requests

            return () => clearTimeout(delayDebounce);
        }
    }, [locality, administrative_area, country_code]);
    const handleRefresh = () => {
    
        // console.log(randomNumericPrefix, "randomNumericPrefix")
        fetchAvailablePhoneNumberByCountry(token  , country_code, locality, administrative_area , token)
            .then((res) => {
                setAvailableNumbers(res.data);
            })
            .catch((error) => {
                console.error("Refresh failed:", error);
            });
    }


    return (
        <div className="container">
            {/* Header */}
            <div className="header">
                <h2>Assign Number</h2>
                <div className="country-select">
                    <span className="country-flag">🇺🇸</span>
                    <button className="dropdown-btn">▼</button>
                </div>
            </div>

            {/* Filters */}
            <div className="filters">
                <input
                    type="text"
                    placeholder="State"
                    value={locality}
                    ref={stateInputRef}
                    onChange={(e) => setLocality(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="City"
                    value={administrative_area}
                    ref={cityInputRef}
                    onChange={(e) => setAdministrative_area(e.target.value)}
                />
            </div>

            {/* Search and Refresh */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search number for Agent"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button
                    className="refresh-btn"
                    onClick={handleRefresh}

                >
                    Refresh
                </button>
            </div>

            {/* Phone list */}
            <div className="phone-list">
                {filteredNumbers.map((item) => (
                    <label key={item.phone_number} className="phone-item">
                        <span>{item.phone_number}</span>
                        <input
                            type="radio"
                            name="phone"
                            checked={selectedNumber === item.phone_number}
                            onChange={() => setSelectedNumber(item.phone_number)}
                        />
                    </label>
                ))}
            </div>
        </div>
    );
};

export default Number;
