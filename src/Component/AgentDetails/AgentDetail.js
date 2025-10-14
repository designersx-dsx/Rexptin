import React, { useEffect, useState, useRef, useContext } from "react";
import styles from "./AgentDetail.module.css";
import AgentAnalysis from "./AgentAnalysisGraph/AgentAnalysis";
import {
  createChatAgent,
  EndWebCallUpdateAgentMinutesLeft,
  fetchAgentDetailById,
  getUserAgentMergedDataForAgentUpdate,
  updateAgentChatEnabled,
} from "../../Store/apiStore";

import { useLocation, useNavigate } from "react-router-dom";
import decodeToken from "../../lib/decodeToken";
import { RetellWebClient } from "retell-client-js-sdk";
import CallTest from "../CallTest/CallTest";
import Modal2 from "../Modal2/Modal2";
import Loader2 from "../Loader2/Loader2";
import Footer from "./Footer/Footer";
import Footer2 from "./Footer/Footer2";
import Card1 from "../Card1/Card1";
import Card2 from "../Card2/Card2";
import Divider from "../Divider/Divider";
import AssignNumberModal from "./AssignNumberModal";
import CommingSoon from "../ComingSoon/CommingSoon";
import EditAgent from "../EditAgent/EditAgent";
import DetailModal from "../DetailModal/DetailModal";
import CallSetting from "../CallSetting/CallSetting";

import { useAgentStore } from "../../Store/agentDetailStore";
import { useDashboardStore } from "../../Store/agentZustandStore";
import WidgetScript from "../Widgets/WidgetScript";
import PopUp from "../Popup/Popup";
import Modal3 from "../Modal3/Modal3";
import { clearSessionAfterEdit } from "../../utils/helperFunctions";
import { RefreshContext } from "../PreventPullToRefresh/PreventPullToRefresh";
import { useNotificationStore } from "../../Store/notificationStore";
import ConfirmModal from "../ConfirmModal/ConfirmModal";

