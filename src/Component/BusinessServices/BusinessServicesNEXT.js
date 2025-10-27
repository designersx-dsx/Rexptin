import React, {
  useState, useEffect, useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../Component/CallTransfer/CallTransfer.module.css";
import { useAgentCreator } from "../../hooks/useAgentCreator";
import Loader from "../Loader/Loader";
import PopUp from "../Popup/Popup";
import { API_BASE_URL } from "../../Store/apiStore";
import decodeToken from "../../lib/decodeToken";
import axios from "axios";
const AboutBusinessNext = forwardRef(({ onNext, onBack, onValidationError, onSuccess, onFailed, setLoading, onStepChange }, ref) => {
  const navigate = useNavigate();
  const [services, setServices] = useState([{ service: "" }]);
  const stepEditingMode = localStorage.getItem("UpdationModeStepWise");
  const sessionBusinessiD = sessionStorage.getItem("bId");
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);
  // const [Loading, setLoading] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const EditingMode = localStorage.getItem("UpdationMode");
  const [email, setEmail] = useState("");
  const [isSubmitClicked, setIsSubmitClicked] = useState(false);
  const [isSkipClicked, setIsSkipClicked] = useState(false);
  // Error states
  const setHasFetched = true;
  const token = localStorage.getItem("token");
  const decodeTokenData = decodeToken(token);
  const userId = decodeTokenData?.id;
  const { handleCreateAgent } = useAgentCreator({
    stepValidator: () => "businesServices",
    setLoading,
    setPopupMessage,
    setPopupType,
    setShowPopup,
    navigate,
    setHasFetched,
  });
  const businessDetails = JSON.parse(sessionStorage.getItem("businessDetails"));
  const businesServices = JSON.parse(sessionStorage.getItem("businesServices"));
  // console.log(businesServices)
  const servicesType= Object.values(businesServices).filter(
  (val) => typeof val === "string" && val !== "" && val !== "email"
);
  
  // console.log(servicesType, "servicesType")
  const rawCustomServices =
    JSON.parse(sessionStorage.getItem("selectedCustomServices")) || [];
  useEffect(() => {
    let savedServices = sessionStorage.getItem("selectedCustomServices");
    try {
      savedServices = JSON.parse(savedServices);
      if (typeof savedServices === "string") {
        savedServices = JSON.parse(savedServices);
      }

      if (Array.isArray(savedServices) && savedServices.length > 0) {
        setServices(savedServices);
      } else {
        setServices([{ service: "" }]);
      }
      setEmail(businesServices?.email || "");

    } catch (err) {
      console.error("Error parsing selectedCustomServices:", err);
      setServices([{ service: "" }]);
    }
  }, []);

  const handleAddService = () => {
    setServices([...services, { service: "" }]);
  };

  const handleServiceChange = (index, value) => {
    const updatedServices = [...services];
    updatedServices[index].service = value;
    setServices(updatedServices);
    sessionStorage.setItem(
      "selectedCustomServices",
      JSON.stringify(updatedServices)
    );
  };
  const checkIfBusinessIdExist = Boolean(sessionStorage.getItem("bId"))
  const handleSubmit = async () => {
    setIsSubmitClicked(true);
    const raw = sessionStorage.getItem("businesServices");
    let previous = {};
    try {
      previous = raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.error("Failed to parse businesServices:", err);
    }
    const updatedBusinessServices = {
      ...previous,
      email,
    };
    sessionStorage.setItem(
      "businesServices",
      JSON.stringify(updatedBusinessServices)
    );
    const filteredServices = services
      .map((item) => item.service.trim())
      .filter((service) => service !== "")
      .map((service) => ({ service }));
    try {
      setLoading(true);
      const cleanedCustomServices = rawCustomServices
        .map((item) => item?.service?.trim())
        .filter(Boolean)
        .map((service) => ({ service }));
      let response;
      if (!checkIfBusinessIdExist) {
        response = await axios.post(`${API_BASE_URL}/businessDetails/create`, {
          userId,
          businessName: businessDetails?.businessName,
          businessSize: businessDetails.businessSize,
          businessType: businessDetails.businessType,
          customBuisness: businessDetails?.customBuisness || "",
          buisnessEmail: email || businessDetails?.email,
          buisnessService: cleanServiceArray(),
          customServices: filteredServices,
        });
        if (onSuccess) {

          if ((servicesType.includes("Other"))) {

            setTimeout(() => {
              onStepChange?.(1);
            }, 2000);
          }
          else {
            onSuccess({
              message: "Business details added successfully",
            });
            setTimeout(() => {
              onStepChange?.(3);
            }, 2000);
          }
        }
      } else {
        response = await axios.patch(
          `${API_BASE_URL}/businessDetails/updateBusinessDetailsByUserIDandBuisnessID/${userId}?businessId=${sessionBusinessiD}`,
          {
            businessName: businessDetails?.businessName,
            businessSize: businessDetails.businessSize,
            businessType: businessDetails.businessType,
            buisnessEmail: email || businessDetails?.email,
            customBuisness: businessDetails?.customBuisness || "",
            buisnessService: cleanServiceArray(),
            customServices: filteredServices,
          }
        );
        if (onSuccess) {
          onSuccess({
            message: "Business details added successfully",
          });
          setTimeout(() => {
            onStepChange?.(3);
          }, 2000);
        }
      }

      const id = response.data.businessId;
      sessionStorage.setItem(
        "businessId",
        JSON.stringify({
          businessId: id,
        })
      );
      sessionStorage.setItem("bId", id);
      setTimeout(() => {
        sessionStorage.setItem(
          "selectedCustomServices",
          JSON.stringify(filteredServices)
        );
      }, 1000);
    } catch (error) {
      if (onFailed) {
        if ((servicesType?.includes("Other"))) {

          setTimeout(() => {
            onStepChange?.(1);
          }, 2000);
        }
        else {
          onFailed({
            message: "Business details added failed",
          });
        }
      }

      console.error(error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };
  const handleSkip = () => {
    setIsSkipClicked(true);
    handleSubmit();
  };
  const handleSaveEdit = (e) => {

    e.preventDefault();
    const filteredServices = services
      .map((item) => item.service.trim())
      .filter((service) => service !== "")
      .map((service) => ({ service }));
    sessionStorage.setItem(
      "selectedCustomServices",
      JSON.stringify(filteredServices)
    );
    handleCreateAgent();
  };

  const handleRemoveService = (index) => {
    const updatedServices = services.filter((_, i) => i !== index);
    setServices(updatedServices.length ? updatedServices : [{ service: "" }]);

    let filteredServices = services
      .map((item) => item?.service.trim())
      .filter((service) => service !== "")
      .map((service) => ({ service }));

    filteredServices = services?.filter((_, i) => i !== index);
    sessionStorage.setItem(
      "selectedCustomServices",
      JSON.stringify(filteredServices)
    );
  };
  //Using Error Handling
  useImperativeHandle(ref, () => ({
    validate: async () => {
      return true
    },
    save: async () => { await handleSubmit(); }
  }));

  return (
    <>
      {/* <HeaderBar></HeaderBar> */}
      <div className={styles.CallTransferMain1}>
        <div className={styles.headrPart}>
          {/* <h2>Add More Services</h2> */}
          <img
            src="svg/Add-icon.svg"
            alt="Add-icon"
            onClick={handleAddService}
            className={styles.addIcon}
          />
        </div>
        {services.map((item, index) => (
          <>
            <div key={index} className={styles.card}>
              <label className={styles.label}>Service Name</label>
              <div className={styles.phoneInput}>
                <input
                  type="text"
                  className={styles.phoneNumberInput}
                  placeholder="Enter Your Service Name"
                  value={item.service}
                  onChange={(e) => handleServiceChange(index, e.target.value)}
                />
                {services.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => handleRemoveService(index)}
                  >
                    ❌
                  </button>
                )}
              </div>
            </div>
          </>
        ))}

        <div onClick={isSubmitClicked ? undefined : handleSkip} style={{ pointerEvents: isSubmitClicked ? "none" : "auto", opacity: isSubmitClicked ? 0.5 : 1 }} className={styles.skipButton}>
          {stepEditingMode ? "" : <button>Skip for now</button>}
        </div>
        {/* {stepEditingMode != "ON" ? (
          <div className={styles.Btn} onClick={isSkipClicked ? undefined : handleSubmit} style={{ pointerEvents: isSkipClicked ? "none" : "auto", opacity: isSkipClicked ? 0.5 : 1 }}
          >
            <div type="submit">
              <div className={styles.btnTheme} style={{ pointerEvents: Loading ? "none" : "auto", opacity: Loading ? 0.6 : 1 }} >
                <img src="svg/svg-theme2.svg" alt="Submit" />
                <p>
                  {Loading ? <>Submitting &nbsp; &nbsp; <Loader size={20} /> </> : " Submit"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.Btn} onClick={handleSaveEdit} >
            <div type="submit">
              <div className={styles.btnTheme} style={{ pointerEvents: Loading ? "none" : "auto", opacity: Loading ? 0.6 : 1 }}>
                <img src="svg/svg-theme2.svg" alt="Submit" />
                <p>{Loading ? <> Saving &nbsp; &nbsp; <Loader size={20} /></> : "Save Edits"}</p>
              </div>
            </div>
          </div>
        )} */}
        <PopUp
          type={popupType}
          message={popupMessage}
          onClose={() => setPopupMessage("")} // Close the popup
        />
      </div>
    </>
  );
});

export default AboutBusinessNext;

const cleanServiceArray = () => {
  try {
    let raw;
    if (localStorage.getItem("UpdationMode") != "ON") {
      raw = sessionStorage.getItem("businessDetails");
    } else {
      raw = raw = sessionStorage.getItem("businessDetails");
    }
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.selectedService)) {
      return parsed.selectedService;
    } else if (
      typeof parsed?.selectedService === "object" &&
      Array.isArray(parsed.selectedService.selectedService)
    ) {
      return parsed.selectedService.selectedService;
    }
    return [];
  } catch {
    return [];
  }
};
