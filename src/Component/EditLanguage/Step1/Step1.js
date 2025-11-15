import React, {
    useEffect,
    useState,
    useRef,
    forwardRef,
    useImperativeHandle,
} from "react";
import styles from "./Step1.module.css";
const Step1 = forwardRef(({ onNext, onBack, onValidationError, onSuccess, onFailed, setLoading, onStepChange  }, ref) => {
    const [selectedLang, setSelectedLang] = useState();
    const [selectedLangCode, setSelectedLangCode] = useState("");
    const languages = [
        /* English family */
        {
            name: "English (US)",
            locale: "en-US",
            flag: "/images/en-US.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "English (India)",
            locale: "en-IN",
            flag: "/images/en-IN.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "English (UK)",
            locale: "en-GB",
            flag: "/images/en-GB.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "English (Australia)",
            locale: "en-AU",
            flag: "/images/en-AU.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "English (New Zealand)",
            locale: "en-NZ",
            flag: "/images/en-NZ.png",
            percentage: "—",
            stats: "—",
        },

        /* Germanic & Nordic */
        {
            name: "German",
            locale: "de-DE",
            flag: "/images/de-DE.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Dutch",
            locale: "nl-NL",
            flag: "/images/nl-NL.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Danish",
            locale: "da-DK",
            flag: "/images/da-DK.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Finnish",
            locale: "fi-FI",
            flag: "/images/fi-FI.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Norwegian",
            locale: "no-NO",
            flag: "/images/no-NO.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Swedish",
            locale: "sv-SE",
            flag: "/images/sv-SE.png",
            percentage: "—",
            stats: "—",
        },

        /* Romance */
        {
            name: "Spanish (Spain)",
            locale: "es-ES",
            flag: "/images/es-ES.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Spanish (LatAm)",
            locale: "es-419",
            flag: "/images/es-ES.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "French (France)",
            locale: "fr-FR",
            flag: "/images/fr-FR.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "French (Canada)",
            locale: "fr-CA",
            flag: "/images/fr-CA.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Italian",
            locale: "it-IT",
            flag: "/images/it-IT.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Portuguese (Portugal)",
            locale: "pt-PT",
            flag: "/images/pt-PT.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Portuguese (Brazil)",
            locale: "pt-BR",
            flag: "/images/pt-BR.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Catalan",
            locale: "ca-ES",
            flag: "/images/ca-ES.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Romanian",
            locale: "ro-RO",
            flag: "/images/ro-RO.png",
            percentage: "—",
            stats: "—",
        },

        /* Slavic & Baltic */
        {
            name: "Polish",
            locale: "pl-PL",
            flag: "/images/pl-PL.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Russian",
            locale: "ru-RU",
            flag: "/images/ru-RU.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Bulgarian",
            locale: "bg-BG",
            flag: "/images/bg-BG.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Slovak",
            locale: "sk-SK",
            flag: "/images/sk-SK.png",
            percentage: "—",
            stats: "—",
        },

        /* Hellenic & Uralic */
        {
            name: "Greek",
            locale: "el-GR",
            flag: "/images/el-GR.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Hungarian",
            locale: "hu-HU",
            flag: "/images/hu-HU.png",
            percentage: "—",
            stats: "—",
        },

        /* Asian */
        {
            name: "Hindi",
            locale: "hi-IN",
            flag: "/images/hi-IN.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Japanese",
            locale: "ja-JP",
            flag: "/images/ja-JP.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Korean",
            locale: "ko-KR",
            flag: "/images/ko-KR.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Chinese (Mandarin)",
            locale: "zh-CN",
            flag: "/images/zh-CN.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Vietnamese",
            locale: "vi-VN",
            flag: "/images/vi-VN.png",
            percentage: "—",
            stats: "—",
        },
        {
            name: "Indonesian",
            locale: "id-ID",
            flag: "/images/id-ID.png",
            percentage: "—",
            stats: "—",
        },

        /* Turkic */
        {
            name: "Turkish",
            locale: "tr-TR",
            flag: "/images/tr-TR.png",
            percentage: "—",
            stats: "—",
        },
        {
    name: "Arabic",
    locale: "ar-SA",
    flag: "/images/ar-SA.png",
    percentage: "—",
    stats: "—",
},

        /* Universal / Mixed set */
        {
            name: "Multilingual",
            locale: "multi",
            flag: "/images/multi.png",
            percentage: "—",
            stats: "—",
        },
    ];
useEffect(() => {
    if (selectedLang && selectedLangCode) {
        sessionStorage.setItem("agentLanguage", selectedLang);
        sessionStorage.setItem("agentLanguageCode", selectedLangCode);
    }
}, [selectedLang, selectedLangCode]);
   useEffect(() => {
    // Restore previously selected language from sessionStorage (if exists)
    const lang = sessionStorage.getItem("agentLanguage");
    const code = sessionStorage.getItem("agentLanguageCode");

    if (lang && code) {
        setSelectedLang(lang);
        setSelectedLangCode(code);
    }
}, []);
    //Validation exposed to parent
    useImperativeHandle(ref, () => ({
        validate: () => {
            if (!selectedLang) {
                onValidationError?.({
                    type: "failed",
                    message: "Please select a language first.",
                });
                return false;
            }
            sessionStorage.setItem("selectedLang", selectedLang);
            sessionStorage.setItem("selectedLangCode", selectedLangCode);
            onStepChange?.(6);
            return true;
        },
    }));

    return (
        <>
            <div>
                <div className={styles.slideContent}>
                    <div className={styles.grid}>
                        {languages.filter((lang)=>lang?.locale!='multi').map((lang, index) => (
                            <label
                                key={index}
                                className={`${styles.card} ${selectedLang === lang.name ? styles.active : ""
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="language"
                                    value={lang.name}
                                    checked={selectedLang === lang.name}
                                    onChange={() => {
                                        setSelectedLangCode(lang.locale);
                                        setSelectedLang(lang.name);
                                        onStepChange?.({
                                        lang: lang.name,
                                        code: lang.locale
                                        });
                                    }}
                                    className={styles.radioInput}
                                />
                                <div className={styles.flagWrapper}>
                                    <img
                                        src={`https://flagcdn.com/w80/${lang.locale
                                            ?.split("-")[1]
                                            ?.toLowerCase()}.png`}
                                        alt={lang.name}
                                        className={styles.flag}
                                        onError={(e) => {
                                            if (lang.locale === "multi") {
                                                e.target.src = "/images/multi.png"; // Fallback for multi-language
                                            }
                                            if (lang.locale === "es-419") {
                                                e.target.src = "https://flagcdn.com/w80/es.png"; // Fallback for other languages
                                            }
                                        }
                                        }
                                    />
                                </div>

                                <p className={styles.langName}>{lang.name}</p>
                                {selectedLang === lang.name && (
                                    <span className={styles.langDot}></span>
                                )}
                            </label>
                        ))}
                    </div>
                </div>
            </div>



        </>
    )
})

export default Step1;