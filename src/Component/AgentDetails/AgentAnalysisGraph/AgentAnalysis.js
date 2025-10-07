import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "./AgentAnalysis.module.css";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import { API_BASE_URL, getAgentCalls, getAgentCallsByMonth } from "../../../Store/apiStore";
import { useNavigate } from "react-router-dom";
import { useCallHistoryStore, useCallHistoryStore1 } from "../../../Store/useCallHistoryStore ";
import { DateTime } from "luxon";
// Helper function to format date
function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Helper function to format time
function formatTime(isoDate) {
  const date = new Date(isoDate);
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
}

const AgentAnalysis = ({ data, callVolume, agentId }) => {
  const [callHistory, setCallHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [callsForSelectedDate, setCallsForSelectedDate] = useState([]);
  console.log(callsForSelectedDate, "callsForSelectedDate")
  const { mergeCallHistoryData } = useCallHistoryStore1();
  const bookingsRef = useRef(null);

  const token = localStorage.getItem("token") || "";
  const today = new Date();

  const dayName = today.toLocaleDateString("en-GB", { weekday: "long" });
  const dateString = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }); // 09 July 2025

  // Fetch Call History
  const fetchCallHistory = async () => {
    try {
      if (!agentId) return;
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      // const response = await axios.get(
      //   `${API_BASE_URL}/agent/getAgentCallHistory/${agentId}`,
      //   {
      //     headers: { Authorization: `Bearer ${token}` },
      //   }
      // );
      // const agentCalls = response.data.filteredCalls || [];
      // const response=await getAgentCalls(agentId) ||[]
      const response = await getAgentCallsByMonth(agentId, month, year)
      // console.log('response,response',response)

      setCallHistory(response?.calls || []);
    } catch (error) {
      // console.error("Error fetching call history:", error);
      setCallHistory([]);
    }
  };

  useEffect(() => {
    fetchCallHistory();
  }, [agentId]);

  // Handle Date Click
  const handleDateClick = (date) => {
    setSelectedDate(date);

    const dateStr = formatDateISO(date);
    const callsForDate = callHistory.filter(
      (call) => formatDateISO(new Date(call.start_timestamp)) === dateStr
    );
    setCallsForSelectedDate(callsForDate);

    if (bookingsRef.current) {
      bookingsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
  const navigate = useNavigate();

  // Calendar Tile Content (only shows orange dots for calls)
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dateStr = formatDateISO(date);
    const callsForDate = callHistory.filter(
      (call) => formatDateISO(new Date(call.start_timestamp)) === dateStr
    );

    const callCount = callsForDate.length;
    return (
      <div className={styles.bookingDotContainer}>
        {callCount > 0 && (
          <div className={`${styles.dot} ${styles.orangeDot}`}>
            {callCount > 99 ? "99+" : callCount}
          </div>
        )}
      </div>
    );
  };

  const handleMonthChange = async (month, year) => {
    try {
      if (agentId) {
        const res = await getAgentCallsByMonth(agentId, month, year);
        setCallHistory(res.calls || []);
      }

    } catch (error) {
      console.error("Error fetching month data:", error);
      setCallHistory([]);
    }
  };
  const getTimeFromTimestamp = (timestamp, timezone) => {
    if (!timestamp) return "-";
    return DateTime.fromMillis(timestamp)
      .setZone(timezone || "UTC")
      .toFormat("hh:mm:ss a");
  };
  return (
    <div className={styles.container}>
      <div className={styles.CallFlex}>
        <div className={styles.callVolume}>
          {callVolume ? callVolume : "0"} <span>Call Volume</span>
        </div>
        <div className={styles.trend}>
          Last 7 Days <span className={styles.positive}>+15%</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={data}>
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#6A0DAD"
                floodOpacity="0.4"
              />
            </filter>
          </defs>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="calls"
            stroke="#6A0DAD"
            strokeWidth={2}
            dot={false}
            strokeLinecap="round"
            strokeOpacity={1}
            isAnimationActive={true}
            filter="url(#shadow)"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className={styles.CalendarTopPin}>
        <img src="/svg/Calendar-Top-pin.svg" alt="Calendar-Top-pin" />

        <div className={styles.calendarSection}>
          <h1 className={styles.CalendarTitleWeek}>
            {dayName}
            <p className={styles.CalendarTitleDate}>{dateString}</p>
          </h1>

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
      </div>

      {callsForSelectedDate.length > 0 && (
        <div className={styles.bookingsList} ref={bookingsRef}>
          <h3>Calls for {selectedDate.toDateString()}:</h3>

          <ul>
            {callsForSelectedDate.map((call, index) => {
              return (
                <li
                  key={index}
                  className={styles.bookingCard}
                  onClick={() => {
                    if (call.call_id) {
                      // navigate(`/call-details/${call.call_id}`);
                      navigate(`/call-details/${call.call_id}`, {
                        state: {
                          agentId: call.agent_id,
                          start_timestamp: call.start_timestamp
                        }
                      });

                    }
                  }}
                  style={{ cursor: call.call_id ? "pointer" : "default" }}
                >
                  <div className={styles.time}>
                    {getTimeFromTimestamp(call.start_timestamp, call?.timezone)}{" "}
                    {call.end_timestamp &&
                      `- ${getTimeFromTimestamp(call.end_timestamp, call?.timezone)}`}
                  </div>

                  <div className={styles.detailColumn}>
                    <div className={styles.line}>
                      <span className={styles.titleText}>
                        <b>Caller:</b>{" "}
                        {call.custom_analysis_data
                          ? call.custom_analysis_data[
                          "name"
                          ] || "N/A"
                          : "N/A"}
                      </span>
                    </div>
                    <div className={styles.timeRange}>
                      <b>Phone:</b> {call.call_type}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AgentAnalysis;
