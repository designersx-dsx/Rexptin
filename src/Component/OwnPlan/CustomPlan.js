import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderBar from "../HeaderBar/HeaderBar";
import styles from "../OwnPlan/OwnPlan.module.css";
import decodeToken from "../../lib/decodeToken";
import { useNavigate, useLocation } from "react-router-dom";
import AnimatedButton from "../AnimatedButton/AnimatedButton";

const CustomPlan = () => {
  const [billingType, setBillingType] = useState("monthly");

  // 🔹 0–1000 with gap of 25
 const steps = Array.from({ length: 40 }, (_, i) => (i + 1) * 25);
  const [index, setIndex] = useState(0);

  const value = steps[index];

  const handleChange = (e) => {
    setIndex(Number(e.target.value));
  };

  // Update filled track
  useEffect(() => {
    const percent = (index / (steps.length - 1)) * 100;
    document.documentElement.style.setProperty("--range-percent", `${percent}%`);
  }, [index, steps]);

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const token = localStorage.getItem("token") || "";
  const decodeTokenData = decodeToken(token);

  const navigate = useNavigate();
  const location = useLocation();
  let agentID = location?.state?.agentID;
  let locationPath = location?.state?.locationPath;

  const userId = decodeTokenData?.id || "";

  // 🔹 Pricing Logic (example only)
  const calculatePrice = (qty) => {
    let unitPrice = 0;
    if (qty >= 1 && qty <= 50) {
      unitPrice = 0.41;
    } else if (qty >= 51 && qty <= 100) {
      unitPrice = 0.38;
    } else if (qty >= 101 && qty <= 150) {
      unitPrice = 0.36;
    } else if (qty >= 151 && qty <= 200) {
      unitPrice = 0.35;
    } else if (qty >= 201) {
      unitPrice = 0.35;
    }
    return (qty * unitPrice).toFixed(2);
  };

  const todayPay = calculatePrice(value);

  // Checkout API integration
  const tierCheckout = async () => {
    try {
      const queryParams = new URLSearchParams();
      const origin = window.location.origin;
      queryParams.append("mode", "create");
      if (userId) queryParams.append("userId", userId);

      const url = `${origin}/steps?${queryParams.toString()}`;

      const res = await axios.post(`${API_BASE}/tier/checkout`, {
        customerId: decodeTokenData?.customerId,
        presetUnits: value,
        minUnits: steps[0],
        maxUnits: steps[steps.length - 1],
        successUrl:
          window.location.origin +
          `/thankyou/update?agentId=${agentID}&userId=${decodeTokenData?.id}`,
        cancelUrl: `${origin}/cancel`,
        userId: userId,
        priceId: "price_1RypKj4T6s9Z2zBzesn9ijNz",
      });

      if (res?.data?.url) {
        window.location.href = res.data.url; // Redirect to checkout
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong during checkout. Please try again.");
    }
  };

  return (
    <>
      <div className={styles.CutomPanMain}>
        <HeaderBar title="Build your own plan" />
        <div className={styles.pricingBox}>
          <div className={styles.toggleTabs}>
            <div
              className={`${styles.tab} ${
                billingType === "monthly" ? styles.active : ""
              }`}
              onClick={() => setBillingType("monthly")}
            >
              <p className={styles.label}>Monthly</p>
              <h3 className={styles.price}> ${todayPay}</h3>
              <p className={styles.subText}>/month per agent</p>
            </div>
          </div>

          <div className={styles.sliderBox}>
            <p className={styles.label2}>
              Choose the attendee limit for your plan
            </p>
            <p className={styles.popular}>Most Popular</p>

            <div className={styles.rangeWrapper}>
              <input
                type="range"
                min={0}
                max={steps.length - 1}
                step={1}
                value={index}
                onChange={handleChange}
                className={styles.range}
              />

              <div
                className={styles.tooltip}
                style={{
                  left: `calc(${(index / (steps.length - 1)) * 100}% )`,
                }}
              >
                {value}
              </div>
            </div>

            {/* Labels under slider (optional) */}
            <div className={styles.labels}>
              {/* {steps.map((step, i) => (
                <span key={step}>{step}</span>
              ))} */}
            </div>
          </div>

          <div className={styles.customPlanBox}>
            <div className={styles.paymentBox}>
              <p className={styles.subTextMinuts}>~Minutes</p>
              <hr />
              <div className={styles.paymentRow}>
                <span className={styles.payTitle}>Today you pay</span>
                <span className={styles.payAmount}>${todayPay}</span>
              </div>
              <p className={styles.priceInfo}>Based on selected quantity</p>
              <hr />
            </div>

            <div className={styles.whyBox}>
              <h3 className={styles.heading}>Why Choose a Custom Plan?</h3>

              <div className={styles.feature}>
                <img src="/svg/flexibility.svg" alt="flexibility" />
                <div>
                  <h4>Ultimate Flexibility</h4>
                  <p>Only pay for the minutes you need.</p>
                </div>
              </div>

              <div className={styles.feature}>
                <img src="svg/cost-effective.svg" alt="cost-effective" />
                <div>
                  <h4>Cost-Effective</h4>
                  <p>Avoid paying for unused minutes.</p>
                </div>
              </div>

              <div className={styles.feature}>
                <img src="svg/total-control.svg" alt="total-control" />
                <div>
                  <h4>Total Control</h4>
                  <p>Take charge of your budget.</p>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <div
              className={styles.AnimationBtnDiv}
              onClick={() => {
                if (locationPath === "/dashboard") {
                  tierCheckout();
                } else {
                  navigate("/steps", {
                    state: {
                      plan: "tierPlan",
                      value: value,
                    },
                  });
                }
              }}
            >
              <AnimatedButton
                label="Subscribe"
                position={{ position: "relative" }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomPlan;
