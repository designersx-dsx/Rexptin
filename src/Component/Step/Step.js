import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  createContext,
} from "react";
import Slider from "react-slick";
import styles from "./Step.module.css";
import Step2 from "../Step2/Step2";
import Step3 from "../Step3/Step3";
import Step4 from "../Step4/Step4";
import {
  IDLE_FETCHER,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PopUp from "../Popup/Popup";
import StepHeader from "../StepHeader/StepHeader";
import axios from "axios";
import Loader from "../Loader/Loader";
import decodeToken from "../../lib/decodeToken";
import {
  API_BASE_URL,
  createAgent,
  createChatAgent,
  listAgents,
  updateAgent,
  updateAgentWidgetDomain,
} from "../../Store/apiStore";
import { useDashboardStore } from "../../Store/agentZustandStore";
import useCheckAgentCreationLimit from "../../hooks/useCheckAgentCreationLimit";
import { getAgentPrompt } from "../../hooks/useAgentPrompt";
import BusinessDetails from "../BusinessDetails/BusinessDetails";
import BusinessServices from "../BusinessServices/BusinessServices";
import AboutBusinessNext from "../BusinessServices/BusinessServicesNEXT";
import AboutBusiness from "../AboutBusiness/AboutBusiness";
import BusinessListing from "../BusinessListing/BusinessListing";
import Tooltip from "../TooltipSteps/Tooltip";
import Step1 from "../Step1/Step1";
import getDynamicAgentName from "../../utils/getDynamicAgentName";
import Thankyou from "../ThankyouPage/Thankyou";
import getTimezoneFromState from "../../lib/timeZone";
import Modal2 from "../Modal2/Modal2";
import LottieAnimation from "../../lib/LottieAnimation";
import ConfirmModal from "../AboutBusiness/ConfirmModal";

import {
  appointmentBooking,
  getBusinessSpecificFields,
} from "../../lib/post_Call_analysis";
const businessTypes = [
  { name: "Restaurant", code: "rest" },
  { name: "Bakery", code: "bake" },
  { name: "Deli shop", code: "deli" },
  { name: "Real Estate Broker", code: "rea_est_bro" },
  { name: "Property Rental & Leasing Service", code: "prop_ren_lea" },
  { name: "Architect", code: "arch" },
  { name: "Interior Designer", code: "int_des" },
  { name: "Construction Services", code: "con_ser" },
  { name: "Landscaping Company", code: "land_com" },
  { name: "Doctor's Clinic", code: "doct_cli" },
  { name: "Dentist", code: "dent_off" },
  { name: "Old Age Home", code: "old_age" },
  { name: "Gym & Fitness Center", code: "gym_fit" },
  { name: "Personal Trainer", code: "per_tra" },
  { name: "Insurance Agency", code: "ins_age" },
  { name: "Accounting Services", code: "acc_ser" },
  { name: "Financial Planners", code: "fin_pla" },
  { name: "Travel Agency", code: "trav_age" },
  { name: "Ticket Booking", code: "tick_boo" },
  { name: "Tour Guides", code: "tour_gui" },
  { name: "Beauty Parlour", code: "bea_par" },
  { name: "Nail Saloon", code: "nai_sal" },
  { name: "Saloon", code: "sal" },
  { name: "Barber Studio/Shop", code: "barb" },
  { name: "Hair Stylist", code: "hai_sty" },
  { name: "Dry Cleaner", code: "dry_cle" },
  { name: "Cleaning/Janitorial Service", code: "clea_jan_ser" },
  { name: "Web Design Agency", code: "web_des_age" },
  { name: "Marketing Agency", code: "mkt_age" },
  { name: "Digital Marketing Agency", code: "dgi_mkt_ag" },
  { name: "Car & Bus Services", code: "car_bus_ser" },
  { name: "Taxi, Cab & Limo Booking", code: "tax_cab_limo" },
  { name: "Movers & Packers", code: "mov_pac" },
  { name: "Trucking Company", code: "truc_com" },
  { name: "Car Repair & Garage", code: "car_rep" },
  { name: "Boat Repair & Maintenance", code: "boa_rep" },
  { name: "Spa & Wellness Center", code: "spa_wel" },
  { name: "Print Shop", code: "pri_sho" },
  { name: "School", code: "scho" },
  { name: "Colleges & Universities", code: "coll_uni" },
  { name: "Training Center", code: "tra_ce" },
  { name: "Educational Institute", code: "edu_ins" },
];
const Step = () => {
  const [showNoGMBModal, setShowNoGMBModal] = useState(false);
  const noGMBHandlersRef = useRef({ onConfirm: null, onCancel: null });
  const timestamp = Date.now();
  const [isRoleTitleChanged, setIsRoleTitleChanged] = useState(false);
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = sessionStorage.getItem("currentStep");
    return savedStep !== null ? parseInt(savedStep, 10) : 0;
  });
  const [selectedLang, setSelectedLang] = useState();
  const [selectedLangCode, setSelectedLangCode] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentCount, setAgentCount] = useState(0);
  const token = localStorage.getItem("token") || "";
  const decodeTokenData = decodeToken(token);
  const [userId, setUserId] = useState(decodeTokenData?.id || "");
  const { setHasFetched } = useDashboardStore();
  const EditingMode = localStorage.getItem("UpdationMode");
  const stepEditingMode = localStorage.getItem("UpdationModeStepWise");
  const { isLimitExceeded, CheckingUserLimit } =
    useCheckAgentCreationLimit(userId);
  const [isContinueClicked, setIsContinueClicked] = useState(false);
  const [visibleStep, setVisibleStep] = useState(0);
  const [avtarChecked, setAvtarChecked] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(() => {
    const saved = sessionStorage.getItem("completedSteps");
    return saved ? JSON.parse(saved) : [];
  });
  const [customLoader, setCustomeLoader] = useState(false);
  const [isAgentCreated, setIsAgentCreated] = useState(false);

  const [reactNativeStatus, setreactNativeStatus] = useState(false);

  useEffect(() => {
    const handleNativeMessage = (event) => {
      try {
        const raw = typeof event?.data === "string" ? event.data : null;
        if (!raw) return;

        const data = JSON.parse(raw);

        if (data?.type === "IAP_STARTED") {
          // flag to skip web checkout
          window.skipCheckout = true;
        }

        if (data?.type === "IAP_SUCCESS") {

          // handle success flow...
        }

        if (data?.type === "IAP_FAILED") {
          console.warn("❌ Purchase failed", data.reason);
          // handle failure flow...
        }
      } catch (err) {
        console.error("Invalid message from app:", err);
      }
    };

    // Only attach when inside RN WebView
    if (window.ReactNativeWebView) {
      // console.log("React Native RUnning",window)
      setreactNativeStatus(true);
      document.addEventListener("message", handleNativeMessage); // Android
      window.addEventListener("message", handleNativeMessage); // iOS
    }

    return () => {
      document.removeEventListener("message", handleNativeMessage);
      window.removeEventListener("message", handleNativeMessage);
    };
  }, []);

  const checkPaymentDone = localStorage.getItem("paymentDone");
  const subsID = localStorage.getItem("subcriptionIdUrl");
  const [AgentId, setAgentId] = useState();

  // Plans
  const [allPlans, setAllPlans] = useState(() => {
    const stored = localStorage.getItem("allPlans");
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedPriceId, setSelectedPriceId] = useState(() => {
    return sessionStorage.getItem("priceId") || "";
  });
  const location = useLocation();
  const locationPath = location?.state?.locationPath;
  const isTiered = location?.state?.plan;
  let value = location?.state?.value;
  const step1Ref = useRef(null);
  const step3Ref = useRef(null);
  const step4Ref = useRef(null);
  const step5Ref = useRef(null);
  const step6Ref = useRef(null);
  const step7Ref = useRef(null);
  const step8ARef = useRef(null);
  const step8BRef = useRef(null);
  // const step9Ref = useRef(null)
  useEffect(() => {
    if (token) {
      setUserId(decodeTokenData.id || "");
    }
  }, [token]);
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const Buisness = JSON.parse(sessionStorage.getItem("businessDetails"));
  const businessType =
    Buisness?.businessType === "Other"
      ? Buisness?.customBuisness
      : Buisness?.businessType;
  const totalSlides = 8;
  const removeSpaces = (phone) => {
    if (!phone) return null;
    return phone.replace(/\s+/g, "");
  };
  const role_title =
    sessionStorage.getItem("agentRole") || "General Receptionist";
  const business =
    JSON.parse(sessionStorage.getItem("businessDetails")) ||
    "Your Business Name";
  const BusinessLocation =
    JSON.parse(sessionStorage.getItem("businessLocation")) ||
    "Your Business Services";
  const languageSelect = sessionStorage?.getItem("agentLanguage");
  const rawCustomServices =
    JSON.parse(sessionStorage.getItem("selectedCustomServices")) || [];
  const cleanedCustomServices = rawCustomServices
    .map((item) => item?.service?.trim())
    .filter(Boolean)
    .map((service) => ({ service }));

  const businessServices = business?.selectedService || [];
  const customServices = cleanedCustomServices?.map((item) =>
    typeof item === "string" ? item : item.service
  );
  const businessServiceNames = businessServices?.map((item) => item);
  const allServices = [...customServices, ...businessServiceNames];
  const commaSeparatedServices = (
    allServices?.join(", ").replace("Other", "") || "Your Business Services"
  )
    .split(",")
    .filter((service) => service.trim() !== "")
    .map((service) => `- ${service.trim()}`)
    .join("\n");
  const servicesArray = commaSeparatedServices
    .split("\n")
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter((line) => line !== "")
    .map((service) => ({ service }));
  const agentGender = sessionStorage.getItem("agentGender");
  const aboutBusinessForm =
    JSON.parse(sessionStorage.getItem("aboutBusinessForm")) ||
    "Your Business Services";
  const agentName = sessionStorage.getItem("agentName") || "";
  const packageName = sessionStorage.getItem("package") || "Free";
  const selectedServices = sessionStorage.getItem("businessDetails");
  const services = selectedServices
    ? JSON.parse(selectedServices).businessType
    : [];
  const customServicesSelected = sessionStorage.getItem("businesServices");
  const checkCustomServicesSelected = customServicesSelected?.includes("Other");
  const plan = sessionStorage.getItem("selectedPlan");
  const [shouldShowAboutBusinessNext, setShouldShowAboutBusinessNext] =
    useState(false);
  const [showThankuPage, setShowThankuPage] = useState(false);
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const shouldShowThankYou = mode === "create" || mode === "update";

  const agentCode = sessionStorage.getItem("AgentCode");
  let freeTrail = location?.state?.freeTrial;
  const [isContiue, seIsContinue] = useState(false);
  const [showSiteMapUrls, setShowSiteMapUrls] = useState([]);
  const [showSiteMapModal, setShowSiteMapModal] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState([]);
  const [addOnUrl, setAddOnUrl] = useState("");
  const packageMap = {
    Free: 1,
    Starter: 2,
    Scaler: 3,
    Growth: 4,
    Corporate: 5,
    Enterprise: 6,
  };
  const detectRoleTypeChange = (roleTitle) => {
    setIsRoleTitleChanged((prev) => !prev);
  };
  const packageValue = packageMap[packageName] || 1;
  const addCompletedStep = (step) => {
    setCompletedSteps((prev) => {
      const updated = [...new Set([...prev, step])]; // ensure uniqueness

      return updated;
    });
  };
  const handleNext = async () => {
    const validations = {
      0: step1Ref,
      1: step3Ref,
      3: step4Ref,
      4: step5Ref,
      5: step6Ref,
      6: step7Ref,
      7: [step8ARef, step8BRef],
      // 8: step9Ref
    };
    const isValid = await validation(currentStep);
    if (!isValid) return;
    const currentRef = validations[currentStep];
    // Check if current step has a ref and validate
    if (currentRef?.current) {
      const isValid = currentRef?.current?.validate();
      if (!isValid) {
        return;
      }
      if (currentRef.current.save) {
        await currentRef.current.save();
      }
      // Add this step to completed steps
      addCompletedStep(currentStep);
    }
    scrollToTop();
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1 === 2 ? 1 : currentStep - 1;
      setCurrentStep(prevStep);
      setVisibleStep(prevStep);
      sliderRef.current?.slickGoTo(prevStep);
    }
  };
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    swipe: false,
    afterChange: (index) => {
      setVisibleStep(index);
    },
  };
  const fetchAgentCountFromUser = async () => {
    try {
      const response = await listAgents();
      const filterAgents = await response.filter(
        (res) => res.userId === userId
      );
      setAgentCount(filterAgents.length);
    } catch (error) {
      console.log(error);
    }
  };
  const sanitize = (str) =>
    String(str || "")
      .trim()
      .replace(/\s+/g, "_");
  const matchedBusiness = businessTypes.find(
    (item) => item?.name === business?.businessType
  );

  const businessCode = matchedBusiness
    ? matchedBusiness.code
    : sanitize(business?.customBuisness || "oth");

  const getBusinessNameFormCustom = sessionStorage.getItem(
    "displayBusinessName"
  );
  const getBusinessNameFromGoogleListing = JSON.parse(
    sessionStorage.getItem("placeDetailsExtract")
  );
  const businessPhone = removeSpaces(getBusinessNameFromGoogleListing?.phone);
  const dynamicAgentName = `${businessCode}_${userId}_${agentCode}_#${agentCount + 1
    }`;
  const getLeadTypeChoices = () => {
    const fixedChoices = [
      "Spam Caller",
      "Irrelvant Call",
      "Angry Old Customer",
    ];
    const allServices = [...customServices, ...businessServiceNames];
    const cleanedServices = allServices
      .map((service) => service?.trim()) // remove extra whitespace
      .filter((service) => service && service?.toLowerCase() !== "other")
      .map((service) => {
        const normalized = service?.replace(/\s+/g, " ")?.trim();
        return `Customer for ${normalized}`;
      });
    const combinedChoices = Array.from(
      new Set([...fixedChoices, ...cleanedServices])
    );
    return combinedChoices;
  };

  ///extractPromptVariables
  function extractPromptVariables(template, dataObject) {
    const matches = [...template.matchAll(/{{(.*?)}}/g)];
    const uniqueVars = new Set(matches.map((m) => m[1].trim()));

    // Flatten dataObject to a key-value map
    const flatData = {};

    function flatten(obj) {
      for (const key in obj) {
        const val = obj[key];
        if (
          typeof val === "object" &&
          val !== null &&
          "key" in val &&
          "value" in val
        ) {
          flatData[val.key.trim()] = val.value;
        } else if (typeof val === "object" && val !== null) {
          flatten(val); // Recursively flatten nested objects
        }
      }
    }

    flatten(dataObject);

    return Array.from(uniqueVars).map((variable) => ({
      name: variable,
      value: flatData[variable] ?? null,
      status: true,
    }));
  }
  const languageAccToPlan = ["Scaler", "Growth", "Corporate"].includes(plan)
    ? "multi"
    : sessionStorage.getItem("agentLanguageCode");

  const callNextApiAndRedirect = async (agentId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/agent/updateFreeAgent`,

        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, agentId, subsID }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setPopupType("success");
        setPopupMessage("Agent upgraded successfully!");
      } else {
        setPopupType("failed");
        setPopupMessage("Error completing subscription.");
      }
    } catch (error) {
      console.error("❌ API call failed:", error);
      setPopupType("failed");
      setPopupMessage("Error completing subscription.");
    }
  };
  const currentState = getBusinessNameFromGoogleListing?.state || "";
  //call recording functionlaity
  const statesRequiringCallRecording = [
    "Washington",
    "Vermont",
    "Pennsylvania",
    "Oregon",
    "New Hampshire",
    "Nevada",
    "Montana",
    "Michigan",
    "Massachusetts",
    "Maryland",
    "Illinois",
    "Florida",
    "Delaware",
    "Connecticut",
    "California",
  ];
  const callRecording = statesRequiringCallRecording.includes(currentState)
    ? true
    : false;
  //if widget
  const ifChatWidgetEnabledOrNot =
    sessionStorage.getItem("chatWebWidget") === "true";

  const handleContinue = async () => {
    // if (step8ARef.current) {
    setIsContinueClicked(true);

    let value1 = location?.state?.value;
    if (freeTrail) {
      setCustomeLoader(true);
    }
    if (value1 === "chatke") {
      setCustomeLoader(true);
    }
    //getTimeZone
    let timeZone;
    try {
      timeZone = await getTimezoneFromState(currentState);
    } catch (err) {
      console.error(" Error fetching timezone:", err);
    }
    const agentNote = sessionStorage.getItem("agentNote");
    const rawPromptTemplate = getAgentPrompt({
      industryKey:
        business?.businessType == "Other"
          ? business?.customBuisness
          : business?.businessType,
      roleTitle: sessionStorage.getItem("agentRole"),
      agentName: "{{AGENT NAME}}",
      agentGender: "{{AGENT GENDER}}",
      business: {
        businessName: "{{BUSINESS NAME}}",
        email: "{{BUSINESS EMAIL ID}}",
        aboutBusiness: "{{MORE ABOUT YOUR BUSINESS}}",
        address: "{{{BUSINESS ADDRESS}}",
      },
      languageSelect: "{{LANGUAGE}}",
      businessType: "{{BUSINESSTYPE}}",
      aboutBusinessForm: "{{}}",
      commaSeparatedServices: "{{SERVICES}}",
      agentNote: "{{AGENTNOTE}}",
      timeZone: "{{TIMEZONE}}",
    });
    const filledPrompt = getAgentPrompt({
      industryKey:
        business?.businessType == "Other"
          ? business?.customBuisness
          : business?.businessType, // ← dynamic from businessType
      roleTitle: sessionStorage.getItem("agentRole"),
      agentName: agentName?.split(" ")[0],
      agentGender: agentGender,
      business: {
        businessName:
          getBusinessNameFromGoogleListing?.businessName ||
          getBusinessNameFormCustom,
        email: getBusinessNameFromGoogleListing?.email || "",
        aboutBusiness:
          getBusinessNameFromGoogleListing?.aboutBusiness ||
          getBusinessNameFromGoogleListing?.aboutBussiness,
        address: getBusinessNameFromGoogleListing?.address || "",
      },
      languageSelect: languageSelect,
      businessType,
      aboutBusinessForm,
      commaSeparatedServices,
      agentNote,
      timeZone: timeZone?.timezoneId,
      languageAccToPlan,
      plan: plan,
      CallRecording: callRecording,
    });
    const promptVariablesList = extractPromptVariables(rawPromptTemplate, {
      industryKey:
        business?.businessType == "Other"
          ? business?.customBuisness
          : business?.businessType,
      roleTitle: sessionStorage.getItem("agentRole"),
      agentName: { key: "AGENT NAME", value: agentName?.split(" ")[0] },
      agentGender: { key: "AGENT GENDER", value: agentGender },
      business: {
        businessName: {
          key: "BUSINESS NAME",
          value:
            getBusinessNameFromGoogleListing?.businessName ||
            getBusinessNameFormCustom,
        },
        email: {
          key: "BUSINESS EMAIL ID",
          value: getBusinessNameFromGoogleListing?.email || "",
        },
        aboutBusiness: {
          key: "MORE ABOUT YOUR BUSINESS",
          value:
            getBusinessNameFromGoogleListing?.aboutBusiness ||
            getBusinessNameFromGoogleListing?.aboutBussiness,
        },
        address: {
          key: "BUSINESS ADDRESS",
          value: getBusinessNameFromGoogleListing?.address || "",
        },
      },
      languageSelect: { key: "LANGUAGE", value: languageSelect || "" },
      businessType: { key: "BUSINESSTYPE", value: businessType || "" },
      commaSeparatedServices: { key: "SERVICES", value: servicesArray || "" },
      timeZone: { key: "TIMEZONE", value: timeZone?.timezoneId || "" },
    });

    // const isValid = step8BRef.current.validate()
    //creation here
    if (localStorage.getItem("UpdationMode") != "ON") {
      setLoading(true);
      const agentConfig = {
        version: 0,
        model: "gemini-2.0-flash",
        model_temperature: 0,
        model_high_priority: true,
        tool_call_strict_mode: true,
        general_prompt: filledPrompt,
        general_tools: [
          {
            type: "end_call",
            name: "end_call",
            description: "End the call with user.",
          },
          {
            type: "extract_dynamic_variable",
            name: "extract_user_details",
            description:
              "Extract the user's details like name, email, phone number, address, and reason for calling from the conversation",
            variables: [
              {
                type: "string",
                name: "email",
                description:
                  "Extract the user's email address from the conversation",
              },
              {
                type: "number",
                name: "phone",
                description:
                  "Extract the user's phone number from the conversation",
              },
              {
                type: "string",
                name: "address",
                description: "Extract the user's address from the conversation",
              },
              {
                type: "string",
                name: "reason",
                description:
                  "Extract the user's reason for calling from the conversation",
              },
              {
                type: "string",
                name: "name",
                description: "Extract the user's name from the conversation\"",
              },
            ],
          },
          {
            name: "get_conversation_history",
            description: "Fetch previous coversation history by customer email address",
            type: "custom",
            method: "POST",
            url: `${process.env.REACT_APP_API_BASE_URL}/Chatbot/get_chat_logs?email={{parameter.email}}`,
            speak_after_execution: true,

            // Query parameters for GET request
            query_params: {
              email: "{{parameter.email}}",
            },

            // Response variables to extract order status
            parameters: {
              "type": "object",
              "properties": {
                "email": {
                  "type": "string",
                  "description": "Customer email address to fetch conversation history"
                }
              },
              "required": [
                "email"
              ]
            }
          },
          {
            name: "book_calendar_event",
            description: "Create a Google Calendar meeting with details such as title, description, timing, attendees, and reminders.",
            type: "custom",
            method: "POST",
            url: `https://0d28b9c50302.ngrok-free.app/api/create-meeting`,
            speak_after_execution: true,

            // Body parameters (payload sent in the request)
            body: {
              
              email: "{{parameter.userId}}",
              name: "{{parameter.name}}",
              userId:"{{parameter.userId}}"
              // title: "{{parameter.title}}",
              // description: "{{parameter.description}}",
              // start: "{{parameter.start}}",
              // end: "{{parameter.end}}",
              // timezone: "{{parameter.timezone}}",
              // attendees: "{{parameter.attendees}}",


            },

            // Parameter schema for chatbot input validation
            parameters: {
              "type": "object",
              "properties": {
                "userId": {
                  "type": "string",
                  "description": "Unique user identifier dynamically retrieved from retell_llm_dynamic_variables (e.g., context.retell_llm_dynamic_variables.userId). "
                },
                "title": {
                  "type": "string",
                  "description": "Title of the calendar event"
                },
                "description": {
                  "type": "string",
                  "description": "Details or agenda of the event"
                },
                "start": {
                  "type": "string",
                  "description": "Event start datetime in ISO format (e.g. 2025-10-27T15:00:00+05:30)"
                },
                "end": {
                  "type": "string",
                  "description": "Event end datetime in ISO format (e.g. 2025-10-27T16:00:00+05:30)"
                },
                "timezone": {
                  "type": "string",
                  "description": "Timezone for the event (default: UTC)",
                  "default": "UTC"
                },
                "attendees": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "email": { "type": "string" },
                      "displayName": { "type": "string" }
                    }
                  },
                  "description": "List of attendee email addresses and display names"
                },
                "location": {
                  "type": "string",
                  "description": "Location or meeting link of the event"
                },
                "conference": {
                  "type": "boolean",
                  "description": "Whether to create a Google Meet link automatically (default: true)",
                  "default": true
                },
                "reminders": {
                  "type": "object",
                  "properties": {
                    "email": { "type": "number", "description": "Minutes before event to send email reminder" },
                    "popup": { "type": "number", "description": "Minutes before event to show popup reminder" }
                  }
                },
                "sendUpdates": {
                  "type": "string",
                  "enum": ["all", "externalOnly", "none"],
                  "description": "Who should receive updates when event changes (default: all)",
                  "default": "all"
                },
                "idempotencyKey": {
                  "type": "string",
                  "description": "Unique key to prevent duplicate event creation"
                },
                "calendarId": {
                  "type": "string",
                  "description": "Google Calendar ID (default: primary)",
                  "default": "primary"
                }
              },
              "required": [ "title", "start", "end","userId"]
            }
          }

        ],
        states: [
          {
            name: "information_collection",
            state_prompt: `Greet the user with the begin_message and assist with their query.

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

                                If the user is silent or unclear, say: "Sorry, I didn’t catch that. Could you please repeat?"
                                If the user wants to end the call transition to end_call_state`,
            edges: [
              {
                destination_state_name: "dissatisfaction_confirmation",
                description: "User sounds angry or expresses dissatisfaction.",
              },
            ],
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
                           
                        
                        - If check_availability fails or no slots are returned:
                            - Say: "Our booking system is currently unavailable for direct scheduling. I’ll collect your details and a team member will reach out within 24 hours to confirm your appointment."
                            - Collect: name, phone number, email, and purpose.
                            - Then say: "Thanks! We’ll get back to you shortly."
                            - Then ask: "Do you have any other queries?"
                            - If yes, transition to information_collection.
                            
                        `,
            tools: [],
            edges: [
              {
                destination_state_name: "information_collection",
                description:
                  "User has further queries or provides new information after booking.",
              },
            ],
          },

          // 🌟 State: Dissatisfaction Confirmation
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

          // 🌟 State: Call Transfer
          {
            name: "call_transfer",
            state_prompt: `
                            Connecting you to a team member now. Please hold.
                        `,
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
            name: "end_call_state",
            state_prompt: `
                            Politely end the call by saying: "Thank you for calling. Have a great day!"
                        `,
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
        starting_state: "information_collection",
        default_dynamic_variables: {
          customer_name: "John Doe",
          business_Phone: businessPhone || "",
          business_email: business.email,
          timeZone: timeZone?.timezoneId,
        },
      };
      const knowledgeBaseId = sessionStorage.getItem("knowledgeBaseId");
      if (knowledgeBaseId) {
        agentConfig.knowledge_base_ids = [knowledgeBaseId];
      }
      //Create LLm
      try {
        const llmResponse = await axios.post(
          "https://api.retellai.com/create-retell-llm",
          agentConfig,
          {
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
              "Content-Type": "application/json",
            },
          }
        );
        sessionStorage.setItem("llmId", llmResponse.data.llm_id);
        const llmId = llmResponse.data.llm_id;
        const response_engine = {
          type: "retell-llm",
          llm_id: llmId,
        };
        const finalAgentData = {
          response_engine,
          voice_id: sessionStorage.getItem("agentVoice") || "11labs-Adrian",
          language: sessionStorage.getItem("agentLanguageCode") || "en-US",
          agent_name: dynamicAgentName || sessionStorage.getItem("agentName"),
          language: languageAccToPlan,
          post_call_analysis_model: "gpt-4o-mini",
          responsiveness: 1,
          enable_backchannel: true,
          interruption_sensitivity: 0.91,
          backchannel_frequency: 0.7,
          backchannel_words: [
            "Got it",
            "Yeah",
            "Uh-huh",
            "Understand",
            "Ok",
            "hmmm",
          ],
          post_call_analysis_data: [
            {
              type: "enum",
              name: "lead_type",
              description: "Feedback given by the customer about the call.",
              choices: getLeadTypeChoices(),
            },
            {
              type: "string",
              name: "name",
              description: "Extract the user's name from the conversation",
              examples: [
                "Ajay Sood",
                "John Wick",
                "Adam Zampa",
                "Jane Doe",
                "Nitish Kumar",
                "Ravi Shukla",
              ],
            },
            {
              type: "string",
              name: "email",
              description: "Extract the user's email from the conversation",
              examples: [
                "john.doe@example.com",
                "nitish@company.in",
                "12@gmail.com",
              ],
            },
            {
              type: "string",
              name: "reason",
              description:
                "The reason the user is calling or their inquiry. If provided in Hindi, translate to English. Summarize if it's long.",
              examples: [
                "Schedule an appointment",
                "Ask about services",
                "Request for accounting help",
              ],
            },
            {
              type: "string",
              name: "address",
              description:
                "Extract the user's personal address from the conversation. If the user explicitly provides their own address, include and format it for CRM or contact forms. If no personal address is mentioned, do not add or infer any business location. If the address is spoken in Hindi, translate it to English before returning.",
              examples: [
                "123 Main St, Delhi",
                "42 Wallaby Way, Sydney",
                "1490 Aandhar Eleven",
              ],
            },
            {
              type: "number",
              name: "phone_number",
              description:
                "The user's phone number in numeric format. If digits are spoken in words (e.g., 'seven eight seven six one two'), convert them to digits (e.g., '787612'). Ensure it's a valid number when possible.",

            },

            ...appointmentBooking(businessType),
            ...getBusinessSpecificFields(businessType),
          ],
          end_call_after_silence_ms: 30000,
          normalize_for_speech: true,
          ambient_sound: "call-center",
          ambient_sound_volume: 1,
          webhook_url: `${API_BASE_URL}/agent/updateAgentCall_And_Mins_WebHook`,
          // webhook_url: `https://da33c561d4a5.ngrok-free.app/api/agent/updateAgentCall_And_Mins_WebHook`,
        };
        // Create Agent Creation
        try {
          const response = await axios.post(
            "https://api.retellai.com/create-agent",
            finalAgentData,
            {
              headers: {
                Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
              },
            }
          );
          const agentId = response.data.agent_id;
          setAgentId(agentId);
          // Get businessId from sessionStorage
          const businessIdString =
            sessionStorage.getItem("businessId") || '{"businessId":1}';
          // Convert string to object
          const businessIdObj = JSON.parse(businessIdString);
          // Now access the actual ID
          const agentData = {
            userId: userId,
            agent_id: agentId || sessionStorage.getItem("agentId"),
            knowledgeBaseId: sessionStorage.getItem("knowledgeBaseId"),
            llmId: sessionStorage.getItem("llmId"),
            avatar: sessionStorage.getItem("avatar") || "",
            agentVoice: sessionStorage.getItem("agentVoice") || "11labs-Adrian",
            agentAccent:
              sessionStorage.getItem("agentVoiceAccent") || "American",
            agentRole:
              sessionStorage.getItem("agentRole") || "Genral Receptionist",
            agentName: sessionStorage.getItem("agentName") || "",
            agentLanguageCode:
              sessionStorage.getItem("agentLanguageCode") || "en-US",
            agentLanguage:
              sessionStorage.getItem("agentLanguage") || "English (US)",
            agentGender: sessionStorage.getItem("agentGender") || "female",
            agentPlan: "free" || "Plus",
            agentStatus: true,
            businessId: businessIdObj.businessId,
            responsiveness: 1,
            enable_backchannel: true,
            interruption_sensitivity: 0.7,
            backchannel_frequency: 0.7,
            backchannel_words: [
              "Got it",
              "Yeah",
              "Uh-huh",
              "Understand",
              "Ok",
              "hmmm",
            ],
            additionalNote: agentNote || "",
            agentCode,
            knowledgeBaseStatus: true,
            end_call_after_silence_ms: 30000,
            dynamicPromptTemplate: filledPrompt,
            rawPromptTemplate: rawPromptTemplate,
            post_call_analysis_data: [
              {
                type: "enum",
                name: "lead_type",
                description: "Feedback given by the customer about the call.",
                choices: getLeadTypeChoices(),
              },
              {
                type: "string",
                name: "name",
                description: "Extract the user's name from the conversation",
                examples: [
                  "Ajay Sood",
                  "John Wick",
                  "Adam Zampa",
                  "Jane Doe",
                  "Nitish Kumar",
                  "Ravi Shukla",
                ],
              },
              {
                type: "string",
                name: "email",
                description: "Extract the user's email from the conversation",
                examples: [
                  "john.doe@example.com",
                  "nitish@company.in",
                  "12@gmail.com",
                ],
              },
              {
                type: "string",
                name: "reason",
                description:
                  "The reason the user is calling or their inquiry. If provided in Hindi, translate to English. Summarize if it's long.",
                examples: [
                  "Schedule an appointment",
                  "Ask about services",
                  "Request for accounting help",
                ],
              },
              {
                type: "string",
                name: "address",
                description:
                  "The user's address or business location. If spoken in Hindi, translate to English. Format it for use in CRM or contact forms.",
                examples: [
                  "123 Main St, Delhi",
                  "42 Wallaby Way, Sydney",
                  "1490 Aandhar Eleven",
                ],
              },
              {
                type: "number",
                name: "phone_number",
                description:
                  "The user's phone number in numeric format. If digits are spoken in words (e.g., 'seven eight seven six one two'), convert them to digits (e.g., '787612'). Ensure it's a valid number when possible.",
              },
              {
                type: "boolean",
                name: "appointment_booked",
                description:
                  "Determine if appointment was successfully booked during the call and also if you get appointment deatails like email and date then only mark true",
                examples: [true, false],
              },
              {
                type: "string",
                name: "appointment_date",
                description:
                  "Extract the exact appointment date mentioned by customer. Format: YYYY-MM-DD",
                examples: ["2025-01-15", "2025-02-20", "2025-03-10"],
              },
              {
                type: "string",
                name: "appointment_time",
                description:
                  "Extract the exact appointment time mentioned by customer. Format: HH:MM AM/PM",
                examples: ["10:00 AM", "2:30 PM", "9:15 AM"],
              },
              {
                type: "string",
                name: "appointment_timezone",
                description:
                  "Extract timezone if mentioned, otherwise use default. Format: America/Los_Angeles style",
                examples: ["America/Los_Angeles", "America/New_York", "UTC"],
              },
              ...getBusinessSpecificFields(businessType),
            ],
            promptVariablesList: JSON.stringify(promptVariablesList),
            CallRecording: callRecording,
            voiceWidgetEnabled: true,
            timezone: timeZone?.timezoneId || ""
          };
          try {
            const response = await createAgent(agentData);

            if (response.status === 200 || response.status === 201) {
              sessionStorage.setItem("agentId", response.data.agent_id);
              sessionStorage.setItem("agentStatus", true);
              sessionStorage.removeItem("avatar");
              setPopupType("success");
              await updateAgentWidgetDomain(
                agentId,
                aboutBusinessForm?.businessUrl
              );
              if (ifChatWidgetEnabledOrNot) {
                // alert("ok")
                // Shared payload data for both Voice Agent and Chat Agent
                const commonAgentPayload = {
                  industryKey:
                    business?.businessType == "Other"
                      ? business?.customBuisness
                      : business?.businessType,
                  roleTitle: sessionStorage.getItem("agentRole"),
                  agentName: agentName?.split(" ")[0],
                  agentGender: agentGender,
                  business: {
                    businessName:
                      getBusinessNameFromGoogleListing?.businessName ||
                      getBusinessNameFormCustom,
                    email: getBusinessNameFromGoogleListing?.email || "",
                    aboutBusiness:
                      getBusinessNameFromGoogleListing?.aboutBusiness ||
                      getBusinessNameFromGoogleListing?.aboutBussiness,
                    address: getBusinessNameFromGoogleListing?.address || "",
                  },
                  languageSelect: languageSelect,
                  businessType,
                  aboutBusinessForm,
                  allServices,
                  agentNote,
                  timeZone: timeZone?.timezoneId,
                  languageAccToPlan,
                  plan: plan,
                  CallRecording: callRecording,
                  knowledgeBaseId: sessionStorage.getItem("knowledgeBaseId"),
                  businessPhone,
                  businessEmail: business?.email,
                  agent_id: agentId || sessionStorage.getItem("agentId"),
                };
                const response = await createChatAgent(
                  commonAgentPayload, token
                )
              }
              // if (checkPaymentDone === "true") {
              //     await callNextApiAndRedirect(agentId)
              // }
              // fdfd
              setPopupMessage("Agent created successfully!");
              setIsAgentCreated(true);
              setShowPopup(true);
              if (freeTrail) {
                setCustomeLoader(true);
                setTimeout(
                  () => navigate("/dashboard", { replace: true }),
                  2000
                );
              } else if (value1 === "chatke") {
                setCustomeLoader(true);
                setTimeout(
                  () => navigate("/dashboard", { replace: true }),
                  2000
                );
              } else if (isUser === "true") {
                setCustomeLoader(true);
                setTimeout(
                  () => navigate("/dashboard", { replace: true }),
                  2000
                );
              }
              if (checkPaymentDone === "true") {
                setTimeout(
                  () => navigate("/dashboard", { replace: true }),
                  1500
                );
              }

              setHasFetched(false);
              setLoading(false);
              // sessionStorage.clear()
            }
          } catch (error) {
            // console.log(error,error.status)
            if (error?.status == 400) {
              // console.log('errorinside',error)
              setIsAgentCreated(false);
              setPopupType("failed");
              setPopupMessage(error?.response?.data?.message);
              setShowPopup(true);
              setLoading(false);
            } else {
              console.error("Agent creation failed:", error);
              setPopupType("failed");
              setPopupMessage(
                "Agent creation failed while saving data in Database. Please try again."
              );
              setShowPopup(true);
              setLoading(false);
              setIsAgentCreated(false);
            }
          }
        } catch (err) {
          console.error("Upload failed:", err);
          setPopupType("failed");
          setPopupMessage("Agent creation failed.");
          setShowPopup(true);
          setLoading(false);
        }
      } catch (error) {
        console.error("LLM creation failed:", error);
        setPopupType("failed");
        setPopupMessage("LLM creation failed. Please try again.");
        setShowPopup(true);
        setLoading(false);
      }
      setLoading(false);
    }
  };
  const handleValidationError = ({ type, message }) => {
    setPopupType(type);
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };
  const getStepTitle = () => {
    const steps = {
      0: {
        title: EditingMode ? "Edit: Business Type" : "Business Type",
        subTitle: "Select category which best describes your business type",
        // icon: "business-type-icon.svg",
        tooltip: <Tooltip />,
      },
      1: {
        title: EditingMode ? "Edit: Services Offered" : "Services Offered",
        subTitle:
          "Select the “Services You Offer” for your Restaurant Business",
        // icon: "services-icon.svg",
        tooltip: <Tooltip />,
      },
      3: {
        title: EditingMode ? "Edit: Public Listing" : "Public Listing",
        subTitle: "Enter your Google My Business Listing & Website",
        // icon: "listing-icon.svg",
        tooltip: <Tooltip />,
      },
      4: {
        title: EditingMode ? "Edit: Business Details" : "Business Details",
        subTitle:
          "Verify or Update your Business Details we got from your public listings",
        // icon: "details-icon.svg",
        tooltip: <Tooltip />,
      },
      5: {
        title: EditingMode ? "Edit: Select Language" : "Select Language",
        subTitle: "Select the Primary Language, You want your agent to speak",
        // icon: "language-icon.svg",
        tooltip: <Tooltip />,
      },
      6: {
        title: EditingMode ? "Edit: Select Voice" : "Select Voice",
        subTitle: "Select a voice for your agent as per your liking",
        // icon: "voice-icon.svg",
        tooltip: <Tooltip />,
      },
      7: {
        title: EditingMode ? "Edit: Name & Avatar" : "Name & Avatar",
        subTitle: "Select the gender of your AI receptionist for your Business",
        // icon: "gender-icon.svg",
        tooltip: <Tooltip />,
      },
    };

    return (
      steps[currentStep] || {
        title: "Step Not Found",
        subTitle: "",
        icon: "default-icon.svg",
      }
    );
  };
  useEffect(() => {
    if (!CheckingUserLimit && isLimitExceeded && !EditingMode) {
      setShowPopup(true);
      setPopupType("failed");
      setPopupMessage(
        "Agent creation limit exceeded. Please upgrade your plan!"
      );
    }
  }, [CheckingUserLimit, isLimitExceeded]);

  const handleClosePopup = () => {
    // if (!CheckingUserLimit && isLimitExceeded && !EditingMode) {
    //     navigate('/dashboard');
    //     setShowPopup(false);
    // } else {
    //     setShowPopup(false);
    // }
    // if (!CheckingUserLimit && !EditingMode) {
    //     navigate('/dashboard');
    //     setShowPopup(false);
    // } else {
    //     setShowPopup(false);
    // }
    setShowPopup(false);
  };
  const validation = async (currentStep) => {
    const validations = {
      0: step1Ref,
      1: step3Ref,
      3: step4Ref,
      4: step5Ref,
      5: step6Ref,
      6: step7Ref,
      7: [step8ARef, step8BRef], // both Step3 and Step4
    };

    const refs = validations[currentStep];

    if (Array.isArray(refs)) {
      for (let ref of refs) {
        if (ref?.current?.validate) {
          const isValid = await ref.current.validate();
          if (!isValid) return false;

          if (ref?.current?.save) {
            await ref.current.save();
          }
        }
      }
    } else {
      if (refs?.current?.validate) {
        const isValid = await refs.current.validate();
        if (!isValid) return false;

        if (refs?.current?.save) {
          await refs.current.save();
        }
      }
    }

    addCompletedStep(currentStep);
    return true;
  };
  // function lock
  useEffect(() => {
    fetchAgentCountFromUser();
  }, []);

  useEffect(() => {
    const savedStep = sessionStorage.getItem("currentStep");
    if (savedStep !== null) {
      const parsedStep = parseInt(savedStep, 10);
      setCurrentStep(parsedStep);
      sliderRef.current?.slickGoTo(parsedStep);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("currentStep", currentStep.toString());
  }, [currentStep]);
  useEffect(() => {
    sessionStorage.setItem("completedSteps", JSON.stringify(completedSteps));
  }, [completedSteps]);

  // if (res?.data?.url) {
  //   window.location.href = res.data.url;
  // }
  //    catch (error) {
  //     console.error("Checkout error:", error);
  //   }
  let isUser = sessionStorage.getItem("isUser");
  const tierCheckout = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/tier/checkout`, {
        customerId: decodeTokenData?.customerId,
        presetUnits: location?.state?.value,
        minUnits: 0,
        maxUnits: 200,
        successUrl:
          window.location.origin +
          `/steps?mode=create&userId=${decodeTokenData?.id}`, // origin + path
        cancelUrl: window.location.origin + "/cancel-payment",
        userId: decodeTokenData?.id,
      });

      if (res?.data?.url) {
        window.location.href = res.data.url; // redirect user
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  const handleSubmit = () => {
    let priceId = sessionStorage.getItem("priceId");
    let freeTrail = location?.state?.value;

    if (freeTrail === "chatke" || isUser === "true") {
      handleContinue();
      // sessionStorage.removeItem(isUser)
    } else if (checkPaymentDone === "true") {
      // callNextApiAndRedirect()
      handleContinue();
    } else if (locationPath !== "/checkout" && priceId) {
      if (currentStep === 7) {
        const isStep3Valid = step8ARef.current?.validate?.();
        const isStep4Valid = step8BRef.current?.validate?.();
        if (!isStep3Valid || !isStep4Valid) return;
        handleBuyPlan({
          priceId: priceId,
          planName: plan,
          interval: sessionStorage.getItem("selectedPlanInterval"),
        });
        if (reactNativeStatus) {
          console.log(
            "Skipping web checkout because native IAP is in progress"
          );
        } else {
          navigate("/checkout");
        }
      }
    } else if (isTiered === "tierPlan") {
      tierCheckout();
    } else if (locationPath !== "/checkout" && !priceId) {
      if (currentStep === 7) {
        const isStep3Valid = step8ARef.current?.validate?.();
        const isStep4Valid = step8BRef.current?.validate?.();
        if (!isStep3Valid || !isStep4Valid) return;
        navigate("/plans");
        addCompletedStep(currentStep);
      }
    } else if (locationPath !== "/checkout" && !priceId) {
      if (currentStep === 7) {
        const isStep3Valid = step8ARef.current?.validate?.();
        const isStep4Valid = step8BRef.current?.validate?.();
        if (!isStep3Valid || !isStep4Valid) return;
        navigate("/plans");
        addCompletedStep(currentStep);
      }
    }
  };

  const isContinueCalled = useRef(false);
  useEffect(() => {
    if (freeTrail && currentStep === 7 && !isContinueCalled.current) {
      handleContinue();
      isContinueCalled.current = true;
    } else if (
      locationPath === "/checkout" &&
      currentStep === 7 &&
      !isContinueCalled.current
    ) {
      // handleContinue();
      isContinueCalled.current = true;
    }
  }, [freeTrail, currentStep, locationPath]);
  const step = getStepTitle();
  useEffect(() => {
    const storedValue = sessionStorage?.getItem("avtarChecked");
    if (storedValue !== null) {
      setAvtarChecked(JSON?.parse(storedValue));
    }
  }, []);
  const tooltipContentMap = {
    0: (
      <>
        <strong
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1rem",
            marginBottom: "15px",
          }}
        >
          {" "}
          Tell Us About Your Business
        </strong>
        <br></br>
        <br></br>
        <p>
          To ensure you get the most relevant output from your Virtual
          Receptionist, please tell us a little about your business. This
          information helps us personalize your experience and recommend
          features that best fit your specific needs.
        </p>
        <br></br>
        <ul>
          <li>
            <strong>1. What best describes your Business Category?</strong>
          </li>
          <p>Example: Retail, Hospitality, Healthcare, Services, Technology</p>
          <br></br>
          <li>
            <strong>2. What is your Business Size?</strong>
          </li>
          <p>Small Business: (2-50 employees)</p>
          <p>Medium Business: (51-250 employees)</p>
          <p>Large Business: (250+ employees)</p>
        </ul>
      </>
    ),
    1: (
      <>
        <p>
          {" "}
          Please select the services your business provides. Knowing your
          service offerings helps us recommend the best features for your
          Virtual Receptionist and personalize your experience. Don't see your
          service? Just click "Add More Services."
        </p>
        <br></br>
        <ul>
          <li>
            <strong>Example:</strong> For a restaurant, you might select
            services like "Table Reservations," "Takeout Orders," and "Menu
            Inquiries."
          </li>
        </ul>
      </>
    ),
    3: (
      <>
        <strong
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1rem",
            marginBottom: "15px",
          }}
        >
          {" "}
          Enhance Your Voice Agent's Knowledge
        </strong>
        <br></br>
        <br></br>
        <p>
          Please add your Google My Business URL and website link. These public
          listings help us deeply understand your business, allowing us to build
          a smart knowledge base for your Virtual Receptionist, so it can answer
          customer questions accurately.
        </p>
        <br></br>
        <ul>
          <li>
            <strong>1. Google My Business URL:</strong> Simply type your
            business name and select it from the results shown.
          </li>
          <li>
            <strong>2. Website:</strong> https://www.yourwebsite.com
          </li>
        </ul>
        <br></br>
        <p>
          If you don't have a Google My Business listing or a website, simply
          click "I do not have Google My Business or Website."
        </p>
      </>
    ),
    4: (
      <>
        <strong
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1rem",
            marginBottom: "15px",
          }}
        >
          {" "}
          Review Your Business Information
        </strong>
        <br></br>
        <br></br>
        <p>
          This screen provides a centralized view of your essential business
          details: your Business Name, Address, Phone Number, and Email, along
          with a space for your Business Description.
        </p>
        <br></br>
        <ol>
          <li>
            We've either pre-filled this information directly from your Google
            My Business listing, or if you don't have one, these fields will be
            ready for your input.
          </li>
          <li>
            You have the flexibility to add or edit any of these fields as
            needed.
          </li>
          <li>
            Please ensure these details are current and correct. Accurate
            information helps your Virtual Receptionist agent provide precise
            answers and ensures your customers can easily connect with you.
          </li>
          <li>
            Don't worry if you don't have everything ready! Your Business Email
            and "About your business" description are optional and can be
            completed at your convenience.
          </li>
        </ol>
      </>
    ),
    5: "This is the main language your agent will use for all its interactions. Choosing the correct language ensures the best communication experience. We Support 25+ Languages.",
    6: "Select the gender you prefer for your AI agent, then listen to the available voice options to pick the one that best represents your business.",
    7: "Pick an avatar for your agent, feel free to edit their name, and then decide their core function by selecting an agent type – either a helpful General Receptionist or an efficient Inbound Lead Qualifier.",
  };
  const hanldeAgentCreation = async () => {
    handleContinue();
  };
  //site map
  useEffect(() => {
    handleSelectAll();
  }, [showSiteMapModal, showSiteMapUrls]);
  // Select all handler
  const handleSelectAll = () => {
    let updated;

    // if (selectedUrls.length === showSiteMapUrls.length) {
    //     // Deselect all
    //     updated = [];
    // } else {
    // Select all
    updated = [...showSiteMapUrls];
    // }

    setSelectedUrls(updated);

    // Save with status
    const updatedWithStatus = showSiteMapUrls.map((item) => ({
      url: item,
      checkedStatus: updated.includes(item),
    }));

    sessionStorage.setItem(
      "selectedSiteMapUrls",
      JSON.stringify(updatedWithStatus)
    );
  };



  const handleCheckboxChange = (url) => {
    setSelectedUrls((prev) => {
      let updated;

      if (prev.includes(url)) {
        // Uncheck → remove url
        updated = prev.filter((item) => item !== url);
      } else {
        // Check → add url
        updated = [...prev, url];
      }

      // Save in sessionStorage as array of objects
      const updatedWithStatus = showSiteMapUrls.map((item) => ({
        url: item,
        checkedStatus: updated.includes(item),
      }));

      sessionStorage.setItem(
        "selectedSiteMapUrls",
        JSON.stringify(updatedWithStatus)
      );

      return updated;
    });
  };

  const handleBuyPlan = (data) => {
    // console.log({ data });

    const plansFromApple = {
      starter_month: "com.rexpt.starter.monthly",
      starter_year: "com.rexpt.starter.yearly",
      scaler_month: "com.rexpt.scaler.monthly",
      scaler_year: "com.rexpt.scaler.yearly",
      growth_month: "com.rexpt.growth.monthly",
      growth_year: "com.rexpt.growth.yearly",
      corporate_month: "com.rexpt.corporate.monthly",
      corporate_year: "com.rexpt.corporate.yearly",
    };

    // Normalize name + interval into a key (lowercased to match dictionary)
    const key = `${data.planName.toLowerCase()}_${data.interval.toLowerCase()}`;

    // Lookup product ID from Apple mapping
    const appleProductId = plansFromApple[key];

    if (!appleProductId) {
      console.warn("⚠️ No matching Apple product found for:", key);
      return;
    }

    // console.log("appleProductId",appleProductId)

    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "CHECKOUT",
          productId: appleProductId,
        })
      );
    } else {
      console.warn("ReactNativeWebView not available — running in browser");
    }
  };

  useEffect(() => {
    const sessionSelected = JSON.parse(
      sessionStorage.getItem("selectedSiteMapUrls")
    );

    if (sessionSelected && sessionSelected.length > 0) {
      // Filter only those with checkedStatus: true
      const checkedUrls = sessionSelected
        .filter((item) => item.checkedStatus)
        .map((item) => item.url);

      setSelectedUrls(checkedUrls);
    }
  }, [showSiteMapUrls]);

  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    // fetch("/animations/Bodomwgicz.json")
    fetch("/animations/custom_Loader.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Error loading animation:", err));
  }, []);
  if (customLoader) {
    return (
      <>
        <div className={styles.container_animation}>
          <br />
          <div className={styles.Logo_animation}>
            <img src="/svg/Rexpt-Logo.svg" alt="Rexpt-Logo" />
          </div>
        </div>
        <div className={styles.animationContainer}>
          <div className={styles.animationContent}>
            <LottieAnimation
              animationData={animationData}
              width={300}
              height={300}
            />

            <p className={styles.loaderText}>
              <b>Setting up your agent... </b>
              <br />
              <br /> Please Wait
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {shouldShowThankYou ? (
        <Thankyou
          onSubmit={hanldeAgentCreation}
          isAgentCreated={isAgentCreated}
        />
      ) : (
        <div className={styles.container}>
          <StepHeader
            title={step?.title}
            subTitle={step?.subTitle}
            // icon={step.icon}
            tooltip={<Tooltip content={tooltipContentMap[currentStep]} />}
          />
          <Slider ref={sliderRef} {...settings}>
            {/* business-details */} {/* Step 1 */}
            {currentStep === 0 && (
              <div>
                <BusinessDetails
                  ref={step1Ref}
                  onNext={handleNext}
                  onBack={handleBack}
                  onValidationError={handleValidationError}
                  isActive={currentStep === 0}
                  onSuccess={(data) => {
                    setShowPopup(true);
                    setPopupType("success");
                    setPopupMessage(data.message);
                    setTimeout(() => {
                      setShowPopup(false);
                    }, 2000);
                  }}
                  onFailed={(data) => {
                    setShowPopup(true);
                    setPopupType("failed");
                    setPopupMessage(data.message);
                    setTimeout(() => {
                      setShowPopup(false);
                    }, 2000);
                  }}
                  loading={loading}
                  setLoading={setLoading}
                  onStepChange={(step) => {
                    setCurrentStep(step);
                    setVisibleStep(step);
                    sliderRef.current?.slickGoTo(step);
                  }}
                />
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <BusinessServices
                  ref={step3Ref}
                  onNext={handleNext}
                  onBack={handleBack}
                  onValidationError={handleValidationError}
                  // isActive={currentStep === 1}
                  onSuccess={(data) => {
                    setShowPopup(true);
                    setPopupType("success");
                    setPopupMessage(data.message);
                    setTimeout(() => {
                      setShowPopup(false);
                    }, 2000);
                  }}
                  onFailed={(data) => {
                    setShowPopup(true);
                    setPopupType("failed");
                    setPopupMessage(data.message);
                    setTimeout(() => {
                      setShowPopup(false);
                    }, 2000);
                  }}
                  loading={loading}
                  setLoading={setLoading}
                  onStepChange={(step) => {
                    setCurrentStep(step);
                    setVisibleStep(step);
                    sliderRef.current?.slickGoTo(step);
                  }}
                />
              </div>
            )}
            {currentStep === 3 && (
              <div>
                <AboutBusiness
                  ref={step4Ref}
                  onNext={handleNext}
                  onBack={handleBack}
                  onValidationError={handleValidationError}
                  isActive={currentStep === 3}
                  onSuccess={(data) => {
                    setShowPopup(true);
                    setPopupType("success");
                    setPopupMessage(data.message);
                    setTimeout(() => {
                      setShowPopup(false);
                    }, 2000);
                  }}
                  onFailed={(data) => {
                    setShowPopup(true);
                    setPopupType("failed");
                    setPopupMessage(data.message);
                    setTimeout(() => {
                      setShowPopup(false);
                    }, 2000);
                  }}
                  onSiteMap={(data) => {
                    setShowSiteMapModal(Boolean(data.status));
                    setShowSiteMapUrls(data.data || []);
                    setAddOnUrl(data.addOnUrl);
                  }}
                  onRequestNoGMBConfirm={({ onConfirm, onCancel }) => {
                    noGMBHandlersRef.current = { onConfirm, onCancel };
                    setShowNoGMBModal(true);
                  }}
                  selectedSiteMapUrls={selectedUrls}
                  loading={loading}
                  setLoading={setLoading}
                  onStepChange={(step) => {
                    setCurrentStep(step);
                    setVisibleStep(step);
                    sliderRef.current?.slickGoTo(step);
                  }}
                />
              </div>
            )}
            {currentStep === 4 && (
              <div>
                <BusinessListing
                  ref={step5Ref}
                  onNext={handleNext}
                  onBack={handleBack}
                  onValidationError={handleValidationError}
                  isActive={currentStep === 4}
                  onSuccess={(data) => {
                    setShowPopup(true);
                    setPopupType("success");
                    setPopupMessage(data.message);
                    setTimeout(() => {
                      setShowPopup(false);
                    }, 2000);
                  }}
                  onFailed={(data) => {
                    setShowPopup(true);
                    setPopupType("failed");
                    setPopupMessage(data.message);
                    setTimeout(() => {
                      setShowPopup(false);
                    }, 2000);
                  }}
                  loading={loading}
                  setLoading={setLoading}
                  onStepChange={(step) => {
                    setCurrentStep(step);
                    setVisibleStep(step);
                    sliderRef.current?.slickGoTo(step);
                  }}
                />
              </div>
            )}
            {currentStep === 5 && (
              <div>
                <Step1
                  ref={step6Ref}
                  onNext={handleNext}
                  onBack={handleBack}
                  onValidationError={handleValidationError}
                  isActive={currentStep === 5}
                  onSuccess={(data) => {
                    setShowPopup(true);
                    setPopupType("success");
                    setPopupMessage(data.message);
                    setTimeout(() => {
                      setShowPopup(false);
                    }, 2000);
                  }}
                  onFailed={(data) => {
                    setShowPopup(true);
                    setPopupType("failed");
                    setPopupMessage(data.message);
                    setTimeout(() => {
                      setShowPopup(false);
                    }, 2000);
                  }}
                  loading={loading}
                  setLoading={setLoading}
                  onStepChange={(step) => {
                    setCurrentStep(step);
                    setVisibleStep(step);
                    sliderRef.current?.slickGoTo(step);
                  }}
                />
              </div>
            )}
            {currentStep === 6 && (
              <div>
                <Step2
                  ref={step7Ref}
                  onNext={handleNext}
                  onBack={handleBack}
                  onValidationError={handleValidationError}
                  isActive={currentStep === 6}
                  onSuccess={(data) => {
                    setShowPopup(true);
                    setPopupType("success");
                    setPopupMessage(data.message);
                    setTimeout(() => {
                      setShowPopup(false);
                    }, 2000);
                  }}
                  onFailed={(data) => {
                    setShowPopup(true);
                    setPopupType("failed");
                    setPopupMessage(data.message);
                    setTimeout(() => {
                      setShowPopup(false);
                    }, 2000);
                  }}
                  loading={loading}
                  setLoading={setLoading}
                  onStepChange={(step) => {
                    setCurrentStep(step);
                    setVisibleStep(step);
                    sliderRef.current?.slickGoTo(step);
                  }}
                />
              </div>
            )}
            {currentStep === 7 && (
              <div>
                <Step3
                  ref={step8ARef}
                  onNext={handleNext}
                  onBack={handleBack}
                  onValidationError={handleValidationError}
                  isActive={currentStep === 7}
                  onSuccess={(data) => {
                    setShowPopup(true);
                    setPopupType("success");
                    setPopupMessage(data.message);
                    setTimeout(() => {
                      setShowPopup(false);
                    }, 2000);
                  }}
                  onFailed={(data) => {
                    setShowPopup(true);
                    setPopupType("failed");
                    setPopupMessage(data.message);
                    setTimeout(() => {
                      setShowPopup(false);
                    }, 2000);
                  }}
                  loading={loading}
                  setLoading={setLoading}
                  onStepChange={(step) => {
                    setCurrentStep(step);
                    setVisibleStep(step);
                    sliderRef.current?.slickGoTo(step);
                  }}
                  setAvtarChecked={setAvtarChecked}
                />
                {avtarChecked && (
                  <Step4
                    ref={step8BRef}
                    onNext={handleNext}
                    onBack={handleBack}
                    onValidationError={handleValidationError}
                    isActive={currentStep === 7}
                    onSuccess={(data) => {
                      setShowPopup(true);
                      setPopupType("success");
                      setPopupMessage(data.message);
                      setTimeout(() => {
                        setShowPopup(false);
                      }, 2000);
                    }}
                    onFailed={(data) => {
                      setShowPopup(true);
                      setPopupType("failed");
                      setPopupMessage(data.message);
                      setTimeout(() => {
                        setShowPopup(false);
                      }, 2000);
                    }}
                    loading={loading}
                    setLoading={setLoading}
                    onStepChange={(step) => setCurrentStep(step)}
                    detectRoleTypeChange={detectRoleTypeChange}
                  />
                )}
              </div>
            )}
          </Slider>
          {/* Nitish code */}
          <div className={styles.footerFixed}>
            <div className={styles.stepsIndicator}>
              {[...Array(totalSlides)].reduce((acc, _, idx) => {
                if (idx === 2) return acc;

                const isClickable =
                  idx <= currentStep || completedSteps.includes(idx);
                const isCompleted = completedSteps.includes(idx);
                const isCurrent = currentStep === idx;
                const isUpcoming = !isCompleted && !isCurrent;

                let stepClass = styles.stepNumber;
                if (isCompleted && !isCurrent)
                  stepClass += ` ${styles.completedStep}`;
                if (isCurrent) stepClass += ` ${styles.activeStepNumber}`;
                if (isUpcoming) stepClass += ` ${styles.upcomingStep}`;

                acc.push(
                  <button
                    key={idx}
                    disabled={!isClickable}
                    className={stepClass}
                    onClick={async () => {
                      if (!isClickable || isContinueClicked) return;

                      const validations = {
                        0: step1Ref,
                        1: step3Ref,
                        3: step4Ref,
                        4: step5Ref,
                        5: step6Ref,
                        6: step7Ref,
                        7: [step8ARef, step8BRef],
                      };

                      if (idx > currentStep) {
                        for (let i = currentStep; i < idx; i++) {
                          if (completedSteps.includes(i)) continue;

                          const ref = validations[i];
                          if (ref?.current?.validate) {
                            const isValid = await ref.current.validate();
                            if (!isValid) return;

                            if (ref?.current?.save) {
                              await ref.current.save();
                            }

                            addCompletedStep(i);
                          }
                        }
                      }

                      setCurrentStep(idx);
                      setVisibleStep(idx);
                      sliderRef.current?.slickGoTo(idx);
                    }}
                  >
                    {isCompleted && !isCurrent ? <span /> : acc.length + 1}
                  </button>
                );

                return acc;
              }, [])}
            </div>

            {currentStep === 7 && allPlans.length > 0 && (
              <div className={styles.PlansSelectDrop}>
                <select
                  name="plans"
                  id="plans"
                  value={selectedPriceId}
                  onChange={(e) => {
                    const newPriceId = e.target.value;
                    setSelectedPriceId(newPriceId);
                    sessionStorage.setItem("priceId", newPriceId);
                    const selectedPlan = allPlans.find(
                      (plan) => plan.priceId === newPriceId
                    );
                    if (selectedPlan) {
                      sessionStorage.setItem(
                        "selectedPlan",
                        selectedPlan.title
                      );
                    }
                  }}
                >
                  {allPlans.map((plan, index) => (
                    <option key={index} value={plan.priceId}>
                      {plan.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {/* //Button */}
            {currentStep === 7 ? (
              <button className={styles.navBtn} onClick={handleSubmit}>
                {loading ? (
                  <>
                    <Loader size={20} />
                  </>
                ) : (
                  <img
                    src="svg/arrow.svg"
                    alt="arrow"
                    className={styles.arrowIcon}
                  />
                )}
              </button>
            ) : (
              <button className={styles.navBtn} onClick={handleNext}>
                {loading ? (
                  <>
                    <Loader size={20} />
                  </>
                ) : (
                  <img
                    src="svg/arrow.svg"
                    alt="arrow"
                    className={styles.arrowIcon}
                  />
                )}
              </button>
            )}
          </div>
          {showPopup && (
            <PopUp
              type={popupType}
              onClose={() => handleClosePopup()}
              message={popupMessage}
            />
          )}
          {" "}
          <ConfirmModal
            open={showNoGMBModal}
            title="Continue without a Google Business Profile?"
            message="Important Notice: Linking your Google Business Profile is crucial for our agent to understand your business accurately and provide effective results. Continue without linking your profile?"
            cancelText="Go back"
            confirmText="Continue"
            onClose={() => {
              setShowNoGMBModal(false);
              noGMBHandlersRef.current?.onCancel?.();
            }}
            onConfirm={() => {
              setShowNoGMBModal(false);
              noGMBHandlersRef.current?.onConfirm?.();
            }}
          />
          {/* setShowSiteMapModal 
                {showSiteMapModal && <Modal2 isOpen={showSiteMapModal} onClose={() => setShowSiteMapModal(false)}>
                    <div className={styles.sitemapModal}>

                        <div className={styles.sitemapHeader}>
                            <input
                                type="checkbox"
                                checked={selectedUrls.length === showSiteMapUrls.length}
                                onChange={handleSelectAll}
                            />
                            <label>Select All</label>
                        </div>

                        <div className={styles.sitemapList}>
                            {showSiteMapUrls.length > 0 ? (
                                showSiteMapUrls.map((item, index) => (
                                    <label className={styles.sitemapItem} key={index}>
                                        <input
                                            type="checkbox"
                                            checked={selectedUrls.includes(item)}
                                            onChange={() => handleCheckboxChange(item)}
                                        />
                                        <span>{item}</span>
                                    </label>
                                ))
                            ) : (
                                <label className={styles.sitemapItem}>
                                    <input
                                        type="checkbox"
                                        checked={selectedUrls.includes(addOnUrl)}
                                        onChange={() => handleCheckboxChange(addOnUrl)}
                                    />
                                    <span>{addOnUrl}</span>
                                </label>
                            )}
                        </div>

                    </div>
                </Modal2>}
                */}
        </div>
      )}
    </>
  );
};

export default Step;