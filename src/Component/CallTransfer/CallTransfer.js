import React, { useState, useEffect } from "react";
import styles from "../../Component/CallTransfer/CallTransfer.module.css";
import HeaderBar from "../HeaderBar/HeaderBar";
import {
  addGeneralTools,
  fetchLlmDetails,
  updateLlm,
  getBusinessDetailsByBusinessId,
} from "../../Store/apiStore";
import Loader2 from "../Loader2/Loader2";
import PopUp from "../Popup/Popup";
import AnimatedButton from "../AnimatedButton/AnimatedButton";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const PRESETS = ["Sales", "Billing", "Support"];

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

const dialCodeFromIso2 = (iso2) => {
  if (!iso2) return undefined;
  const entry = Object.entries(dialToCountry).find(
    ([, cc]) => cc === iso2.toLowerCase()
  );
  return entry ? String(entry[0]) : undefined;
};

const countryNameToIso2 = {
  India: "in",
  Australia: "au",
  "United States": "us", 
  "United Kingdom": "gb",
  Canada: "ca",
  Singapore: "sg",
  "New Zealand": "nz",
  Germany: "de",
  France: "fr",
  Italy: "it",
  Spain: "es",
};

const normalizePhoneIntoTransfer = (condition, raw) => {
  if (!raw) return null;
  const clean = String(raw).replace(/[^\d+]/g, "");
  const input = clean.startsWith("+") ? clean : `+${clean}`;
  const parsed = parsePhoneNumberFromString(input);
  if (!parsed || !parsed.isValid()) return null;
  const dial = parsed.countryCallingCode;
  const iso2 =
    parsed.country?.toLowerCase() || (dial && dialToCountry[dial]) || "us";
  const digits = parsed.number.replace("+", "");
  return { condition, phone: digits, dialCode: dial, countryCode: iso2 };
};

const mergeTransfersByCondition = (existing, incoming) => {
  const next = [...existing];
  incoming.forEach((t) => {
    const idx = next.findIndex(
      (x) =>
        x.condition && x.condition.toLowerCase() === t.condition.toLowerCase()
    );
    if (idx >= 0) {
      next[idx] = {
        ...next[idx],
        phone: next[idx].phone || t.phone,
        dialCode: next[idx].dialCode || t.dialCode,
        countryCode: next[idx].countryCode || t.countryCode,
      };
    } else {
      next.push(t);
    }
  });
  return next;
};

// --- helpers for variable key & labels ---
const normalizeCondition = (s = "") =>
  s.trim().replace(/\s+/g, " ").replace(/_/g, " ");
const keyFromCondition = (s = "") =>
  `${normalizeCondition(s).toLowerCase().replace(/\s+/g, "_")}_number`;
const titleCase = (s = "") =>
  normalizeCondition(s)
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());
const inferModeFromCondition = (condition) => {
  const c = (condition || "").trim().toLowerCase();
  if (PRESETS.map((p) => p.toLowerCase()).includes(c)) return "preset";
  if (!c) return "preset"; 
  return "custom";
};

