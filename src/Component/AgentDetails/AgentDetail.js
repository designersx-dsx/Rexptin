import React, { useEffect, useState } from 'react';
import styles from './AgentDetail.module.css';
// import AgentAnalysis from './AgentAnalysisGraph/AgentAnalysis';
import AgentAnalysis from './AgentAnalysisGraph/AgentAnalysis'
import { fetchAgentDetailById, getTotalBookings } from '../../Store/apiStore';
import { useLocation } from 'react-router-dom';

const AgentDashboard = () => {
   const [totalBookings, setTotalBookings] = useState(null);
   const[loading,setLoading]=useState(true)
   const [agentData,setAgentData]=useState([])
  const location = useLocation();
  const agentDetails = location.state;

  
 useEffect(() => {
    const getAgentDetails = async () => {
      try {
        const response = await fetchAgentDetailById(agentDetails);

        setAgentData(response?.data)

      } catch (err) {
        console.error('Failed to fetch selected Agent Info', err.response || err.message || err);
      }finally{
        setLoading(false)
      }
    };

    if (agentDetails) {
      getAgentDetails();
    }
  }, [agentDetails]);

  const withShimmer = (content) =>
    loading ? <div className={styles.shimmerContainer} style={{minHeight: '150px'}}>{content}</div> : content;


  console.log('agentData',agentData)
  return (
    <div >
      <header className={styles.header}>
        <div className={styles.profileSection}>
          <div>
            <img src="images/AgentImage.png" alt="Profile" className={styles.profilePic} />
          </div>
          <div>
            <p className={styles.greeting}>Hello!</p>
            <h2 className={styles.name}>John Vick</h2>
          </div>
        </div>
        <div className={styles.notifiMain}>
          <div className={styles.notificationIcon}>
            <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M10 4.68945C10.4142 4.68945 10.75 5.02524 10.75 5.43945V8.76945C10.75 9.18367 10.4142 9.51945 10 9.51945C9.58579 9.51945 9.25 9.18367 9.25 8.76945V5.43945C9.25 5.02524 9.58579 4.68945 10 4.68945Z" fill="#0A0A0A" fill-opacity="0.9" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M2.61001 7.66C2.61001 3.56579 5.9258 0.25 10.02 0.25C14.0946 0.25 17.4289 3.58574 17.44 7.65795L17.44 7.65898V9.76C17.44 10.0064 17.4942 10.3614 17.5969 10.7349C17.6997 11.1089 17.8345 11.441 17.9621 11.6525L17.9628 11.6535L19.2334 13.7746L19.2336 13.7749C20.2082 15.4038 19.4348 17.519 17.6272 18.1215L17.6269 18.1216L17.6267 18.1217C12.693 19.7628 7.35696 19.7628 2.42329 18.1217L2.42306 18.1216L2.42284 18.1215C1.50673 17.8161 0.827321 17.1773 0.523982 16.3562C0.220761 15.5354 0.320841 14.6072 0.815592 13.7763L0.816106 13.7754L2.08724 11.6535L2.08787 11.6525C2.21604 11.4401 2.35075 11.1098 2.45325 10.7381C2.55563 10.3669 2.61001 10.0118 2.61001 9.76V7.66ZM10.02 1.75C6.75423 1.75 4.11001 4.39421 4.11001 7.66V9.76C4.11001 10.1882 4.02439 10.6831 3.89927 11.1369C3.7744 11.5897 3.59436 12.0589 3.37286 12.4263C3.37262 12.4267 3.37239 12.4271 3.37215 12.4275L2.10443 14.5437C2.10428 14.544 2.10413 14.5442 2.10398 14.5445C1.81916 15.0233 1.79933 15.4798 1.93104 15.8363C2.0627 16.1927 2.37329 16.5239 2.89718 16.6985C7.52323 18.2372 12.5268 18.2372 17.1528 16.6985C18.0452 16.401 18.4317 15.3562 17.9464 14.5451L16.6778 12.4275C16.6777 12.4272 16.6775 12.427 16.6774 12.4267C16.4552 12.0583 16.2752 11.5858 16.1506 11.1326C16.0258 10.6786 15.94 10.1836 15.94 9.76V7.66107C15.9306 4.41373 13.2651 1.75 10.02 1.75Z" fill="#0A0A0A" fill-opacity="0.9" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M7.41992 17.8203C7.41992 18.5204 7.71292 19.1727 8.18025 19.64L8.18027 19.64C8.64755 20.1073 9.2998 20.4003 9.99988 20.4003C11.4157 20.4003 12.5799 19.2361 12.5799 17.8203H14.0799C14.0799 20.0645 12.2441 21.9003 9.99988 21.9003C8.87997 21.9003 7.85223 21.4333 7.11959 20.7006M7.11957 20.7006C6.38691 19.968 5.91992 18.9402 5.91992 17.8203H7.41992" fill="#0A0A0A" fill-opacity="0.9" />
            </svg>


          </div>
          <div className={styles.notificationIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M17.448 1.75C16.5495 1.74997 15.8003 1.74995 15.2055 1.82991C14.5777 1.91432 14.0109 2.09999 13.5555 2.55546C13.1 3.01093 12.9143 3.57773 12.8299 4.20552C12.7499 4.8003 12.75 5.54951 12.75 6.44798V6.552C12.75 7.45047 12.7499 8.19971 12.8299 8.79448C12.9143 9.42228 13.1 9.98908 13.5555 10.4445C14.0109 10.9 14.5777 11.0857 15.2055 11.1701C15.8003 11.2501 16.5495 11.25 17.448 11.25H17.552C18.4505 11.25 19.1997 11.2501 19.7945 11.1701C20.4223 11.0857 20.9891 10.9 21.4445 10.4445C21.9 9.98908 22.0857 9.42228 22.1701 8.79448C22.2501 8.1997 22.25 7.45048 22.25 6.552V6.44801C22.25 5.54953 22.2501 4.80031 22.1701 4.20552C22.0857 3.57773 21.9 3.01093 21.4445 2.55546C20.9891 2.09999 20.4223 1.91432 19.7945 1.82991C19.1997 1.74995 18.4505 1.74997 17.552 1.75H17.448ZM14.6161 3.61612C14.7464 3.4858 14.9439 3.37858 15.4054 3.31654C15.8884 3.2516 16.536 3.25 17.5 3.25C18.464 3.25 19.1116 3.2516 19.5946 3.31654C20.0561 3.37858 20.2536 3.4858 20.3839 3.61612C20.5142 3.74644 20.6214 3.94393 20.6835 4.4054C20.7484 4.88843 20.75 5.53599 20.75 6.5C20.75 7.46401 20.7484 8.11157 20.6835 8.59461C20.6214 9.05607 20.5142 9.25357 20.3839 9.38389C20.2536 9.5142 20.0561 9.62143 19.5946 9.68347C19.1116 9.74841 18.464 9.75 17.5 9.75C16.536 9.75 15.8884 9.74841 15.4054 9.68347C14.9439 9.62143 14.7464 9.5142 14.6161 9.38389C14.4858 9.25357 14.3786 9.05607 14.3165 8.59461C14.2516 8.11157 14.25 7.46401 14.25 6.5C14.25 5.53599 14.2516 4.88843 14.3165 4.4054C14.3786 3.94393 14.4858 3.74644 14.6161 3.61612Z" fill="#0A0A0A" fill-opacity="0.9" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.44801 12.75C5.54954 12.75 4.8003 12.7499 4.20552 12.8299C3.57773 12.9143 3.01093 13.1 2.55546 13.5555C2.09999 14.0109 1.91432 14.5777 1.82991 15.2055C1.74995 15.8003 1.74997 16.5495 1.75 17.448V17.552C1.74997 18.4505 1.74995 19.1997 1.82991 19.7945C1.91432 20.4223 2.09999 20.9891 2.55546 21.4445C3.01093 21.9 3.57773 22.0857 4.20552 22.1701C4.80031 22.2501 5.54953 22.25 6.44801 22.25H6.552C7.45048 22.25 8.1997 22.2501 8.79448 22.1701C9.42228 22.0857 9.98908 21.9 10.4445 21.4445C10.9 20.9891 11.0857 20.4223 11.1701 19.7945C11.2501 19.1997 11.25 18.4505 11.25 17.552V17.448C11.25 16.5495 11.2501 15.8003 11.1701 15.2055C11.0857 14.5777 10.9 14.0109 10.4445 13.5555C9.98908 13.1 9.42228 12.9143 8.79448 12.8299C8.19971 12.7499 7.4505 12.75 6.55203 12.75H6.44801ZM3.61612 14.6161C3.74644 14.4858 3.94393 14.3786 4.4054 14.3165C4.88843 14.2516 5.53599 14.25 6.5 14.25C7.46401 14.25 8.11157 14.2516 8.59461 14.3165C9.05607 14.3786 9.25357 14.4858 9.38389 14.6161C9.5142 14.7464 9.62143 14.9439 9.68347 15.4054C9.74841 15.8884 9.75 16.536 9.75 17.5C9.75 18.464 9.74841 19.1116 9.68347 19.5946C9.62143 20.0561 9.5142 20.2536 9.38389 20.3839C9.25357 20.5142 9.05607 20.6214 8.59461 20.6835C8.11157 20.7484 7.46401 20.75 6.5 20.75C5.53599 20.75 4.88843 20.7484 4.4054 20.6835C3.94393 20.6214 3.74644 20.5142 3.61612 20.3839C3.4858 20.2536 3.37858 20.0561 3.31654 19.5946C3.2516 19.1116 3.25 18.464 3.25 17.5C3.25 16.536 3.2516 15.8884 3.31654 15.4054C3.37858 14.9439 3.4858 14.7464 3.61612 14.6161Z" fill="#0A0A0A" fill-opacity="0.9" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M1.75 6.5C1.75 3.87665 3.87665 1.75 6.5 1.75C9.12336 1.75 11.25 3.87665 11.25 6.5C11.25 9.12336 9.12336 11.25 6.5 11.25C3.87665 11.25 1.75 9.12336 1.75 6.5ZM6.5 3.25C4.70508 3.25 3.25 4.70508 3.25 6.5C3.25 8.29493 4.70508 9.75 6.5 9.75C8.29493 9.75 9.75 8.29493 9.75 6.5C9.75 4.70508 8.29493 3.25 6.5 3.25Z" fill="#0A0A0A" fill-opacity="0.9" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12.75 17.5C12.75 14.8767 14.8767 12.75 17.5 12.75C20.1234 12.75 22.25 14.8767 22.25 17.5C22.25 20.1234 20.1234 22.25 17.5 22.25C14.8767 22.25 12.75 20.1234 12.75 17.5ZM17.5 14.25C15.7051 14.25 14.25 15.7051 14.25 17.5C14.25 19.2949 15.7051 20.75 17.5 20.75C19.2949 20.75 20.75 19.2949 20.75 17.5C20.75 15.7051 19.2949 14.25 17.5 14.25Z" fill="#0A0A0A" fill-opacity="0.9" />
            </svg>
          </div>
        </div>

      </header>
 
      <section className={styles.agentCard}>
        <div className={styles.agentInfo}>

          <div className={styles.agentAvatarContainer}>
            <img src={agentData?.agent?.avatar || "images/SofiaAgent.png"} alt="Sofia" className={styles.agentAvatar} style={{objectFit:'unset'}}/>
          </div>
          <div>
            
            <h3 className={styles.agentName}>{agentData?.agent?.agentName}<span className={styles.activeText}>Active</span></h3>
            <p className={styles.agentAccent}>{agentData?.agent?.agentLanguage} •{agentData?.agent?.agentAccent}</p>
            <hr className={styles.agentLine}></hr>

            <div className={styles.agentDetailsFlex} >

              <p className={styles.agentDetails}>AI Agent Toll Free <strong>{agentData?.agent?.voip_numbers ? agentData?.agent?.voip_numbers :'1800 123 XXXX'}</strong></p>
              <p className={styles.agentDetails}>Agent Code <strong>{agentData?.agent?.agentCode || "NA"}</strong></p>

            </div>
          </div>
        </div>
      </section>
  
 
      <div className={styles.container}>
        <div className={styles.businessInfo}>
          <div className={styles.card1}>
            <h2>{agentData?.business?.businessName || "NA"}</h2>
            <p>Employees {agentData?.business?.businessSize || "NA"}</p>
            <div className={styles.health}>
              {/* <h3>Health <span> /Categories</span></h3> */}
              <h3>{agentData?.business?.businessType || "NA"}</h3>
            </div>

            <h4>Business Details</h4>
          </div>




          <div className={styles.card2}>
            <h2>URL:
              <span style={{ fontSize: '12px' }}>
            {(() => {
              const filteredUrls = agentData?.knowledgeBase?.knowledge_base_sources?.filter(
                src => src?.url && !src.url.includes('google.com')
              );
              if (filteredUrls && filteredUrls.length > 0) {
                return filteredUrls.map((src, index) => (
                  <div key={index}>{src.url}</div>
                ));
              } else {
                return <div>NA</div>;
              }
            })()}
          </span>
            </h2>
            <div className={styles.google}>
              <img src='images/google-icon.png' alt='google-icon' />
                <p>
              <span style={{ fontSize: '12px' }}>
                {(() => {
                  const filteredUrls = agentData?.knowledgeBase?.knowledge_base_sources?.filter(
                    src => src?.url && src.url.includes('google.com')
                  );
                  if (filteredUrls && filteredUrls.length > 0) {
                    return filteredUrls.map((src, index) => (
                      <div key={index}>{src.url}</div>
                    ));
                  } else {
                    return <div>NA</div>;
                  }
                })()}
              </span>
            </p>
            </div>
            <div className={styles.address}>
              <img src='svg/location.svg' alt='location' />
              <p>{agentData?.business?.address1 ||""} {agentData?.business?.address2||""},{agentData?.business?.city}</p>
            </div>
            <h4>Knowledge Base</h4>
          </div>

        </div>
         <div className={styles.managementActions}>
            <div className={styles.managementItem}>
              <div className={styles.SvgDesign}>
                <svg width="22" height="25" viewBox="0 0 22 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.45652 14.9118C4.63352 14.4278 5.31903 14.4278 5.49604 14.9118L6.32479 17.1862C6.49258 17.6466 6.85476 18.0088 7.31517 18.1766L9.5896 19.0054C10.0736 19.1824 10.0736 19.8679 9.5896 20.0449L7.31517 20.8736C6.85476 21.0414 6.49258 21.4036 6.32479 21.864L5.49604 24.1384C5.31904 24.6224 4.63353 24.6224 4.45652 24.1384L3.62777 21.864C3.45998 21.4036 3.0978 21.0414 2.63739 20.8736L0.362965 20.0449C-0.120988 19.8679 -0.120988 19.1824 0.362965 19.0054L2.63739 18.1766C3.0978 18.0088 3.45999 17.6466 3.62777 17.1862L4.45652 14.9118Z" fill="#6524EB" />
                  <path d="M14.4798 6.40251C14.7213 5.73953 15.6595 5.73953 15.902 6.40251L17.0356 9.51493C17.2658 10.1441 17.762 10.6404 18.3912 10.8696L21.5037 12.0042C22.1666 12.2467 22.1666 13.1849 21.5037 13.4264L18.3912 14.56C17.762 14.7902 17.2658 15.2864 17.0356 15.9157L15.902 19.0281C15.6605 19.6911 14.7213 19.6911 14.4798 19.0281L13.3462 15.9157C13.116 15.2864 12.6198 14.7902 11.9905 14.56L8.87809 13.4264C8.21511 13.1849 8.21511 12.2467 8.87809 12.0042L11.9905 10.8696C12.6197 10.6404 13.116 10.1442 13.3462 9.51493L14.4798 6.40251Z" fill="#6524EB" />
                  <path d="M4.86428 1.28246C5.03617 0.810794 5.70325 0.810794 5.87515 1.28246L6.68239 3.49652C6.84609 3.94464 7.19908 4.29763 7.64721 4.46134L9.86126 5.26756C10.3329 5.44047 10.3329 6.10754 9.86126 6.27944L7.64721 7.08669C7.19908 7.25039 6.84609 7.60338 6.68239 8.0515L5.87515 10.2656C5.70326 10.7372 5.03618 10.7372 4.86428 10.2656L4.05704 8.0515C3.89334 7.60338 3.54034 7.25039 3.09222 7.08669L0.878166 6.27944C0.406497 6.10756 0.406497 5.44048 0.878166 5.26756L3.09222 4.46134C3.54034 4.29763 3.89334 3.94464 4.05704 3.49652L4.86428 1.28246Z" fill="#6524EB" />
                </svg>
              </div>
              <p className={styles.managementText}>Edit Agents</p>
            </div>
            <div className={styles.managementItem}>
              <div className={styles.SvgDesign}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.9075 13.7036C17.7025 12.4986 15.8722 12.3081 14.4642 13.123C12.3349 14.3748 9.5527 14.0927 7.72536 12.2647C5.88086 10.4205 5.61058 7.60564 6.90038 5.46931C6.89904 5.4683 6.89702 5.46729 6.89567 5.46628C7.67353 4.06607 7.47157 2.26734 6.28241 1.07818C4.84484 -0.359392 2.51497 -0.359392 1.07707 1.07818C-0.279723 2.4353 -0.354108 4.58711 0.850878 6.0331C2.69875 8.47067 4.7277 10.8143 6.95154 13.0382C9.16562 15.2523 11.4975 17.2768 13.922 19.12C13.9246 19.1176 13.9267 19.1153 13.9287 19.1129C15.375 20.3398 17.543 20.2735 18.9078 18.9086C20.3444 17.4717 20.3444 15.1412 18.9075 13.7036Z" fill="#6524EB" />
                  <path d="M11.6781 3.26778H12.6878V3.9349H13.6976V3.26744V1.92109V1.24219H12.6878V1.92142H11.6781C11.3065 1.92142 11.0049 2.22301 11.0049 2.5946C11.0049 2.96619 11.3065 3.26778 11.6781 3.26778Z" fill="#6524EB" />
                  <path d="M19.4351 2.5931C19.4351 2.22151 19.1335 1.91992 18.7619 1.91992L14.3711 1.92093V3.26729L18.7619 3.26661C19.1335 3.26628 19.4351 2.96469 19.4351 2.5931Z" fill="#6524EB" />
                  <path d="M11.6781 5.96031L16.3903 5.95964V4.61328L11.6781 4.61396C11.3065 4.61396 11.0049 4.91554 11.0049 5.28713C11.0049 5.65873 11.3065 5.96031 11.6781 5.96031Z" fill="#6524EB" />
                  <path d="M18.7616 4.61246H18.0732V3.93457H17.0635V4.6128V5.95915V6.62728H18.0732V5.95915H18.7616C19.1332 5.95915 19.4347 5.65757 19.4347 5.28597C19.4347 4.91438 19.1332 4.61246 18.7616 4.61246Z" fill="#6524EB" />
                  <path d="M11.6781 8.65352L13.0244 8.65318V9.32064H14.0342V8.65318V7.30683V6.62793H13.0244V7.30683L11.6781 7.30717C11.3065 7.30717 11.0049 7.60875 11.0049 7.98034C11.0049 8.35194 11.3065 8.65352 11.6781 8.65352Z" fill="#6524EB" />
                  <path d="M18.7612 7.30469L14.707 7.3057V8.65205L18.7612 8.65138C19.1328 8.65138 19.4344 8.34979 19.4344 7.9782C19.4344 7.60661 19.1328 7.30469 18.7612 7.30469Z" fill="#6524EB" />
                </svg>
              </div>
              <p className={styles.managementText}>Call Setting</p>
            </div>
            <div className={styles.managementItem}>
              <div className={styles.SvgDesign}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 0C9.62132 0 10.125 0.50368 10.125 1.125V7.875H16.875C17.4963 7.875 18 8.37868 18 9C18 9.62132 17.4963 10.125 16.875 10.125H10.125V16.875C10.125 17.4963 9.62132 18 9 18C8.37868 18 7.875 17.4963 7.875 16.875V10.125H1.125C0.50368 10.125 0 9.62132 0 9C0 8.37868 0.50368 7.875 1.125 7.875H7.875V1.125C7.875 0.50368 8.37868 0 9 0Z" fill="#6524EB" />
                </svg>
              </div>
              <p className={styles.managementText}>Add Voip</p>
            </div>
          </div>

        <h1 className={styles.Agenttitle}>Agent Analysis</h1>
        <div className={styles.agentStats}>

          <div className={` ${styles.stat} ${styles.Yellow}`} >
            <div className={` ${styles.statText} `}>Total Calls</div>
            <div className={styles.statDetail}>{agentData?.callSummary?.totalCalls||'NA'}</div>

          </div>

          <div className={` ${styles.stat} ${styles.blue}`}><span className={` ${styles.statText} `}>Avg. Call Duration</span>
          
            <span className={styles.statDetail}>
              {agentData?.avgCallTime?.minutes || agentData?.avgCallTime?.seconds ?
              (
                <>
               {agentData?.avgCallTime?.minutes}
              <span className={styles.MinFont}>m</span>{agentData?.avgCallTime?.seconds}
              <span className={styles.MinFont}>s</span>
               </>
              ):
              <>
              NA</>
              }
              
              </span></div>
             

            

          <div className={` ${styles.stat}  ${styles.Purple}`}><span className={` ${styles.statText}`}>Bookings</span>
            <span className={styles.statDetail}>{totalBookings !== null ? totalBookings : '0'}</span></div>

          <div className={` ${styles.stat} ${styles.Red}`}><span className={` ${styles.statText} `}>Minutes Remaining</span>
            <span className={styles.statDetail}>1257</span></div>
        </div>


        <section className={styles.management}>

         
          <AgentAnalysis />
        </section>

      </div>
   

    </div>
  );
};

export default AgentDashboard;