import { useEffect, useState } from "react";
import styles from "./HeaderFilter.module.css";
import OffCanvas from "../OffCanvas/OffCanvas";
import SideFilter from "./SideFilter/SideFilter";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRef } from "react";

function HeaderFilter({
  options,
  selectedSentiment,
  onFilter,
  isAgents,
  onRangeChange,
  onAgentChange,
  selectedAgentId,
  isCallSummary,
  filters,
  onFilterChange,
  // onChatFilter
}) {
  console.log(isAgents, "isAgents")
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [open, setOpen] = useState(false);
  const [allSentiment, setAllSentiment] = useState("");
  const totalAgentView = localStorage.getItem("filterType");
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  function formatDateWithoutTimezone(date) {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const [selected, setSelected] = useState(
    options.find((opt) => opt.label === selectedSentiment) || options[0]
  );

  const handleChange = (e) => {
    const selectedId = +e.target.value;
    const selectedOption = options.find((opt) => opt.id === selectedId);
    setSelected(selectedOption);
    sessionStorage.setItem("selectedfilterOption", selectedOption.label);
    onFilter(selectedOption.label);
  };
  const handleBack = () => {
    navigate(-1);
  };

  const handleChangeDate = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };
  const handleApplyFilter = () => {
    if (startDate && endDate) {
      onRangeChange({
        startDate: formatDateWithoutTimezone(startDate),
        endDate: formatDateWithoutTimezone(endDate),
      });
      setOpen(false);
    }
  };

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    onRangeChange({ startDate: null, endDate: null }); // Clear the filter
    setOpen(false); // Close the calendar when clearing
  };

  const handleFilterChange = (newFilters) => {
    onFilterChange(newFilters);
    setIsOpen(false);
  };
  const handleAll = () => {
    const allOption = options.find(
      (opt) => opt.label === "All" || opt.id === 0
    );
    setAllSentiment("all");
    setSelected(allOption);
    onFilter("All");
  };
  const closeCalender = () => {
    setOpen(false);
  };
  const handleOpenSlider = () => {
    setIsOpen(true);
    setOpen(false);
  };
  const handleCloseFilter = () => {
    setOpen(false);
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
  return (
    <div>
      <div className={styles.Forsticky}>
        <header className={styles.header}>
          <div className={styles.profileBack} onClick={handleBack}>
            <img src="svg/Notification.svg" alt="Back button"></img>
            <h4 className={styles.headerTitle}>Total Calls</h4>
          </div>
          <div className={styles.notifiMain}>
            <div className={styles.notificationIcon1}>
              <div className={styles.dropdownContainer}>
                <div
                  style={{
                    marginTop: "0px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={selected.imageUrl}
                    alt={selected.label}
                    style={{ width: 20, height: 20, marginRight: 5 }}
                  />
                </div>

                <select
                  className={styles.agentSelect2}
                  value={selected.id}
                  onClick={handleCloseFilter}
                  onChange={handleChange}
                >
                  {options.map((option) => (
                    <option key={option.id} value={option.id}>
                      <img src="{selected.imageUrl}" /> {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className={styles.notificationIcon}
              onClick={handleOpenSlider}
              style={{ cursor: "pointer" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.88656 14.1957C7.69638 13.772 7.41205 13.3973 7.05521 13.1C6.69836 12.8028 6.27841 12.5908 5.8273 12.4803V4.77773C5.8273 4.5795 5.74855 4.38938 5.60838 4.2492C5.4682 4.10902 5.27808 4.03027 5.07984 4.03027C4.8816 4.03027 4.69148 4.10902 4.55131 4.2492C4.41113 4.38938 4.33238 4.5795 4.33238 4.77773V12.4766C4.15347 12.5223 3.97851 12.5823 3.80916 12.656C3.22679 12.9197 2.74094 13.3581 2.41899 13.9105C2.09705 14.4628 1.95498 15.1016 2.01249 15.7383C2.07 16.375 2.32424 16.978 2.73993 17.4637C3.15563 17.9494 3.71218 18.2937 4.33238 18.4488V21.2219C4.33238 21.4201 4.41113 21.6102 4.55131 21.7504C4.69148 21.8906 4.8816 21.9693 5.07984 21.9693C5.27808 21.9693 5.4682 21.8906 5.60838 21.7504C5.74855 21.6102 5.8273 21.4201 5.8273 21.2219V18.4525C6.31138 18.3343 6.75921 18.0995 7.13179 17.7686C7.50438 17.4377 7.79043 17.0207 7.96504 16.554C8.10905 16.1754 8.17627 15.7718 8.1628 15.367C8.14933 14.9621 8.05542 14.564 7.88656 14.1957ZM6.56729 16.027C6.4752 16.2715 6.32426 16.4894 6.12782 16.6616C5.93138 16.8337 5.69551 16.9548 5.44112 17.014C5.18672 17.0733 4.92163 17.0688 4.66935 17.0012C4.41707 16.9335 4.18537 16.8046 3.99478 16.626C3.80419 16.4474 3.66059 16.2245 3.5767 15.9772C3.49281 15.7298 3.47123 15.4656 3.51385 15.2079C3.55648 14.9502 3.662 14.7069 3.82108 14.4998C3.98015 14.2926 4.18786 14.1278 4.42581 14.0201C4.62971 13.9261 4.85161 13.8777 5.07611 13.8781C5.38203 13.878 5.68148 13.9661 5.93865 14.1318C6.19581 14.2975 6.39979 14.5338 6.52618 14.8124C6.61443 15.0015 6.66417 15.2063 6.67251 15.4148C6.68085 15.6234 6.64762 15.8315 6.57477 16.027H6.56729Z"
                  fill="#0A0A0A"
                />
                <path
                  d="M21.7147 14.1957C21.5245 13.772 21.2402 13.3973 20.8833 13.1C20.5265 12.8028 20.1065 12.5908 19.6554 12.4803V4.77773C19.6554 4.5795 19.5767 4.38938 19.4365 4.2492C19.2963 4.10902 19.1062 4.03027 18.908 4.03027C18.7097 4.03027 18.5196 4.10902 18.3794 4.2492C18.2393 4.38938 18.1605 4.5795 18.1605 4.77773V12.4766C17.9816 12.5223 17.8066 12.5823 17.6373 12.656C17.0549 12.9197 16.5691 13.3581 16.2471 13.9105C15.9252 14.4628 15.7831 15.1016 15.8406 15.7383C15.8981 16.375 16.1524 16.978 16.5681 17.4637C16.9838 17.9494 17.5403 18.2937 18.1605 18.4488V21.2219C18.1605 21.4201 18.2393 21.6102 18.3794 21.7504C18.5196 21.8906 18.7097 21.9693 18.908 21.9693C19.1062 21.9693 19.2963 21.8906 19.4365 21.7504C19.5767 21.6102 19.6554 21.4201 19.6554 21.2219V18.4525C20.1395 18.3343 20.5873 18.0995 20.9599 17.7686C21.3325 17.4377 21.6186 17.0207 21.7932 16.554C21.9372 16.1754 22.0044 15.7718 21.9909 15.367C21.9775 14.9621 21.8835 14.564 21.7147 14.1957ZM20.3954 16.027C20.3033 16.2715 20.1524 16.4894 19.9559 16.6616C19.7595 16.8337 19.5236 16.9548 19.2692 17.014C19.0148 17.0733 18.7498 17.0688 18.4975 17.0012C18.2452 16.9335 18.0135 16.8046 17.8229 16.626C17.6323 16.4474 17.4887 16.2245 17.4048 15.9772C17.3209 15.7298 17.2994 15.4656 17.342 15.2079C17.3846 14.9502 17.4901 14.7069 17.6492 14.4998C17.8083 14.2926 18.016 14.1278 18.2539 14.0201C18.4579 13.9265 18.6798 13.878 18.9042 13.8781C19.2102 13.878 19.5096 13.9661 19.7668 14.1318C20.0239 14.2975 20.2279 14.5338 20.3543 14.8124C20.4413 15.002 20.4898 15.2071 20.4969 15.4156C20.5039 15.6241 20.4694 15.832 20.3954 16.027Z"
                  fill="#0A0A0A"
                />
                <path
                  d="M13.0815 7.76758C12.9694 7.72647 12.8572 7.69283 12.7414 7.66294V4.77773C12.7414 4.5795 12.6626 4.38938 12.5225 4.2492C12.3823 4.10902 12.1922 4.03027 11.9939 4.03027C11.7957 4.03027 11.6056 4.10902 11.4654 4.2492C11.3252 4.38938 11.2465 4.5795 11.2465 4.77773V7.67415C10.8091 7.78456 10.4012 7.98949 10.0516 8.27452C9.70191 8.55955 9.41897 8.91774 9.22266 9.32389C9.02636 9.73005 8.92145 10.1743 8.91532 10.6254C8.9092 11.0764 9.00201 11.5233 9.18721 11.9347C9.35294 12.304 9.59019 12.6368 9.88526 12.9139C10.1803 13.191 10.5274 13.407 10.9064 13.5492C11.0185 13.5903 11.1344 13.6239 11.2465 13.6538V21.2219C11.2465 21.4201 11.3252 21.6102 11.4654 21.7504C11.6056 21.8906 11.7957 21.9693 11.9939 21.9693C12.1922 21.9693 12.3823 21.8906 12.5225 21.7504C12.6626 21.6102 12.7414 21.4201 12.7414 21.2219V13.6501C12.9211 13.6072 13.0964 13.5471 13.2646 13.4707C13.8245 13.222 14.2975 12.812 14.6231 12.293C14.9486 11.7741 15.1121 11.1698 15.0924 10.5575C15.0727 9.9452 14.8709 9.35267 14.5127 8.85569C14.1545 8.3587 13.6562 7.97985 13.0815 7.76758ZM13.4926 11.2246C13.3817 11.5186 13.1862 11.7732 12.9306 11.956C12.675 12.1388 12.371 12.2418 12.0569 12.2518C11.7429 12.2618 11.4329 12.1784 11.1662 12.0122C10.8995 11.846 10.6881 11.6044 10.5588 11.318C10.4495 11.0762 10.4026 10.8108 10.4223 10.5462C10.442 10.2816 10.5276 10.0261 10.6715 9.80305C10.8153 9.58005 11.0127 9.39663 11.2457 9.26956C11.4787 9.1425 11.7398 9.07582 12.0051 9.07564C12.1965 9.07578 12.3863 9.10995 12.5657 9.17654C12.7591 9.25118 12.9359 9.3632 13.086 9.5062C13.236 9.64921 13.3564 9.82039 13.4403 10.01C13.5291 10.1988 13.5795 10.4035 13.5885 10.612C13.5975 10.8205 13.5649 11.0288 13.4926 11.2246Z"
                  fill="#0A0A0A"
                />
              </svg>
            </div>
          </div>
        </header>

        <section className={styles.agentCard}>
          <div className={styles.dateAgentSection}>
            <div className={styles.PartFew} onClick={() => setOpen(!open)}>
              <p>
                {" "}
                {startDate
                  ? startDate.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })
                  : (startDate || new Date()).toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
              </p>
              <div className={styles.dateRange}>
                <h6>
                  {startDate ? startDate.getDate() : sevenDaysAgo.getDate()}
                </h6>
                <div>
                  <svg
                    width="18"
                    height="12"
                    viewBox="0 0 18 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M0 6C0 5.63181 0.287817 5.33333 0.642857 5.33333L15.8051 5.33333L11.7597 1.13807C11.5087 0.877723 11.5087 0.455611 11.7597 0.195262C12.0108 -0.0650873 12.4178 -0.0650873 12.6689 0.195262L17.8117 5.52859C18.0628 5.78894 18.0628 6.21106 17.8117 6.4714L12.6689 11.8047C12.4178 12.0651 12.0108 12.0651 11.7597 11.8047C11.5087 11.5444 11.5087 11.1223 11.7597 10.8619L15.8051 6.66667L0.642857 6.66667C0.287817 6.66667 0 6.36819 0 6Z"
                      fill="black"
                    />
                  </svg>
                </div>

                <h6>{endDate ? endDate.getDate() : today.getDate()}</h6>
              </div>

              <div className={styles.DatePic}>
                {open && (
                  <div
                    style={{
                      position: "absolute",
                      zIndex: 100,
                      left: "50px",
                      top: "40px",
                    }}
                    ref={calendarRef}
                    className={styles.datePickerCalender}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DatePicker
                      selectsRange
                      startDate={startDate}
                      endDate={endDate}
                      onChange={handleChangeDate}
                      inline
                      maxDate={new Date()}
                      calendarClassName={styles.customCalendar}
                    />
                    <div className={styles.dateButtons}>
                      <button
                        onClick={handleApplyFilter}
                        className={styles.applyButton}
                      >
                        Apply Filter
                      </button>
                      <button
                        onClick={handleClearFilter}
                        className={styles.clearButton}
                      >
                        Clear Filter
                      </button>
                    </div>
                  </div>
                )}

                <svg
                  width="26"
                  height="31"
                  viewBox="0 0 26 31"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M25.9997 8.82162V6.1039C26.001 5.20803 25.6546 4.34916 25.0361 3.71493C24.4164 3.08207 23.5771 2.72729 22.7017 2.72866H20.7421V1.09586C20.7421 0.490382 20.2629 0 19.6713 0C19.0796 0 18.6005 0.490382 18.6005 1.09586V2.72866H14.0708V1.09586C14.0708 0.490382 13.5916 0 12.9999 0C12.4083 0 11.9291 0.490382 11.9291 1.09586V2.72866H7.39944V1.09586C7.39944 0.490382 6.92025 0 6.32861 0C5.73696 0 5.25778 0.490382 5.25778 1.09586V2.72866H3.29815C2.42275 2.7273 1.58349 3.08207 0.963748 3.71493C0.345341 4.34916 -0.00133459 5.20803 3.86125e-06 6.1039V8.82162H25.9997Z"
                    fill="#5F33E1"
                  />
                  <path
                    d="M3.86125e-06 11.0156V26.9604C-0.00133459 27.8563 0.345341 28.7152 0.963748 29.3494C1.58349 29.9822 2.42275 30.337 3.29815 30.3357H22.7015C23.5769 30.337 24.4162 29.9822 25.0359 29.3494C25.6543 28.7152 26.001 27.8563 25.9997 26.9604V11.0156H3.86125e-06ZM7.30561 27.3069H5.35404C4.76777 27.2987 4.29794 26.8096 4.29794 26.211C4.29794 25.6124 4.76777 25.1234 5.35404 25.1152H7.30695H7.30561C7.89054 25.1248 8.36037 25.6124 8.36037 26.211C8.36037 26.8096 7.89054 27.2973 7.30561 27.3069ZM7.30561 21.7715H5.35404C4.76777 21.7633 4.29794 21.2742 4.29794 20.6756C4.29794 20.077 4.76777 19.588 5.35404 19.5798H7.30695H7.30561C7.89054 19.588 8.3617 20.077 8.3617 20.6756C8.3617 21.2742 7.89188 21.7633 7.30561 21.7715ZM7.30561 16.2361H5.35404C4.76777 16.2279 4.29794 15.7389 4.29794 15.1403C4.29794 14.5417 4.76777 14.0526 5.35404 14.0444H7.30695H7.30561C7.89054 14.054 8.36037 14.5417 8.36037 15.1403C8.36037 15.7389 7.89054 16.2265 7.30561 16.2361ZM13.9434 27.3069H11.9905C11.4055 27.2987 10.9344 26.8096 10.9344 26.211C10.9344 25.6124 11.4055 25.1234 11.9905 25.1152H13.9434C14.5283 25.1248 14.9968 25.6124 14.9968 26.211C14.9968 26.8096 14.5283 27.2973 13.9434 27.3069ZM13.9434 21.7715H11.9905C11.4055 21.7633 10.9344 21.2742 10.9344 20.6756C10.9344 20.077 11.4055 19.588 11.9905 19.5798H13.9434C14.5283 19.588 14.9981 20.077 14.9981 20.6756C14.9981 21.2742 14.5283 21.7633 13.9434 21.7715ZM13.9434 16.2361H11.9905C11.4055 16.2279 10.9344 15.7389 10.9344 15.1403C10.9344 14.5417 11.4055 14.0526 11.9905 14.0444H13.9434C14.5283 14.054 14.9968 14.5417 14.9968 15.1403C14.9968 15.7389 14.5283 16.2265 13.9434 16.2361ZM20.6466 27.3069H18.6937C18.1074 27.2987 17.6376 26.8096 17.6376 26.211C17.6376 25.6124 18.1087 25.1234 18.6937 25.1152H20.6466H20.6452C21.2302 25.1248 21.7 25.6124 21.7 26.211C21.7 26.8096 21.2302 27.2973 20.6452 27.3069H20.6466ZM20.6466 21.7715H18.6937C18.1074 21.7633 17.6376 21.2742 17.6376 20.6756C17.6376 20.077 18.1087 19.588 18.6937 19.5798H20.6466H20.6452C21.2315 19.588 21.7013 20.077 21.7013 20.6756C21.7013 21.2742 21.2315 21.7633 20.6452 21.7715H20.6466ZM20.6466 16.2361H18.6937C18.1074 16.2279 17.6376 15.7389 17.6376 15.1403C17.6376 14.5417 18.1087 14.0526 18.6937 14.0444H20.6466H20.6452C21.2302 14.054 21.7 14.5417 21.7 15.1403C21.7 15.7389 21.2302 16.2265 20.6452 16.2361H20.6466Z"
                    fill="#B5A0F3"
                  />
                </svg>
              </div>
            </div>

            <hr></hr>
            {/* --------------- Call / Chat Filter Section --------------- */}
            {/* <div className={styles.DateSecT} onClick={closeCalender}>
              <p>Filter</p>
              <div className={styles.selectWrapper}>
                <div className={styles.selectedValue}>
                  {selectedAgentId === "all"
                    ? "All"
                    : (() => {
                      const agentName =
                        isAgents.find(
                          (agent) => agent.agent_id === selectedAgentId
                        )?.agentName || "";
                      return agentName.length > 28
                        ? agentName.slice(0, 28) + "..."
                        : agentName;
                    })()}
                </div>

                <select className={styles.agentSelect1} value={selectedAgentId} onChange={(e) => onAgentChange(e.target.value)}>
                  <option value="all">All</option>
                  <option value="chat">Chat</option>
                  <option value="call">Call</option>
                </select>
              </div>
            </div> */}
            {/* <hr></hr> */}
            <div className={styles.DateSecT} onClick={closeCalender}>
              <p>Agent</p>

              <div className={styles.selectWrapper}>
                <div className={styles.selectedValue}>
                  {selectedAgentId === "all"
                    ? "All"
                    : (() => {
                      const agentName =
                        isAgents.find(
                          (agent) => agent.agent_id === selectedAgentId
                        )?.agentName || "";
                      return agentName.length > 28
                        ? agentName.slice(0, 28) + "..."
                        : agentName;
                    })()}
                </div>

                <select
                  className={styles.agentSelect1}
                  value={selectedAgentId}
                  onChange={(e) => onAgentChange(e.target.value)}
                >
                  <option value="all">All</option>
                  {isAgents?.map((agent) => (
                    <option key={agent.agent_id} value={agent.agent_id}>
                      {(agent.agentName.length > 7
                        ? agent.agentName.slice(0, 5) + "..."
                        : agent.agentName) + `(${agent.agentCode})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>
        {/* (${agent.agentCode}) */}
      </div>

      {/* OffCanvas component */}
      <OffCanvas
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        direction="right"
        width="300px"
        showCloseBtn={true}
      >
        {/* Put any content you want inside offcanvas here */}
        <SideFilter
          onSelectAll={handleAll}
          filters={filters}
          onFilterChange={handleFilterChange}
          isLeadTypeSummary={isCallSummary}
        />
      </OffCanvas>
    </div>
  );
}

export default HeaderFilter;
