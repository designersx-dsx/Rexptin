import React, { useState, useEffect } from 'react';
import styles from '../Start/Start.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
function Start() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const handleClick = () => {
        setTimeout(() => setStep(1), 150);
        setTimeout(() => setStep(2), 250);
        setTimeout(() => setStep(3), 350);
        setTimeout(() => setStep(4), 450);
        setTimeout(() => setStep(5), 650);
        setTimeout(() => {
            navigate(!ipData?.country === "India" ? "/plans" : "/rplans");
        }, 700);
    };
    useEffect(() => {
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setVH();
        window.addEventListener('resize', setVH);

        return () => window.removeEventListener('resize', setVH);
    }, []);
const [countryCode, setCountryCode] = useState('');
  const [ipData, setIpData] = useState({});

useEffect(() => {
    const fetchCountryCode = async () => {
      try {
        const res = await axios.get('https://ipwho.is/');
        const data = res?.data;
        if (data && data.country_code) {
          setIpData(data);
          setCountryCode(data.country_code.toLowerCase());
        }
      } catch (err) {
        console.error('Failed to fetch IP location:', err);
      }
    };
    fetchCountryCode();
  }, []);
console.log(ipData)
    return (
        <div>
            <div className={styles.StartMain}>
                <div>
                    {/* floating ellipses */}
                    <img src='images/Ellipse 1.png' alt='Ellipse 1' />
                    <img src='images/Ellipse 2.png' alt='Ellipse 2' />
                    <img src='images/Ellipse 5.png' alt='Ellipse 5' />
                    <img src='images/Ellipse 3.png' alt='Ellipse 3' />
                    <img src='images/Ellipse 4.png' alt='Ellipse 4' />
                    <img src='images/Ellipse 6.png' alt='Ellipse 6' />
                    <img src='images/Ellipse 7.png' alt='Ellipse 7' />
                    <img src='images/Ellipse 8.png' alt='Ellipse 8' />
                    <img src='images/Ellipse 9.png' alt='Ellipse 9' />
                    <img src='images/Ellipse 10.png' alt='Ellipse 10' />
                    <img src='images/Ellipse 11.png' alt='Ellipse 11' />
                </div>
            </div>

            <div className={styles.content}>
                <div className={`${styles.LogoDiv} ${step >= 1 ? styles.slideRight : ''}`}>
                    <img src='svg/Rexpt-Logo.svg' alt='Rexpt-Logo' />
                </div>

                <div className={styles.part} >
                    <div className={`${styles.part2} ${step >= 2 ? styles.slideRight : ''}`}>
                        <p className={styles.heading}>
                            Launch Your <b>AI Receptionist</b>
                        </p>
                    </div>

                    <div className={`${styles.withlogo} ${step >= 3 ? styles.slideRight : ''}`}>
                        <p className={styles.with} >with </p>
                        <p><img src='svg/Rexpt-Logo.svg' alt='Rexpt-Logo' /></p>
                    </div>
                    <p className={`${styles.desc} ${step >= 4 ? styles.slideRight : ''}`}>
                        Engage leads by voice, automate bookings & reminders, and unlock actionable call analytics—powered by Rexpt.in.
                    </p>
                </div>

                <div className={`${styles.parentDiv} ${step >= 5 ? styles.slideRight : ''}`}>
                    <div className={styles.BtnDiv} onClick={handleClick}>
                        <img src='svg/svg-theme.svg' alt='Start Button' />
                        <p>Let's Start</p>
                    </div>
                </div>
            </div>


        </div>
    );
}

export default Start;
