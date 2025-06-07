import React, { useEffect, useRef, useState } from "react";
import styles from "./Dashboard.module.css";
import Footer from "../AgentDetails/Footer/Footer";
import { useNavigate } from "react-router-dom";
import {
  deleteAgent,
  EndWebCallUpdateAgentMinutesLeft,
  fetchDashboardDetails,
  getUserAgentMergedDataForAgentUpdate,
} from "../../Store/apiStore";
import decodeToken from "../../lib/decodeToken";
import { useDashboardStore } from "../../Store/agentZustandStore";
import { RetellWebClient } from "retell-client-js-sdk";
import useUser from "../../Store/Context/UserContext";
import Modal2 from "../Modal2/Modal2";
import CallTest from "../CallTest/CallTest";
import WidgetScript from "../Widgets/WidgetScript";
import Popup from "../Popup/Popup";
import CaptureProfile from "../Popup/profilePictureUpdater/CaptureProfile";
import UploadProfile from "../Popup/profilePictureUpdater/UploadProfile";
import AssignNumberModal from "../AgentDetails/AssignNumberModal";
import CommingSoon from "../ComingSoon/CommingSoon";
import Footer2 from "../AgentDetails/Footer/Footer2";
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
  const [showModal, setShowModal] = useState(false);
  const [isCallInProgress, setIsCallInProgress] = useState(false);

  // UserId decoded from token
  const token = localStorage.getItem("token") || "";
  const decodeTokenData = decodeToken(token);
  const userIdFromToken = decodeTokenData?.id || "";
  const [userId, setUserId] = useState(userIdFromToken);

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

  const handleAssignNumberClick = (agent, e) => {
    e.stopPropagation();
    const planName = agent?.subscription?.plan_name || "Free";

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
  // Fetch dashboard + merge Cal API keys
  const fetchAndMergeCalApiKeys = async () => {
    if (!userId) return;
    try {
      const res = await fetchDashboardDetails(userId);
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

      setDashboardData(agentsWithCalKeys, res.total_call || 0);
      setHasFetched(true);
      // localStorage.setItem("userId", userId);
      // localStorage.setItem("agents", JSON.stringify(agentsWithCalKeys));
      setLocalAgents(agentsWithCalKeys);
    } catch (error) {
      console.error("Error fetching dashboard data or Cal API keys:", error);
    }
  };
  useEffect(() => {
    if (!hasFetched || !agents.length) {
      fetchAndMergeCalApiKeys();
    }
  }, [userId, hasFetched, setDashboardData, setHasFetched]);
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
      setHasFetched(false);
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
      // Call Cal API to create an event
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
      const eventTypeId = responseData.event_type.id;
      const retellPayload = {
        general_tools: [
          {
            type: "book_appointment_cal",
            name: "cal_tool",
            cal_api_key: apiKey.trim(),
            event_type_id: eventTypeId,
          },
        ],
      };

      // Update LLM using the Retell API
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

      // Success
      setPopupType("success");
      setPopupMessage("Your Cal event has been created successfully!");
      setShowCalKeyInfo(false);
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

  const handleDelete = async (agentId) => {
    try {
      await deleteAgent(agentId);
      const updatedAgents = localAgents.filter(
        (agent) => agent.agent_id !== agentId
      );
      setLocalAgents(updatedAgents);
      setPopupMessage("Agent deleted successfully!");
      setPopupType("success");
      setHasFetched(false);
    } catch (error) {
      setPopupMessage(`Failed to delete agent: ${error.message}`);
      setPopupType("failed");
    }
  };

  const handleUpgrade = (id) => {
    alert(`Upgrade clicked for card ${id}`);
    setOpenDropdown(null);
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
    if (isCallInProgress || !retellWebClient || !agentDetails) {
      console.error("RetellWebClient or agent details not ready.");
      return;
    }
    setCallLoading(false);
    setIsCallInProgress(true);

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
    console.log("isCallInProgress", isCallInProgress);
    if (retellWebClient) {
      const response = await retellWebClient.stopCall();
      const payload = { agentId: agentDetails.agent_id, callId: callId };
      if (isCallInProgress) {
        const DBresponse = await EndWebCallUpdateAgentMinutesLeft(payload);
      }
      setHasFetched(false);
      setIsCallInProgress(false);
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
    handleEndCall();
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

  const handleEditAgent = async (ag) => {
    localStorage.setItem("UpdationMode", "ON");
    navigate("/business-details", {
      state: { agentId: ag.agent_id, bussinesId: ag.businessId },
    });
  };

  const handleRefresh = () => {
    setHasFetched(false);
    fetchAndMergeCalApiKeys();
  };

  const handleAlertPopUp = (show, message, type) => {
    setPopupMessage(message);
    setPopupType(type);
  };
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
                  onError={(e) => {
                    e.target.src = "images/camera-icon.avif";
                  }}
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
                currentProfile={
                  uploadedImage || user?.profile || "images/camera-icon.avif"
                }
              />
            )}
          </div>
          <div className={styles.notifiMain}>
            <div
              className={styles.notificationIcon}
              onClick={() => setShowModal(true)}
            >
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
            <div className={styles.notificationIcon} onClick={handleLogout}>
              <svg
                width="16"
                height="22"
                viewBox="0 0 16 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.2451 14.7432C11.2018 14.7346 11.1592 14.7221 11.1182 14.7051C11.0367 14.6713 10.9628 14.6218 10.9004 14.5596L10.8154 14.457C10.791 14.4205 10.7699 14.3816 10.7529 14.3408C10.719 14.2592 10.7022 14.1714 10.7021 14.083L10.7148 13.9512C10.7235 13.9079 10.7359 13.8652 10.7529 13.8242C10.7699 13.7834 10.791 13.7445 10.8154 13.708L10.9004 13.6055L12.8428 11.6738L6.74316 11.6738C6.5645 11.6738 6.39296 11.6029 6.2666 11.4766C6.14027 11.3502 6.06943 11.1786 6.06934 11C6.06934 10.8214 6.14037 10.6498 6.2666 10.5234C6.39296 10.3971 6.56447 10.3253 6.74316 10.3252L12.8428 10.3252L10.9004 8.39355L10.8994 8.39355L10.8154 8.29004C10.7422 8.18004 10.7021 8.05011 10.7021 7.91602C10.7022 7.737 10.7737 7.565 10.9004 7.43848C11.027 7.31205 11.199 7.24113 11.3779 7.24121C11.5568 7.24141 11.7281 7.31291 11.8545 7.43945L11.8545 7.43848L14.9512 10.5225C15.0141 10.5849 15.0645 10.6593 15.0986 10.7412C15.1327 10.8231 15.1504 10.9113 15.1504 11C15.1503 11.0885 15.1326 11.1761 15.0986 11.2578C15.0815 11.2989 15.0599 11.3383 15.0352 11.375L14.9512 11.4775L11.8525 14.5596C11.7901 14.622 11.7154 14.6712 11.6338 14.7051C11.5521 14.7389 11.4644 14.7568 11.376 14.7568L11.2451 14.7432Z"
                  fill="#222222"
                  stroke="#222222"
                  stroke-width="0.3"
                />
                <path
                  d="M5.41602 21.457L5.18945 21.4512C4.06174 21.3954 2.99122 20.9227 2.18848 20.1211C1.33243 19.2661 0.850217 18.1064 0.848633 16.8965L0.848634 5.11426L0.854494 4.88769C0.911831 3.75841 1.38613 2.68712 2.18945 1.88379C2.993 1.08037 4.06483 0.605939 5.19434 0.548827L5.4209 0.542968L10.5869 0.542968C11.7964 0.543775 12.956 1.02494 13.8115 1.87988C14.667 2.73482 15.1488 3.8941 15.1504 5.10352L15.1504 5.10449L15.1465 6.10059L15.1338 6.23242C15.1079 6.36202 15.044 6.48232 14.9492 6.57715C14.8229 6.70349 14.6513 6.77436 14.4727 6.77441C14.294 6.77441 14.1225 6.70341 13.9961 6.57715C13.8697 6.4508 13.7989 6.27926 13.7988 6.10059L13.7988 5.10449L13.7939 4.94531C13.7536 4.15165 13.421 3.39863 12.8564 2.83398C12.2544 2.23179 11.4375 1.89301 10.5859 1.8916L5.42676 1.8916L5.26758 1.89551C4.47112 1.93575 3.71506 2.27041 3.14844 2.83691C2.54444 3.44103 2.20427 4.25998 2.20313 5.11426L2.20313 16.8955L2.20801 17.0547C2.2482 17.8484 2.58093 18.6013 3.14551 19.166C3.71012 19.7306 4.46313 20.0642 5.25684 20.1045L5.41602 20.1084L10.5781 20.1084C11.4326 20.1075 12.2521 19.7681 12.8564 19.1641C13.4608 18.56 13.8005 17.7402 13.8018 16.8857L13.8018 15.8994L13.8145 15.7676C13.8403 15.638 13.9042 15.5177 13.999 15.4229C14.1254 15.2965 14.2969 15.2257 14.4756 15.2256C14.6542 15.2256 14.8258 15.2966 14.9521 15.4229C15.0785 15.5492 15.1503 15.7207 15.1504 15.8994L15.1504 16.8867L15.1445 17.1133C15.0873 18.2423 14.6127 19.313 13.8096 20.1162C12.9528 20.9729 11.7917 21.4556 10.5801 21.457L5.41602 21.457Z"
                  fill="#222222"
                  stroke="#222222"
                  stroke-width="0.3"
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
          const planStyles = ["MiniPlan", "ProPlan", "Maxplan"];
          const randomPlan = `${agent?.subscription?.plan_name}Plan`;

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
                  {agent?.subscription?.plan_name || "Free"}
                  {" Plan"}
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
                      <div
                        className={styles.OptionItem}
                        onClick={() => handleEditAgent(agent)}
                      >
                        {/* <div className={styles.OptionItem} onClick={() => ""}> */}
                        Edit Agent
                      </div>
                      <div
                        className={styles.OptionItem}
                        onClick={() => handleUpgrade(agent.agent_id)}
                      >
                        Upgrade
                      </div>
                      <div key={agent.agent_id}>
                        <div
                          className={styles.OptionItem}
                          onClick={async () => {
                            try {
                              await handleDelete(agent.agent_id);
                            } catch (error) {
                              setPopupMessage(
                                `Failed to delete agent: ${error.message}`
                              );
                              setPopupType("failed");
                            }
                          }}
                        >
                          Delete Agent
                        </div>
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
              refreshFuntion={handleRefresh}
              alertPopUp={handleAlertPopUp}
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

      {/* <Footer /> */}
      <Footer2 />
      <CommingSoon show={showModal} onClose={() => setShowModal(false)} />

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
    </div>
  );
}

export default Dashboard;