// import React, { useState } from "react";
// import styles from "./PublicCopyUrl.module.css";
// import { modifyAgentFields } from "../../Store/apiStore";
// import { useDashboardStore } from "../../Store/agentZustandStore";
// import { Pencil } from "lucide-react"; 
// import useUser from "../../Store/Context/UserContext";
// const PublicCopyUrl = ({ agent, isRefresh ,isEditMode}) => {
//   const { setHasFetched } = useDashboardStore();

//   const [ventryUrl, setVentryUrl] = useState("");
//   const [copied, setCopied] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [isEditing, setIsEditing] = useState(isEditMode);
//   const [message, setMessage] = useState({ type: "", text: "" });
//   const token=localStorage.getItem("token")
 
  
//   // Base URLs
//   const defaultPublicUrl = `${process.env.REACT_APP_PUBLIC_WIDGET_DOMAIN}/+${agent?.ventryUrl}`;
//   const ventryPublicUrl = agent?.ventryUrl
//     ? `${process.env.REACT_APP_PUBLIC_WIDGET_DOMAIN}/${agent?.ventryUrl}`
//     : null;

//   const finalUrl = ventryPublicUrl || defaultPublicUrl;

//   const handleCopy = () => {
//     navigator.clipboard.writeText(finalUrl);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const handleAddOrUpdateVentryUrl = async () => {
//     const trimmedValue = ventryUrl.trim();
//     if (!trimmedValue) {
//       setMessage({ type: "error", text: "Please enter a valid Ventry URL" });
//       return;
//     }

//     try {
//       setLoading(true);
//       setMessage({ type: "", text: "" });

//       const agentId = agent?.agent_id;
//       const res = await modifyAgentFields(agentId, trimmedValue,token);

//       if (res?.success) {
//         setMessage({
//           type: "success",
//           text: isEditing ? "Ventry URL updated successfully!" : "Ventry URL added successfully!",
//         });
//         setVentryUrl("");
//         setHasFetched(true);
//         isRefresh();
//         setIsEditing(false);
//       } else {
//         setMessage({
//           type: "error",
//           text:
//             res?.data?.response?.data?.message ||
//             "Failed to update Ventry URL",
//         });
//       }
//     } catch (error) {
//       console.error("Error updating Ventry URL:", error);
//       setMessage({
//         type: "error",
//         text:
//           error.response?.data?.message ||
//           "Something went wrong. Please try again.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <div className={styles.card}>
//         <h2 className={styles.heading}>Public URL</h2>

//         {/* URL display + Copy + Edit */}
//         <div className={styles.urlBox}>
//           <input
//             type="text"
//             readOnly
//             value={finalUrl}
//             className={styles.urlInput}
//           />
//           <button onClick={handleCopy} className={styles.copyBtn}>
//             {copied ? "Copied!" : "Copy"}
//           </button>

//           {/* Show Edit button if ventryUrl exists */}
//           {agent?.ventryUrl && !isEditing && (
            
//             <button
//               onClick={() => {
//                 setIsEditing(true);
//                 setVentryUrl(agent?.ventryUrl || "");
//               }}
//               className={`${styles.iconBtn} ${styles.editBtn}`}
//                 title="Edit Url name"

//             >
//               <Pencil size={20} strokeWidth={2} />


//             </button>
//           )}
//         </div>

//         {/* Add/Edit Input section */}
//         {(!agent?.ventryUrl || isEditing) && (
//           <>
//             <div className={styles.inputSection}>
//               <label className={styles.label}>
//                 {isEditing ? "Edit Url name" : "Add Url name"}
//               </label>
//               <input
//                 type="text"
//                 value={ventryUrl}
//                 onChange={(e) => setVentryUrl(e.target.value)}
//                 placeholder="Enter Url name"
//                 className={styles.input}
//                 maxLength={30}
//               />
//             </div>

//             <div className={styles.actionBtns}>
//                 <br/>
//               <button
//                 onClick={handleAddOrUpdateVentryUrl}
//                 className={styles.addBtn}
//                 disabled={loading}
//               >
//                 {loading
//                   ? "Saving..."
//                   : isEditing
//                   ? "Update Vanity URL"
//                   : "Add Vanity URL"}
//               </button>

