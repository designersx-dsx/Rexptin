import React, { useState, useEffect } from 'react'
import styles from '../BuildPlan2/BuildPlan2.module.css'
import HeaderBar from '../HeaderBar/HeaderBar';
import AnimatedButton from '../AnimatedButton/AnimatedButton';
function BuildPlan2() {
    const [value, setValue] = useState(10);
    const [planName, setPlanName] = useState(null);
    const [planColor, setPlanColor] = useState('#6524EB');
    const [planDesc, setPlanDesc] = useState('');
    const [isMyPlanChecked, setIsMyPlanChecked] = useState(false);
    const [isCustomChecked, setIsCustomChecked] = useState(true);

    const handleChange = (e) => setValue(Number(e.target.value));

    const handleMyPlanCheckbox = () => {
        const newVal = !isMyPlanChecked;
        setIsMyPlanChecked(newVal);
        if (newVal) setIsCustomChecked(false);
    };

    const handleCustomCheckbox = () => {
        const newVal = !isCustomChecked;
        setIsCustomChecked(newVal);
        if (newVal) setIsMyPlanChecked(false);
    };

    const getBubblePosition = () => {
        const min = 10;
        const max = 4000;
        return ((value - min) / (max - min)) * 100;
    };

    // Dynamically set plan details
    useEffect(() => {
        if (value >= 3000) {
            setPlanName('Corporate');
            setPlanColor('#22C95C');
            setPlanDesc('Perfect for a startup or micro business');
        } else if (value >= 1500) {
            setPlanName('Growth');
            setPlanColor('#00A4FF');
            setPlanDesc('Perfect for a startup or micro business');
        } else if (value >= 750) {
            setPlanName('Scaler');
            setPlanColor('#FE5E00');
            setPlanDesc('Perfect for a startup or micro business');
        } else if (value >= 300) {
            setPlanName('Starter');
            setPlanColor('#E83BAC');
            setPlanDesc('Perfect for a startup or micro business');
        } else {
            setPlanName(null);
            setPlanColor('#E83BAC');
            setPlanDesc('');
        }
    }, [value]);

    // Update slider fill color based on plan and checkbox states
    useEffect(() => {
        const min = 10;
        const max = 4000;
        const percent = ((value - min) / (max - min)) * 100;

        const fillColor =
            !isCustomChecked || isMyPlanChecked ? "#BFBFBF" : planColor;

        document.documentElement.style.setProperty("--fill", `${percent}%`);
        document.documentElement.style.setProperty("--sliderColor", fillColor);
    }, [value, isMyPlanChecked, isCustomChecked, planColor]);

    return (
        <div className={styles.containerBox}>
            <HeaderBar title="Build your own plan" />

            <div className={styles.container}>
                {/* === Dynamic My Plan Card === */}
                {planName && (
                    <div className={`${styles.MyPlanCard} ${styles.show}`}>
                        <div className={styles.planHeader}>
                            <div className={styles.MyPlanLeft}>
                                <p className={styles.planDesc}>{planDesc}</p>
                                <h1 style={{ color: planColor }}>{planName}</h1>
                            </div>
                            <div className={styles.MyPlanRight}>
                                <h2
                                    style={{
                                        color: isMyPlanChecked ? '#24252C' : '#BFBFBF',
                                    }}
                                >
                                    <span>$</span>99
                                </h2>
                            </div>
                        </div>

                        {/* === MyPlanCentre animated === */}
                        <div
                            className={`${styles.MyPlanCentre} ${isMyPlanChecked ? styles.showMyPlanCentre : ''}`}
                            style={{ borderLeftColor: planColor }}
                        >
                            <div className={styles.myPlanminute}>
                                <h4>300</h4>
                                <p>minutes</p>
                            </div>
                            <div className={styles.features}>
                                <p style={{
                                    backgroundColor: planColor + '15',
                                    color: planColor,
                                }}>Save 20% ($240) on Yearly billing</p>
                                <p style={{
                                    backgroundColor: planColor + '15',
                                    color: planColor,
                                }}>+ Standard Feature</p>
                            </div>
                        </div>

                        <label className={styles.checkboxBar}>
                            {isMyPlanChecked ? (
                                <h3 className={styles.bychecked}>Rexpt {planName} Plan</h3>
                            ) : (
                                <h3 className={styles.byuncheck}><b>300</b> mins included</h3>
                            )}

                            <input
                                type="checkbox"
                                className={styles.checkboxInput}
                                checked={isMyPlanChecked}
                                onChange={handleMyPlanCheckbox}
                            />

                            <span className={styles.customBox}>
                                <svg
                                    className={styles.checkIcon}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </span>
                        </label>
                    </div>
                )}

                {/* === Custom Plan Card === */}
                <div className={styles.CustomPlanCard}>
                    <div className={styles.topBar}>
                        <div className={styles.PlanTitleBar}>
                            <p className={styles.PlanSubTitle}>Create your own package</p>
                            <h3 className={styles.PlanTitle}>CUSTOM</h3>
                        </div>
                        <div className={styles.PriceBar}>
                            <h2 className={isCustomChecked ? styles.priceBlack : styles.priceGray}><span>$</span>10</h2>
                            <p>Estimated monthly cost</p>
                        </div>
                    </div>

                    <div className={styles.centreBar}>
                        <div className={styles.leftBar}>
                            <div className={styles.rightBorder}>
                                <p className={styles.totalMinutes}><b>{value}</b><br />minutes</p>
                            </div>

                            {!isMyPlanChecked && (
                                <div className={styles.iconbar}>
                                    <div className={styles.Icon}>
                                        <img src='/svg/custom-plan-icon.svg' alt='custom-plan-icon' />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.RightBar}>
                            <p>Website Chat & Call Widget</p>
                            <p>Built-In Mobile CRM</p>
                            {!isMyPlanChecked && <p>Standard Feature</p>}
                        </div>
                    </div>

                    <div className={`${styles.bottombar} ${planName ? styles.hide : ''}`}>
                        <p className={styles.desc}>
                            Use the Slider below to select Number of minutes required by your business..
                        </p>
                    </div>

                    <label className={styles.checkboxBar2}>
                        {isCustomChecked ? (
                            <h3 style={{ color: '#6524EB' }}>MY CUSTOM PLAN</h3>
                        ) : (
                            <h3 style={{ color: '#BFBFBF' }}>
                                {value} mins included
                            </h3>
                        )}

                        <input
                            type="checkbox"
                            className={styles.checkboxInput}
                            checked={isCustomChecked}
                            onChange={handleCustomCheckbox}
                        />
                        <span className={styles.customBox}>
                            <svg
                                className={styles.checkIcon}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </span>
                    </label>
                </div>

                {/* === Slider === */}
                <div className={styles.sliderDiv}>
                    <div className={styles.sliderBox}>
                        <div className={styles.rangeWrapper}>
                            <div
                                className={`${styles.valueBubble} ${!isCustomChecked ? styles.gray : ''}`}
                                style={{ left: `${getBubblePosition()}%` }}
                            >
                                {value} mins
                            </div>

                            <input
                                type="range"
                                min="10"
                                max="4000"
                                step="10"
                                value={value}
                                onChange={handleChange}
                                disabled={!isCustomChecked} // disable when unchecked
                                className={`${styles.rangeInput} ${!isCustomChecked ? styles.gray : ''}`}
                                style={{ '--fill': `${((value - 10) / (4000 - 10)) * 100}%` }}
                            />
                        </div>


                        <div className={styles.labelRow}>
                            <span>10</span>
                            <span>4K</span>
                        </div>

                        <p className={styles.caption}>
                            <strong>Select the range</strong> that fits your website traffic needs.
                        </p>
                    </div>
                </div>

                <div className={styles.PurchaseBtn}>
                    <AnimatedButton
                        label="Confirm PURCHASE"
                        position={{ position: 'relative' }}
                    />
                    <p className={styles.NeedmOre}>Need more? Get in Touch with us!</p>
                </div>
            </div>
        </div>
    )
}

export default BuildPlan2
