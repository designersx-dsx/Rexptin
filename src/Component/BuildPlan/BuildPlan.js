import React, { useState, useEffect } from 'react';
import styles from '../BuildPlan/BuildPlan.module.css';
import HeaderBar from '../HeaderBar/HeaderBar';
import AnimatedButton from '../AnimatedButton/AnimatedButton';

const BuildPlan = () => {
    const [price, setPrice] = useState(99);
    const [bill, setBill] = useState(55);
    const [plan, setPlan] = useState("STARTER");
    const [image, setImage] = useState("/svg/starter.svg");
    const [animate, setAnimate] = useState(false);

    const min = 99;
    const max = 999;

    const handleChange = (e) => {
        setPrice(parseInt(e.target.value));
    };

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

        setBill((price / 2).toFixed(2));

        // Only change image and animate if plan actually changed
        if (newPlan !== plan) {
            setPlan(newPlan);
            setImage(newImg);
            setAnimate(true);
            setTimeout(() => setAnimate(false), 600);
        }
    }, [price, plan]);

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
                    <div className={`${styles.imageWrapper} ${animate ? styles.slideIn : ""}`}>
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
                <div className={styles.PurchaseBtn} >
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