function CallTransfer() {
  const [llmId, setLlmId] = useState("");
  const [transfers, setTransfers] = useState([]);

  // Loading gates
  const [bizLoaded, setBizLoaded] = useState(false);
  const [llmLoaded, setLlmLoaded] = useState(false);

  const [loading, setLoading] = useState(false);
  const [businessDetails, setBusinessDetails] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [prevDynanamicVar, setPrevDynamicVar] = useState({});
  const [removingIndex, setRemovingIndex] = useState(null);

  const getBizDefaults = () => {
    if (!businessDetails) return { iso2: "us", dial: "1" };
    const raw = businessDetails?.knowledge_base_texts?.phone || "";
    const parsed = raw ? parsePhoneNumberFromString(raw) : null;
    let iso2 = parsed?.country ? parsed.country.toLowerCase() : undefined;
    let dial = parsed?.countryCallingCode || undefined;

    if (!iso2) {
      const cc = (businessDetails?.country_code || "").trim();
      if (cc.length === 2) iso2 = cc.toLowerCase();
    }
    if (!dial && iso2) dial = dialCodeFromIso2(iso2);

    if (!iso2) {
      const byName =
        businessDetails?.country && countryNameToIso2[businessDetails.country];
      if (byName) {
        iso2 = byName;
        if (!dial) dial = dialCodeFromIso2(byName);
      }
    }
    return { iso2: iso2 || "us", dial: (dial || "1").replace(/\D/g, "") };
  };

  const createEmptyRow = () => {
    const { iso2, dial } = getBizDefaults();
    return {
      condition: "",
      phone: "",
      dialCode: dial,
      countryCode: iso2,
      _mode: "preset",
      _customName: "",
    };
  };

  const updateTransfer = (index, patch) => {
    setTransfers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const prepareTransfersWithDialCode = (list) =>
    list.map((t) => ({
      ...t,
      condition: normalizeCondition(t.condition || ""),
      phone: (t.phone || "").trim(),
      dialCode: t.dialCode,
      countryCode: t.countryCode,
    }));

  const syncSessionCache = (list) => {
    try {
      const clean = (list || []).map(({ _mode, _customName, ...rest }) => rest);
      sessionStorage.setItem("agentGeneralTools", JSON.stringify(clean));
    } catch {}
  };

  const persistTransfers = async (llmIdParam, transfersList, cleanedPrevVars) => {
    await updateLlm(llmIdParam, { default_dynamic_variables: cleanedPrevVars });
    const formatted = prepareTransfersWithDialCode(
      transfersList.map(({ _mode, _customName, ...rest }) => rest)
    );
    if (formatted.length > 0) {
      await addGeneralTools(llmIdParam, formatted);
      syncSessionCache(formatted);
    } else {
      syncSessionCache([]);
    }
  };

  // 1) Business details
  useEffect(() => {
    const bizId = sessionStorage.getItem("SelectAgentBusinessId");
    if (!bizId) {
      setShowPopup(true);
      setPopupType("failed");
      setPopupMessage(
        "No business selected. Missing 'SelectAgentBusinessId' in session."
      );
      setBizLoaded(true);
      return;
    }
    (async () => {
      try {
        const data = await getBusinessDetailsByBusinessId(bizId);
        const biz = data?.data ?? data ?? null;
        setBusinessDetails(biz);
      } catch (error) {
        console.error("Error fetching business details:", error?.response?.data || error?.message || error);
        setShowPopup(true);
        setPopupType("failed");
        setPopupMessage(
          "Failed to fetch business details. " +
            (error?.response?.data || error?.message || "")
        );
      } finally {
        setBizLoaded(true);
      }
    })();
  }, []);

  // 2) LLM details + hydrate transfers from ALL *_number vars
  useEffect(() => {
    const agentData = JSON.parse(sessionStorage.getItem("agentDetails"));
    setLlmId(agentData?.agent?.llmId || "");

    fetchLlmDetails(agentData?.agent?.llmId)
      .then((res) => {
        const vars = res?.data?.data?.default_dynamic_variables || {};
        setPrevDynamicVar(vars);

        const incoming = [];
        Object.entries(vars).forEach(([k, v]) => {
          if (!k.endsWith("_number")) return;
          const rawCond = k.replace(/_number$/, "");
          const condition = normalizeCondition(rawCond.replace(/_/g, " "));
          const t = normalizePhoneIntoTransfer(condition, v);
          if (t) {
            incoming.push(t);
          }
        });

        if (incoming.length > 0) {
          setTransfers((prev) => {
            const merged = mergeTransfersByCondition(prev, incoming);
            return merged.map((r) => ({
              ...r,
              _mode: inferModeFromCondition(r.condition),
              _customName: inferModeFromCondition(r.condition) === "custom" ? r.condition : "",
            }));
          });
        }
      })
      .catch((e) => console.error("Failed to fetch LLM details", e))
      .finally(() => setLlmLoaded(true));
  }, []);

  // 3) After BOTH loads: if there are no numbers, create ONE blank row with business defaults
  useEffect(() => {
    if (!bizLoaded || !llmLoaded) return;
    if (transfers.length === 0) {
      setTransfers([createEmptyRow()]);
    }
  }, [bizLoaded, llmLoaded]);

  // 4) From business details, preselect country/dial ONLY for rows that still lack a phone
  useEffect(() => {
    if (!businessDetails) return;
    const rawBizPhone = businessDetails?.knowledge_base_texts?.phone || "";
    const parsedBiz = rawBizPhone ? parsePhoneNumberFromString(rawBizPhone) : null;

    let iso2 = parsedBiz?.country ? parsedBiz.country.toLowerCase() : undefined;
    let dialCode = parsedBiz?.countryCallingCode || undefined;

    if (!iso2) {
      const cc = (businessDetails?.country_code || "").trim();
      if (cc.length === 2) iso2 = cc.toLowerCase();
    }
    if (!dialCode && iso2) dialCode = dialCodeFromIso2(iso2);

    if (!iso2) {
      const byName =
        businessDetails?.country && countryNameToIso2[businessDetails.country];
      if (byName) {
        iso2 = byName;
        if (!dialCode) dialCode = dialCodeFromIso2(byName);
      }
    }

    if (iso2 || dialCode) {
      setTransfers((prev) =>
        prev.map((t) =>
          t.phone
            ? t
            : {
                ...t,
                countryCode: (iso2 || t.countryCode || "us").toLowerCase(),
                dialCode: (dialCode || t.dialCode || "1").replace(/\D/g, ""),
              }
        )
      );
    }
  }, [businessDetails]);

  const handleAdd = () => {
    const hasBlank = transfers.some(
      (t) => !(t.condition || "").trim() && !(t.phone || "").trim()
    );
    if (hasBlank) {
      setShowPopup(true);
      setPopupType("failed");
      setPopupMessage("Finish the current empty row before adding another.");
      return;
    }
    setTransfers((prev) => [...prev, createEmptyRow()]);
  };

  // IMMEDIATE REMOVE (no Submit needed)
  const handleRemove = async (index) => {
    const removed = transfers[index];
    const remaining = transfers.filter((_, i) => i !== index);
    const insertedEmpty = remaining.length === 0;

    setRemovingIndex(index);
    setTransfers(insertedEmpty ? [createEmptyRow()] : remaining);

    const hadData =
      (removed?.condition && removed.condition.trim()) ||
      (removed?.phone && removed.phone.trim());

    if (!hadData) {
      setRemovingIndex(null);
      return;
    }

    try {
      const cleanedPrev = { ...prevDynanamicVar };
      const varKey =
        removed?.condition && keyFromCondition(removed.condition || "");
      if (varKey && cleanedPrev[varKey]) delete cleanedPrev[varKey];

      await persistTransfers(llmId, remaining, cleanedPrev);

      setPrevDynamicVar(cleanedPrev);
      setShowPopup(true);
      setPopupType("success");
      setPopupMessage("Number removed.");
    } catch (err) {
      setTransfers((prev) => {
        if (insertedEmpty) return [removed];
        const back = [...prev];
        back.splice(index, 0, removed);
        return back;
      });
      setShowPopup(true);
      setPopupType("failed");
      setPopupMessage(
        "Failed to remove number: " +
          (err?.response?.data || err?.message || err)
      );
      console.error("Remove failed:", err?.response?.data || err?.message || err);
    } finally {
      setRemovingIndex(null);
    }
  };

  const handleSubmit = async () => {
    try {
      if (transfers.length === 0) {
        setShowPopup(true);
        setPopupType("failed");
        setPopupMessage("Please add at least one department number.");
        return;
      }

      const conditionCounts = {};
      for (const t0 of transfers) {
        const cond = normalizeCondition(t0.condition || "").toLowerCase();
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

      for (const [i, t] of transfers.entries()) {
        const finalCond =
          t._mode === "custom"
            ? normalizeCondition(t._customName)
            : normalizeCondition(t.condition);
        if (t._mode === "custom") {
          if (!finalCond) {
            setShowPopup(true);
            setPopupType("failed");
            setPopupMessage(`Custom name is required for entry ${i + 1}.`);
            return;
          }
        }
        const phone = (t.phone || "").trim();
        const dialCode = (t.dialCode || "").trim();
        if (!phone || !dialCode) {
          setShowPopup(true);
          setPopupType("failed");
          setPopupMessage(
            `Phone number and dial code are required for entry ${i + 1}.`
          );
          return;
        }

        const parsed = parsePhoneNumberFromString(`+${phone}`);
        if (!parsed || parsed.country?.toLowerCase() !== t.countryCode) {
          setShowPopup(true);
          setPopupType("failed");
          setPopupMessage(
            `Invalid phone number for entry ${i + 1}. Ensure it matches +${
              t.dialCode
            } (${t.countryCode.toUpperCase()}).`
          );
          return;
        }
      }

      setLoading(true);

      const finalized = transfers.map((t) => ({
        ...t,
        condition:
          t._mode === "custom"
            ? normalizeCondition(t._customName)
            : normalizeCondition(t.condition),
      }));

      const timestamp = Date.now();
      const formattedTransfers = prepareTransfersWithDialCode(
        finalized.map(({ _mode, _customName, ...rest }) => rest)
      );
      const dynamicVars = {};
      formattedTransfers.forEach((t) => {
        const key = keyFromCondition(t.condition);
        dynamicVars[key] = `+${t.phone}`;
      });
      const lines = formattedTransfers.map((t) => {
        const label = titleCase(t.condition);
        const key = keyFromCondition(t.condition);
        return `If they say ${label}, transfer to {{${key}}}.`;
      });
      const fullPrompt = (
        `The user might ask to be transferred to departments. ` +
        lines.join(" ") +
        ` Use the appropriate number based on the conversation.`
      ).trim();

      const transferTool = {
        type: "transfer_call",
        name: `transfer_on_inferred_${timestamp}`,
        transfer_destination: { type: "inferred", prompt: fullPrompt },
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
      const cleanedPrev = { ...prevDynanamicVar };
      Object.keys(cleanedPrev).forEach((k) => {
        if (/_number$/.test(k)) delete cleanedPrev[k];
      });

      const payload = {
        general_tools: [transferTool],
        default_dynamic_variables: { ...cleanedPrev, ...dynamicVars },
      };

      await updateLlm(llmId, payload);
      await addGeneralTools(llmId, formattedTransfers);
      syncSessionCache(formattedTransfers);

      setPrevDynamicVar({ ...cleanedPrev, ...dynamicVars });

      setShowPopup(true);
      setPopupType("success");
      setPopupMessage("Numbers updated successfully.");
    } catch (error) {
      setShowPopup(true);
      setPopupType("failed");
      setPopupMessage(
        "Failed to update LLM: " +
          (error?.response?.data || error.message || error)
      );
      console.error("Failed to update LLM:", error?.response?.data || error.message || error);
    } finally {
      setLoading(false);
    }
  };

  const initializing = !bizLoaded || !llmLoaded;

  return (
    <>
      {initializing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,255,255,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
        >
          <Loader2 />
        </div>
      )}

      <div
        className={styles.CallTransferMainDiv}
        style={{ opacity: initializing ? 0.4 : 1 }}
      >
        <HeaderBar title="Dynamic Call Transfer" />
        <div className={styles.CallTransferMain}>
          <div className={styles.headrPart}>
            <h2>Call Transfer Conditions</h2>
            <img
              src="svg/Add-icon.svg"
              alt="Add-icon"
              onClick={handleAdd}
              style={{
                cursor: "pointer",
                opacity: transfers.some(
                  (t) => !(t.condition || "").trim() && !(t.phone || "").trim()
                )
                  ? 0.5
                  : 1,
                pointerEvents: transfers.some(
                  (t) => !(t.condition || "").trim() && !(t.phone || "").trim()
                )
                  ? "none"
                  : "auto",
              }}
            />
          </div>

          {transfers.map((item, index) => {
            const mode = item._mode || inferModeFromCondition(item.condition);
            const selectedPreset = PRESETS.find(
              (p) => p.toLowerCase() === (item.condition || "").toLowerCase()
            );

            return (
              <div
                key={`${item.condition || "row"}-${index}`}
                className={styles.card}
                style={{
                  marginBottom:
                    index === transfers.length - 1 ? "5rem" : undefined,
                }}
              >
                <div className={styles.selectWrapper}>
                  <div className={styles.toplabelRow}>
                  <label className={styles.label}>Department</label>
                  {transfers.length > 0 && (
                  <button
                    onClick={() => handleRemove(index)}
                    className={styles.removeBtn}
                    disabled={removingIndex === index}
                    title={removingIndex === index ? "" : "X"}
                  >
                    {removingIndex === index ? "" : "X"}
                  </button>
                )}
                  </div>
                  
                  <select
                    className={styles.select}
                    value={mode === "custom" ? "Custom" : selectedPreset || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Custom") {
                        updateTransfer(index, {
                          _mode: "custom",
                          _customName:
                            item._customName ||
                            (selectedPreset ? "" : item.condition),
                          condition: "",
                        });
                      } else {
                        updateTransfer(index, {
                          _mode: "preset",
                          condition: val,
                          _customName: "",
                        });
                      }
                    }}
                  >
                    <option value="">Select Department</option>
                    {PRESETS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                    <option value="Custom">Custom</option>
                  </select>
                  {mode === "custom" && (
                    <input
                      className={styles.select}
                      style={{ marginTop: 8 }}
                      placeholder="Enter custom department (e.g., Partner Success)"
                      value={item._customName || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateTransfer(index, {
                          _customName: v,
                        });
                      }}
                    />
                  )}

                  {/* <img
                    src="svg/select-arrow.svg"
                    alt="arrow"
                    className={styles.arrowIcon}
                  /> */}
                </div>

                <label className={styles.label}>Forward to</label>
                <div className={styles.phoneInput}>
                  <PhoneInput
                    country={item.countryCode}
                    enableSearch
                    value={item.phone}
                    onChange={(val, c) => {
                      const dialCode = c?.dialCode || item.dialCode;
                      const countryCode = (
                        c?.countryCode || item.countryCode
                      ).toLowerCase();
                      const digits = (val || "").replace(/\D/g, "");
                      const normalized = digits.startsWith(dialCode)
                        ? digits
                        : dialCode + digits;
                      updateTransfer(index, {
                        phone: normalized,
                        dialCode,
                        countryCode,
                      });
                    }}
                    inputClass={styles.phoneNumberInput}
                    dropdownClass={styles.phoneDropdown}
                    inputStyle={{
                      border: "unset",
                      boxShadow: "none",
                      outline: "none",
                    }}
                    dropdownStyle={{ border: "unset", boxShadow: "none" }}
                  />
                </div>

                
              </div>
            );
          })}

          <div className={styles.Btn} onClick={handleSubmit}>
            <div type="submit">
              <div className={styles.btnTheme}>
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