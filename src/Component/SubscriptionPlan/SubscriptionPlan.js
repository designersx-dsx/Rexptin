import React, { useRef, useState, useEffect } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styles from './SubscriptionPlan.module.css';
import styless from '../Plan/Plan.module.css';
import AnimatedButton from '../AnimatedButton/AnimatedButton';
import FreeTrialModal from '../FreeTrialModal/FreeTrialModal';
import HeaderBar from "../HeaderBar/HeaderBar";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";
import Loader2 from '../Loader2/Loader2';
import { customPlanCheck, listAgents } from '../../Store/apiStore';
import decodeToken from '../../lib/decodeToken';

import axios from 'axios'

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const SubscriptionPlan = ({ agentID, locationPath }) => {
    const sliderRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [expandedPlans, setExpandedPlans] = useState({});
    const [expanded, setExpanded] = useState(false);

    const [expandedCustom, setExpandedCustom] = useState(false);
    const [toggleStates, setToggleStates] = useState({}); // { planId: true/false }
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [freeTrial, setFreeTrial] = useState(false);
    const [customPlan, setCustomPlan] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState("");
    const [userCurrency, setUserCurrency] = useState("usd");
    const token = localStorage.getItem("token") || "";
    const decodeTokenData = decodeToken(token);
    const userIdFromToken = decodeTokenData?.id || "";
    const [userId, setUserId] = useState(userIdFromToken)
    const [hasCustomPlan, setHasCustomPlan] = useState()
    const [value, setValue] = useState(0);
    const [agentCount, setAgentCount] = useState()
    const [showAll2, setShowAll2] = useState(false);


    const navigate = useNavigate();
    const location = useLocation();
    const handleClick = () => {
        setFreeTrial(!freeTrial);
        setIsModalOpen(true);
    };
    const [modalOpenCustom, setIsModalOpenCustom] = useState(false)

    const handleClickCustom = () => {
        setCustomPlan(!customPlan);
        setIsModalOpenCustom(true);
    };
    const settings = {
        infinite: false,
        speed: 500,
        slidesToShow: 1.15,
        slidesToScroll: 1,
        arrows: false,
        cssEase: 'ease-in-out',
        afterChange: (index) => {
            setActiveIndex(Math.round(index));
        },
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1.2,
                },
            },
        ],
    };

    const checkCustom = async () => {
        let res = await customPlanCheck(decodeTokenData?.id)
        // console.log(res?.data?.hasCustomPlan)
        setHasCustomPlan(res?.data?.hasCustomPlan)
    }
    useEffect(() => {
        checkCustom()
    }, [])

    const toggleExpand = (index) => {
        setExpandedPlans((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const getCurrencySymbol = (currencyCode) => {
        try {
            return new Intl.NumberFormat('en', {
                style: 'currency',
                currency: currencyCode.toUpperCase(),
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })
                .formatToParts(1)
                .find(part => part.type === 'currency')?.value || "$";
        } catch {
            return "$";
        }
    };



    useEffect(() => {
        const getLocationCurrency = async () => {
            try {
                // const response = await fetch("https://ipwho.is/");
                const response = await axios.get('https://ipinfo.io/json');
                const data = await response?.data;

                if (data.country) {
                    const currency = mapCountryToCurrency(data.country);
                    setUserCurrency(currency);
                } else {
                    throw new Error("Invalid IP data");
                }

            } catch (error) {
                console.error("Error determining location-based currency:", error);
                setUserCurrency("usd"); // fallback
            }
        };

        const mapCountryToCurrency = (countryCode) => {
            const countryCurrencyMap = {


                IN: "inr",

                US: "usd",
                CA: "cad",
                AU: "aud",
                GB: "gbp",
            };
            return countryCurrencyMap[countryCode] || "usd";
        };

        getLocationCurrency();
    }, []);

    useEffect(() => {
        if (!userCurrency) return;

        fetch(`${API_BASE}/products`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                const planColorMap = ["starter", "scaler", "growth", "corporate"];
                const icon = "/svg/premium-icon.svg";
                const circleFills = [
                    "/svg/sky-circle.svg",
                    "/svg/green-circle.svg",
                    "/svg/pink-circle.svg",
                    "/svg/orange-circle.svg",
                ];

                // Step 1: Enrich each product WITHOUT assigning color
                let enrichedPlans = data.map((product) => {
                    const matchedData = product.data?.find(
                        (p) => p.id === product.id
                    );


                    const matchingPrices = product.prices.filter(
                        (p) =>
                            p.currency.toLowerCase() === userCurrency.toLowerCase() ||
                            p.currency_options?.some(
                                (opt) => opt.currency === userCurrency.toLowerCase()
                            )
                    );

                    const enrichedPrices = matchingPrices.map((price) => {
                        let displayPrice = price.unit_amount / 100;
                        let currency = price.currency;

                        const option = price.currency_options?.find(
                            (opt) => opt.currency === userCurrency
                        );
                        if (option) {
                            displayPrice = option.unit_amount / 100;
                            currency = option.currency;
                        }

                        return {
                            ...price,
                            unit_amount: displayPrice * 100,
                            currency: currency.toLowerCase(),
                        };
                    });

                    // console.log("product",product)
                    // console.log("matchedData",matchedData)



                    return {
                        ...product,
                        title: product.name || `Plan`,
                        icon,
                        prices: enrichedPrices,
                        description: product.description || "No description provided",
                        billedText: "When billed yearly in advance",
                        features: product.metadata?.features
                            ? JSON.parse(product.metadata.features)
                            : [
                                `${matchedData?.metadata?.["minutes-month"] || "0"} minutes / month`,
                                "FREE VoIP Number",
                                "Agent Characterization",
                                "24/7 Availability",
                                "Email Notifications",
                                "Website Widget Integration",
                                "Speech Naturalization",
                                "Environment Setup",
                                "Calendar Integration using Cal.com",
                                "Book Calendar Meetings",
                                "Call History(Basic)",
                            ],
                    };
                });

                // Step 2: Sort by highest monthly price
                enrichedPlans.sort((a, b) => {
                    const aPrice =
                        a.prices.find((p) => p.interval === "month")?.unit_amount || 0;
                    const bPrice =
                        b.prices.find((p) => p.interval === "month")?.unit_amount || 0;
                    return bPrice - aPrice;
                });

                // Step 3: Assign reversed colors and circles
                const total = enrichedPlans.length;
                enrichedPlans = enrichedPlans.map((plan, index) => {
                    const reversedIndex = total - 1 - index;
                    return {
                        ...plan,
                        color: planColorMap[reversedIndex % planColorMap.length],
                        circleFill: circleFills[reversedIndex % circleFills.length],
                    };
                });

                // Step 4: Init toggle state
                const toggleInit = {};
                enrichedPlans.forEach((plan) => {
                    toggleInit[plan.id] = false; // monthly by default
                });

                const finalPlans = enrichedPlans.reverse()

                setToggleStates(toggleInit);
                setProducts(finalPlans); // no .reverse()
                setLoading(false);

                // ✅ Preselect saved plan name (e.g., "Growth")
                const savedPlanName = sessionStorage.getItem("selectedPlan");
                if (savedPlanName) {
                    const matchingIndex = finalPlans.findIndex(plan => plan.title.toLowerCase() === savedPlanName.toLowerCase());

                    if (matchingIndex >= 0) {
                        setActiveIndex(matchingIndex);
                        setTimeout(() => {
                            sliderRef.current?.slickGoTo(matchingIndex);
                        }, 100); // Ensure slider is ready
                    }

                    // Optional: remove it after selection
                    // sessionStorage.removeItem("selectedPlan");
                }


            })


            .catch(() => {
                setError("Failed to load plans.");
                setLoading(false);
            });

    }, [userCurrency]);

    const CustomhandleClick = () => {
        navigate("/build-own-plan");
    };
    const fetchAgentCountFromUser = async () => {
        try {

            const response = await listAgents()
            const filterAgents = await response.filter(res => res.userId === userId)
            setAgentCount(filterAgents.length)
            // console.log(userId, "userid", filterAgents.length)

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchAgentCountFromUser()
        // localStorage.removeItem("allPlans")
        // sessionStorage.removeItem("checkPage")
    }, [])

    const [reactNativeStatus, setreactNativeStatus] = useState(false)
    // console.log("reactNativeStatus", reactNativeStatus)

    useEffect(() => {
        const handleNativeMessage = (event) => {
            try {
                // console.log("event", event.data)
                const raw = typeof event?.data === "string" ? event.data : null;
                if (!raw) return;

                const data = JSON.parse(raw);
                console.log("data?.type", data?.type)

                if (data?.type === "IAP_STARTED") {
                    console.log("✅ Native IAP started for", data.productId);
                    // flag to skip web checkout
                    window.skipCheckout = true;
                }

                if (data?.type === "IAP_SUCCESS") {
                    console.log("🎉 Purchase success", data.receipt);
                    // handle success flow...
                }

                if (data?.type === "IAP_FAILED") {
                    console.warn("❌ Purchase failed", data.reason);
                    // handle failure flow...
                }
            } catch (err) {
                console.error("Invalid message from app:", err);
            }
        };

        // Only attach when inside RN WebView
        if (window.ReactNativeWebView) {
            // console.log("React Native RUnning", window)
            setreactNativeStatus(true)
            document.addEventListener("message", handleNativeMessage); // Android
            window.addEventListener("message", handleNativeMessage);    // iOS
        }

        return () => {
            document.removeEventListener("message", handleNativeMessage);
            window.removeEventListener("message", handleNativeMessage);
        };
    }, []);


    if (loading)
        return (
            <p className={styles.status}>
                <Loader2 />
            </p>
        );
    if (error) return <p className={styles.statusError}>{error}</p>;


    const features = [
        '20 minutes FREE Usage on Us',
        'No VOIP Number',
        'Agent Characterization',
        'Starter Package Feature',
        'No Call Recording',
        'Priority Email Support',
        'Analytics Dashboard',
        'Custom Greeting Message',
        'User Management',
    ];
    const visibleFeatures = expanded ? features : features.slice(0, 5);

    const handleToggle = () => {
        setExpanded((prev) => !prev);
    };

    const featuresCustom = [
        '20 minutes FREE Usage on Us',
        'No VOIP Number',
        'Agent Characterization',
        'Starter Package Feature',
        'No Call Recording',
        'Priority Email Support',
        'Analytics Dashboard',
        'Custom Greeting Message',
        'User Management',
    ];
    const visibleFeaturesCustom = expandedCustom ? featuresCustom : featuresCustom.slice(0, 5);

    const handleToggleCustom = () => {
        setExpandedCustom((prev) => !prev);
    };

    const tierCheckout = async () => {


        try {
            let url
            const queryParams = new URLSearchParams();
            const origin = window.location.origin;
            queryParams.append("mode", "create");
            if (userId) queryParams.append("userId", userId);


            url = `${origin}/steps?${queryParams.toString()}`;
            const res = await axios.post(`${API_BASE}/tier/checkout`, {
                customerId: decodeTokenData?.customerId
                ,
                presetUnits: value,
                minUnits: 0,
                maxUnits: 200,
                successUrl: url, // origin + path
                cancelUrl: window.location.origin + "/cancel-payment",

                userId: userId,
                priceId: "price_1RypKj4T6s9Z2zBzesn9ijNz"

            });

            if (res?.data?.url) {
                window.location.href = res.data.url; // redirect user
            }
        } catch (error) {
            console.error("Checkout error:", error);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN').format(price);
    };



    const handleBuyPlan = (data) => {
        // console.log({ data });

        const plansFromApple = {
            starter_month: "com.rexpt.starter.monthly",
            starter_year: "com.rexpt.starter.yearly",
            scaler_month: "com.rexpt.scaler.monthly",
            scaler_year: "com.rexpt.scaler.yearly",
            growth_month: "com.rexpt.growth.monthly",
            growth_year: "com.rexpt.growth.yearly",
            corporate_month: "com.rexpt.corporate.monthly",
            corporate_year: "com.rexpt.corporate.yearly"
        };

        // Normalize name + interval into a key (lowercased to match dictionary)
        const key = `${data.planName.toLowerCase()}_${data.interval.toLowerCase()}`;

        // Lookup product ID from Apple mapping
        const appleProductId = plansFromApple[key];

        if (!appleProductId) {
            console.warn("⚠️ No matching Apple product found for:", key);
            return;
        }

        // console.log("appleProductId",appleProductId)

        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(
                JSON.stringify({
                    type: "BUY",
                    productId: appleProductId,
                })
            );
        } else {
            console.warn("ReactNativeWebView not available — running in browser");
        }
    };

    const features2 = [
        "Fully customizable features",
        "Choose your own pricing",
        "Add-on integrations",
        "24/7 Availability",
        "Email Notifications",
        "Website Widget Integration",
        "Team Collaboration Tools",
        "Advanced Call Analytics",
        "Multi-language Support",
        "Custom Branding Options",
        "Dedicated Account Manager",
    ];



    // Only show first 7 if not expanded
    const visibleFeatures2 = showAll2 ? features2 : features2.slice(0, 5);

    return (
        <div className={styles.MainPlanDiv}>
            <div className={styles.firstdiv}>
                <HeaderBar title="Upgrade Plan" />
                {agentCount == 0 ? <label className={styles.freeTrialBtn} onChange={handleClick}>
                    FREE TRIAL
                    <input
                        type="checkbox"
                        checked={freeTrial}
                        onChange={() => setFreeTrial(!freeTrial)}
                    />
                    <span className={`${styles.checkCircle} ${freeTrial ? styles.checked : ""}`}>
                        {freeTrial && (
                            <svg
                                className={styles.checkIcon}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                            >
                                <path
                                    fill="white"
                                    d="M20.3 5.7a1 1 0 0 0-1.4 0L9 15.6l-3.9-3.9a1 1 0 0 0-1.4 1.4l4.6 4.6a1 1 0 0 0 1.4 0l10.6-10.6a1 1 0 0 0 0-1.4z"
                                />
                            </svg>
                        )}
                    </span>
                </label>
                    : null}

                {/* {!hasCustomPlan ? 

 <label className={styles.freeTrialBtn} onClick={handleClickCustom}>
                    Custom Plan
                    <inputcustomPlan
                        type="checkbox"
                        checked={customPlan}
                        onChange={() => setCustomPlan(!customPlan)}
                    />
                    <span className={`${styles.checkCircle} ${customPlan ? styles.checked : ""}`}>
                        {customPlan && (
                            <svg
                                className={styles.checkIcon}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                            >
                                <path
                                    fill="white"
                                    d="M20.3 5.7a1 1 0 0 0-1.4 0L9 15.6l-3.9-3.9a1 1 0 0 0-1.4 1.4l4.6 4.6a1 1 0 0 0 1.4 0l10.6-10.6a1 1 0 0 0 0-1.4z"
                                />
                            </svg>
                        )}
                    </span>
                </label>
: null} */}


            </div>







            <div>
                <div className={styles.sectionPart}>
                    <h2>Subscriptions Plans </h2>
                    <p>Choose a suitable plan for your agent & business case</p>
                </div>

                {/* {!hasCustomPlan ?
                  <div className={styless.sectionPart}>
                                <div className={styless.cutomPlan} onClick={CustomhandleClick}>
                                    <div><img src='svg/edit-custom-plan.svg' alt='edit-custom-plan' /></div>
                                    <p>Custom Plan</p>
                                </div>
                               
                            </div>
                 : null}  */}


                <div className={styles.wrapper}>
                    <Slider ref={sliderRef} {...settings}>
                        {products.map((plan, index) => {
                            const isYearly = toggleStates[plan.id];
                            const interval = isYearly ? "year" : "month";
                            const priceForInterval = plan.prices.find((p) => p.interval === interval);

                            // 🔒 Always show yearly price in fixed places
                            const yearlyPrice = plan.prices.find((p) => p.interval === "year");
                            const monthlyPrice = plan.prices.find((p) => p.interval === "month");
                            const currencySymbol = getCurrencySymbol(monthlyPrice?.currency || userCurrency);
                            const yearlySymbol = getCurrencySymbol(yearlyPrice?.currency || userCurrency);



                            return (
                                <div key={plan.id} className={styles.slide}>
                                    <div
                                        className={`
      ${styles.card}
      ${styles[plan.color]}
      ${index === activeIndex ? styles.activeOverlay : ""}
      ${index !== activeIndex ? styles.inactiveCard : ""}
    `}

                                    >
                                        <div className={`${styles.sectionTop} ${styles[`${plan.color}Bg`]}`}>
                                            <div className={styles.CardiSection}>
                                                <div className={styles.header}>
                                                    <div className={styles.priceTop}>
                                                        <div>
                                                            <img src={plan.icon} alt="" />
                                                        </div>
                                                        <div className={styles.pricdec}>
                                                            <p className={styles.subPrice}>
                                                                {yearlyPrice
                                                                    ? `${yearlySymbol}${formatPrice((yearlyPrice.unit_amount / 100 / 12))}/m`
                                                                    : `${yearlySymbol}0/m`}
                                                            </p>
                                                            <p className={styles.billedText}>{plan.billedText}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <h3 className={`${styles.Title} ${styles[`${plan.color}Text`]}`}>
                                                    {plan.title}
                                                </h3>
                                                <p className={styles.mainPrice}>
                                                    <b className={styles.doolor}>
                                                        {priceForInterval
                                                            ? `${getCurrencySymbol(priceForInterval.currency)}${formatPrice(
                                                                (priceForInterval.unit_amount / 100) / (interval === "year" ? 12 : 1)
                                                            )}`
                                                            : `${getCurrencySymbol(userCurrency)}0`}
                                                    </b>
                                                    /month per agent
                                                </p>
                                                <p className={styles.description}>{plan.description}</p>
                                            </div>
                                        </div>


                                        

                                        <ul className={styles.featuresList}>
                                            <div
                                                className={`${styles.featuresWrapper} ${expandedPlans[index] ? styles.expanded : ""
                                                    }`}
                                            >
                                                {plan.features.map((feature, idx) => (
                                                    <li
                                                        key={idx}
                                                        className={`${styles.featureItem} ${expandedPlans[index] || idx < 5
                                                            ? styles.visible
                                                            : styles.hidden
                                                            }`}
                                                    >
                                                        <img
                                                            src={plan.circleFill}
                                                            alt=""
                                                            className={styles.featureIcon}
                                                        />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </div>

                                            {plan.features.length > 5 && (
                                                <p
                                                    type="button"
                                                    className={styles.seeAll}
                                                    onClick={() => toggleExpand(index)}
                                                >
                                                    {expandedPlans[index] ? "Show Less" : "~ See All Features"}
                                                </p>
                                            )}
                                        </ul>

                                        <div className={styles.toggleWrap}>
                                            <span
                                                className={
                                                    toggleStates[plan.id] ? styles.inactive : styles.active
                                                }
                                            >
                                                Monthly
                                            </span>
                                            <label className={styles.toggleSwitch}>
                                                <input
                                                    type="checkbox"
                                                    checked={toggleStates[plan.id]}
                                                    // onChange={(e) =>
                                                    //     setToggleStates((prev) => ({
                                                    //         ...prev,
                                                    //         [plan.id]: e.target.checked,
                                                    //     }))
                                                    // }
                                                    onChange={(e) => {
                                                        const isYearly = e.target.checked;
                                                        const newState = {};
                                                        products.forEach((p) => {
                                                            newState[p.id] = false; // default to Monthly
                                                        });
                                                        newState[plan.id] = isYearly; // only current one is Yearly if checked
                                                        setToggleStates(newState);
                                                    }}
                                                />
                                                <span className={styles.slider}></span>
                                            </label>
                                            <span
                                                className={
                                                    toggleStates[plan.id] ? styles.active : styles.inactive
                                                }
                                            >
                                                Yearly
                                            </span>
                                        </div>

                                        {toggleStates[plan.id] && monthlyPrice && yearlyPrice && (
                                            (() => {
                                                const monthlyTotal = monthlyPrice.unit_amount;
                                                // console.log("monthlyPrice", monthlyPrice)
                                                const yearlyTotal = yearlyPrice.unit_amount / 12;
                                                // console.log("yearlyTotal", yearlyPrice)
                                                const savings = monthlyTotal - yearlyTotal;
                                                const savingsPercent = ((savings / monthlyTotal) * 100).toFixed(0);

                                                return (
                                                    <div className={styles.discount}>
                                                        You save {savingsPercent}% ({getCurrencySymbol(yearlyPrice.currency)}{formatPrice((savings / 100))}/monthly & {getCurrencySymbol(yearlyPrice.currency)}{formatPrice((savings / 100 * 12))}/yearly) compared to monthly billing
                                                    </div>
                                                );
                                            })()
                                        )}
                                        <br />
                                        <div style={{ fontSize: "12px" }} className={styles.stickyWrapper}>
                                            <AnimatedButton
                                                label={
                                                    userCurrency === "inr"
                                                        ? "Coming Soon.." :
                                                        priceForInterval
                                                            ? `Subscribe for ${getCurrencySymbol(priceForInterval.currency)}${(
                                                                formatPrice(priceForInterval.unit_amount / 100
                                                                ))}/${priceForInterval.interval}`
                                                            : "Unavailable"
                                                }
                                                disabled={userCurrency === "inr"}
                                                position={{ position: "relative" }}
                                                size="13px"
                                                onClick={() => {
                                                    if (priceForInterval) {
                                                        const today = new Date();
                                                        const nextBillingDate = new Date(today);

                                                        if (priceForInterval.interval === "month") {
                                                            nextBillingDate.setMonth(today.getMonth() + 1);
                                                        } else {
                                                            nextBillingDate.setFullYear(today.getFullYear() + 1);
                                                        }

                                                        // Extract minutes if found in first feature (e.g., "120 minutes / month")
                                                        const firstFeature = plan.features[0] || "";
                                                        const planMinsMatch = firstFeature.match(/(\d+)\s*minutes/i);
                                                        const planMins = planMinsMatch ? parseInt(planMinsMatch[1], 10) : 0;

                                                        const currentInterval = toggleStates[plan.id] ? "year" : "month";



                                                        const selectedPlanData = {
                                                            priceId: priceForInterval.id,
                                                            agentId: agentID,
                                                            price: (priceForInterval.unit_amount / 100).toFixed(2),
                                                            interval: priceForInterval.interval,
                                                            currency: priceForInterval.currency,
                                                            billingTodayAmount:
                                                                priceForInterval.interval === "month"
                                                                    ? (priceForInterval.unit_amount / 100).toFixed(2)
                                                                    : ((priceForInterval.unit_amount / 100) * 12 * 0.95).toFixed(2),
                                                            billingDate: today.toISOString(),
                                                            nextBillingDate: nextBillingDate.toISOString(),
                                                            planName: plan.title,
                                                            planMins: planMins
                                                        };

                                                        // ✅ Save to localStorage
                                                        localStorage.setItem("selectedPlanData", JSON.stringify(selectedPlanData));
                                                        handleBuyPlan({
                                                            priceId: priceForInterval.id,
                                                            planName: plan.name ?? plan.title,
                                                            interval,
                                                        });

                                                        navigate("/checkout", {
                                                            state: {
                                                                priceId: priceForInterval.id,
                                                                agentId: agentID,
                                                                locationPath1: locationPath,
                                                                price: (priceForInterval.unit_amount / 100).toFixed(2),
                                                                interval: priceForInterval.interval,
                                                            },
                                                        });
                                                    } else {
                                                        alert("Price not available for selected interval");
                                                    }
                                                }}
                                            />

                                        </div>
                                    </div>
                                </div>
                            );
                        })}


                        {!hasCustomPlan ?
                            <div key="custom-plan" className={styles.slide}>
                                <div
                                    className={`${styles.card} ${styles.customColor}`}
                                    // onClick={CustomhandleClick}
                                    style={{ cursor: "pointer" }}
                                >
                                    {/* Top Section */}
                                    <div className={`${styles.sectionTop} ${styles.customColorBg}`}>
                                        <div className={`${styles.CardiSection} ${styles.CustomPlanSection}`}>
                                            <div className={styles.header}>
                                                <div className={styles.priceTop}>
                                                    <div>
                                                        <img src="/svg/premium-icon.svg" alt="Custom Plan" />
                                                    </div>
                                                    <div className={styles.pricdec}>
                                                        <p className={styles.subPrice}>Custom</p>
                                                        <p className={styles.billedText}>Tailored to your needs</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <h3 className={`${styles.Title} ${styles.customText}`}>
                                                Custom Plan
                                            </h3>

                                            <p className={styles.mainPrice}>
                                                <b className={styles.doolor}>Flexible</b> /month per agent
                                            </p>

                                            <p className={styles.description}>
                                                Build your perfect plan based on your usage and business scale.Customize features, control costs.
                                            </p>


                                        </div>
                                        <ul className={styles.featuresList2}>
                                            <div
                                                className={`${styles.featuresWrapper} ${showAll2 ? styles.expanded : ""}`}
                                            >

                                                {visibleFeatures2.map((feature, index) => (
                                                    <li key={index} className={styles.featureItem2}>
                                                        <img src="/svg/purpol-circle 1.svg" alt="" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </div>

                                            {features2.length > 5 && (
                                                <button
                                                    className={styles.toggleBtn2}
                                                    onClick={() => setShowAll2((prev) => !prev)}
                                                >
                                                    {showAll2 ? "Show Less" : "~ See All Features"}
                                                </button>
                                            )}
                                        </ul>



                                    </div>

                                    {/* Features Section */}


                                    {/* Button Section */}
                                    <div className={styles.stickyWrapper}>
                                        <AnimatedButton
                                            label="Build Plan"
                                            position={{ position: "relative" }}
                                            onClick={() => navigate("/build-own-plan")}
                                        />
                                    </div>
                                </div>
                            </div> : null}

                    </Slider>
                </div>
            </div>

            <FreeTrialModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setFreeTrial(false);
                }}>
                <div className={styles.freeTrialMain}>
                    <div className={styles.Topsection}>
                        <h1>FREE TRIAL</h1>
                        <p>No Cost to Try Our Agents</p>
                        <text>Explore our agents and viability for your business at <b className={styles.boldText}>“NO COST”.</b></text>
                    </div>
                    <div className={styles.featureList}>
                        <div className={styles.listdata}>
                            {visibleFeatures.map((text, index) => {
                                const isNegative = text.toLowerCase().includes('no');
                                return (
                                    <div className={styles.liData} key={index}>
                                        <img
                                            src={isNegative ? '/svg/cross-svg.svg' : '/svg/tick-svg.svg'}
                                            alt={isNegative ? 'cross icon' : 'tick icon'}
                                        />
                                        <p>{text}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <p className={styles.toggleText} onClick={handleToggle}>
                            ~ {expanded ? 'Hide Features' : 'See All Features'}
                        </p>

                        <AnimatedButton onClick={() => {
                            navigate("/steps", {
                                state: {
                                    freeTrial: true,
                                },
                            });
                        }} label='Subscribe' position={{ position: "relative" }} />


                    </div>

                </div>

            </FreeTrialModal>

            {/* Modal for custom plan  */}

            <FreeTrialModal
                isOpen={modalOpenCustom}
                onClose={() => {
                    setIsModalOpenCustom(false);
                    setCustomPlan(false);
                }}>
                <div className={styles.freeTrialMain}>
                    <div className={styles.Topsection}>
                        <h1>FREE TRIAL</h1>
                        <p>No Cost to Try Our Agents</p>
                        <text>Explore our agents and viability for your business at <b className={styles.boldText}>“NO COST”.</b></text>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="200"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                    <label>
                        Value: <strong>{value}</strong>
                    </label>
                    <br />
                    <div className={styles.featureList}>
                        <div className={styles.listdata}>
                            {visibleFeaturesCustom.map((text, index) => {
                                const isNegative = text.toLowerCase().includes('no');
                                return (
                                    <div className={styles.liData} key={index}>
                                        <img
                                            src={isNegative ? '/svg/cross-svg.svg' : '/svg/tick-svg.svg'}
                                            alt={isNegative ? 'cross icon' : 'tick icon'}
                                        />
                                        <p>{text}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <p className={styles.toggleText} onClick={handleToggleCustom}>
                            ~ {expandedCustom ? 'Hide Features' : 'See All Features'}
                        </p>

                        <AnimatedButton onClick={tierCheckout} label='Subscribe' position={{ position: "relative" }} />


                    </div>

                </div>

            </FreeTrialModal>

            {/*  */}

            <div className={styles.ForSticky}>
                <div className={styles.footerButtons}>

                    {products.map((plan, index) => {
                        const isYearly = toggleStates[plan.id];
                        // const interval = isYearly ? "year" : ;
                        const interval = "year"
                        const selectedPrice = plan.prices.find(p => p.interval === interval);
                        const symbol = getCurrencySymbol(selectedPrice?.currency || userCurrency);
                        const amount = selectedPrice ? (selectedPrice.unit_amount / 100 / 12).toFixed(0) : "0";

                        return (
                            <div
                                key={plan.id}
                                className={styles.navBox}
                                onClick={() => {
                                    setActiveIndex(index);
                                    sliderRef.current.slickGoTo(index);
                                }}
                            >
                                <input
                                    type="radio"
                                    name="plan"
                                    checked={activeIndex === index}
                                    onChange={() => setActiveIndex(index)}
                                    className={styles.radiobtn}
                                />

                                {plan.title === "Starter" ? <img src="/svg/starter-icon.svg" /> : null}
                                {plan.title === "Scaler" ? <img src="/svg/scaler-icon.svg" /> : null}
                                {plan.title === "Growth" ? <img src="/svg/growth-icon.svg" /> : null}
                                {plan.title === "Corporate" ? <img src="/svg/corporate-icon.svg" /> : null}

                                <button
                                    className={`${styles.footerBtn} ${styles[plan.color]} ${index === activeIndex ? styles.active : ""
                                        }`}
                                >
                                    {plan.title}
                                </button>

                                <p className={`${styles.footerBtn} $ ${styles[plan.color]}  ${styles.extraClass} ${index === activeIndex ? styles.active : ""
                                    }`}>
                                    from {symbol}{formatPrice(amount)}/m
                                    {/* {interval === "year" ? "yr" : "m"} */}
                                </p>
                            </div>
                        );
                    })}

                </div>
            </div>
        </div>
    );
};

export default SubscriptionPlan;
