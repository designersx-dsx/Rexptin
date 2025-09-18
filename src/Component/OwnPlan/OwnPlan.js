import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderBar from "../HeaderBar/HeaderBar";
import styles from "../OwnPlan/OwnPlan.module.css";
import decodeToken from "../../lib/decodeToken";

const OwnPlan = () => {
  const [billingType, setBillingType] = useState("monthly");
  const steps = [50, 100, 200, 300, 500, 750, 1000];
  const [value, setValue] = useState(300);
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  // Example: retrieve these from localStorage or context
  const token = localStorage.getItem("token") || "";
  const decodeTokenData = decodeToken(token);

  const handleChange = (e) => {
    setValue(Number(e.target.value));
  };

  // Update CSS variable for smooth filled track
  useEffect(() => {
    const percent = ((value - 50) / (1000 - 50)) * 100;
    document.documentElement.style.setProperty(
      "--range-percent",
      `${percent}%`
    );
  }, [value]);

  const userId = decodeTokenData?.id || "";

  // 🔹 Pricing Logic based on Tiers
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
        minUnits: 0,
        maxUnits: 200,
        successUrl: url,
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
      <HeaderBar title="Build your own plan" />
      <div className={styles.pricingBox}>
        <div className={styles.toggleTabs}>
          {/* <div
            className={`${styles.activeIndicator} ${
              billingType === "yearly" ? styles.left : styles.right
            }`}
          />

          <div
            className={`${styles.tab} ${
              billingType === "yearly" ? styles.active : ""
            }`}
            onClick={() => setBillingType("yearly")}
          >
            <p className={styles.label}>Yearly</p>
            <h3 className={styles.price}>$30.00</h3>
            <p className={styles.subText}>/month per agent</p>
            <span className={styles.saveTag}>Save up to 20% yearly</span>
          </div> */}

          <div
            className={`${styles.tab} ${
              billingType === "monthly" ? styles.active : ""
            }`}
            onClick={() => setBillingType("monthly")}
          >
            <p className={styles.label}>Monthly</p>
            <h3 className={styles.price}>${value}</h3>
            <p className={styles.subText}>/month per agent</p>
          </div>
        </div>

        <div className={styles.sliderBox}>
          <p className={styles.label2}>Select the range that fits your plan.</p>
          <p className={styles.popular}>- Most Popular</p>

          <div className={styles.rangeWrapper}>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={value}
              onChange={handleChange}
              className={styles.range}
            />

            <div
              className={styles.tooltip}
              style={{
                left: `calc(${((value - 50) / (1000 - 50)) * 100}% )`,
              }}
            >
              {value}
            </div>
          </div>

          <div className={styles.labels}>
            {steps.map((step) => (
              <span key={step}>{step}</span>
            ))}
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
          <button className={styles.checkoutButton} onClick={tierCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  );
};

export default OwnPlan;
