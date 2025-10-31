import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./Dashboard.module.css";
import Footer from "../AgentDetails/Footer/Footer";
import Plan from "../Plan/Plan";
import { useNavigate, useLocation, Await } from "react-router-dom";
import dayjs from "dayjs";
import introJs from "intro.js";
import "intro.js/minified/introjs.min.css";

import {
  deleteAgent,
  EndWebCallUpdateAgentMinutesLeft,
  fetchDashboardDetails,
  getBusinessDetailsByBusinessId,
  getUserAgentMergedDataForAgentUpdate,
  toggleAgentActivation,
  updateAgentKnowledgeBaseId,
  getUserReferralCodeForDashboard,
  updateShowReferralFloatingStatus,
  updateAgentEventId,
  refundAndCancelSubscriptionAgnetApi,
  API_BASE_URL,
  getDashboardTourStatus,
  markDashboardTourSeen,
  getAppointments,
} from "../../Store/apiStore";
import decodeToken from "../../lib/decodeToken";
import { useDashboardStore } from "../../Store/agentZustandStore";
import { RetellWebClient } from "retell-client-js-sdk";
import useUser from "../../Store/Context/UserContext";
import Modal2 from "../Modal2/Modal2";
import CallTest from "../CallTest/CallTest";
import WidgetScript from "../Widgets/WidgetScript";
import Popup from "../Popup/Popup";
import UploadProfile from "../Popup/profilePictureUpdater/UploadProfile";
import AssignNumberModal from "../AgentDetails/AssignNumberModal";
import CommingSoon from "../ComingSoon/CommingSoon";
import Footer2 from "../AgentDetails/Footer/Footer2";
import Modal from "../Modal2/Modal2";
import Loader from "../Loader/Loader";
import getKnowledgeBaseName from "../../utils/getKnowledgeBaseName";
import Refferal from "../Refferal/Refferal";
import Modal3 from "../Modal3/Modal3";

import AnimatedButton from "../AnimatedButton/AnimatedButton";

import axios from "axios";
import { RefreshContext } from "../PreventPullToRefresh/PreventPullToRefresh";
import PopUp from "../Popup/Popup";
import getTimezoneFromState from "../../lib/timeZone";

import { useNotificationStore } from "../../Store/notificationStore";

import ConfirmModal from "../ConfirmModal/ConfirmModal";
import NotificationView from "../Notifications/NotificationView";

