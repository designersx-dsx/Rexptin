import React, { useState, useEffect, useRef, useContext } from "react";
import Calendar from "react-calendar";
import HeaderBar from "../HeaderBar/HeaderBar";
import "react-calendar/dist/Calendar.css";
import styles from "./Clender.module.css";
import Footer2 from "../AgentDetails/Footer/Footer2";
import decodeToken from "../../lib/decodeToken";
import {
  API_BASE_URL,
  fetchDashboardDetails,
  getAgentCallsByMonth,
  getUserCallsByMonth,
  getAppointments,
} from "../../Store/apiStore";
import axios from "axios";
import { data, useNavigate } from "react-router-dom";
import { useCallHistoryStore } from "../../Store/useCallHistoryStore ";
import { RefreshContext } from "../PreventPullToRefresh/PreventPullToRefresh";

function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toDateSafe(value) {
  if (!value && value !== 0) return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  const asNum = Number(value);
  if (!Number.isNaN(asNum)) {
    const ms = asNum < 1e12 ? asNum * 1000 : asNum;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatTime(value) {
  const d = toDateSafe(value);
  if (!d) return "00:00"; // graceful fallback
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

const AgentAnalysis = () => {
  const [agents, setAgents] = useState([]);
  const [calApiKey, setCalApiKey] = useState(null);
  const [bookingDates, setBookingDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookingsForSelectedDate, setBookingsForSelectedDate] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [apiCallHistory, setapiCallHistory] = useState([]);
  const bookingsRef = useRef(null);
  const [hydrated, setHydrated] = useState(false);
  const isRefreshing = useContext(RefreshContext);

  const token = localStorage.getItem("token") || "";
  const decodeTokenData = decodeToken(token);
  const userId = decodeTokenData?.id || "";
  const [selectedAgentEventId, setSelectedAgentEventId] = useState("");
  const { callHistory, totalCalls, hasFetched, setCallHistoryData } =
    useCallHistoryStore.getState();

  useEffect(() => {
    const unsub = useCallHistoryStore.persist.onFinishHydration(() => {
      setHydrated(true);
      fetchCallHistory();
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const foundAgent = agents.find((a) => a.agent_id === selectedAgentId);
    setSelectedAgentEventId(foundAgent?.eventId || "");
  }, [selectedAgentId, agents]);

  const fetchUserAgents = async () => {
    if (!userId) return;
    try {
      const res = await fetchDashboardDetails(userId, token);
      setAgents(res?.agents);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    const sessionData = sessionStorage.getItem("dashboard-session-storage");
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        const agents = parsed?.state?.agents || [];
        setAgents(agents);
        const foundKey = agents.find((a) => a.calApiKey)?.calApiKey;
        if (foundKey) setCalApiKey(foundKey);
      } catch (e) {
        console.error("Failed to parse session storage:", e);
      }
    }
  }, []);

  const fetchCallHistory = async () => {
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      if (selectedAgentId === "") {
        const res = await getUserCallsByMonth(userId, month, year);
        const allCalls = res.calls || [];
        setCallHistoryData(allCalls);
        setapiCallHistory(allCalls);
      } else {
        const response = await getAgentCallsByMonth(
          selectedAgentId,
          month,
          year
        );
        const agentCalls = response.calls || [];
        setCallHistoryData(agentCalls);
        setapiCallHistory(agentCalls);
      }
    } catch (error) {
      console.error("Error fetching call history:", error);
      setCallHistoryData([]);
      setapiCallHistory([]);
    }
  };

  useEffect(() => {
    fetchCallHistory();
  }, [selectedAgentId, agents]);

  // Builds the map from Calls + Cal.com
  const fetchBookingDates = async () => {
    const filteredCalls = selectedAgentId
      ? callHistory.filter(
          (call) => String(call.agent_id) === String(selectedAgentId)
        )
      : callHistory || apiCallHistory;

    const bookingsMap = {};

    // Calls
    filteredCalls.forEach((call) => {
      const callDate = formatDateISO(new Date(call.start_timestamp));
      if (!bookingsMap[callDate]) bookingsMap[callDate] = [];
      bookingsMap[callDate].push({ ...call, type: "call" });
    });

    // Cal.com
    if (calApiKey) {
      try {
        const response = await fetch(
          `https://api.cal.com/v1/bookings?apiKey=${encodeURIComponent(
            calApiKey
          )}`
        );
        const bookingsData = await response.json();

        const selectedAgent = agents.find(
          (a) => String(a.agent_id) === String(selectedAgentId)
        );
        const selectedEventId = selectedAgent?.eventId;

        bookingsData.bookings?.forEach((booking) => {
          const date = new Date(booking.startTime);
          const formattedDate = formatDateISO(date);

          const match =
            selectedEventId &&
            Number(booking.eventTypeId) === Number(selectedEventId);
          const shouldInclude = !selectedAgentId || match;

          if (shouldInclude) {
            if (!bookingsMap[formattedDate]) bookingsMap[formattedDate] = [];

            const attendeeEmailsFromList = (booking.attendees || [])
              .map((a) => a?.email)
              .filter(Boolean);
            const fallbackEmail =
              booking?.responses?.email || booking?.user?.email || null;

            const attendeeEmails =
              attendeeEmailsFromList.length > 0
                ? attendeeEmailsFromList
                : fallbackEmail
                ? [fallbackEmail]
                : [];

            bookingsMap[formattedDate].push({
              ...booking,
              type: "meeting",
              attendeeEmails,
            });
          }
        });
      } catch (error) {
        console.error("Cal.com API fetch failed:", error);
      }
    }
    return bookingsMap;
  };

  const fetchDatabaseAppointments = async (baseMap) => {
    try {
      const res = await getAppointments(userId, selectedAgentId || null);
      if (!res?.success) return baseMap;

      const dbAppointments = res.data || [];
      const mergedMap = { ...baseMap };

      dbAppointments.forEach((appt) => {
        const dateStr = appt.appointmentDate; // e.g., "2025-10-08"
        if (!mergedMap[dateStr]) mergedMap[dateStr] = [];

        // Try typical field names; adjust if your API differs
        const apptTime =
          appt.startTime ||
          appt.appointmentTime || // e.g., "14:30"
          appt.time ||
          null;

        // If we have both date & time, build an ISO-like string; else leave null
        const computedStart =
          dateStr && apptTime
            ? `${dateStr}T${apptTime}`
            : appt.startTime || null;

        mergedMap[dateStr].push({
          ...appt,
          type: "db-appointment",
          startTime: computedStart,
          attendeeEmails: appt.attendeeEmail ? [appt.attendeeEmail] : [],
        });
      });

      return mergedMap;
    } catch (err) {
      console.error("Error fetching database appointments:", err);
      return baseMap;
    }
  };

  // Build everything together
  useEffect(() => {
    const fetchAllBookings = async () => {
      const baseMap = await fetchBookingDates();
      const mergedMap = await fetchDatabaseAppointments(baseMap);

      setBookingDates(mergedMap);
      setBookingsForSelectedDate(mergedMap[formatDateISO(selectedDate)] || []);
    };

    fetchAllBookings();
  }, [calApiKey, selectedDate, selectedAgentId, callHistory, agents, hydrated]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setBookingsForSelectedDate(bookingDates[formatDateISO(date)] || []);
    if (bookingsRef.current) {
      bookingsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
  const navigate = useNavigate();

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const dateStr = formatDateISO(date);
    const items = bookingDates[dateStr] || [];

    const meetingCount = items.filter((i) => i.type === "meeting").length;
    const dbCount = items.filter((i) => i.type === "db-appointment").length;
    const callCount = items.filter((i) => i.type === "call").length;

    const totalBookings = meetingCount + dbCount;
    const formatCount = (count) => (count > 99 ? "99+" : count);

    return (
      <div className={styles.bookingDotContainer}>
        {totalBookings > 0 && (
          <div className={`${styles.dot} ${styles.greenDot}`}>
            {formatCount(totalBookings)}
          </div>
        )}
        {callCount > 0 && (
          <div className={`${styles.dot} ${styles.orangeDot}`}>
            {formatCount(callCount)}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (isRefreshing) {
      useCallHistoryStore.setState({ hasFetched: false });
      fetchCallHistory();
      // rebuilding both maps (calls + cal + db)
      (async () => {
        const baseMap = await fetchBookingDates();
        const mergedMap = await fetchDatabaseAppointments(baseMap);
        setBookingDates(mergedMap);
        setBookingsForSelectedDate(
          mergedMap[formatDateISO(selectedDate)] || []
        );
      })();
    }
  }, [isRefreshing]);

  const handleMonthChange = async (month, year) => {
    try {
      if (selectedAgentId) {
        const res = await getAgentCallsByMonth(selectedAgentId, month, year);
        setCallHistoryData(res.calls || []);
        setapiCallHistory(res.calls || []);
      } else {
        const res = await getUserCallsByMonth(userId, month, year);
        setCallHistoryData(res.calls || []);
        setapiCallHistory(res.calls || []);
      }
    } catch (error) {
      console.error("Error fetching month data:", error);
      setCallHistoryData([]);
      setapiCallHistory([]);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.HeaderFlex}>
        <HeaderBar title="Calendar" backgroundColor="#0000" color="#ffff" />

        {agents.length === 1 ? (
          <div className={styles.DateSecT}>
            <p>Agent</p>
            <div className={styles.singleAgentName}>
              {agents[0].agentName.length > 5
                ? agents[0].agentName.slice(0, 5) + ".."
                : agents[0].agentName}
            </div>
          </div>
        ) : (
          <div className={styles.DateSecT}>
            <p>Agent</p>
            <div className={styles.selectedValue}>
              <select
                className={styles.agentSelect1}
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
              >
                <option value="">All</option>
                {agents.map((agent) => (
                  <option key={agent.agent_id} value={agent.agent_id}>
                    {agent.agentName.length > 10
                      ? agent.agentName.slice(0, 10) + "..."
                      : agent.agentName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className={styles.calendarSection}>
        <div className={styles.DotINfo}>
          <div className={styles.DotOrange}>
            <div className={styles.dot1}></div>
            <span>Calls Received</span>
          </div>
          <hr />
          <div className={styles.DotGreen}>
            <div className={styles.dot}></div>
            <span>Bookings </span>
          </div>
        </div>

        <Calendar
          onChange={handleDateClick}
          value={selectedDate}
          tileContent={tileContent}
          onActiveStartDateChange={({ activeStartDate }) => {
            const m = activeStartDate.getMonth() + 1;
            const y = activeStartDate.getFullYear();
            handleMonthChange(m, y);
          }}
          calendarType="gregory"
          className={styles.reactCalendar}
        />
      </div>

      {bookingsForSelectedDate.length > 0 && (
        <div className={styles.bookingsList} ref={bookingsRef}>
          <h3>{selectedDate.toDateString()}</h3>
          <ul>
            {bookingsForSelectedDate.map((item, index) => {
              const isMeeting = item.type === "meeting";
              const isCall = item.type === "call";
              const isDbAppt = item.type === "db-appointment";

              const dotColorClass = isMeeting
                ? styles.greenBar
                : isCall
                ? styles.orangeBar
                : styles.greenBar;
              const emails =
                item.attendeeEmails && item.attendeeEmails.length
                  ? item.attendeeEmails
                  : [];
              return (
                <li
                  key={index}
                  className={styles.bookingItem}
                  onClick={() => {
                    if (isCall && item.call_id) {
                      navigate(`/call-details/${item.call_id}`, {
                        state: {
                          agentId: item.agent_id,
                          start_timestamp: item.start_timestamp,
                        },
                      });
                    }
                  }}
                  style={{ cursor: isCall ? "pointer" : "default" }}
                >
                  <div className={styles.timeColumn}>
                    <span className={styles.timeLabel}>
                      {formatTime(
                        item.startTime ?? item.start_timestamp ?? null
                      )}
                    </span>
                  </div>

                  <span
                    className={`${styles.verticalBar} ${dotColorClass}`}
                  ></span>

                  <div className={styles.detailColumn}>
                    <div className={styles.line}>
                      <span className={styles.titleText}>
                        <b>{isCall ? "Caller:" : "Title:"}</b>{" "}
                        {isDbAppt
                          ? `${item.reason} by ${item.attendeeName}`
                          : item.title ||
                            item.custom_analysis_data?.name ||
                            item.custom_analysis_data?.[
                              "_detailed _call _summery"
                            ] ||
                            "N/A"}
                      </span>
                    </div>

                    {/* Show Email for Cal.com bookings & DB appointments */}
                    {(isMeeting || isDbAppt) && emails.length > 0 && (
                      <div className={styles.timeRange}>
                        <b>Email:</b> {emails.join(", ")}
                      </div>
                    )}

                    {/* Existing phone row for calls */}
                    {isCall && (
                      <div className={styles.timeRange}>
                        <b>Phone:</b>{" "}
                        {item?.call_type === "phone_call"
                          ? item?.from_number
                          : item?.call_type}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Footer2 />
    </div>
  );
};

export default AgentAnalysis;
