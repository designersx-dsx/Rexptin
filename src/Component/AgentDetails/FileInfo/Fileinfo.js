import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import HeaderBar from "../../HeaderBar/HeaderBar";
import styles from "./Fileinfo.module.css";
import { FiDownload, FiTrash2 } from "react-icons/fi";
import {
  deleteAgentFile,
  getAgentFiles,
  uploadAgentFiles,
} from "../../../Store/apiStore";
import PopUp from "../../Popup/Popup";

import Loader from "../../Loader/Loader";
import Loader2 from "../../Loader2/Loader2";

const MAX_FILES = 1;
const MAX_FILE_SIZE_MB = 10;
const Fileinfo = () => {
  const location = useLocation();
  const { agent_id, knowledgeBaseId } = location.state || {};
  const [knowledgeBaseSources, setKnowledgeBaseSources] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, submitSetLoading] = useState(false);
  const [cancelButtonHeading, setCancelButtonHeading] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const [isModalDisabled, setIsModalDisabled] = useState(false);

  // ---- Stable code helpers ----
  const CODE_LS_PREFIX = "kb_stable_code_";

  // Short code banane ka simple helper (KBID/Agent se)
  const makeShortCode = (knowledgeBaseId, agentId) => {
    // Prefer KB ID last 8 chars, warna Agent ID last 6, warna random.
    const fromKb = knowledgeBaseId ? String(knowledgeBaseId).slice(-8) : null;
    const fromAgent = agentId ? String(agentId).slice(-6) : null;
    const base = (
      fromKb ||
      fromAgent ||
      Math.random().toString(36).slice(2, 10)
    ).toUpperCase();
    return `KB-${base}`;
  };

  const getOrCreateStableCode = (knowledgeBaseId, agentId) => {
    const key = `${CODE_LS_PREFIX}${agentId || "unknown"}`;
    let code = localStorage.getItem(key);
    if (!code) {
      code = makeShortCode(knowledgeBaseId, agentId);
      localStorage.setItem(key, code);
    }
    return code;
  };

  const renameWithCode = (file, code) => {
    if (!file || !code) return file;
    if (file.name.includes(`__${code}`)) return file;

    const dot = file.name.lastIndexOf(".");
    const base = dot >= 0 ? file.name.slice(0, dot) : file.name;
    const ext = dot >= 0 ? file.name.slice(dot) : "";

    return new File([file], `${base}__${code}${ext}`, {
      type: file.type,
      lastModified: file.lastModified,
    });
  };

  const stableCode = useMemo(
    () => getOrCreateStableCode(knowledgeBaseId, agent_id),
    [knowledgeBaseId, agent_id]
  );

  const [popup, setPopup] = useState({
    show: false,
    type: "",
    message: "",
    onConfirm: null,
  });
  const closePopup = () => {
    setPopup({ show: false, type: "", message: "", onConfirm: null });
  };

  const fetchKnowledgeBaseDetails = async () => {
    if (!knowledgeBaseId) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.retellai.com/get-knowledge-base/${knowledgeBaseId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
          },
        }
      );
      setKnowledgeBaseSources(response.data.knowledge_base_sources || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch knowledge base details:", error);
      setLoading(false);
    }
  };
  const startPollingStatus = (kbId) => {
    setLoading(true); // show loader while checking
    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(
          `https://api.retellai.com/get-knowledge-base/${kbId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
            },
          }
        );
        if (response.data?.status === "complete") {
          clearInterval(intervalId); // stop polling
          setLoading(false);
          fetchKnowledgeBaseDetails();
        }
      } catch (error) {
        console.error("Error while polling KB status:", error);
      }
    }, 10000); // 10 sec
  };

  useEffect(() => {
    fetchKnowledgeBaseDetails();
    // startPollingStatus(knowledgeBaseId);
  }, [knowledgeBaseId]);
  const handleFileChange = (e) => {
    setInlineError("");
    const newFiles = Array.from(e.target.files);
    let validFiles = [];
    let oversizedFiles = [];

    // Validate file size
    newFiles.forEach((file) => {
      if (file.size / (1024 * 1024) > MAX_FILE_SIZE_MB) {
        oversizedFiles.push(file.name);
      } else {
        validFiles.push(renameWithCode(file, stableCode));
      }
    });

    if (oversizedFiles.length > 0) {
      setInlineError(
        `The following files exceed ${MAX_FILE_SIZE_MB}MB: ${oversizedFiles.join(
          ", "
        )}`
      );
    }

    const combinedFiles = [...selectedFiles, ...validFiles];

    if (combinedFiles.length > MAX_FILES) {
      setPopup({
        show: true,
        type: "failed",
        message: `You can upload a maximum of ${MAX_FILES} files at a time.`,
        onConfirm: null,
      });
      return;
    }

    // Remove duplicates
    const uniqueFiles = combinedFiles.filter(
      (file, index, self) =>
        index === self.findIndex((f) => f.name === file.name)
    );

    setSelectedFiles(uniqueFiles);
  };

  const handleRemoveFile = (fileName) => {
    const filtered = selectedFiles.filter((file) => file.name !== fileName);
    setSelectedFiles(filtered);
  };

  const handleSubmit = async () => {
    if (!knowledgeBaseId || selectedFiles.length === 0) {
      setPopup({
        show: true,
        type: "failed",
        message: "Please select files",
        onConfirm: null,
      });
      return;
    }

    try {
      setIsModalDisabled(true); // disable modal

      setCancelButtonHeading(true);
      submitSetLoading(true);
      // Step 1: Upload files to the server
      const uploadResponse = await uploadAgentFiles(agent_id, selectedFiles);

      if (
        !uploadResponse ||
        !uploadResponse.files ||
        uploadResponse.files.length === 0
      ) {
        setPopup({
          show: true,
          type: "failed",
          message: "Failed to upload files to the server.",
          onConfirm: null,
        });
        return;
      }

      const newServerFileNames = uploadResponse.files.map(
        (file) => file.filename
      );
      localStorage.setItem(
        "newlyUploadedFiles",
        JSON.stringify(newServerFileNames)
      );

      // Step 2: Fetch server files
      const serverFilesResponse = await getAgentFiles(agent_id);
      const serverFiles = serverFilesResponse.files;

      if (!serverFiles || serverFiles.length === 0) {
        setPopup({
          show: true,
          type: "failed",
          message: "Failed to retrieve files from the server.",
          onConfirm: null,
        });
        localStorage.removeItem("newlyUploadedFiles");
        return;
      }

      const storedFileNames = JSON.parse(
        localStorage.getItem("newlyUploadedFiles") || "[]"
      );
      const filesForRetell = serverFiles.filter((serverFile) =>
        storedFileNames.includes(serverFile.name)
      );

      if (filesForRetell.length === 0) {
        setPopup({
          show: true,
          type: "failed",
          message: "No matching files found on the server to upload to Retell.",
          onConfirm: null,
        });
        localStorage.removeItem("newlyUploadedFiles");
        return;
      }

      // Step 3: Prepare formData for Retell
      const formData = new FormData();
      filesForRetell.forEach((file) => {
        const byteCharacters = atob(file.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/octet-stream",
        });
        const fileToUpload = new File([blob], file.name);

        formData.append("knowledge_base_files", fileToUpload);
        formData.append("filename", fileToUpload.name);
      });

      // Step 4: Upload to Retell
      const retellResponse = await axios.post(
        `https://api.retellai.com/add-knowledge-base-sources/${knowledgeBaseId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (retellResponse.status === 200) {
        // Close the modal and clear selected files as soon as the files are uploaded
        setShowModal(false); // Close the modal
        setSelectedFiles([]); // Clear selected files

        setPopup({
          show: true,
          type: "success",
          message: "Files uploaded successfully!",
          onConfirm: () => {
            fetchKnowledgeBaseDetails();
            closePopup();
          },
        });
        startPollingStatus(knowledgeBaseId);
        setTimeout(() => {
          setPopup({
            show: false,
          });
        }, 2000);
      } else {
        console.error("Upload failed with status:", retellResponse.status);
        setPopup({
          show: true,
          type: "failed",
          message: "Upload failed.",
          onConfirm: null,
        });
      }
      submitSetLoading(false);
    } catch (error) {
      submitSetLoading(false);
      setCancelButtonHeading(false);
      console.error("Error during upload:", error);
      setPopup({
        show: true,
        type: "failed",
        message: "Upload failed.",
        onConfirm: null,
      });
    } finally {
      setCancelButtonHeading(false);
      setIsModalDisabled(false);
      submitSetLoading(false);
      localStorage.removeItem("newlyUploadedFiles");
    }
  };

  const performDelete = async (sourceId) => {
    const fileToDelete = knowledgeBaseSources.find(
      (source) => source.source_id === sourceId
    );
    if (!fileToDelete) {
      setPopup({
        show: true,
        type: "failed",
        message: "Could not find file to delete.",
        onConfirm: null,
      });
      return;
    }
    const filename = fileToDelete.filename;
    try {
      await axios.delete(
        `https://api.retellai.com/delete-knowledge-base-source/${knowledgeBaseId}/source/${sourceId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_API_RETELL_API}`,
          },
        }
      );
      setKnowledgeBaseSources((prevSources) =>
        prevSources.filter((source) => source.source_id !== sourceId)
      );
      const localServerResponse = await deleteAgentFile(agent_id, filename);
      setPopup({
        show: true,
        type: "success",
        message: "File deleted successfully!",
        onConfirm: () => {
          closePopup();
        },
      });
    } catch (error) {
      console.error("Delete failed:", error);
      setPopup({
        show: true,
        type: "failed",
        message: "Delete failed",
        onConfirm: null,
      });
    }
  };

  const handleDeleteSource = (sourceId) => {
    setPopup({
      show: true,
      type: "confirm",
      message: "Are you sure you want to delete this file?",
      onConfirm: () => performDelete(sourceId),
    });
  };

  return (
    <div className={styles.container}>
      <HeaderBar title="Knowledge Files" />
      <br />
      <div onClick={() => setShowModal(true)} className={styles.addButton}>
        <img src="/svg/Add-icon.svg" />
      </div>
      <div className={styles.fileListHeader}>
        {loading ? (
          <Loader2 />
        ) : (
          (() => {
            const fileSources = knowledgeBaseSources.filter(
              (source) =>
                source.file_size && source.filename?.includes(stableCode)
            );

            return fileSources.length > 0 ? (
              fileSources.map((source) => (
                <li key={source.source_id} className={styles.uploadedFileItem}>
                  <div className={styles.uploadedFileName}>
                    <span title={source.filename}>{source.filename}</span>
                  </div>
                  <div className={styles.fileActions}>
                    <a
                      href={source.file_url}
                      download
                      className={styles.iconButton}
                      title="Download"
                    >
                      <img
                        src="/svg/download-invoice.svg"
                        alt="download-invoice"
                      />
                    </a>
                    <button
                      className={styles.iconButton}
                      title="Delete"
                      onClick={() => handleDeleteSource(source.source_id)}
                    >
                      <img src="/svg/delete-invoice.svg" alt="delete-invoice" />
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <p className={styles.noData}>No data</p>
            );
          })()
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div
            className={`${styles.modalContent} ${
              isModalDisabled ? styles.disabled : ""
            }`}
          >
            <h2 className={styles.modalTitle}>Upload Files (Max 1)</h2>
            <hr />

            <div className={styles.uploadGuidelines}>
              <p className={styles.capsul}> Supported Files</p>
              <p>
                .bmp, .csv, .doc, .docx, .eml, .epub, .heic, .html, .jpeg, .png,
                .md, .msg, .odt, .org, .p7s, .pdf, .ppt, .pptx, .rst, .rtf,
                .tiff, .txt, .tsv, .xls, .xlsx, .xml.
                <br />
              </p>{" "}
            </div>

            <p className={styles.suportfile}>
              {" "}
              For <b>CSV, TSV, XLS, and XLSX</b> files specifically, there are
              additional limits of
              <b> 1,000 rows</b> and <b>50 columns</b>.
              <br />
            </p>

            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileChange}
              className={styles.fileInput}
              accept=".bmp, .csv, .doc, .docx, .eml, .epub, .heic, .html, .jpeg, .png, .md, .msg,
              .odt, .org, .p7s, .pdf, .ppt, .pptx, .rst, .rtf, .tiff, .txt, .tsv, .xls,
              .xlsx, .xml"
            />
            <p className={styles.maxlimit}>
              Maximum file size limit: <b>10MB</b>.
            </p>
            {inlineError && <p className={styles.inlineError}>{inlineError}</p>}
            <ul className={styles.selectedFileList}>
              {selectedFiles.map((file, index) => (
                <li key={index} className={styles.fileItem}>
                  <span>{file.name}</span>
                  <button
                    type="button"
                    className={styles.removeFileButton}
                    onClick={() => handleRemoveFile(file.name)}
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.modalActions}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedFiles([]);
                }}
                disabled={cancelButtonHeading}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className={styles.submitButton}
                disabled={selectedFiles.length === 0}
              >
                {submitLoading ? (
                  <div style={{ display: "flex" }}>
                    <Loader size={16} />
                    &nbsp; Submitting
                  </div>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* The PopUp component is rendered here */}
      {popup.show && (
        <PopUp
          type={popup.type}
          message={popup.message}
          onClose={closePopup}
          onConfirm={popup.onConfirm}
        />
      )}
    </div>
  );
};

export default Fileinfo;
