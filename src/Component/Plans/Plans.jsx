import React, { useState, useEffect } from "react";
import styles from "./Plans.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const Plan = ({ agentID, locationPath }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(null);
  const [selectedTab, setSelectedTab] = useState("month");
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [userCurrency, setUserCurrency] = useState("usd");

  const navigate = useNavigate();
  const location = useLocation();

  // Get user's currency based on IP
  useEffect(() => {
    const getLocationCurrency = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        setUserCurrency(mapCountryToCurrency(data.country));
      } catch (error) {
        console.error("Error getting location:", error);
        setUserCurrency("usd");
      }
    };

    const mapCountryToCurrency = (countryCode) => {
      const countryCurrencyMap = {
        IN: "inr",
        US: "usd",
        CA: "cad",
        AU: "aud",
        GB: "gbp",
        // Add more mappings as needed
      };
      return countryCurrencyMap[countryCode] || "usd";
    };

    getLocationCurrency();
  }, []);

  // Fetch plans
  useEffect(() => {
    if (!userCurrency) return;

    fetch(`${API_BASE}/products`)
      .then((res) => res.json())
      .then((data) => {
        const freeTrial = {
          id: "free-trial",
          name: "Free Trial",
          description: "Try all features free — includes 20 minutes",
          prices: [],
          metadata: { minutes: 20 },
        };
const customPan = {
    id: "free-trial",
          name: "Custom Plan",
          description: "Try all features free — includes 20 minutes",
          prices: [],
          metadata: { minutes: 20 },

}
        const currencyFilteredProducts = data.map((product) => {
          const matchedData = product.data?.data?.find(
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

          return {
            ...product,
            metadata: matchedData?.metadata || {},
            prices: enrichedPrices,
          };
        });

        setProducts([freeTrial, customPan,...currencyFilteredProducts]);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load plans.");
        setLoading(false);
      });
  }, [userCurrency]);

  const toggleAccordion = (id) => {
    setOpen(open === id ? null : id);
  };

  const filterPlansByInterval = (interval) => {
    return products
      .map((product) => {
        if (product.id === "free-trial") return product;

        const filteredPrices = product.prices.filter(
          (price) => price.interval === interval
        );

        if (filteredPrices.length > 0) {
          return {
            ...product,
            prices: filteredPrices,
          };
        }

        return null;
      })
      .filter((product) => product !== null);
  };

  if (loading)
    return (
      <p className={styles.status}>
        <Loader />
      </p>
    );
  if (error) return <p className={styles.statusError}>{error}</p>;

  return (
    <div className={styles.hero_sec}>
      <div className={styles.container}>
        <div className={styles.headerCOntro}>
          <div className={styles.header}>
            <div className={styles.icon}>
              <img src="images/inlogo.png" alt="inlogo" />
            </div>
            <div className={styles.headercontent}>
              <h3>Select Your Plan</h3>
              <p>Customizable payment structures</p>
            </div>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tabButton} ${
                selectedTab === "month" ? styles.active : ""
              }`}
              onClick={() => {
                setSelectedTab("month");
                setSelected(null);
                setSelectedPrice(null);
              }}
            >
              Monthly
            </button>
            <button
              className={`${styles.tabButton} ${
                selectedTab === "year" ? styles.active : ""
              }`}
              onClick={() => {
                setSelectedTab("year");
                setSelected(null);
                setSelectedPrice(null);
              }}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Display Plans */}
        {filterPlansByInterval(selectedTab).map((product) => (
          <div
            key={product.id}
            className={`${styles.planBox} ${
              selected === product.id ? styles.selected : ""
            }`}
            onClick={() => {
              setSelected(product.id);
              if (product.prices.length === 1) {
                const price = product.prices[0];
                setSelectedPrice({
                  id: price.id,
                  amount: (price.unit_amount / 100).toFixed(2),
                  rawAmount: price.unit_amount,
                  currency: price.currency,
                  interval: price.interval,
                });
              }
            }}
          >
            <div className={styles.part1}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="plan"
                  value={product.id}
                  checked={selected === product.id}
                  onChange={() => setSelected(product.id)}
                />
                <div className={styles.planContent}>
                  <div className={styles.planTitle}>
                    <div>
                      <p>{product.name}</p>
                      <span className={styles.description}>
                        {product.description}
                      </span>
                    </div>
                    {product.metadata.badge && (
                      <span className={styles.badge}>
                        {product.metadata.badge}
                      </span>
                    )}
                  </div>
                </div>
              </label>

              <img
                src={open === product.id ? "/svg/up.svg" : "/svg/down.svg"}
                alt="Toggle Arrow"
                className={`${styles.arrowIcon} ${
                  open === product.id ? styles.rotated : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAccordion(product.id);
                }}
              />
            </div>

            <div
              className={`${styles.accordion} ${
                open === product.id ? styles.open : ""
              }`}
            >
              {product.id === "free-trial" && product.metadata.minutes && (
                <p>
                  Includes <strong>{product.metadata.minutes}</strong> minutes / month
                </p>
              )}

              {product.id !== "free-trial" &&
                product.prices.length > 0 &&
                product.prices[0].metadata && (
                  <p>
                    Includes <strong>{product.prices[0].metadata}</strong> minutes / month
                  </p>
                )}
{/* 
hhh hsyyry  */}
              <div className={styles.pricesContainer}>
                {product.prices.map((price) => (
                  <div
                    key={price.id}
                    className={`${styles.priceOption} ${
                      selectedPrice?.id === price.id ? styles.activePrice : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(product.id);
                      setSelectedPrice({
                        id: price.id,
                        amount: (price.unit_amount / 100).toFixed(2),
                        rawAmount: price.unit_amount,
                        currency: price.currency,
                        interval: price.interval,
                      });
                    }}
                  >
                    {(price.unit_amount / 100).toFixed(2)}{" "}
                    {price.currency.toUpperCase()} / {price.interval}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Continue button */}
        <div className={styles.bottomBtn}>
          <div
            className={styles.btnTheme}
            onClick={() => {
              if (selected) {
                if (selected === "free-trial") {
                  navigate("/steps", {
                    state: {
                      freeTrial: true,
                    },
                  });
                } else if (selectedPrice) {
                  navigate("/checkout", {
                    state: {
                      priceId: selectedPrice.id,
                      agentId: agentID,
                      locationPath1: locationPath,
                      price: selectedPrice.amount,
                      interval: selectedPrice.interval,
                    },
                  });
                } else {
                  alert("Please select a specific plan duration (monthly/yearly)");
                }
              } else {
                alert("Please select a plan first");
              }
            }}
          >
            <img src="svg/svg-theme.svg" alt="" />
            <p>Continue</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plan;
