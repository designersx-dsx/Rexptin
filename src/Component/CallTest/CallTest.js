import React, { useEffect, useRef } from "react";
import styles from './CallTest.module.css';
import Loader from "../Loader/Loader";
import Loader2 from "../Loader2/Loader2";

const CallTest = ({
  onStartCall,
  onEndCall,
  isCallActive,
  callLoading,
  setCallLoading,
  isliveTranscript,
  agentName,
  agentAvatar,
  businessName,
  isEndingRef
}) => {
  const ringRef = useRef(null);

  const displayAgentName = agentName && agentName.length > 15
    ? agentName.slice(0, 7) + '...'
    : agentName;

  const displayBusinessName = businessName && businessName.length > 10
    ? businessName.slice(0, 15) + '...'
    : businessName;
  useEffect(() => {
    const audio = ringRef.current;
    if (!audio) return;
    if (callLoading && !isCallActive && !isEndingRef.current) {
      audio.play().catch(() => {}); 
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [callLoading, isCallActive]);

  const handleStartCall = () => {
    const audio = ringRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
    onStartCall && onStartCall();
  };

  const handleEndCall = () => {
    const audio = ringRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    onEndCall && onEndCall();
  };

  return (
    <div className={styles.container}>
      <audio ref={ringRef} preload="auto" loop playsInline>
        <source src="/sounds/ringtone.mp3" type="audio/mpeg" />
      </audio>

      <div className={styles.imgrex}>
        <img src={agentAvatar || "images/rex.png"} alt={agentName || "Agent"} />
        {
          isEndingRef.current ? (
            <div
              className={styles.reddiv}
              style={{ pointerEvents: 'none', opacity: 0.7, cursor: 'not-allowed' }}
            >
              <div className={styles.phoneIcon}>
                <img src="svg/Phone-call.svg" alt="Phone Call" />
              </div>
              <div className={styles.callText}>
                <p>Disconnecting...</p>
                <small>{displayBusinessName}&nbsp; Agent is LIVE</small>
              </div>
            </div>
          ) : isCallActive ? (
            <div className={styles.reddiv}>
              <div className={styles.phoneIcon}>
                <img src="svg/Phone-call.svg" alt="Phone Call" />
              </div>
              <div className={styles.callText} onClick={handleEndCall}>
                <p>
                  Call End <span className={styles.agentTag}>{displayAgentName}</span>
                </p>
                <small>{displayBusinessName}&nbsp; Agent is LIVE</small>
              </div>
            </div>
          ) : callLoading ? (
            <div
              className={styles.greendiv}
              style={{ pointerEvents: 'none', opacity: 0.7, cursor: 'not-allowed' }}
            >
              <div className={styles.phoneIcon}>
                <img src="svg/Phone-call.svg" alt="Phone Call" />
              </div>
              <div className={styles.callText}>
                <p>Connecting...</p>
                <small>{displayBusinessName}&nbsp; Agent is LIVE</small>
              </div>
            </div>
          ) : (
            <div className={styles.greendiv} onClick={handleStartCall}>
              <div className={styles.phoneIcon}>
                <img src="svg/Phone-call.svg" alt="Phone Call" />
              </div>
              <div className={styles.callText}>
                <p>
                  Call <span className={styles.agentTag}>{displayAgentName}</span>
                </p>
                <small>{displayBusinessName}&nbsp; Agent is LIVE</small>
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
};

export default CallTest;
