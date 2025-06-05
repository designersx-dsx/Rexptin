import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Plan.module.css';
import Loader from '../Loader/Loader';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const Plan = ({agentID,locationPath}) => {
  console.log("plannnagent",agentID)
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [selectedAccordion, setSelectedAccordion] = useState(null); // Renamed `open` to `selectedAccordion`
  const [billingInterval, setBillingInterval] = useState('monthly'); // Only used for India
  const [countryCode, setCountryCode] = useState(''); // To store country code
  const navigate = useNavigate();

  // Fetch country code from IP-based API
  useEffect(() => {
    const fetchCountryCode = async () => {
      try {
        const res = await axios.get('https://ipwho.is/');
        const data = res.data;
        if (data && data.country_code) {
          setCountryCode(data.country_code.toLowerCase()); // Get and store country code
        }
      } catch (err) {
        console.error('Failed to fetch IP location:', err);
      }
    };
    fetchCountryCode();
  }, []);

  // Fetch plans dynamically from API based on the country code
  useEffect(() => {
    const fetchPlans = async () => {
      let apiUrl = `${API_BASE}/plans`; // Default API URL for India users

      // If country is not India, fetch plans specifically for non-India (products)
      if (countryCode !== 'in') {
        apiUrl = `${API_BASE}/products`; // API endpoint for non-India-specific products
      }

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log("Fetched data: ", data); // Check what the data looks like

        // Handle response based on country
        if (countryCode === 'in') {
          // Handle India API response (plans)
          const plans = data.items.map(plan => ({
            id: plan.id,
            name: plan.item.name,
            description: plan.item.description,
            price: (plan.item.amount / 100).toFixed(2), // Convert price to INR
            currency: plan.item.currency,
            minutes: plan.notes?.minutes,
            period: plan.period,
          }));
          setPlans(plans);
        } else {
          // Handle Non-India API response (products)
          const products = data.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: (product.prices[0].unit_amount / 100).toFixed(2), // Only taking the first price (monthly)
            currency: product.prices[0].currency.toUpperCase(),
            minutes: product.metadata?.minutes,
          }));
          setPlans(products);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err); // Log error if API request fails
        setError('Failed to load plans.');
        setLoading(false);
      }
    };

    if (countryCode) {
      fetchPlans(); // Trigger fetching plans when countryCode is set
    }
  }, [countryCode]);

  // Accordion toggle function
  const toggleAccordion = (id) => {
    setSelectedAccordion(selectedAccordion === id ? null : id); // Use the new state `selectedAccordion`
  };

  // Filter plans by billingInterval (monthly or yearly) for India users only
  const filteredPlans = plans.filter((plan) => countryCode === 'in' || plan.period === 'monthly');

  const getMonthlyPrice = (plan) => {
    return plan.price; // No division needed for non-India products, they are already monthly
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

      {/* Only show tabs for Monthly / Yearly if country is India */}
      {countryCode === 'in' && (
        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${billingInterval === 'monthly' ? styles.activeTab : ''}`}
            onClick={() => setBillingInterval('monthly')}
          >
            Monthly
          </button>
          <button
            className={`${styles.tabButton} ${billingInterval === 'yearly' ? styles.activeTab : ''}`}
            onClick={() => setBillingInterval('yearly')}
          >
            Yearly
          </button>
        </div>
      )}

      {/* Display Plans based on the country */}
      <div className={styles.PlanDiv}>
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
                      <p>{plan.name}</p>
                      <span className={styles.description}>{plan.description.trim()}</span>
                    </div>
                  </div>
                  <div className={styles.planData}>
                    <p>
                      Price: <strong>{getMonthlyPrice(plan)} {plan.currency}</strong> /{' '}
                      {countryCode === 'in' ? billingInterval : 'monthly'}
                    </p>
                    <p>
                      <strong>{plan.minutes}</strong> minutes included
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* Accordion for extra details */}
            <div className={`${styles.accordion} ${selectedAccordion === plan.id ? styles.open : ''}`}>
              {plan.minutes && (
                <p>Includes <strong>{plan.minutes}</strong> minutes</p>
              )}
              <div className={styles.pricesContainer}>
                <div
                  className={styles.priceOption}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/checkout', { state: { priceId: plan.id } });
                  }}
                >
                  {getMonthlyPrice(plan)} {plan.currency} / {countryCode === 'in' ? billingInterval : 'monthly'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue button */}
      <div
        className={styles.btnTheme}
        onClick={() => {
          if (selected) {
            navigate('/checkout', { state: { priceId: selected , agentId:agentID,locationPath1:locationPath} });
          } else {
            alert('Please select a plan first');
          }
        }}
      >
        <img src="svg/svg-theme.svg" alt="" />
        <p>Continue</p>
      </div>

    </div>
  );
};

export default Plan;