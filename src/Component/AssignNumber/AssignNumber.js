import React, { useState, useEffect, useRef } from 'react';
import styles from '../AssignNumber/AssignNumber.module.css';
import HeaderBar from '../HeaderBar/HeaderBar';
import Modal2 from '../Modal2/Modal2';
import AnimatedButton from '../AnimatedButton/AnimatedButton';
import { useLocation, useNavigate } from 'react-router-dom';
import { createNumberOrder, fetchAgentDetailById, fetchAvailablePhoneNumberByCountry, getAgentById, updateAgent } from '../../Store/apiStore';
import Loader2 from '../Loader2/Loader2';
import axios from 'axios';
import PopUp from '../Popup/Popup';
import { useDashboardStore } from '../../Store/agentZustandStore';
const AssignNumber = () => {
    const location = useLocation();
    const stateInputRef = useRef(null);
    const cityInputRef = useRef(null);
    const { agents, totalCalls, hasFetched, setDashboardData, setHasFetched } = useDashboardStore();
    const [stateNameFull, setStateNameFull] = useState('');
    const [open, setOpen] = useState(false);
    const [selectedLangCode, setSelectedLangCode] = useState('us');
    const [countryCode, setCountryCode] = useState('US');
    const [stateCode, setStateCode] = useState('');
    const [cityName, setCityName] = useState('');
    const [search, setSearch] = useState('');
    const [availableNumbers, setAvailableNumbers] = useState([]);
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [isRotating, setIsRotating] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false)
    const [agent_id, setAgent_id] = useState("")
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState(null);
    const [popupMessage, setPopupMessage] = useState("");
    const [voip_numbers, setVoip_numbers] = useState("")
    const debounceTimeoutRef = useRef(null);
    const requestVersion = useRef(0)
    const popupShownRef = useRef(false);
    const token = localStorage.getItem("token")
    const navigate = useNavigate()
    const languages = [
        {
            name: "English (US)",
            locale: "en-US",
            countryCode: "US",
            countryName: "United States",
            flag: "/images/en-US.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "French (Canada)",
            locale: "fr-CA",
            countryCode: "CA",
            countryName: "Canada",
            flag: "/images/fr-CA.png",
            percentage: "—",
            stats: "—",
        }
    ];
    useEffect(() => {
        const fetchCountryCode = async () => {
            try {
                // const res = await axios.get('https://ipwho.is/');
                const res = await axios.get('https://ipinfo.io/json');
                const data = res?.data;
                if (data && data.country) {
                    //   setIpData(data);

                    //   setCountryCode(data.country_code.toLowerCase());
                }
            } catch (err) {
                console.error('Failed to fetch IP location:', err);
            }
        };
        fetchCountryCode();
    }, []);
    const selectedLang = languages.find((l) => l.countryCode === countryCode) || "";
    const initAutocomplete = (el, setValue, types) => {
        if (!window.google?.maps?.places) return;
        const ac = new window.google.maps.places.Autocomplete(el, {
            types: [types],
            fields: ['address_components'],
        });
        ac.addListener('place_changed', () => {
            const place = ac.getPlace();
            (place.address_components || []).forEach((c) => {
                if (types === '(regions)' && c.types.includes('administrative_area_level_1')) {
                    setStateCode(c.short_name);
                    setStateNameFull(c.long_name); // for display

                } else if (types === '(regions)' && c.types.includes('locality')) {
                    setCityName(c.long_name);

                }
            });
        });
    };
    useEffect(() => {
        initAutocomplete(stateInputRef.current, setStateCode, '(regions)');
        initAutocomplete(cityInputRef.current, setCityName, '(regions)');
    }, []);
    useEffect(() => {
        setAgent_id(location.state?.agent?.agent_id)
        const businessDetails = location.state?.business
        const business = location.state?.agent?.business || businessDetails;
        if (business) {
            setCountryCode(business.country_code || 'US');
            setStateCode(business.state_code || '');
            setCityName(business.city || '');
            setStateNameFull(business.state)
        }
    }, [location]);
    const fetchNumbersWithFallback = async () => {
        // if (!countryCode || !stateCode) return;
        const currentVersion = ++requestVersion.current
        setLoading(true);
        setShowPopup(false)
        try {
            // First attempt: Country + State + City
            const res = await fetchAvailablePhoneNumberByCountry(token, countryCode, cityName, stateCode);
            if (requestVersion.current !== currentVersion) return;
            if (res?.success && res?.data?.length > 0) {
                setAvailableNumbers(res.data);

            } else {
                // Fallback: Country + State (without city)
                const fallbackRes = await fetchAvailablePhoneNumberByCountry(token, countryCode, "", stateCode);

                if (fallbackRes?.success && fallbackRes?.data?.length > 0) {
                    setTimeout(() => {
                        setCityName("")
                    }, 3000);
                    setAvailableNumbers(fallbackRes.data);

                }

                else {
                    if (!popupShownRef.current) {
                        setShowPopup(true);
                        setPopupType("failed");
                        setPopupMessage(
                            "No numbers found for the selected location. Please try a different country or state."
                        );
                        popupShownRef.current = true;
                    }
                    setAvailableNumbers([]);
                }

            }
        } catch (err) {
            console.error(" Error while fetching:", err);
            if (requestVersion.current === currentVersion) {
                setAvailableNumbers([]);
            }
        } finally {
            if (requestVersion.current === currentVersion) {
                setLoading(false);
            }
        }
    };
    useEffect(() => {
        fetchNumbersWithFallback();
    }, [countryCode, cityName, stateCode]);
    const filteredNumbers = availableNumbers.filter((i) =>
        i.phone_number.includes(search.trim())
    );
    const handleRefresh = async () => {
        setIsRotating(true);
        // Generate random digit (1 to 9) as string
        const getRandomDigit = () => Math.floor(Math.random() * 9 + 1).toString();
        const startsWith = getRandomDigit();
        const endsWith = getRandomDigit();
        try {
            // First: Try with city + state + country
            const res = await fetchAvailablePhoneNumberByCountry(token, countryCode, cityName, stateCode, startsWith, endsWith);
            if (res?.success) {
                setAvailableNumbers(res.data);
            } else {
                // Fallback: Try with state + country only  
                const fallbackRes = await fetchAvailablePhoneNumberByCountry(token, countryCode, cityName, stateCode);
                if (fallbackRes?.success && fallbackRes?.data?.length > 0) {
                    setAvailableNumbers(fallbackRes.data);
                } else {
                    setAvailableNumbers([]);
                    // console.log(" No numbers found even with fallback.");
                }
            }
        } catch (error) {
            console.error(" Error in handleRefresh:", error);
            setAvailableNumbers([]);
        } finally {
            setIsRotating(false);
        }
    };
    const handleNumberClick = (num) => {
        setSelectedNumber(num);
        setModalOpen(true);
    };
    const handleBuyNumber = async () => {
        try {
            setLoading(true)
            const response = await createNumberOrder(selectedNumber, agent_id)
            await updateAgent(agent_id, {
                voip_numbers: [selectedNumber],
                voip_numbers_created: new Date(),
                assignNumFree: 1,
                isNumActivated: 1
            });
            setShowPopup(true)
            setPopupType("success")
            setPopupMessage("Number assigned successfully")

            setLoading(false)
            fetchAgentDetailsById()
            setHasFetched(false)
            setTimeout(() => {
                navigate("/dashboard")
            }, 2000);
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            if (stateCode && countryCode) {
                fetchNumbersWithFallback();
            }
        }, 600); // Wait 600ms after the user stops typing
    }, [cityName, stateNameFull]);
    useEffect(() => {
        const selectedLangCountryCodes = languages.map((lang) => lang.countryCode);
        const isCountryValid = selectedLangCountryCodes.includes(countryCode);
        if (!isCountryValid) {
            setCountryCode("US");
            setStateCode("");
            setCityName("");
            setStateNameFull("")
        }
        popupShownRef.current = false;
    }, [stateCode])
    const fetchAgentDetailsById = async () => {
        try {
            const response = await getAgentById(location.state?.agent?.agent_id);
            setVoip_numbers(response?.data?.voip_numbers)
        } catch (error) {

        }
    }
    useEffect(() => {
        fetchAgentDetailsById()
    }, [])
    return (
        <div className={styles.AssignNumberMain}>
            <div className={styles.devHeadbar}>
                <HeaderBar title="Assign Phone number" bottomSubtitle="Choose your new Rexpt Phone Number" />

                <div className={styles.dropdownWrapper}>
                    <div className={styles.dropdown} onClick={() => setOpen(!open)}>
                        <img src={`https://flagcdn.com/w80/${selectedLang?.locale
                            ?.split("-")[1]
                            ?.toLowerCase()}.png`} alt={selectedLang?.label} className={styles.flagIcon} />
                        <span className={styles.arrow}>
                            <img src="/svg/down-arrow.svg" alt="▼" />
                        </span>
                    </div>
                    {open && (
                        <ul className={styles.dropdownMenu}>
                            {languages.map((lang) => (
                                <li key={lang.countryCode} onClick={() => {
                                    setCountryCode(lang.countryCode);
                                    setSelectedLangCode(lang.countryCode);
                                    setCityName("");
                                    setStateCode("");
                                    setStateNameFull("");
                                    setSearch("");
                                    setAvailableNumbers([]);
                                    setOpen(false);

                                    fetchNumbersWithFallback();

                                }}>
                                    <img
                                        src={`https://flagcdn.com/w80/${lang.locale
                                            ?.split("-")[1]
                                            ?.toLowerCase()}.png`}
                                        alt={lang.name}
                                        className={styles.flagIcon}
                                    />
                                    <span>{lang.countryName}</span>
                                </li>
                            ))}

                        </ul>
                    )}
                </div>
            </div>
            <div className={styles.disclaimerBox1}>
                <img src="/svg/important-icon.svg" alt="warning" />
                <span>
                    <strong>Important Note: </strong> This will be the dedicated business line your customers use to call your Agent.
                </span>
            </div>
            <div className={styles.container}>
                <div className={styles.filters}>
                    <div className={styles.inputGroupSmall}>
                        <label className={styles.inputLabel}>State/Province</label>
                        <input
                            ref={stateInputRef}
                            type="text"
                            placeholder="State"
                            className={styles.inputBox}
                            value={stateNameFull}
                            onChange={(e) => setStateNameFull(e.target.value)}
                            onBlur={() => fetchNumbersWithFallback()}
                        />
                    </div>
                    <div className={styles.inputGroupLarge}>
                        <label className={styles.inputLabel}>City</label>
                        <input
                            ref={cityInputRef}
                            type="text"
                            placeholder="City"
                            className={styles.inputBox}
                            value={cityName}
                            onChange={(e) => setCityName(e.target.value)}
                            onBlur={() => fetchNumbersWithFallback()}
                        />
                    </div>
                </div>

                <div className={styles.searchSection}>
                    <input
                        type="text"
                        placeholder="Search number for Agent"
                        className={styles.searchInput}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        className={`${styles.refreshBtn} ${isRotating ? styles.rotate : ''}`}
                        onClick={handleRefresh}
                    >
                        <img src="/svg/refresh-svg.svg" alt="Refresh" />
                    </button>
                </div>

                <div className={styles.numberList}>
                    {loading ? <><Loader2 /></> : filteredNumbers.length ? (
                        filteredNumbers.map((item) => (
                            <label
                                key={item.phone_number}
                                className={styles.phoneItem}
                                onClick={() => handleNumberClick(item.phone_number)}
                            >
                                <input
                                    type="radio"
                                    name="agentNumber"
                                    value={item.phone_number}
                                    checked={selectedNumber === item.phone_number}
                                    onChange={() => setSelectedNumber(item.phone_number)}
                                />
                                <span className={styles.customRadio}></span>
                                <span className={styles.numbers}>{item.phone_number}</span>
                            </label>
                        ))
                    ) : (
                        <div className={styles.noData}>No data found</div>
                    )}
                </div>

                <Modal2 isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modalTitle}>Confirm Phone Number</h2>
                        <p className={styles.assignText}>
                            You have chosen to <br />
                            assign{' '}
                            <span className={styles.phoneNumber}>{selectedNumber}</span> to your:
                        </p>
                        <div className={styles.infoRow}>
                            <img src="/svg/green-check.svg" alt="check" />
                            <span>
                                <strong>Agent Name:</strong> {location.state?.agent?.agentName}
                            </span>
                        </div>
                        <div className={styles.infoRow}>
                            <img src="/svg/green-check.svg" alt="check" />
                            <span>
                                <strong>Business:</strong>{location.state?.agent?.business?.businessName || location.state?.business?.businessName}
                            </span>
                        </div>
                        <div className={styles.disclaimerBox}>
                            <img src="/svg/warning-svg.svg" alt="warning" />
                            <span>
                                <strong>Disclaimer:</strong> You will not be able to change this phone
                                number in current billing cycle.
                            </span>
                        </div>
                        <div className={styles.assignBtn}>
                            <AnimatedButton disabled={!!voip_numbers} isLoading={loading} label="Assign Number" onClick={handleBuyNumber} position={{ position: 'relative' }} />
                        </div>
                    </div>
                </Modal2>
            </div>

            {showPopup && (
                <PopUp
                    type={popupType}
                    onClose={() => setShowPopup(false)}
                    message={popupMessage}
                    renderHTML={true}
                />
            )}
        </div>
    );
};

export default AssignNumber;
