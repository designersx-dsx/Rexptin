import React, { useState } from 'react'
import HeaderBar from '../HeaderBar/HeaderBar'
import styles from '../MessagePlan/MessagePlan.module.css'
import AnimatedButton from '../AnimatedButton/AnimatedButton';

const MessagePlan = () => {
    const [value, setValue] = useState(2450);

    const formatValue = (num, isTooltip = false) => {
        if (num >= 1000) {
            const value = (num / 1000).toFixed(2);
            return (
                <span>
                    {value}
                    {!isTooltip && <span style={{ fontSize: "40px" }}>K</span>}
                    {isTooltip && "K"}
                </span>
            );
        }
        return num;
    };

    const min = 500;
    const max = 99000;
    const progress = ((value - min) / (max - min)) * 100;
    return (
        <div className={styles.containerBox}>
            <HeaderBar title="Message Plan" />
            <div className={styles.planContainer}>
                {/* Header Section */}
                <div className={styles.header}>
                    <div className={styles.planBox}>
                        <p className={styles.planLabel}>Voice Agent Plan</p>
                        <h2 className={styles.planName}>Starter</h2>
                    </div>
                    <div className={styles.totalBox}>
                        <p className={styles.planLabel}>Total Messages</p>
                        <h2 className={styles.planValue}>1.1K <span>Per month</span></h2>

                    </div>
                </div>

                {/* Bill Section */}
                <div className={styles.billBox}>
                    <div>
                        <p className={styles.planLabel2}>Estimated Monthly Bill</p>
                        <h2 className={styles.billValue}>$47.50    <span>Per month</span></h2>

                    </div>
                    <button className={styles.webChatTag}>For Web Chat</button>
                </div>

                {/* Popular Packs */}
                <div className={styles.popularSection}>
                    <h3>Popular Message Packs</h3>
                    <div className={styles.packButtons}>
                        {["1k", "2.5k", "5k", "10k", "20k", "50k", "75k"].map((pack, i) => (
                            <button
                                key={i}
                                className={`${styles.packBtn} ${pack === "2.5k" ? styles.activePack : ""
                                    }`}
                            >
                                <p>{pack} <span>sms</span></p>
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
                            min="500"
                            max="99000"
                            value={value}
                            className={styles.slider}
                            onChange={(e) => setValue(e.target.value)}
                            style={{
                                background: `linear-gradient(to right, #a855f7, #6524EB ${progress}%, #fff ${progress}%)`,
                                border: "1px solid #CDCDCDCD",
                                borderRadius: "5px",
                                outline: "none",
                            }}
                        />
                        <div
                            className={styles.sliderTooltip}
                            style={{
                                left: `${((value - 500) / (99000 - 500)) * 100}%`,
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
                        <b> Select the range</b> that fits your website traffic needs.
                    </p>



                </div>
                <div className={styles.PurchaseBtn}>
                    <AnimatedButton label='Confirm PURCHASE' position={{ position: 'relative' }} />

                    <p className={styles.NeedmOre}>Need more? Get in Touch with us!</p>
                </div>
            </div>
        </div>
    )
}

export default MessagePlan
