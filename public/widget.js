const style = document.createElement('style');
style.textContent = `/* CSS FROM YOUR INPUT - COMPLETE */  
        .raxAgentdiv { position: absolute; bottom: 1rem; right: 1rem; width: 100px; height: 100px; border: 3px solid #7F709F; border-radius: 50%; animation: floatUpDown 4s ease-in-out infinite; overflow: hidden; display: flex; align-items: center; justify-content: center; background-color: white; z-index: 10; }
        .rexImage { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .noFloat { animation: none !important; }
        .inlogo { position: absolute; bottom: 4rem; left: 70%; width: 50px; height: 12px; border-radius: 50%; transform: translate(-50%, -50%); z-index: 11; animation: floatUpDown2 4s ease-in-out infinite; }
        .noFloatInlogo { animation: none !important; left: 77% !important; }
        .dot { position: absolute; bottom: 1rem; left: 80%; width: 13px; height: 13px; background-color: #0CDD24; border-radius: 50%; opacity: 0.8; transform: translate(-50%, -50%); z-index: 2; animation: glow 2s infinite alternate; }
        @keyframes glow { 0% { box-shadow: 0 0 5px #0CDD24; background-color: #0CDD24; } 50% { box-shadow: 0 0 20px #0CDD24, 0 0 30px #0CDD24, 0 0 40px #0CDD24; background-color: #33EE44; opacity: 1; } 100% { box-shadow: 0 0 5px #0CDD24; background-color: #0CDD24; opacity: 0.8; } }
        @keyframes floatUpDown { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes floatUpDown2 { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        .modalOverlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0); z-index: 9999; display: flex; justify-content: center; align-items: center; animation-fill-mode: forwards; }
        .fadeIn { opacity: 1; pointer-events: auto; }
        @keyframes slideUpAnim { from { opacity: 0; transform: translate(-50%, 30%); } to { opacity: 1; transform: translate(-50%, -50%); } }
        .slideUp { animation: slideUpAnim 0.4s ease forwards; }
        .modalContent { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px 30px; border-radius: 12px; max-width: 400px; width: 90%; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); z-index: 10000; outline: none; }
        .modalContent::after { content: ""; position: absolute; bottom: -25px; right: -4%; transform: translateX(-50%) rotate(45deg); box-shadow: 10px 10px 11px 0px rgb(0 0 0 / 10%); width: 60px; height: 60px; background: white; border-radius: 4px; z-index: 1; }
        .closeBtn { right: 9%; position: absolute; bottom: -5%; z-index: 11; font-size: 30px; color: gray; cursor: pointer; }
        .Powered {  position: absolute;
    top: 10px;
    right: 15px;
    font-size: 12px;
    color: black;
    z-index: 10001; }
        .imgrex { position: relative; border-radius: 20px; overflow: hidden; }
        .imgrex img { width: 100%; border-radius: 20px; display: block; position: relative; z-index: 11; }
        .cornerOverlay { content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(130deg, #ff000000 47%, #E2E1DF 100%); border-bottom-left-radius: 20px; z-index: 11; pointer-events: none; }
        .phoneIcon img { width: 35px; height: 28px; animation: vibe 1s linear 1s infinite; }
        @keyframes vibe { 2% { transform: translateX(5px) rotateZ(1deg); } 4% { transform: translateX(-5px) rotateZ(-1deg); } 6% { transform: translateX(3px) rotateZ(2deg); } 8% { transform: translateX(-2px) rotateZ(-2deg); } 10% { transform: translateX(1px) rotateZ(2deg); } 12% { transform: translateX(-5px) rotateZ(-2deg); } 14% { transform: translateX(3px) rotateZ(-1deg); } 16% { transform: translateX(-5px) rotateZ(-2deg); } 18% { transform: translateX(5px) rotateZ(2deg); } 20% { transform: translateX(-5px) rotateZ(-2deg); } 22% { transform: translateX(5px) rotateZ(2deg); } 24% { transform: translateX(-3px) rotateZ(-2deg); } 26% { transform: translateX(0px) rotateZ(0deg); } }
        .greendiv,.reddiv { position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%); border-radius: 30px; padding: 10px 16px; color: white; display: flex; align-items: center; gap: 10px; cursor: pointer; width: 90%; z-index: 11; transition: background-color 0.4s ease, transform 0.4s ease; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); }
        .greendiv { background-color: #0caa4f; }
        .reddiv { background-color: #DA1B14; }
        .greendiv:hover,.reddiv:hover { transform: translateX(-50%) scale(1.03); }
        .callText p { font-weight: 600; font-size: 20px; margin: 0; transition: color 0.3s ease; }
        .callText small { font-size: 12px; font-weight: 400; margin-top: 3px; display: block; color: white; transition: opacity 0.3s ease; }
        .agentTag { color: #ffffff; }
        `;
