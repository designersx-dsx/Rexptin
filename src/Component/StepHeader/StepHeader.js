import React, { useState, useEffect } from 'react'
import styles from '../StepHeader/StepHeader.module.css'
import Divider from '../Divider/Divider';
import TooltipSteps from '../TooltipSteps/Tooltip'
import Loader2 from '../Loader2/Loader2';
const StepHeader = ({ title, subTitle, icon, tooltip }) => {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            let newScale = 1 - Math.min(scrollY / 400, 0.3);
            if (newScale < 0.7) newScale = 0.7;
            setScale(newScale);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    return (
        <div className={styles.LogoDiv} style={{ textAlign: 'center' }}>

            <div
                className={styles.LogoWrapper}

            >
                {/* hel */}

                <img src='/svg/Rexpt-Logo.svg' alt='Rexpt-Logo'/>
            </div>
            <Divider label='Agent Setup' />
            <div className={styles.headerWrapper}>
                <div>
                    <h2 className={styles.heading}
                    >{title}</h2>
                    <p className={styles.subHeading}>{subTitle}</p>
                </div>
                <div className={styles.tooltipIcon}>
                    {tooltip}
                </div>
            </div>


        </div>
    )
}

export default StepHeader
