import React, { useEffect, useRef, useState } from "react";
import styles from "./Dashboard.module.css";
import Footer from "../AgentDetails/Footer/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import {
  EndWebCallUpdateAgentMinutesLeft,
  fetchDashboardDetails,
} from "../../Store/apiStore";
import decodeToken from "../../lib/decodeToken";
import { useDashboardStore } from "../../Store/agentZustandStore";
import OffCanvas from "../OffCanvas/OffCanvas";
import { RetellWebClient } from "retell-client-js-sdk";
import useUser from "../../Store/Context/UserContext";
import Modal2 from "../Modal2/Modal2";
import CallTest from "../CallTest/CallTest";
import WidgetScript from "../Widgets/WidgetScript";
import Popup from "../Popup/Popup";
import CaptureProfile from "../Popup/profilePictureUpdater/CaptureProfile";
import UploadProfile from "../Popup/profilePictureUpdater/UploadProfile";
import AssignNumberModal from "../AgentDetails/AssignNumberModal";
import Modal from "../Modal/Modal";
import Plan from "../Plan/Plan";
function Dashboard() {
  const { agents, totalCalls, hasFetched, setDashboardData, setHasFetched } =
    useDashboardStore();
  const navigate = useNavigate();
  const { user } = useUser();

  // Retell Web Client states
  const [retellWebClient, setRetellWebClient] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [openCallModal, setOpenCallModal] = useState(false);
  const [agentDetails, setAgentDetails] = useState(null);
  const [openWidgetModal, setOpenWidgetModal] = useState(false);

  // UserId decoded from token
  const token = localStorage.getItem("token") || "";
  const decodeTokenData = decodeToken(token);
  const userIdFromToken = decodeTokenData?.id || "";
  const [userId, setUserId] = useState(userIdFromToken);

  const [agentId, setagentId] = useState()
  const location = useLocation();

  const locationPath = location.pathname
  console.log("loca",locationPath)

  // Agents and UI states
  const [localAgents, setLocalAgents] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openOffcanvas, setOpenOffcanvas] = useState(false);

  // Cal API modal & event states
  const [isCalModalOpen, setIsCalModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isApiKeyEditable, setIsApiKeyEditable] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventSlug, setEventSlug] = useState("");
  const [eventLength, setEventLength] = useState("");
  const [showEventInputs, setShowEventInputs] = useState(false);
  const [eventCreateStatus, setEventCreateStatus] = useState(null);
  const [eventCreateMessage, setEventCreateMessage] = useState("");
  const planStyles = ["MiniPlan", "ProPlan", "Maxplan"];

  //cal
  const isValidCalApiKey = (key) => key.startsWith("cal_live_");
  const [showCalKeyInfo, setShowCalKeyInfo] = useState(false);
  const [bookingCount, setBookingCount] = useState(0);

  const [callId, setCallId] = useState(null);


  //pop0up
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [callLoading, setCallLoading] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState();

  //cam-icon
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAgentForAssign, setSelectedAgentForAssign] = useState(null);


  const [isAssignNumberModalOpen, setIsAssignNumberModalOpen] = useState(false);

  const openAssignNumberModal = () => setIsAssignNumberModalOpen(true);
  const closeAssignNumberModal = () => setIsAssignNumberModalOpen(false);

  // upgrade
  const [open, setOpen] = useState(false);



  const handleAssignNumberClick = (agent, e) => {
    e.stopPropagation();
    const planName = agent?.subscription?.product_name || "Free";


    if (planName.toLowerCase() === "free") {
      openAssignNumberModal();
    } else {
      setSelectedAgentForAssign(agent);
      setIsAssignModalOpen(true);
    }
  };


  // Navigate on agent card click
  const handleCardClick = (agent) => {
    localStorage.setItem("selectedAgentAvatar", agent?.avatar);
    navigate("/agent-detail", {
      state: { agentId: agent.agent_id, bussinesId: agent.businessId },
    });
  };
  useEffect(() => {
    // const agents = JSON.parse(localStorage.getItem("agents")) || [];
    const agentWithCalKey = localAgents?.find((agent) => agent.calApiKey);

    if (agentWithCalKey?.calApiKey) {
      const fetchBookings = async () => {
        try {
          const response = await fetch(
            `https://api.cal.com/v1/bookings?apiKey=${encodeURIComponent(
              agentWithCalKey.calApiKey
            )}`
          );
          if (!response.ok) throw new Error("Failed to fetch bookings");

          const data = await response.json();
          setBookingCount(data.bookings?.length || 0);
        } catch (error) {
          console.error("Error fetching booking count:", error);
          setBookingCount(0);
        }
      };

      fetchBookings();
    }
  }, []);
  // Open Cal modal & set current agent + API key
  const handleCalClick = (agent, e) => {
    e.stopPropagation();
    setSelectedAgent(agent);
    const agentInLocal = localAgents?.find(
      (a) => a.agent_id === agent.agent_id
    );
    setApiKey(agentInLocal?.calApiKey || "");
    setIsApiKeyEditable(false);
    setShowEventInputs(false);
    setEventCreateStatus(null);
    setEventCreateMessage("");
    setEventName("");
    setEventSlug("");
    setEventLength("");
    setIsCalModalOpen(true);
  };

  // Fetch Cal API keys from backend
  const fetchCalApiKeys = async (userId) => {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/agent/calapikeys/${userId}`
    );
    if (!response.ok) throw new Error("Failed to fetch Cal API keys");
    const data = await response.json();
    return data.agents;
  };

  // Load from localStorage on mount
  // useEffect(() => {
  //   const savedUserId = localStorage.getItem("userId");
  //   const savedAgents = localStorage.getItem("agents");
  //   if (savedUserId) setUserId(savedUserId);
  //   if (savedAgents) setLocalAgents(JSON.parse(savedAgents));
  // }, []);

  // Fetch dashboard + merge Cal API keys
  // console.log('localAgents-----',localAgents)
  useEffect(() => {
    const fetchAndMergeCalApiKeys = async () => {
      if (!userId) return;
      try {
        const res = await fetchDashboardDetails(userId);

        console.log(res, hasFetched, "HELOE")
        let agentsWithCalKeys = res.agents || [];
        const calApiAgents = await fetchCalApiKeys(userId);
        const calApiKeyMap = {};

        calApiAgents.forEach((agent) => {
          calApiKeyMap[agent.agent_id] = agent.calApiKey || null;
        });
        agentsWithCalKeys = agentsWithCalKeys.map((agent) => ({
          ...agent,
          calApiKey: calApiKeyMap[agent.agent_id] || null,
        }));
        console.log("res", res);
        setDashboardData(agentsWithCalKeys, res.total_call || 0);
        setHasFetched(true);
        // localStorage.setItem("userId", userId);
        // localStorage.setItem("agents", JSON.stringify(agentsWithCalKeys));
        setLocalAgents(agentsWithCalKeys);
      } catch (error) {
        console.error("Error fetching dashboard data or Cal API keys:", error);
      }
    };
    if ((!hasFetched || !agents.length) && userId) {
      fetchAndMergeCalApiKeys();
    }
  }, [userId, hasFetched, agents.length, setDashboardData, setHasFetched]);

  // Sync local agents with store
  useEffect(() => {
    if (agents && agents.length > 0) {
      setLocalAgents(agents);
      // localStorage.setItem("agents", JSON.stringify(agents));
    }
  }, [agents]);

  // Submit API key for selected agent
  const handleApiKeySubmit = async () => {
    if (!selectedAgent) return;

    if (!isValidCalApiKey(apiKey.trim())) {
      setPopupType("failed");
      setPopupMessage("Invalid API Key! It must start with 'cal_live_'.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/agent/update-calapikey/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ calApiKey: apiKey.trim() }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update API key");
      }

      const updatedAgents = localAgents.map((agent) =>
        agent.agent_id === selectedAgent.agent_id
          ? { ...agent, calApiKey: apiKey.trim() }
          : agent
      );

      setLocalAgents(updatedAgents);
      // localStorage.setItem("agents", JSON.stringify(updatedAgents));

      setShowEventInputs(true);
      setShowCalKeyInfo(true);
    } catch (error) {
      setPopupType("failed");
      setPopupMessage(`Failed to save API Key: ${error.message}`);
    }
  };

  // Create Cal event
  const createCalEvent = async () => {
    if (!apiKey.trim()) {
      alert("API Key is required to create an event.");
      return;
    }
    if (!eventName.trim() || !eventSlug.trim() || !eventLength.trim()) {
      alert("Please fill all event fields.");
      return;
    }
    try {
      const url = `https://api.cal.com/v1/event-types?apiKey=${encodeURIComponent(
        apiKey.trim()
      )}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventName.trim(),
          slug: eventSlug.trim(),
          length: parseInt(eventLength, 10),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create event");
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to create event");
      }

      const eventTypeId = responseData.event_type.id;

      // Show success message first
      setPopupType("success");
      setPopupMessage("Your Cal event has been created successfully!");
      setShowCalKeyInfo(false);

      const retellPayload = {
        general_tools: [
          {
            type: "book_appointment_cal",
            name: "cal_tool",
            cal_api_key: selectedAgent.calApiKey,
            event_type_id: eventTypeId,
          },
        ],
      };

      const retellUrl = `https://api.retellai.com/update-retell-llm/${selectedAgent.llmId}`;

      const retellResponse = await fetch(retellUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
        },
        body: JSON.stringify(retellPayload),
      });
      if (!retellResponse.ok) {
        const retellError = await retellResponse.json();
        console.error("Error updating Retell LLM:", retellError);
      } else {
        console.log("Retell LLM updated successfully!");
      }
      setEventName("");
      setEventSlug("");
      setEventLength("");
      setTimeout(() => {
        closeModal();
      }, 1000);
    } catch (error) {
      setEventCreateStatus("error");
      setEventCreateMessage(`Error creating event: ${error.message}`);
      console.error("Error in createCalEvent:", error);
    }
  };
  const closeModal = () => {
    setIsCalModalOpen(false);
    setApiKey("");
    setSelectedAgent(null);
    setShowEventInputs(false);
    setEventCreateStatus(null);
    setEventCreateMessage("");
  };

  const toggleDropdown = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleDelete = (id) => {
    alert(`Delete clicked for card ${id}`);
    setOpenDropdown(null);
  };

   const handleUpgradeClick = (agent) => {
  
     console.log({agent})
    setagentId(agent);
    // Then open the modal
    setOpen(true);
  };

  const handleOpencanvas = () => {
    setOpenOffcanvas(true);
  };
  const handleCloseOffcanvas = () => {
    setOpenOffcanvas(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("agents");
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/signup";
  };

  // Retell Web Client initializationcxcxc
  useEffect(() => {
    const client = new RetellWebClient();
    client.on("call_started", () => setIsCallActive(true));
    client.on("call_ended", () => setIsCallActive(false));
    setRetellWebClient(client);
  }, []);
  // Start call
  const handleStartCall = async () => {
    if (!retellWebClient || !agentDetails) {
      console.error("RetellWebClient or agent details not ready.");
      return;
    }
    setCallLoading(false);

    try {
      setCallLoading(true);
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/agent/create-web-call`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent_id: agentDetails.agent_id }),
        }
      );
      const data = await res.json();
      console.log(data);
      await retellWebClient.startCall({ accessToken: data.access_token });
      setCallId(data?.call_id);
    } catch (err) {
      console.error("Error starting call:", err);
    } finally {
      setCallLoading(false);
    }
  };

  // End call
  const handleEndCall = async () => {
    if (retellWebClient) {
      const response = await retellWebClient.stopCall();
      const payload = { agentId: agentDetails.agent_id, callId: callId };
      const DBresponse = await EndWebCallUpdateAgentMinutesLeft(payload);
      console.log("Call end response", response);
    }
  };

  // Open call modal
  const handleOpenCallModal = (agent) => {
    setAgentDetails(agent);
    sessionStorage.setItem("agentDetails", JSON.stringify(agent));
    setOpenCallModal(true);
  };

  // Close call modal
  const handleCloseCallModal = () => {
    setOpenCallModal(false);
  };

  // Open Widget modal
  const handleOpenWidgetModal = (agent) => {
    setOpenWidgetModal(true);
    setAgentDetails(agent);
  };

  // Close Widget modal
  const handleCloseWidgetModal = () => {
    setOpenWidgetModal(false);
  };

  //close camera option click outside
  const toggleProfileDropdown = () => {
    setIsUploadModalOpen((prev) => !prev);
  };

  // Close the dropdown if clicked outside
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (profileRef.current && !profileRef.current.contains(event.target)) {
  //       setIsUploadModalOpen(false); // Close dropdown if clicked outside
  //     }
  //   };
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  // Open upload modal
  const openUploadModal = () => {
    setIsUploadModalOpen(true);
    setIsDropdownOpen(false);
  };

  // Close upload modal
  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  const handleUpload = (image) => {
    setUploadedImage(image);
    closeUploadModal();
  };
  console.log('URSER', localAgents.subscription)
  return (
    <div>
      <div className={styles.forSticky}>
        <header className={styles.header}>
          <div className={styles.profileSection} ref={profileRef}>
            <div>
              <button
                className={styles.avatarBtn}
                onClick={openUploadModal} // Toggle dropdown visibility on avatar click
              >
                <img
                  src={
                    user?.profile ||
                    capturedImage ||
                    uploadedImage ||
                    "images/camera-icon.avif"
                  }
                  alt="Profile"
                  className={styles.profilePic}
                  onError={(e) => { e.target.src = "images/camera-icon.avif"; }}
                />
              </button>
            </div>
            <div>
              <p className={styles.greeting}>Hello!</p>
              <h2 className={styles.name}>{user?.name || "John Vick"}</h2>
            </div>
            {isUploadModalOpen && (
              <UploadProfile
                onClose={closeUploadModal}
                onUpload={handleUpload}
                currentProfile={uploadedImage || user?.profile || "images/camera-icon.avif"}
              />
            )}
          </div>
          <div className={styles.notifiMain}>
            <div className={styles.notificationIcon}>
              <svg
                width="20"
                height="22"
                viewBox="0 0 20 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M10 4.68945C10.4142 4.68945 10.75 5.02524 10.75 5.43945V8.76945C10.75 9.18367 10.4142 9.51945 10 9.51945C9.58579 9.51945 9.25 9.18367 9.25 8.76945V5.43945C9.25 5.02524 9.58579 4.68945 10 4.68945Z"
                  fill="#0A0A0A"
                  fill-opacity="0.9"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M2.61001 7.66C2.61001 3.56579 5.9258 0.25 10.02 0.25C14.0946 0.25 17.4289 3.58574 17.44 7.65795L17.44 7.65898V9.76C17.44 10.0064 17.4942 10.3614 17.5969 10.7349C17.6997 11.1089 17.8345 11.441 17.9621 11.6525L17.9628 11.6535L19.2334 13.7746L19.2336 13.7749C20.2082 15.4038 19.4348 17.519 17.6272 18.1215L17.6269 18.1216L17.6267 18.1217C12.693 19.7628 7.35696 19.7628 2.42329 18.1217L2.42306 18.1216L2.42284 18.1215C1.50673 17.8161 0.827321 17.1773 0.523982 16.3562C0.220761 15.5354 0.320841 14.6072 0.815592 13.7763L0.816106 13.7754L2.08724 11.6535L2.08787 11.6525C2.21604 11.4401 2.35075 11.1098 2.45325 10.7381C2.55563 10.3669 2.61001 10.0118 2.61001 9.76V7.66ZM10.02 1.75C6.75423 1.75 4.11001 4.39421 4.11001 7.66V9.76C4.11001 10.1882 4.02439 10.6831 3.89927 11.1369C3.7744 11.5897 3.59436 12.0589 3.37286 12.4263C3.37262 12.4267 3.37239 12.4271 3.37215 12.4275L2.10443 14.5437C2.10428 14.544 2.10413 14.5442 2.10398 14.5445C1.81916 15.0233 1.79933 15.4798 1.93104 15.8363C2.0627 16.1927 2.37329 16.5239 2.89718 16.6985C7.52323 18.2372 12.5268 18.2372 17.1528 16.6985C18.0452 16.401 18.4317 15.3562 17.9464 14.5451L16.6778 12.4275C16.6777 12.4272 16.6775 12.427 16.6774 12.4267C16.4552 12.0583 16.2752 11.5858 16.1506 11.1326C16.0258 10.6786 15.94 10.1836 15.94 9.76V7.66107C15.9306 4.41373 13.2651 1.75 10.02 1.75Z"
                  fill="#0A0A0A"
                  fill-opacity="0.9"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M7.41992 17.8203C7.41992 18.5204 7.71292 19.1727 8.18025 19.64L8.18027 19.64C8.64755 20.1073 9.2998 20.4003 9.99988 20.4003C11.4157 20.4003 12.5799 19.2361 12.5799 17.8203H14.0799C14.0799 20.0645 12.2441 21.9003 9.99988 21.9003C8.87997 21.9003 7.85223 21.4333 7.11959 20.7006M7.11957 20.7006C6.38691 19.968 5.91992 18.9402 5.91992 17.8203H7.41992"
                  fill="#0A0A0A"
                  fill-opacity="0.9"
                />
              </svg>
            </div>
            <div className={styles.notificationIcon} onClick={handleOpencanvas}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M17.448 1.75C16.5495 1.74997 15.8003 1.74995 15.2055 1.82991C14.5777 1.91432 14.0109 2.09999 13.5555 2.55546C13.1 3.01093 12.9143 3.57773 12.8299 4.20552C12.7499 4.8003 12.75 5.54951 12.75 6.44798V6.552C12.75 7.45047 12.7499 8.19971 12.8299 8.79448C12.9143 9.42228 13.1 9.98908 13.5555 10.4445C14.0109 10.9 14.5777 11.0857 15.2055 11.1701C15.8003 11.2501 16.5495 11.25 17.448 11.25H17.552C18.4505 11.25 19.1997 11.2501 19.7945 11.1701C20.4223 11.0857 20.9891 10.9 21.4445 10.4445C21.9 9.98908 22.0857 9.42228 22.1701 8.79448C22.2501 8.1997 22.25 7.45048 22.25 6.552V6.44801C22.25 5.54953 22.2501 4.80031 22.1701 4.20552C22.0857 3.57773 21.9 3.01093 21.4445 2.55546C20.9891 2.09999 20.4223 1.91432 19.7945 1.82991C19.1997 1.74995 18.4505 1.74997 17.552 1.75H17.448ZM14.6161 3.61612C14.7464 3.4858 14.9439 3.37858 15.4054 3.31654C15.8884 3.2516 16.536 3.25 17.5 3.25C18.464 3.25 19.1116 3.2516 19.5946 3.31654C20.0561 3.37858 20.2536 3.4858 20.3839 3.61612C20.5142 3.74644 20.6214 3.94393 20.6835 4.4054C20.7484 4.88843 20.75 5.53599 20.75 6.5C20.75 7.46401 20.7484 8.11157 20.6835 8.59461C20.6214 9.05607 20.5142 9.25357 20.3839 9.38389C20.2536 9.5142 20.0561 9.62143 19.5946 9.68347C19.1116 9.74841 18.464 9.75 17.5 9.75C16.536 9.75 15.8884 9.74841 15.4054 9.68347C14.9439 9.62143 14.7464 9.5142 14.6161 9.38389C14.4858 9.25357 14.3786 9.05607 14.3165 8.59461C14.2516 8.11157 14.25 7.46401 14.25 6.5C14.25 5.53599 14.2516 4.88843 14.3165 4.4054C14.3786 3.94393 14.4858 3.74644 14.6161 3.61612Z"
                  fill="#0A0A0A"
                  fill-opacity="0.9"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M6.44801 12.75C5.54954 12.75 4.8003 12.7499 4.20552 12.8299C3.57773 12.9143 3.01093 13.1 2.55546 13.5555C2.09999 14.0109 1.91432 14.5777 1.82991 15.2055C1.74995 15.8003 1.74997 16.5495 1.75 17.448V17.552C1.74997 18.4505 1.74995 19.1997 1.82991 19.7945C1.91432 20.4223 2.09999 20.9891 2.55546 21.4445C3.01093 21.9 3.57773 22.0857 4.20552 22.1701C4.80031 22.2501 5.54953 22.25 6.44801 22.25H6.552C7.45048 22.25 8.1997 22.2501 8.79448 22.1701C9.42228 22.0857 9.98908 21.9 10.4445 21.4445C10.9 20.9891 11.0857 20.4223 11.1701 19.7945C11.2501 19.1997 11.25 18.4505 11.25 17.552V17.448C11.25 16.5495 11.2501 15.8003 11.1701 15.2055C11.0857 14.5777 10.9 14.0109 10.4445 13.5555C9.98908 13.1 9.42228 12.9143 8.79448 12.8299C8.19971 12.7499 7.4505 12.75 6.55203 12.75H6.44801ZM3.61612 14.6161C3.74644 14.4858 3.94393 14.3786 4.4054 14.3165C4.88843 14.2516 5.53599 14.25 6.5 14.25C7.46401 14.25 8.11157 14.2516 8.59461 14.3165C9.05607 14.3786 9.25357 14.4858 9.38389 14.6161C9.5142 14.7464 9.62143 14.9439 9.68347 15.4054C9.74841 15.8884 9.75 16.536 9.75 17.5C9.75 18.464 9.74841 19.1116 9.68347 19.5946C9.62143 20.0561 9.5142 20.2536 9.38389 20.3839C9.25357 20.5142 9.05607 20.6214 8.59461 20.6835C8.11157 20.7484 7.46401 20.75 6.5 20.75C5.53599 20.75 4.88843 20.7484 4.4054 20.6835C3.94393 20.6214 3.74644 20.5142 3.61612 20.3839C3.4858 20.2536 3.37858 20.0561 3.31654 19.5946C3.2516 19.1116 3.25 18.464 3.25 17.5C3.25 16.536 3.2516 15.8884 3.31654 15.4054C3.37858 14.9439 3.4858 14.7464 3.61612 14.6161Z"
                  fill="#0A0A0A"
                  fill-opacity="0.9"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M1.75 6.5C1.75 3.87665 3.87665 1.75 6.5 1.75C9.12336 1.75 11.25 3.87665 11.25 6.5C11.25 9.12336 9.12336 11.25 6.5 11.25C3.87665 11.25 1.75 9.12336 1.75 6.5ZM6.5 3.25C4.70508 3.25 3.25 4.70508 3.25 6.5C3.25 8.29493 4.70508 9.75 6.5 9.75C8.29493 9.75 9.75 8.29493 9.75 6.5C9.75 4.70508 8.29493 3.25 6.5 3.25Z"
                  fill="#0A0A0A"
                  fill-opacity="0.9"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M12.75 17.5C12.75 14.8767 14.8767 12.75 17.5 12.75C20.1234 12.75 22.25 14.8767 22.25 17.5C22.25 20.1234 20.1234 22.25 17.5 22.25C14.8767 22.25 12.75 20.1234 12.75 17.5ZM17.5 14.25C15.7051 14.25 14.25 15.7051 14.25 17.5C14.25 19.2949 15.7051 20.75 17.5 20.75C19.2949 20.75 20.75 19.2949 20.75 17.5C20.75 15.7051 19.2949 14.25 17.5 14.25Z"
                  fill="#0A0A0A"
                  fill-opacity="0.9"
                />
              </svg>
            </div>
          </div>
        </header>

        <section className={styles.agentCard}>
          <div className={styles.agentInfo}>
            <h2>{totalCalls || 0}</h2>
            <img src="svg/total-call.svg" alt="total-call" />
          </div>
          <hr />
          <div className={styles.agentInfo2}>
            <h2>{bookingCount}</h2>
            <img src="svg/calender-booking.svg" alt="calender-booking" />
          </div>
        </section>
      </div>

      <div className={styles.main}>
        {localAgents?.map((agent) => {
          const planStyles = ['MiniPlan', 'ProPlan', 'Maxplan'];
          const randomPlan = `${agent?.subscription?.product_name}Plan`;
          // console.log('randomPlan',randomPlan)
          let assignedNumbers = [];
          if (agent.voip_numbers) {
            try {
              assignedNumbers = JSON.parse(agent?.voip_numbers);
            } catch {
              assignedNumbers = [];
            }
          }
          return (
            <div
              key={agent.agent_id}
              className={`${styles.LangStyle} ${styles[randomPlan]}`}
              onClick={() => handleCardClick(agent)}
            >
              <div className={styles?.PlanPriceMain}>
                <h3 className={styles?.PlanPrice}>



                  {agent?.subscription?.product_name || "Free"}{" Plan"}



                </h3>
              </div>
              <div className={styles.Lang}>
                <div className={styles.LangItem}>
                  <div className={styles.LangIcon}>
                    <div className={styles.agentAvatarContainer}>
                      <img
                        src={agent?.avatar || "images/SofiaAgent.png"}
                        alt="English"
                      />
                    </div>
                    {/* <img src={"images/SofiaAgent.png"}alt="English" /> */}
                  </div>
                  <div className={styles.LangText}>
                    <h3 className={styles.agentName}>
                      {agent.agentName}{" "}
                      <span className={styles.activeText}>Active</span>
                    </h3>
                    <p className={styles.agentAccent}>
                      {agent?.agentLanguage} •{agent?.agentAccent}
                    </p>
                  </div>
                </div>

                <div
                  className={styles.FilterIcon}
                  onClick={(e) => toggleDropdown(e, agent.agent_id)}
                >
                  <svg
                    width="18"
                    height="4"
                    viewBox="0 0 18 4"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="2" cy="2" r="2" fill="black" />
                    <circle cx="9" cy="2" r="2" fill="black" />
                    <circle cx="16" cy="2" r="2" fill="black" />
                  </svg>
                  {openDropdown === agent?.agent_id && (
                    <div className={styles.OptionsDropdown}>
                      <div
                        className={styles.OptionItem}
                        onClick={() => handleOpenCallModal(agent)}
                      >
                        Test Agent
                      </div>
                      <div
                        className={styles.OptionItem}
                        onClick={() => handleOpenWidgetModal(agent)}
                      >
                        Integrate
                      </div>
                      <div className={styles.OptionItem} onClick={() => ""}>
                        Call Settings
                      </div>
                      <div className={styles.OptionItem} onClick={() => ""}>
                        Edit Agent
                      </div>
                      <div
                        className={styles.OptionItem}
                        // onClick={() => setagentId(agent.agent_id)}
                        onClick={() => handleUpgradeClick(agent.agent_id)}
                      >
                        Upgrade
                      </div>
                      <div
                        className={styles.OptionItem}
                        onClick={() => handleDelete(agent.agent_id)}
                      >
                        Delete Agent
                      </div>

                      {/* <div
                                                className={styles.OptionItem}
                                            >
                                                Test Call
                                            </div> */}
                      {/* <div
                                                className={styles.OptionItem}
                                                onClick={() => handleOpenWidgetModal(agent)}
                                            >
                                                Widget
                                            </div> */}
                    </div>
                  )}
                </div>
              </div>
              <hr className={styles.agentLine} />

              <div className={styles.LangPara}>
                <p className={styles.agentPara}>
                  For: <strong>{agent.business.businessName}</strong>
                </p>
                <div className={styles.VIA}>
                  {agent.calApiKey ? (
                    <img
                      src="svg/cal-svg.svg"
                      alt="cal-svg"
                      style={{ cursor: "pointer" }}
                      onClick={(e) => handleCalClick(agent, e)}
                    />
                  ) : (
                    <img
                      src="svg/call-cross.svg"
                      alt="No API Key"
                      style={{ cursor: "pointer" }}
                      onClick={(e) => handleCalClick(agent, e)}
                      title="Cal API Key not set"
                    />
                  )}
                </div>
              </div>

              <div className={styles.LangButton}>
                {assignedNumbers.length > 0 ? (
                  <div className={styles.AssignNumText}>
                    Assigned Number

                    <p className={styles.NumberCaller}>
                      {assignedNumbers.length > 1 ? "s" : ""}{" "}
                      {assignedNumbers.join(", ")}
                    </p>
                  </div>
                ) : (
                  <div
                    className={styles.AssignNum}
                    onClick={(e) => handleAssignNumberClick(agent, e)}

                    style={{ cursor: "pointer" }}
                  >
                    Assign Number
                  </div>

                )}

                <div className={styles.minLeft}>
                  <span className={styles.MinL}>Min Left</span>{" "}
                  {agent?.callSummary?.remaining?.minutes}
                </div>
              </div>
            </div>
          );
        })}

        {/* Cal API Modal */}
        {isCalModalOpen && (
          <div className={styles.modalBackdrop} onClick={closeModal}>
            <div
              className={styles.modalContainer}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Connect with Cal</h2>
              <p>
                Click on the link to connect with Cal:{" "}
                <a
                  href="https://cal.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://cal.com/
                </a>
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                <label htmlFor="apiKey">Enter your API Key:</label>
                <input
                  id="apiKey"
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="API Key"
                  className={styles.modalInput}
                  disabled={!isApiKeyEditable && !!apiKey}
                />
                {apiKey && !isApiKeyEditable && (
                  <button
                    type="button"
                    onClick={() => setIsApiKeyEditable(true)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Edit API Key"
                    aria-label="Edit API Key"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="20"
                      width="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                  </button>
                )}
              </div>
              {showCalKeyInfo && (
                <div className={styles.infoBanner}>
                  Your Cal API key is added. Now create your Cal event.
                </div>
              )}

              {!showEventInputs && (
                <div className={styles.modalButtons}>
                  <button
                    className={`${styles.modalButton} ${styles.cancel}`}
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    className={`${styles.modalButton} ${styles.submit}`}
                    onClick={handleApiKeySubmit}
                    disabled={!isValidCalApiKey(apiKey.trim())}
                  >
                    {apiKey && !isApiKeyEditable ? "Update" : "Submit"}
                  </button>
                </div>
              )}

              {showEventInputs && (
                <>
                  <div className={styles.createEventSection}>
                    <h3>Create Event</h3>
                    <div className={styles.inputGroup}>
                      <label htmlFor="title">Event Name</label>
                      <input
                        id="title"
                        type="text"
                        placeholder="Enter event name"
                        className={styles.modalInput}
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="slug">Description</label>
                      <input
                        id="slug"
                        type="text"
                        placeholder="Enter Description"
                        className={styles.modalInput}
                        value={eventSlug}
                        onChange={(e) => setEventSlug(e.target.value)}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="length">Length (minutes)</label>
                      <input
                        id="length"
                        type="number"
                        placeholder="Enter length"
                        className={styles.modalInput}
                        value={eventLength}
                        onChange={(e) => setEventLength(e.target.value)}
                        min="1"
                      />
                    </div>
                  </div>

                  <div
                    className={styles.modalButtons}
                    style={{ marginTop: "10px" }}
                  >
                    <button
                      className={`${styles.modalButton} ${styles.cancel}`}
                      onClick={() => setShowEventInputs(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className={`${styles.modalButton} ${styles.submit}`}
                      onClick={createCalEvent}
                      disabled={
                        !eventName.trim() ||
                        !eventSlug.trim() ||
                        !eventLength.trim()
                      }
                    >
                      Add Event
                    </button>
                  </div>

                  {eventCreateStatus && (
                    <p
                      style={{
                        color:
                          eventCreateStatus === "success" ? "green" : "red",
                        marginTop: "10px",
                        fontWeight: "600",
                      }}
                    >
                      {eventCreateMessage}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Call Test Modal */}
        {openCallModal && (
          <Modal2 isOpen={openCallModal} onClose={handleCloseCallModal}>
            <CallTest
              isCallActive={isCallActive}
              onStartCall={handleStartCall}
              onEndCall={handleEndCall}
              callLoading={callLoading}
              setCallLoading={setCallLoading}
              isliveTranscript={liveTranscript}
              agentName={agentDetails?.agentName}
              agentAvatar={agentDetails?.avatar}
              businessName={agentDetails?.business?.businessName}
            />
          </Modal2>
        )}

        {/* WidgetModal */}
        {openWidgetModal && (
          <Modal2 isOpen={openWidgetModal} onClose={handleCloseWidgetModal}>
            <WidgetScript
              isAgentDetails={agentDetails}
              onClose={handleCloseWidgetModal}
            />
          </Modal2>
        )}
      </div>
      {isAssignNumberModalOpen && (
        <div className={styles.modalBackdrop} onClick={closeAssignNumberModal}>
          <div
            className={styles.modalContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Coming Soon!</h2>
            <p style={{ fontSize: "1.1rem", color: "#444", margin: "16px 0" }}>
              Our exciting plans will be available shortly. You'll be able to
              select the best one to suit your needs!
            </p>
            <button
              className={`${styles.modalButton} ${styles.submit}`}
              onClick={closeAssignNumberModal}
              style={{ width: "100%" }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}


      {/* Modals for capturing/uploading profile picture */}
      {/* {isCaptureModalOpen && (
        <CaptureProfile onClose={closeCaptureModal} onCapture={handleCapture} />
      )} */}
      {isUploadModalOpen && (
        <UploadProfile onClose={closeUploadModal} onUpload={handleUpload} />
      )}

      <Footer />

      {/* OffCanvas for Logout */}
      {openOffcanvas && (
        <OffCanvas
          onClose={handleCloseOffcanvas}
          isOpen={openOffcanvas}
          direction="right"
          width="70%"
        >
          <div className="HeaderTop">
            <div className={styles.logoutdiv} onClick={handleLogout}>
              Logout
            </div>
          </div>
        </OffCanvas>
      )}

      {isAssignModalOpen && selectedAgentForAssign && (
        <AssignNumberModal
          isOpen={isAssignModalOpen}
          agentId={selectedAgentForAssign.agent_id}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedAgentForAssign(null);
          }}
        />
      )}
      {/* nitish */}


      {popupMessage && (
        <Popup
          type={popupType}
          message={popupMessage}
          onClose={() => setPopupMessage("")}
        />
      )}

      <Modal isOpen={open}  onClose={() => setOpen(false)}>
        <Plan agentID={agentId} locationPath={locationPath} />
      </Modal>

      <Footer />
    </div>
  );
}

export default Dashboard;
