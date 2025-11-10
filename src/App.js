import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,useLocation
} from "react-router-dom";
import Start from "./Component/Start/Start";
import SignUp from "./Component/SignUp/SignUp";
import Details from "./Component/Details/Details";
import Step from "./Component/Step/Step";
import SubscriptionPlan from "./Component/SubscriptionPlan/SubscriptionPlan";
import AboutBusiness from "./Component/AboutBusiness/AboutBusiness";
import BusinessDetails from "./Component/BusinessDetails/BusinessDetails";
import "react-toastify/dist/ReactToastify.css";
import AgentDetail from "./Component/AgentDetails/AgentDetail";
import AiAssistant from "./Component/AiAssistant/AiAssistant";
import BusinessLocation from "./Component/BusinessLocation/BusinessLocation";
import SecureRoute from "./Pages/SecureRoute";
import Dashboard from "./Component/Dashboard/Dashboard";
import RexAgent from "./Component/RexAgent/RexAgent";
import Plans from "./Component/Plans/Plans";
import MessagePlan from "./Component/MessagePlan/MessagePlan";
import Delete from "./Component/Delete/Delete";
import SubscriptionFlow from "./Component/Checkout/SubscriptionFlow";
import Calendar from "./Component/Celender/Calendar";
import BusinessServices from "./Component/BusinessServices/BusinessServices";
import TotalsCallsList from "./Component/TotalsCallsList/TotalsCallsList";
import CallTransfer from "./Component/CallTransfer/CallTransfer";
import CallDetails from "./Component/CallDetails/CallDetails";
import BusinessServicesNEXT from "./Component/BusinessServices/BusinessServicesNEXT";
import CalInfo from "./Component/Dashboard/CalInfo";
import EditProfile from "./Component/EditProfile/EditProfile";
//... Edit Screen Start ....//
import EditAgentNew from "./Component/EditAgentNew/EditAgentNew";
import EditBusinessType from "./Component/EditBusinessType/EditBusinessType";
import EditServicesOffered from "./Component/EditServicesOffered/EditServicesOffered";
import EditPublic from "./Component/EditPublic/EditPublic";
import EditBusinessDetail from "./Component/EditBusinessDetail/EditBusinessDetail";
import EditLanguage from "./Component/EditLanguage/EditLanguage";
import EditGender from "./Component/EditGender/EditGender";
import EditNameAvtar from "./Component/EditNameAvtar/EditNameAvtar";
//... Edit Screen End ....//
import { useEffect, useState } from "react";
import RoutePersistence from "./Component/RoutePersistence/RoutePersistence";
import WidgetGuidePage from "./Component/WidgetGuidePage/WidgetGuidePage";
import BusinessListing from "./Component/BusinessListing/BusinessListing";
import Test from "./utils/Test";
import CallSetting from "./Component/CallSetting/CallSetting";
import ConnectCalenderAPI from "./Component/ConnectCalenderAPI/ConnectCalanderAPI";
import AssignNumber from "./Component/AssignNumber/AssignNumber";
import Thankyou from "./Component/ThankyouPage/Thankyou";
import CancelPage from "./Component/CancelPage/CancelPage";
import IntegrateAgent from "./Component/Integrate-agent/Integrate-agent";
import AgentSetupHelp from "./Component/AgentSetupHelp/AgentSetupHelp";
import Plan from "./Component/Plans/Plans";
import Planss from "./Component/Plan/Plan";
import Documentation from "./Component/Documentation/Documentation";
import RedirectHandler from "./utils/RedirectHandler ";
import PreventPullToRefresh from "./Component/PreventPullToRefresh/PreventPullToRefresh";
import Thankyou2 from "./Component/ThankyouPage2/Thankyou2";
import Number from "./Component/assign/Number";
import CallRecording from "./Component/CallRecording/CallRecording";
import RaiseTickets from "./Component/Tickets/RaiseTickets";
import CreateTicketModal from "./Component/Tickets/CreateTicketModal";
import CreateTicket from "./Component/Tickets/CreateTicket";
import Fileinfo from "./Component/AgentDetails/FileInfo/Fileinfo";
import ForcePortraitOnly from "./utils/ForcePortraitOnly";
import decodeToken from "./lib/decodeToken";
import { initNotificationSocket } from "./utils/initNotificationSocket";
import { getUserNotifications } from "./Store/apiStore";
import { io } from "socket.io-client";
import { useNotificationStore } from "./Store/notificationStore";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import NotificationView from "./Component/Notifications/NotificationView";
import ThankYouPage from "./Component/hubspotThankyouPage/HubspotThankyou";
import OwnPlan from './Component/OwnPlan/OwnPlan'
// import CustomPlan from "./Component/OwnPlan/CustomPlan";
import BuildPlan from "./Component/BuildPlan/BuildPlan";
import CustomPlan from "./Component/BuildPlan/CustomPlan";
function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const token = localStorage.getItem("token");
  const lastRoute = localStorage.getItem("lastVisitedRoute");
  const decoded = decodeToken(token);
  const userID = decoded?.id
  const SOCKET_URL = process.env.REACT_APP_API_BASE_URL?.split('/api')[0]
  const notifications = useNotificationStore((state) => state.notifications);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const loadNotifications = useNotificationStore((state) => state.loadNotifications);
  const toggleFlag = useNotificationStore((state) => state.toggleFlag);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); 
  const navigate = useNavigate()

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (userID) {
      try {
        initNotificationSocket(userID, navigate);
      } catch (err) {
        console.error("Token decode error:", err);
      }
    }
  }, [userID, navigate]);
