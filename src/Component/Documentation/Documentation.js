import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Documentation.module.css';
import EditHeader from '../EditHeader/EditHeader';

export default function Documentation() {
  const navigate = useNavigate();
    useEffect(() => {
    setTimeout(() => {
      if (document.activeElement) {
        document.activeElement.blur();
      }
    }, 50);
  }, []);
  const sections = [
    { name: 'Privacy Policy', type: 'Privacy-Policy', url: 'https://www.rexpt.us/Privacy-Policy' },
    { name: 'Terms Of Services', type: 'Terms-Of-Services', url: 'https://www.rexpt.us/Terms-Condition' },
    { name: 'Cancellation & Refund Policy', type: 'Cancellation-&-Refund Policy', url: 'https://www.rexpt.us/Cancellation-Refund' },
    { name: 'Shipping & Delivery Policy', type: 'Shipping-&-Delivery-Policy', url: 'https://www.rexpt.us/Shipping-Delivery' },
  ];

  const handleSectionClick = (type, url) => {

      window.open(url, '_blank')
    
  };

  return (
    <div>
      <EditHeader title="Documentation" />
      <div className={styles.container}>
        <div className={styles.section}>
          <label className={styles.label}>Documentation Sections</label>
          <div className={styles.sectionList}>
            {sections.map((section, index) => (
              <div  
                key={index}
                className={styles.sectionItem}
                onClick={() => handleSectionClick(section.type, section.url)}
              >
                <span className={styles.sectionText}>{section.name}</span>
                <span className={styles.arrow}>
                  <svg width="12" height="22" viewBox="0 0 12 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.251051 21.7522C-0.0836838 21.4217 -0.0836838 20.886 0.251051 20.5555L9.93067 11L0.25105 1.44448C-0.0836847 1.11403 -0.0836847 0.578277 0.25105 0.247832C0.585785 -0.0826115 1.1285 -0.0826115 1.46323 0.247832L11.7489 10.4017C12.0837 10.7321 12.0837 11.2679 11.7489 11.5983L1.46323 21.7522C1.1285 22.0826 0.585786 22.0826 0.251051 21.7522Z"
                      fill="#5F33E1"
                    />
                  </svg>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}