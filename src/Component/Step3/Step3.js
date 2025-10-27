import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import styles from '../Step3/Step3.module.css';
import Slider from 'react-slick';
import Step4 from '../Step4/Step4';

const avatars = {
  Male: [
    { img: 'images/Male-01.png' },
    { img: 'images/Male-02.png' },
    { img: 'images/Male-03.png' },
    { img: 'images/Male-04.png' },
    { img: 'images/Male-05.png' },
  ],
  Female: [
    { img: 'images/Female-01.png' },
    { img: 'images/Female-02.png' },
    { img: 'images/Female-03.png' },
    { img: 'images/Female-04.png' },
    { img: 'images/Female-05.png' },
    { img: 'images/Female-06.png' },
  ],
};

const Step3 = forwardRef(({ onNext, onBack, onValidationError, onSuccess, onFailed, setLoading, onStepChange, setAvtarChecked, loading }, ref) => {
  const sliderRef = useRef(null);
  const inputRef = useRef(null);

  const [agentName, setAgentName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [agentNameError, setAgentNameError] = useState('');
  const [gender, setGender] = useState('Male');
  const [availableAvatars, setAvailableAvatars] = useState(avatars['Male']);
  const EditingMode = localStorage.getItem("UpdationMode") === "ON";
  const [scale, setScale] = useState(1);
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    const storedGender = sessionStorage.getItem("agentGender") || "Male";
    const storedAvatarImg = sessionStorage.getItem("avatar");
    const storedAgentName =
      sessionStorage.getItem("agentName") ||
      localStorage.getItem("VoiceAgentName") ||
      "";
    const localVoiceName = sessionStorage.getItem("VoiceAgentName") || "";

    const genderAvatars = avatars[storedGender] || avatars["Male"];
    setGender(storedGender);
    setAvailableAvatars(genderAvatars);

    // Set agent name
    if (storedAgentName) {
      setAgentName(storedAgentName);
    } else {
      setAgentName(localVoiceName);
      sessionStorage.setItem("agentName", localVoiceName);
    }

    // Avatar selection
    if (storedAvatarImg) {
      const avatarIndex = genderAvatars.findIndex(av => av.img === storedAvatarImg);
      if (avatarIndex !== -1) {
        const matchedAvatar = genderAvatars[avatarIndex];
        setSelectedAvatar(matchedAvatar);
        setTimeout(() => {
          sliderRef.current?.slickGoTo(avatarIndex);
        }, 0);
        return;
      }
    }

    const defaultAvatar = genderAvatars[0];
    if (defaultAvatar) {
      setSelectedAvatar(defaultAvatar);
      sessionStorage.setItem("avatar", defaultAvatar.img);
      sessionStorage.setItem("avtarChecked", JSON.stringify(true));
      setAvtarChecked?.(true);
      setTimeout(() => {
        sliderRef.current?.slickGoTo(0);
      }, 0);
    }
  }, []);

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

  const handleAvatarChange = (avatar) => {
    setSelectedAvatar(avatar);
    sessionStorage.setItem('avatar', avatar.img);
    sessionStorage.setItem("avtarChecked", JSON.stringify(true));
    setAvtarChecked?.(true);
  };

  const handleAgentNameChange = (e) => {
    const val = e.target.value;
    setAgentName(val);
    sessionStorage.setItem('agentName', val);
    if (val.trim()) setAgentNameError('');
  };

  const handleEditClick = () => {
    setIsEditingName(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleFinishEditing = () => {
    setIsEditingName(false);
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      if (!agentName.trim()) {
        onValidationError?.({
          type: "failed",
          message: "Please enter agent name!"
        });
        return false;
      }
      if (!selectedAvatar) {
        onValidationError?.({
          type: "failed",
          message: "Please select an avatar!"
        });
        return false;
      }
      onStepChange?.(7);
      return true;
    },
  }));

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  // check is this webview or not
  const isAndroidApp = () => /Android/i.test(navigator.userAgent) && window.ReactNativeWebView;
  const isIOSApp = () => /iPhone|iPad|iPod/i.test(navigator.userAgent) && window.webkit;
  const handleFocus = (e) => {
    if (isAndroidApp() || isIOSApp()) {
      setTimeout(() => {
        e.target.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
    }
  };

  return (
    <div className={`${styles.sliderContainer} ${loading ? styles.blocked : ""}`} id='avtarSlider' >
      <Slider ref={sliderRef} {...settings}>
        {availableAvatars.map((avatar, index) => (
          <div key={index} className={styles.slide} id="slideradio">
            <label className={styles.avatarLabel}>
              <input
                type="checkbox"
                name="avatar"
                value={index}
                checked={selectedAvatar?.img === avatar.img}
                onChange={() => handleAvatarChange(avatar)}
                className={styles.radioButton}
                onFocus={handleFocus}
              />
              <img
                src={avatar.img}
                alt={`Avatar ${index + 1}`}
                className={styles.avatarImage}
              />
            </label>
          </div>
        ))}
      </Slider>

      <div className={styles.labReq}>
        <div className={styles.agentInputBox} id='sliderstep'>
          <div className={styles.Dblock}>
            <div className={styles.inputWrapper}>
              <input
                ref={inputRef}
                type="text"
                name="agentName"
                onChange={handleAgentNameChange}
                className={styles.agentInput}
                placeholder="Ex- Smith, Nova"
                value={agentName}
                // readOnly={!isEditingName}
                // aria-readonly={!isEditingName}
                onFocus={handleFocus}
                // onBlur={handleFinishEditing}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.currentTarget.blur(); 
                  }
                }}
                autoComplete="off"
                inputMode="text"
              />
            </div>
          </div>
        </div>
        {agentNameError && (
          <p className={styles.agenterror}>{agentNameError}</p>
        )}
      </div>
      <div className={styles.customBtn}>
        <div className={styles.arrowLeft} onClick={() => sliderRef.current.slickPrev()}>
          <img src="svg/sliderleft.svg" alt="Previous" />
        </div>
        <div className={styles.arrowRight} onClick={() => sliderRef.current.slickNext()}>
          <img src="svg/sliderRight.svg" alt="Next" />
        </div>
      </div>
    </div>
  );
});

export default Step3;
