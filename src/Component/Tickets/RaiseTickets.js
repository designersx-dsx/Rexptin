import React, { useEffect, useState } from "react";
import styles from "./RaiseTickets.module.css";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import decodeToken from "../../lib/decodeToken";
import { useNavigate } from "react-router-dom";
import AttachmentPreviewModal from "./AttachmentPreviewModal";
import EditHeader from "../EditHeader/EditHeader";


export default function RaiseTickets() {
  const [allTickets, setAllTickets] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 5;
const token = localStorage.getItem("token") || "";
const decodeTokenData = decodeToken(token);
const userId= decodeTokenData?.id || "";
const navigate=useNavigate();
  const getStatusStyle = (status) => {
    switch (status) {
      case "Open":
        return styles.statusOpen;
      case "In Progress":
        return styles.statusProgress;
      case "Resolved":
        return styles.statusResolved;
      case "Reopened":
        return styles.statusReopened;
      default:
        return styles.statusDefault;
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/tickets/get_tickets_by_user?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setAllTickets(res.data.tickets);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchTickets();
  }, [userId]);

  useEffect(() => {
    let filtered = allTickets;
    if (status) filtered = filtered.filter((t) => t.status === status);
    if (priority) filtered = filtered.filter((t) => t.priority === priority);
    if (searchText.trim()) {
      const text = searchText.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.ticketId.toLowerCase().includes(text) ||
          t.subject.toLowerCase().includes(text)
      );
    }
    setTickets(filtered);
  }, [status, priority, allTickets, searchText]);

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(tickets.length / ticketsPerPage);

  return (
    <>
    <EditHeader title="Tickets" />
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}></h2>
        <button className={styles.raiseBtn} onClick={() => navigate('/create-ticket')}>CREATE <span>New Ticket</span></button>
      </div>

      <div className={styles.filters}>
        <input
          placeholder="Search by Ticket ID or Subject"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className={styles.input}
        />
<div className={styles.filtersgroup}>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={styles.select}>
          <option value="">Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
          <option value="Reopened">Reopened</option>
        </select>

        <select value={priority} onChange={(e) => setPriority(e.target.value)} className={styles.select}>
          <option value="">Priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
</div>
        <button className={styles.raiseBtn} onClick={() => { setPriority(""); setStatus(""); setCurrentPage(1); }}>Clear Filter</button>
      </div>

      <div className={styles.tableWrapper}>
         <div className={styles.tableOverFlow}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Subject</th>
              <th>Priority</th>
              <th>Description</th>
              <th>Category</th>
              <th>Attachments</th>
              <th>Status</th>
              <th>Ticket Raised</th>
              <th>Last Activity</th>
              <th>Resolution Notes</th>
            </tr>
          </thead>
          <tbody>
            {currentTickets.map((ticket) => (
              <tr key={ticket.ticketId}>
                <td>{ticket.ticketId}</td>
                <td>{ticket.subject}</td>
                <td>{ticket.priority}</td>
                <td>{ticket.description}</td>
                <td>{ticket.category}</td>
                <td>
                  <button
                    className={styles.attachmentBtn}
                    onClick={() => {
                      setSelectedAttachments(ticket.attachments);
                      setAttachmentModalOpen(true);
                    }}
                  >
                    View Attachments
                  </button>
                </td>
                <td>
                  <span className={`${styles.status} ${getStatusStyle(ticket.status)}`}>{ticket.status}</span>
                </td>
                <td>{new Date(ticket.createdAt).toLocaleDateString("en-GB")}</td>
                <td>{new Date(ticket.updatedAt).toLocaleString("en-GB")}</td>
                <td>{ticket.resolutionNotes ? ticket?.resolutionNotes:'-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Showing {indexOfFirstTicket + 1} to {Math.min(indexOfLastTicket, tickets.length)} of {tickets.length} tickets
          </span>
          <div className={styles.paginationControls}>
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
              <ChevronLeft size={16} />
            </button>
            <span className={styles.pageCount}>{currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>


      <AttachmentPreviewModal
        isOpen={attachmentModalOpen}
        onClose={() => setAttachmentModalOpen(false)}
        attachments={selectedAttachments}
      /> 
    </div>
    </>
  );
}