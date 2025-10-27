import React, { useEffect, useState } from "react";
import styles from "./CreateTicketModal.module.css";
import axios from "axios";
import imageCompression from "browser-image-compression";


const CreateTicketModal = ({
  isOpen,
  onClose,
  pageContext,
  agentId,
  mode = "raise",
  ticket = null,
  onSuccess,
  priority = "Medium",
  department = "Support",
}) => {
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    description: "",
    priority,
    department,
    relatedFeatureId: "",
  });

  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (mode !== "raise" && ticket) {
      setFormData({
        subject: ticket.subject || "",
        category: ticket.category || "",
        description: ticket.description || "",
        priority: ticket.priority || priority,
        department: ticket.department || department,
        relatedFeatureId: ticket.relatedFeatureId || "",
      });
    } else {
      const categoryMap = {
        "Edit Agent": "Agent Editing",
        "Create Agent": "Agent Creation",
        "User Management": "User Management",
        Commission: "Commission Issue",
        "Call Forwarding": "Call Forwarding",
        "Phone Number Assignment": "Phone Number Assignment",
      };
      setFormData((prev) => ({
        ...prev,
        category: categoryMap[pageContext] || "General Inquiry",
      }));
    }
  }, [mode, ticket, pageContext]);

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB");
      return;
    }

    if (!["image/png", "image/jpeg", "application/pdf"].includes(selected.type)) {
      setError("Only PNG, JPG, or PDF files allowed");
      return;
    }

    if (selected.type.startsWith("image/")) {
      try {
        const compressedBlob = await imageCompression(selected, {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });

        const compressedFile = new File([compressedBlob], selected.name, {
          type: selected.type,
          lastModified: Date.now(),
        });

        setFile(compressedFile);
      } catch (err) {
        console.error("Compression failed", err);
        setError("Image compression failed");
      }
    } else {
      setFile(selected);
    }

    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    const { subject, category, description, priority, department } = formData;

    if (!subject || !category || !description || !priority || !department) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const payload = new FormData();
      payload.append("subject", subject);
      payload.append("category", category);
      payload.append("description", description);
      payload.append("priority", priority);
      payload.append("department", department);
      payload.append("relatedFeatureId", formData.relatedFeatureId);
      payload.append("agentId", formData.relatedFeatureId || null);
      payload.append("userId", userId);
      payload.append("pageContext", pageContext);
 
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/create_ticket`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Ticket created", res.data);
    //   Swal.fire("Success!", `Ticket ID: ${res?.data?.ticket?.ticketId}`, "success");
    alert("Ticket Created", `Ticket ID: ${res?.data?.ticket?.ticketId}`);

      setFormData({
        subject: "",
        category: "",
        description: "",
        priority,
        department,
        relatedFeatureId: "",
      });
      setFile(null);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Submit error", err);
      setError("Failed to submit ticket");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Raise Ticket</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            {/* <X size={24} /> */}X
          </button>
        </div>
        <div className={styles.modalBody}>
          {/* Subject */}
          <div className={styles.formGroup}>
            <label htmlFor="subject" className={styles.label}>Subject</label>
            <input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Enter ticket subject"
              maxLength={100}
              className={styles.input}
            />
          </div>

          {/* Category */}
          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>Category</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={styles.select}
            >
              <option value="" disabled>Select category</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Agent Creation">Agent Creation</option>
              <option value="Agent Editing">Agent Editing</option>
              <option value="User Management">User Management</option>
              <option value="Commission Issue">Commission Issue</option>
              <option value="Call Forwarding">Call Forwarding</option>
              <option value="Phone Number Assignment">Phone Number Assignment</option>
              <option value="Billing Issue">Billing Issue</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Describe the issue"
              className={styles.textarea}
            />
          </div>

          {/* Priority */}
          <div className={styles.formGroup}>
            <label htmlFor="priority" className={styles.label}>Priority</label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className={styles.select}
            >
              <option value="" disabled>Select priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Department */}
          <div className={styles.formGroup}>
            <label htmlFor="department" className={styles.label}>Department</label>
            <select
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className={styles.select}
            >
              <option value="" disabled>Select department</option>
              <option value="Support">Support</option>
              <option value="Billing">Billing</option>
              <option value="Technical">Technical</option>
              <option value="Sales">Sales</option>
            </select>
          </div>

          {/* Related Feature ID */}
          <div className={styles.formGroup}>
            <label htmlFor="relatedFeatureId" className={styles.label}>Agent ID (optional)</label>
            <input
              id="relatedFeatureId"
              value={formData.relatedFeatureId}
              onChange={(e) => setFormData({ ...formData, relatedFeatureId: e.target.value })}
              placeholder="e.g. AGNT-1023"
              className={styles.input}
            />
          </div>

          {/* File Upload */}
          <div className={styles.formGroup}>
            <label htmlFor="file" className={styles.label}>Attachment (optional)</label>
            <input
              id="file"
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          {/* Submit Buttons */}
          <div className={styles.buttonGroup}>
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.loader}>Loading...</span>
              ) : mode === "raise" ? (
                "Submit"
              ) : mode === "resolve" ? (
                "Resolve"
              ) : (
                "Reopen"
              )}
            </button>
            <button
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTicketModal;