import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "../CallDetails/CallDetails.module.css";
import Loader2 from "../Loader2/Loader2";
import DetailModal from "../DetailModal/DetailModal";
import { useDashboardStore } from "../../Store/agentZustandStore";
import { getAgentCallById } from "../../Store/apiStore";
import { DateTime } from "luxon";
const CallDetails = () => {
  const location = useLocation();   //adding json call history
  const { agentId, start_timestamp } = location.state || {}; //adding json call history
  const [isChatModalOpen, setChatModalOpen] = useState(false);
  const [callData, setCallData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(0);
  const [messagesPerReveal, setMessagesPerReveal] = useState(0);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timezone, setTimezone] = useState("")
  const agentData = JSON.parse(
    sessionStorage.getItem("dashboard-session-storage")
  );
  const { agents, } = useDashboardStore();
  const { callId } = useParams();
  // const agents = agentData?.state?.agents || [];
  const navigate = useNavigate();
  const [audioProgress, setAudioProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };
  const handleAudioProgress = () => {
    const audio = audioRef.current;
    if (audio) {
      const progress = (audio.currentTime / audio.duration) * 100;
      setAudioProgress(progress);
      setCurrentTime(audio.currentTime);
    }
  };

  const handleSeek = (event) => {
    const audio = audioRef.current;
    const seekTime = (event.target.value / 100) * audio.duration;
    audio.currentTime = seekTime;
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""
      }${seconds}`;
  };

  useEffect(() => {
    if (!callId || !agentId || !start_timestamp) return;

    const fetchCallDetails = async () => {
      try {
        // const res = await axios.get(
        //   `https://api.retellai.com/v2/get-call/${callId}`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
        //     },
        //   }
        // );
        const res = await getAgentCallById(agentId, callId, start_timestamp)
        setCallData(res?.call);
        setTimezone(res?.timezone || "")
      } catch (err) {
        console.error("Error fetching call details:", err);
        setError("Could not load call details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCallDetails();
  }, [callId]);

  useEffect(() => {
    if (callData && callData.transcript_object) {
      const transcriptLength = callData.transcript_object.length;
      setMessagesPerReveal(Math.ceil(transcriptLength / 4));
    }
  }, [callData]);

  useEffect(() => {
    setVisibleCount(messagesPerReveal);
  }, [messagesPerReveal]);
  //time
  const time = callData?.end_timestamp || ""
  //date
  const date = callData?.end_timestamp || ""
  //getTimeFromTimestamp
  const getTimeFromTimestamp = () => {
    if (!time) return "-";
    return DateTime.fromMillis(time)
      .setZone(timezone || "UTC")
      .toFormat("hh:mm:ss a");
  };