document.addEventListener('DOMContentLoaded', async () => {
    const API_URL = "https://rexptin.truet.net/api";
    const container = document.getElementById('rexWidgetContainer');

    if (!container) {
        console.error("Container with id 'rexWidgetContainer' not found in HTML!");
        return;
    }
    const { RetellWebClient } = await import('https://cdn.jsdelivr.net/npm/retell-client-js-sdk@2.0.7/+esm');
    const createElement = (tag, options = {}) => {
        const el = document.createElement(tag);
        Object.entries(options).forEach(([key, value]) => {
            if (key in el) el[key] = value;
            else el.setAttribute(key, value);
        });
        return el;
    };

    const getAgentIdFromScript = () => {
        const currentScript = document.getElementById('rex-widget-script');
        if (!currentScript) {
            console.warn("Script with ID 'rex-widget-script' not found");
            return null;
        }

        const rawSrc = currentScript.getAttribute("src"); // Includes ?agentId=...

        try {
            const url = new URL(rawSrc, window.location.href); // Resolve relative to page
            const agentId = url.searchParams.get("agentId");
            const pureId = agentId?.replace("agentId=", "");   // remove prefix
            console.log("Agent ID:", pureId);
            // console.log(agentId)
            return pureId;
        } catch (err) {
            console.error("Error parsing script src for agentId:", err);
            return null;
        }
    };
    document.head.appendChild(style);

    const initWidget = async () => {

        const retellWebClient = new RetellWebClient();
        const agentId = await getAgentIdFromScript();
        let agentName = "Support Agent";
        let agentVoiceId = "";
        let agentVoiceName = "";
        let callId = "";
        let onCall = false;
        let userId = ""
        let businessName = ''
        //fetch Agent
        try {
            const agentRes = await fetch(`${API_URL}/agent/fetchAgentDetailsFromRetell`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ agent_id: agentId }),
            });
            const text = await agentRes.text(); // get raw text response first
            try {
                const json = JSON.parse(text); // try parse it manually
                agentName = json.agentName || agentName;
                agentVoiceId = json.agentVoice || "";
                userId = json.userId
            } catch (e) {
                console.log("Response is not JSON");
            }
            const voicesRes = await fetch(`${API_URL}/agent/fetchAgentVoiceDetailsFromRetell`, {
                method: "POST",
            });
            if (voicesRes.ok) {
                const voicesData = await voicesRes.json();
                const voice = voicesData.find(v => v.voice_id === agentVoiceId);
                if (voice) {
                    agentVoiceName = voice.avatar_url || "https://i.pravatar.cc/100?img=68";
                }
            }
        } catch (err) {
            console.error("Error fetching data:", err);
        }
        //Fetch Bussiness Details
        try {
            const bussinessDetails = await fetch(`${API_URL}/businessDetails/getBusinessDetailsById/${userId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }).then(async (res) => {
                const text = await res.text();
                const json = JSON.parse(text); // try parse it manually
                businessName = json.businessName
            });

        } catch (err) {
            console.error("Error fetching data:", err);
        }

        const rexAgent = createElement('div', { id: 'rexAgent', className: 'raxAgentdiv' });
        const rexImg = createElement('img', { src: 'https://rexptin.truet.net/images/RexAi.png', className: 'rexImage', alt: 'Agent' });
        const dot = createElement('div', { className: 'dot' });
        rexAgent.appendChild(rexImg);
        rexAgent.appendChild(dot);
        document.body.appendChild(rexAgent);

        const inlogo = createElement('div', { id: 'inlogo', className: 'inlogo' });
        const logoImg = createElement('img', { src: 'https://rexptin.truet.net/images/logo.png', alt: 'Logo' });
        inlogo.appendChild(logoImg);
        document.body.appendChild(inlogo);

        const modal = createElement('div', { id: 'modal', className: 'modalOverlay' });
        modal.style.display = 'none';

        const modalContent = createElement('div', { className: 'modalContent' });

        const closeModalBtn = createElement('span', {
            id: 'closeModalBtn',
            className: 'closeBtn',
            innerHTML: '&times;'
        });

        const imgrex = createElement('div', { className: 'imgrex' });

        const agentImg = createElement('img', { src: 'https://rexptin.truet.net/images/RexAi.png', alt: 'Agent' });
        const cornerOverlay = createElement('div', { className: 'cornerOverlay' });
        imgrex.appendChild(agentImg);
        imgrex.appendChild(cornerOverlay);

        const callBtn = createElement('div', { id: 'start-call', className: 'greendiv' });
        const phoneIconWrapper = createElement('div', { className: 'phoneIcon' });
        const phoneIcon = createElement('img', {
            id: 'phoneIcon',
            src: 'https://rexptin.truet.net/images/Phone-call.svg'
        });
        phoneIconWrapper.appendChild(phoneIcon);

        const callText = createElement('div', { id: 'callText', className: 'callText' });
        callText.innerHTML = `<p>Call <span class="agentTag">${agentName}</span></p>
          <small>${businessName} Agent is LIVE</small>`;

        callBtn.appendChild(phoneIconWrapper);
        callBtn.appendChild(callText);

        const powered = createElement('p', {
            className: 'Powered',
            innerHTML: 'Powered by rexpt.in'
        });

        modalContent.appendChild(closeModalBtn);
        modalContent.appendChild(imgrex);
        modalContent.appendChild(callBtn);
        modalContent.appendChild(powered);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        rexAgent.addEventListener('click', () => {
            modal.style.display = 'flex';
            rexAgent.classList.add('noFloat');
            inlogo.classList.add('noFloatInlogo');
        });

        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            rexAgent.classList.remove('noFloat');
            inlogo.classList.remove('noFloatInlogo');
        });

        modalContent.addEventListener('click', (e) => e.stopPropagation());
        modal.addEventListener('click', () => {
            modal.style.display = 'none';
            rexAgent.classList.remove('noFloat');
            inlogo.classList.remove('noFloatInlogo');
        });

        callBtn.onclick = async () => {
            if (!onCall) {
                callBtn.disabled = true;
                callText.innerHTML = `<p>Connecting...</p>`;
                try {
                    const res = await fetch(`${API_URL}/agent/create-web-call`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ agent_id: agentId }),
                    });
                    const data = await res.json();
                    const access_token = data.access_token;
                    callId = data.call_id;
                    await retellWebClient.startCall({ accessToken: access_token });

                    callBtn.classList.remove('greendiv');
                    callBtn.classList.add('reddiv');
                    phoneIcon.src = 'https://rexptin.truet.net/images/Hangup.svg';
                    callText.innerHTML = `<p>Hang up Now</p><small>In Call with ${agentName}</small>`;
                    onCall = true;
                } catch (err) {
                    console.error("Call failed:", err);
                    callText.innerHTML = `<p>Failed to connect</p>`;
                } finally {
                    callBtn.disabled = false;
                }
            } else {
                await retellWebClient.stopCall();
                callBtn.classList.remove('reddiv');
                callBtn.classList.add('greendiv');
                phoneIcon.src = 'https://rexptin.truet.net/images/Phone-call.svg';
                callText.innerHTML = `<p style ="color:white">Call <span class="agentTag">${agentName}</span></p>
              <small>${businessName} Agent is LIVE</small>`;
                onCall = false;
            }
        };
    };

    initWidget();
});