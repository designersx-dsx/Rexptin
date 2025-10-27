import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import styles from '../Step3/Step3.module.css';
import Slider from 'react-slick';
import Step4 from './Step4';
// import Step4 from '../Step4/Step4';

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

const Step3 = ({onValidationChange,originalRole,originalName,originalAvatar}) => {
  const sliderRef = useRef(null);
  const [agentName, setAgentName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [agentNameError, setAgentNameError] = useState('');
  const [gender, setGender] = useState(sessionStorage.getItem('agentGender'));
  const [availableAvatars, setAvailableAvatars] = useState([]);
  const EditingMode = localStorage.getItem("UpdationMode") === "ON";
  const [scale, setScale] = useState(1);

  const [avtarChecked,setAvtarChecked]=useState('')
  const [agentNote, setAgentNote] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [loading,setLoading]=useState(false)

  useEffect(() => {
    const storedGender = sessionStorage.getItem("agentGender") ;
    const capitalizeGender = gender.charAt(0).toUpperCase() + gender.slice(1);
    const storedAvatarImg = sessionStorage.getItem("avatar");
    const storedAgentName = sessionStorage.getItem("agentName") || localStorage.getItem("VoiceAgentName") || "";
    const localVoiceName = sessionStorage.getItem("VoiceAgentName") || "";
    const genderAvatars = avatars[capitalizeGender]
    setGender(storedGender);
    setAvailableAvatars(genderAvatars);
    if (storedAgentName) {
      setAgentName(storedAgentName);
    } else {
      setAgentName(localVoiceName);
       sessionStorage.setItem("agentName", localVoiceName)
    }

    if (storedAvatarImg) {
      const avatarIndex = genderAvatars.findIndex(av => av.img === storedAvatarImg);
      if (avatarIndex !== -1) {
        const matchedAvatar = genderAvatars[avatarIndex];
        setSelectedAvatar(matchedAvatar);
        setTimeout(() => {
          sliderRef.current?.slickGoTo(avatarIndex);
        }, 50);
      }
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
    setAvtarChecked(true)

     const isDirty = avatar?.img !== originalAvatar 
    onValidationChange?.({ isDirty });
  };

  const handleAgentNameChange = (e) => {
    const val = e.target.value;
    setAgentName(val);
    sessionStorage.setItem('agentName', val);
    if (val.trim()) setAgentNameError('');
    const isDirty = val !== originalName 
    onValidationChange?.({ isDirty });
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  return (
    <>
    <div className={styles.sliderContainer}>
      <Slider ref={sliderRef} {...settings}>
        {availableAvatars?.map((avatar, index) => (
          <div key={index} className={styles.slide} id="slideradio">
            <label className={styles.avatarLabel}>
              <input
                type="checkbox"
                name="avatar"
                value={index}
                checked={selectedAvatar?.img === avatar.img}
                onChange={() => handleAvatarChange(avatar)}
                className={styles.radioButton}
              />
              <img
                src={avatar.img}
                alt={`Avatar ${index + 1}`}
                className={styles.avatarImage}
              />
            </label>
            <div className={styles.labReq}>
              <div className={styles.agentInputBox} id='sliderstep'>
                <label className={styles.agentLabel}>Name Your Virtual Agent</label>
                <div className={styles.Dblock}>
                  <input
                    type="text"
                    name="agentName"
                    onChange={handleAgentNameChange}
                    className={styles.agentInput}
                    placeholder="Ex- Smith, Nova"
                    value={agentName}
                  />
                </div>
              </div>
              {agentNameError && (
                <p className={styles.agenterror}>{agentNameError}</p>
              )}
            </div>
          </div>
        ))}
      
      </Slider>

      <div className={styles.customBtn}>
        <div className={styles.arrowLeft} onClick={() => sliderRef.current.slickPrev()}>
          <img src="svg/sliderleft.svg" alt="Previous" />
        </div>
        <div className={styles.arrowRight} onClick={() => sliderRef.current.slickNext()}>
          <img src="svg/sliderRight.svg" alt="Next" />
        </div>
      </div>
    </div>
    {selectedAvatar &&
     <Step4 
                      onValidationChange={onValidationChange}
                      originalRole={originalRole}

     />
     }
     </>
  );
};

export default Step3;
