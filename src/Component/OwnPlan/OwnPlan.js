import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderBar from "../HeaderBar/HeaderBar";
import styles from "../OwnPlan/OwnPlan.module.css";
import decodeToken from "../../lib/decodeToken";
import AnimatedButton from "../AnimatedButton/AnimatedButton";

const OwnPlan = () => {
  const [billingType, setBillingType] = useState("monthly");
  const [value, setValue] = useState(25); // start at 25
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const token = localStorage.getItem("token") || "";
  const decodeTokenData = decodeToken(token);
  const userId = decodeTokenData?.id || "";

  const handleChange = (e) => {
    setValue(Number(e.target.value));
  };

  // 🔹 Update blue track fill
  useEffect(() => {
    const percent = ((value - 25) / (1000 - 25)) * 100;
    document.documentElement.style.setProperty("--range-percent", `${percent}%`);
  }, [value]);

  // 🔹 Pricing logic
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

  // 🔹 Checkout API integration
  const tierCheckout = async () => {
    try {
      const origin = window.location.origin;
      const queryParams = new URLSearchParams();
      queryParams.append("mode", "create");
      if (userId) queryParams.append("userId", userId);

      const url = `${origin}/steps?${queryParams.toString()}`;

      const res = await axios.post(`${API_BASE}/tier/checkout`, {
        customerId: decodeTokenData?.customerId,
        presetUnits: value,
        minUnits: 0,
        maxUnits: 200,
        successUrl: url,
        cancelUrl: `${origin}/cancel-payment`,
        userId: userId,
        priceId: "price_1RypKj4T6s9Z2zBzesn9ijNz",
      });

      if (res?.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong during checkout. Please try again.");
    }
  };

  return (
    <div className={styles.CutomPanMain}>
      <HeaderBar title="Build your own plan" />
      <div className={styles.pricingBox}>
        {/* Toggle */}
        <div className={styles.toggleTabs}>
          <div
            className={`${styles.tab} ${
              billingType === "monthly" ? styles.active : ""
            }`}
            onClick={() => setBillingType("monthly")}
          >
            <p className={styles.label}>Monthly</p>
            <h3 className={styles.price}>${todayPay}</h3>
            <p className={styles.subText}>/month per agent</p>
          </div>
        </div>

        {/* Slider */}
        <div className={styles.sliderBox}>
          <p className={styles.label2}>Select the range that fits your plan.</p>
          <p className={styles.popular}>- Most Popular</p>

          <div className={styles.rangeWrapper}>
            <input
              type="range"
              min="25"
              max="1000"
              step="25"
              value={value}
              onChange={handleChange}
              className={styles.range}
            />

            <div
              className={styles.tooltip}
              style={{
                left: `calc(${((value - 25) / (1000 - 25)) * 100}% )`,
              }}
            >
              {value}
            </div>
          </div>
        </div>

        {/* Payment Info */}
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

          {/* Why Box */}
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
          <div className={styles.AnimationBtnDiv} onClick={tierCheckout}>
            <AnimatedButton label="Subscribe" position={{ position: "relative" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnPlan;
