import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "./AgentAnalysis.module.css";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  API_BASE_URL,
  getAgentCallsByMonth,
  getAppointments,
} from "../../../Store/apiStore";
import { useNavigate } from "react-router-dom";

import {
  useCallHistoryStore,
  useCallHistoryStore1,
} from "../../../Store/useCallHistoryStore ";
import { DateTime } from "luxon";
// Helper function to format date

import decodeToken from "../../../lib/decodeToken"; // ⬅️ NEW
function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function toDateSafe(value) {
  if (!value && value !== 0) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const asNum = Number(value);
  if (!Number.isNaN(asNum)) {
    const ms = asNum < 1e12 ? asNum * 1000 : asNum;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}
function formatTimeLikeClock(value) {
  const d = toDateSafe(value);
  if (!d) return "00:00";
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
// build Date from (YYYY-MM-DD) + ("HH:mm:ss"|"HH:mm")
function joinDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  // normalize "06:00:00" -> "06:00"
  const [hh = "00", mm = "00"] = timeStr.split(":");
  return `${dateStr}T${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:00`;
}
// --------------------------------

const AgentAnalysis = ({ data, callVolume, agentId, calApiKey, eventId }) => {
  const [callHistory, setCallHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [callsForSelectedDate, setCallsForSelectedDate] = useState([]);
  // console.log(callsForSelectedDate, "callsForSelectedDate");
  const { mergeCallHistoryData } = useCallHistoryStore1();
  const [itemsForSelectedDate, setItemsForSelectedDate] = useState([]);
  const [dateMap, setDateMap] = useState({}); // ⬅️ merged map: { "YYYY-MM-DD": [ items ] }
  const bookingsRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token") || "";
  const userId = decodeToken(token)?.id || ""; // ⬅️ for DB appointments
  const today = new Date();
  const dayName = today.toLocaleDateString("en-GB", { weekday: "long" });
  const dateString = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // ---- Calls (per month) ----
  const fetchCallHistory = async (m, y) => {
    if (!agentId) {
      setCallHistory([]);
      return;
    }
    try {
      if (!agentId) return;
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const response = await getAgentCallsByMonth(agentId, month, year);
      // console.log('response,response',response)
      setCallHistory(response?.calls || []);
    } catch (error) {
      // console.error("Error fetching call history:", error);

      setCallHistory([]);
    }
  };

  useEffect(() => {
    const d = new Date();
    fetchCallHistory(d.getMonth() + 1, d.getFullYear());
  }, [agentId]);

  // ---- Cal.com bookings (optional) ----
  const fetchCalBookings = async () => {
    if (!calApiKey) return [];
    try {
      const resp = await fetch(
        `https://api.cal.com/v1/bookings?apiKey=${encodeURIComponent(
          calApiKey
        )}`
      );
      if (!resp.ok) throw new Error("Cal.com fetch failed");
      const json = await resp.json();
      let arr = json?.bookings || [];
      if (eventId) {
        arr = arr.filter((b) => Number(b.eventTypeId) === Number(eventId));
      }
      // Normalize
      return arr.map((b) => ({
        type: "meeting",
        id: b.id ?? b.uid ?? `cal_${b.startTime}`,
        title: b.title || b.eventType?.title || "Cal Booking",
        startTime: b.startTime, // ISO
        endTime: b.endTime,
      }));
    } catch (e) {
      console.error("Cal.com booking error:", e);
      return [];
    }
  };

  // ---- DB Appointments ----
  const fetchDbAppointments = async () => {
    if (!userId) return [];
    try {
      // Pass agentId to limit to this agent; or null for all of user's agents.
      const res = await getAppointments(userId, agentId || null);
      const list = Array.isArray(res?.data) ? res.data : [];
      return list.map((appt) => {
        // Build an ISO-ish startTime from date & time fields
        const start =
          appt?.startTime ||
          joinDateTime(appt?.appointmentDate, appt?.appointmentTime);
        return {
          type: "db-appointment",
          id: appt.id ?? `db_${start}`,
          title: appt?.reason
            ? `${appt.reason}${
                appt?.attendeeName ? ` — ${appt.attendeeName}` : ""
              }`
            : `Appointment${
                appt?.attendeeName ? ` — ${appt.attendeeName}` : ""
              }`,
          startTime: start,
          endTime: null,
          icsFile: appt?.icsFile || null,
          raw: appt,
        };
      });
    } catch (e) {
      console.error("DB appointments error:", e);
      return [];
    }
  };

  // ---- Build merged date map (calls + cal + db) ----
  const rebuildDateMap = async () => {
    // Calls -> normalized
    const callItems = (callHistory || []).map((c, i) => ({
      type: "call",
      id: c.call_id || `call_${i}`,
      title: c?.custom_analysis_data?.name
        ? `Caller — ${c.custom_analysis_data.name}`
        : "Caller",
      startTime: c.start_timestamp,
      endTime: c.end_timestamp || null,
      raw: c,
    }));

    const [calItems, dbItems] = await Promise.all([
      fetchCalBookings(),
      fetchDbAppointments(),
    ]);

    const merged = [...callItems, ...calItems, ...dbItems];

    const map = merged.reduce((acc, item) => {
      const d = toDateSafe(item.startTime);
      if (!d) return acc;
      const key = formatDateISO(d);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    setDateMap(map);
    setItemsForSelectedDate(map[formatDateISO(selectedDate)] || []);
  };

  // Rebuild when inputs change
  useEffect(() => {
    rebuildDateMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callHistory, calApiKey, eventId, selectedDate, userId]);

  // ---- UI handlers ----
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setItemsForSelectedDate(dateMap[formatDateISO(date)] || []);
    if (bookingsRef.current) {
      bookingsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // ---- calendar dots (green = bookings, orange = calls) ----
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const items = dateMap[formatDateISO(date)] || [];
    const calls = items.filter((x) => x.type === "call").length;
    const bookings = items.filter((x) => x.type !== "call").length;
    const cap = (n) => (n > 99 ? "99+" : n);

    return (
      <div className={styles.bookingDotContainer}>
        {bookings > 0 && (
          <div className={`${styles.dot} ${styles.greenDot}`}>
            {cap(bookings)}
          </div>
        )}
        {calls > 0 && (
          <div className={`${styles.dot} ${styles.orangeDot}`}>
            {cap(calls)}
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

      {itemsForSelectedDate.length > 0 && (
        <div className={styles.bookingsList} ref={bookingsRef}>
          <h3>Items for {selectedDate.toDateString()}:</h3>
          <ul>
            {itemsForSelectedDate
              .sort((a, b) => {
                const da = toDateSafe(a.startTime)?.getTime() || 0;
                const db = toDateSafe(b.startTime)?.getTime() || 0;
                return da - db;
              })
              .map((item) => {
                const isCall = item.type === "call";
                const isDb = item.type === "db-appointment";
                const timeLabel = formatTimeLikeClock(item.startTime);
                return (
                  <li
                    key={`${item.type}_${item.id}`}
                    className={styles.bookingCard}
                    onClick={() => {
                      if (isCall && item.raw?.call_id) {
                        navigate(`/call-details/${item.raw.call_id}`, {
                          state: {
                            agentId: item.raw.agent_id,
                            start_timestamp: item.raw.start_timestamp,
                          },
                        });
                      }
                    }}
                    style={{
                      cursor:
                        isCall && item.raw?.call_id ? "pointer" : "default",
                    }}
                  >
                    <div className={styles.time}>
                      {
                        item.type === "call"
                          ? [
                              getTimeFromTimestamp(
                                item?.raw?.start_timestamp,
                                item?.raw?.timezone
                              ),
                              item?.raw?.end_timestamp
                                ? ` - ${getTimeFromTimestamp(
                                    item?.raw?.end_timestamp,
                                    item?.raw?.timezone
                                  )}`
                                : "",
                            ].join("")
                          : timeLabel
                      }
                    </div>

                    <div className={styles.detailColumn}>
                      <div className={styles.line}>
                        <span className={styles.titleText}>
                          <b>{isCall ? "Caller:" : "Title:"}</b>{" "}
                          {isDb ? item.title : item.title || "N/A"}
                        </span>
                      </div>

                      {/* show phone / call type for calls */}
                      {isCall && (
                        <div className={styles.timeRange}>
                          <b>Phone:</b> 


                               {item.raw?.call_type === "phone_call"
                    ? item.raw?.from_number
                    : item.raw?.call_type === "api_chat"
                      ? "chat"
                      : item.raw?.chat_type === "api_chat"
                        ? "chat"
                        : item.raw?.call_type}
                        </div>
                      )}
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