// custa
  useEffect(() => {
    if (userID) {
      getUserNotifications(userID)
        .then((resp) => {
          loadNotifications(resp?.notifications || []);
        })
        .catch((err) => console.log("error while fetching user Notifications", err));
    }
  }, [userID, token]);
  useEffect(() => {
    const count = notifications?.filter((n) => n?.status === "unread")?.length;
    setUnreadCount(count);
  }, [notifications]);

  useEffect(() => {
    if (!userID) return;


    // 🔌 Socket connect
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("🟢 Connected:", socket.id);
      socket.emit("register", userID);
    });
    // 📩 Listen for notification
    socket.on("notification", (msg) => {
      // console.log('new notification')
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [userID]);
  useEffect(() => {
    const ref = document.referrer;
    console.log('Referrer URL:', ref);
  }, []);
  return (
    <>
      {/* <ForcePortraitOnly /> */}
      <div className="DesktopPlusMobile">
        <div className="ForDesktop">
          <img src="svg/Rexpt-Logo.svg" />
          <h1>
            Launch Your <b>AI Receptionist</b> with Rexpt.in
          </h1>
          <p>Launch Your AI Receptionist with Rexpt.in</p>
        </div>
        <div className="ForMobile">

          <PreventPullToRefresh setRefreshKey={setRefreshKey}>
            {/* <BrowserRouter> */}
            <div className="App" key={refreshKey}>
              {/* <RoutePersistence /> */}
              <Routes>
                <Route
                  path="/signup"
                  element={
                   
                      <SignUp />
                  
                  }
                />
                <Route
                  path="/"
                  element={
                    token ? (
                      <SecureRoute>
                        {" "}
                        <Navigate to={lastRoute || "/dashboard"} />
                      </SecureRoute>
                    ) : (
                      <Start />
                    )
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <SecureRoute>
                      <Dashboard />
                    </SecureRoute>
                  }
                />
                  <Route
                  path="/build-plan"
                  element={<SecureRoute><BuildPlan /> </SecureRoute>}
                />
                <Route
                  path="/build-own-plan"
                  element={
                    <SecureRoute>
                      <CustomPlan/>
                    </SecureRoute>
                  }
                />
                <Route path="/calinfo" element={<CalInfo />}></Route>
                <Route path="/" element={<Start />} />
                <Route
                  path="/integrations/hubspot/success"
                  element={<ThankYouPage />}
                ></Route>
                <Route path="/signup" element={<SignUp />} />
                <Route path="/edit-agent" element={<EditAgentNew />} />
                <Route
                  path="/edit-business-type"
                  element={<EditBusinessType />}
                />
                <Route
                  path="/edit-services-offered"
                  element={<EditServicesOffered />}
                />

                <Route path="/edit-public-listing" element={<EditPublic />} />

                <Route path="/edit-public" element={<EditPublic />} />
                <Route
                  path="/edit-business-detail"
                  element={<EditBusinessDetail />}
                />
                <Route path="/edit-language" element={<EditLanguage />} />
                <Route path="/edit-gender" element={<EditGender />} />
                <Route path="/edit-name-avtar" element={<EditNameAvtar />} />
                <Route
                  path="/plans"
                  element={
                    <SecureRoute>
                      <SubscriptionPlan />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/plan"
                  element={
                    <SecureRoute>
                      <Planss />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/message-plan"
                  element={<MessagePlan />}
                />


                <Route
                  path="/assign-number"
                  element={
                    <SecureRoute>
                      <AssignNumber />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/details"
                  element={
                    <SecureRoute>
                      <Details />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/steps"
                  element={
                    <SecureRoute>
                      <Step />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/about-business"
                  element={
                    <SecureRoute>
                      <AboutBusiness />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/about-business-next"
                  element={
                    <SecureRoute>
                      <BusinessServicesNEXT />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/business-details"
                  element={
                    <SecureRoute>
                      <BusinessDetails />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/call-setting"
                  element={
                    <SecureRoute>
                      <CallSetting />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/agent-detail"
                  element={
                    <SecureRoute>
                      <AgentDetail />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/business-locations"
                  element={
                    <SecureRoute>
                      <BusinessLocation />
                    </SecureRoute>
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    <SecureRoute>
                      <Dashboard unreadCount={unreadCount} />
                    </SecureRoute>
                  }
                />

                <Route
                  path="/business-services"
                  element={
                    <SecureRoute>
                      <BusinessServices />
                    </SecureRoute>
                  }
                />

                {/* <Route path="/home" element={<Home />} /> */}
                <Route
                  path="/ai-assistant"
                  element={
                    <SecureRoute>
                      <AiAssistant />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/rex-agent"
                  element={
                    <SecureRoute>
                      <RexAgent />
                    </SecureRoute>
                  }
                />
                {/* <Route path="/plans" element={<Plans />} /> */}
                <Route
                  path="/checkout"
                  element={
                    <SecureRoute>
                      <SubscriptionFlow />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <SecureRoute>
                      <Calendar />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/totalcall-list"
                  element={
                    <SecureRoute>
                      <TotalsCallsList />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/call-transfer"
                  element={
                    <SecureRoute>
                      <CallTransfer />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/call-details/:callId"
                  element={
                    <SecureRoute>
                      <CallDetails />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/business-services"
                  element={
                    <SecureRoute>
                      <BusinessServices />
                    </SecureRoute>
                  }
                />

                <Route
                  path="/ai-assistant"
                  element={
                    <SecureRoute>
                      <AiAssistant />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/rex-agent"
                  element={
                    <SecureRoute>
                      <RexAgent />
                    </SecureRoute>
                  }
                />
                {/* <Route path="/plans" element={<Plans />} /> */}
                <Route path="/checkout" element={<SubscriptionFlow />} />
                <Route
                  path="/calendar"
                  element={
                    <SecureRoute>
                      <Calendar />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/edit-profile"
                  element={
                    <SecureRoute>
                      <EditProfile />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/your-business-Listing"
                  element={
                    <SecureRoute>
                      <BusinessListing />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/widget-guide"
                  element={
                    <SecureRoute>
                      <WidgetGuidePage />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/connect-calender"
                  element={
                    <SecureRoute>
                      <ConnectCalenderAPI />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/integrate-agent"
                  element={
                    <SecureRoute>
                      <IntegrateAgent />
                    </SecureRoute>
                  }
                />
                <Route path="/test-other" element={<Test />} />

                <Route
                  path="/edit-profile"
                  element={
                    <SecureRoute>
                      <EditProfile />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/your-business-Listing"
                  element={
                    <SecureRoute>
                      <BusinessListing />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/widget-guide"
                  element={
                    <SecureRoute>
                      <WidgetGuidePage />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/connect-calender"
                  element={
                    <SecureRoute>
                      <ConnectCalenderAPI />
                    </SecureRoute>
                  }
                />
                <Route path="/own-plan" element={<OwnPlan />} />
                <Route path="/own-custom-plan" element={<CustomPlan />} />


                <Route
                  path="/agent-setup"
                  element={
                    <SecureRoute>
                      <AgentSetupHelp />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/documentation"
                  element={
                    <SecureRoute>
                      <Documentation />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/raise-tickets"
                  element={
                    <SecureRoute>
                      <RaiseTickets />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/create-ticket"
                  element={
                    <SecureRoute>
                      <CreateTicket />
                    </SecureRoute>
                  }
                />

                <Route
                  path="/integrate-agent"
                  element={
                    <SecureRoute>
                      <IntegrateAgent />
                    </SecureRoute>
                  }
                />
                <Route
                  path="/call-recording"
                  element={
                    <SecureRoute>
                      <CallRecording />
                    </SecureRoute>
                  }
                />

                <Route
                  path="/add-file"
                  element={
                    <SecureRoute>
                      <Fileinfo />
                    </SecureRoute>
                  }
                />

                <Route
                  path="/notifications"
                  element={
                    <SecureRoute>
                      <NotificationView />
                    </SecureRoute>
                  }
                />

                <Route path="/test-other" element={<Test />} />
                <Route path="/thankyou/:id" element={<Thankyou />} />
                <Route path="/cancel-payment" element={<CancelPage />} />
                <Route path="/*" element={<RedirectHandler />} />

                <Route path="/thankyou2" element={<Thankyou2 />} />

                <Route path="/number" element={<Number />} />

                <Route path="/delete-account" element={<Delete />} />
              </Routes>
            </div>
            {/* </BrowserRouter> */}
          </PreventPullToRefresh>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
export default App;