const AgentDashboard = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const agentID = sessionStorage.getItem("SelectAgentId");
  const [userCalApiKey, setUserCalApiKey] = useState(
    sessionStorage.getItem("userCalApiKey")
  );
  const agentBuisnesId = sessionStorage.getItem("SelectAgentBusinessId");
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const [agentDetails, setAgentDetail] = useState({
    agentId:
      location?.state?.agentId || sessionStorage.getItem("SelectAgentId"),
    bussinesId:
      location?.state?.bussinesId ||
      sessionStorage.getItem("SelectAgentBusinessId"),
    agentDetails: location?.state?.agentDetails,
  });
  const isConfirmedRef = useRef(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const timeZone = Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone;
  const [agentDetailsForCal, setAgentDetailsForCal] = useState([]);
  useEffect(() => {
    if (agentID && agentBuisnesId) {
      setAgentDetail({
        agentId: agentID,
        bussinesId: agentBuisnesId,
      });
    }
  }, [agentBuisnesId, agentBuisnesId]);
  const [openOffcanvas, setOpenOffcanvas] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  // const [assignedNumbers, setAssignedNumbers] = useState([]);
  const [retellWebClient, setRetellWebClient] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [openCallModal, setOpenCallModal] = useState(false);
  const [callLoading, setCallLoading] = useState(false);
  const {
    agentData,
    assignedNumbers,
    totalBookings,
    setAgentById,
    setCurrentAgentId,
    getAgentById,
  } = useAgentStore();
  const agentStatus = agentData?.agent?.isDeactivated;
  // console.log("agentData", agentData)
  const [isModalOpen, setModalOpen] = useState();
  const [openCard, setOpenCard] = useState(null);
  const { setHasFetched } = useDashboardStore();
  const [isCalModalOpen, setIsCalModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isApiKeyEditable, setIsApiKeyEditable] = useState(false);
  const [showEventInputs, setShowEventInputs] = useState(false);
  const [eventCreateStatus, setEventCreateStatus] = useState(null);
  const [eventCreateMessage, setEventCreateMessage] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventSlug, setEventSlug] = useState("");
  const [eventLength, setEventLength] = useState("");
  const [showCalKeyInfo, setShowCalKeyInfo] = useState(false);
  const [agentId, setAgentId] = useState("");
  const isValidCalApiKey = (key) => key.startsWith("cal_live_");
  const [showModal, setShowModal] = useState(false);
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const [callId, setCallId] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [openWidgetModal, setOpenWidgetModal] = useState(false);
  const [agentDetail, setAgentDetails] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";
  const decodeTokenData = decodeToken(token);
  const userIdFromToken = decodeTokenData?.id || "";
  const [userId, setUserId] = useState(userIdFromToken);
  const [isAssignNumberModal, setIsAssignNumberModal] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [fullAddress, setFullAddress] = useState("");
  const [knowledge_base_texts, setknowledge_base_texts] = useState("");
  const [businessDetails, setBusinessDetails] = useState([]);
  const [popupMessage3, setPopupMessage3] = useState();
  const [popupType3, setPopupType3] = useState("confirm");
  const [calapiloading, setCalapiloading] = useState(false);
  const [isApiKeySubmitted, setIsApiKeySubmitted] = useState(false);
  const [meetingCount, setMeetingCount] = useState(0);
  const [isAssignNumberModalOpen, setIsAssignNumberModalOpen] = useState(false);
  const openAssignNumberModal = () => setIsAssignNumberModalOpen(true);
  const closeAssignNumberModal = () => setIsAssignNumberModalOpen(false);
  const [selectedAgentForAssign, setSelectedAgentForAssign] = useState(null);
  const [agentCalApiKey, setAgentCalApiKey] = useState("");
  const [disableLoading, setDisableLoading] = useState(false)
  const notifications = useNotificationStore((state) => state.notifications);
  const [assignPopUp, setAssignPopUp] = useState(false)
  const unreadCount = notifications?.filter((n) => n?.status === 'unread').length;
  const [isEnabled, setIsEnabled] = useState(true);
  //chatToggleSwitch
  const chatToggleSwitch = async () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    const agent_id = agentData?.agent?.agent_id;
    // Chat just got enabled
    if (agentData?.agent?.chat_agent_id && agentData?.agent?.chat_llm_id) {
      // Always call updateAgentChatEnabled, regardless of true/false
      await updateAgentChatEnabled(agent_id, newState, token);
      setHasFetched(false)
    } else {
      const businessDetailsFromKnowledgeBase = agentData?.business
      const knowledge_base_texts_Details = JSON.parse(businessDetailsFromKnowledgeBase.knowledge_base_texts)
      const commonAgentPayload = {
        industryKey: agentData?.business?.businessType || "",
        roleTitle: agentData?.agent?.agentRole || "",
        agentName: agentData?.agent?.agentName || "",
        agentGender: agentData?.agent?.agentGender || "",
        business: {
          businessName: agentData?.business?.businessName || "",
          email: "",
          aboutBusiness: "",
          address: agentData?.business?.address1 || "",
        },
        languageSelect: agentData?.business?.agentLanguage || "",
        businessType: agentData?.business?.businessType || "",
        aboutBusinessForm: agentData?.business?.aboutBusiness || "",
        commaSeparatedServices: agentData?.business?.buisnessService || "",
        agentNote: "",
        timeZone: "",
        languageAccToPlan: agentData?.agent?.agentPlan || "",
        plan: agentData?.agent?.agentPlan || "",
        CallRecording: agentData?.agent?.CallRecording || "",
        knowledgeBaseId: "",
        businessPhone: knowledge_base_texts_Details.phone || "",
        businessEmail: knowledge_base_texts_Details.email || "",
        agent_id: agentData?.agent?.agent_id || "",
      };
      const response = await createChatAgent(
        commonAgentPayload, token
      );
      setHasFetched(false)
    }

  };
  const isRefreshing = useContext(RefreshContext);
  function formatE164USNumber(number) {
    const cleaned = number.replace(/\D/g, "");

    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      const country = cleaned[0];
      const area = cleaned.slice(1, 4);
      const prefix = cleaned.slice(4, 7);
      const line = cleaned.slice(7, 11);
      return `+${country} (${area}) ${prefix}-${line}`;
    }
    return number;
  }
  useEffect(() => {
    const fetchMeetingCount = async () => {
      if (!agentData?.agent?.calApiKey || !agentData?.agent?.eventId) return;

      try {
        const res = await fetch(
          `https://api.cal.com/v1/bookings?apiKey=${encodeURIComponent(
            agentData.agent.calApiKey
          )}`
        );
        const data = await res.json();

        const meetings = data?.bookings?.filter(
          (b) => Number(b.eventTypeId) === Number(agentData.agent.eventId)
        );

        setMeetingCount(meetings?.length || 0);
      } catch (error) {
        console.error("Error fetching meeting bookings:", error);
        setMeetingCount(0);
      }
    };

    fetchMeetingCount();
  }, [agentData]);

  useEffect(() => {
    clearSessionAfterEdit();
  }, []);
  const openAddressModal = (address) => {
    setFullAddress(address);
    setIsAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
    setFullAddress("");
  };
  const openCalModal = () => {
    if (!agentData?.agent) return;
    setApiKey(agentData.agent.calApiKey || "");
    setIsApiKeyEditable(false);
    setShowEventInputs(false);
    setEventCreateStatus(null);
    setEventCreateMessage("");
    setIsCalModalOpen(true);
  };
  const closeCalModal = () => {
    setIsCalModalOpen(false);
    setApiKey("");
    setShowEventInputs(false);
    setEventCreateStatus(null);
    setEventCreateMessage("");
    setEventName("");
    setEventSlug("");
    setEventLength("");
  };
  function formatName(name) {
    if (!name) return "";

    if (name.includes(" ")) {
      const firstName = name.split(" ")[0];
      if (firstName.length <= 7) {
        return firstName;
      } else {
        return firstName.substring(0, 10) + "...";
      }
    } else {
      if (name.length > 7) {
        return name.substring(0, 10) + "...";
      }
      return name;
    }
  }
  // sdsds
  const handleApiKeySubmit = async () => {
    const agent = agentDetailsForCal;
    try {
      setCalapiloading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/agent/update-calapikey/${agent?.agent_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            calApiKey: userCalApiKey.trim(),
            userId: userId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update API key");
      }
      await getAgentDetailsAndBookings();
      setHasFetched(false);
      setShowCalKeyInfo(true);
      setShowEventInputs(true);
      // sessionStorage.setItem("userCalApiKey", userCalApiKey.trim())
      setTimeout(() => {
        setIsApiKeySubmitted(true);
      }, 0);
    } catch (error) {
      setPopupType("failed");
      setPopupMessage(`Failed to save API Key: ${error.message}`);
    } finally {
      setCalapiloading(false);
    }
  };

  const createCalEvent = async () => {
    const agent = agentDetailsForCal;
    await handleApiKeySubmit();
    setRefresh(true);
    try {
      // Call Cal API to create an event
      const url = `https://api.cal.com/v1/event-types?apiKey=${encodeURIComponent(
        userCalApiKey.trim()
      )}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `MEETING BY ${agent?.agentName}`,
          slug: `${agent?.agentName}_${agent?.agentCode}`,
          length: 15,
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
            cal_api_key: userCalApiKey.trim(),
            event_type_id: eventTypeId,
          },
          {
            type: "check_availability_cal",
            name: "check_availability",
            cal_api_key: userCalApiKey.trim(),
            event_type_id: eventTypeId,
            description: "Checking availability for event booking",
            timezone: timeZone,
          },
        ],
      };

      // Update LLM using the Retell API
      const retellUrl = `https://api.retellai.com/update-retell-llm/${agent.llmId}`;
      const retellResponse = await fetch(retellUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
        },
        body: JSON.stringify(retellPayload),
      });
      getAgentDetailsAndBookings();
      if (!retellResponse.ok) {
        const retellError = await retellResponse.json();
        console.error("Error updating  LLM:", retellError);
      } else {
        // console.log("Updated successfully!");
      }
      setPopupType("success");
      setPopupMessage("Your Cal event has been created successfully!");
      setHasFetched(false);
      setShowCalKeyInfo(false);
      setEventName("");
      setEventSlug("");
      setEventLength("");
    } catch (error) {
      setEventCreateStatus("error");

      setEventCreateMessage(`Unauthorized! Invalid API Key.`);
      console.error("Error in createCalEvent:", error);
    } finally {
      setIsConfirming(false);
    }
  };
  const getAgentDetailsAndBookings = async () => {
    if (!agentDetails?.agentId) return;
    const cached = getAgentById(agentDetails.agentId);
    if (cached) {
      setCurrentAgentId(agentDetails.agentId);
      setLoading(false);
    }
    try {
      const response = await fetchAgentDetailById(agentDetails);
      const agentInfo = response?.data;
      setAgentCalApiKey(agentInfo?.agent?.calApiKey);
      let numbersArray = [];

      const voipNumbersStr = agentInfo?.agent?.voip_numbers;
      if (voipNumbersStr) {
        try {
          numbersArray = JSON.parse(voipNumbersStr);
        } catch {
          console.warn("Failed to parse voip_numbers");
        }
      }

      let total = 0;
      const calApiKey = agentInfo?.agent?.calApiKey;
      if (calApiKey) {
        try {
          const calResponse = await fetch(
            `https://api.cal.com/v1/bookings?apiKey=${encodeURIComponent(
              calApiKey
            )}`
          );
          const bookingsData = await calResponse.json();
          total = bookingsData.bookings?.length || 0;
        } catch {
          console.warn("Failed to fetch bookings from Cal.com");
        }
      }

      // Set all data into zustand
      setAgentById(agentDetails.agentId, agentInfo, numbersArray, total);
    } catch (err) {
      console.error("Failed to fetch data", err.response || err.message || err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getAgentDetailsAndBookings();
  }, [refresh]);
  const handleAssignNumberUpdated = () => {
    getAgentDetailsAndBookings();
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("agents");
    sessionStorage.clear();
    // window.location.href = "/signup";
    navigate("/signup", { replace: true });
  };
  const handleBackClick = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    const client = new RetellWebClient();
    client.on("call_started", () => setIsCallActive(true));
    client.on("call_ended", () => setIsCallActive(false));
    setRetellWebClient(client);
    sessionStorage.removeItem("selectedfilterOption");
    const calApiKey = agentData?.agent?.calApiKey;
    setAgentCalApiKey(calApiKey);
  }, []);

  // Start call handler
  let micStream = "";
  const isStartingRef = useRef(false);
  const handleStartCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Store the stream globally or in state if needed
      micStream = stream;
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      // alert("Please allow microphone access to proceed with the call.");
      setPopupMessage("Microphone access is required to test agent.");
      setPopupType("failed");
      return;
    }

    if (
      isStartingRef.current ||
      isCallInProgress ||
      !retellWebClient ||
      !agentData?.agent
    ) {
      console.error("RetellWebClient or agent data not ready.");
      return;
    }
    isStartingRef.current = true;
    setCallLoading(true);
    setIsCallInProgress(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/agent/create-web-call`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent_id: agentData?.agent?.agent_id }),
        }
      );
      if (res.status == 403) {
        setPopupMessage("Agent Plan minutes exhausted");
        setPopupType("failed");
        setIsCallInProgress(false);
        setTimeout(() => {
          setPopupMessage("");
        }, 5000);
        return;
      }
      const data = await res.json();
      await retellWebClient.startCall({ accessToken: data.access_token });
      setCallId(data?.call_id);
    } catch (err) {
      console.error("Error starting call:", err);
    } finally {
      setCallLoading(false);
      isStartingRef.current = false;
    }
  };

  // End call handler
  const isEndingRef = useRef(false);
  const handleEndCall = async () => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;
    if (retellWebClient) {
      try {
        const response = await retellWebClient.stopCall();
        const payload = { agentId: agentData?.agent?.agent_id, callId: callId };
        if (isCallInProgress && callId) {
          // const DBresponse = await EndWebCallUpdateAgentMinutesLeft(payload);
        }

        // console.log("Call end response", response);
      } catch (err) {
        console.error("Error ending call:", err);
      } finally {
        setTimeout(() => {
          setHasFetched(false);
          setRefresh((prev) => !prev);
        }, 2000);

        setIsCallInProgress(false);
        isEndingRef.current = false;
      }
    }
  };

  // Open call modal
  const openCallTestModal = () => {
    setOpenCallModal(true);
  };
  // Close call modal
  const closeCallTestModal = () => {
    handleEndCall();
    setOpenCallModal(false);
  };
  //handleCallHistoryNavigation
  const handleCallHistoryNavigation = () => {
    sessionStorage.setItem("agentId", agentDetails?.agentId);
    sessionStorage.setItem("userId", userId);
    navigate("/totalcall-list");
    localStorage.setItem("filterType", "single");
  };
  const handleCloseEditagentModalOpen = () => {
    localStorage.removeItem("selectedStepEditMode");
    localStorage.removeItem("bId");
    localStorage.removeItem("displayBusinessName");
    sessionStorage.removeItem("UpdationMode");
    sessionStorage.removeItem("agentName");
    sessionStorage.removeItem("agentGender");
    sessionStorage.removeItem("agentLanguageCode");
    sessionStorage.removeItem("agentLanguage");
    sessionStorage.removeItem("llmId");
    sessionStorage.removeItem("agent_id");
    sessionStorage.removeItem("knowledgeBaseId");
    sessionStorage.removeItem("googleListing");
    sessionStorage.removeItem("displayBusinessName");
    sessionStorage.removeItem("aboutBusinessForm");
    sessionStorage.removeItem("agentRole");
    sessionStorage.removeItem("agentVoice");
    sessionStorage.removeItem("agentVoiceAccent");
    sessionStorage.removeItem("avatar");
    sessionStorage.removeItem("businessDetails");
    sessionStorage.removeItem("businessId");
    sessionStorage.removeItem("businesServices");
    sessionStorage.removeItem("businessLocation");
    sessionStorage.removeItem("selectedCustomServices");
    sessionStorage.removeItem("bId");
    sessionStorage.removeItem("selectedServices");
    localStorage.removeItem("UpdationMode");
    localStorage.removeItem("UpdationModeStepWise");
    localStorage.removeItem("agentName");
    localStorage.removeItem("agentGender");
    localStorage.removeItem("agentLanguageCode");
    localStorage.removeItem("agentLanguage");
    localStorage.removeItem("llmId");
    localStorage.removeItem("agent_id");
    localStorage.removeItem("knowledgeBaseId");
    localStorage.removeItem("agentRole");
    localStorage.removeItem("agentVoice");
    localStorage.removeItem("agentVoiceAccent");
    localStorage.removeItem("avatar");
    localStorage.removeItem("googleUrl");
    localStorage.removeItem("webUrl");
    localStorage.removeItem("aboutBusiness");
    localStorage.removeItem("additionalInstruction");
    localStorage.removeItem("knowledge_base_name");
    localStorage.removeItem("knowledge_base_id");
    sessionStorage.removeItem("placeDetailsExtract");
    sessionStorage.removeItem("agentNote");
    sessionStorage.removeItem("prevBuisnessType");
    sessionStorage.removeItem("prevAgentGender");
    sessionStorage.removeItem("prevAgentGender");
    sessionStorage.removeItem("UpdationModeStepWise");
    sessionStorage.removeItem("customServices");
    sessionStorage.removeItem("agentCode");
    sessionStorage.removeItem("businessUrl");
    setModalOpen(false);
  };
  // Open Widget modal
  const handleOpenWidgetModal = (agent) => {
    setAgentDetails(agentData);
    navigate("/integrate-agent", {
      state: {
        agentDetails: agent?.agent,
      },
    });
  };
  // Close Widget modal
  const handleCloseWidgetModal = () => {
    setOpenWidgetModal(false);
  };
  const handleRefresh = () => {
    setHasFetched(false);
  };
  const handleAlertPopUp = (show, message, type) => {
    setPopupMessage(message);
    setPopupType(type);
  };
  const handleCloseAssignNumberModal = () => {
    setIsAssignNumberModal(false);
  };
  const handleInactiveAgentAlert = () => {
    setPopupType("failed");
    setPopupMessage(
      "Your agent is not active. Please activate your agent first."
    );
  };
  const handleCallTransfer = () => {
    if (agentData) {
      sessionStorage.setItem("agentDetails", JSON.stringify(agentData));
      const agentGeneralTools = agentData.generalTools;
      sessionStorage.setItem(
        "agentGeneralTools",
        JSON.stringify(agentGeneralTools)
      );
      navigate("/call-transfer");
    }
  };
  const truncateAddress = (address, wordLimit) => {
    const words = address?.split(" ") || [];
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : address;
  };
  const truncateUrl = (url, wordLimit) => {
    const words = url?.split("/") || [];
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join("/") + "..."
      : url;
  };
  const handleOpenKnowledgeView = (knowledge_base_texts) => {
    setknowledge_base_texts(knowledge_base_texts);
    setOpenCard("card2");
  };
  const handleOpenBusinessView = (agentData) => {
    setOpenCard("card1");
    setBusinessDetails(agentData?.business);
  };
  function formatName(name) {
    if (!name) return "";

    if (name.includes(" ")) {
      const firstName = name.split(" ")[0];
      if (firstName.length <= 7) {
        return firstName;
      } else {
        return firstName.substring(0, 10) + "...";
      }
    } else {
      if (name.length > 7) {
        return name.substring(0, 10) + "...";
      }
      return name;
    }
  }
  function formatBusinessName(name) {
    if (!name) return "";

    if (name.length > 25) {
      return name.substring(0, 25) + "...";
    }

    return name;
  }
  const handleConnectCal = (agent) => {
    navigate("/connect-calender");
    sessionStorage.setItem("agentDetails", JSON.stringify(agent));
  };
  const handleConnectCalApiAlready = (agent) => {
    setAgentDetailsForCal(agent);
    setPopupType3("confirm");
    setPopupMessage3(
      "Your Cal API key is already connected with Rexpt. We're now automatically syncing your Cal Events with this agent for seamless scheduling."
    );
  };
  const handleCalConnectWithConfirm = async () => {
    try {
      await createCalEvent();
    } finally {
      setIsConfirming(false);
      setPopupMessage3("");
    }
  };
  const handleAssignNumberClick = (agent, e, business) => {
    e.stopPropagation();
    if (agent?.isDeactivated === 1) {
      handleInactiveAgentAlert();
      return;
    }

    const planName = agent?.subscription?.plan_name || "Free";
    if (!agent.subscriptionId) {
      openAssignNumberModal();
    } else {

      // setSelectedAgentForAssign(agent);
      // setIsAssignModalOpen(true);
      navigate("/assign-number", {
        state: { agent: agent, business: business },
      });
    }
    setBusinessDetails(business);
  };
  const handleUpgradeClick = (agent) => {
    // setagentId(agent?.agent_id);
    // setsubscriptionId(agent?.subscriptionId);
    sessionStorage.setItem("updateBtn", "update");
    sessionStorage.setItem("selectedPlan", agent?.agent?.agentPlan);

    navigate("/plan", {
      state: {
        agentID: agent?.agent.agent_id,
        locationPath: "/dashboard",
        subscriptionID: agent?.agent.subscriptionId,
        planName: agent?.agent.agentPlan,
        interval: agent?.subscription?.interval || null,
      },
    });
  };
  useEffect(() => {
    if (isRefreshing) {
      getAgentDetailsAndBookings();
    }
  }, [isRefreshing]);
  const handleAssignPopUp = () => {
    // console.log("agentData", agentData)
    setAssignPopUp(true)
  }
  const mClose = () => {
    setAssignPopUp(false)
  }
  // const handleSamanPtra = async () => {

  //   const handleCancelSubscription = async () => {
  //     const agent_id = agentData?.agent.agent_id;
  //     // const mins_left = agent?.mins_left ? Math.floor(agent.mins_left / 60) : 0;

  //     try {
  //       setDisableLoading(true)
  //       // setdeleteloading(true);

  //       try {
  //         let res = null
  //         // assignNumberPaid === true &&
  //         if ((agentData?.agent?.agentPlan === "free" || agentData?.agent?.agentPlan === "Pay-As-You-Go")) {
  //           console.log("Cancel Schedule")
  //           res = await fetch(`${API_BASE}/cancel-subscription-schedule`, {
  //             method: "POST",
  //             headers: {
  //               "Content-Type": "application/json",
  //               Authorization: `Bearer ${token}`,
  //             },
  //             body: JSON.stringify({ subscriptionId: agentData?.subscription?.subscription_id }),
  //           });
  //           const requestData = {
  //             customerId: agentData.subscription?.subscription_id,
  //             agentId: agent_id,
  //             status: "inactive",
  //             isFree: (agentData?.agent?.agentPlan === "free") || (agentData?.agent?.agentPlan === "Pay-As-You-Go" ? true : false)

  //           };
  //           const response = await fetch(`${API_BASE}/pay-as-you-go-saveAgent`, {
  //             method: 'POST',
  //             headers: {
  //               'Content-Type': 'application/json',
  //               Authorization: `Bearer ${token}`,
  //             },
  //             body: JSON.stringify(requestData),
  //           });
  //           if (response.ok) { console.log('Agent Payg Cancelled Succesfully') }

  //           else {
  //             console.log('Failed to send the request to save the agent.')
  //           }
  //           console.log("assign cancel")
  //           // await checkAssignNumber()
  //         }

  //         if (res) {
  //           setTimeout(() => {
  //             // fetchAndMergeCalApiKeys();
  //           }, 1000);
  //         }
  //       } catch (notifyError) {
  //         throw new Error(`Refund failed: ${notifyError.message}`);
  //       }

  //       // const updatedAgents = localAgents.filter((a) => a.agent_id !== agent_id);
  //       // setLocalAgents(updatedAgents);
  //       // setPopupMessage("Subscription Cancelled successfully!");
  //       // setPopupType("success");
  //       // fetchAndMergeCalApiKeys();
  //       // checkAssignNumber()
  //       // checkAgentPaygStatus(agentId)
  //       setDisableLoading(false)
  //     } catch (error) {
  //       // setPopupMessage(`Failed to Cancel Subscription: ${error.message}`);
  //       // setPopupType("failed");
  //       setDisableLoading(false)
  //     } finally {
  //       // setdeleteloading(false);
  //     }
  //   };
  // }


  // helpers you already have in scope:
  // API_BASE, token, agentData, setDisableLoading

  const handleSamanPtra = async () => {
    const agentPlan = agentData?.agent?.agentPlan;
    const subscriptionId = agentData?.subscription?.subscription_id;
    const agentId = agentData?.agent?.agent_id;
    const subscriptionStatus = agentData?.subscription?.status // canceled   , cancel_scheduled
    console.log("subscriptionStatus", subscriptionStatus)
    // Only proceed for "free" or "Pay-As-You-Go"
    const isFreeOrPayg = ["free", "Pay-As-You-Go"].includes(agentPlan);

    if (subscriptionStatus === "canceled" || subscriptionStatus === "cancel_scheduled") {
      setDisableLoading(true)
      try {
        const res = await fetch(`${API_BASE}/assign-number-resume`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ subscriptionId }), // assumes subscriptionId is in scope
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.log(`assign-number-resume failed (${res.status}): ${text}`);
        }
        const data = await res.json(); // ← parse body

        if (data?.subscription) {
          console.log("Assign Number Subscription Resume successfully");
          setHasFetched(false)
          setRefresh(prev => !prev)

          // setShowPopup(true);

          setPopupMessage("Assign Number Subscription Resume successfully");
          setPopupType("success");
          // localStorage.setItem("isPayg", JSON.stringify(true)); // store as string
          // setPaygEnabled(true);
        } else {
          // backend returned ok but missing expected field
          console.warn("assign-number-resume: no subscription in response", data);
          // setShowPopup(true);
          setPopupMessage("Resume completed, but response was unexpected.");
          setPopupType("success");
          setDisableLoading(false);
        }
      } catch (err) {
        console.error("Resume failed:", err);
        // setShowPopup(true);
        setPopupMessage("Failed to resume asign number. Please try again.");
        setPopupType("failed");
        setDisableLoading(false);
      }
      finally {
        setDisableLoading(false);
        setAssignPopUp(false);
        // setHasFetched()
      }
      return
    }
    if (!isFreeOrPayg) {
      console.log("No cancel needed: plan is neither free nor Pay-As-You-Go");
      return;
    }

    setDisableLoading(true);
    try {
      // 1) Cancel any queued subscription changes (server-side)
      const cancelRes = await fetch(`${API_BASE}/cancel-subscription-schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscriptionId }),
      });

      if (!cancelRes.ok) {
        const text = await cancelRes.text().catch(() => "");
        throw new Error(`cancel-subscription-schedule failed (${cancelRes.status}): ${text}`);
      }
      console.log("Cancelled subscription schedule");
      setHasFetched(false)
      setRefresh(prev => !prev)

      // 2) Update agent PayG state
      const requestData = {
        customerId: agentData?.subscription?.customer_id,
        agentId,
        status: "inactive",
        isFree: agentPlan === "free" || agentPlan === "Pay-As-You-Go",
      };

      const updateRes = await fetch(`${API_BASE}/pay-as-you-go-saveAgent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!updateRes.ok) {
        console.log('Failed to send the request to save the agent.')
      }

      // console.log("✅ Agent Pay-As-You-Go status updated successfully");

      setPopupMessage("Subscription Cancelled successfully!");
      setPopupType("success");
      setAssignPopUp(false)


    } catch (err) {
      console.error("❌ handleSamanPtra failed:", err);
      setPopupMessage(`Failed to Cancel Subscription: ${err.message}`);
      setPopupType("failed");
    } finally {
      setDisableLoading(false);
      setAssignPopUp(false)
      setHasFetched(false)
    }

  };
  useEffect(() => {
    if (agentData?.agent) {
      setIsEnabled(agentData.agent.chatWidgetEnabled);
    }
  }, [agentData]);

  return (
    <div>
      {loading && !agentData?.agent?.agent_id != agentDetails?.agentId ? (
        isRefreshing ? (
          ""
        ) : (
          <Loader2 />
        )
      ) : (
        <>
          <div className={styles.Forsticky}>
            <header className={styles.header}>
              <div className={styles.profileBack}>
                <img
                  src="svg/Notification.svg"
                  alt="Back button"
                  onClick={handleBackClick}
                ></img>
                <div className={styles.profileSection}>
                  <p className={styles.name}>Agent detail</p>
                </div>
              </div>

              <div className={styles.notifiMain}>
                <div className={styles.notificationWrapper}>
                  <div
                    className={styles.notificationIcon}
                    onClick={() => { navigate('/notifications') }}
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
                    {unreadCount > 0 && (
                      <span className={styles.unreadBadge}>{unreadCount}</span>
                    )}
                  </div>
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

            <section>
              <div className={styles.agentCard}>
                <h3 className={`${styles.PlanTitle}  `}>
                  {agentData?.agent?.agentPlan}
                </h3>
                <div className={styles.agentInfo}>
                  <div className={styles.agentAvatarContainer}>
                    <img
                      src={agentData?.agent?.avatar || "images/SofiaAgent.png"}
                      alt="Agent"
                      className={styles.agentAvatar}
                    />
                    <p className={styles.generalDiv}>
                      {agentData?.agent?.agentRole?.split(" ")[0] || ""}{" "}
                    </p>
                  </div>
                  <div className={styles.FullLine}>
                    <div className={styles.foractive}>
                      <h3 className={styles.agentName}>
                        {formatName(agentData?.agent?.agentName) || ""}
                        <span
                          className={
                            agentData?.agent?.isDeactivated == 1
                              ? styles.InactiveText
                              : styles.activeText
                          }
                        >
                          {agentData?.agent?.isDeactivated == 1
                            ? "Inactive"
                            : "Active"}
                        </span>
                      </h3>
                      <p className={styles.agentAccent}>
                        {agentData?.agent?.agentLanguage}.
                        {agentData?.agent?.agentAccent}
                      </p>
                    </div>

                    <hr className={styles.agentLine}></hr>

                    <div className={styles.agentDetailsFlex}>
                      {assignedNumbers?.length > 0 ? (
                        <>
                          <div className={styles.AssignNumText}>
                            Phone Number
                            <p>
                              {assignedNumbers
                                ?.map(formatE164USNumber)
                                .join(", ")}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div
                          className={styles.AssignNum}
                          onClick={(e) => {
                            if (agentStatus === true) {
                              handleInactiveAgentAlert();
                            } else {
                              // setIsAssignModalOpen(true)
                              // setIsAssignNumberModalOpen(true);
                              handleAssignNumberClick(
                                agentData?.agent,
                                e,
                                agentData?.business
                              );
                            }
                          }}
                        >
                          <img src="/svg/assign-number.svg" />
                        </div>
                      )}
                      {/* {!(agentData?.agent?.agentPlan === "free" && !agentData?.agent?.subscriptionId) && (
                        <>
                          {assignedNumbers?.length > 0 ? (
                            <div className={styles.AssignNumText}>
                              Phone Number
                              <p>
                                {assignedNumbers?.map(formatE164USNumber).join(", ")}
                              </p>
                            </div>
                          ) : (
                            <div
                              className={styles.AssignNum}
                              onClick={(e) => {
                                if (agentStatus === true) {
                                  handleInactiveAgentAlert();
                                } else {
                                  handleAssignNumberClick(agentData?.agent, e, agentData?.business);
                                }
                              }}
                            >
                              <img src="/svg/assign-number.svg" alt="assign" />
                            </div>
                          )}
                        </>
                      )} */}


                      <p className={styles.agentDetails} >
                        Agent Code{" "}
                        <strong>{agentData?.agent?.agentCode || "NA"}</strong>
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* assign no pop ups */}

          <ConfirmModal show={assignPopUp} onClose={() => setAssignPopUp(false)}
            title={
              agentData?.subscription?.status === "canceled" || agentData?.subscription?.status === "cancel_scheduled"
                ? "Confirm Resume"
                : "Confirm Deletion"
            }
            message={
              agentData?.subscription?.status === "canceled" || agentData?.subscription?.status === "cancel_scheduled"
                ? `You are about to resume this assigned number. Once resumed, it will be reactivated and linked services will start working again. 

Do you want to proceed with resuming this assigned number?`
                : `You are about to delete this assigned number. Once deleted, it will no longer be available for use, and any features or services linked to it may stop working. This action is permanent and cannot be undone.

Do you want to proceed with deleting this assigned number?`
            }
            type="warning"
            confirmText={
              disableLoading
                ? agentData?.subscription?.status === "canceled" || agentData?.subscription?.status === "cancel_scheduled"
                  ? "Resuming..."
                  : "Deleting..."
                : agentData?.subscription?.status === "canceled" || agentData?.subscription?.status === "cancel_scheduled"
                  ? "Yes, Resume"
                  : "Yes, Delete"
            }
            cancelText="Cancel"
            showCancel={true}
            isLoading={disableLoading}
            onConfirm={handleSamanPtra}
          />
          {/*  */}

          <div className={styles.container}>
            <div className={styles.businessInfo}>
              <div className={styles.card1}>
                <h2>
                  {formatBusinessName(
                    agentData?.business?.businessName ||
                    agentData?.knowledge_base_texts?.name ||
                    agentData?.business?.googleBusinessName
                  )}
                </h2>

                <p>{agentData?.business?.businessSize || "NA"}</p>
                <div className={styles.health}>
                  <h3>
                    {agentData?.business?.businessType || "NA"}

                    <span>
                      {" "}
                      {agentData?.business?.businessType == "Other"
                        ? `/${agentData?.business?.customBuisness}`
                        : "/ Categories"}
                    </span>
                  </h3>
                </div>

                <div
                  className={styles.businessEdit}
                  onClick={() => handleOpenBusinessView(agentData)}
                >
                  <h4>Business Details</h4>
                  <img className={styles.Editsvg} src="/svg/eye-svg.svg" />
                </div>
              </div>

              <div className={styles.card2}>
                <h2>
                  URL:
                  <span style={{ fontSize: "12px" }}>
                    {(() => {
                      const filteredUrls =
                        agentData?.knowledgeBase?.knowledge_base_sources?.filter(
                          (src) => src?.url && !src.url.includes("google.com")
                        );
                      if (agentData?.business?.webUrl) {
                        // const url = filteredUrls[filteredUrls.length - 1]?.url;
                        const url = agentData?.business?.webUrl
                        return (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#007bff", textDecoration: "underline" }}
                          >
                            {url}
                          </a>
                        )

                      } else {
                        return <div>Not Available</div>;
                      }
                    })()}
                  </span>
                </h2>
                <div className={styles.google}>
                  <img src="/svg/Goole-icon.svg" alt="google-icon" />
                  <p>
                    <span style={{ fontSize: "12px" }}>
                      {(() => {
                        try {
                          const agentId = agentData?.agent?.agent_id;
                          const cache = JSON.parse(
                            sessionStorage.getItem("multiAgentCache") || "{}"
                          );
                          const googleUrl =
                            cache?.data?.[agentId]?.agentData?.business
                              ?.googleUrl;
                          return googleUrl ? (
                            <a
                              href={googleUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {truncateUrl(googleUrl, 3)}
                            </a>
                          ) : (
                            "NA"
                          );
                        } catch (err) {
                          console.error(
                            "Error reading googleUrl from sessionStorage:",
                            err
                          );
                          return "NA";
                        }
                      })()}
                    </span>
                  </p>
                </div>

                <div className={styles.address}>
                  {agentData?.business?.address1 && (
                    <>
                      <img src="svg/location.svg" alt="location" />
                      <p
                        onClick={() =>
                          openAddressModal(agentData?.business?.address1)
                        }
                        style={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        {truncateAddress(agentData?.business?.address1, 5)}
                      </p>
                    </>
                  )}
                </div>

                <div
                  className={styles.businessEdit}
                  onClick={() => handleOpenKnowledgeView(agentData)}
                >
                  <h4>Knowledge Base</h4>
                  <img className={styles.Editsvg} src="/svg/eye-svg.svg" />
                </div>
              </div>
            </div>
            <br />
            <div className={styles.chatContainer}>
              <div className={styles.icon}>
                <span className={styles.chatDots}>•••</span>
              </div>

              <div className={styles.content}>
                <div className={styles.headerRow}>
                  <div>
                    <h3 className={styles.title}>Chat Web Widget</h3>
                    <p className={styles.subtitle}>Intelligent Messaging Agent</p>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" checked={isEnabled} onChange={chatToggleSwitch} />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.footer}>
                  <span className={styles.messages}><strong>222</strong> messages left (Total 300/m)</span>
                  <button className={styles.buyMore}>+ Buy More</button>
                </div>
              </div>
            </div>
            <CommingSoon show={showModal} onClose={() => setShowModal(false)} />
            <Divider label="Agent Options" />
            <div className={styles.managementActions}>
              <div
                onClick={() => {
                  if (agentStatus === true) {
                    handleInactiveAgentAlert();
                  } else {
                    openCallTestModal();
                  }
                }}
                className={styles.managementItem}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.SvgDesign}>
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="30" height="30" rx="5" fill="white" />
                    <path d="M7.5016 8.50027L8.50014 6.50061L10.5015 5.49981L12.5 8.00049L12 10.0005L14.5 13.5005L18 13.0005L19.5 14.5005L19.5 16.0005L18.5 17.5005L16 18.0005L14.5 17.5005L12.998 15.9997L10.4999 14.0006L9.0005 11.9999L7.5016 8.50027Z" fill="#1AA850" />
                    <rect x="5" y="20" width="22" height="9" fill="white" />
                    <path d="M12.229 20.875H10.049V27H8.70402V20.875H6.52402V19.77H12.229V20.875ZM15.0839 23.845C15.0839 23.685 15.0606 23.535 15.0139 23.395C14.9706 23.2517 14.9039 23.1267 14.8139 23.02C14.7239 22.9133 14.6089 22.83 14.4689 22.77C14.3323 22.7067 14.1723 22.675 13.9889 22.675C13.6323 22.675 13.3506 22.7767 13.1439 22.98C12.9406 23.1833 12.8106 23.4717 12.7539 23.845H15.0839ZM12.7289 24.59C12.7489 24.8533 12.7956 25.0817 12.8689 25.275C12.9423 25.465 13.0389 25.6233 13.1589 25.75C13.2789 25.8733 13.4206 25.9667 13.5839 26.03C13.7506 26.09 13.9339 26.12 14.1339 26.12C14.3339 26.12 14.5056 26.0967 14.6489 26.05C14.7956 26.0033 14.9223 25.9517 15.0289 25.895C15.1389 25.8383 15.2339 25.7867 15.3139 25.74C15.3973 25.6933 15.4773 25.67 15.5539 25.67C15.6573 25.67 15.7339 25.7083 15.7839 25.785L16.1389 26.235C16.0023 26.395 15.8489 26.53 15.6789 26.64C15.5089 26.7467 15.3306 26.8333 15.1439 26.9C14.9606 26.9633 14.7723 27.0083 14.5789 27.035C14.3889 27.0617 14.2039 27.075 14.0239 27.075C13.6673 27.075 13.3356 27.0167 13.0289 26.9C12.7223 26.78 12.4556 26.605 12.2289 26.375C12.0023 26.1417 11.8239 25.855 11.6939 25.515C11.5639 25.1717 11.4989 24.775 11.4989 24.325C11.4989 23.975 11.5556 23.6467 11.6689 23.34C11.7823 23.03 11.9439 22.7617 12.1539 22.535C12.3673 22.305 12.6256 22.1233 12.9289 21.99C13.2356 21.8567 13.5806 21.79 13.9639 21.79C14.2873 21.79 14.5856 21.8417 14.8589 21.945C15.1323 22.0483 15.3673 22.2 15.5639 22.4C15.7606 22.5967 15.9139 22.84 16.0239 23.13C16.1373 23.4167 16.1939 23.745 16.1939 24.115C16.1939 24.3017 16.1739 24.4283 16.1339 24.495C16.0939 24.5583 16.0173 24.59 15.9039 24.59H12.7289ZM20.2507 22.87C20.2174 22.9233 20.1824 22.9617 20.1457 22.985C20.1091 23.005 20.0624 23.015 20.0057 23.015C19.9457 23.015 19.8807 22.9983 19.8107 22.965C19.7441 22.9317 19.6657 22.895 19.5757 22.855C19.4857 22.8117 19.3824 22.7733 19.2657 22.74C19.1524 22.7067 19.0174 22.69 18.8607 22.69C18.6174 22.69 18.4257 22.7417 18.2857 22.845C18.1491 22.9483 18.0807 23.0833 18.0807 23.25C18.0807 23.36 18.1157 23.4533 18.1857 23.53C18.2591 23.6033 18.3541 23.6683 18.4707 23.725C18.5907 23.7817 18.7257 23.8333 18.8757 23.88C19.0257 23.9233 19.1774 23.9717 19.3307 24.025C19.4874 24.0783 19.6407 24.14 19.7907 24.21C19.9407 24.2767 20.0741 24.3633 20.1907 24.47C20.3107 24.5733 20.4057 24.6983 20.4757 24.845C20.5491 24.9917 20.5857 25.1683 20.5857 25.375C20.5857 25.6217 20.5407 25.85 20.4507 26.06C20.3641 26.2667 20.2341 26.4467 20.0607 26.6C19.8874 26.75 19.6724 26.8683 19.4157 26.955C19.1624 27.0383 18.8691 27.08 18.5357 27.08C18.3591 27.08 18.1857 27.0633 18.0157 27.03C17.8491 27 17.6874 26.9567 17.5307 26.9C17.3774 26.8433 17.2341 26.7767 17.1007 26.7C16.9707 26.6233 16.8557 26.54 16.7557 26.45L17.0407 25.98C17.0774 25.9233 17.1207 25.88 17.1707 25.85C17.2207 25.82 17.2841 25.805 17.3607 25.805C17.4374 25.805 17.5091 25.8267 17.5757 25.87C17.6457 25.9133 17.7257 25.96 17.8157 26.01C17.9057 26.06 18.0107 26.1067 18.1307 26.15C18.2541 26.1933 18.4091 26.215 18.5957 26.215C18.7424 26.215 18.8674 26.1983 18.9707 26.165C19.0774 26.1283 19.1641 26.0817 19.2307 26.025C19.3007 25.9683 19.3507 25.9033 19.3807 25.83C19.4141 25.7533 19.4307 25.675 19.4307 25.595C19.4307 25.475 19.3941 25.3767 19.3207 25.3C19.2507 25.2233 19.1557 25.1567 19.0357 25.1C18.9191 25.0433 18.7841 24.9933 18.6307 24.95C18.4807 24.9033 18.3257 24.8533 18.1657 24.8C18.0091 24.7467 17.8541 24.685 17.7007 24.615C17.5507 24.5417 17.4157 24.45 17.2957 24.34C17.1791 24.23 17.0841 24.095 17.0107 23.935C16.9407 23.775 16.9057 23.5817 16.9057 23.355C16.9057 23.145 16.9474 22.945 17.0307 22.755C17.1141 22.565 17.2357 22.4 17.3957 22.26C17.5591 22.1167 17.7607 22.0033 18.0007 21.92C18.2441 21.8333 18.5241 21.79 18.8407 21.79C19.1941 21.79 19.5157 21.8483 19.8057 21.965C20.0957 22.0817 20.3374 22.235 20.5307 22.425L20.2507 22.87ZM23.2253 27.08C22.7786 27.08 22.4353 26.955 22.1953 26.705C21.9586 26.4517 21.8403 26.1033 21.8403 25.66V22.795H21.3153C21.2486 22.795 21.1919 22.7733 21.1453 22.73C21.0986 22.6867 21.0753 22.6217 21.0753 22.535V22.045L21.9003 21.91L22.1603 20.51C22.1769 20.4433 22.2086 20.3917 22.2553 20.355C22.3019 20.3183 22.3619 20.3 22.4353 20.3H23.0753V21.915H24.4453V22.795H23.0753V25.575C23.0753 25.735 23.1136 25.86 23.1903 25.95C23.2703 26.04 23.3786 26.085 23.5153 26.085C23.5919 26.085 23.6553 26.0767 23.7053 26.06C23.7586 26.04 23.8036 26.02 23.8403 26C23.8803 25.98 23.9153 25.9617 23.9453 25.945C23.9753 25.925 24.0053 25.915 24.0353 25.915C24.0719 25.915 24.1019 25.925 24.1253 25.945C24.1486 25.9617 24.1736 25.9883 24.2003 26.025L24.5703 26.625C24.3903 26.775 24.1836 26.8883 23.9503 26.965C23.7169 27.0417 23.4753 27.08 23.2253 27.08Z" fill="#6524EB" />
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M18.5728 12.9247C17.8719 12.2238 16.735 12.2238 16.0331 12.9247L16.0314 12.9273C15.6671 13.2907 15.0767 13.2907 14.7132 12.9273C14.0874 12.3015 13.2759 11.49 12.6509 10.865C12.2866 10.5007 12.2866 9.91024 12.6509 9.54595L12.6527 9.54423C13.3536 8.84327 13.3536 7.70638 12.6527 7.00455C12.3358 6.68774 11.9785 6.33035 11.6452 5.99713C11.2404 5.59227 10.6914 5.36523 10.119 5.36523C9.54668 5.36523 8.99765 5.59227 8.59278 5.99713C8.3597 6.23021 8.11627 6.47365 7.88578 6.70413C6.99749 7.59242 6.75059 8.93736 7.26682 10.082L7.26856 10.0864C8.84572 13.4064 12.0518 16.616 15.4936 18.2588L15.4962 18.2605C16.64 18.7888 17.9893 18.5497 18.8801 17.6623C19.1141 17.4499 19.3523 17.2125 19.5802 16.9846C19.9851 16.5797 20.2121 16.0307 20.2121 15.4584C20.2121 14.886 19.9851 14.337 19.5802 13.9321C19.247 13.5989 18.8897 13.2424 18.5728 12.9247ZM17.9625 13.535L18.9699 14.5425C19.2125 14.7859 19.3489 15.1148 19.3489 15.4584C19.3489 15.802 19.2125 16.1308 18.9699 16.3743L18.2741 17.0476C17.6397 17.6821 16.6771 17.8539 15.8631 17.4784C12.5948 15.9176 9.54926 12.8729 8.05238 9.72379C7.6855 8.90715 7.86247 7.94807 8.4961 7.31531L9.2031 6.60745C9.44654 6.36488 9.77544 6.22849 10.119 6.22849C10.4626 6.22849 10.7915 6.36488 11.0349 6.60745L12.0423 7.61486C12.4066 7.97915 12.4066 8.56961 12.0423 8.93391L12.0398 8.93565C11.3388 9.63661 11.3388 10.7735 12.0398 11.4753C12.6656 12.1003 13.477 12.9118 14.102 13.5376C14.8039 14.2386 15.9408 14.2386 16.6417 13.5376L16.6435 13.535C17.0077 13.1707 17.5982 13.1707 17.9625 13.535Z" fill="#1AA850" />
                    <path d="M16.7265 10.3376C16.7265 9.62287 16.1464 9.04276 15.4316 9.04276C15.1934 9.04276 15 8.84939 15 8.61114C15 8.37288 15.1934 8.17951 15.4316 8.17951C16.6229 8.17951 17.5898 9.14635 17.5898 10.3376C17.5898 10.5759 17.3964 10.7693 17.1581 10.7693C16.9199 10.7693 16.7265 10.5759 16.7265 10.3376Z" fill="#6524EB" />
                    <path d="M19.3163 10.3376C19.3163 8.19332 17.5759 6.45301 15.4316 6.45301C15.1934 6.45301 15 6.25964 15 6.02138C15 5.78312 15.1934 5.58976 15.4316 5.58976C18.0525 5.58976 20.1795 7.71681 20.1795 10.3376C20.1795 10.5759 19.9861 10.7693 19.7479 10.7693C19.5096 10.7693 19.3163 10.5759 19.3163 10.3376Z" fill="#6524EB" />
                    <path d="M21.906 10.3376C21.906 6.76464 19.0046 3.86325 15.4316 3.86325C15.1934 3.86325 15 3.66988 15 3.43163C15 3.19337 15.1934 3 15.4316 3C19.4811 3 22.7693 6.28813 22.7693 10.3376C22.7693 10.5759 22.5759 10.7693 22.3376 10.7693C22.0994 10.7693 21.906 10.5759 21.906 10.3376Z" fill="#6524EB" />
                  </svg>
                </div>
                <p
                  className={styles.managementText}
                  onClick={() => {
                    if (agentStatus === true) {
                      handleInactiveAgentAlert();
                    } else {
                      openCallTestModal();
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Test Agent
                </p>
              </div>
              <div
                className={styles.managementItem}
                onClick={(e) => {
                  e.stopPropagation();
                  if (agentStatus === true) {
                    handleInactiveAgentAlert();
                  } else {
                    if (agentCalApiKey) {
                      handleConnectCal(agentData?.agent);
                    } else if (
                      (userCalApiKey == "undefined" ||
                        userCalApiKey == "null" ||
                        !userCalApiKey) &&
                      (agentCalApiKey == "undefined" ||
                        agentCalApiKey == "null" ||
                        !agentCalApiKey)
                    ) {
                      handleConnectCal(agentData?.agent);
                    } else if (userCalApiKey && agentCalApiKey) {
                      handleConnectCal(agentData?.agent);
                    } else if (userCalApiKey && !agentCalApiKey) {
                      handleConnectCalApiAlready(agentData?.agent);
                    } else {
                      handleConnectCal(agentData?.agent);
                    }
                  }
                }}
              >
                <div className={styles.SvgDesign}>
                  {agentData?.agent?.calApiKey ? (
                    <svg
                      onClick={(e) => {
                        e.stopPropagation();
                        if (agentStatus === true) {
                          handleInactiveAgentAlert();
                        } else {
                          handleConnectCal(agentData?.agent);
                        }
                      }}
                      width="20"
                      height="21"
                      viewBox="0 0 20 21"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.76866 16.5998C4.22338 16.5998 4.59201 16.2312 4.59201 15.7765C4.59201 15.3218 4.22338 14.9531 3.76866 14.9531C3.31394 14.9531 2.94531 15.3218 2.94531 15.7765C2.94531 16.2312 3.31394 16.5998 3.76866 16.5998Z"
                        fill="#6524EB"
                      />
                      <path
                        d="M6.78429 16.5998C7.23901 16.5998 7.60763 16.2312 7.60763 15.7765C7.60763 15.3218 7.23901 14.9531 6.78429 14.9531C6.32956 14.9531 5.96094 15.3218 5.96094 15.7765C5.96094 16.2312 6.32956 16.5998 6.78429 16.5998Z"
                        fill="#6524EB"
                      />
                      <path
                        d="M9.75304 16.5998C10.2078 16.5998 10.5764 16.2312 10.5764 15.7765C10.5764 15.3218 10.2078 14.9531 9.75304 14.9531C9.29831 14.9531 8.92969 15.3218 8.92969 15.7765C8.92969 16.2312 9.29831 16.5998 9.75304 16.5998Z"
                        fill="#6524EB"
                      />
                      <path
                        d="M13.0499 16.5998C13.5046 16.5998 13.8733 16.2312 13.8733 15.7765C13.8733 15.3218 13.5046 14.9531 13.0499 14.9531C12.5952 14.9531 12.2266 15.3218 12.2266 15.7765C12.2266 16.2312 12.5952 16.5998 13.0499 16.5998Z"
                        fill="#6524EB"
                      />
                      <path
                        d="M9.75304 13.8029C10.2078 13.8029 10.5764 13.4343 10.5764 12.9796C10.5764 12.5249 10.2078 12.1562 9.75304 12.1562C9.29831 12.1562 8.92969 12.5249 8.92969 12.9796C8.92969 13.4343 9.29831 13.8029 9.75304 13.8029Z"
                        fill="#6524EB"
                      />
                      <path
                        d="M13.9722 4.64641H13.8698C13.8694 3.73676 13.1324 3 12.223 3C11.3137 3 10.5763 3.73676 10.5763 4.64641H6.23979C6.23947 3.73676 5.50238 3 4.59306 3C3.68373 3 2.94632 3.73676 2.94632 4.64641H2.56826C1.14846 4.64641 0 5.79848 0 7.21499V7.21665V17.4916C0 18.9098 1.14874 20.0602 2.56826 20.0602H13.9722C15.3904 20.0602 16.5421 18.9098 16.5421 17.4916V7.21661V7.21495C16.5421 5.79848 15.3903 4.64641 13.9722 4.64641ZM14.8173 17.4445C14.8173 17.8673 14.4735 18.2128 14.0496 18.2128H2.59921C2.17536 18.2128 1.8302 17.8673 1.8302 17.4445V10.8104H14.8173V17.4445Z"
                        fill="#6524EB"
                      />
                      <path
                        d="M13.0499 13.8029C13.5046 13.8029 13.8733 13.4343 13.8733 12.9796C13.8733 12.5249 13.5046 12.1562 13.0499 12.1562C12.5952 12.1562 12.2266 12.5249 12.2266 12.9796C12.2266 13.4343 12.5952 13.8029 13.0499 13.8029Z"
                        fill="#6524EB"
                      />
                      <circle cx="14.5938" cy="4.5" r="4.5" fill="white" />
                      <path
                        d="M19.2197 4.56299C19.2197 7.08306 17.1768 9.12598 14.6567 9.12598C12.1367 9.12598 10.0938 7.08306 10.0938 4.56299C10.0938 2.04292 12.1367 0 14.6567 0C17.1768 0 19.2197 2.04292 19.2197 4.56299ZM16.9555 2.83457C16.7885 2.66751 16.5176 2.66751 16.3506 2.83457C16.3465 2.8386 16.3427 2.84288 16.3392 2.84736L14.3587 5.37106L13.1646 4.17697C12.9975 4.00991 12.7267 4.00991 12.5596 4.17697C12.3925 4.34403 12.3925 4.61489 12.5596 4.78195L14.0691 6.29141C14.2361 6.45847 14.507 6.45847 14.674 6.29141C14.6778 6.28769 14.6813 6.28377 14.6846 6.27966L16.9616 3.43335C17.1226 3.26585 17.1205 2.99958 16.9555 2.83457Z"
                        fill="#1AA850"
                      />
                    </svg>
                  ) : (
                    <svg
                      style={{ cursor: "pointer" }}
                      width="20"
                      height="21"
                      viewBox="0 0 20 21"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.67686 16.6018C5.13159 16.6018 5.50021 16.2331 5.50021 15.7784C5.50021 15.3237 5.13159 14.9551 4.67686 14.9551C4.22214 14.9551 3.85352 15.3237 3.85352 15.7784C3.85352 16.2331 4.22214 16.6018 4.67686 16.6018Z"
                        fill="#6524EB"
                      />
                      <path
                        d="M7.69542 16.6018C8.15014 16.6018 8.51877 16.2331 8.51877 15.7784C8.51877 15.3237 8.15014 14.9551 7.69542 14.9551C7.2407 14.9551 6.87207 15.3237 6.87207 15.7784C6.87207 16.2331 7.2407 16.6018 7.69542 16.6018Z"
                        fill="#6524EB"
                      />
                      <path
                        d="M10.6603 16.6018C11.115 16.6018 11.4836 16.2331 11.4836 15.7784C11.4836 15.3237 11.115 14.9551 10.6603 14.9551C10.2055 14.9551 9.83691 15.3237 9.83691 15.7784C9.83691 16.2331 10.2055 16.6018 10.6603 16.6018Z"
                        fill="#6524EB"
                      />
                      <path
                        d="M13.9532 16.6018C14.408 16.6018 14.7766 16.2331 14.7766 15.7784C14.7766 15.3237 14.408 14.9551 13.9532 14.9551C13.4985 14.9551 13.1299 15.3237 13.1299 15.7784C13.1299 16.2331 13.4985 16.6018 13.9532 16.6018Z"
                        fill="#6524EB"
                      />
                      <path
                        d="M10.6603 13.8029C11.115 13.8029 11.4836 13.4343 11.4836 12.9796C11.4836 12.5249 11.115 12.1562 10.6603 12.1562C10.2055 12.1562 9.83691 12.5249 9.83691 12.9796C9.83691 13.4343 10.2055 13.8029 10.6603 13.8029Z"
                        fill="#6524EB"
                      />
                      <path
                        d="M14.8794 4.64641H14.777C14.7767 3.73676 14.0396 3 13.1303 3C12.2209 3 11.4835 3.73676 11.4835 4.64641H7.14702C7.1467 3.73676 6.40961 3 5.50028 3C4.59096 3 3.85355 3.73676 3.85355 4.64641H3.47548C2.05568 4.64641 0.907227 5.79848 0.907227 7.21499V7.21665V17.4916C0.907227 18.9098 2.05597 20.0602 3.47548 20.0602H14.8794C16.2976 20.0602 17.4493 18.9098 17.4493 17.4916V7.21661V7.21495C17.4493 5.79848 16.2976 4.64641 14.8794 4.64641ZM15.7245 17.4445C15.7245 17.8673 15.3807 18.2128 14.9568 18.2128H3.50644C3.08259 18.2128 2.73742 17.8673 2.73742 17.4445V10.8104H15.7245V17.4445Z"
                        fill="#6524EB"
                      />
                      <path
                        d="M13.9532 13.8029C14.408 13.8029 14.7766 13.4343 14.7766 12.9796C14.7766 12.5249 14.408 12.1562 13.9532 12.1562C13.4985 12.1562 13.1299 12.5249 13.1299 12.9796C13.1299 13.4343 13.4985 13.8029 13.9532 13.8029Z"
                        fill="#6524EB"
                      />
                      <circle cx="15.5" cy="4.5" r="4.5" fill="white" />
                      <path
                        d="M20 4.5C20 6.98528 17.9853 9 15.5 9C13.0147 9 11 6.98528 11 4.5C11 2.01472 13.0147 0 15.5 0C17.9853 0 20 2.01472 20 4.5ZM14.0114 2.61363C13.9015 2.50379 13.7235 2.50379 13.6136 2.61363C13.5038 2.72346 13.5038 2.90154 13.6136 3.01137L15.1023 4.5L13.6136 5.98863C13.5038 6.09846 13.5038 6.27654 13.6136 6.38637C13.7235 6.49621 13.9015 6.49621 14.0114 6.38637L15.5 4.89775L16.9886 6.38637C17.0985 6.49621 17.2765 6.49621 17.3864 6.38637C17.4962 6.27654 17.4962 6.09846 17.3864 5.98863L15.8977 4.5L17.3864 3.01137C17.4962 2.90154 17.4962 2.72346 17.3864 2.61363C17.2765 2.50379 17.0985 2.50379 16.9886 2.61363L15.5 4.10225L14.0114 2.61363Z"
                        fill="#E53939"
                      />
                    </svg>
                  )}
                </div>
                <p className={styles.managementText}>Cal.com</p>
              </div>
              <div
                className={styles.managementItem}
                onClick={() => {
                  if (agentStatus === true) {
                    handleInactiveAgentAlert();
                  } else {
                    handleOpenWidgetModal(agentData);
                  }
                }}
              >
                <div className={styles.SvgDesign}>
                  <svg
                    width="22"
                    height="19"
                    viewBox="0 0 22 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M7.49847 3.35056C7.49847 1.49923 9.06498 0 10.9997 0C12.9343 0 14.5008 1.49912 14.5008 3.35056C14.5008 4.91572 13.3783 6.23225 11.8624 6.59968V11.163L15.8765 13.426C16.5206 12.7348 17.4545 12.2989 18.4988 12.2989C20.4334 12.2989 22 13.798 22 15.6494C22 17.5008 20.4335 19 18.4988 19C16.5641 19 14.9956 17.4987 14.9956 15.6494C14.9956 15.3457 15.0393 15.0507 15.1198 14.7711L10.9976 12.4465L6.8802 14.7667C6.96071 15.0485 7.00442 15.3435 7.00442 15.6494C7.00442 17.4986 5.43562 19 3.50324 19C1.57086 19 0 17.4987 0 15.6494C0 13.8002 1.5688 12.2989 3.50324 12.2989C4.54297 12.2989 5.4792 12.7326 6.12099 13.4238L10.2685 11.0859V6.62828C8.68585 6.30689 7.4989 4.96185 7.4989 3.35042L7.49847 3.35056Z"
                      fill="#6524EB"
                    />
                  </svg>
                </div>
                <p className={styles.managementText}>Integrate</p>
              </div>
              <div
                className={styles.managementItem}
                onClick={() => {
                  if (agentStatus === true) {
                    handleInactiveAgentAlert();
                  } else {
                    handleCallTransfer();
                  }
                }}
              // onClick={handleCallTransfer}
              >
                <div className={styles.SvgDesign}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M12.7241 7.95904C13.0074 8.2424 13.0074 8.70193 12.7241 8.98529C12.4407 9.26866 11.9812 9.26866 11.6978 8.98529L9.905 7.19248C9.62164 6.90912 9.62164 6.44959 9.905 6.16623C10.0468 6.02445 10.2325 5.95366 10.4181 5.95366H16.1853C16.5862 5.95366 16.9112 6.27869 16.9112 6.67956C16.9112 7.08043 16.5862 7.40546 16.1853 7.40546H12.1703L12.7241 7.95904ZM7.397 10.6027C6.59767 9.80484 5.88916 8.92178 5.28704 7.96956C5.06718 7.62188 5.06941 7.20401 5.29311 6.85876L6.1525 5.53195C6.33575 5.24879 6.37074 4.92558 6.25222 4.60986L4.77411 0.670293C4.54273 0.0534077 3.80995 -0.190717 3.25475 0.164042C2.56747 0.603143 1.88 1.04245 1.19252 1.48155C0.251412 2.08286 -0.185466 3.16392 0.0736272 4.25025C0.871536 7.59396 2.61197 10.6029 5.01723 12.9827C7.397 15.3882 10.406 17.1284 13.7497 17.9263C14.8361 18.1856 15.9171 17.7487 16.5184 16.8074C16.9575 16.1201 17.3969 15.4324 17.836 14.7452C18.1907 14.1898 17.9466 13.4572 17.3297 13.2258L13.3901 11.7477C13.0744 11.6292 12.7512 11.6642 12.468 11.8474L11.1412 12.7068C10.796 12.9303 10.3781 12.9327 10.0304 12.7129C9.07797 12.1106 8.19471 11.4021 7.397 10.6027ZM13.8794 2.69044C13.596 2.40708 13.596 1.94755 13.8794 1.66418C14.1627 1.38082 14.6223 1.38082 14.9056 1.66418L16.6985 3.45699C16.9818 3.74036 16.9818 4.19988 16.6985 4.48325C16.5567 4.62503 16.371 4.69582 16.1853 4.69582H10.4181C10.0173 4.69582 9.69223 4.37079 9.69223 3.96992C9.69223 3.56904 10.0173 3.24402 10.4181 3.24402H14.4332L13.8794 2.69044Z"
                      fill="#6524EB"
                    />
                  </svg>
                </div>
                <p className={styles.managementText}>Call Transfer</p>
              </div>

              <div
                className={styles.managementItem}
                onClick={async () => {
                  if (agentStatus === true) {
                    handleInactiveAgentAlert();
                  } else {
                    // try {
                    //   await fetchPrevAgentDEtails(
                    //     agentData?.agent?.agent_id,
                    //     agentData?.agent?.businessId);
                    // } catch (error) {
                    //   await fetchPrevAgentDEtails(
                    //     agentData?.agent?.agent_id,
                    //     agentData?.agent?.businessId);
                    // }
                    // setModalOpen(true);
                    sessionStorage.setItem("naviateFrom", "editAgent");
                    sessionStorage.setItem(
                      "SelectAgentBusinessId",
                      agentData?.agent?.businessId
                    );
                    sessionStorage.setItem(
                      "SelectAgentId",
                      agentData?.agent?.agent_id
                    );
                    navigate("/edit-agent", {
                      state: {
                        agentId: agentData?.agent?.agent_id,
                        businessId: agentData?.agent?.businessId,
                      },
                    });
                  }
                }}
              // onClick={async () => {
              //   await fetchPrevAgentDEtails(
              //     agentData?.agent?.agent_id,
              //     agentData?.agent?.businessId
              //   );
              //   setModalOpen(true);
              // }}
              >
                <div className={styles.SvgDesign}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20.0001 3.90244L16.0977 0L13.3936 2.70407L17.296 6.60651L20.0001 3.90244Z"
                      fill="#6524EB"
                    />
                    <path
                      d="M4 16L8.2927 15.6098L15.6797 8.22279L11.7772 4.32031L4.39024 11.7073L4 16Z"
                      fill="#6524EB"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M13 20H0V18H13V20Z"
                      fill="#6524EB"
                    />
                  </svg>
                </div>
                <p className={styles.managementText}>Edit Agent</p>
              </div>

              <div
                className={styles.managementItem}
                // onClick={() => setShowModal(true)}
                onClick={() =>
                  navigate("/call-setting", {
                    state: {
                      selectedAgentname: `${agentData?.agent?.agentName}-${agentData?.agent?.agentCode}`,
                      fromPage: "dashboard",
                    },
                  })
                }
              >
                <div className={styles.SvgDesign}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.9075 13.7036C17.7025 12.4986 15.8722 12.3081 14.4642 13.123C12.3349 14.3748 9.5527 14.0927 7.72536 12.2647C5.88086 10.4205 5.61058 7.60564 6.90038 5.46931C6.89904 5.4683 6.89702 5.46729 6.89567 5.46628C7.67353 4.06607 7.47157 2.26734 6.28241 1.07818C4.84484 -0.359392 2.51497 -0.359392 1.07707 1.07818C-0.279723 2.4353 -0.354108 4.58711 0.850878 6.0331C2.69875 8.47067 4.7277 10.8143 6.95154 13.0382C9.16562 15.2523 11.4975 17.2768 13.922 19.12C13.9246 19.1176 13.9267 19.1153 13.9287 19.1129C15.375 20.3398 17.543 20.2735 18.9078 18.9086C20.3444 17.4717 20.3444 15.1412 18.9075 13.7036Z"
                      fill="#6524EB"
                    />
                    <path
                      d="M11.6781 3.26778H12.6878V3.9349H13.6976V3.26744V1.92109V1.24219H12.6878V1.92142H11.6781C11.3065 1.92142 11.0049 2.22301 11.0049 2.5946C11.0049 2.96619 11.3065 3.26778 11.6781 3.26778Z"
                      fill="#6524EB"
                    />
                    <path
                      d="M19.4351 2.5931C19.4351 2.22151 19.1335 1.91992 18.7619 1.91992L14.3711 1.92093V3.26729L18.7619 3.26661C19.1335 3.26628 19.4351 2.96469 19.4351 2.5931Z"
                      fill="#6524EB"
                    />
                    <path
                      d="M11.6781 5.96031L16.3903 5.95964V4.61328L11.6781 4.61396C11.3065 4.61396 11.0049 4.91554 11.0049 5.28713C11.0049 5.65873 11.3065 5.96031 11.6781 5.96031Z"
                      fill="#6524EB"
                    />
                    <path
                      d="M18.7616 4.61246H18.0732V3.93457H17.0635V4.6128V5.95915V6.62728H18.0732V5.95915H18.7616C19.1332 5.95915 19.4347 5.65757 19.4347 5.28597C19.4347 4.91438 19.1332 4.61246 18.7616 4.61246Z"
                      fill="#6524EB"
                    />
                    <path
                      d="M11.6781 8.65352L13.0244 8.65318V9.32064H14.0342V8.65318V7.30683V6.62793H13.0244V7.30683L11.6781 7.30717C11.3065 7.30717 11.0049 7.60875 11.0049 7.98034C11.0049 8.35194 11.3065 8.65352 11.6781 8.65352Z"
                      fill="#6524EB"
                    />
                    <path
                      d="M18.7612 7.30469L14.707 7.3057V8.65205L18.7612 8.65138C19.1328 8.65138 19.4344 8.34979 19.4344 7.9782C19.4344 7.60661 19.1328 7.30469 18.7612 7.30469Z"
                      fill="#6524EB"
                    />
                  </svg>
                </div>
                <p className={styles.managementText}>Call Setting</p>
              </div>

              <div
                className={styles.managementItem}
                // onClick={() => setShowModal(true)}
                onClick={() => handleUpgradeClick(agentData)}
              >
                <div className={styles.SvgDesign}>
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.50093 8.65722C11.9787 8.65722 14.0127 10.5339 14.2304 12.9286V13.7058H4.77122V12.9286C4.98902 10.5338 7.02327 8.65722 9.50093 8.65722ZM11.7627 5.80843C11.7627 4.57634 10.7465 3.57124 9.50093 3.57124C8.25533 3.57124 7.2392 4.57634 7.2392 5.80843C7.2392 7.04052 8.25533 8.04562 9.50093 8.04562C10.7465 8.04562 11.7627 7.04052 11.7627 5.80843ZM12.264 0.508766C10.0229 -0.165144 7.63425 0.00578332 5.53367 0.960128L5.55077 0.914725C5.68217 0.562182 5.50217 0.17404 5.14666 0.0422889C4.79205 -0.0876866 4.39785 0.0921426 4.26556 0.442008L3.57974 2.26701C3.50684 2.46109 3.52754 2.67742 3.63554 2.85457C3.74444 3.03173 3.92804 3.15014 4.13595 3.17596L6.02777 3.40919C6.40307 3.45638 6.74598 3.19286 6.79278 2.82164C6.83418 2.4958 6.63257 2.19313 6.32748 2.09342C8.069 1.36342 10.0248 1.25125 11.8634 1.80409C16.1519 3.09585 18.581 7.59694 17.2769 11.8389C16.9718 12.8306 16.4876 13.7396 15.836 14.5391C15.5984 14.8302 15.6452 15.2584 15.9404 15.4917C16.0673 15.5932 16.2185 15.643 16.3697 15.643C16.5695 15.643 16.7684 15.554 16.9043 15.3902C17.6657 14.4527 18.2318 13.3925 18.5882 12.2326C20.112 7.27568 17.2752 2.01589 12.264 0.508766ZM14.8622 15.8245L12.9704 15.5895C12.5951 15.5415 12.2522 15.8059 12.2054 16.1771C12.164 16.5029 12.3656 16.8056 12.6707 16.9053C10.9292 17.6353 8.97343 17.7475 7.13481 17.1946C2.84631 15.9056 0.418094 11.4045 1.72218 7.15982C2.02728 6.16808 2.51149 5.25916 3.16309 4.45963C3.39979 4.16853 3.3539 3.74299 3.05869 3.50706C2.7635 3.27205 2.33239 3.31922 2.09568 3.61033C1.33426 4.54598 0.768162 5.60626 0.411751 6.76633C-1.11197 11.7232 1.72576 16.9828 6.73701 18.4899C8.97805 19.1638 11.3677 18.9929 13.4673 18.0385L13.4502 18.0839C13.3188 18.4365 13.4988 18.8273 13.8534 18.9564C13.9326 18.984 14.0127 19 14.0919 19C14.37 19 14.632 18.8291 14.7346 18.5575L15.4204 16.7325C15.4933 16.5385 15.4726 16.3221 15.3637 16.145C15.2548 15.9678 15.0712 15.8494 14.8633 15.8254L14.8622 15.8245Z"
                      fill="#6524EB"
                    />
                  </svg>
                </div>
                <p className={styles.managementText}>Upgrade</p>
              </div>
              <div
                className={styles.managementItem}
                onClick={() => {
                  if (agentStatus === true) {
                    handleInactiveAgentAlert();
                  } else {
                    navigate("/add-file", {
                      state: {
                        agent_id: agentData?.agent?.agent_id,
                        knowledgeBaseId: agentData?.agent?.knowledgeBaseId,
                      },
                    });
                  }
                }
                }
              >
                <div className={styles.SvgDesign}>
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.50093 8.65722C11.9787 8.65722 14.0127 10.5339 14.2304 12.9286V13.7058H4.77122V12.9286C4.98902 10.5338 7.02327 8.65722 9.50093 8.65722ZM11.7627 5.80843C11.7627 4.57634 10.7465 3.57124 9.50093 3.57124C8.25533 3.57124 7.2392 4.57634 7.2392 5.80843C7.2392 7.04052 8.25533 8.04562 9.50093 8.04562C10.7465 8.04562 11.7627 7.04052 11.7627 5.80843ZM12.264 0.508766C10.0229 -0.165144 7.63425 0.00578332 5.53367 0.960128L5.55077 0.914725C5.68217 0.562182 5.50217 0.17404 5.14666 0.0422889C4.79205 -0.0876866 4.39785 0.0921426 4.26556 0.442008L3.57974 2.26701C3.50684 2.46109 3.52754 2.67742 3.63554 2.85457C3.74444 3.03173 3.92804 3.15014 4.13595 3.17596L6.02777 3.40919C6.40307 3.45638 6.74598 3.19286 6.79278 2.82164C6.83418 2.4958 6.63257 2.19313 6.32748 2.09342C8.069 1.36342 10.0248 1.25125 11.8634 1.80409C16.1519 3.09585 18.581 7.59694 17.2769 11.8389C16.9718 12.8306 16.4876 13.7396 15.836 14.5391C15.5984 14.8302 15.6452 15.2584 15.9404 15.4917C16.0673 15.5932 16.2185 15.643 16.3697 15.643C16.5695 15.643 16.7684 15.554 16.9043 15.3902C17.6657 14.4527 18.2318 13.3925 18.5882 12.2326C20.112 7.27568 17.2752 2.01589 12.264 0.508766ZM14.8622 15.8245L12.9704 15.5895C12.5951 15.5415 12.2522 15.8059 12.2054 16.1771C12.164 16.5029 12.3656 16.8056 12.6707 16.9053C10.9292 17.6353 8.97343 17.7475 7.13481 17.1946C2.84631 15.9056 0.418094 11.4045 1.72218 7.15982C2.02728 6.16808 2.51149 5.25916 3.16309 4.45963C3.39979 4.16853 3.3539 3.74299 3.05869 3.50706C2.7635 3.27205 2.33239 3.31922 2.09568 3.61033C1.33426 4.54598 0.768162 5.60626 0.411751 6.76633C-1.11197 11.7232 1.72576 16.9828 6.73701 18.4899C8.97805 19.1638 11.3677 18.9929 13.4673 18.0385L13.4502 18.0839C13.3188 18.4365 13.4988 18.8273 13.8534 18.9564C13.9326 18.984 14.0127 19 14.0919 19C14.37 19 14.632 18.8291 14.7346 18.5575L15.4204 16.7325C15.4933 16.5385 15.4726 16.3221 15.3637 16.145C15.2548 15.9678 15.0712 15.8494 14.8633 15.8254L14.8622 15.8245Z"
                      fill="#6524EB"
                    />
                  </svg>
                </div>
                <p className={styles.managementText}>Knowledge Files</p>
              </div>
            </div>
            <hr className={styles.line} />
            <h1 className={styles.Agenttitle}>
              Agent Analysis<span>(Current Month)</span>
            </h1>
            <div className={styles.agentStats}>
              <div
                className={` ${styles.stat} ${styles.Yellow}`}
                onClick={handleCallHistoryNavigation}
              >
                <div className={` ${styles.statText} `}>Total Calls</div>
                <div className={styles.statDetail}>
                  {agentData?.callSummary?.totalCalls || "0"}
                </div>
              </div>

              <div
                className={` ${styles.stat} ${styles.blue}`}
                onClick={handleCallHistoryNavigation}
              >
                <span className={` ${styles.statText} `}>
                  Avg. Call Duration
                </span>

                <span className={styles.statDetail}>
                  {agentData?.avgCallTime?.minutes ||
                    agentData?.avgCallTime?.seconds ? (
                    <>
                      {agentData?.avgCallTime?.minutes}
                      <span className={styles.MinFont}>m</span>
                      {agentData?.avgCallTime?.seconds}
                      <span className={styles.MinFont}>s</span>
                    </>
                  ) : (
                    <>NA</>
                  )}
                </span>
              </div>

              <div
                className={` ${styles.stat}  ${styles.Purple}`}
                onClick={() => setShowModal(true)}
              >
                <span className={` ${styles.statText}`}>Bookings</span>
                <span className={styles.statDetail}>{meetingCount}</span>
              </div>

              <div
                className={` ${styles.stat} ${styles.Red}`}
                onClick={() => setShowModal(true)}
              >
                <span className={` ${styles.statText} `}>
                  Minutes Remaining
                </span>
                <span className={styles.statDetail}>
                  {Math.floor(agentData?.agent?.mins_left / 60)}
                </span>
              </div>
            </div>

            <section className={styles.management}>
              <AgentAnalysis
                agentId={agentDetails?.agentId}
                data={agentData?.callSummary?.data}
                calApiKey={agentData?.agent?.calApiKey}
                callVolume={agentData?.callSummary?.totalCalls}
              />
            </section>
          </div>

          {openCallModal && (
            <Modal3
              isOpen={openCallModal}
              onClose={closeCallTestModal}
              isEndingRef={isEndingRef}
            >
              <CallTest
                isCallActive={isCallActive}
                onStartCall={handleStartCall}
                onEndCall={handleEndCall}
                callLoading={callLoading}
                setCallLoading={setCallLoading}
                agentName={agentData?.agent?.agentName}
                agentAvatar={agentData?.agent?.avatar}
                businessName={
                  agentData?.business?.businessName ||
                  agentData?.business?.googleBusinessName ||
                  agentData?.knowledge_base_texts?.name
                }
                isEndingRef={isEndingRef}
              />
            </Modal3>
          )}

          {/* OffCanvas for Logout */}

          {isCalModalOpen && (
            <div
              className={styles.modalBackdrop}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  e.stopPropagation();
                }
              }}
            >
              <div
                className={styles.modalContainer}
                onClick={(e) => e.stopPropagation()}
              >
                <h2>Connect with Cal</h2>
                <p>
                  Click on the link to connect with Cal:{" "}
                  <a
                    href="https://refer.cal.com/designersx"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Click to connect with cal
                  </a>
                </p>
                <p>
                  {" "}
                  Need a hand connecting with Cal.com?{" "}
                  <a href="/calinfo" target="_blank" rel="noopener noreferrer">
                    See quick setup guide
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
                      onClick={closeCalModal}
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
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value <= 999) {
                              setEventLength(value);
                            }
                          }}
                          max="999"
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
          {isAddressModalOpen && (
            <div className={styles.modalBackdrop1}>
              <div className={styles.modalContainer1}>
                <h3>Full Address</h3>
                <p>{fullAddress}</p>
                <button className={styles.hello} onClick={closeAddressModal}>
                  Close
                </button>
              </div>
            </div>
          )}

          {openWidgetModal && (
            <Modal2 isOpen={openWidgetModal} onClose={handleCloseWidgetModal}>
              <WidgetScript
                isAgentDetails={agentDetail}
                onClose={handleCloseWidgetModal}
                refreshFuntion={handleRefresh}
                alertPopUp={handleAlertPopUp}
              />
            </Modal2>
          )}

          {/* Card1 Section Modal Start */}
          <DetailModal
            isOpen={!!openCard}
            onClose={() => setOpenCard(null)}
            height="80vh"
          >
            {openCard === "card1" && <Card1 data={businessDetails} />}

            {openCard === "card2" && (
              <Card2 agentKnowledge={knowledge_base_texts} />
            )}
          </DetailModal>

          <DetailModal
            isOpen={isModalOpen}
            onClose={() => handleCloseEditagentModalOpen()}
            height="80vh"
          >
            <div>
              <EditAgent agentDetails={agentDetails} />
            </div>
          </DetailModal>

          <AssignNumberModal
            isOpen={isAssignModalOpen}
            agentId={agentDetails?.agentId}
            agentDetails={businessDetails}
            onAssignNumber={handleAssignNumberUpdated}
            onAgentDetailsPage={true}
            onClose={() => {
              setIsAssignModalOpen(false);
              setRefresh((prev) => !prev);
            }}
          />
          {isAssignNumberModalOpen && (
            <div
              className={styles.modalBackdrop}
              onClick={closeAssignNumberModal}
            >
              <div
                className={styles.modalContainer}
                onClick={(e) => e.stopPropagation()}
              >
                <h2>Upgrade Required!</h2>
                <p
                  style={{
                    fontSize: "1.1rem",
                    color: "#444",
                    margin: "16px 0",
                  }}
                >
                  To get an agent number, you need to upgrade your plan. Unlock
                  access to premium features by choosing a higher plan.
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

          {isAssignNumberModal && (
            <CommingSoon
              show={isAssignNumberModal}
              onClose={handleCloseAssignNumberModal}
            />
          )}
          {popupMessage && (
            <PopUp
              type={popupType}
              message={popupMessage}
              onClose={() => setPopupMessage("")}
            />
          )}
          <PopUp
            type={popupType3}
            message={popupMessage3}
            onClose={() => {
              if (!isConfirmedRef.current) {
                // handleConnectCal(agentDetailsForCal);
              }
              isConfirmedRef.current = false;
              setPopupMessage3("");
            }}
            onConfirm={() => {
              isConfirmedRef.current = true;
              handleCalConnectWithConfirm();
              setPopupMessage3("");
            }}
          />

          <Footer2 />
        </>
      )}
    </div>
  );
};
export default AgentDashboard;
const fetchPrevAgentDEtails = async (agent_id, businessId) => {
  try {
    const response = await getUserAgentMergedDataForAgentUpdate(
      agent_id,
      businessId
    );

    const agent = response?.data?.agent;
    const business = response?.data?.business;

    sessionStorage.setItem("UpdationMode", "ON");
    sessionStorage.setItem("agentName", agent.agentName);
    sessionStorage.setItem("agentGender", agent.agentGender);
    sessionStorage.setItem("agentLanguageCode", agent.agentLanguageCode);
    sessionStorage.setItem("agentLanguage", agent.agentLanguage);
    sessionStorage.setItem("llmId", agent.llmId);
    sessionStorage.setItem("agent_id", agent.agent_id);
    sessionStorage.setItem("knowledgeBaseId", agent.knowledgeBaseId);

    //need to clear later
    localStorage.setItem("UpdationMode", "ON");
    localStorage.setItem("UpdationModeStepWise", "ON");
    localStorage.setItem("agentName", agent.agentName);
    localStorage.setItem("agentGender", agent.agentGender);
    localStorage.setItem("agentLanguageCode", agent.agentLanguageCode);
    localStorage.setItem("agentLanguage", agent.agentLanguage);
    localStorage.setItem("llmId", agent.llmId);
    localStorage.setItem("agent_id", agent.agent_id);
    localStorage.setItem("knowledgeBaseId", agent.knowledgeBaseId);
    localStorage.setItem("agentRole", agent.agentRole);
    localStorage.setItem("agentVoice", agent.agentVoice);
    localStorage.setItem("agentVoiceAccent", agent.agentAccent);
    localStorage.setItem("avatar", agent.avatar);
    sessionStorage.setItem("googleListing", business.googleUrl);
    sessionStorage.getItem("displayBusinessName");
    localStorage.setItem("googleUrl", business.googleUrl);
    localStorage.setItem("webUrl", business.webUrl);
    localStorage.setItem("aboutBusiness", business.aboutBusiness);
    localStorage.setItem(
      "additionalInstruction",
      business.additionalInstruction
    );
    localStorage.setItem("knowledge_base_name", business.knowledge_base_name);
    localStorage.setItem("knowledge_base_id", business.knowledge_base_id);
    //need to clear above

    sessionStorage.setItem(
      "aboutBusinessForm",
      JSON.stringify({
        businessUrl: business.webUrl,
        googleListing: business.googleUrl,
        aboutBusiness: business.aboutBusiness,
        note: business.additionalInstruction,
        isGoogleListing: business.isGoogleListing,
        isWebsiteUrl: business.isWebsiteUrl,
      })
    );

    sessionStorage.setItem("agentRole", agent.agentRole);
    sessionStorage.setItem("agentVoice", agent.agentVoice);
    sessionStorage.setItem("agentVoiceAccent", agent.agentAccent);
    sessionStorage.setItem("avatar", agent.avatar);
    sessionStorage.setItem("businessDetails", agent.business);
    sessionStorage.setItem("businessId", agent.businessId);
    sessionStorage.setItem("bId", agent.businessId);
    sessionStorage.setItem("displayBusinessName", business.googleBusinessName);

    sessionStorage.setItem("agentRole", agent.agentRole);
    sessionStorage.setItem("agentVoice", agent.agentVoice);
    sessionStorage.setItem("agentVoiceAccent", agent.agentAccent);
    sessionStorage.setItem("avatar", agent.avatar);
    sessionStorage.setItem("businessDetails", agent.business);
    sessionStorage.setItem("businessId", agent.businessId);
    sessionStorage.setItem("bId", agent.businessId);

    const businessData = {
      userId: business.userId,
      businessType: business.businessType,
      businessName: business.businessName.trim(),
      businessSize: business.businessSize,
      customBuisness: business.customBuisness,
    };
    let parsedServices = safeParse(business.buisnessService, []);
    sessionStorage.setItem(
      "businesServices",
      JSON.stringify({
        selectedService: parsedServices,
        email: business.buisnessEmail,
      })
    );
    //custome servce filter and save

    let rawCustomServices = business?.customServices || [];

    if (typeof rawCustomServices === "string") {
      try {
        rawCustomServices = JSON.parse(rawCustomServices);
      } catch (err) {
        console.error("Failed to parse customServices:", rawCustomServices);
        rawCustomServices = [];
      }
    }

    const cleanedCustomServices = Array.isArray(rawCustomServices)
      ? rawCustomServices
        .map((item) => item?.service?.trim())
        .filter(Boolean)
        .map((service) => ({ service }))
      : [];

    sessionStorage.setItem(
      "selectedCustomServices",
      JSON.stringify(cleanedCustomServices)
    );

    sessionStorage.setItem("businessDetails", JSON.stringify(businessData));
    let raw_knowledge_base_texts = business?.knowledge_base_texts || [];

    if (typeof raw_knowledge_base_texts === "string") {
      try {
        raw_knowledge_base_texts = JSON.parse(raw_knowledge_base_texts);
      } catch (err) {
        console.error(
          "Failed to parse customServices:",
          raw_knowledge_base_texts
        );
        raw_knowledge_base_texts = [];
      }
    }

    sessionStorage.setItem(
      "placeDetailsExtract",
      JSON.stringify(raw_knowledge_base_texts)
    );
    sessionStorage.setItem("agentNote", agent?.additionalNote);
  } catch (error) {
    console.log("An Error Occured while fetching Agent Data for ", error);
  }
};

const safeParse = (value, fallback = null) => {
  try {
    if (typeof value === "string") {
      const cleaned = value.trim();
      if (
        (cleaned.startsWith("[") && cleaned.endsWith("]")) ||
        (cleaned.startsWith("{") && cleaned.endsWith("}")) ||
        (cleaned.startsWith('"') && cleaned.endsWith('"'))
      ) {
        return JSON.parse(cleaned);
      }
    }
    return value;
  } catch {
    return fallback;
  }
};
