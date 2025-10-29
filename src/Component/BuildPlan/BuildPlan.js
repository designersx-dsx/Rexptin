import React, { useState, useEffect } from 'react';
import styles from '../BuildPlan/BuildPlan.module.css';
import HeaderBar from '../HeaderBar/HeaderBar';
import AnimatedButton from '../AnimatedButton/AnimatedButton';
import decodeToken from "../../lib/decodeToken";
import { useNavigate , useLocation } from 'react-router-dom';
import axios from 'axios';
const BuildPlan = () => {
    const [price, setPrice] = useState(99);
    const [bill, setBill] = useState(55);
    const [plan, setPlan] = useState("STARTER");
    const [image, setImage] = useState("/svg/starter.svg");
    const [animate, setAnimate] = useState(false);

    const min = 99;
    const max = 10000;

const handleChange = (e) => {
  const qty = parseInt(e.target.value);
  setPrice(qty);

  let unitPrice = 0;
  let totalBill = 0;

  if (qty >= 1 && qty <= 100) {
    unitPrice = 0.50;
    totalBill = 5.00; // flat amount
  } else if (qty >= 101 && qty <= 200) {
    unitPrice = 0.45;
    totalBill = qty * unitPrice;
  } else if (qty >= 201 && qty <= 300) {
    unitPrice = 0.42;
    totalBill = qty * unitPrice;
  } else if (qty >= 301 && qty <= 1500) {
    unitPrice = 0.40;
    totalBill = qty * unitPrice;
  } else if (qty >= 1501 && qty <= 2000) {
    unitPrice = 0.38;
    totalBill = qty * unitPrice;
  } else if (qty >= 2001 && qty <= 2500) {
    unitPrice = 0.36;
    totalBill = qty * unitPrice;
  } else if (qty >= 2501 && qty <= 3000) {
    unitPrice = 0.35;
    totalBill = qty * unitPrice;
  } else if (qty >= 3001 && qty <= 3500) {
    unitPrice = 0.34;
    totalBill = qty * unitPrice;
  } else if (qty >= 3501) {
    unitPrice = 0.33;
    totalBill = qty * unitPrice;
  }

  setBill(totalBill.toFixed(2));
};

  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const location = useLocation();
  let agentID = location?.state?.agentID;
  let locationPath = location?.state?.locationPath
  let plans = location?.state?.plans

    let subscriptionID = location?.state?.subscriptionID
  console.log(locationPath);
  
  const token = localStorage.getItem("token") || "";
  const decodeTokenData = decodeToken(token);
    const progressPercent = ((price - min) / (max - min)) * 100;

    const formatValue = (val, isTooltip = false) => {
        if (val >= 1000) {
            return isTooltip ? `${(val / 1000).toFixed(1)}K` : `${(val / 1000).toFixed(1)}K`;
        }
        return isTooltip ? `${val}` : val;
    };

    useEffect(() => {
        let newPlan = "";
        let newImg = "";

        if (price < 248) {
            newPlan = "STARTER";
            newImg = "/svg/starter.svg";
        } else if (price < 498) {
            newPlan = "SCALER";
            newImg = "/svg/scaler.svg";
        } else if (price < 798) {
            newPlan = "GROWTH";
            newImg = "/svg/growth.svg";
        } else {
            newPlan = "CORPORATE";
            newImg = "/svg/corporate.svg";
        }

        // setBill((price / 2).toFixed(2));

        // Only change image and animate if plan actually changed
        if (newPlan !== plan) {
            setPlan(newPlan);
            setImage(newImg);
            setAnimate(true);
            setTimeout(() => setAnimate(false), 600);
        }
    }, [price, plan]);
  const userId = decodeTokenData?.id || "";
 const tierCheckout = async () => {
    try {
      const queryParams = new URLSearchParams();
      const origin = window.location.origin;
      queryParams.append("mode", "create");
      if (userId) queryParams.append("userId", userId);

      const url = `${origin}/steps?${queryParams.toString()}`;

      const res = await axios.post(`${API_BASE}/tier/checkout`, {
        customerId: decodeTokenData?.customerId,
        presetUnits: price,
        minUnits: 0,
        maxUnits: 10000,
        successUrl:
          window.location.origin +
          `/thankyou/update?agentId=${agentID}&userId=${decodeTokenData?.id}`,
        cancelUrl: `${origin}/cancel`,
        userId: userId,
       
      });

      if (res?.data?.url) {
        window.location.href = res.data.url; // Redirect to checkout
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong during checkout. Please try again.");
    }
  };

  const planPriceMap = {
    STARTER: "price_1RUNGj4T6s9Z2zBzHAWaIZz3",
    SCALER: "price_1RVXQI4T6s9Z2zBz3udYE9sO",
    GROWTH: "price_1RVXSV4T6s9Z2zBzpoLwTIzY",
    CORPORATE: "price_1RXgkd4T6s9Z2zBzxvVFBRMs"
  };
    const handlePlanCheckout = async () => {
    try {
        if(locationPath === "/dashboard") {
  const origin = window.location.origin;
      const priceId = planPriceMap[plan]; // current plan
      if (!priceId) throw new Error("Price ID not found for selected plan");
  
      const res = await axios.post(`${API_BASE}/create-checkout-session`, {
        customerId: decodeTokenData?.customerId,
        priceId,
        userId,
       
        url: `${origin}/thankyou/update?subscriptionId=${subscriptionID}&agentId=${agentID}&userId=${userId}`,
        cancelUrl: `${origin}/cancel-payment`,
      });
  
      if (res?.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      }
        }
        else{
            const priceId = planPriceMap[plan];
            sessionStorage.setItem("priceId" , priceId)
            sessionStorage.setItem("selectedPlan" ,plan )
            sessionStorage.setItem("selectedPlanInterval" , "month" )
            sessionStorage.setItem("price" , 100 )
            localStorage.setItem("allPlans" , JSON.stringify(plans) )

            navigate("/steps")



        }
    
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong during checkout. Please try again.");
    }
  };

    return (
        <div className={styles.containerBox}>
            <HeaderBar title="Build your own plan" />

            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.ellipseContainer}>
                        <img className={styles.ellipse1} src='/svg/Ellipse-build1.svg' alt='Ellipse1'/>
                        <img className={styles.ellipse2} src='/svg/Ellipse-build2.svg' alt='Ellipse2'/>
                    </div>

                    {/* Plan Image */}
                    <div className={`${styles.imageWrapper} ${animate ? styles.slideIn : ""}`} onClick={handlePlanCheckout}>
                        <img src={image} alt={plan} className={styles.planImage} />
                    </div>
                </div>

                {/* Bill Section */}
                <div className={styles.innercontainer}>
                <div className={styles.billBox}>
                    <div className={styles.customPlan}>
                        <p className={styles.BillText}>Estimated Monthly Bill</p>
                        <p className={styles.ButtonPlan}>Custom Voice Plan</p>
                    </div>
                    <h2 className={styles.billPrice}>${bill} <span>Per month</span></h2>
                </div>

                {/* Slider Section */}
                <div className={styles.sliderSection}>
                    <div className={styles.sliderWrapper}>
                        <input
                            type="range"
                            min={min}
                            max={max}
                            value={price}
                            onChange={handleChange}
                            className={styles.slider}
                            style={{
                                background: `linear-gradient(to right, #a855f7, #6524EB ${progressPercent}%, #e7e7e7 ${progressPercent}%)`,
                            }}
                        />
                        <div
                            className={styles.sliderTooltip}
                            style={{ left: `calc(${progressPercent}%)` }}
                        >
                            {formatValue(price, true)}m
                        </div>
                    </div>

                    <div className={styles.sliderLabels}>
                        <span>100</span>
                        <span>10K</span>
                    </div>
                    <p className={styles.rangeHint}>
                        <b>Select the range</b> that fits your website traffic needs.
                    </p>
                </div>
                <div className={styles.PurchaseBtn}  onClick={() => {
                if (locationPath === "/dashboard") {
                  tierCheckout();
                } else {
                  navigate("/steps", {
                    state: {
                      plan: "tierPlan",
                      value: price,
                    },
                  });
                }
              }}>
                    <AnimatedButton
                        label="Confirm PURCHASE"
                        position={{ position: 'relative' }}
                    />
                    <p className={styles.NeedmOre}>Need more? Get in Touch with us!</p>
                </div>
                </div>
            </div>
        </div>
    );
};

export default BuildPlan;
