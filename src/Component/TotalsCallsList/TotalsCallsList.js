// pages/index.js
import { useContext, useEffect, useState } from "react";
import styles from "./TotalsCallsList.module.css";
import HeaderFilter from "../HeaderFilter/HeaderFilter";
import axios from "axios";
import {
  API_BASE_URL,
  getAgentCalls,
  getAgentCallsByMonth,
  getAllAgentCalls,
  getUserCallsByMonth,
  sendAgentCallsByMonth,
  sendUserAgentCallsByMonth,
} from "../../Store/apiStore";
import Loader from "../Loader/Loader";
import Loader2 from "../Loader2/Loader2";
import { useLocation, useNavigate } from "react-router-dom";
import { RefreshContext } from "../PreventPullToRefresh/PreventPullToRefresh";
import { red } from "@mui/material/colors";
import PopUp from "../Popup/Popup";
import { DateTime } from "luxon";
const options = [
  { id: 1, label: "All", imageUrl: "svg/ThreOpbtn.svg" },
  { id: 2, label: "Positive", imageUrl: "svg/greendot.svg" },
  { id: 3, label: "Neutral", imageUrl: "svg/yellodot.svg" },
  { id: 4, label: "Negative", imageUrl: "svg/reddot.svg" },
];

const callsPerPage = 6;
export default function Home() {
  const location = useLocation();
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const totalAgentView = localStorage.getItem("filterType");
  const sessionAgentId = sessionStorage.getItem("agentId") || "";
  const [refresh, setRefresh] = useState(false);
  const isRefreshing = useContext(RefreshContext);
  const [agentId, setAgentId] = useState(
    totalAgentView === "all" ? "all" : sessionAgentId || ""
  );
  const [data, setData] = useState([]);
  console.log(data, "DAYTA")
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [selectedSentiment, setSelectedSentiment] = useState(
    sessionStorage.getItem("selectedfilterOption") || "All"
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token") || "";
  const fetchAgents = JSON.parse(
    sessionStorage.getItem("dashboard-session-storage")
  );
  const [filters, setFilters] = useState({ leadType: [], channel: "" });
  const userId = localStorage.getItem("userId") || "";
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loadedMonths, setLoadedMonths] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");
  const [loadMoreAvailable, setloadMoreAvailable] = useState(false);

  const [showPopUp, setShowPopUp] = useState(false);
  const [popUpMessage, setPopUpMessage] = useState("");
  const [popUpType, setPopUpType] = useState("");
  useEffect(() => {
    const storedYear = sessionStorage.getItem("selectedYear");
    const storedMonth = sessionStorage.getItem("selectedMonth");

    if (storedYear && storedMonth) {
      setSelectedYear(storedYear);
      setSelectedMonth(storedMonth);
    } else {
      setSelectedYear("");
      setSelectedMonth("");
    }
    fetchCalls(currentMonth, currentYear);
  }, [agentId, refresh]);

  const fetchCalls = async (month, year, append = false) => {
    try {
      setLoading(true);
      let res;
      if (agentId === "all") {
        res = await getUserCallsByMonth(userId, month, year);
      } else {
        res = await getAgentCallsByMonth(agentId, month, year);
      }

      if (res.status == false) {
        setLoadMoreError(res.error || "No more calls to load");
      }
      const newCalls = res?.calls || [];
      setData((prev) => (append ? [...prev, ...newCalls] : newCalls));

      // Month store

      setLoadedMonths((prev) => [...prev, `${month}-${year}`]);

      setloadMoreAvailable(res.hasRecordingsLastMonths);
    } catch (err) {
      console.error("Error fetching calls:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls(currentMonth, currentYear);
  }, [agentId, refresh]);

  const loadMore = () => {
    let month = currentMonth - 1;
    let year = currentYear;

    if (month < 1) {
      month = 12;
      year = year - 1;
    }
    setCurrentMonth(month);
    setCurrentYear(year);

    // Avoid duplicate fetch
    if (!loadedMonths.includes(`${month}-${year}`)) {
      fetchCalls(month, year, true);
    }
  };

  const convertMsToMinSec = (durationMs) => {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes} min ${seconds} sec`;
  };
  const getTimeFromTimestamp = (timestamp, timezone) => {
    if (!timestamp) return "-";
    return DateTime.fromMillis(timestamp)
      .setZone(timezone || "UTC")
      .toFormat("hh:mm:ss a");
  };
  const getDateFromTimestamp = (timestamp, timezone) => {
    if (!timestamp) return "-";
    return DateTime.fromMillis(timestamp)
      .setZone(timezone || "UTC")
      .toFormat("yyyy-MM-dd");
  };
  const filteredData = data?.filter((call) => {

    const sentimentMatch =
      selectedSentiment === "All" ||
      call?.user_sentiment === selectedSentiment ||
      call?.call_analysis?.user_sentiment === selectedSentiment;
    const inDateRange = (() => {
      if (!selectedDateRange.startDate || !selectedDateRange.endDate)
        return true;

      const startDate = new Date(selectedDateRange.startDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(selectedDateRange.endDate);
      endDate.setHours(23, 59, 59, 999);

      return (
        call.end_timestamp >= startDate.getTime() &&
        call.end_timestamp <= endDate.getTime()
      );
    })();
    const leadTypeMatch =
      !filters ||
      !Array.isArray(filters?.leadType) ||
      filters?.leadType.length === 0 ||
      filters?.leadType.includes(
        call.custom_analysis_data?.lead_type ||
        call?.call_analysis?.custom_analysis_data?.lead_type
      );
    const channelMatch =
      filters?.channel === "" || call?.call_type === filters?.channel;
        // Chat type filter: show only api_chat if selectedSentiment is "Chat" or your custom label
  // const chatTypeMatch =
  //   selectedSentiment.toLowerCase() === "chat"
  //     ? call.call_type === "api_chat"
  //     : true
  //   console.log(chatTypeMatch,"chatTypeMatchchatTypeMatch")
    return sentimentMatch && inDateRange && leadTypeMatch && channelMatch;
  });
  // Pagination
  const totalPages = Math.ceil(filteredData?.length / callsPerPage);
  const indexOfLastCall = currentPage * callsPerPage;
  const indexOfFirstCall = indexOfLastCall - callsPerPage;
  const currentCalls = filteredData.slice(indexOfFirstCall, indexOfLastCall);
  console.log(currentCalls,"currentCallscurrentCalls")
  console.log(currentCalls)
  // Handle page change
  const handlePageChange = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
  };
  const navigate = useNavigate();
  const formattedDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };
  const getSentimentClass = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return styles.fromGreen;
      case "negative":
        return styles.fromRed;
      case "neutral":
        return styles.fromYellow;
      default:
        return "";
    }
  };
  const handleExportClick = () => {
    setShowExportModal(true);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setSelectedMonth("");
    sessionStorage.removeItem("selectedYear");
    sessionStorage.removeItem("selectedMonth");
  };

  const handleMonthSelect = async (month) => {
    setSelectedMonth(month);
    setIsLoadingSubmit(true);
    sessionStorage.setItem("selectedYear", selectedYear);
    sessionStorage.setItem("selectedMonth", month);

    try {
      let response;
      if (agentId === "all") {
        response = await sendUserAgentCallsByMonth(userId, month, selectedYear);
      } else {
        response = await sendAgentCallsByMonth(agentId, month, selectedYear);
      }
      if (response.status === false) {
        setPopUpMessage(response.error);
        setPopUpType("failed");
      } else {
        setPopUpMessage(
          "Your call details have been successfully sent to your email. You can expect to receive them within the next 10 to 15 minutes."
        );
        setPopUpType("success");
      }
      setShowPopUp(true);
      setShowExportModal(false);
      sessionStorage.removeItem("selectedYear");
      sessionStorage.removeItem("selectedMonth");
      setSelectedYear("");
      setSelectedMonth("");
    } catch (error) {
      setPopUpMessage("No call data found for this selected month.");
      setPopUpType("failed");
      setShowPopUp(true);
      console.error("Error during email sending:", error);
    } finally {
      setIsLoadingSubmit(false);
    }
  };
  // const handleChatFilter = (filterType) => {
  //   setSelectedSentiment(filterType); // Update the selected sentiment
  //   setCurrentPage(1);                // Reset pagination
  // };
// useEffect(() => {
//   const queryParams = new URLSearchParams(location.search);
//   const filterParam = queryParams.get("filter");

//   if (filterParam === "chatHistory") {
//     // alert("ok")
//     // make sure it matches the logic in filteredData
//     setSelectedSentiment("Chat"); // sets the filter to only show api_chat
//     setCurrentPage(1); // reset pagination
//   }
// }, [location.search]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <HeaderFilter
          options={options}
          selectedSentiment={selectedSentiment}
          onFilter={(label) => {
            setSelectedSentiment(label);
            setCurrentPage(1);
          }}
          isAgents={fetchAgents?.state?.agents}
          onRangeChange={(range) => {
            setSelectedDateRange(range);
            setCurrentPage(1);
          }}
          selectedAgentId={agentId}
          onAgentChange={(newAgentId) => {
            setRefresh((prev) => !prev);
            setCurrentMonth(new Date().getMonth() + 1);
            setCurrentYear(new Date().getFullYear());
            setLoadedMonths([]);
            setAgentId(newAgentId);
            sessionStorage.setItem("agentId", newAgentId);
            localStorage.setItem("filterType", "agent");
            setLoadMoreError("");
            setCurrentPage(1);
          }}
          isCallSummary={data}
          filters={filters}
          onFilterChange={(newFilters) => {
            setFilters(newFilters);
            setCurrentPage(1);
          }}
          // onChatFilter={handleChatFilter} // ✅ Pass the function here

        />
        <button className={styles.exportButton} onClick={handleExportClick}>
          Export
        </button>
        {showExportModal && (
          <div className={styles.exportModal}>
            <div className={styles.modalContent}>
              <h3>Select Year and Month</h3>
              <div className={styles.selectContainer}>
                <select
                  value={selectedYear}
                  onChange={(e) => handleYearSelect(e.target.value)}
                  className={styles.yearSelect}
                >
                  <option value="">Select Year</option>
                  {[2025].map(
                    (year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  )}
                </select>

                {selectedYear && (
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className={styles.monthSelect}
                  >
                    <option value="">Select Month</option>
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((month, index) => (
                      <option key={index} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className={styles.buttonsContainer}>
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowExportModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitButton}
                  onClick={() => handleMonthSelect(selectedMonth)}
                  disabled={isLoadingSubmit}
                >
                  {isLoadingSubmit ? <Loader size={16} /> : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>From</th>
                <th>Lead Type</th>
                <th>Sentiment</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    <Loader2 />
                  </td>
                </tr>
              ) : currentCalls.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No data found
                  </td>
                </tr>
              ) : (
                currentCalls.map((call, i) => (
                  <tr
                    key={i}
                    className={styles.clickableRow}
                    onClick={() => {
                      if (!call.call_id) {
                        console.warn("Missing call_id for this call:", call);
                        return;
                      }
                      navigate(`/call-details/${call.call_id}`, {
                        state: {
                          agentId: call.agent_id,
                          start_timestamp: call.start_timestamp,
                        },
                      });
                    }}
                  >
                    <td>
                      {" "}
                      <div className={styles.callDateTime}>
                        <div>
                          {" "}
                          {call?.end_timestamp
                            ? getTimeFromTimestamp(call?.end_timestamp, call?.timezone)
                            : "-"}{" "}
                        </div>
                        <div className={styles.callDate}>
                          {" "}
                          {call?.end_timestamp
                            ? getDateFromTimestamp(call?.end_timestamp, call?.timezone)
                            : "-"}{" "}
                        </div>
                      </div>
                    </td>
                    <td>
                      {call.call_type == "api_chat" ? call?.duration_ms : call?.duration_ms
                        ? convertMsToMinSec(call.duration_ms)
                        : "-"}
                    </td>
                    <td>
                      {" "}
                      <p
                        className={`${styles.fromNumber} ${getSentimentClass(
                          call.user_sentiment ||
                          call?.call_analysis?.user_sentiment
                        )}`}
                      >
                        {call?.call_type == "phone_call"
                          ? call?.from_number
                          : call?.call_type}{" "}
                      </p>
                    </td>

                    <td>
                      {(() => {
                        const leadType =
                          call?.custom_analysis_data?.lead_type ||
                          call?.call_analysis?.custom_analysis_data
                            ?.lead_type ||
                          "-";
                        return (
                          leadType.charAt(0).toUpperCase() + leadType.slice(1)
                        );
                      })()}
                    </td>

                    <td>
                      {(() => {
                        const sentiment =
                          call?.user_sentiment ||
                          call?.call_analysis?.user_sentiment ||
                          "-";
                        return (
                          sentiment.charAt(0).toUpperCase() + sentiment.slice(1)
                        );
                      })()}
                    </td>

                    {/* <td className={styles.CallName}>-</td>
                    <td>
                      <div className={styles.actionIcons}>
                    
                        <svg
                          width="26"
                          height="23"
                          viewBox="0 0 26 23"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M19.8254 17.0938L16.9809 14.2493C15.9707 13.2391 14.2427 13.6378 13.8173 14.9671C13.5249 15.8709 12.4881 16.4026 11.5842 16.1899C9.5638 15.6848 6.79901 13.0264 6.29391 10.8996C6.00148 9.99576 6.58634 8.95896 7.51679 8.66653C8.84601 8.26777 9.24478 6.53979 8.23458 5.50299L5.39004 2.65845C4.56592 1.94067 3.36962 1.94067 2.65184 2.65845L0.711169 4.59911C-1.2295 6.61953 0.923848 12.0162 5.68247 16.8014C10.4411 21.5866 15.8377 23.8197 17.8847 21.7727L19.8254 19.832C20.5432 19.0345 20.5432 17.8116 19.8254 17.0938Z"
                            fill="#B5A0F3"
                          />
                          <path
                            d="M22.749 19.2471H21.5527V17.7584H22.749C23.4668 17.7584 24.0517 17.1736 24.0517 16.4558V2.79137C24.0517 2.07359 23.4668 1.48872 22.749 1.48872H14.6673C13.9496 1.48872 13.3647 2.07359 13.3647 2.79137V13.691H11.876V2.79137C11.876 1.24947 13.1254 0 14.6673 0H22.749C24.2909 0 25.5404 1.24947 25.5404 2.79137V16.4558C25.5404 17.9977 24.2909 19.2471 22.749 19.2471Z"
                            fill="#5F33E1"
                          />
                          <path
                            d="M21.9531 4.12109H15.626V5.60982H21.9531V4.12109Z"
                            fill="#5F33E1"
                          />
                          <path
                            d="M21.9531 7.7627H15.626V9.25142H21.9531V7.7627Z"
                            fill="#5F33E1"
                          />
                          <path
                            d="M21.9531 11.4053H15.626V12.894H21.9531V11.4053Z"
                            fill="#5F33E1"
                          />
                        </svg>
                      </div>
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* <>{(currentPage == totalPages || loadMoreAvailable) && (
          
        )}></> */}
        <div className={styles.bottomBar}>
          {loadMoreError && (
            <span className={styles.error}>{loadMoreError}</span>
          )}
          <button onClick={loadMore} disabled={loading}>
            Load More
          </button>
        </div>
        {/* Pagination */}
        {filteredData.length > 0 && (
          <>
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </button>

              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={
                      currentPage === pageNum ? styles.pageButtonActive : ""
                    }
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          </>
        )}
      </div>
      {showPopUp && (
        <PopUp
          type={popUpType}
          message={popUpMessage}
          onClose={() => setShowPopUp(false)}
          onConfirm={() => {
            setShowPopUp(false);
          }}
        />
      )}
    </div>
  );
}
