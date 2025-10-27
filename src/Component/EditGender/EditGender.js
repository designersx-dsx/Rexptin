import React,{useState} from 'react'
import EditHeader from '../EditHeader/EditHeader'
import SectionHeader from '../SectionHeader/SectionHeader'
import styles from "./EditGender.module.css"
import SelectGender from "./Step2/Step2"
import AnimatedButton from "../AnimatedButton/AnimatedButton"
import { useAgentCreator } from '../../hooks/useAgentCreator'
import decodeToken from '../../lib/decodeToken'
import { useNavigate } from 'react-router-dom'
import PopUp from '../Popup/Popup'
import { useDashboardStore } from '../../Store/agentZustandStore'


function EditGender() {
      const [showPopup, setShowPopup] = useState(false);
      const [popupType, setPopupType] = useState(null);
      const [popupMessage, setPopupMessage] = useState("");
      const [Loading, setLoading] = useState(null);
      const navigate=useNavigate();
      // const setHasFetched=true;
      const token = localStorage.getItem("token");
      const decodeTokenData = decodeToken(token);
      const userId = decodeTokenData?.id;
      const agentnm=sessionStorage.getItem("agentName");
      const { setHasFetched } =    useDashboardStore(); 
      const originalGender = React.useRef(sessionStorage.getItem("prevAgentGender"));
      const originalVoice = React.useRef(sessionStorage.getItem("agentVoice"));

      const { handleCreateAgent } = useAgentCreator({
      stepValidator: () => "EditGender",
      setLoading,
      setPopupMessage,
      setPopupType,
      setShowPopup,
      navigate,
      setHasFetched,
    });
const [stepValidation, setStepValidation] = useState({
  genderChanged: false,
  voiceSelected: false,
  isDirty: false,   // ✅ new flag

});
   const handleValidationChange = (validation) => {
  setStepValidation((prev) => ({
    ...prev,
    ...validation,
  }));
};
  const handleClick = () => {
  const storedGender = sessionStorage.getItem("agentGender");
  const prevAgentGender = sessionStorage.getItem('prevAgentGender');
  if (storedGender.toLocaleLowerCase() != prevAgentGender?.toLocaleLowerCase() ) {
    if (!stepValidation.voiceSelected) {
      setPopupType("failed");
      setPopupMessage("Please select a voice after changing gender!");
      setShowPopup(true);
      return;
    }
    setPopupType("confirm");
    setPopupMessage("Agent Gender Changed. Would you like to Update Agent Avatar?");
    setShowPopup(true);
    return; 

  } else {
    handleCreateAgent();
  }
};

  return (
    <div>
        
            <EditHeader title='Edit Agent ' agentName={agentnm} />
            <div className={styles.Maindiv}>
                <SectionHeader
                    heading="Select Gender"
                    subheading="Select the gender of your AI receptionist for your Business"
                    highlight=""
                />


                <div className={styles.container}>

               <SelectGender  onValidationChange={handleValidationChange}    originalGender={originalGender.current}
            originalVoice={originalVoice.current}/>

                </div>

                 <div className={styles.stickyWrapper}  onClick={stepValidation.isDirty ? handleClick : undefined}  disabled={!stepValidation.isDirty}    style={{
                        position: "sticky",
                        bottom: 0,
                        backgroundColor: "white",
                        padding: "8px",
                        opacity: stepValidation.isDirty ? 1 : 0.5,
                        cursor: stepValidation.isDirty ? "pointer" : "not-allowed"
                    }}>
                  <AnimatedButton label="Save" isLoading={Loading}  disabled={!stepValidation.isDirty}/>
                  </div>
            </div>
        {showPopup && (
            <PopUp
            type={popupType}
            onClose={()=>{setShowPopup(false)}}
            message={popupMessage}
            onConfirm={ ()=>{sessionStorage.removeItem('avatar'); // 🗑 Remove old avatar
                        setTimeout(() => {
                          navigate('/edit-name-avtar',{ state: { isChanged: true } }); // 🔥 Navigate back to avatar screen
                        }, 500);}}
            />
        )}
    </div>
  )
}

export default EditGender