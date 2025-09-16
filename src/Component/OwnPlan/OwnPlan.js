import React, { useState, useEffect } from "react";
import HeaderBar from "../HeaderBar/HeaderBar";
import styles from "../OwnPlan/OwnPlan.module.css";

const OwnPlan = () => {
  const [billingType, setBillingType] = useState("monthly");
  const steps = [50, 100, 200, 300, 500, 750, 1000];
  const [value, setValue] = useState(300);

  const handleChange = (e) => {
    setValue(Number(e.target.value));
  };

  // Update CSS variable for smooth filled track
  useEffect(() => {
    const percent = ((value - 50) / (1000 - 50)) * 100;
    document.documentElement.style.setProperty("--range-percent", `${percent}%`);
  }, [value]);

  return (
    <>
      <HeaderBar title="Build your own plan" />
      <div className={styles.pricingBox}>
        <div className={styles.toggleTabs}>
          {/* Sliding Indicator */}
          <div
            className={`${styles.activeIndicator} ${billingType === "yearly" ? styles.left : styles.right
              }`}
          />

          {/* Yearly Tab */}
          <div
            className={`${styles.tab} ${billingType === "yearly" ? styles.active : ""
              }`}
            onClick={() => setBillingType("yearly")}
          >
            <p className={styles.label}>Yearly</p>
            <h3 className={styles.price}>$30.00</h3>
            <p className={styles.subText}>/month per agent</p>
            <span className={styles.saveTag}>Save up to 20% yearly</span>
          </div>

          {/* Monthly Tab */}
          <div
            className={`${styles.tab} ${billingType === "monthly" ? styles.active : ""
              }`}
            onClick={() => setBillingType("monthly")}
          >
            <p className={styles.label}>Monthly</p>
            <h3 className={styles.price}>$99.00</h3>
            <p className={styles.subText}>/month per agent</p>
          </div>
        </div>


        {/* Price Slider  */}
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

            {/* Tooltip above thumb */}
            <div
              className={styles.tooltip}
              style={{
                left: `calc(${((value - 50) / (1000 - 50)) * 100}% )`,
              }}
            >
              {value}
            </div>
          </div>

          {/* Labels below range */}
          <div className={styles.labels}>
            {steps.map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
        </div>


        <div className={styles.customPlanBox}>
          {/* Payment Section */}
          <div className={styles.paymentBox}>
            <p className={styles.subTextMinuts}>~Minutes</p>
            <hr />
            <div className={styles.paymentRow}>
              <span className={styles.payTitle}>Today you pay</span>
              <span className={styles.payAmount}>$150</span>
            </div>
            <p className={styles.priceInfo}>$99/months</p>
            <hr />
          </div>

          {/* Why Choose Section */}
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
        </div>


      </div>
    </>
  );
};

export default OwnPlan;
