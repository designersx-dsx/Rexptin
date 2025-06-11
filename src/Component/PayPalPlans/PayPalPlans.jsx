import React, { useState, useEffect } from "react";
import styles from "../Plans/Plans.module.css";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const PayPalPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [billingInterval, setBillingInterval] = useState("monthly");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/p-get-plans`)
      .then((res) => res.json())
      .then((data) => {
        if (data.plans) {
          setPlans(data.plans);
        } else {
          setError("No plans found");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load plans.");
        setLoading(false);
      });
  }, []);

  const extractMinutes = (desc = "") => {
    const match = desc.match(/mins\s*=\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : 0;
  };

  const filteredPlans = plans.filter((plan) => {
    const nameLower = plan.name.toLowerCase();
    return billingInterval === "monthly"
      ? nameLower.includes("monthly")
      : nameLower.includes("yearly");
  });

  if (loading)
    return (
      <p className={styles.status}>
        <Loader />
      </p>
    );
  if (error) return <p className={styles.statusError}>{error}</p>;

  return (
    <div className={styles.hero_sec}>
      <div className={styles.welcomeTitle}>
        <h1>Sign In For New User</h1>
      </div>

      {/* Monthly / Yearly Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${
            billingInterval === "monthly" ? styles.activeTab : ""
          }`}
          onClick={() => setBillingInterval("monthly")}
        >
          Monthly
        </button>
        <button
          className={`${styles.tabButton} ${
            billingInterval === "yearly" ? styles.activeTab : ""
          }`}
          onClick={() => setBillingInterval("yearly")}
        >
          Yearly
        </button>
      </div>

      <div className={styles.container}>
        {/* Free Trial Plan */}
        <div
          className={`${styles.planBox} ${
            selected === "free-trial" ? styles.selected : ""
          }`}
          onClick={() => setSelected("free-trial")}
        >
          <div className={styles.part1}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="plan"
                value="free-trial"
                checked={selected === "free-trial"}
                onChange={() => setSelected("free-trial")}
              />
              <div className={styles.planContent}>
                <div className={styles.planTitle}>
                  <div>
                    <p>Free Trial</p>
                    <span className={styles.description}>
                      Try all features free — includes 10 minutes
                    </span>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Paid Plans */}
        {filteredPlans.map((plan) => {
          const price = parseFloat(plan.price.value);
          const currency = plan.price.currency_code;
          const description = plan.product.description || "";
          const planName = plan?.product?.name;

          const totalMinutes = extractMinutes(description);
          const monthlyPrice = billingInterval === "yearly" ? price : price;
          const monthlyMinutes =
            billingInterval === "yearly"
              ? Math.floor(totalMinutes)
              : totalMinutes;

          return (
            <div
              key={plan.id}
              className={`${styles.planBox} ${
                selected === plan.id ? styles.selected : ""
              }`}
              onClick={() => setSelected(plan.id)}
            >
              <div className={styles.part1}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="plan"
                    value={plan.id}
                    checked={selected === plan.id}
                    onChange={() => setSelected(plan.id)}
                  />
                  <div className={styles.planContent}>
                    <div className={styles.planTitle}>
                      <div>
                        <p>{planName}</p>
                        <span className={styles.description}>
                          {description.split(",")[0]}
                        </span>
                      </div>
                    </div>
                    <div className={styles.planData}>
                      <p>
                        Price:{" "}
                        <strong>
                          {monthlyPrice.toFixed(2)} {currency}
                        </strong>{" "}
                        / month
                      </p>
                      <p>
                        <strong>{monthlyMinutes}</strong> minutes included
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Button */}
      <div className={styles.bottomBtn}>
        <div
          className={styles.btnTheme}
          onClick={() => {
            if (selected) {
              if (selected === "free-trial") {
                navigate("/signup");
              } else {
                navigate("/checkout", { state: { priceId: selected } });
              }
            } else {
              alert("Please select a plan first");
            }
          }}
        >
          <img src="svg/svg-theme.svg" alt="" />
          <p>Continue</p>
        </div>

        <div className={styles.loginBox}>
          <p>
            Already have an account?{" "}
            <span
              className={styles.loginLink}
              onClick={() => navigate("/signup")}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PayPalPlans;
