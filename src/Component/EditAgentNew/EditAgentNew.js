import React, { useEffect, useState } from 'react'
import styles from '../EditAgentNew/EditAgentNew.module.css'
import EditHeader from '../EditHeader/EditHeader';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUserAgentMergedDataForAgentUpdate } from '../../Store/apiStore';
import Loader from '../Loader/Loader';
import Loader2 from '../Loader2/Loader2';

const EditAgentNew = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { agentId, businessId } = location.state || {};
  const [editAgentId, setEditAgentID] = useState(sessionStorage.getItem('SelectAgentId') || null);
  const [editBusinessId, setBusinessId] = useState(sessionStorage.getItem('SelectAgentBusinessId') || null);
  const [agentName, setAgentName] = useState(sessionStorage.getItem("agentName") || "")
  const agentnm = sessionStorage.getItem("agentName");
  const [loading, setLoading] = useState(true);
  // console.log('agentnm',agentnm,agentId, businessId)
  useEffect(() => {
    setAgentName(agentnm)
  }, [agentnm])
  const defaultSteps = [
    {
      number: 1,
      title: 'Business Type',
      desc: 'Edit: Business List',
      active: true,
      link: '/edit-business-type'
    },
    {
      number: 2,
      title: 'Services Offered',
      desc: 'Edit: Business Services & More.',
      link: '/edit-services-offered'
    },
    {
      number: 3,
      title: 'Public Listing',
      desc: 'Edit: Google listing, Website URL.',
      link: '/edit-public-listing'
    },
    {
      number: 4,
      title: 'Business Details',
      desc: 'Edit: Name, Email, Phone Nu...',
      link: '/edit-business-detail'
    },
    {
      number: 5,
      title: 'Agent Language',
      desc: 'Edit: Language.',
      link: '/edit-language'
    },
    {
      number: 6,
      title: 'Agent Gender',
      desc: 'Edit: Gender, Voice.',
      link: '/edit-gender'
    },
    {
      number: 7,
      title: 'Name & Avatar',
      desc: 'Edit: Name, Avtar, Type.',
      link: '/edit-name-avtar'
    },
  ];
  const [steps, setSteps] = useState(defaultSteps);


  const fetchPrevAgentDEtails = async (agent_id, businessId) => {
    try {
      const response = await getUserAgentMergedDataForAgentUpdate(
        agent_id,
        businessId
      );

      const agent = response?.data?.agent;
      const business = response?.data?.business;
      const scrapedUrls = business.scrapedUrls
      sessionStorage.setItem("subType", business?.subType)
      sessionStorage.setItem("scrapedUrls", scrapedUrls);
      sessionStorage.setItem("UpdationModeStepWise", "ON");
      sessionStorage.setItem("agentName", agent.agentName);
      sessionStorage.setItem("agentGender", agent.agentGender);
      sessionStorage.setItem("agentLanguageCode", agent.agentLanguageCode);
      sessionStorage.setItem("agentLanguage", agent.agentLanguage);
      sessionStorage.setItem("llmId", agent.llmId);
      sessionStorage.setItem("agent_id", agent.agent_id);
      sessionStorage.setItem("knowledgeBaseId", agent.knowledgeBaseId);
      sessionStorage.setItem("agentCode", agent?.agentCode);
      sessionStorage.setItem("chat_agent_id", agent?.chat_agent_id)
      sessionStorage.setItem("chat_llm_id", agent?.chat_llm_id)
      //need to clear later
      localStorage.setItem("UpdationMode", "ON");
      localStorage.setItem("UpdationModeStepWise", "ON");
      localStorage.setItem("agentName", agent.agentName);
      localStorage.setItem("agentGender", agent.agentGender);
      localStorage.setItem("agentLanguageCode", agent.agentLanguageCode);
      localStorage.setItem("agentLanguage", agent.agentLanguage);
      localStorage.setItem("llmId", agent.llmId);
      localStorage.setItem("agent_id", agent.agent_id);
      localStorage.setItem("knowledgeBaseId", agent.knowledgeBaseId);
      localStorage.setItem("agentRole", agent.agentRole);
      localStorage.setItem("agentVoice", agent.agentVoice);
      localStorage.setItem("agentVoiceAccent", agent.agentAccent);
      localStorage.setItem("avatar", agent.avatar);
      sessionStorage.setItem("googleListing", business.googleUrl);
      sessionStorage.getItem("displayBusinessName");
      localStorage.setItem("googleUrl", business.googleUrl);
      localStorage.setItem("webUrl", business.webUrl);
      localStorage.setItem("aboutBusiness", business.aboutBusiness);

      localStorage.setItem(
        "additionalInstruction",
        business.additionalInstruction
      );
      localStorage.setItem("knowledge_base_name", business.knowledge_base_name);
      localStorage.setItem("knowledge_base_id", business.knowledge_base_id);
      sessionStorage.setItem("callRecording", agent.CallRecording == 1 ? true : false)
      sessionStorage.setItem("state", business.state);
      //need to clear above

      sessionStorage.setItem(
        "aboutBusinessForm",
        JSON.stringify({
          businessUrl: business.webUrl,
          googleListing: business.googleUrl,
          aboutBusiness: business.aboutBusiness,
          note: business.additionalInstruction,
          isGoogleListing: business.isGoogleListing,
          isWebsiteUrl: business.isWebsiteUrl
        })
      );

      sessionStorage.setItem("agentRole", agent.agentRole);
      sessionStorage.setItem("agentVoice", agent.agentVoice);
      sessionStorage.setItem("agentVoiceAccent", agent.agentAccent);
      sessionStorage.setItem("avatar", agent.avatar);
      sessionStorage.setItem("businessDetails", agent.business);
      sessionStorage.setItem("businessId", agent.businessId);
      sessionStorage.setItem("bId", agent.businessId);
      sessionStorage.setItem("displayBusinessName", business.googleBusinessName);

      sessionStorage.setItem("agentRole", agent.agentRole);
      sessionStorage.setItem("agentVoice", agent.agentVoice);
      sessionStorage.setItem("agentVoiceAccent", agent.agentAccent);
      sessionStorage.setItem("avatar", agent.avatar);
      sessionStorage.setItem("businessDetails", agent.business);
      sessionStorage.setItem("businessId", agent.businessId);
      sessionStorage.setItem("bId", agent.businessId);

      const businessData = {
        userId: business.userId,
        businessType: business.businessType,
        businessName: business.businessName.trim(),
        businessSize: business.businessSize,
        customBuisness: business.customBuisness,
        subType: business.subType,
      };
      let parsedServices = safeParse(business.buisnessService, []);
      sessionStorage.setItem(
        "businesServices",
        JSON.stringify({
          selectedService: parsedServices,
          email: business.buisnessEmail,
        })
      );
      //custome servce filter and save

      let rawCustomServices = business?.customServices || [];

      if (typeof rawCustomServices === "string") {
        try {
          rawCustomServices = JSON.parse(rawCustomServices);
        } catch (err) {
          console.error("Failed to parse customServices:", rawCustomServices);
          rawCustomServices = [];
        }
      }

      const cleanedCustomServices = Array.isArray(rawCustomServices)
        ? rawCustomServices
          .map((item) => item?.service?.trim())
          .filter(Boolean)
          .map((service) => ({ service }))
        : [];


      sessionStorage.setItem(
        "selectedCustomServices",
        JSON.stringify(cleanedCustomServices)
      );

      sessionStorage.setItem("businessDetails", JSON.stringify(businessData));
      let raw_knowledge_base_texts = business?.knowledge_base_texts || [];

      if (typeof raw_knowledge_base_texts === "string") {
        try {
          raw_knowledge_base_texts = JSON.parse(raw_knowledge_base_texts);
        } catch (err) {
          console.error("Failed to parse customServices:", raw_knowledge_base_texts);
          raw_knowledge_base_texts = [];
        }
      }

      sessionStorage.setItem(
        "placeDetailsExtract",
        JSON.stringify(raw_knowledge_base_texts)
      );
      sessionStorage.setItem("agentNote", agent?.additionalNote);

      const agentGeneralTools = agent.generalTools;
      sessionStorage.setItem(
        "agentGeneralTools", JSON.stringify(agentGeneralTools || [])
      );

      const kb = safeParse(business?.knowledge_base_texts, {});

      const dynamicDesc = {
        1: business?.businessType || null,
        2: business?.buisnessService
          ? safeParse(business.buisnessService, []).join(", ")
          : null,
        3: business?.googleBusinessName || business.webUrl
          ? `${business.googleBusinessName || "N/A"}, ${business.webUrl || "N/A"}`
          : null,
        4: business?.businessName
          ? [business.businessName, kb?.phone, kb?.address, kb?.email]
            .filter(Boolean)
            .join(",\n")
          : null,
        5: agent?.agentLanguage || null,
        6: agent?.agentGender
          ? `${agent.agentGender.charAt(0).toUpperCase() + agent.agentGender.slice(1).toLowerCase()} , ${agent.agentVoice.split("-")[1] || ""}`
          : null,
        7: agent?.agentName
          ? `${agent.agentName}`
          : null,
      };
      // update steps (agar data mila toh overwrite, warna fallback desc hi rahegi)
      setSteps(prev =>
        prev.map(step => ({
          ...step,
          desc: dynamicDesc[step.number] || step.desc
        }))
      );
    } catch (error) {
      console.log("An Error Occured while fetching Agent Data for ", error);
    } finally { setLoading(false) }
  };

  useEffect(() => {
    if ((agentId || editAgentId) && (businessId || editBusinessId)) {
      fetchPrevAgentDEtails(agentId || editAgentId, businessId || editBusinessId);
    }
  }, [editAgentId, editBusinessId])



  return (
    <div>
      {
        loading ?
          <Loader2 />
          :
          <>
            <EditHeader title='Agent name' agentName={agentName} />
            <div className={styles.wrapper}>
              <div className={styles.stepsContainer}>
                {steps.map((step, index) => (
                  <div key={index} className={styles.card} onClick={() => navigate(step.link)}>
                    <span className={styles.stepNumber}>{step.number}</span>
                    <div className={styles.content}>
                      <h4>{step.title}</h4>
                      <p style={{ whiteSpace: "pre-line" }}>{step.desc}</p>
                    </div>
                    <div className={styles.icon}>
                      <img src="/svg/edit-svg2.svg" alt="Edit" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
      }
    </div>
  )
}

export default EditAgentNew

const safeParse = (value, fallback = null) => {
  try {
    if (typeof value === "string") {
      const cleaned = value.trim();
      if (
        (cleaned.startsWith("[") && cleaned.endsWith("]")) ||
        (cleaned.startsWith("{") && cleaned.endsWith("}")) ||
        (cleaned.startsWith('"') && cleaned.endsWith('"'))
      ) {
        return JSON.parse(cleaned);
      }
    }
    return value;
  } catch {
    return fallback;
  }
};
