import React, { useState, useEffect } from "react";
import styles from "../../Component/CallTransfer/CallTransfer.module.css";
import HeaderBar from "../HeaderBar/HeaderBar";
import axios from "axios";
import {
  addGeneralTools,
  fetchLlmDetails,
  updateLlm,
} from "../../Store/apiStore";
import Loader from "../Loader/Loader";
import PopUp from "../Popup/Popup";
import AnimatedButton from "../AnimatedButton/AnimatedButton";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const dialToCountry = {
  1: "us",
  20: "eg",
  211: "ss",
  212: "ma",
  213: "dz",
  216: "tn",
  218: "ly",
  220: "gm",
  221: "sn",
  222: "mr",
  223: "ml",
  224: "gn",
  225: "ci",
  226: "bf",
  227: "ne",
  228: "tg",
  229: "bj",
  230: "mu",
  231: "lr",
  232: "sl",
  233: "gh",
  234: "ng",
  235: "td",
  236: "cf",
  237: "cm",
  238: "cv",
  239: "st",
  240: "gq",
  241: "ga",
  242: "cg",
  243: "cd",
  244: "ao",
  245: "gw",
  246: "io",
  247: "ac",
  248: "sc",
  249: "sd",
  250: "rw",
  251: "et",
  252: "so",
  253: "dj",
  254: "ke",
  255: "tz",
  256: "ug",
  257: "bi",
  258: "mz",
  260: "zm",
  261: "mg",
  262: "re",
  263: "zw",
  264: "na",
  265: "mw",
  266: "ls",
  267: "bw",
  268: "sz",
  269: "km",
  290: "sh",
  291: "er",
  297: "aw",
  298: "fo",
  299: "gl",
  30: "gr",
  31: "nl",
  32: "be",
  33: "fr",
  34: "es",
  35: "reserved",
  36: "hu",
  37: "reserved",
  39: "it",
  40: "ro",
  41: "ch",
  42: "cz",
  43: "at",
  44: "gb",
  45: "dk",
  46: "se",
  47: "no",
  48: "pl",
  49: "de",
  50: "reserved",
  51: "pe",
  52: "mx",
  53: "cu",
  54: "ar",
  55: "br",
  56: "cl",
  57: "co",
  58: "ve",
  59: "reserved",
  60: "my",
  61: "au",
  62: "id",
  63: "ph",
  64: "nz",
  65: "sg",
  66: "th",
  67: "reserved",
  68: "reserved",
  69: "reserved",
  7: "ru",
  81: "jp",
  82: "kr",
  84: "vn",
  86: "cn",
  90: "tr",
  91: "in",
  92: "pk",
  93: "af",
  94: "lk",
  95: "mm",
  98: "ir",
  211: "ss",
  212: "ma",
  213: "dz",
  216: "tn",
  218: "ly",
  220: "gm",
  221: "sn",
  222: "mr",
  223: "ml",
  224: "gn",
  225: "ci",
  226: "bf",
  227: "ne",
  228: "tg",
  229: "bj",
  230: "mu",
  231: "lr",
  232: "sl",
  233: "gh",
  234: "ng",
  235: "td",
  236: "cf",
  237: "cm",
  238: "cv",
  239: "st",
  240: "gq",
  241: "ga",
  242: "cg",
  243: "cd",
  244: "ao",
  245: "gw",
  246: "io",
  247: "ac",
  248: "sc",
  249: "sd",
  250: "rw",
  251: "et",
  252: "so",
  253: "dj",
  254: "ke",
  255: "tz",
  256: "ug",
  257: "bi",
  258: "mz",
  260: "zm",
  261: "mg",
  262: "re",
  263: "zw",
  264: "na",
  265: "mw",
  266: "ls",
  267: "bw",
  268: "sz",
  269: "km",
  290: "sh",
  291: "er",
  297: "aw",
  298: "fo",
  299: "gl",
  350: "gi",
  351: "pt",
  352: "lu",
  353: "ie",
  354: "is",
  355: "al",
  356: "mt",
  357: "cy",
  358: "fi",
  359: "bg",
  370: "lt",
  371: "lv",
  372: "ee",
  373: "md",
  374: "am",
  375: "by",
  376: "ad",
  377: "mc",
  378: "sm",
  379: "va",
  380: "ua",
  381: "rs",
  382: "me",
  383: "xk",
  385: "hr",
  386: "si",
  387: "ba",
  389: "mk",
  420: "cz",
  421: "sk",
  423: "li",
  500: "fk",
  501: "bz",
  502: "gt",
  503: "sv",
  504: "hn",
  505: "ni",
  506: "cr",
  507: "pa",
  508: "pm",
  509: "ht",
  590: "gp",
  591: "bo",
  592: "gy",
  593: "ec",
  594: "gf",
  595: "py",
  596: "mq",
  597: "sr",
  598: "uy",
  599: "cw",
  670: "tl",
  672: "aq",
  673: "bn",
  674: "nr",
  675: "pg",
  676: "to",
  677: "sb",
  678: "vu",
  679: "fj",
  680: "pw",
  681: "wf",
  682: "ck",
  683: "nu",
  685: "ws",
  686: "ki",
  687: "nc",
  688: "tv",
  689: "pf",
  690: "tk",
  691: "fm",
  692: "mh",
  850: "kp",
  852: "hk",
  853: "mo",
  855: "kh",
  856: "la",
  880: "bd",
  886: "tw",
  960: "mv",
  961: "lb",
  962: "jo",
  963: "sy",
  964: "iq",
  965: "kw",
  966: "sa",
  967: "ye",
  968: "om",
  971: "ae",
  972: "il",
  973: "bh",
  974: "qa",
  975: "bt",
  976: "mn",
  977: "np",
  992: "tj",
  993: "tm",
  994: "az",
  995: "ge",
  996: "kg",
  998: "uz",
};
function CallTransfer() {
  const [llmId, setLlmId] = useState("");
  const [transfers, setTransfers] = useState([
    { condition: "", phone: "", dialCode: "91", countryCode: "in" },
  ]);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [prevDynanamicVar,setPrevDynamicVar]=useState({})


  const prepareTransfersWithDialCode = (transfers) => {
    return transfers.map((transfer) => {
      console.log(transfer, "transfer");
      let rawPhone = transfer.phone.trim();
      const dialCode = transfer.dialCode;
      const countryCode = transfer.countryCode;
      return {
        ...transfer,
        phone: rawPhone,
        dialCode,
        countryCode,
      };
    });
  };

  useEffect(() => {
    const fetchCountryCode = async () => {
      try {
        // const res = await axios.get("https://ipwho.is/");
        const res = await axios.get("https://ipinfo.io/json");
        const data = res?.data;
        if (data && data.country ) {
          setTransfers((prev) =>
            prev.map((t, i) =>
              i === 0
                ? {
                    ...t,
                    dialCode: data?.phone_code?.replace("+", ""),
                    countryCode: data?.country?.toLowerCase(),
                  }
                : t
            )
          );
        }
      } catch (err) {
        console.error("Failed to fetch IP location:", err);
      }
    };
    fetchCountryCode();
  }, []);

  const handleAdd = () => {
    setTransfers([
      ...transfers,
      { condition: "", phone: "", dialCode: "91", countryCode: "in" },
    ]);
  };

  // const handleRemove = (index) => {
  //   const updated = [...transfers];
  //   updated.splice(index, 1);
  //   setTransfers(updated);
  // };
  const handleRemove = (index) => {
  // remove from transfers
  const updatedTransfers = [...transfers];
  const [removed] = updatedTransfers.splice(index, 1);
  setTransfers(updatedTransfers);

  // remove from prevDynamicVar
  if (removed) {
    setPrevDynamicVar((prev) => {
      const updatedVars = { ...prev };

      const conditionKeyMap = {
        sales: "sales_number",
        billing: "billing_number",
        support: "support_number",
      };

      const keyToRemove = conditionKeyMap[removed.condition?.toLowerCase()];
      if (keyToRemove && updatedVars[keyToRemove]) {
        delete updatedVars[keyToRemove];
      }

      return updatedVars;
    });
  }
};

  const handleChange = (index, field, value) => {
    console.log(index, field, value)
    const updated = [...transfers];
    updated[index][field] = value;

    if (field === "dialCode") {
      const countryCode = dialToCountry[value] || "us";
      updated[index]["countryCode"] = countryCode;
    }
    console.log('updated',updated)
    setTransfers(updated);
  };
  const handleSubmit = async () => {
    try {
      // Check for duplicate conditions
      const conditionCounts = {};
      for (const transfer of transfers) {
        const cond = transfer.condition.toLowerCase().trim();
        if (cond) {
          conditionCounts[cond] = (conditionCounts[cond] || 0) + 1;
          if (conditionCounts[cond] > 1) {
            setShowPopup(true);
            setPopupType("failed");
            setPopupMessage(
              `You cannot add multiple entries for the same department: '${cond}'.`
            );
            return;
          }
        }
      }

      //  Add this validation block here
      for (const [index, transfer] of transfers.entries()) {
        const condition = transfer.condition?.trim();
        const phone = transfer.phone?.trim();
        const dialCode = transfer.dialCode?.trim();
        // console.log(dialCode,phone)
        if (!condition) {
          setShowPopup(true);
          setPopupType("failed");
          setPopupMessage(`Department is required for entry ${index + 1}.`);
          return;
        }

        if (!phone || !dialCode) {
          setShowPopup(true);
          setPopupType("failed");
          setPopupMessage(
            `Phone number and dial code are required for entry ${index + 1}.`
          );
          return;
        }
        const fullNumber = `+${transfer.dialCode}${transfer.phone}`;
        const phoneNumber = parsePhoneNumberFromString(fullNumber);
        // console.log(fullNumber,phoneNumber)
        if (
          !phoneNumber ||
          phoneNumber.country?.toLowerCase() !== transfer.countryCode
        ) {
          setShowPopup(true);
          setPopupType("failed");
          setPopupMessage(
            `Invalid phone number for entry ${
              index + 1
            }. Ensure the number matches the country code +${
              transfer.dialCode
            } (${transfer.countryCode.toUpperCase()}).`
          );
          return;
        }
      }

      setLoading(true);
      sessionStorage.removeItem("agentGeneralTools");
      const timestamp = Date.now();
      const fullPrompt =
        `The user might ask to be transferred to departments.If they say Sales, transfer to {{sales_number}}.If they say Billing, transfer to {{billing_number}}.If they say Support, transfer to {{support_number}}.Use the appropriate number based on the conversation.`.trim();
      const transferTool = {
        type: "transfer_call",
        name: `transfer_on_inferred_${timestamp}`,
        transfer_destination: {
          type: "inferred",
          prompt: fullPrompt,
        },
        transfer_option: {
          type: "cold_transfer",
          public_handoff_option: {
            message:
              "Please hold while I transfer your call to the requested department.",
          },
        },
        speak_during_execution: true,
        speak_after_execution: true,
      };
      const formattedTransfers = prepareTransfersWithDialCode(transfers);

      // Generate dynamic variables from formattedTransfers
      const salesEntry = transfers.find(
        (t) => t.condition.toLowerCase() === "sales"
      );
      const billingEntry = transfers.find(
        (t) => t.condition.toLowerCase() === "billing"
      );
      const supportEntry = transfers.find(
        (t) => t.condition.toLowerCase() === "support"
      );

      const dynamicVars = {
        sales_number: salesEntry
          ? `+${salesEntry.dialCode}${salesEntry.phone}`
          : "",
        billing_number: billingEntry
          ? `+${billingEntry.dialCode}${billingEntry.phone}`
          : "",
        support_number: supportEntry
          ? `+${supportEntry.dialCode}${supportEntry.phone}`
          : "",
      };

      // Remove any empty numbers
      Object.keys(dynamicVars).forEach((key) => {
        if (!dynamicVars[key]) delete dynamicVars[key];
      });

      // Final payload
      const payload = {
        general_tools: [transferTool],
        default_dynamic_variables: {
            ...prevDynanamicVar,  // pehle purane values
            ...dynamicVars,     // phir naye values overwrite karein agar same key ho
          },
      };

      // Call your API to update the LLM config
      await updateLlm(llmId, payload);
      await addGeneralTools(llmId, formattedTransfers);
      setShowPopup(true);
      setPopupType("success");
      setPopupMessage("Numbers updated successfully.");
      console.log("LLM updated successfully");
    } catch (error) {
      setShowPopup(true);
      setPopupType("failed");
      setPopupMessage(
        "Failed to update LLM:",
        error?.response?.data || error.message || error
      );
      console.error(
        "Failed to update LLM:",
        error?.response?.data || error.message || error
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const agentData = JSON.parse(sessionStorage.getItem("agentDetails"));
    let agentGeneralTools = JSON.parse(
      sessionStorage.getItem("agentGeneralTools")
    );
    setLlmId(agentData?.agent?.llmId || "");
    fetchLlmDetails(agentData?.agent?.llmId).then((res) => {
  const vars = res?.data?.data?.default_dynamic_variables || {};
  setPrevDynamicVar(vars);
    });

    let tools = agentGeneralTools;

if (typeof agentGeneralTools === "string") {
  try {
    agentGeneralTools = JSON.parse(tools);
  } catch (e) {
    console.error("Invalid JSON for agentGeneralTools", e);
    agentGeneralTools = [];
  }
}
// console.log("agentGeneralTools raw:", agentGeneralTools, Array.isArray(agentGeneralTools));

    if (Array.isArray(agentGeneralTools)) {
      // Set transfers only if tools exist
      if (Array.isArray(agentGeneralTools) && agentGeneralTools.length > 0) {
        console.log('agentGeneralTools1',agentGeneralTools,prevDynanamicVar)
        // Optional: filter only those tools that have required fields
        const filteredTransfers = agentGeneralTools
          .filter((tool) => tool.condition && tool.phone && tool.dialCode)
          .map((tool) => ({
            condition: tool.condition,
            phone: tool.phone,
            dialCode: tool.dialCode,
            countryCode: tool.countryCode || "",
          }));
        // console.log('agentGeneralTools2',agentGeneralTools)

        setTransfers(filteredTransfers);
      }
    }
  }, []);
  // console.log('transfers',transfers)
      console.log('default_dynamic_variables',prevDynanamicVar)

  return (
    <>
    <div className={styles.CallTransferMainDiv}>


      <HeaderBar title="Dynamic Call Transfer" />
      <div className={styles.CallTransferMain}>
        <div className={styles.headrPart}>
          <h2>Call Transfer Conditions</h2>
          <img
            src="svg/Add-icon.svg"
            alt="Add-icon"
            onClick={handleAdd}
            style={{ cursor: "pointer" }}
          />
        </div>

        {transfers.map((item, index) => (
          <div key={index} className={styles.card} style={{
      marginBottom: index === transfers.length - 1 ? "5rem" : undefined
    }}>
            <div className={styles.selectWrapper}>
              <label className={styles.label}>
                Condition for Agent to follow
              </label>
              <select
                className={styles.select}
                value={item.condition}
                onChange={(e) =>
                  handleChange(index, "condition", e.target.value)
                }
              >
                <option value="">Select Department</option>
                <option value="sales">Sales</option>
                <option value="billing">Billing</option>
                <option value="support">Support</option>
              </select>
              <img
                src="svg/select-arrow.svg"
                alt="arrow"
                className={styles.arrowIcon}
              />
            </div>

            <label className={styles.label}>Forward to</label>
            <div className={styles.phoneInput}>
              <div className={styles.countryCode}>
                <img
                  src={`https://flagcdn.com/24x18/${item.countryCode}.png`}
                  alt="flag"
                  onError={(e) => (e.target.style.display = "none")}
                />
                <input
                  type="text"
                  value={item.dialCode}
                  maxLength={4}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    const updated = [...transfers];
                    updated[index].dialCode = value;
                    updated[index].countryCode =
                      dialToCountry[value] || updated[index].countryCode;
                    setTransfers(updated);
                  }}
                  className={styles.dialCodeInput}
                  placeholder="Code"
                />
              </div>
              <input
                type="tel"
                className={styles.phoneNumberInput}
                placeholder="985 XXX 88XX"
                value={item.phone}
                maxLength={15}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,15}$/.test(value)) {
                    handleChange(index, "phone", value);
                  }
                }}
              />
            </div>

            {transfers.length > 1 && (
              <button
                onClick={() => handleRemove(index)}
                className={styles.removeBtn}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <div className={styles.Btn} onClick={handleSubmit}>
          <div type="submit">
            <div className={styles.btnTheme}>
              {/* <p>{loading ? <Loader size={20} /> : "Submit"}</p> */}
              <AnimatedButton isLoading={loading} label="Submit" />
            </div>
          </div>
        </div>
      </div>
          </div>
      {showPopup && (
        <PopUp
          type={popupType}
          onClose={() => setShowPopup(false)}
          message={popupMessage}
        />
      )}
    </>
  );
}

export default CallTransfer;
// fdfdf
// ffdfd
// fdfd