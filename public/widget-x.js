//USER SCRIPT
function injectCSS() {
  const style = document.createElement("style");
  style.innerHTML = `
             @keyframes float {
     0% { transform: translateY(0); }
     50% { transform: translateY(-8px); }
     100% { transform: translateY(0); }
   }

   @keyframes pulse-ring {
     0% {
       transform: scale(0.9);
       opacity: 0.7;
     }
     70% {
       transform: scale(1.6);
       opacity: 0;
     }
     100% {
       transform: scale(0.9);
       opacity: 0;
     }
   }

   body {
     margin: 0;
     font-family: sans-serif;
   }

   .floating-agent {
     position: fixed;
     bottom: 24px;
     right: 24px;
     width: 96px;
     height: 96px;
     z-index: 1000;
     cursor: pointer;
   }

   .floating-agent.animate {
     animation: float 3s ease-in-out infinite;
   }

   .agent-wrapper {
     position: relative;
     width: 100%;
     height: 100%;      
     border-radius: 50%;
     overflow: visible; 
     box-shadow: 0 4px 12px rgba(0,0,0,0.2);
   }

     .pulse-ring {
   position: absolute;
    right: -5px;
    bottom: -6px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: pulse-ring 1.8s infinite;
    z-index: 0;
    background: #0CDD24;
    z-index: 11;
}

   .agent-wrapper img {
     width: 100%;
     height: 100%;
     object-fit: cover;
     position: relative;
     z-index: 2;
     border-radius: 100px;
     border: 4px solid #7F709F;
       background: #ffffff;
   }

   .badge2 {
     position: absolute;
     bottom: -6px;
     width: 32px;
     height: 32px;
    
   }

   .badge2 img {
    
     object-fit: contain;
     border:unset;
   }

  
   .popup {
     position: fixed;
     bottom: 155px;
     right: 20px;
     width: 280px;
     background-color: #fff;
     border-radius: 20px;
     border: 2px solid #eee;
     box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
     z-index: 1001;
     display: none;
     /*overflow: hidden;*/
     font-family: sans-serif;
   }

   .popup.show {
     display: block;
   }
   .popup::after {
     content: "";
   position: absolute;
   bottom: -18px;
   right: 24px;
   width: 36px;
   height: 36px;
   background-color: #fff;
   /* border: 2px solid #eee; */
   transform: rotate(45deg);
   box-shadow: 14px 15px 20px rgba(0, 0, 0, 0.1);
   z-index: -1;
   border-radius: 0px 0px 8px 0px;
   /* font-size: 35px; */
   /* color: #BCBCBC; */
   }

   .popup-header {
     padding: 5px 40px;
     font-size: 12px;
     color: #888;
     text-align: right;
    
   }

   .popup-body {
    position: relative;
    text-align: center;
    padding: 15px 15px 10px 15px;
    height: 325px;
    // background: radial-gradient(circle at 50% 30%, #FFFFFF 0%, #263B5A 50%, #19273C 100%);
    background: radial-gradient(circle at 50% 30%, #263b5aea 3%, #19273C 40%);
    margin-inline: 22px;
    margin-bottom: 22px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
    gap:1.5rem
   }

.pulse-ring-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  margin-top:2rem;

}

.agent-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  top:6px;
  position: relative;
  z-index: 1;

}

/* Blinking Rings */
.pulse-ring2 {
  position: absolute;
  top: 56%;
  left: 50%;
  width: 100%;
  height: 100%;
  border: 4px solid rgba(255, 255, 255, 0.5); /* Default fallback */
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(1);
  z-index: 1;
  animation: pulseAnim 1.5s ease-out infinite;
}

/* Ring 1 - Red */
.pulse-ring2:nth-child(1) {
  border-color: #ffffffff;
  animation-delay: 0s;
}

/* Ring 2 - Green */
.pulse-ring2:nth-child(2) {
  border-color: #3B4859;
  animation-delay: 0.4s;
}

/* Ring 3 - Blue */
.pulse-ring2:nth-child(3) {
  border-color: 28364A;
  animation-delay: 0.8s;
}

@keyframes pulseAnim {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0;
  }
}


/* Text content styles */
.agent-info {
  text-align: center;
  // line-height:20px;
}

.call-label {
  font-size: 14px;
  color: #D1DCED;
  margin-bottom: 0px;
  font-family: "Inter", sans-serif;

}

.phone-number {
  font-size: 16px;
  font-weight: bold;
  margin: 4px 0 0px;
  color: #ffffffff;
  font-family: "Inter", sans-serif;

}

.tag-label {
  font-size: 12px;
  font-weight:600;
  color: #D1DCED;
  letter-spacing: 1px;
  font-family: "Inter", sans-serif;
  text-transform: capitalize;

}


   .call-banner {
     position: absolute;
     bottom: 22px;
     left: 50%;
     transform: translateX(-50%);
     background-color: #28a745;
     color: white;
     padding: 8px 12px;
     border-radius: 32px;
     font-size: 14px;
     max-width: 72%;
     box-shadow: 0 2px 6px rgba(0,0,0,0.2);
     display: flex;
     align-items: center;
     gap: 8px;
     width: 100%;
     cursor: pointer;
   }

   .call-banner .call-icon {
     width: 24px;
     height: 24px;
     animation: vibe 1s linear 1s infinite;
   }

@keyframes vibe {
   0% {}

   2% {
       transform: translateX(5px) rotateZ(1deg);
   }

   4% {
       transform: translateX(-5px) rotateZ(-1deg);
   }

   6% {
       transform: translateX(3px) rotateZ(2deg);
   }

   8% {
       transform: translateX(-2px) rotateZ(-2deg);
   }

   10% {
       transform: translateX(1px) rotateZ(2deg);
   }

   12% {
       transform: translateX(-5px) rotateZ(-2deg);
   }

   14% {
       transform: translateX(3px) rotateZ(-1deg);
   }

   16% {
       transform: translateX(-5px) rotateZ(-2deg);
   }

   18% {
       transform: translateX(5px) rotateZ(2deg);
   }

   20% {
       transform: translateX(-5px) rotateZ(-2deg);
   }

   22% {
       transform: translateX(5px) rotateZ(2deg);
   }

   24% {
       transform: translateX(-3px) rotateZ(-2deg);
   }

   26% {
       transform: translateX(0px) rotateZ(0deg);
   }

   100% {}
}

.greendiv, .reddiv {
 position: absolute;
 bottom: 1.7rem;
 left: 50%;
 transform: translateX(-50%);
 border-radius: 30px;
 padding: 10px 16px;
 color: white;
 display: flex;
 align-items: center;
 gap: 10px;
 cursor: pointer;
 width: 80%;

 transition: background-color 0.4s ease, transform 0.4s ease;
 box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
 align-text:left;

}

.greendiv {
 background-color: #0caa4f;
}

.reddiv {
 background-color: #DA1B14;
}

.greendiv:hover, .reddiv:hover {
 transform: translateX(-50%) scale(1.03);
}

.callText p {
 font-weight: 600;
 font-size: 15px;
 margin: 0;
 color :#ffff
 transition: color 0.3s ease;
}

.callText small {
 font-size: 9px;
 font-weight: 400;
 margin-top: 3px;
 display: block;
 color :#ffff
 transition: opacity 0.3s ease;
}
 .phoneIcon {
 align-items: self-end;
    display: flex
;}

.phoneIcon img {
 animation: vibe 1s linear 1s infinite;
}

   .call-banner .call-text {
     display: flex;
     flex-direction: column;
     align-items: flex-start;
     line-height: 1.2;
   }

   .call-banner .call-title {
     font-weight: 600;
     font-size: 18px;
     font-family: "Lato", sans-serif;
   }

   .call-banner .call-subtitle {
     font-size: 10px;
     opacity: 0.9;
     font-family: "Inter", sans-serif;
   }

   .close-button {
     position: absolute;
   top: 100%;
   right: 10.8px;
   font-size: 34px;
   color: #BCBCBC;
   background: transparent;
   border: none;
   cursor: pointer;
   }

   .close-button:hover {
     color: #333;
   }
     .popup{
         display: block;
         }

   .popup-header a {
     text-decoration: unset;
     color: #7D7D7D;
     font-family: "Inter", sans-serif;
   }

   /* Additional styles for noFloat state */
   .noFloat {
     animation: none !important;
   }
.WraperBlink {
  position: absolute;
    right: 22%;
    bottom: 18px;
    width: 10px;
    height: 10px;
    transform: translate(-50%, -50%);
    z-index: 11;
}
    .pulse-dot {
  position: absolute;
    top: 9px;
    left: 8px;
    width: 4px;
    height: 4px;
    background-color: #0CDD24;
    border-radius: 50%;
    z-index: 12;
}
    .callText{
        text-align: start;line-height:normal}
        .agent-intro{   text-align: center;
          font-size: 8px;
          position: absolute;
          bottom: 0;
          color: #ffff;}
          .terms-text {
            cursor: pointer;
            font-weight: 800;
            text-decoration: underline;
          },
          .terms-wrapper {
            position: relative;
            top: -6rem;
          }
          
          .terms-popup {
            
            width: 225px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 10px;
            box-shadow: 0px 4px 10px rgba(0,0,0,0.2);
            padding: 10px;
            text-align: justify;
            font-size: 12px;
            line-height: 15px;
          }
          
          .terms-content h2 {
            margin-top: 0;
            font-size: 16px;
            margin-bottom: 0px;
          }
          
          .close-terms {
            color: #000000;
            cursor: pointer;
          }
          
          `;
  document.head.appendChild(style);
}
const currentSiteURL = window.location.origin;
const API_URL = "https://rexptin.truet.net/api/";
// const API_URL = "http://localhost:2512/api";
const getAgentIdFromScript = () => {
  const currentScript = document.getElementById("rex-widget-script");
  if (!currentScript) {
    console.warn("Script with ID 'rex-widget-script' not found");
    return null;
  }
  const rawSrc = currentScript.getAttribute("src");
  try {
    const url = new URL(rawSrc, window.location.href);
    const agentId = url.searchParams.get("agentId");
    const pureId = agentId?.replace("agentId=", "");
    return pureId;
  } catch (err) {
    console.error("Error parsing script src for agentId:", err);
    return null;
  }
};
async function shouldLoadWidget() {
  try {
    const agentId = getAgentIdFromScript();
    if (!agentId) return false;

    const response = await fetch(`${API_URL}/agent/checkAgentWidgetUrlAllowed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        agent_id: agentId,
        url: currentSiteURL
      })
    });

    if (!response.ok) return false;
    const data = await response.json();
    console.log(data, "data")
    return data?.allowed === true;
  } catch (error) {
    console.error("Widget load check failed:", error);
    return false;
  }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", async () => {
    const allowLoad = await shouldLoadWidget();
    if (allowLoad) createReviewWidget();
    else console.log("Widget load skipped due to API check.");
  });
} else {
  (async () => {
    const allowLoad = await shouldLoadWidget();
    if (allowLoad) createReviewWidget();
    else console.log("Widget load skipped due to API check.");
  })();
}
function createReviewWidget() {
  if (window.__REX_WIDGET_INITIALIZED__) {
    console.log("Rex widget already initialized.");
    return;
  }
  window.__REX_WIDGET_INITIALIZED__ = true;

  const existingAgentBtn = document.getElementById("agentButton");
  const existingPopup = document.getElementById("agentPopup");
  if (existingAgentBtn && existingPopup) {
    console.log("Review widget already exists. Skipping re-render.");
    return;
  }

  // Remove duplicates
  document.querySelectorAll(".floating-agent").forEach((el) => {
    if (el.id !== "agentButton") el.remove();
  });

  let app = document.getElementById("review-widget");
  if (!app) {
    app = document.createElement("div");
    app.id = "review-widget";
    document.body.appendChild(app);
  }
  const createElement = (tag, options = {}) => {
    const el = document.createElement(tag);
    Object.entries(options).forEach(([key, value]) => {
      if (key in el) el[key] = value;
      else el.setAttribute(key, value);
    });
    return el;
  };

  const initWidget = async () => {
    const { RetellWebClient } = await import(
      "https://cdn.jsdelivr.net/npm/retell-client-js-sdk@2.0.7/+esm"
    );
    const retellWebClient = new RetellWebClient();
    const agentId = getAgentIdFromScript();

    let agentName = "REX";
    let agentVoiceId = "";
    let agentVoiceName = "";
    let callId = "";
    let onCall = false;
    let userId = "";
    let businessName = "Rexptin";
    let avatar = ""
    let callContent = `Call ${agentName}`
    let agentRole = "GENERAL"
    let agentVoipNumber = "NA"
    // REUSE or CREATE agent button
    try {
      const agentRes = await fetch(
        `${API_URL}/agent/fetchAgentDetailsFromRetell/${agentId}`,
        {
          method: "GET",
        }
      );
      const text = await agentRes.text();
      try {
        const json = JSON.parse(text);
        agentName = json.agentName || agentName;
        agentVoiceId = json.agentVoice || "";
        agentRole = json.agentRole
        userId = json.userId;
        avatar = json.avatar
        agentVoipNumber = json.voip_numbers

      } catch (e) {
        console.log("Response is not JSON");
      }
      const voicesRes = await fetch(
        `${API_URL}/agent/fetchAgentVoiceDetailsFromRetell`,
        {
          method: "POST",
        }
      );
      if (voicesRes.ok) {
        const voicesData = await voicesRes.json();
        const voice = voicesData.find((v) => v.voice_id === agentVoiceId);
        if (voice) {
          agentVoiceName = voice.avatar_url || "https:i.pravatar.cc/100?img=68";
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }

    try {
      const bussinessDetails = await fetch(
        `${API_URL}/businessDetails/getBusinessDetailsById/${userId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      ).then(async (res) => {
        const text = await res.text();
        const json = JSON.parse(text);
        businessName = json.businessName;
      });
    } catch (err) {
      console.error("Error fetching data:", err);
    }
    let rexAgent = document.getElementById("agentButton");
    if (!rexAgent) {
      rexAgent = createElement("div", {
        id: "agentButton",
        className: "floating-agent animate",
      });
      document.body.appendChild(rexAgent);
    } else {
      rexAgent.innerHTML = "";
    }

    const agentWrapper = createElement("div", { className: "agent-wrapper" });

    const wrapperBlink = createElement("div", { className: "WraperBlink" });

    const pulseRing = createElement("div", { className: "pulse-ring" });
    const pulseDot = createElement("div", { className: "pulse-dot" });

    wrapperBlink.appendChild(pulseRing);
    wrapperBlink.appendChild(pulseDot);

    const rexImg = createElement("img", {
      src: `https://rexptin.vercel.app/${avatar}`,
      alt: "AI Agent",
    });

    agentWrapper.appendChild(wrapperBlink);
    const badge2 = createElement("div", { className: "badge2" });
    const logoImg = createElement("img", {
      src: "https://rexptin.truet.net/images/favicon-final.svg",
      alt: "Badge Icon",
    });

    badge2.appendChild(logoImg);
    agentWrapper.appendChild(rexImg);
    agentWrapper.appendChild(badge2);
    rexAgent.appendChild(agentWrapper);


    // POPUP
    const modal = createElement("div", {
      id: "agentPopup",
      className: "popup",
    });
    modal.style.display = "none";

    const popupHeader = createElement("div", { className: "popup-header" });
    // const poweredBy = createElement("a", {
    //   href: "https://www.rexpt.us/",
    //   target: "_blank",
    //   rel: "noopener noreferrer",
    //   innerHTML: "Powered by rexpt.us",
    // });
    const popupBody = createElement("div", { className: "popup-body" });
    const imageWrapper = document.createElement("div");
    imageWrapper.className = "pulse-ring-wrapper";
    const agentImg = document.createElement("img");
    agentImg.className = "agent-img";
    agentImg.src = `https://rexptin.vercel.app/${avatar}`;
    agentImg.alt = "Agent";
    const callBtn = createElement("div", {
      id: "start-call",
      className: "greendiv",
    });

    // info wrapper
    const infoWrapper = document.createElement("div");
    infoWrapper.className = "agent-info";

    const callLabel = document.createElement("p");
    callLabel.className = "call-label";
    callLabel.textContent = `Call ${agentName}`;
    const phoneNumber = document.createElement("h2");
    phoneNumber.className = "phone-number";
    phoneNumber.textContent = JSON.parse(agentVoipNumber) || "NA";
    const tag = document.createElement("span");
    tag.className = "tag-label";
    tag.textContent = `${agentRole?.split(" ")[0]} RECEPTIONIST`;
    const phoneIconWrapper = createElement("div", { className: "phoneIcon" });
    const phoneIcon = createElement("img", {
      id: "phoneIcon",
      src: "https://rexptin.vercel.app/svg/Phone-call.svg",
    });
    phoneIconWrapper.appendChild(phoneIcon);

    const callText = createElement("div", {
      id: "callText",
      className: "callText",
    });

    callText.innerHTML = `<p>Call <span class="agentTag">${agentName.length > 10 ? `${agentName.substring(0, 7)}..` : agentName
      }</span></p><small>${businessName?.length > 10
        ? `${businessName.substring(0, 8)}..`
        : businessName
      } Agent is LIVE</small>`;

    callBtn.appendChild(phoneIconWrapper);
    callBtn.appendChild(callText);

    const closeButton = createElement("button", {
      className: "close-button",
      innerHTML: "×",
    });
    const agentIntro = document.createElement("p");
    agentIntro.className = "agent-intro";
    agentIntro.innerHTML = `By Clicking Call ${agentName} You agree to <b class="terms-text">Terms of Use</b>`;
    popupBody.appendChild(agentImg);
    popupBody.appendChild(callBtn);
    popupBody.appendChild(closeButton);
    // popupHeader.appendChild(poweredBy);
    modal.appendChild(popupHeader);
    modal.appendChild(popupBody);
    document.body.appendChild(modal);
    infoWrapper.appendChild(callLabel);
    infoWrapper.appendChild(phoneNumber);
    infoWrapper.appendChild(tag);
    imageWrapper.appendChild(agentImg);
    popupBody.appendChild(imageWrapper);
    popupBody.appendChild(imageWrapper);
    popupBody.appendChild(infoWrapper);

    popupBody.appendChild(callBtn);
    popupBody.appendChild(agentIntro);
    popupBody.appendChild(closeButton);
    // popupHeader.appendChild(poweredBy);
    modal.appendChild(popupHeader);
    modal.appendChild(popupBody);
    document.body.appendChild(modal);
    rexAgent.addEventListener("click", () => {
      modal.style.display = "block";
      rexAgent.classList.add("noFloat");
    });
    closeButton.addEventListener("click", async () => {
      modal.style.display = "none";
      rexAgent.classList.remove("noFloat");
      if (onCall) {
        try {
          await retellWebClient.stopCall();
        } catch (err) {
          console.error("Call stop failed:", err);
        }
        callBtn.classList.remove("reddiv");
        callBtn.classList.add("greendiv");
        phoneIcon.src = "https://rexptin.vercel.app/svg/Phone-call.svg";
        callText.innerHTML = `<p>Call <span class="agentTag">${agentName.length > 8 ? `${agentName.substring(0, 8)}..` : agentName
          }</span></p><small>${businessName.length > 10
            ? `${businessName.substring(0, 8)}..`
            : businessName
          } Agent is LIVE</small>`;
        onCall = false;
      }
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
        rexAgent.classList.remove("noFloat");
      }
    });
// Create Terms Popup
const termsWrapper = document.createElement("div");
termsWrapper.className = "terms-wrapper";
termsWrapper.style.position = "relative";
termsWrapper.style.top = "-16.4rem";
termsWrapper.style.zIndex = "11";
popupBody.appendChild(termsWrapper);

// Create Terms Popup (inside wrapper)
const termsPopup = document.createElement("div");
termsPopup.id = "termsPopup";
termsPopup.className = "terms-popup";
termsPopup.style.display = "none";
termsPopup.innerHTML = `
  <div class="terms-content" style="position: relative; padding: 5px;">
    <span class="close-terms" 
          style="position: absolute; top: 0; right: 0px; font-size: 20px; font-weight: bold; cursor: pointer;">
      &times;
    </span>
    <h2>Terms of Use
    </h2>
    <p> By clicking the Call button to talk to Rexpt AI agent on ${businessName?.length > 15? `${businessName.substring(0, 20)}..`: businessName} named ${agentName}, You Agree to Terms of Use for Rexpt AI Agents published on <a href="https://www.rexpt.in/Terms-Condition" target="_blank" style="color: #007bff; text-decoration: underline;">TERMS & CONDITIONS</a>. Each time You interact with this Al agent, You consent to the recording, storage, and sharing of my communications with ${businessName?.length > 15? `${businessName.substring(0, 20)}..` : businessName}, Rexpt & Other third-party service providers, and as described in the <a href="https://www.rexpt.in/Privacy-Policy" target="_blank" style="color: #007bff; text-decoration: underline;">
    Privacy Policy</a>. If you do not wish to have your conversations recorded, please refrain from using this service & DO NOT MAKE THE CALL.
    </p>
  </div>
`;

termsWrapper.appendChild(termsPopup);
// Add Event Listener on "Terms of Use"
agentIntro.querySelector(".terms-text").addEventListener("click", () => {
  termsPopup.style.display = "block";
});
// Close button
termsPopup.querySelector(".close-terms").addEventListener("click", () => {
  termsPopup.style.display = "none";
});


    callBtn.onclick = async () => {
      if (navigator?.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Store the stream globally or in state if needed
          micStream = stream;
        } catch (err) {

          console.error("Microphone access denied or error:", err);
          alert("Please allow microphone access to proceed with the call.");
          // setPopupMessage("Microphone access is required to test agent.");
          // setPopupType("failed");
          return;
        }
        if (!onCall) {
          callBtn.disabled = true;
          callContent = "Calling...";
          callLabel.textContent = callContent;
          callText.innerHTML = `<p>Connecting...</p>`;
          try {
            const res = await fetch(`${API_URL}/agent/createWidegetWebCall`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ agent_id: agentId, url: currentSiteURL }),
            });

            if (res.ok) {
              const data = await res.json();

              // Validate response structure
              if (data?.access_token && data?.call_id) {

                const access_token = data.access_token;
                callId = data.call_id;

                await retellWebClient.startCall({ accessToken: access_token });
                callContent = "Connected";
                callLabel.textContent = callContent;
                callBtn.classList.remove("greendiv");
                callBtn.classList.add("reddiv");
                phoneIcon.src = "https://rexptin.vercel.app/svg/Hangup.svg";
                callText.innerHTML = `<p>Hang up Now</p><small>In Call with ${agentName.length > 10 ? `${agentName.substring(0, 8)}..` : agentName
                  }</small>`;
                onCall = true;
                // Add pulse rings when call starts
                imageWrapper.classList.add("active");
                // Remove existing rings to avoid duplicates
                imageWrapper.querySelectorAll(".pulse-ring2").forEach((ring) => ring.remove());
                // Add three new pulse rings
                for (let i = 0; i < 3; i++) {
                  const ring = document.createElement("span");
                  ring.className = "pulse-ring2";
                  imageWrapper.insertBefore(ring, agentImg); // Add before agent image
                }
              } else {
                console.error("Invalid response data:", data);
                throw new Error("Invalid response data");
              }
            } else {

              throw new Error("Failed to fetch access token");
            }
          } catch (err) {
            console.error("Call failed:", err.message);
            callText.innerHTML = `<p style="color: red;">Unauthorized Access</p>`;
          } finally {
            callBtn.disabled = false;
          }
        } else {
          await retellWebClient.stopCall();
          callBtn.classList.remove("reddiv");
          callBtn.classList.add("greendiv");
          phoneIcon.src = "https://rexptin.vercel.app/svg/Phone-call.svg";
          callText.innerHTML = `<p style="color:white">Call <span class="agentTag">${agentName.length > 8 ? `${agentName.substring(0, 8)}..` : agentName
            }</span></p>
                <small>${businessName.length > 10 ? `${businessName.substring(0, 8)}..` : businessName
            } Agent is LIVE</small>`;
          onCall = false;
          callLabel.textContent = `Call ${agentName}`;
          imageWrapper.classList.remove("active");
          imageWrapper.querySelectorAll(".pulse-ring2").forEach((ring) => ring.remove());
          const data = {
            agentId: getAgentIdFromScript(), callId: callId
          }
          // const res = await fetch(`${API_URL}/agent/updateAgentMinutesLeft`, {
          //     method: "PATCH",
          //     headers: { "Content-Type": "application/json" },
          //     body: JSON.stringify({  agentId: getAgentIdFromScript(), callId: callId }),
          //   });
        }
      }
    };
  };



  injectCSS();
  (async () => {
    await initWidget();
  })();
}

