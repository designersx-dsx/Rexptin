import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Plan.module.css';
import Loader from '../Loader/Loader';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const Plan = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(null);
  const [billingInterval, setBillingInterval] = useState('monthly'); // 'monthly' or 'yearly'
  const navigate = useNavigate();

  // Fetch plans dynamically from API
  useEffect(() => {
    fetch(`${API_BASE}/plans`)
      .then(res => res.json())
      .then(data => {
        if (data && data.items) {
          setPlans(data.items);
        } else {
          setError('No plans found');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load plans.');
        setLoading(false);
      });
  }, []);

  const toggleAccordion = (id) => {
    setOpen(open === id ? null : id);
  };

  // Filter plans by billingInterval (monthly or yearly)
  const filteredPlans = plans.filter((plan) => plan.period === billingInterval);

  // Calculate monthly price for yearly plans
  const getMonthlyPrice = (plan) => {
    return billingInterval === 'yearly' ? plan.item.amount / 12 : plan.item.amount;
  };

  if (loading) return <p className={styles.status}><Loader /></p>;
  if (error) return <p className={styles.statusError}>{error}</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <img src="images/inlogo.png" alt="inlogo" />
        </div>
        <div className={styles.headercontent}>
          <h3>Select Your Plan</h3>
          <p>Customizable payment structures</p>
        </div>
      </div>

      {/* Tabs for Monthly / Yearly */}
      <div className={styles.tabs}>
        <button
          className={billingInterval === 'monthly' ? styles.activeTab : ''}
          onClick={() => setBillingInterval('monthly')}
        >
          Monthly
        </button>
        <button
          className={billingInterval === 'yearly' ? styles.activeTab : ''}
          onClick={() => setBillingInterval('yearly')}
        >
          Yearly
        </button>
      </div>

      {/* Display Plans */}
      {filteredPlans.map((plan) => (
        <div
          key={plan.id}
          className={`${styles.planBox} ${selected === plan.id ? styles.selected : ''}`}
        >
          <div className={styles.part1}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="plan"
                value={plan.id}
                checked={selected === plan.id}
                onChange={() => setSelected(plan.id)}
              />
              <div className={styles.planContent}>
                <div className={styles.planTitle}>
                  <div>
                    <p>{plan.item.name}</p>
                    <span className={styles.description}>{plan.item.description.trim()}</span>
                  </div>
                  {plan.metadata && plan.metadata.badge && (
                    <span className={styles.badge}>{plan.metadata.badge}</span>
                  )}
                </div>
                <div className={styles.planData}>
                  <p>
                    Price: <strong>{(getMonthlyPrice(plan) / 100).toFixed(2)} {plan.item.currency}</strong> /{' '}
                    {billingInterval}
                  </p>
                  <p>
                    <strong>{plan.notes?.minutes}</strong> minutes included
                  </p>
                </div>
              </div>
            </label>

            <img
              src={open === plan.id ? '/svg/up.svg' : '/svg/down.svg'}
              alt="Toggle Arrow"
              className={`${styles.arrowIcon} ${open === plan.id ? styles.rotated : ''}`}
              onClick={() => toggleAccordion(plan.id)}
            />
          </div>

          <div className={`${styles.accordion} ${open === plan.id ? styles.open : ''}`}>
            {plan.notes?.minutes && (
              <p>Includes <strong>{plan.notes.minutes}</strong> minutes</p>
            )}
            <div className={styles.pricesContainer}>
              <div
                className={styles.priceOption}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/checkout', { state: { priceId: plan.id } });
                }}
              >
                {(getMonthlyPrice(plan) / 100).toFixed(2)} {plan.item.currency} / {billingInterval}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Continue button */}
      <div
        className={styles.btnTheme}
        onClick={() => {
          if (selected) {
            navigate('/checkout', { state: { priceId: selected } });
          } else {
            alert('Please select a plan first');
          }
        }}
      >
        <img src="svg/svg-theme.svg" alt="" />
        <p>Continue</p>
      </div>

      {/* Login link */}
      <div className={styles.loginBox}>
        <p>
          Already have an account?{' '}
          <span className={styles.loginLink} onClick={() => navigate('/login')}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Plan;