function Dashboard() {
  const { agents, totalCalls, total_chat, hasFetched, setDashboardData, setHasFetched } =
    useDashboardStore();


  const allAgentsData = JSON.parse(
    sessionStorage.getItem("dashboard-session-storage")
  );
  const currentAgents = allAgentsData?.state?.agents

  const [showDelayedPopup, setShowDelayedPopup] = useState(false);

  useEffect(() => {
    let timer;

    // Only set delay if agents are undefined or empty
    if (currentAgents === undefined || currentAgents?.length === 0) {
      timer = setTimeout(() => {
        setShowDelayedPopup(true);
      }, 1000); // delay 1s
    } else {
      setShowDelayedPopup(false); // reset if agents exist
    }

    return () => clearTimeout(timer);
  }, [currentAgents]);


  const isRefreshing = useContext(RefreshContext);

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const navigate = useNavigate();
  const { user } = useUser();
  // Retell Web Client states
  const [retellWebClient, setRetellWebClient] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [openCallModal, setOpenCallModal] = useState(false);
  const [agentDetails, setAgentDetails] = useState(null);
  const [openWidgetModal, setOpenWidgetModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCallInProgress, setIsCallInProgress] = useState(false);
  const packageName = sessionStorage.getItem("package") || "Free";
  // UserId decoded from token
  const token = localStorage.getItem("token") || "";
  const decodeTokenData = decodeToken(token);
  const userIdFromToken = decodeTokenData?.id || "";
  const [userId, setUserId] = useState(userIdFromToken);
  // Agents and UI states
  const [localAgents, setLocalAgents] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openOffcanvas, setOpenOffcanvas] = useState(false);

  // const [timeZone, setTimeZone] = useState("")

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

  const isValidCalApiKey = (key) => key.startsWith("cal_live_");
  const [showCalKeyInfo, setShowCalKeyInfo] = useState(false);

  const [calBookingCount, setCalBookingCount] = useState(0);
  const [dbBookingCount, setDbBookingCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);


  const [callId, setCallId] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [popupMessage2, setPopupMessage2] = useState("");
  const [popupType2, setPopupType2] = useState("success");
  const [popupMessage3, setPopupMessage3] = useState();
  const [popupType3, setPopupType3] = useState("confirm");
  const [callLoading, setCallLoading] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const isSmallFont =
    totalCalls?.toString().length > 1 || bookingCount?.toString().length > 1;
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const profileRef = useRef(null);
  const [isAssignApi, setisAssignApi] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAgentForAssign, setSelectedAgentForAssign] = useState(null);
  const [checkPaygStatus, setcheckPaygStatus] = useState()
  const [paygEnabledPopup, setpaygEnabledPopup] = useState(false)
  const [isAssignNumberModalOpen, setIsAssignNumberModalOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [showPaygConfirm, setshowPaygConfirm] = useState(false);
  const [close, setClose] = useState(false);
  const [assignNumberNavigate, setassignNumberNavigate] = useState(false)
  const [modelOpen, setModelOpen] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [agentToDeactivate, setAgentToDeactivate] = useState(null);
  const [agentToPaygActivate, setagentToPaygActivate] = useState(null);
  const [agentId, setagentId] = useState();
  const [subscriptionId, setsubscriptionId] = useState();
  const [assignNumberPaid, setAssignNumberPaid] = useState(false);
  const openAssignNumberModal = () => setIsAssignNumberModalOpen(true);
  const closeAssignNumberModal = () => {
    setIsAssignNumberModalOpen(false)
    setisAssignApi(false)
  }
  const dropdownRefs = useRef({});
  const location = useLocation();
  const [pendingUpgradeAgent, setPendingUpgradeAgent] = useState(null);
  const [showUpgradeConfirmModal, setShowUpgradeConfirmModal] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const [deactivateLoading, setDeactivateLoading] = useState(false);

  const [calloading, setcalloading] = useState(false);
  const [calapiloading, setCalapiloading] = useState(false);
  const [deleteloading, setdeleteloading] = useState(false);
  const [isApiKeySubmitted, setIsApiKeySubmitted] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [agentToCancel, setAgentToCancel] = useState(null);
  const [showDashboardReferral, setShowDashboardReferral] = useState("");
  const [showreferralfloating, setShowreferralfloating] = useState(
    localStorage.getItem("showreferralfloating") || "true"
  );
  const [copied, setCopied] = useState(false);
  const [userCalApiKey, setUserCalApiKey] = useState(
    sessionStorage.getItem("userCalApiKey")
  );
  const [agentDetailsForCal, setAgentDetailsForCal] = useState([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const isConfirmedRef = useRef(false);
  const [activeSubs, setActiveSubs] = useState(false);
  const [timeZone, setTimeZone] = useState("");
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = notifications.filter((n) => n.status === "unread").length;
  const [redirectButton, setredirectButton] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false)

  const [showDashboardTour, setShowDashboardTour] = useState(false);
  const [tourStatusLoaded, setTourStatusLoaded] = useState(false);
  const [tourElevateDropdown, setTourElevateDropdown] = useState(false);
  const [tourDropdownPos, setTourDropdownPos] = useState(null);
  const [forceTourOpenAgentId, setForceTourOpenAgentId] = useState(null);
  const [lockBgForTour, setLockBgForTour] = useState(false);
  const [notificatioView, setNotificationsView] = useState(false)


  const closeTourMenu = () => {
    setOpenDropdown(null);
    setForceTourOpenAgentId(null);
    setTourElevateDropdown(false);
    setTourDropdownPos(null);
    setLockBgForTour(false);

    requestAnimationFrame(() => {
      setOpenDropdown(null);
      setForceTourOpenAgentId(null);
      setTourElevateDropdown(false);
    });
  };
  sessionStorage.removeItem("isUser")
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const isTruthy = (v) => v === 1 || v === "1" || v === true || v === "true";

    (async () => {
      try {
        const resp = await getDashboardTourStatus(userId);
        const d = resp?.data ?? resp;
        let shouldShow;
        if (typeof d?.shouldShow === "boolean") {
          shouldShow = d.shouldShow;
        } else {
          const eligible = isTruthy(d?.dashboardTourEligible);
          const seen = isTruthy(d?.dashboardTourSeen);
          shouldShow = eligible && !seen;
        }

        if (!cancelled) setShowDashboardTour(!!shouldShow);
      } catch (err) {
        if (!cancelled) setShowDashboardTour(false);
        console.error("Failed to get dashboard tour status:", err);
      } finally {
        if (!cancelled) setTourStatusLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);


  const introRef = useRef(null);
  const tourStartLockRef = useRef(false);
  const tourRanRef = useRef(false);
  const tourSeenMarkedRef = useRef(false);
  const tourShownAtLeastOneStepRef = useRef(false);
  const tourMenuStepRef = useRef(false);
  useEffect(() => {
    if (!tourStatusLoaded) return;
    if (!showDashboardTour) return;
    if (!localAgents.length) return;
    if (tourRanRef.current) return;
    if (tourStartLockRef.current) return;

    tourStartLockRef.current = true;
    requestAnimationFrame(async () => {
      const started = await startDashboardTour();
      if (started) tourRanRef.current = true;
      tourStartLockRef.current = false;
    });
  }, [tourStatusLoaded, showDashboardTour, localAgents.length]);

  const isTourActiveRef = useRef(false);

  useEffect(() => {
    if (introRef.current && openDropdown) {
      introRef.current.refresh();
    }
  }, [openDropdown]);

  const startDashboardTour = async () => {
    if (!showDashboardTour || !localAgents.length || introRef.current)
      return false;
    const targetAgentId = localAgents?.[0]?.agent_id;

    const baseTip = styles.customTourTooltip;
    const menuTip = styles.tourTooltipOnMenu;

    const newSteps = [
      {
        element: "#tour-profile",
        title: "Account & Billing",
        intro:
          "Welcome! This is your profile. Click here to manage your account details, subscription, and billing information.",
        position: "right",
      },
      // {
      //   element: "#tour-footer-create",
      //   title: "Guide Tour",
      //   intro:
      //     "This is where the magic happens! Click 'Create' to build and customize your AI Receptionist.",
      //   position: "top",
      // },
      {
        element: "#tour-assign-number",
        title: "Assign Phone Number",
        intro:
          "To get your agent live, you need to assign it a dedicated phone number. This is how your customers will reach it.",
        position: "bottom",
      },
      {
        element: "#tour-cal-com",
        title: "Connect Calendar",
        intro:
          "Want your receptionist to book appointments? Connect your calendar here to enable seamless scheduling for your business.",
        position: "left",
      },
      {
        element: `#tour-menu-test-${targetAgentId}`,
        title: "Test Your Agent",
        intro:
          "Before going live, use this to call your agent and test its voice, conversational style, and overall performance.",
        position: "left",
        scrollToElement: false,
        disableInteraction: false,
        tooltipClass: `${baseTip} ${menuTip}`,
      },
      {
        element: `#tour-menu-integrate-${targetAgentId}`,
        title: "Website Integration",
        intro:
          "Extend your agent's reach! You can integrate it directly into your website to handle live calls and inquiries.",
        position: "left",
        scrollToElement: false,
        tooltipClass: `${baseTip} ${menuTip}`,
        disableInteraction: false,
      },
      {
        element: "#tour-total-calls",
        title: "Call History",
        intro:
          "This is where you can see the total number of calls your agent has handled for you.",
        position: "bottom",
      },
      {
        element: "#tour-total-bookings",
        title: "Scheduled Bookings ",
        intro:
          "View all the appointments your agent has scheduled for your business right here.",
        position: "bottom",
      },

  
      {
        element: "#tour-footer-support",
        title: " Help & Support",
        intro:
          "View and manage all the appointments scheduled by your Receptionist in one place.",
        position: "top",
      },
    ];

    const setDropdownPosFromTrigger = () => {
      const triggerEl = document.getElementById(
        `tour-menu-trigger-${targetAgentId}`
      );
      const rect = triggerEl?.getBoundingClientRect();
      if (!rect) return;


      // Assign Number




      const GAP = 8;
      const DROPDOWN_WIDTH = 170;


      setTourDropdownPos({
        top: rect.bottom + GAP,
        left: rect.left - (DROPDOWN_WIDTH - rect.width),
      });
    };

    const intro = introJs();
    introRef.current = intro;
    // shivam code
    intro.setOptions({
      steps: newSteps,
      tooltipClass: styles.customTourTooltip,
      overlayOpacity: 0.35,
      showProgress: true,
      showButtons: true,
      showBullets: false,
      nextLabel: "Next →",
      prevLabel: "← Back",
      skipLabel: "Skip Tour",
      doneLabel: "Finish",
      showCloseButton: false,
      buttonClass: styles.tourBtn,
      scrollToElement: true,
      exitOnOverlayClick: false,
      disableInteraction: true,
      fixElementPosition: true,
      highlightClass: styles.tourHighlight,
    });


    // const timeZone = Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone;



    const isMenuId = (id = "") =>
      id.startsWith("tour-menu-trigger-") ||
      id.startsWith("tour-menu-test-") ||
      id.startsWith("tour-menu-integrate-");

    intro.onbeforechange((el) => {
      const id = el?.id || "";
      if (isMenuId(id)) setDropdownPosFromTrigger();
    });
    intro.onchange((el) => {
      const id = el?.id || "";
      if (isMenuId(id)) {
        setOpenDropdown(targetAgentId);
        setForceTourOpenAgentId(targetAgentId);
        setTourElevateDropdown(true);
        setDropdownPosFromTrigger();
        setLockBgForTour(true);

        intro.setOption("disableInteraction", false);
        intro.setOption("fixElementPosition", false);
        intro.setOption("scrollToElement", false);

        requestAnimationFrame(() =>
          requestAnimationFrame(() => intro.refresh())
        );
      } else {
        intro.setOption("disableInteraction", true);
        setOpenDropdown(null);
        setForceTourOpenAgentId(null);
        setTourElevateDropdown(false);
        intro.setOption("fixElementPosition", true);
        intro.setOption("scrollToElement", true);
        setLockBgForTour(false);
      }
    });


    intro.onafterchange(() => {
      requestAnimationFrame(() => intro.refresh());
    });

    const markSeenOnce = async () => {
      if (tourSeenMarkedRef.current) return;
      if (!tourShownAtLeastOneStepRef.current) return;
      try {
        await markDashboardTourSeen(userId);
        tourSeenMarkedRef.current = true;
        tourRanRef.current = true;
        setShowDashboardTour(false);
      } catch (e) {
        console.error("Failed to mark dashboard tour seen:", e);
      }
    };
    intro.onstart(() => {
      isTourActiveRef.current = true;
    });
    const cleanup = () => {
      isTourActiveRef.current = false;
      document
        .querySelectorAll(`.${styles.tourHighlight}`)
        .forEach((el) => el.classList.remove(styles.tourHighlight));
      closeTourMenu();
      introRef.current = null;
      markSeenOnce();
    };

    intro.oncomplete(cleanup);
    intro.onexit(cleanup);
    intro.onbeforeexit(() => {
      tourShownAtLeastOneStepRef.current = true;
      cleanup();
    });

    try {
      intro.start();
      return true;
    } catch (err) {
      console.error("Tour failed to start:", err);
      cleanup();
      return false;
    }
  };
  useEffect(() => {
    if (!lockBgForTour) closeTourMenu();
  }, [lockBgForTour]);

  useEffect(() => {
    if (hasFetched && localAgents.length && !tourRanRef.current) {
      const id = requestAnimationFrame(async () => {
        const started = await startDashboardTour();
        if (started) tourRanRef.current = true;
      });
      return () => cancelAnimationFrame(id);
    }
  }, [hasFetched, localAgents.length]);

  const checkActiveSubscription = async () => {
    try {
      let res = await axios.post(
        `${API_BASE_URL}/checkSubscriptiAgent`,
        { userId: userId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setActiveSubs(res?.data?.paymentDone);
    } catch (error) {
      console.error(
        "Subscription check failed:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    setTimeout(() => {
      checkActiveSubscription();
    }, 2000);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      checkActiveSubscription();
    }, 2000);
  }, []);
  useEffect(() => {
    window.history.pushState(null, document.title, window.location.pathname);

    const handlePopState = () => {
      navigate("/dashboard");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);
  const handleAssignNumberClick = async (agent, e) => {
    setAgentDetails(agent);
    e.stopPropagation();
    const isValid = await handleAssignNumberValidtyCheck(agent.agent_id);

    if (agent?.isDeactivated === 1) {
      handleInactiveAgentAlert();
      return;
    }
    else if (isValid.paymentVerified === true) {
      navigate("/assign-number", {
        state: { agent: agent },
      });
    }
    else if (isValid.success === true && assignNumberPaid === false) {
      // alert("Your Assign Number for 1 mpnth is expired now charge again");
      // return
      // openAssignNumberModal();
      setShowUpgradeConfirmModal(true)
      return
    }
    else if (isValid.isAssignFreeDone === 1 && isValid.success === false) {
      // openAssignNumberModal();
      setShowUpgradeConfirmModal(true)
      return
    }


    // const planName = agent?.subscription?.plan_name || "Free";
    // if (planName.toLowerCase() === "free" && !assignNumberPaid) {
    //   openAssignNumberModal();
    //   // setShowUpgradeConfirmModal(true)
    // } else {
    //   navigate("/assign-number", {
    //     state: { agent: agent },
    //   });
    // }
    navigate("/assign-number", {
      state: { agent: agent },
    });
  };
  useEffect(() => {
    if (localStorage.getItem("UpdationMode") == "ON") {
      localStorage.removeItem("UpdationMode");
      localStorage.removeItem("displayBusinessName");
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
      localStorage.removeItem("knowledge_base_id");
      localStorage.removeItem("knowledge_base_name");
      localStorage.removeItem("selectedAgentAvatar");
      localStorage.removeItem("webUrl");
      localStorage.removeItem("googleUrl");
      localStorage.removeItem("webUrl");
      localStorage.removeItem("aboutBusiness");
      localStorage.removeItem("additionalInstruction");
      localStorage.removeItem("knowledge_base_name");
      localStorage.removeItem("knowledge_base_id");
      localStorage.removeItem("bId");
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
      sessionStorage.removeItem("selectedfilterOption");
      sessionStorage.removeItem("placeDetailsExtract");
      sessionStorage.removeItem("agentNote");
      sessionStorage.removeItem("prevBuisnessType");
      sessionStorage.removeItem("prevAgentGender");
      sessionStorage.removeItem("prevAgentGender");
      sessionStorage.removeItem("UpdationModeStepWise");
      sessionStorage.removeItem("customServices");
      sessionStorage.removeItem("agentCode");
      sessionStorage.removeItem("businessUrl");
      sessionStorage.removeItem("selectedServices");
      sessionStorage.removeItem("chatWebWidget")
       sessionStorage.removeItem("subType")
    } else {
      localStorage.removeItem("UpdationMode");
      localStorage.removeItem("displayBusinessName");
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
      localStorage.removeItem("knowledge_base_id");
      localStorage.removeItem("knowledge_base_name");
      localStorage.removeItem("selectedAgentAvatar");
      localStorage.removeItem("webUrl");
      localStorage.removeItem("googleUrl");
      localStorage.removeItem("webUrl");
      localStorage.removeItem("aboutBusiness");
      localStorage.removeItem("additionalInstruction");
      localStorage.removeItem("knowledge_base_name");
      localStorage.removeItem("knowledge_base_id");
      localStorage.removeItem("bId");
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
      sessionStorage.removeItem("completedSteps");
      sessionStorage.removeItem("currentStep");
      sessionStorage.removeItem("avtarChecked");
      sessionStorage.removeItem("selectedLang");
      sessionStorage.removeItem("agentStatus");
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
      sessionStorage.removeItem("selectedfilterOption");
      sessionStorage.removeItem("placeDetailsExtract");
      sessionStorage.removeItem("agentNote");
      sessionStorage.removeItem("prevBuisnessType");
      sessionStorage.removeItem("prevAgentGender");
      sessionStorage.removeItem("prevAgentGender");
      sessionStorage.removeItem("UpdationModeStepWise");
      sessionStorage.removeItem("customServices");
      sessionStorage.removeItem("agentCode");
      sessionStorage.removeItem("businessUrl");
      sessionStorage.removeItem("selectedServices");
      sessionStorage.removeItem("selectedPlan");
      sessionStorage.removeItem("updateBtn");
      localStorage.removeItem("allPlans");
      sessionStorage.removeItem("checkPage");
      localStorage.removeItem("hasHandledThankYou");
      localStorage.removeItem("checkPage2");
      localStorage.removeItem("paymentDone");
      localStorage.removeItem("subcriptionIdUrl");
      // localStorage.removeItem("isPayg")
      sessionStorage.removeItem("VoiceAgentName");
      sessionStorage.removeItem("selectedLangCode");
      sessionStorage.removeItem("AgentCode");
      sessionStorage.removeItem("priceId");
      sessionStorage.removeItem("price");
      sessionStorage.removeItem("selectedSiteMapUrls");
      sessionStorage.removeItem("urls");
      sessionStorage.removeItem("chat_agent_id");
      sessionStorage.removeItem("chat_llm_id")
      sessionStorage.removeItem("chatWebWidget")
            sessionStorage.removeItem("subType")
      


    }
  }, []);

  useEffect(() => {
    if (!localAgents?.length || !userId) {
      setCalBookingCount(0);
      setDbBookingCount(0);
      setBookingCount(0);
      return;
    }

    const fetchCounts = async () => {
      // ---- Cal.com total (across agents, filtered by eventId when present)
      let calTotal = 0;
      const seen = new Set(); // avoid duplicate calls for identical (apiKey,eventId) pairs

      for (const ag of localAgents) {
        const key = ag?.calApiKey?.trim();
        if (!key) continue;

        // de-dup per (apiKey,eventId) tuple to avoid counting same list multiple times
        const dedupKey = `${key}:${ag?.eventId ?? ""}`;
        if (seen.has(dedupKey)) continue;
        seen.add(dedupKey);

        try {
          const resp = await fetch(
            `https://api.cal.com/v1/bookings?apiKey=${encodeURIComponent(key)}`
          );
          if (!resp.ok) throw new Error("Cal.com fetch failed");
          const json = await resp.json();

          const filtered =
            json?.bookings?.filter(b =>
              ag?.eventId ? Number(b.eventTypeId) === Number(ag.eventId) : true
            ) ?? [];

          calTotal += filtered.length;
        } catch (e) {
          console.error("Cal.com booking count error:", e);
        }
      }
      setCalBookingCount(calTotal);

      // ---- DB appointments total (all agents for this user)
      let dbTotal = 0;
      try {
        const res = await getAppointments(userId, null);
        dbTotal = Array.isArray(res?.data) ? res.data.length : 0;
      } catch (e) {
        console.error("DB appointments count error:", e);
      }
      setDbBookingCount(dbTotal);

      // ---- Combined
      setBookingCount(calTotal + dbTotal);
    };

    fetchCounts();
  }, [localAgents, userId]);

  const handleCardClick = (agent) => {
    setHasFetched(false);
    localStorage.setItem("selectedAgentAvatar", agent?.avatar);
    sessionStorage.setItem("SelectAgentId", agent?.agent_id);
    sessionStorage.setItem("SelectAgentBusinessId", agent?.businessId);
    navigate("/agent-detail", {
      state: { agentId: agent?.agent_id, bussinesId: agent?.businessId },
    });
  };
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
      `${process.env.REACT_APP_API_BASE_URL}/agent/calapikeys/${userId}`,

      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch Cal API keys");
    const data = await response.json();
    return data.agents;
  };
  // Fetch dashboard + merge Cal API keys
  const fetchAndMergeCalApiKeys = async () => {
    if (!userId) return;
    try {
      const res = await fetchDashboardDetails(userId, token);
      setUserCalApiKey(res?.calApiKey);
      sessionStorage.setItem("userCalApiKey", res?.calApiKey);
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

      setDashboardData(agentsWithCalKeys, res.total_call || 0, res.total_chat || 0);
      setHasFetched(true);
      // localStorage.setItem("userId", userId);
      // localStorage.setItem("agents", JSON.stringify(agentsWithCalKeys));
      setLocalAgents(agentsWithCalKeys);
    } catch (error) {
      console.error("Error fetching dashboard data or Cal API keys:", error);
    }
  };
  const [showInActive, setShowInActive] = useState(false)
  const handleInactivePopUp = () => {
    setShowInActive(true)
  }
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
      setHasFetched(false);
      setShowCalKeyInfo(true);
      setShowEventInputs(true);
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

  //getTimeZone
  const fetchTimeZone = async (agent) => {
    try {
      const timeZone = await getTimezoneFromState(agent?.business?.state);
      setTimeZone(timeZone);
      // Proceed with using timeZone
    } catch (err) {
      console.error("Error fetching timezone:", err);
    }
  };
  // Create Cal event
  const createCalEvent = async () => {
    const agent = agentDetailsForCal;
    fetchTimeZone(agent);
    await handleApiKeySubmit();
    try {
      setcalloading(true);
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
      if (!eventTypeId) {
        throw new Error("Event ID not received from Cal.com");
      }
      try {
        await updateAgentEventId(agent.agent_id, eventTypeId);
      } catch (err) {
        console.error("Failed to update agent with event ID:", err);
      }
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
            name: "check_availability_cal",
            cal_api_key: userCalApiKey.trim(),
            event_type_id: eventTypeId,
            description:
              "Check the available appointment slots in the calendar and return times strictly in the user's timezone. Use this timezone to suggest and book appointments.",
            timezone: timeZone?.timezoneId,
          },
        ],
        states: [
          {
            name: "information_collection",
            state_prompt: `
        Greet the user with the begin_message and assist with their query.

  
        If the user sounds dissatisfied (angry, frustrated, upset) or uses negative words (like "bad service", "unhappy", "terrible","waste of time"),
        ask them: "I'm sorry to hear that. Could you please tell me about your concern?"
        Analyze their response. 
        
        If the concern contains **spam, irrelevant or abusive content**
        (e.g., random questions, profanity, jokes), say:
        "I’m here to assist with service-related concerns. Could you please share your issue regarding our service?"
        and stay in this state.

        If the concern is **service-related** or **business** (e.g., staff, delay, poor support),
        transition to dissatisfaction_confirmation.

        If the user asks for an appointment (e.g., "appointment", "book", "schedule"),
        transition to appointment_booking.

        after extracting user details using the extract_user_info tool,ask the user if they have any other quaries or want to get other information regarding the business.

        If the user asks for address or email, transition to send_email.

        If the user is silent or unclear, say: "Sorry, I didn’t catch that. Could you please repeat?"
    `,
            edges: [
              {
                destination_state_name: "appointment_booking",
                description: "User wants to book an appointment.",
              },
              {
                destination_state_name: "dissatisfaction_confirmation",
                description: "User sounds angry or expresses dissatisfaction.",
              },
            ],
          },
          {
            name: "dissatisfaction_confirmation",
            state_prompt: `
        Say: "I'm sorry you're not satisfied. Would you like me to connect you to a team member? Please say yes or no."
        Wait for their response.

        If the user says yes, transition to call_transfer.
        If the user says no, transition to end_call_state.
        If the response is unclear, repeat the question once.
      `,
            edges: [
              {
                destination_state_name: "call_transfer",
                description: "User agreed to speak to team member.",
              },
              {
                destination_state_name: "end_call_state",
                description: "User declined to speak to team member.",
              },
            ],
            tools: [],
          },
          {
            name: "call_transfer",
            state_prompt: `Connecting you to a team member now. Please hold.`,
            tools: [
              {
                type: "transfer_call",
                name: "transfer_to_team",
                description: "Transfer the call to the team member.",
                transfer_destination: {
                  type: "predefined",
                  number: "{{business_Phone}}",
                },
                transfer_option: {
                  type: "cold_transfer",
                  public_handoff_option: {
                    message: "Please hold while I transfer your call.",
                  },
                },
                speak_during_execution: true,
                speak_after_execution: true,
                failure_message:
                  "Sorry, I couldn't transfer your call. Please contact us at {{business_email}} or call {{business_Phone}} directly.",
              },
            ],
            edges: [],
          },
          {
            name: "appointment_booking",
            state_prompt: `First, call the check_availability tool to verify if the calendar is connected.
               - If calendar is connected and slots are returned:
                - Ask the user for preferred date and time.
                - Ask what service they’re interested in.
                - Once you have both, confirm the details.
                - Then call book_appointment_cal to schedule.
            
                If booking fails:
                - Say: "Our scheduling system is busy right now. I’ve saved your details, and a team member will call you within 24 hours to confirm your appointment."
            
                - Then, ask: "Do you have any other queries?"
            
                - If yes, transition to information_collection.
                - If no, transition to end_call_state.
            
            - If check_availability fails or no slots are returned:
                - Say: "Our booking system is currently unavailable for direct scheduling. I’ll collect your details and a team member will reach out within 24 hours to confirm your appointment."
                - Collect: name, phone number, email, and purpose.
                - Then say: "Thanks! We’ll get back to you shortly."
                - Then ask: "Do you have any other queries?"
                - If yes, transition to information_collection.
                - If no, transition to end_call_state.
            `,
            tools: [
              {
                type: "check_availability_cal",
                name: "check_availability",
                cal_api_key: userCalApiKey.trim(),
                event_type_id: eventTypeId,
                description:
                  "Check if calendar is connected and fetch available time slots.",
                timezone: timeZone?.timezoneId,
              },
            ],
            edges: [
              {
                destination_state_name: "information_collection",
                description:
                  "User has further queries or provides new information after booking.",
              },
            ],
          },
          {
            name: "end_call_state",
            state_prompt: `Politely end the call by saying: "Thank you for calling. Have a great day!"`,
            tools: [
              {
                type: "end_call",
                name: "end_call1",
                description: "End the call with the user.",
              },
            ],
            edges: [],
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

      if (!retellResponse.ok) {
        const retellError = await retellResponse.json();
        console.error("Error updating  LLM:", retellError);
      } else {
        // console.log("Updated successfully!");
      }

      // Success
      setPopupType("success");
      setPopupMessage("Your Cal event has been created successfully!");
      setHasFetched(false);
      setShowCalKeyInfo(false);
      setEventName("");
      setEventSlug("");
      setEventLength("");

      setTimeout(() => {
        closeModal();
      }, 1000);
    } catch (error) {
      setEventCreateStatus("error");

      setEventCreateMessage(`Unauthorized! Invalid API Key.`);
      console.error("Error in createCalEvent:", error);
    } finally {
      setcalloading(false);
      setIsConfirming(false);
    }
  };
  const closeModal = () => {
    setIsCalModalOpen(false);
    setApiKey("");
    setSelectedAgent(null);
    setShowEventInputs(false);
    setEventCreateStatus(null);
    setEventCreateMessage("");
    setIsApiKeySubmitted(false);
  };

  const toggleDropdown = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTourActiveRef.current) return;
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleUpgrade = (id) => {
    setShow(true);
  };
  const handleCLose = () => {
    setClose(true);
    setShow(false);
  };

  const handleLogout = () => {
    setPopupType("confirm");
    setPopupMessage("Are you sure you want to logout?");
  };
  const handleLogoutConfirm = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("agents");
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("/signup");
    // window.location.href = "/signup";
  };
  // Retell Web Client initializationcxcxc
  useEffect(() => {
    const client = new RetellWebClient();
    client.on("call_started", () => setIsCallActive(true));
    client.on("call_ended", () => setIsCallActive(false));
    client.on("update", (update) => {
      //  Mark the update clearly as AGENT message
      const customUpdate = {
        ...update,
        source: "agent", // Add explicit source
      };

      // Dispatch custom event for CallTest
      window.dispatchEvent(
        new CustomEvent("retellUpdate", { detail: customUpdate })
      );
    });

    setRetellWebClient(client);
  }, []);
  const handleDelete = async (agent) => {
    const agent_id = agent?.agent_id;
    const mins_left = agent?.mins_left ? Math.floor(agent.mins_left / 60) : 0;
    try {
      setdeleteloading(true);
      const storedDashboard = JSON.parse(
        sessionStorage.getItem("dashboard-session-storage")
      );

      const agents = storedDashboard?.state?.agents || [];

      if (agents.length === 1) {
        setPopupType("failed");
        setPopupMessage(
          "Cannot delete. You must have at least two agents to delete one agent."
        );
        setShowDeleteConfirm(false);
        return;
      }

      // Try to refund API
      if (agent.agentPlan !== "free") {
        try {
          await refundAndCancelSubscriptionAgnetApi(agent_id, mins_left); // Replace with your actual API
        } catch (notifyError) {
          throw new Error(`Refund failed: ${notifyError.message}`);
        }
      }

      // Try to delete the agent
      try {
        await deleteAgent(agent_id);
      } catch (deleteError) {
        throw new Error(`Delete failed: ${deleteError.message}`);
      }

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
    } finally {
      setdeleteloading(false);
    }
  };

  const handleCancelSubscription = async (agent) => {
    const agent_id = agent?.agent_id;
    const mins_left = agent?.mins_left ? Math.floor(agent.mins_left / 60) : 0;
    try {
      setdeleteloading(true);
      try {
        let res = null
        if (assignNumberPaid === true && (agent.agentPlan === "free" || agent.agentPlan === "Pay-As-You-Go")) {
          res = await fetch(`${API_BASE}/cancel-subscription-schedule`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ subscriptionId: agent.subscriptionId }),
          });
          const requestData = {
            customerId: customer_id,
            agentId: agent_id,
            status: "inactive",
            isFree: (agent.agentPlan === "free") || (agent.agentPlan === "Pay-As-You-Go" ? true : false)

          };
          const response = await fetch(`${API_BASE}/pay-as-you-go-saveAgent`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestData),
          });
          if (response.ok) { console.log('Agent Payg Cancelled Succesfully') }

          else {
            console.log('Failed to send the request to save the agent.')
          }
          await checkAssignNumber()
        }
        else {
          res = await refundAndCancelSubscriptionAgnetApi(
            agent_id,
            mins_left
          );
          // console.log("cancel for all")
        }
        if (res) {
          setTimeout(() => {
            fetchAndMergeCalApiKeys();
          }, 1000);
        }
      } catch (notifyError) {
        throw new Error(`Refund failed: ${notifyError.message}`);
      }

      const updatedAgents = localAgents.filter((a) => a.agent_id !== agent_id);
      setLocalAgents(updatedAgents);
      setPopupMessage("Subscription Cancelled successfully!");
      setPopupType("success");
      fetchAndMergeCalApiKeys();
      checkAssignNumber()
      checkAgentPaygStatus(agentId)
    } catch (error) {
      setPopupMessage(`Failed to Cancel Subscription: ${error.message}`);
      setPopupType("failed");
    } finally {
      setdeleteloading(false);
    }
  };

  // Start call
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
      setPopupMessage("Microphone access is required to test.");
      setPopupType("failed");
      return;
    }

    if (
      isStartingRef.current ||
      isCallInProgress ||
      !retellWebClient ||
      !agentDetails
    ) {
      console.error("RetellWebClient or agent details not ready.");
      return;
    }
    isStartingRef.current = true;
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
      if (res.status == 403) {
        if (agentDetails?.agentPlan == "free") {
          setPopupMessage(
            "Your Agent Plan has been exhausted. To continue, please upgrade your plan"
          );
        } else {
          setPopupMessage(
            "Your Agent Plan has been exhausted. To continue, please enable Pay As You Go."
          );
        }
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

  // End call
  const isEndingRef = useRef(false);
  const handleEndCall = async () => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;

    if (retellWebClient) {
      try {
        const response = await retellWebClient.stopCall();
        const payload = { agentId: agentDetails.agent_id, callId: callId };
        if (isCallInProgress && callId) {
          // const DBresponse = await EndWebCallUpdateAgentMinutesLeft(payload);
          setIsCallInProgress(false);
        }
      } catch (err) {
        console.error("Error ending call:", err);
      } finally {
        setTimeout(() => {
          setHasFetched(false);
        }, 2000);

        setIsCallInProgress(false);
        isEndingRef.current = false;
      }
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
    sessionStorage.setItem("naviateFrom", "dashboard");
    sessionStorage.setItem("SelectAgentBusinessId", ag?.businessId);
    sessionStorage.setItem("SelectAgentId", ag?.agent_id);
    sessionStorage.setItem("plan", ag?.agentPlan);
    navigate("/edit-agent", {
      state: {
        agentId: ag?.agent_id,
        businessId: ag?.businessId,
      },
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
  const handleCalender = () => {
    navigate("/calendar");
  };
  const handleTotalCallClick = () => {
    localStorage.setItem("userId", userId);
    localStorage.setItem("totalCallView", true);
    localStorage.setItem("filterType", "all");
    sessionStorage.removeItem("agentId");
    navigate("/totalcall-list");
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
      } else {
        return name;
      }
    }
  }

  function formatBusinessName(name) {
    if (!name) return "";

    if (name.length > 15) {
      return name.substring(0, 15) + "...";
    }

    return name;
  }
  function formatAgentName(name) {
    if (!name) return "";

    if (name.length > 15) {
      return name.substring(0, 10) + "...";
    }

    return name;
  }
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.replace("/signup");
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isTourActiveRef.current) return;

      const openEl = dropdownRefs.current[openDropdown];
      if (openEl && !openEl.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openDropdown]);

  const handleInactiveAgentAlert = () => {
    setPopupType("failed");
    setPopupMessage(
      "Your agent is not active. Please activate your agent first."
    );
  };

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };
  const handleDeactivateAgent = async () => {
    try {
      setDeactivateLoading(true);
      const dashboardState = JSON.parse(
        sessionStorage.getItem("dashboard-session-storage")
      );
      // fdf
      const agentData = dashboardState?.state?.agents?.find(
        (ag) => ag.agent_id === agentToDeactivate.agent_id
      );

      const knowledgeBaseId = agentData?.knowledgeBaseId;
      const businessId = agentData?.businessId;

      const isCurrentlyDeactivated = agentToDeactivate.isDeactivated === 1;
      if (!isCurrentlyDeactivated && knowledgeBaseId) {
        await fetch(
          `https://api.retellai.com/delete-knowledge-base/${knowledgeBaseId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
              "Content-Type": "application/json",
            },
          }
        );
        // Subscruption Pause Api
        if (agentData.agentPlan !== "free") {
          try {
            const pauseRes = await fetch(
              `${process.env.REACT_APP_API_BASE_URL}/subscription-pause`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  subscriptionId: agentToDeactivate.subscriptionId,
                }),
              }
            );

            if (!pauseRes.ok) {
              const pauseErr = await pauseRes.json();
              console.error("Subscription pause failed:", pauseErr);
              throw new Error("Failed to pause subscription");
            }
          } catch (pauseError) {
            console.error("Error pausing subscription:", pauseError);
          }
        }
      }
      if (isCurrentlyDeactivated && businessId) {
        const businessDetails = await getBusinessDetailsByBusinessId(
          businessId
        );

        // const shortName = (businessDetails?.businessName || "Business")
        //   .trim()
        //   .toLowerCase()
        //   .replace(/\s+/g, "_")
        //   .slice(0, 20);
        const packageMap = {
          Free: 1,
          Starter: 2,
          Scaler: 3,
          Growth: 4,
          Corporate: 5,
          Enterprise: 6,
        };
        const packageValue = packageMap[packageName] || 1;

        // const knowledgeBaseName = `${shortName}_kb_${Date.now()}`;
        const knowledgeBaseName = await getKnowledgeBaseName(
          businessDetails,
          userId,
          packageValue,
          agentData?.agentCode
        );
        const mergedUrls = [];
        if (businessDetails?.webUrl?.trim()) {
          mergedUrls.push(businessDetails?.webUrl?.trim()); // add businessUrl
        }

        if (businessDetails?.googleUrl) {
          mergedUrls.push(businessDetails?.googleUrl); // add googleListing
        }
        // const mergedUrls = [businessDetails?.webUrl?.trim()].filter(Boolean);
        // const businessData = JSON.parse(businessDetails.knowledge_base_texts);
        const businessData = businessDetails.knowledge_base_texts;
        const knowledgeBaseText = {
          title: businessDetails?.businessType || "Business Info",
          text: `
                Business Name: ${businessData?.name}
                Address: ${businessData?.address}
                Phone: ${businessData?.phone}
                Website: ${businessData?.website}
                Rating: ${businessData?.rating} (${businessData?.totalRatings} reviews)
                Business Status: ${businessData?.businessStatus}
                Categories: ${businessData?.categories}
                Opening Hours: ${businessData?.hours}
                `.trim(),
        };

        // Step 1: Create Knowledge Base
        const formData = new FormData();
        formData.append("knowledge_base_name", knowledgeBaseName?.slice(0, 39));
        if (mergedUrls.length > 0) {
          formData.append("knowledge_base_urls", JSON.stringify(mergedUrls));
        }
        // formData.append("knowledge_base_urls", JSON.stringify(mergedUrls));
        formData.append("enable_auto_refresh", "true");
        formData.append(
          "knowledge_base_texts",
          JSON.stringify([knowledgeBaseText])
        );

        const createRes = await fetch(
          `https://api.retellai.com/create-knowledge-base`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
            },
            body: formData,
          }
        );

        if (!createRes.ok) {
          const errData = await createRes.json();
          console.error("Knowledge base creation failed:", errData);
          throw new Error("Failed to create knowledge base during activation");
        }

        const createdKB = await createRes.json();
        const knowledgeBaseId = createdKB.knowledge_base_id;
        sessionStorage.setItem("knowledgeBaseId", knowledgeBaseId);

        // Step 2: Update LLM for the agent
        const llmId =
          agentToDeactivate?.llmId ||
          localStorage.getItem("llmId") ||
          sessionStorage.getItem("llmId");

        if (llmId && knowledgeBaseId) {
          const llmPayload = {
            knowledge_base_ids: [knowledgeBaseId],
          };

          try {
            const updateLLMRes = await fetch(
              `https://api.retellai.com/update-retell-llm/${llmId}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
                },
                body: JSON.stringify(llmPayload),
              }
            );

            if (!updateLLMRes.ok) {
              const err = await updateLLMRes.json();
              console.error("Failed to update LLM:", err);
              throw new Error("LLM update failed");
            }
          } catch (error) {
            console.error("Error updating LLM:", error);
          }
          // Resume subscription
          if (agentData.agentPlan !== "free") {
            try {
              const resumeRes = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/subscription-resume`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    subscriptionId: agentToDeactivate.subscriptionId,
                  }),
                }
              );

              if (!resumeRes.ok) {
                const resumeErr = await resumeRes.json();
                console.error("Subscription resume failed:", resumeErr);
                throw new Error("Failed to resume subscription");
              } else {
                console.log("Subscription resumed successfully");
              }
            } catch (resumeError) {
              console.error("Error resuming subscription:", resumeError);
            }
          }
        } else {
          console.warn(
            "LLM ID or Knowledge Base ID missing. LLM update skipped."
          );
        }

        // ✅ Step 3: Update Agent's knowledgeBaseId in DB
        if (agentToDeactivate?.agent_id && knowledgeBaseId) {
          try {
            await updateAgentKnowledgeBaseId(
              agentToDeactivate.agent_id,
              knowledgeBaseId
            );
          } catch (err) {
            console.error(" Failed to update agent's KB ID:", err);
          }
        }
      }

      await toggleAgentActivation(
        agentToDeactivate.agent_id,
        !isCurrentlyDeactivated
      );

      setPopupType("success");
      setPopupMessage(
        isCurrentlyDeactivated
          ? "Agent activated successfully."
          : "Agent deactivated successfully."
      );
      setShowDeactivateConfirm(false);
      setHasFetched(false);
    } catch (error) {
      console.error("Activation/Deactivation Error:", error);
      setPopupType("failed");
      setPopupMessage("Failed to update agent status.");
      setShowDeactivateConfirm(false);
    } finally {
      setDeactivateLoading(false);
    }
  };


  const handlePaymentAssignNumber = async (agentId) => {
    try {
      setDisableLoading(true)
      const baseUrl = window.location.origin;
      let res = await axios.post(`${API_BASE_URL}/pay-as-you-go-checkout`, {
        agentId: agentId,
        customerId: decodeTokenData?.customerId,
        userId: decodeTokenData?.id,
        url: `${baseUrl}/dashboard?AssignNumber=true`,
        cancelUrl: `${baseUrl}/dashboard?AssignNumber=false`,
        isAssignNumber: true
      })
      if (res?.data?.checkoutUrl) {
        console.log("Redirecting to:", res.data.checkoutUrl);
        window.location.href = res.data.checkoutUrl; // 👈 redirect karega
      } else {
        console.error("Checkout URL not found in response:", res.data);
      }
    } catch (error) {
      console.log({ error });


    }
    finally {
      setDisableLoading(false)
    }



  }


  // const handleUpgradeClick = (agent) => {
  //   // console.log("agent", agent)
  //   setagentId(agent?.agent_id);
  //   setsubscriptionId(agent?.subscriptionId);
  //   sessionStorage.setItem("updateBtn", "update")
  //   sessionStorage.setItem("selectedPlan", agent?.agentPlan)

  //   navigate("/plan", {

  //     state: {
  //       agentID: agent?.agent_id,
  //       locationPath: locationPath,
  //       subscriptionID: agent?.subscriptionId,
  //       planName: agent?.agentPlan,
  //       interval: agent?.subscription?.interval || null,
  //       customerId: agent?.subscription?.customer_id || null

  //     },
  //   });
  // };

  const handleUpgradeClick = (agent) => {
    // console.log("agent", agent)
    setPendingUpgradeAgent(agent);
    if (agent?.agentPlan == "free") {
      if (assignNumberPaid === true) {
        // setShowUpgradeConfirmModal(true);
      }
      setShowUpgradeConfirmModal(false);
      //  setPendingUpgradeAgent(agent);
      handleUpgradePaygConfirmed();
      return;
    }
    setShowUpgradeConfirmModal(true); // Show modal
  };

  const handleUpgradePaygConfirmed = async () => {
    setUpgradeLoading(true);
    try {
      // console.log({ pendingUpgradeAgent })
      if (!pendingUpgradeAgent && !currentPlan1 === "free") return;
      const agent = pendingUpgradeAgent;

      // Set required session/local storage
      setagentId(agent?.agent_id);
      setsubscriptionId(agent?.subscriptionId);
      sessionStorage.setItem("updateBtn", "update");
      sessionStorage.setItem("selectedPlan", agent?.agentPlan);

      // Navigate to /plan
      navigate("/plan", {
        state: {
          agentID: agent?.agent_id,
          locationPath: locationPath,
          subscriptionID: agent?.subscriptionId,
          planName: agent?.agentPlan,
          interval: agent?.subscription?.interval || null,
          customerId: agent?.subscription?.customer_id || null,
        },
      });

      setShowUpgradeConfirmModal(false); // Close the modal
    } catch (err) {
      console.error("Error during upgrade navigation:", err);
    } finally {
      setUpgradeLoading(false);
    }
  };
  const locationPath = location.pathname;

  const getUserReferralCode = async () => {
    try {
      const res = await getUserReferralCodeForDashboard(userId);
      // console.log(res.referralCode)
      setShowDashboardReferral(
        `${window.location.origin}?referral=${encodeURIComponent(
          res?.referralCode
        )}` || ""
      );
    } catch (error) {
      console.log("error occured while fetching user referal code", error);
    }
  };

  const handleCopy = async (referralLink) => {
    navigator.clipboard
      .writeText(referralLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1000); // hide after 2 seconds
      })
      .catch((err) => {
        console.error("Copy failed:", err);
      });
  };

  const shareReferralLink = async (referralLink) => {
    if (!referralLink) {
      console.error("No referral code provided");
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          url: referralLink,
        });
        // console.log("Share URL:", referralLink); // Debug
      } catch (error) {
        console.error("Error sharing:", error);
        await navigator.clipboard.writeText(referralLink);
      }
    } else {
      try {
        await navigator.clipboard.writeText(referralLink);
      } catch (err) {
        console.error("Copy failed:", err);
      }
    }
  };

  const showConfirmFloatingClose = () => {
    setPopupType2("confirm");
    setPopupMessage2(
      "Are you sure you want to remove the floating icon? You can enable it again later from the profile section."
    );
  };
  const handleChangeStatus = async () => {
    try {
      const res = await updateShowReferralFloatingStatus(
        userId,
        !showreferralfloating
      );
      // console.log(res)
      // setReferralCode(user?.referralCode)
      setShowreferralfloating(res?.data);
      localStorage.setItem("showreferralfloating", res?.data);
    } catch (error) {
      console.error(error);
    }
  };
  const handleConnectCal = (agent) => {
    navigate("/connect-calender");
    sessionStorage.setItem("agentDetails", JSON.stringify(agent));
  };
  const handleCalConnectWithConfirm = async () => {
    try {
      await createCalEvent(); // event creation logic
    } finally {
      setIsConfirming(false);
      setPopupMessage3(""); //  Close the popup after confirm logic completes
    }
  };

  const handleConnectCalApiAlready = (agent) => {
    setAgentDetailsForCal(agent);
    setPopupType3("confirm");
    setPopupMessage3(
      "Your Cal API key is already connected with Rexpt. We're now automatically syncing your Cal Events with this agent for seamless scheduling."
    );
  };
  const handleClosePopUp3 = async () => {
    setPopupMessage3("");
    // console.log(isConfirming, "isConfirming");
    if (isConfirming) {
      handleConnectCal(agentDetailsForCal);
    }
  };
  const checkRecentPageLocation = location.state?.currentLocation;
  useEffect(() => {
    if (checkRecentPageLocation === "/checkout") fetchAndMergeCalApiKeys();
  }, []);

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

  const customer_id = decodeTokenData?.customerId

  const [paygStatusLoading, setpaygStatusLoading] = useState(true)

  const [isPaygActive, setisPaygActive] = useState();


  // const [paygStatusLoading, setpaygStatusLoading] = useState(true);

  const checkAgentPaygStatus = async (agentId) => {
    try {
      const response = await fetch(`${API_BASE}/pay-as-you-go-status-check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ agentId, customerId: customer_id }),
      });

      const data = await response.json();

      setpaygStatusLoading(true);
      if (data.success) {
        // If the agent has an active Payg subscription
        setisPaygActive(true);
        setpaygStatusLoading(false);
        localStorage.setItem("isPayg", "true");
        // setactiveCount(data?.activeCount || null)
        // setPaygSubscriptionId(data?.subscriptionId)
        // setPopupMessage("Agent's Pay-as-you-go feature is active.");
        // setPopupType("success");
      } else {
        // If the agent does not have an active Payg subscription
        // setactiveCount(data?.activeCount || null)
        // setPaygSubscriptionId(data?.subscriptionId)
        setisPaygActive(false);
        setpaygStatusLoading(false);
        // localStorage.setItem("isPayg", "false");
        // setPopupMessage(data.message || "No active PaygSubscription found for this agent.");
        // setPopupType("failed");
      }
    } catch (error) {
      console.error("Error checking Payg status:", error);
      // setPopupMessage("Failed to check agent's Pay-as-you-go status.");
      // setPopupType("failed");


    }
    finally {
      setpaygStatusLoading(false)

    }
  };

  useEffect(() => {
    if (agentId) {
      checkAgentPaygStatus(agentId);
    }
  }, [agentId]);

  const handleTogglePayG = async () => {

    setpaygStatusLoading(true)
    // console.log("agentToPaygActivate", agentToPaygActivate)

    try {
      // console.log({ customer_id })
      const requestData = {
        customerId: customer_id,
        agentId: agentId,
        status: isPaygActive ? "inactive" : "active",
        isFree: (agentToPaygActivate.agentPlan === "free") || (agentToPaygActivate.agentPlan === "Pay-As-You-Go" ? true : false),
        isByAdmin: agentToPaygActivate?.subscriptionId === "byAdmin" ? true : false
      };
      // Call the API to save the agent's payg status
      const response = await fetch(`${API_BASE}/pay-as-you-go-saveAgent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        // setPaygEnabled(!isCurrentlyEnabled)
        const responseData = await response.json();
        // console.log('Agent saved successfully:', responseData);
        if (responseData.status === "active") {
          setisPaygActive(true);
          setpaygStatusLoading(false);
          setPopupMessage("Agent's Pay-as-you-go feature activated.");
          setPopupType("success"); // Pop-up for activated
          setHasFetched(false);
        } else {
          setisPaygActive(false);
          setpaygStatusLoading(false);
          setPopupMessage("Agent's Pay-as-you-go feature has been disabled.");
          setPopupType("failed"); // Pop-up for disabled
          setHasFetched(false);
        }
      } else if (response.ok === false) {
        const responseData = await response.json();
        // console.log("dasdd", responseData)
        setredirectButton(true);
        setPopupMessage(responseData?.error);
        setpaygStatusLoading(false)
        setPopupType("failed"); // Pop-up for disabled
      } else {
        console.error("Failed to send the request to save the agent.");
      }
    } catch (error) {
      console.error("Error during upgrade:", error);
    } finally {
      // setredirectButton(false);
    }
  };

  const handleAssignNumberBuy = async () => {
    const agentAssignNumberdetailsData = agentDetails
    setisAssignApi(true)
    // console.log("agentAssignNumberdetailsData", agentAssignNumberdetailsData)
    const currentUrl = window.location.origin
    const requestData = {
      customerId: customer_id,
      // priceId: "price_1RximE4T6s9Z2zBzdfpTUy20", // EXTRA MINUTES 5 dollar
      isAssignNumber: true,
      promotionCode: "",
      userId: userId,
      url: `${currentUrl}/dashboard?AssignNumber=true`,
      cancelUrl: `${currentUrl}/dashboard?AssignNumber=false`,
      agentId: agentDetails?.agent_id ? agentDetails?.agent_id : null
    };
    try {
      const response = await fetch(`${API_BASE}/payg-subscription-handle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.checkoutUrl) {
          window.location.href = responseData.checkoutUrl;
        }

        console.log('API response:', responseData); // You can handle the API response heree
      } else {
        console.error('Failed to send the request');
      }

    } catch (error) {
      console.error('Error While doing payment for Assign Number:', error);
    }
  }


  const checkAssignNumber = async () => {
    try {
      // setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/assign-number-check`, { customer_id });

      if (res.data.success) {
        setAssignNumberPaid(true);
      } else {
        setAssignNumberPaid(false);
      }
    } catch (error) {
      console.error("Error checking assign number:", error);
      setAssignNumberPaid(false);
    }
  };

  // Check Assign Number payment
  useEffect(() => {
    checkAssignNumber()
  }, [])

  const urlParams = new URLSearchParams(window.location.search);
  const isAssignNumber = urlParams.get('AssignNumber');
  useEffect(() => {
    if (isAssignNumber === "false") {
      setPopupType("failed");
      setPopupMessage(`Payment Cancelled for Assign Number`);
    }
    else if (isAssignNumber === "true") {
      setPopupType("success");
      setPopupMessage(`Payment Success for Assign Number, Now you can Assign Numbers to Your Free Agent`);
      setTimeout(() => {
        navigate("/assign-number", {
          state: { agent: agentDetails?.agent_id },
        })
      }, 2000);

      if (assignNumberNavigate === true) {
        navigate("/assign-number", {
          state: { agent: agentDetails?.agent_id },
        })
      }

    }
  }, [])

  const checkUserPayg = async () => {
    try {
      // setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/check-payg-enable`, { customer_id });

      if (res?.data?.success) {
        setcheckPaygStatus(res?.data?.paygStatus);
      } else {
        setcheckPaygStatus(false);
      }
    } catch (error) {
      console.error("Error checking payg status:", error);
      setcheckPaygStatus(false);
    }

  }
  useEffect(() => {

    checkUserPayg()
  }, [checkPaygStatus, paygEnabledPopup])

  // Payg Error
  useEffect(() => {
    // console.log("checkPaygStatus",checkPaygStatus)
    if (paygEnabledPopup === true && (checkPaygStatus === null || checkPaygStatus === 0)) {
      setredirectButton(true)
      setPopupMessage("Pay-As-You-Go is not enabled for your Account.");
      setpaygStatusLoading(false)
      setPopupType("failed"); // Pop-up for disabled
    }
  }, [checkPaygStatus, paygEnabledPopup])



  const handleAssignNumberValidtyCheck = async (agentId) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/check-assign-number-month`, { agentId });
      return res.data;
    } catch (error) {
      console.error("Error checking assign number:", error);
      return false;
    }
  };
  const currentPlan1 = pendingUpgradeAgent?.agentPlan ?? agentDetails?.agentPlan; // fallback


  return (
    <div>
      {activeSubs ? (
        <Popup
          type="failed"
          message="It looks like you were in the middle of the agent creation process. We are now taking you back to the agent creation steps so you can complete it based on the payment you have already made."
          onClose={() => {
            localStorage.setItem("paymentDone", true);
            navigate("/steps");
          }}
        />
      ) : null}


      {lockBgForTour && (
        <div
          className={styles.tourClickShield}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        />
      )}



      <div className={styles.forSticky}>
        <header className={styles.header}>
          <div
            id="tour-profile"
            className={styles.profileSection}
            ref={profileRef}
            onClick={handleEditProfile}
          >
            <div>
              <button className={styles.avatarBtn}>
                <img
                  src={
                    user?.profile ||
                    capturedImage ||
                    uploadedImage ||
                    "/svg/profile-icon.svg"
                  }
                  alt="Profile"
                  className={styles.profilePic}
                  onError={(e) => {
                    e.target.src = "/svg/profile-icon.svg";
                  }}
                />
              </button>
            </div>
            <div>
              <p className={styles.greeting}>Hello!</p>
              <h2 className={styles.name}>
                {formatName(user?.name) || "John Vick"}
              </h2>
            </div>
          </div>
          <div className={styles.notifiMain}>
            <div className={styles.notificationWrapper}>
              {!notificatioView ?
                <div
                  className={styles.notificationIcon}
                  onClick={() => setNotificationsView((prev) => !prev)} //  navigate("/notifications")
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
                :
                <div
                  className={styles.notificationIcon}
                  onClick={() => setNotificationsView((prev) => !prev)} //  navigate("/notifications")
                >
                  <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="50" height="50" rx="25" fill="#F9F9F9" />
                    <path d="M30.4346 18.4346C30.747 18.1222 31.253 18.1222 31.5654 18.4346C31.8778 18.747 31.8778 19.253 31.5654 19.5654L26.2725 24.8584C26.235 24.8959 26.2139 24.947 26.2139 25C26.2139 25.053 26.235 25.1041 26.2725 25.1416L31.5654 30.4346C31.8778 30.747 31.8778 31.253 31.5654 31.5654C31.253 31.8778 30.747 31.8778 30.4346 31.5654L25.1416 26.2725C25.1041 26.235 25.053 26.2139 25 26.2139C24.947 26.2139 24.8959 26.235 24.8584 26.2725L19.5654 31.5654C19.253 31.8778 18.747 31.8778 18.4346 31.5654C18.1222 31.253 18.1222 30.747 18.4346 30.4346L23.7275 25.1416C23.765 25.1041 23.7861 25.053 23.7861 25C23.7861 24.947 23.765 24.8959 23.7275 24.8584L18.4346 19.5654C18.1222 19.253 18.1222 18.747 18.4346 18.4346C18.747 18.1222 19.253 18.1222 19.5654 18.4346L24.8584 23.7275C24.8959 23.765 24.947 23.7861 25 23.7861C25.053 23.7861 25.1041 23.765 25.1416 23.7275L30.4346 18.4346Z" fill="#222222" stroke="white" stroke-width="0.4" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
              }
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

        {/* Ankush Code Start */}
        {!notificatioView &&
          <section className={styles.agentCard}>
            <div
              id="tour-total-calls"
              className={styles.agentInfo}
              onClick={handleTotalCallClick}
            >
              <h2
                className={`${styles.agentHeading} ${isSmallFont ? styles.smallFont : ""
                  }`}
              >
                {totalCalls || 0}
              </h2>
              <img src="svg/total-call.svg" alt="total-call" />
            </div>
            <hr />

            <div
              id="tour-total-bookings"
              className={styles.agentInfo2}
              onClick={handleCalender}
            >
              {" "}
              <h2
                className={`${styles.agentHeading} ${isSmallFont ? styles.smallFont : ""
                  }`}
              >
                {bookingCount}
              </h2>
              <img src="svg/calender-booking.svg" alt="calender-booking" />
            </div>
          </section>
        }
        {/* Ankush code end */}
      </div>
      {!notificatioView ?
        (
          <div className={styles.main}>
            {show ? (
              <Modal isOpen={show} onClose={handleCLose}>
                <></>
                <h2 className={styles.apologyHead}>Comming Soon</h2>

                <p className={styles.apologyHeadText} apologyHeadText>
                  We apologise, But our paid plans are being tested to pass our
                  "Rigorous QA Process" For now, If your sign-up for a "Free
                  Account", We promise to send you Upgradation Options in your email
                  within next 2 weeks.
                </p>

                <div className={styles.zz}></div>
              </Modal>
            ) : null}

            {localAgents?.map((agent) => {
              const planStyles = ["MiniPlan", "ProPlan", "Maxplan"];
              // console.log("agentagentagent", agent)
              const randomPlan = `${agent?.subscription?.plan_name}Plan`;
              // console.log("randomPlan",randomPlan)

              let assignedNumbers = [];
              if (agent.voip_numbers) {
                try {
                  assignedNumbers = JSON.parse(agent?.voip_numbers);
                } catch {
                  assignedNumbers = [];
                }
              }
              const isTourOpen =
                openDropdown === agent.agent_id ||
                forceTourOpenAgentId === agent.agent_id;

              return (
                <div
                  key={agent.agent_id}
                  className={`${styles.LangStyle} ${styles[randomPlan]}`}
                  onClick={() => handleCardClick(agent)}
                >
                  <div className={styles?.PlanPriceMain}>
                    <h3 className={styles?.PlanPrice}>
                  
                      {agent?.subscription?.plan_name
  ? agent?.subscription?.plan_name === "Add-on Services"
    ? "Pay-As-You-Go Plan"
    : agent?.subscription?.plan_name === "Custom Plan"
      ? "Custom Plan"
      : `${agent?.subscription?.plan_name} Plan`
  : `${agent?.agentPlan || "Free"} Plan`}
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
                          {formatAgentName(agent?.agentName)}
                          <span
                            className={
                              agent.isDeactivated === 1
                                ? styles.InactiveText
                                : styles.activeText
                            }
                          >
                            {agent.isDeactivated === 1 ? "Inactive" : "Active"}
                          </span>
                        </h3>

                        <p className={styles.agentAccent}>
                          {agent?.agentLanguage} •{agent?.agentAccent}
                        </p>
                      </div>
                    </div>
                    <div className={styles.AgentTwoIcon}>
                      <div className={styles.TestAgentIcon} onMouseDown={(e) => {
                        e.stopPropagation();
                        if (agent?.isDeactivated === 1) {
                          handleInactiveAgentAlert();
                        } else {
                          handleOpenCallModal(agent);
                        }
                      }}>
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
                      <div
                        className={styles.FilterIcon}
                        id={`tour-menu-trigger-${agent.agent_id}`}
                        onClick={(e) => {
                          toggleDropdown(e, agent.agent_id);
                          setagentId(agent.agent_id);
                          setPendingUpgradeAgent(agent);
                        }}
                        ref={(el) => {
                          dropdownRefs.current[agent.agent_id] = el;
                        }}
                      >

                        <svg
                          width="30"
                          height="30"
                          viewBox="0 0 30 30"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="30" height="30" rx="5" fill="white" />
                          <circle cx="8" cy="15" r="2" fill="#24252C" />
                          <circle cx="15" cy="15" r="2" fill="#24252C" />
                          <circle cx="22" cy="15" r="2" fill="#24252C" />
                        </svg>
                        <div
                          className={styles.OptionsDropdown}
                          style={{
                            display: isTourOpen ? "block" : "none",
                            visibility: isTourOpen ? "visible" : "hidden",
                            opacity: isTourOpen ? 1 : 0,
                            pointerEvents: isTourOpen ? "auto" : "none",
                            minWidth: 170,
                            zIndex: 99999,
                            ...(tourElevateDropdown && tourDropdownPos
                              ? {
                                position: "fixed",
                                top: tourDropdownPos.top,
                                left: tourDropdownPos.left,
                              }
                              : {}),
                          }}
                          id={`tour-menu-dropdown-${agent.agent_id}`}
                        >
                          <div
                            className={styles.OptionItem}
                            id={`tour-menu-test-${agent.agent_id}`}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              if (agent?.isDeactivated === 1) {
                                handleInactiveAgentAlert();
                              } else {
                                handleOpenCallModal(agent);
                              }
                            }}
                          >
                            Test Agent
                          </div>
                          <div
                            id={`tour-menu-integrate-${agent.agent_id}`}
                            className={styles.OptionItem}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              if (agent?.isDeactivated === 1) {
                                handleInactiveAgentAlert();
                              } else {
                                navigate("/integrate-agent", {
                                  state: {
                                    agentDetails: agent,
                                  },
                                });
                              }
                            }}
                          >
                            Integrate
                          </div>
                          <div
                            className={styles.OptionItem}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              if (agent?.isDeactivated === 1) {
                                handleInactiveAgentAlert();
                              } else {
                                handleEditAgent(agent);
                              }
                            }}
                          >
                            Edit Agent
                          </div>
                          <div
                            className={styles.OptionItem}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleUpgradeClick(agent);
                              setPendingUpgradeAgent(agent);
                            }}
                          >
                            Upgrade
                          </div>
                          {(() => {
                            const subscriptionStart =
                              agent?.subscription?.current_period_start;
                            const planName = agent?.agentPlan?.toLowerCase();
                            // console.log("agent",agent)
                            const isFreePlan = planName === "free";
                            const subscriptionAgeInDays = subscriptionStart
                              ? dayjs().diff(dayjs(subscriptionStart), "day")
                              : Infinity;

                            const isEligibleToDelete =
                              isFreePlan || subscriptionAgeInDays <= 2;

                            if (isEligibleToDelete) {
                              return (
                                <div key={agent.agent_id}>
                                  <div
                                    className={styles.OptionItem}
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      setAgentToDelete(agent);
                                      setShowDeleteConfirm(true);
                                    }}
                                  >
                                    Delete Agent
                                  </div>
                                </div>
                              );
                            }

                            return null;
                          })()}

                          <div
                            className={styles.OptionItem}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setAgentToDeactivate(agent);
                              setShowDeactivateConfirm(true);
                            }}
                          >
                            {agent.isDeactivated === 1
                              ? "Activate Agent"
                              : "Deactivate Agent"}
                          </div>

                          {(
                            (
                              (agent?.subscription &&
                                agent?.subscription?.plan_name?.toLowerCase() !== "free") ||
                              (assignNumberPaid && agent?.isDeactivated === 0)
                            ) &&
                            agent?.subscription?.subscription_status !== 9
                          ) && (
                              <>
                                <div>
                                  <div
                                    className={styles.OptionItem}
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      setAgentToCancel(agent);
                                      setShowCancelConfirm(true);
                                    }}
                                  >
                                    Cancel Subscription
                                  </div>
                                </div>

                              </>
                            )}
                          {(

                            (agent?.subscription &&
                              agent?.subscription?.plan_name?.toLowerCase() !== "free") ||
                            (assignNumberPaid && agent?.isDeactivated === 0) ||
                            agent?.agentPlan === "Pay-As-You-Go" ||
                            agent?.agentPlan === "free"



                          ) && (

                              <>
                                <div>
                                  <div
                                    onMouseDown={(e) => {

                                      // handleTogglePayG()
                                      // console.log("agent", agent)
                                      setshowPaygConfirm(true)
                                      setagentToPaygActivate(agent)
                                      setpaygEnabledPopup(checkPaygStatus === null || checkPaygStatus === 0 ? true : false)


                                    }}

                                    className={styles.OptionItem}
                                  >
                                    {paygStatusLoading
                                      ? "Loading.."
                                      : isPaygActive === true
                                        ? "Deactivate Pay as you go"
                                        : "Active Pay as you go"}
                                  </div>
                                </div>

                              </>
                            )}

                        </div>

                      </div>
                    </div>
                  </div>
                  <hr className={styles.agentLine} />

                  <div className={styles.LangPara}>
                    <p className={styles.agentPara}>
                      For:{" "}
                      <strong>
                        {formatBusinessName(
                          agent?.business?.businessName ||
                          agent?.business?.knowledge_base_texts?.name ||
                          agent?.business?.googleBusinessName
                        )}
                      </strong>
                    </p>

                    <div className={styles.VIA}>
                      {agent.calApiKey ? (
                        <img
                          id="tour-cal-com"
                          src="svg/cal-svg.svg"
                          alt="cal-svg"
                          style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (agent?.isDeactivated === 1) {
                              handleInactiveAgentAlert();
                            } else {
                              handleConnectCal(agent);
                            }
                          }}
                        />
                      ) : (
                        <img
                          id="tour-cal-com"
                          src="svg/call-cross.svg"
                          alt="No API Key"
                          style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (agent?.isDeactivated === 1) {
                              handleInactiveAgentAlert();
                            } else {
                              if (
                                userCalApiKey &&
                                userCalApiKey !== "null" &&
                                userCalApiKey !== "" &&
                                userCalApiKey !== "undefined"
                              ) {
                                handleConnectCalApiAlready(agent);
                              } else {
                                handleConnectCal(agent);
                              }
                            }
                          }}
                          title="Cal API Key not set"
                        />
                      )}
                    </div>
                  </div>


                  <div className={styles.LangButton}>
                    {assignedNumbers.length > 0 ? (
                      <div id="tour-assign-number" className={styles.AssignNumText}>
                        Phone Number
                        <p className={styles.NumberCaller}>
                          {assignedNumbers.length > 1 ? "s" : ""}{" "}
                          {assignedNumbers.map(formatE164USNumber).join(", ")}
                        </p>
                        {agent?.agentPlan === "free" && !agent?.subscriptionId && agent?.voip_numbers_created ? (
                          (() => {
                            const created = new Date(agent.voip_numbers_created);
                            const today = new Date();

                            // normalize to date-only
                            const createdDateOnly = new Date(created.getFullYear(), created.getMonth(), created.getDate());
                            const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

                            // expiry = created + 15 days
                            const expiry = new Date(createdDateOnly);
                            expiry.setDate(expiry.getDate() + 14);

                            const msPerDay = 1000 * 60 * 60 * 24;
                            const daysRemaining = Math.ceil((expiry - todayDateOnly) / msPerDay);

                            return (
                              <>
                                <div className={styles.subscribeDiv}>
                                  {daysRemaining > -30 && (
                                    <>
                                      {/* <button className={styles.subCribeBtn}
                                    onClick={(e) => {
                                      e.stopPropagation(); // parent div click prevent
                                      handlePaymentAssignNumber(agent.agent_id);
                                    }}
                                  >
                                    SUBSCRIBE
                                  </button> */}
                                      <ConfirmModal
                                        show={showInActive}
                                        onClose={() => setShowInActive(false)}
                                        title="Free Trial Expired"
                                        message="Your free trial for the assigned number has ended. To continue using this feature and keep your number active, you’ll need to subscribe to one of our available plans. Without a subscription, the assigned number will remain inactive, and related services may not work as expected."
                                        type="warning"
                                        confirmText={disableLoading ? "Loading..." : "Subscribe"}
                                        cancelText="Cancel"
                                        showCancel={true}
                                        isLoading={disableLoading}
                                        onConfirm={() => handlePaymentAssignNumber(agent.agent_id)}

                                      />
                                    </>
                                  )}
                                  {/* Days Remaining dikhao jab > 0 */}
                                  <span
                                    className={
                                      daysRemaining > 0 ? styles.daysRemainActive : styles.daysRemainInactive
                                    }
                                  >
                                    {daysRemaining > 0 ? (
                                      `${daysRemaining} days remaining`
                                    ) : (
                                      <div onClick={(e) => {
                                        e.stopPropagation();
                                        setShowUpgradeConfirmModal(true)
                                        setAgentDetails(agent)

                                      }}>
                                        {/* Inactive{" "} */}
                                        <svg width="24" height="24" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <g clip-path="url(#clip0_656_992)">
                                            <path className={styles.exclamMark} d="M25 0C11.1667 0 0 11.1667 0 25C0 38.8333 11.1667 50 25 50C38.8333 50 50 38.8333 50 25C50 11.1667 38.8333 0 25 0ZM24.7778 6C27 5.88889 28.8333 7.61111 28.9444 9.77778C28.9444 9.88889 28.9444 10.0556 28.9444 10.1667L28 29.2222C27.9444 30.8889 26.5 32.2222 24.7778 32.1111C23.2222 32.0556 21.9444 30.7778 21.8889 29.2222L20.9444 10.1667C20.8889 8 22.6111 6.11111 24.7778 6ZM27.9444 42.7778C27.1667 43.5556 26.1111 44 25 44C23.8889 44 22.8333 43.5556 22.0556 42.7778C21.2778 42 20.8333 40.9444 20.8333 39.8333C20.8333 38.7222 21.2778 37.6667 22.0556 36.8889C22.8333 36.1111 23.8889 35.6667 25 35.6667C26.1111 35.6667 27.1667 36.1111 27.9444 36.8889C28.7222 37.6667 29.1667 38.7222 29.1667 39.8333C29.1667 40.9444 28.7222 42 27.9444 42.7778Z" fill="#EB0000" />
                                          </g>
                                          <defs>
                                            <clipPath id="clip0_656_992">
                                              <rect width="50" height="50" fill="white" />
                                            </clipPath>
                                          </defs>
                                        </svg>
                                      </div>
                                    )}
                                  </span>


                                  {/* Subscribe button dikhao jab daysRemaining > -30 */}
                                </div>


                              </>
                            );
                          })()
                        ) : null}

                      </div>
                    ) : (
                      <div
                        className={styles.AssignNum}
                        id="tour-assign-number"
                        onClick={(e) => handleAssignNumberClick(agent, e)}
                        style={{ cursor: "pointer" }}
                      >
                        <img src="/svg/assign-number.svg" />
                      </div>
                    )}

                    <div className={styles.minLeft}>
                      <span className={styles.MinL}>{agent.agentPlan === "Pay-As-You-Go" && agent.mins_left === 0 ? "Mins Usage" : 'Min Left'}</span>{" "}
                      {agent.agentPlan === "Pay-As-You-Go" && agent.mins_left === 0 ? agent?.payg_mins : agent?.callSummary?.remaining?.minutes}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Cal API Modal */}
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
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      {calapiloading ? (
                        <button
                          className={`${styles.modalButton} ${styles.submit}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          Updating <Loader size={18} />
                        </button>
                      ) : (
                        <button
                          className={`${styles.modalButton} ${styles.submit}`}
                          onClick={handleApiKeySubmit}
                          disabled={!isValidCalApiKey(apiKey.trim())}
                        >
                          {apiKey && !isApiKeyEditable ? "Update" : "Submit"}
                        </button>
                      )}
                      {/* <button
                    className={`${styles.modalButton} ${styles.submit}`}
                    onClick={handleApiKeySubmit}
                    disabled={!isValidCalApiKey(apiKey.trim())}
                  >
                    {apiKey && !isApiKeyEditable ? "Update" : "Submit"}
                  </button> */}
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
                        {calloading ? (
                          <button
                            className={`${styles.modalButton} ${styles.submit}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            Add Event <Loader size={18} />
                          </button>
                        ) : (
                          <button
                            className={`${styles.modalButton} ${styles.submit}`}
                            onClick={createCalEvent}
                            disabled={
                              !isApiKeySubmitted ||
                              !eventName.trim() ||
                              !eventSlug.trim() ||
                              !eventLength.trim()
                            }
                          >
                            Add Event
                          </button>
                        )}
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
            {showDeleteConfirm &&
              agentToDelete &&
              (() => {
                const totalMins =
                  Number(agentToDelete?.subscription?.plan_mins) || 0;
                const minsLeft = agentToDelete?.mins_left || 0;
                const planMins = totalMins;

                const usedPercentage =
                  planMins > 0 ? ((planMins - minsLeft) / planMins) * 100 : 100;

                const currentPeriodStart =
                  agentToDelete?.subscription?.current_period_start;
                const currentPeriodEnd =
                  agentToDelete?.subscription?.current_period_end;

                const subscriptionAgeDays = currentPeriodStart
                  ? dayjs().diff(dayjs(currentPeriodStart), "day")
                  : Infinity;

                const isRefundEligible =
                  usedPercentage < 5 && subscriptionAgeDays <= 2;

                return (
                  <div
                    className={styles.modalBackdrop}
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    <div
                      className={styles.modalContainer}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h2>Are you sure?</h2>
                      <p>
                        Do you want to delete agent{" "}
                        <strong>{agentToDelete.agentName}</strong>?
                      </p>

                      {agentToDelete?.subscription && (
                        <p style={{ marginTop: "12px" }}>
                          {isRefundEligible ? (
                            <>
                              Since this agent's subscription is within 2 days and
                              less than 5% of minutes are used, a refund (minus 3%
                              Stripe fee) will be issued to the original payment
                              method within 5–7 business days.
                            </>
                          ) : (
                            <>
                              This subscription is either older than 2 days or more
                              than 5% of the minutes are used. No refund will be
                              provided per our policy.
                            </>
                          )}
                        </p>
                      )}

                      <div className={styles.modalButtons}>
                        <button
                          className={`${styles.modalButton} ${styles.cancel}`}
                          onClick={() => setShowDeleteConfirm(false)}
                        >
                          No
                        </button>
                        {deleteloading ? (
                          <button
                            className={`${styles.modalButton} ${styles.submit}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            Deleting <Loader size={18} />
                          </button>
                        ) : (
                          <button
                            className={`${styles.modalButton} ${styles.submit}`}
                            onClick={async () => {
                              try {
                                await handleDelete(agentToDelete);
                                setShowDeleteConfirm(false);
                                setAgentToDelete(null);
                              } catch (error) {
                                setPopupMessage(
                                  `Failed to delete agent: ${error.message}`
                                );
                                setPopupType("failed");
                                setShowDeleteConfirm(false);
                              }
                            }}
                          >
                            Yes
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

            {showCancelConfirm &&
              agentToCancel &&
              (() => {
                const totalMins = agentToCancel?.subscription?.totalMinutes || 0;
                const minsLeft = agentToCancel?.mins_left || 0;
                const plan_name1 = agentToCancel?.agentPlan || ""
                const plan_mins = totalMins;
                const usedPercentage = ((plan_mins - minsLeft) / plan_mins) * 100;
                const current_period_start =
                  agentToCancel?.subscription?.current_period_start;
                const current_period_end =
                  agentToCancel?.subscription?.current_period_end;
                const subscriptionAgeDays = dayjs().diff(
                  dayjs(current_period_start),
                  "day"
                );


                const isRefundEligible =
                  usedPercentage < 5 && subscriptionAgeDays <= 5;

                return (
                  <div
                    className={styles.modalBackdrop}
                    onClick={() => setShowCancelConfirm(false)}
                  >
                    <div
                      className={styles.modalContainer}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h2>Are you sure?</h2>
                      <p>
                        {(plan_name1 === "free" || plan_name1 === "Pay-As-You-Go") && assignNumberPaid ? (
                          <>
                            You’re on a <strong>Free Plan</strong> with an <strong>assigned number. </strong>
                            Cancelling this plan will remove your assigned number and you
                            won’t be able to use it again or otherwise you have to buy again.
                            <br />
                          </>
                        ) : isRefundEligible ? (
                          <>
                            Since you're canceling within 5 days of purchasing and
                            have used less than 5% of your minutes, you're eligible
                            for a refund! We'll process a refund of your
                            subscription amount, minus a 3% payment gateway fee,
                            back to your original payment method. You should see it
                            in your account within 5-7 business days.
                          </>
                        ) : (
                          <>
                            It's been more than 5 days since your subscription
                            started, or you've used a significant portion of your
                            minutes. Due to our cancellation & refund policy, you're
                            not eligible for a refund. Your subscription will be
                            canceled on{" "}
                            <strong>
                              {dayjs(current_period_end).format("MMMM D, YYYY")}
                            </strong>
                            , and you can continue to use all features until then.
                          </>
                        )}
                      </p>

                      <p style={{ marginTop: "16px" }}>
                        Are you sure you want to cancel?
                      </p>

                      <div className={styles.modalButtons}>
                        <button
                          className={`${styles.modalButton} ${styles.cancel}`}
                          onClick={() => setShowCancelConfirm(false)}
                        >
                          No
                        </button>
                        {deleteloading ? (
                          <button
                            className={`${styles.modalButton} ${styles.submit}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            Cancelling <Loader size={18} />
                          </button>
                        ) : (
                          <button
                            className={`${styles.modalButton} ${styles.submit}`}
                            onClick={async () => {
                              try {
                                await handleCancelSubscription(agentToCancel);
                                setShowCancelConfirm(false);
                                setAgentToCancel(null);
                              } catch (error) {
                                setPopupMessage(
                                  `Failed to Cancel subscription: ${error.message}`
                                );
                                setPopupType("failed");
                                setShowCancelConfirm(false);
                              }
                            }}
                          >
                            Yes
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* PAYG MODAL */}
            {showPaygConfirm &&
              agentToPaygActivate && checkPaygStatus === 1 &&
              (() => {
                const totalMins = agentToPaygActivate?.subscription?.totalMinutes || 0;
                // console.log("agentToPaygActivate", agentToPaygActivate)
                const minsLeft = agentToPaygActivate?.mins_left || 0;
                const plan_name1 = agentToPaygActivate?.agentPlan || ""
                const plan_mins = totalMins;
                const subscriptionStatus = agentToPaygActivate?.subscription?.subscription_status
                const usedPercentage = ((plan_mins - minsLeft) / plan_mins) * 100;
                const current_period_start =
                  agentToCancel?.subscription?.current_period_start;
                const current_period_end =
                  agentToCancel?.subscription?.current_period_end;
                const subscriptionAgeDays = dayjs().diff(
                  dayjs(current_period_start),
                  "day"
                );

                const checkPaygActivate = agentToPaygActivate?.is_payg || 0

                const isRefundEligible =
                  usedPercentage < 5 && subscriptionAgeDays <= 2;



                return (
                  // <> {checkPaygStatus === null || checkPaygStatus === 0 ? <>

                  // </> :
                  <div
                    className={styles.modalBackdrop}
                    onClick={() => setshowPaygConfirm(false)}
                  >
                    <div
                      className={styles.modalContainer}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h2>Are you sure?</h2>
                      <p>
                        {
                          subscriptionStatus === 9 ? (
                            <>
                              🔔 <strong>Deferred → PAYG</strong>: Your deferred plan will switch to a full <strong>Pay-As-You-Go</strong> plan.
                              Billing will follow the PAYG rules — the fixed assigned-number fee (if applicable) will be charged at the end of each month, and your PAYG usage will be billed at the end of the PAYG billing cycle based on actual minutes used.
                              <br /><br />
                              <strong>Note:</strong> Any remaining deferred minutes will be cleared when the switch happens. From then on, calls will continue under PAYG with no interruption.
                            </>
                          ) :
                            plan_name1 === "free" && assignNumberPaid ? (
                              <>
                                🎉 Your Assigned Number has been successfully activated!
                                You can now convert your free plan into a full Pay-As-You-Go plan by activating it.
                                The fixed assigned-number fee will be charged at the end of each month, and your PAYG usage will also be billed at the end of your PAYG billing cycle based on what you’ve used.
                                For more features, flexibility, and opportunities, we recommend upgrading your plan.
                              </>
                            ) : checkPaygActivate === 1 && plan_name1 === "Pay-As-You-Go" ? (
                              <>
                                Are you sure you want to deactivate Pay-As-You-Go for this agent?
                                Once disabled, calls will stop after the included minutes are used, and your PAYG plan will automatically be converted into a <strong>free plan</strong>.
                              </>
                            ) : checkPaygActivate === 1 ? (
                              <>
                                Are you sure you want to deactivate Pay-As-You-Go for this agent?
                                Your current plan will remain the same, but PAYG will be disabled for this agent.
                                Once disabled, calls will no longer continue after the included minutes are used.
                              </>
                            ) : (
                              <>
                                🚀 Activate PAYG for your agent to stay connected without limits.
                                After your included plan minutes are used, calls will seamlessly continue under PAYG — so there’s no interruption for your agents.
                                PAYG usage will be billed at the end of its billing cycle.
                                This is the best way to ensure smooth operations and uninterrupted agent calls.
                              </>
                            )
                        }
                      </p>

                      <p style={{ marginTop: "16px" }}>
                        Are you sure you want to Continue?
                      </p>

                      <div className={styles.modalButtons}>
                        <button
                          className={`${styles.modalButton} ${styles.cancel}`}
                          onClick={() => setshowPaygConfirm(false)}
                        >
                          No
                        </button>
                        {deleteloading ? (
                          <button
                            className={`${styles.modalButton} ${styles.submit}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            Cancelling <Loader size={18} />
                          </button>
                        ) : (
                          <button
                            className={`${styles.modalButton} ${styles.submit}`}
                            onClick={async () => {
                              handleTogglePayG()
                              setshowPaygConfirm(false);
                              setagentToPaygActivate(null);
                            }}
                          >
                            Yes
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  // }</>
                );
              })()}

            {/* Call Test Modal */}
            {openCallModal && (
              <Modal3
                isOpen={openCallModal}
                onClose={handleCloseCallModal}
                isEndingRef={isEndingRef}
                isCallInProgress={isCallInProgress}
              >
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
                  isEndingRef={isEndingRef}
                />
              </Modal3>
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
        )
        :
        <NotificationView />
      }

      {isAssignNumberModalOpen && (
        <div className={styles.modalBackdrop} onClick={closeAssignNumberModal}>
          <div
            className={styles.modalContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Upgrade Required!</h2>
            <p style={{ fontSize: "1.1rem", color: "#444", margin: "16px 0" }}>

              {/* To use the Assign Number feature on the free plan, you’ll need to pay a small additional charge.<br></br>
              For the best experience and access to premium features, we recommend upgrading to a higher plan. */}
              Your free one-month Assign Number has expired. You now need to pay to continue using the Assign Number feature.

            </p>
            <div className={`${styles.assignBtn}`}>
              <button
                className={`${styles.modalButton} ${styles.cancel}`}
                onClick={closeAssignNumberModal}
                // onClick={handleAssignNumberBuy}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                Cancel
              </button>
              <button
                className={`${styles.modalButton} ${styles.submit}`}
                // onClick={closeAssignNumberModal}
                onClick={handleAssignNumberBuy}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {isAssignApi ? (
                  <>
                    Processing... <Loader size={18} />
                  </>
                ) : (
                  "Proceed"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals for capturing/uploading profile picture */}
      {/* {isCaptureModalOpen && (
        <CaptureProfile onClose={closeCaptureModal} onCapture={handleCapture} />
      )} */}
      {showDeactivateConfirm && agentToDeactivate && (
        <div className={styles.modalBackdrop}>
          <div
            className={styles.modalContainer}
            onClick={(e) => e.stopPropagation()}
          >
            {agentToDeactivate.agentPlan === "free" &&
              agentToDeactivate.mins_left === 0 &&
              agentToDeactivate.isDeactivated === 1 ? (
              // 👉 Special Upgrade Popup
              <>
                <h2>Upgrade Required</h2>
                <p>
                  You’ve used up all your free minutes. To continue using{" "}
                  <strong>{formatName(agentToDeactivate?.agentName)}</strong>, please
                  upgrade your plan.
                </p>

                <div className={styles.modalButtons}>
                  <button
                    className={`${styles.modalButton} ${styles.cancel}`}
                    onClick={() => setShowDeactivateConfirm(false)}
                    disabled={deactivateLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className={`${styles.modalButton} ${styles.submit}`}
                    onClick={() => handleUpgradeClick(agentToDeactivate)} // 👉 You'll need to implement this
                  >
                    {deactivateLoading ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        Redirecting <Loader size={18} />
                      </span>
                    ) : (
                      "Upgrade"
                    )}
                  </button>
                </div>
              </>
            ) : (
              // 👉 Existing Activate/Deactivate Popup
              <>
                <h2>
                  {agentToDeactivate?.isDeactivated === 1
                    ? "Activate Agent"
                    : "Deactivate Agent"}
                </h2>
                <p>
                  {agentToDeactivate?.isDeactivated === 1
                    ? "Are you sure you want to activate this agent?"
                    : "If you pause your voice agent service, your monthly minutes will stop immediately. Don't worry—when you reactivate, your billing cycle will resume from that day, so you’ll still get all your paid time."}
                  <strong>
                    {agentToDeactivate?.isDeactivated === 1
                      ? "Activate"
                      : "Deactivate"}
                  </strong>{" "}
                  <strong>{formatName(agentToDeactivate?.agentName)}</strong>?
                </p>

                <div className={styles.modalButtons}>
                  <button
                    className={`${styles.modalButton} ${styles.cancel}`}
                    onClick={() => setShowDeactivateConfirm(false)}
                    disabled={deactivateLoading}
                  >
                    {agentToDeactivate?.isDeactivated === 1 ? "No" : "Keep Active"}
                  </button>
                  <button
                    className={`${styles.modalButton} ${styles.submit}`}
                    onClick={handleDeactivateAgent}
                  >
                    {deactivateLoading ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        Updating <Loader size={18} />
                      </span>
                    ) : (
                      <>
                        {agentToDeactivate?.isDeactivated === 1
                          ? "Yes"
                          : "Yes, Pause"}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}





      {isUploadModalOpen && (
        <UploadProfile onClose={closeUploadModal} onUpload={handleUpload} />
      )}
      {/* Floating Button */}
      {/* {showreferralfloating == "true" && (
        <div
          className={styles.floating}
          onClick={async () => {
            await getUserReferralCode();
          }}
        >
          <div className={styles.Cross} onClick={showConfirmFloatingClose}>
            x
          </div>
          <div
            className={styles.imageWrapper}
            onClick={() => setIsModalOpen(true)}
          >
            <img src="/svg/floating-svg2.svg" alt="floating-svg" />
            <p className={styles.imageLabel}>
              10<span className={styles.percentag}>%</span>
            </p>
          </div>
        </div>
      )} */}

      {/* Modal */}
      {/* <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className={styles.Refferalinfo}>
          <div className={styles.headerPart}>
            <h3>Earn 5% Commission & Give 5% Discount!</h3>
          </div>
          <div className={styles.card}>

            <div className={styles.linkSection}>
              <p className={styles.label}>Referral Link</p>
              <div className={styles.linkDiv}>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    value={showDashboardReferral}
                    readOnly
                    className={styles.input}
                  />
                </div>
                <div className={styles.copyWrapper}>
                  <button
                    className={styles.copyButton}
                    onClick={async () => handleCopy(showDashboardReferral)}
                  >
                    <img src="/svg/copy-icon.svg" alt="Copy" />
                  </button>
                  {copied && <span className={styles.tooltip}>Copied!</span>}
                </div>
              </div>
            </div>

            <hr className={styles.divider} />

            <div className={styles.infoSection}>
              <div className={styles.Linkdec}>
                <img src="/svg/earn-icon.svg" alt="earn-icon" />
                <p>
                  Share your referral link and <b>earn 5% commission</b> of
                  your friends’ spending.
                </p>
              </div>
              <div className={styles.Linkdec}>
                <img src='/svg/Gift-icon.svg' alt='commission-icon' />
                <p>Your friends get an <b>instant 5% discount</b> when they sign up using your link</p>
              </div>
              <div className={styles.Linkdec}>
                <img src="/svg/commission-icon.svg" alt="commission-icon" />
                <p>
                  You will earn “Commission” every month for upto{" "}
                  <b>12 months</b> or Customer Lifespan(Whichever is lower){" "}
                </p>
              </div>
              <div className={styles.Linkdec}>
                <img src="/svg/commission2.svg" alt="commission-icon" />
                <p>
                  We pay “Referral Commission” to our affiliate partners on{" "}
                  <b>1st Day of every following month.</b>
                </p>
              </div>
            </div>
            <div
              className={styles.btnTheme}
            >
              <div className={styles.imageWrapper}>
                <img src="svg/svg-theme2.svg" alt="" />
              </div>
              <AnimatedButton
                label="Share Referral Link"
                onClick={async () => shareReferralLink(showDashboardReferral)}
              />
            </div>
          </div>
        </div>
      </Modal> */}

      {/* <Footer /> */}
      <Footer2 />
      <Modal isOpen={modelOpen} onClose={() => setModelOpen(false)}>
        <Plan
          agentID={agentId}
          subscriptionID={subscriptionId}
          locationPath={locationPath}
        />
      </Modal>

      <CommingSoon show={showModal} onClose={() => setShowModal(false)} />

      {isAssignModalOpen && selectedAgentForAssign && (
        <AssignNumberModal
          isOpen={isAssignModalOpen}
          agentId={selectedAgentForAssign.agent_id}
          agentDetails={agentDetails}
          onAgentDetailsPage={false}
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
          onClose={() => {

            setPopupMessage("")
            setredirectButton(false)
            setassignNumberNavigate(true)
            setcheckPaygStatus(false)
            setpaygEnabledPopup(false)

            setPopupMessage("");
            setredirectButton(false);

          }}
          onConfirm={handleLogoutConfirm}
          extraButton={
            redirectButton
              ? {
                label: "Activate Payg",
                onClick: () => navigate("/edit-profile#payg-toggle"),
              }
              : undefined
          }
        />
      )}

      {popupMessage2 && (
        <Popup
          type={popupType2}
          message={popupMessage2}
          onClose={() => setPopupMessage2("")}
          onConfirm={handleChangeStatus}
        />
      )}

      <ConfirmModal
        show={showUpgradeConfirmModal}
        onClose={() => setShowUpgradeConfirmModal(false)}
        title="Upgrade Plan?"
        message={
          currentPlan1 === "Pay-As-You-Go"
            ? "Your current Pay-As-You-Go plan will be upgraded to a Paid plan, giving you more benefits and features."
            : currentPlan1 === "free"
              ? "You're about to upgrade this Free plan to a Paid plan. Once upgraded, you'll unlock premium features and additional benefits."
              : "You're about to upgrade this agent's plan. Your remaining minutes will be added on top of the new plan’s minutes."
        } type="info"
        confirmText={upgradeLoading ? "Redirecting..." : "Yes, Upgrade"}
        cancelText="Cancel"
        showCancel={true}
        isLoading={upgradeLoading}
        onConfirm={handleUpgradePaygConfirmed}
      />








      <Popup
        type={popupType3}
        message={popupMessage3}
        onClose={() => {
          if (!isConfirmedRef.current) {
            // handleConnectCal(agentDetailsForCal);
          }
          isConfirmedRef.current = false;
          setPopupMessage3("");
          setpaygStatusLoading(false)
        }}
        onConfirm={() => {
          isConfirmedRef.current = true;
          handleCalConnectWithConfirm();
          setPopupMessage3("");
        }}
      />
    </div>
  );
}

export default Dashboard
