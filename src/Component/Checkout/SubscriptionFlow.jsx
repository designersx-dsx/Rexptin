import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoginWithEmailOTP, verifyEmailOTP } from "../../Store/apiStore";
import CustomCheckout from './Checkout';
import styles from './checkout.module.css';

export default function SubscriptionFlow() {
  const location = useLocation();
  const navigate = useNavigate();

  const priceId = location.state?.priceId;
  const agentId = location.state?.agentId || null
  // console.log("agentId-----",location)
  const locationPath = location.state?.locationPath1 || null
  console.log("locationPath",locationPath)
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [customerId, setCustomerId] = useState('');
  const [userId, setUserId] = useState('');

  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);

  // Auto redirect after payment success
  useEffect(() => {
    if (subscriptionSuccess) navigate('/business-details');
  }, [subscriptionSuccess, navigate]);

  // Check subscription after OTP verified and customerId available
  useEffect(() => {
    if (!otpVerified || !customerId) return;

    const checkSubscription = async () => {
      try {
        const res = await fetch(`${API_BASE}/subscription/${customerId}`);
        const data = await res.json();

        const isActive =
          (data?.status === 'active' || data?.status === 'trialing') &&
          data?.price?.id === priceId;

        if (isActive) setMessage("You already have an active subscription for this plan.");

      } catch (err) {
        console.error(' Subscription check failed:', err);
      }
    };

    checkSubscription();
  }, [otpVerified, customerId, priceId]);

  // Send OTP to email (login)
  const sendOtp = async () => {
    if (!email) return setMessage('Enter email first');
    if (!contact) return setMessage('Enter contact number first');
    setMessage('Sending OTP...');
    setLoading(true);
    try {
      const res = await LoginWithEmailOTP(email);
      if (res.error) {
        setMessage(` ${res.error}`);
      } else {
        setOtpSent(true);
        setMessage(' OTP sent to your email');
      }
    } catch {
      setMessage(' Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and handle customer creation or retrieval in Razorpay
  const verifyOtp = async () => {
    if (!otp) return setMessage('⚠️ Enter OTP');
    setMessage('Verifying...');
    setLoading(true);
    try {
      const verifyRes = await verifyEmailOTP(email, otp);

      const verifiedUserId = verifyRes?.data?.user?.id;
      if (!verifiedUserId) {
        setMessage('Invalid OTP');
        setLoading(false);
        return;
      }

      setUserId(verifiedUserId);
      localStorage.setItem("token", verifyRes.data.token);

      // Now check or create Razorpay customer with email + contact
      const customerRes = await fetch(`${API_BASE}/create-customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contact }),
      });

      const customerData = await customerRes.json();
      console.log("cuss",customerData)

      if (customerData.error) {
        setMessage(` Customer error: ${customerData.error}`);
        setLoading(false);
        return;
      }

      if (!customerData.id && !customerData.customerId) {
        setMessage('Could not get or create customer ID');
        setLoading(false);
        return;
      }

      // Prefer id or customerId key
      setCustomerId(customerData.id || customerData.customerId);
      setOtpVerified(true);
      setMessage('OTP verified and customer ready!');
    } catch (err) {
      setMessage(' Verification failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmail = () => {
    setOtpSent(false);
    setOtp('');
    setOtpVerified(false);
    setCustomerId('');
    setUserId('');
    setMessage('');
  };

  return (
    <div className={styles.container}>
      <h2>Complete Your Payment</h2>

      {/* Email and Contact Inputs */}
      <div className={styles.inputMain} >
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          disabled={otpSent}
        />
        <label>Phone</label>
        <input
          type="tel"
          placeholder="Enter contact number"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className={styles.input}
          disabled={otpSent}

        />
        {otpSent && !otpVerified && (
          <button onClick={handleEditEmail} className={styles.button}>
            Edit
          </button>
        )}
      </div>

      {/* OTP Input */}
      {otpSent && !otpVerified && (
        <div style={{ marginBottom: '1rem', maxWidth: 400 }}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className={styles.input}
          />
          <button onClick={verifyOtp} className={styles.button} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </div>
      )}

      {/* Send OTP button */}
      {!otpSent && (
        <button onClick={sendOtp} className={styles.button} disabled={loading || !email || !contact}>
          {loading ? 'Sending...' : 'Send OTP'}
        </button>
      )}

      {/* Message */}
      {message && <p className={styles.message2}>{message}</p>}

      {/* Payment form after OTP verified */}
      {otpVerified && customerId && (
        <div style={{ marginTop: '2rem' }}>
          <CustomCheckout
            email={email}
            customerId={customerId}
            priceId={priceId}
            userId={userId}
            onSubscriptionSuccess={() => setSubscriptionSuccess(true)}
            disabled={!otpVerified}
            agentId={agentId}
            locationPath={locationPath}
          />
        </div>
      )}
    </div>
  );
}