//               {isEditing && (
//                 <button
//                   onClick={() => {
//                     setIsEditing(false);
//                     setVentryUrl("");
//                     setMessage({ type: "", text: "" });
//                   }}
//                   className={styles.cancelBtn}
//                 >
//                   Cancel
//                 </button>
//               )}
//             </div>
//           </>
//         )}

//         {/* Message */}
//         {message.text && (
//           <p
//             className={`${styles.message} ${
//               message.type === "success" ? styles.success : styles.error
//             }`}
//           >
//             {message.text}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PublicCopyUrl;


import React, { useState } from "react";
import styles from "./PublicCopyUrl.module.css";
import { modifyAgentFields } from "../../Store/apiStore";
import { useDashboardStore } from "../../Store/agentZustandStore";
import { Pencil } from "lucide-react";

const PublicCopyUrl = ({ agent, isRefresh, isEditMode }) => {
  const { setHasFetched } = useDashboardStore();

  const [ventryUrl, setVentryUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(isEditMode);
  const [message, setMessage] = useState({ type: "", text: "" });

  const token = localStorage.getItem("token");

  // Base URL always the same
  const baseUrl = `${process.env.REACT_APP_PUBLIC_WIDGET_DOMAIN}/`;

  // Vanity name (only editable part)
  const vanityName = agent?.ventryUrl || "";

  // Final URL for copy
  const finalUrl = `${baseUrl}${vanityName}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddOrUpdateVentryUrl = async () => {
    const trimmedValue = ventryUrl.trim();

    if (!trimmedValue) {
      setMessage({ type: "error", text: "Please enter a valid Vanity URL" });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const agentId = agent?.agent_id;
      const res = await modifyAgentFields(agentId, trimmedValue, token);

      if (res?.success) {
        setMessage({
          type: "success",
          text: isEditing
            ? "Vanity URL updated successfully!"
            : "Vanity URL added successfully!",
        });
        setVentryUrl("");
        setHasFetched(true);
        isRefresh();
        setIsEditing(false);
      } else {
        setMessage({
          type: "error",
          text:
            res?.data?.response?.data?.message ||
            "Failed to update Vanity URL",
        });
      }
    } catch (error) {
      console.error("Error updating URL:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Public URL</h2>

        {/* Final Display + Copy + Edit */}
        <div className={styles.urlBox}>
          <input type="text" readOnly value={finalUrl} className={styles.urlInput} />

          <button onClick={handleCopy} className={styles.copyBtn}>
            {copied ? "Copied!" : "Copy"}
          </button>

          {agent?.ventryUrl && !isEditing && (
            <button
              onClick={() => {
                setIsEditing(true);
                setVentryUrl(agent?.ventryUrl || "");
              }}
              className={`${styles.iconBtn} ${styles.editBtn}`}
              title="Edit URL"
            >
              <Pencil size={20} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Add/Edit UI Section */}
        {(!agent?.ventryUrl || isEditing) && (
          <>
            <div className={styles.inputSection}>
              <label className={styles.label}>
                {isEditing ? "Edit Vanity URL" : "Add Vanity URL"}
              </label>

              <div className={styles.urlEditContainer}>
                <span className={styles.baseUrl}>{baseUrl}</span>

                <input
                  type="text"
                  value={ventryUrl}
                  onChange={(e) => setVentryUrl(e.target.value)}
                  placeholder="your-keyboards"
                  className={styles.editableInput}
                  maxLength={30}
                />
              </div>
            </div>

            <div className={styles.actionBtns}>
              <button
                onClick={handleAddOrUpdateVentryUrl}
                className={styles.addBtn}
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : isEditing
                  ? "Update Vanity URL"
                  : "Add Vanity URL"}
              </button>

              {isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setVentryUrl("");
                    setMessage({ type: "", text: "" });
                  }}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              )}
            </div>
          </>
        )}

        {message.text && (
          <p
            className={`${styles.message} ${
              message.type === "success" ? styles.success : styles.error
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
};

export default PublicCopyUrl;
