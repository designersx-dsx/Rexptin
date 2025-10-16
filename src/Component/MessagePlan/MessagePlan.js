import React, { useState, useEffect } from 'react';
import HeaderBar from '../HeaderBar/HeaderBar';
import styles from '../MessagePlan/MessagePlan.module.css';
import AnimatedButton from '../AnimatedButton/AnimatedButton';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import decodeToken from "../../lib/decodeToken";
import { API_BASE_URL } from '../../Store/apiStore';

const MessagePlan = () => {
  const [value, setValue] = useState(2450);
  const [activePack, setActivePack] = useState("2.5k");
  const [price, setPrice] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const location = useLocation();
  let agent = location.state?.agent;
  let system = location.state?.system;
  console.log({ agent, system });

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

  const planName = agent?.agent?.agentPlan || '';
  const messageLeft = Number(agent?.agent?.messageLeft || 0);
  const msgPurchases = Number(agent?.agent?.messagePurchase
 || 0);
  const msgSubscriptionId = agent?.agent?.msgSubscriptionId || null;

  const currentPurchased = msgPurchases;
  const globalMin = 500;
  const min = system ? Math.max(globalMin, currentPurchased) : globalMin;
  const max = 99000;
  const step = 500;

  // initialize slider
  useEffect(() => {
    if (system && currentPurchased > 0) {
      setValue(currentPurchased);
      setShowWarning(true);
    } else {
      setValue(2450);
    }
  }, [system, currentPurchased]);

  // Tiered pricing logic
  const getPricePerMessage = (qty) => {
    if (qty <= 100) return 0.3;
    if (qty <= 200) return 0.29;
    if (qty <= 300) return 0.28;
    if (qty <= 400) return 0.26;
    if (qty <= 500) return 0.24;
    if (qty <= 600) return 0.22;
    return 0.2;
  };

  useEffect(() => {
    const perMsg = getPricePerMessage(value);
    const total = value * perMsg;
    setPrice(total.toFixed(2));
  }, [value]);

  const msGcheckout = async () => {
    try {
      const agentId = sessionStorage.getItem("SelectAgentId");
      if (!agentId) throw new Error("Agent ID not found in sessionStorage");

      sessionStorage.setItem("agentName", agent?.agent?.agentName || "");
      sessionStorage.setItem("AgentCode", agent?.agent?.agentCode || "");
      sessionStorage.setItem("bussinessName", agent?.business?.businessName || "");

      const response = await axios.post(`${API_BASE_URL}/message`, {
        customerId: decodeTokenData?.customerId,
        units: value,
        agentId,
        userId: agent?.agent?.userId,
        url: window.location.origin + `/thankyou/msgPlan?agentId=${agentId}`,
        cancelUrl: window.location.origin + "/cancel-payment"
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("❌ Error in msGcheckout:", error);
    }
  };

  const msGcheckoutUpgarde = async () => {
    try {
      const agentId = sessionStorage.getItem("SelectAgentId");
      if (!agentId) throw new Error("Agent ID not found in sessionStorage");

      sessionStorage.setItem("agentName", agent?.agent?.agentName || "");
      sessionStorage.setItem("AgentCode", agent?.agent?.agentCode || "");
      sessionStorage.setItem("bussinessName", agent?.business?.businessName || "");
      sessionStorage.setItem("oldSubsId", msgSubscriptionId || "");

      const response = await axios.post(`${API_BASE_URL}/upgrade-msg-plan`, {
        customerId: decodeTokenData?.customerId,
        units: value,
        agentId,
        userId: agent?.agent?.userId,
        oldSubscriptionId: msgSubscriptionId,
        url: window.location.origin + `/thankyou/msgPlan?agentId=${agentId}`,
        cancelUrl: window.location.origin + "/cancel-payment"
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("❌ Error in msGcheckoutUpgarde:", error);
    }
  };

  const formatValue = (num, isTooltip = false) => {
    if (num >= 1000) {
      const valueK = (num / 1000).toFixed(1);
      return (
        <span>
          {valueK}
          {!isTooltip && <span style={{ fontSize: '40px' }}>K</span>}
          {isTooltip && 'K'}
        </span>
      );
    }
    return num;
  };

  const progress = ((value - min) / (max - min)) * 100;

  useEffect(() => {
    const nearestPack = packs.find((p) => Math.abs(p.value - value) <= 500);
    setActivePack(nearestPack ? nearestPack.label : null);
  }, [value]);

  const totalDisplayed =
    planName === "free" ? value : Number(messageLeft || 0) + Number(value || 0);

  const renderTotal = (num) => (num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num);

  const handlePackClick = (packValue, packLabel) => {
    if (system && packValue <= currentPurchased) {
      setShowWarning(true);
      setValue(currentPurchased);
      return;
    }
    setValue(packValue);
    setActivePack(packLabel);
    if (system && packValue > currentPurchased) setShowWarning(false);
  };

  const handleSliderChange = (e) => {
    const newValue = Number(e.target.value);
    if (system) {
      if (newValue <= currentPurchased) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    }
    setValue(newValue);
  };
const formattedPlanName = planName
  ? planName.charAt(0).toUpperCase() + planName.slice(1)
  : "";
  return (
    <div className={styles.containerBox}>
      <HeaderBar title="Message Plan" />
      <div className={styles.planContainer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.planBox}>
            <p className={styles.planLabel}>Voice Agent Plan</p>
            <h2 className={styles.planName}>{formattedPlanName}</h2>
          </div>
          <div className={styles.totalBox}>
            <p className={styles.planLabel}>Total Messages</p>
            <h2 className={styles.planValue}>
              {renderTotal(totalDisplayed)} <span>Per month</span>
            </h2>
          </div>
        </div>

        {/* Bill */}
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
                className={`${styles.packBtn} ${activePack === pack.label ? styles.activePack : ''}`}
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

        {/* Slider */}
        <div className={styles.sliderSection}>
          <h1 className={styles.sliderValue}>{formatValue(value)}</h1>
          <p className={styles.sliderText}>Messages per month</p>
          <div className={styles.sliderWrapper}>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={handleSliderChange}
              className={styles.slider}
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
            <span>{min}</span>
            <span>99K</span>
          </div>
          <p className={styles.rangeHint}>
            <b>Select the range</b> that fits your website traffic needs.
          </p>
        </div>

        {/* Warning Message */}
        {system && showWarning && (
          <p className={styles.warningMsg}>
            ⚠️ Please select a higher message count than your current purchased plan ({currentPurchased}).
          </p>
        )}

        {/* Purchase Button */}
        <div
          className={`${styles.PurchaseBtn} ${showWarning ? styles.disabledBtn : ''}`}
          onClick={!showWarning ? (system ? msGcheckoutUpgarde : msGcheckout) : undefined}
          role="button"
        >
          <AnimatedButton
            label="Confirm PURCHASE"
            position={{ position: 'relative' }}
            disabled={showWarning}
          />
          <p className={styles.NeedmOre}>Need more? Get in Touch with us!</p>
        </div>
      </div>
    </div>
  );
};

export default MessagePlan;
