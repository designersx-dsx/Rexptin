import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "../Step4/Step4.module.css";
const Step4 = forwardRef(
  (
    {
      onNext,
      onBack,
      onValidationError,
      loading,
      setLoading,
      detectRoleTypeChange,


    },
    ref
  ) => {
    const [agentNote, setAgentNote] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const storedWidgetState =
      typeof window !== "undefined"
        ? sessionStorage.getItem("chatWebWidget")
        : null;
    const [isChatWidgetEnabled, setIsChatWidgetEnabled] = useState(
      storedWidgetState ? storedWidgetState === "true" : true
    );
    
    useEffect(() => {
      const storedAgentRole = sessionStorage.getItem("agentRole");
      const storedNote = sessionStorage.getItem("agentNote");
      const storedWidgetState = sessionStorage.getItem("chatWebWidget");
      if (storedAgentRole) {
        setSelectedRole(storedAgentRole);
      } else {
        setSelectedRole("General Receptionist");
        sessionStorage.setItem("agentRole", "General Receptionist");
        detectRoleTypeChange?.("General Receptionist");
      }

      if (storedNote) {
        setAgentNote(storedNote);
      }
      //  If no widget value yet, set a default once
      if (storedWidgetState === null) {
        sessionStorage.setItem("chatWebWidget", "true");
      }
    }, []);
    // Persist on change
    useEffect(() => {
      sessionStorage.setItem("agentRole", selectedRole);
    }, [selectedRole]);
    useEffect(() => {
      sessionStorage.setItem("agentNote", agentNote);
    }, [agentNote]);
    useEffect(() => {
      sessionStorage.setItem("chatWebWidget", isChatWidgetEnabled);
    }, [isChatWidgetEnabled]);
    // Pass validation and note back to parent
    useImperativeHandle(ref, () => ({
      validate: () => {
        if (!selectedRole?.trim()) {
          onValidationError?.({
            type: "failed",
            message: "Please select a Receptionist Type!",
          });
          return false;
        }

        return {
          isValid: true,
          agentNote: agentNote.trim(),
          chatWebWidget: isChatWidgetEnabled,
        };

      },
    }));
    const roles = [
      {
        title: "General Receptionist",
        description:
          "A general receptionist will pick calls, provide information on your services and products, take appointments and guide callers.",
      },
      {
        title: "LEAD Qualifier",
        description:
          "A LEAD Qualifier handles inbound sales queries and helps identify potential leads for your business.",
      },
    ];
    return (
      <>
        <div>
          <br />
          <div className={styles.widgetCard}>
            <div className={styles.widgetInfo}>
              <p className={styles.widgetTitle}>Chat Web Widget</p>
              <p className={styles.widgetSubtitle}>Intelligent Messaging Agent</p>
            </div>

            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={isChatWidgetEnabled}
                onChange={(e) => setIsChatWidgetEnabled(e.target.checked)}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>
        <div className={`${styles.container} ${loading ? styles.blocked : ""}`}>
          {roles.map((role, index) => (
            <label
              key={index}
              className={`${styles.card} ${selectedRole === role.title ? styles.selected : ""
                }`}
            >
              <div className={styles.forflex}>
                <div className={styles.info}>
                  <p className={styles.title}>{role.title}</p>

                </div>
                <div>
                  <input
                    type="radio"
                    name="receptionist"
                    value={role.title}
                    checked={selectedRole === role.title}
                    onChange={() => {
                      setSelectedRole(role.title);
                      detectRoleTypeChange(role?.title);
                    }}
                    className={styles.radio}
                  />
                  {/* <span className={styles.customRadio}></span> */}
                </div>

              </div>

            </label>

          ))}
        </div>

        {selectedRole && (
          <p className={styles.LastP}>
            {
              roles.find((role) => role?.title === selectedRole)?.description
            }
          </p>
        )}
      </>

    );
  }
);

export default Step4;
