import React, { useState } from 'react'
import styles from '../Refferal/Refferal.module.css'
import { updateShowReferralFloatingStatus } from '../../Store/apiStore'

const Refferal = ({referralCode,setShowDashboardReferral,showDashboardReferral,userId}) => {
//   const referralLink=`https://app.rexpt.in?referral=${encodeURIComponent(referralCode)}` //live
  const referralLink=`${window.location.origin}?referral=${encodeURIComponent(referralCode)}` //staging
  const [copied,setCopied]=useState(false)
  const [referralStatus,setReferralStatus]=useState(showDashboardReferral)

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1000); 
      })
      .catch((err) => {
        console.error("Copy failed:", err);
      });
  };

  const shareReferralLink = async (e) => {

  if (!referralLink) {
    console.error('No referral code provided');
    return;
  }


  // Use localhost for dev, replace with production URL (e.g., https://rexpt.in) later
//   const shareUrl = `http://localhost:3000?referral=${encodeURIComponent(code)}`;

  if (navigator.share) {
    try {
      await navigator.share({
        url: referralLink
      });
      console.log('Share URL:', referralLink); // Debug
    } catch (error) {
      console.error('Error sharing:', error);
      await navigator.clipboard.writeText(referralLink);
    }
  } else {
    try {
      await navigator.clipboard.writeText(referralLink);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }
};

  const handleChangeStatus=async(showDashboardReferral)=>{
    // console.log('showDashboardReferral',showDashboardReferral)
    setReferralStatus((prev)=>!prev)
    // return
        try {
            const res = await updateShowReferralFloatingStatus(userId,showDashboardReferral);
            // console.log(res)
            // setReferralCode(user?.referralCode)
            setShowDashboardReferral(res?.data)
            localStorage.setItem('showreferralfloating',res?.data)

            
          } catch (error) {
            console.error(error);
          } 

  }

    return (
        <div className={styles.Refferalinfo}>
            <div className={styles.headerPart}>
                <h3>Earn 5% Commission & Give 5% Discount!</h3>
            </div>
            <div className={styles.card}>
                {/* <label className={styles.checkboxLabel}>
                    Show Referral link on Dashboard
                    <input type="checkbox" className={styles.customCheckbox} 
                    checked={referralStatus}
                     onChange={(e) => handleChangeStatus(e.target.checked)}
                     />
                </label> */}

                <div className={styles.linkSection}>
                    <p className={styles.label}>Referral Link</p>
                    <div className={styles.linkDiv}>
                        <div className={styles.inputWrapper}>
                            <input
                                type="text"
                                value={referralLink}
                                readOnly
                                className={styles.input}
                            />

                        </div>
                        <div className={styles.copyWrapper}>
                        <button className={styles.copyButton} onClick={handleCopy}>
                            <img src="/svg/copy-icon.svg" alt="Copy" />
                        </button>
                        {copied && <span className={styles.tooltip}>Copied!</span>}
                        </div>
                    </div>

                </div>

                <hr className={styles.divider} />

                <div className={styles.infoSection}>
                    <div className={styles.Linkdec}>
                        <img src='/svg/earn-icon.svg' alt='earn-icon' />
                        <p>Share your referral link and <b>earn 5% commission</b> of your friends’ spending.</p>
                    </div>
                      <div className={styles.Linkdec}>
                        <img src='/svg/Gift-icon.svg' alt='commission-icon' />
                        <p>Your friends get an <b>instant 5% discount</b> when they sign up using your link</p>
                    </div>
                    <div className={styles.Linkdec}>
                        <img src='/svg/commission-icon.svg' alt='commission-icon' />
                        <p>You will earn “Commission” every month for upto <b>12 months</b> or Customer Lifespan(Whichever is lower) </p>
                    </div>
                    <div className={styles.Linkdec}>
                        <img src='/svg/commission2.svg' alt='commission-icon' />
                        <p>We pay “Referral Commission” to our affiliate partners on <b>1st Day of every following month.</b></p>
                    </div>
                  
                </div>

                <div className={styles.btnTheme} onClick={shareReferralLink}>
                    <div className={styles.imageWrapper}>
                        <img src="svg/svg-theme2.svg" alt="" />
                    </div>
                    <p>
                        Share Referral Link
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Refferal
