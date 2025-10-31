import React, { useEffect, useState } from "react";
import styles from "./CalendarConnect.module.css";
import HeaderBar from "../HeaderBar/HeaderBar";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import decodeToken from "../../lib/decodeToken";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import PopUp from "../Popup/Popup";
import AnimatedButton from "../AnimatedButton/AnimatedButton";
import { useDashboardStore } from "../../Store/agentZustandStore";
import { updateAgentEventId } from "../../Store/apiStore";
import getTimezoneFromState from "../../lib/timeZone";

const CalendarConnect = () => {
  const { agents, totalCalls, hasFetched, setDashboardData, setHasFetched } =
    useDashboardStore();
  const [enabled, setEnabled] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const token = localStorage.getItem("token");
  const decodeTokenData = decodeToken(token);
  const userId = decodeTokenData?.id || "";
  const [initialApiKey, setInitialApiKey] = useState("");

  const isValidCalApiKey = (key) => key.startsWith("cal_live_");
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventSlug, setEventSlug] = useState("");
  const [eventLength, setEventLength] = useState("");
  const [eventLoading, setEventLoading] = useState(false);
  const [agentId, setAgentId] = useState(null);
  const [llmId, setLlmId] = useState(null);
  const location = useLocation();
  const [popup, setPopup] = useState({ type: "", message: "" });
  const [apiSubmitting, setApiSubmitting] = useState(false);
  const [agentsDetails, setAgentsDetails] = useState([])
  const [timezone, setTimeZone] = useState("")
  const navigate = useNavigate()
  //getTimeZone
  const fetchTimeZone = async () => {
    try {
      const timeZone = await getTimezoneFromState(agentsDetails?.business?.state);
      setTimeZone(timeZone)
      // Proceed with using timeZone
    } catch (err) {
      console.error("Error fetching timezone:", err);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedKey = apiKey.trim();
    setApiSubmitting(true);
    try {
      const eventCreated = await createCalEvent(
        trimmedKey,
        `MEETING BY ${agentsDetails?.agentName}`,
        `${agentsDetails?.agentName}_${agentsDetails?.agentCode}`,
        15
      );
      // If event creation failed, stop here
      if (!eventCreated) {
        setApiSubmitting(false);
        return;
      }
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/agent/update-calapikey/${agentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ calApiKey: trimmedKey, userId: userId }),
        }
      );
      sessionStorage.setItem("userCalApiKey", trimmedKey)
      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 401 || response.status === 400) {
          setPopup({
            type: "failed",
            message: "Unauthorized! Invalid API Key.",
          });
          return; //  Exit early on invalid key
        }

        throw new Error(errorData.message || "Failed to update API key");
      }

      //  Only called if response is OK
      setHasFetched(false);
      setEventName("");
      setEventSlug("");
      setEventLength("");
    } catch (error) {
      setPopup({
        type: "failed",
        message: "Unauthorized! Invalid API Key.",
      });
    } finally {
      setApiSubmitting(false);
    }
  };
  const createCalEvent = async (apiKey, eventName, slug, eventLength) => {
    if (!apiKey || !eventName || !eventName || !eventLength) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setEventLoading(true);
      const response = await fetch(
        `https://api.cal.com/v1/event-types?apiKey=${encodeURIComponent(
          apiKey
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: eventName,
            slug: slug,
            length: eventLength,
          }),

        }
      );

      if (!response.ok) {
        const err = await response.json();
      }

      const data = await response.json();
      const eventTypeId = data?.event_type?.id;
      setApiSubmitting(true)
      if (!eventTypeId) {
        throw new Error("Event ID not received from Cal.com");
      }
      try {
        await updateAgentEventId(agentId, eventTypeId);
        // console.log(" Event ID saved to agent.");
      } catch (err) {
        console.error("Failed to update agent with event ID:", err);
      }

      const retellPayload = {
        general_tools: [
          {
            type: "book_appointment_cal",
            name: "cal_tool",
            cal_api_key: apiKey.trim(),
            event_type_id: eventTypeId,
          },
          {
            type: "check_availability_cal",
            name: "check_availability",
            cal_api_key: apiKey.trim(),
            event_type_id: eventTypeId,
            description: "Check the available appointment slots in the calendar and return times strictly in the user's timezone. Use this timezone to suggest and book appointments.",
            timezone: timezone?.timezoneId

          },
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
            `
            ,
            tools: [
              {
                type: "check_availability_cal",
                name: "check_availability_cal",
                cal_api_key: apiKey.trim(),
                event_type_id: eventTypeId,
                description: "Check if calendar is connected and fetch available time slots.",
                timezone: timezone?.timezoneId
              }
            ],
            edges: [
              {
                destination_state_name: "information_collection",
                description: "User has further queries or provides new information after booking."
              }
            ]
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

      const retellRes = await fetch(
        `https://api.retellai.com/update-retell-llm/${llmId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
          },
          body: JSON.stringify(retellPayload),
        }
      );

      if (!retellRes.ok) {
        const errData = await retellRes.json();
        throw new Error(
          "Retell LLM update failed: " + (errData?.message || "")
        );
      }

      setPopup({
        type: "success",
        message: "Cal API key added and event created successfully.",
      });
      navigate("/dashboard")
      // setShowEventModal(false);

      return true;
    } catch (err) {
      setPopup({
        type: "failed",
        message: "Unauthorized access"
      });
    } finally {
      setEventLoading(false);
    }
  };

  const [expanded, setExpanded] = useState("panel1");
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  useEffect(() => {
    const agentDetails = JSON.parse(sessionStorage.getItem("agentDetails"));

    setAgentId(agentDetails?.agent_id);
    setLlmId(agentDetails?.llmId);
    setAgentsDetails(agentDetails);

    if (agentDetails?.calApiKey && typeof agentDetails?.calApiKey === "string") {
      setApiKey(agentDetails?.calApiKey);
      setInitialApiKey(agentDetails?.calApiKey);
      setEnabled(true);
    }
    fetchTimeZone()
  }, []);

  return (
    <div className={styles.calenderMain}>
      <HeaderBar title="Connect Calendar" />
      <div className={styles.container}>

        <p className={styles.TopPara}>
          You can easily{" "}
          <strong>Connect your personal or business Calendar</strong> with your{" "}
          <a href="">Rexptin Agent</a> to receive calendar Meetings.
        </p>

        <div className={styles.supportSection}>
          {/* <p>We Support</p> */}
          <div className={styles.icons}>
            <img src="/images/CalcSupport.png" alt="Outlook" />
          </div>
        </div>

        <div className={styles.toggleSection}>
          <label>
            I already have&nbsp;<a
              href="https://app.cal.com/event-types"

              target="_blank"
              rel="noopener noreferrer"
            >
              Cal.com Account
            </a>&nbsp; to connect
          </label>

          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={() => setEnabled(!enabled)}
            />
            <span className={styles.slider}></span>
          </label>
        </div>

        {enabled && (
          <div className={styles.ONSwitch}>
            <form >
              <div className={styles.labelRow}>
                <label htmlFor="apiKey">Enter your API Key below:</label>
                <a
                  href="https://app.cal.com/settings/developer/api-keys"
                  className={styles.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Where is my Key?
                </a>

              </div>

              <input
                type="text"
                id="apiKey"
                placeholder="Cal.com API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className={styles.input}
              // readOnly={!!apiKey}
              />

              <p className={styles.description}>
                We will use your <strong>API Key</strong>, to create a custom
                meeting in your Cal.com profile for your agent to book meetings
                for you.
              </p>
              <AnimatedButton
                onClick={handleSubmit}
                isLoading={eventLoading}
                label="Submit"
                disabled={
                  apiSubmitting || apiKey.trim() === initialApiKey.trim()
                }
                position={{ position: "relative" }}
              />
            </form>

            <div className={styles.helpLink}>
              <a href="/calinfo" target="_blank" rel="noopener noreferrer">
                Need Help to Find the API Key?
              </a>
            </div>
          </div>
        )}

        {!enabled && (
          <div className={styles.offSwitch}>

            <a target="_blank"
              rel="noopener noreferrer" href="https://cal.com/?via=rexptin&dub_id=7NCpqAziwR4aWcXl">
              {" "}
              <div className={styles.recommendation}>
                <img src="/images/CalCOm.png" />
              </div>
            </a>
            <p className={styles.patnerCal}>
              We have partnered with <strong>Cal.com</strong> to connect all
              your calendars to your AI Receptionist’s smooth operations.
            </p>

            {/* <hr /> */}

            <div className={styles.guideSection}>
              <Accordion
                className="CallAccordion connectCalender"
                expanded={expanded === "panel2"}
                onChange={handleChange("panel2")}
              >
                <AccordionSummary id="panel2bh-header">
                  <Typography
                    component="span"
                    sx={{ width: "80%", flexShrink: 0 }}
                  >
                    <p className={styles.ShowClick}>
                      <strong>
                        <a href="#">Why Cal.com Account</a>
                      </strong>{" "}
                      for Calendar Connection?
                    </p>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className="AccorParaPadig">
                  <Typography>
                    <p className={styles.AccorPara}>
                      We have spent significant time & effort to build{" "}
                      <strong>the best Agentic AI Receptionist </strong>{" "}
                      service. Our goal is to democratize the AI Receptionist
                      creation for everyone rather the building calendar and
                      meeting management system.<br></br>
                      <br></br>
                      So we partnered with the best scheduling platform for
                      seamless integration of your calendars.
                    </p>
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <a href="/calinfo" target="_blank" rel="noopener noreferrer">
                <button className={styles.guideButton}>
                  <div>
                    <h6>Guide to Connect</h6>

                    <p className={styles.paraTest}>
                      your agent to Cal.com Account
                    </p>
                  </div>
                  <div className={styles.playIcon}>
                    {/* <img src='/images/PlayBox.png'/> */}
                    <svg
                      width="55"
                      height="55"
                      viewBox="0 0 67 65"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect x="2" width="65" height="65" rx="16" fill="#5F33E1" />
                      <path
                        d="M25.1855 21.8388C25.1855 16.4934 31.6484 13.8164 35.4282 17.5962L46.1284 28.2964C48.4716 30.6396 48.4716 34.4385 46.1284 36.7817L35.4282 47.4819C31.6484 51.2617 25.1855 48.5847 25.1855 43.2393V32.5391V21.8388Z"
                        fill="#E0E5F2"
                      />
                    </svg>
                  </div>
                </button>
              </a>
            </div>
          </div>
        )}
        {showEventModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalBox}>
              <h2>Create Cal Event</h2>

              <label>Event Name</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Meeting with John"
              />

              <label>Slug (Description)</label>
              <input
                type="text"
                value={eventSlug}
                onChange={(e) => setEventSlug(e.target.value)}
                placeholder="Follow-up session"
              />

              <label>Length (in minutes)</label>
              <input
                type="number"
                value={eventLength}
                onChange={(e) => setEventLength(e.target.value)}
                placeholder="30"
              />

              <div className={styles.modalActions}>
                <button onClick={() => setShowEventModal(false)}>Cancel</button>
                <button onClick={createCalEvent} disabled={eventLoading}>
                  {eventLoading ? "Creating..." : "Create Event"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <PopUp
        type={popup.type}
        message={popup.message}
        onClose={() => setPopup({ type: "", message: "" })}
      />
    </div>
  );
};

export default CalendarConnect;
