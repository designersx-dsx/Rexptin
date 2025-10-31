import React from 'react';
import styles from "../HeaderBar/HeaderBar.module.css";
import { useNavigate } from 'react-router-dom';
const HeaderBar = ({ title, subtitle,bottomSubtitle, dropdownOptions = [], onDropdownChange,selectedAgent, backgroundColor = "#fff", color = '#24252C' }) => {
  const navigate = useNavigate();
  const handleBack = () => {
    const currentPath = window.location.pathname;

    if (currentPath.endsWith("/plan") || currentPath === "/plan" || currentPath=="/assign-number") {
      navigate("/dashboard");
    }else if (currentPath.endsWith("/plans") || currentPath === "/plans") {
      navigate("/steps");} 
    else {
      navigate(-1);
    }
  };
  return (
    <div className={styles.headerMain} style={{ backgroundColor }}>
      <div className={styles.BothFlex}>
        <div className={styles.backIcon}>
          <img src='svg/Back-icon.svg' alt='Back-icon' onClick={handleBack} />
        </div>

        <div className={styles.titleWrapper}>
          <div className={styles.title}>
            {subtitle && <h6>{subtitle}</h6>}
            <h2 style={{ color }}>{title}</h2 >
            <h5>{bottomSubtitle}</h5>
          </div>

          {dropdownOptions.length > 0 && (
            <select
            value={selectedAgent}
              className={styles.dropdown}
              onChange={(e) => onDropdownChange?.(e.target.value)}
            >
              {dropdownOptions.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderBar;
