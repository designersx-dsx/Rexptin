import React, { useState, useEffect } from 'react'

import EditHeader from '../EditHeader/EditHeader'
import SectionHeader from '../SectionHeader/SectionHeader'
import SelectNameAvatar from "./Step3/Step3"
import styles from "./EditNameAvtar.module.css"
import AnimatedButton from '../AnimatedButton/AnimatedButton'
import { useAgentCreator } from '../../hooks/useAgentCreator'
import decodeToken from '../../lib/decodeToken'
import { useLocation, useNavigate } from 'react-router-dom'
import PopUp from '../Popup/Popup'
import { useDashboardStore } from '../../Store/agentZustandStore'

function EditNameAvtar() {
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [Loading, setLoading] = useState(null);
  const navigate = useNavigate();
  const { setHasFetched } = useDashboardStore()

  const token = localStorage.getItem("token");
  const decodeTokenData = decodeToken(token);
  const userId = decodeTokenData?.id;
  const agentnm = sessionStorage.getItem("agentName");

  const originalAvatarRef = React.useRef(sessionStorage.getItem("avatar"));
  const originalNameRef = React.useRef(sessionStorage.getItem("agentName"));
  const originalRoleRef = React.useRef(sessionStorage.getItem("agentRole"));
  const location = useLocation();
  const { isChanged } = location.state || {};

  useEffect(() => {
    if (isChanged) {
      setStepValidation({ isDirty: true })
    }
  }, [isChanged])

  const [stepValidation, setStepValidation] = useState({
    isDirty: false,
  });

  const handleValidationChange = (validation) => {
    setStepValidation({ isDirty: validation.isDirty });
  };
  const { handleCreateAgent } = useAgentCreator({
    stepValidator: () => "EditNameAvtar",
    setLoading,
    setPopupMessage,
    setPopupType,
    setShowPopup,
    navigate,
    setHasFetched,
  });


  const handleClick = () => {
    if (!sessionStorage.getItem('avatar')) {
      setPopupType("failed");
      setPopupMessage("Please select a Agent Avtar!");
      setShowPopup(true);
      return;
    } else {
      handleCreateAgent();
    }
  }

  return (
    <div>


      <EditHeader title='Edit Agent ' agentName={agentnm} />
      <div className={styles.Maindiv}>
        <SectionHeader
          heading="Name & Avatar"
          subheading="Choose the Name & Looks of your agent"
          highlight=""
        />
      </div>


      <div className={styles.container}>
        <SelectNameAvatar
          onValidationChange={handleValidationChange}
          originalAvatar={originalAvatarRef.current}
          originalName={originalNameRef.current}
          originalRole={originalRoleRef.current} />


        <div className={styles.stickyWrapper} onClick={handleClick}
          disabled={!stepValidation.isDirty} style={{
            position: "sticky",
            bottom: 0,
            backgroundColor: "white",
            padding: "8px",
            opacity: stepValidation.isDirty ? 1 : 0.5,
            cursor: stepValidation.isDirty ? "pointer" : "not-allowed"
          }}
        >
          <AnimatedButton label="Save" isLoading={Loading} disabled={!stepValidation.isDirty} />
        </div>



      </div>

      {showPopup && (
        <PopUp
          type={popupType}
          onClose={() => setShowPopup(false)}
          message={popupMessage}
          onConfirm={() => { }}
        />
      )}
    </div>
  )
}

export default EditNameAvtar