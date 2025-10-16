import React, { useState, useEffect } from 'react';
import HeaderBar from '../HeaderBar/HeaderBar';
import styles from '../MessagePlan/MessagePlan.module.css';
import AnimatedButton from '../AnimatedButton/AnimatedButton';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import decodeToken from "../../lib/decodeToken";
import { API_BASE_URL } from '../../Store/apiStore';

const MessagePlan = () => {
 
  const [activePack, setActivePack] = useState("2.5k");
  const [price, setPrice] = useState(0);
  const location = useLocation();
  let agent = location.state.agent;
   let system = location.state.system;
const min = 500;
  const max = 99000;
  const initialValue = system 
    ? Math.max(agent?.agent?.messagePurchase || min, min)  // use purchased messages if system
    : 2450; // your default for new purchase

const [value, setValue] = useState(initialValue);
  
  
   console.log({agent})
     const packs = [
    { label: "1k", value: 1000 },
    { label: "2.5k", value: 2500 },
    { label: "5k", value: 5000 },
    { label: "10k", value: 10000 },
    { label: "20k", value: 20000 },
    { label: "50k", value: 50000 },
    { label: "75k", value: 75000 },
  ];

  const token = localStorage.getItem("token") || "";
  const decodeTokenData = decodeToken(token);

  // 🟣 Tiered price per message logic
  const getPricePerMessage = (qty) => {
    if (qty <= 100) return 0.3;
    if (qty <= 200) return 0.29;
    if (qty <= 300) return 0.28;
    if (qty <= 400) return 0.26;
    if (qty <= 500) return 0.24;
    if (qty <= 600) return 0.22;
    return 0.2;
  };

  // 🟣 Calculate price when value changes
  useEffect(() => {
    const perMsg = getPricePerMessage(value);
    const total = value * perMsg;
    setPrice(total.toFixed(2));
  }, [value]);

  const msGcheckout = async () => {
    try {
      const agentId = sessionStorage.getItem("SelectAgentId");
      if (!agentId) throw new Error("Agent ID not found in sessionStorage");
sessionStorage.setItem("agentName" , agent?.agent?.agentName)
       sessionStorage.setItem("AgentCode" , agent?.agent?.agentCode)
       sessionStorage.setItem("bussinessName" , agent?.business?.businessName)
      const response = await axios.post(`${API_BASE_URL}/message`, {
        customerId: decodeTokenData?.customerId,
        units: value,
        agentId,
        userId: agent?.agent?.userId,
        url : window.location.origin + `/thankyou/msgPlan?agentId=${agentId}` , 
        cancelUrl : window.location.origin + "/cancel-payment"
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        console.error("No URL returned from API:", response.data);
      }
    } catch (error) {
      console.error("❌ Error in msGcheckout:", error);
    }
  };


    const msGcheckoutUpgarde = async () => {
    try {
      const agentId = sessionStorage.getItem("SelectAgentId");
      if (!agentId) throw new Error("Agent ID not found in sessionStorage");
       sessionStorage.setItem("agentName" , agent?.agent?.agentName)
       sessionStorage.setItem("AgentCode" , agent?.agent?.agentCode)
       sessionStorage.setItem("bussinessName" , agent?.business?.businessName)
       sessionStorage.setItem("oldSubsId" , agent?.agent?.msgSubscriptionId)
      const response = await axios.post(`${API_BASE_URL}/upgrade-msg-plan`, {
        customerId: decodeTokenData?.customerId,
        units: value,
        agentId,
        userId: agent?.agent?.userId,
        oldSubscriptionId : agent?.agent?.msgSubscriptionId , 
        url : window.location.origin + `/thankyou/msgPlan?agentId=${agentId}` , 
        cancelUrl : window.location.origin + "/cancel-payment"
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        console.error("No URL returned from API:", response.data);
      }
    } catch (error) {
      console.error("❌ Error in msGcheckout:", error);
    }
  };
  const formatValue = (num, isTooltip = false) => {
    if (num >= 1000) {
      const value = (num / 1000).toFixed(1);
      return (
        <span>
          {value}
          {!isTooltip && <span style={{ fontSize: '40px' }}>K</span>}
          {isTooltip && 'K'}
        </span>
      );
    }
    return num;
  };


  const progress = ((value - min) / (max - min)) * 100;

const purchasedMessages = system ? (agent?.agent?.messagePurchase || min) : min;

const handleSliderChange = (e) => {
  let newValue = Number(e.target.value);

  // Prevent downgrade if system is true
  if (system && newValue < purchasedMessages) {
    newValue = purchasedMessages;
  }

  setValue(newValue);
};
  const handlePackClick = (packValue, packLabel) => {
    setValue(packValue);
    setActivePack(packLabel);
  };

  // 🟣 Auto-highlight active pack
  useEffect(() => {
    const nearestPack = packs.find((p) => Math.abs(p.value - value) <= 500);
    if (nearestPack) setActivePack(nearestPack.label);
    else setActivePack(null);
  }, [value]);

  return (
    <div className={styles.containerBox}>
      <HeaderBar title="Message Plan" />
      <div className={styles.planContainer}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.planBox}>
            <p className={styles.planLabel}>Voice Agent Plan</p>
            <h2 className={styles.planName}>{agent?.agent?.agentPlan}</h2>
          </div>
          <div className={styles.totalBox}>
            <p className={styles.planLabel}>Total Messages</p>
           <h2 className={styles.planValue}>
  {agent?.agent?.agentPlan === "free"
    ? value >= 1000
      ? (value / 1000).toFixed(1) + "K"
      : value
    : (value + (agent?.agent?.messageLeft || 0)) >= 1000
    ? ((value + (agent?.agent?.messageLeft || 0)) / 1000).toFixed(1) + "K"
    : value + (agent?.agent?.messageLeft || 0)
  } 
  <span>Per month</span>
</h2>
          </div>
        </div>

        {/* Bill Section */}
        <div className={styles.billBox}>
          <div>
            <p className={styles.planLabel2}>Estimated Monthly Bill</p>
            <h2 className={styles.billValue}>
              ${price} <span>Per month</span>
            </h2>
          </div>
          <button className={styles.webChatTag}>For Web Chat</button>
        </div>

        {/* Popular Packs */}
        <div className={styles.popularSection}>
          <h3>Popular Message Packs</h3>
          <div className={styles.packButtons}>
            {packs.map((pack, i) => (
              <button
                key={i}
                onClick={() => handlePackClick(pack.value, pack.label)}
                className={`${styles.packBtn} ${
                  activePack === pack.label ? styles.activePack : ''
                }`}
              >
                <p>
                  {pack.label} <span>sms</span>
                </p>
              </button>
            ))}
          </div>
          <p className={styles.packHint}>
            Choose popular packs or define using the slider below
          </p>
        </div>

        {/* Slider Section */}
        <div className={styles.sliderSection}>
          <h1 className={styles.sliderValue}>{formatValue(value)}</h1>
          <p className={styles.sliderText}>Messages per month</p>

          <div className={styles.sliderWrapper}>
          <input
  type="range"
  min={min}
  max={max}
  value={value}
  className={styles.slider}
  onChange={handleSliderChange}
  style={{
    background: `linear-gradient(to right, #a855f7, #6524EB ${progress}%, #fff ${progress}%)`,
    border: '1px solid #CDCDCD',
    borderRadius: '5px',
    outline: 'none',
  }}
/>
            <div
              className={styles.sliderTooltip}
              style={{
                left: `${((value - min) / (max - min)) * 100}%`,
              }}
            >
              {formatValue(value, true)}
            </div>
          </div>

          <div className={styles.sliderLabels}>
            <span>500</span>
            <span>99K</span>
          </div>
          <p className={styles.rangeHint}>
            <b>Select the range</b> that fits your website traffic needs.
          </p>
        </div>

        <div className={styles.PurchaseBtn} onClick={system ?  msGcheckoutUpgarde : msGcheckout}>
          <AnimatedButton
            label="Confirm PURCHASE"
            position={{ position: 'relative' }}
          />
          <p className={styles.NeedmOre}>Need more? Get in Touch with us!</p>
        </div>
      </div>
    </div>
  );
};

export default MessagePlan;