//getDateFromTimestamp
  const getDateFromTimestamp = () => {
    if (!date) return "-";
    return DateTime.fromMillis(date)
      .setZone(timezone || "UTC")
      .toFormat("yyyy-MM-dd");
  };
  if (!callId) return <p>No call selected.</p>;
  if (loading) return <Loader2 />;
  if (error) return <p>{error}</p>;

  const transcript = callData.transcript_object || [];
  const formattedDate = new Date(callData?.end_timestamp)?.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
  const formattedTime = new Date(callData?.end_timestamp)?.toLocaleTimeString(
    "en-GB",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );
  // console.log('callData',callData)
  let data = callData.call_analysis?.custom_analysis_data;
  let name = data?.name || "";

  let lead_type = data?.lead_type || "";

  const convertMsToMinSec = (durationMs) => {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes} Min ${seconds} Sec`;
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
  const currentAgent = agents.find((a) => a.agent_id === callData?.agent_id);
  return (
    <div className={styles.CallDetailsMain}>
      <div className={styles.forSticky}>
        <header className={styles.header}>
          <div className={styles.profileBack}>
            <svg
              onClick={() => navigate(-1)}
              style={{ cursor: "pointer" }}
              width="50"
              height="50"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="50" height="50" rx="25" fill="#F9F9F9" />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M21.293 25.7071C20.9025 25.3166 20.9025 24.6834 21.293 24.2929L26.9499 18.636C27.3404 18.2455 27.9736 18.2455 28.3641 18.636C28.7546 19.0266 28.7546 19.6597 28.3641 20.0503L23.4144 25L28.3641 29.9497C28.7546 30.3403 28.7546 30.9734 28.3641 31.364C27.9736 31.7545 27.3404 31.7545 26.9499 31.364L21.293 25.7071Z"
                fill="#0A0A0A"
                fill-opacity="0.9"
              />
            </svg>

            <h4 className={styles.headerTitle}>Call Details</h4>
          </div>
        </header>
        <div className={styles.agentCard}>
          <div className={styles.details}>
            <p>Caller Name</p>
            <p>Sentiment</p>
          </div>
          <div className={styles.detail2}>
            <div className={styles.userName}>
              <h2>{name || "Unknown"}</h2>
            </div>
            <div
              className={`${styles.status} ${callData.call_analysis?.user_sentiment === "Positive"
                ? styles.green
                : callData.call_analysis?.user_sentiment === "Neutral"
                  ? styles.yellow
                  : styles.red
                }`}
            >
              <p>{callData.call_analysis?.user_sentiment || "N/A"}</p>
            </div>
          </div>
          <hr className={styles.hrline} />
          <div className={styles.details3}>
            <div className={styles.Part1}>
              <p>{getTimeFromTimestamp()}</p>
              <strong>{getDateFromTimestamp()}</strong>
            </div>
            <div className={styles.Part2}>
              <p>Attended by</p>
              <strong>
                {callData?.agent_id
                  ? formatName(
                    agents.find((a) => a.agent_id === callData.agent_id)
                      ?.agentName
                  ) || "Unknown Agent"
                  : "Loading..."}
              </strong>
            </div>

            <div className={styles.Part3}>
              <p>Durations</p>

              <strong>{convertMsToMinSec(callData.duration_ms)}</strong>
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className={styles.DataMain}>
          <div className={styles.dataTitle}>
            <h2>Data Collected</h2>
          </div>
          <div className={styles.dataCard}>
            <div className={styles.PhoneNumber}>
              <p>Phone number</p>
              <b>{data?.phone_number ? data.phone_number : '-'}</b>
            </div>
            <div className={styles.EmailAddress}>
              <p>Email address</p>
              <b>{data?.email ? data?.email : '-'}</b>
            </div>
            <div className={styles.Address}>
              <p>Address (if collected)</p>
              <b>{data?.address ? data?.address : '-'}</b>
            </div>
            <div className={styles.Reason}>
              <p>Reason</p>
              <b>{data?.reason ? data?.reason : '-'}</b>
            </div>
          </div>
          <div className={styles.moredetailsDiv}>
            <div className={styles.dataTitle}>
              <h2>More Details</h2>
            </div>
            <div></div>
            <div className={styles.channel}>
              <p className={styles.Ptext}>Channel</p>
              <div className={styles.PhoneDiv}>
                <p>{callData.call_type}</p>
              </div>
            </div>
            <div className={styles.channel}>
              <p className={styles.Ptext}>Lead Type</p>
              <div>
                <strong>{lead_type || "Unknown"}</strong>
              </div>
            </div>
            <div className={styles.channel}>
              <p className={styles.Ptext}>Call Recording</p>
              <div className={styles.audioPlayer}>
                <div onClick={toggleAudio} className={styles.playPauseBtn}>
                  {isPlaying ? (
                    // Pause Icon
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 50 50"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="25" cy="25" r="25" fill="#EBE2FF" />
                      <rect
                        x="18"
                        y="17"
                        width="5"
                        height="18"
                        rx="2"
                        fill="#6524EB"
                      />
                      <rect
                        x="27"
                        y="17"
                        width="5"
                        height="18"
                        rx="2"
                        fill="#6524EB"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 50 50"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="25" cy="25" r="25" fill="#EBE2FF" />
                      <polygon points="20,17 35,25 20,33" fill="#6524EB" />
                    </svg>
                  )}
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={audioProgress}
                  onChange={handleSeek}
                  className={styles.audioSeek}
                />
                <div className={styles.audioTime}>
                  <span>{formatTime(currentTime)}</span> /{" "}
                  <span>{formatTime(audioRef.current?.duration || 0)}</span>
                </div>
                <audio
                  ref={audioRef}
                  src={callData.recording_url}
                  onEnded={() => setIsPlaying(false)}
                  onTimeUpdate={handleAudioProgress}
                />
              </div>
            </div>
          </div>
          <div className={styles.summaryDiv}>
            <div className={styles.dataTitle}>
              <h2>Call summary</h2>
            </div>
            <p className={styles.Ptext}>
              {callData.call_analysis?.call_summary || "No data"}
            </p>
          </div>
          <div className={styles.summaryDiv}>
            <div className={styles.dataTitle}>
              <h2>Call Transcript</h2>
            </div>
            <div className={styles.ChatBox}>
              {transcript.find((msg) => msg.role === "agent") && (
                <div className={styles.messageRow}>
                  <div className={styles.profile}>
                    <img
                      src={
                        `/${currentAgent?.avatar}` || "/svg/default-agent.svg"
                      }
                      alt="Agent"
                      className={styles.profileImage}
                    />
                  </div>

                  <div className={styles.messageLeft}>
                    <div className={styles.bubbleLeft}>
                      {transcript.find((msg) => msg.role === "agent").content}
                    </div>
                    <span className={styles.time}>
                      {callData?.agent_id
                        ? formatName(
                          agents.find((a) => a.agent_id === callData.agent_id)
                            ?.agentName
                        ) || "Unknown Agent"
                        : "Loading..."}
                    </span>
                  </div>
                </div>
              )}

              {transcript.find((msg) => msg.role === "user") && (
                <div className={styles.messageRight}>
                  <div className={styles.bubbleRight}>
                    {transcript.find((msg) => msg.role === "user").content}
                  </div>
                  <span className={styles.time}>User</span>
                </div>
              )}

              <div
                className={styles.chatBtn}
                onClick={() => setChatModalOpen(true)}
              >
                <p>Show Full Transcript</p>
              </div>
            </div>

            <DetailModal
              isOpen={isChatModalOpen}
              onClose={() => setChatModalOpen(false)}
              height="80dvh"
            >
              <div className={styles.titlediv}>
                <h1>Call Transcript</h1>
              </div>
              <div className={styles.ChatBox2}>
                {transcript.map((entry, index) => (
                  entry.role === "agent" ? (
                    <div key={index} className={styles.messageWrapper}>
                      <div className={styles.messageLeftWrapper}>
                        <img
                          src={
                            `/${currentAgent?.avatar}` || "/svg/default-agent.svg"
                          }
                          alt="Agent"
                          className={styles.profileImage}
                        />
                        <div className={styles.messageLeft}>
                          <div className={styles.bubbleLeft}>
                            {entry.content}
                          </div>
                          <span className={styles.time}>
                            {callData?.agent_id
                              ? formatName(
                                agents.find(
                                  (a) => a.agent_id === callData.agent_id
                                )?.agentName
                              ) || "Unknown Agent"
                              : "Loading..."}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={index} className={styles.messageWrapper2}>
                      <div className={styles.messageRight}>
                        <div className={styles.bubbleRight}>
                          {entry.content}
                        </div>
                      </div>
                      <span className={styles.time}>User</span>
                    </div>
                  )
                ))}
              </div>
            </DetailModal>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CallDetails;
