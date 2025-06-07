
import './App.css';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Start from './Component/Start/Start';
import SignUp from './Component/SignUp/SignUp';
import Details from './Component/Details/Details';
import Step from './Component/Step/Step';
import AboutBusiness from './Component/AboutBusiness/AboutBusiness';
import BusinessDetails from './Component/BusinessDetails/BusinessDetails';
import 'react-toastify/dist/ReactToastify.css';
import AgentDetail from './Component/AgentDetails/AgentDetail'
import AiAssistant from './Component/AiAssistant/AiAssistant';
import BusinessLocation from './Component/BusinessLocation/BusinessLocation';
import SecureRoute from './Pages/SecureRoute'
import Dashboard from './Component/Dashboard/Dashboard';
import RexAgent from './Component/RexAgent/RexAgent';
import Plans from './Component/Plans/Plans';
import SubscriptionFlow from './Component/Checkout/SubscriptionFlow';
import SubscriptionFlow_ from './Component/stripeCheckout/SubscriptionFlow';
import Calendar from './Component/Celender/Calendar';
import BusinessServices from './Component/BusinessServices/BusinessServices';
import TotalsCallsList from './Component/TotalsCallsList/TotalsCallsList'
import Plan from './Component/stripePlans/Plans';
function App() {
  const token = localStorage.getItem("token");
  return (
    <>
    <div className="DesktopPlusMobile">
      <div className="ForDesktop">
        <img src="svg/Rexpt-Logo.svg"/>
        <h1>
          
          Launch Your <b>AI Receptionist</b> with Rexpt.in
        </h1>
        <p>
          Launch Your AI Receptionist with Rexpt.in
        </p>
      </div>
      <div className="ForMobile">
        <BrowserRouter>
          <div className="App">
            <Routes>
              <Route
                path="/signup"
                element={token ? <Navigate to="/dashboard" /> : <SignUp />}
              />
              <Route
                path="/"
                element={token ? <Navigate to="/dashboard" /> : <Start />}
              />
              <Route
                path="/dashboard"
                element={
                  <SecureRoute>
                    <Dashboard />
                  </SecureRoute>
                }
              />
              <Route path="/" element={<Start />} />
              <Route path="/signup" element={<SignUp />} />

              <Route
                path="/details"
                element={
                  <SecureRoute>
                    <Details />
                  </SecureRoute>
                }
              />
              <Route path="/steps" element={<Step />} />
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
              <Route path="/business-details" element={<BusinessDetails />} />
              <Route path="/agent-detail" element={<AgentDetail />} />
              <Route
                path="/business-locations"
                element={
                  <SecureRoute>
                    <BusinessLocation />
                  </SecureRoute>
                }
              />

              <Route
                path="/"
                element={token ? <Navigate to="/dashboard" /> : <Start />}
              />
              <Route
                path="/dashboard"
                element={
                  <SecureRoute>
                    <Dashboard />
                  </SecureRoute>
                }
              />
              <Route path="/" element={<Start />} />
              <Route path="/signup" element={<SignUp />} />


              <Route path="/steps" element={<Step />} />

         <Route path="/details" element={<SecureRoute><Details /></SecureRoute>} />
          <Route path="/steps" element={<SecureRoute><Step/></SecureRoute>} />
          <Route path="/about-business" element={<SecureRoute><AboutBusiness/></SecureRoute>} />
          <Route path="/business-details" element={<SecureRoute><BusinessDetails/></SecureRoute>} />
          <Route path="/agent-detail" element={<AgentDetail />} />
          <Route path="/business-locations" element={<SecureRoute><BusinessLocation/></SecureRoute>} />
          <Route path="/dashboard" element={<SecureRoute><Dashboard /></SecureRoute>} />
          <Route path="/business-services" element={<SecureRoute><BusinessServices /></SecureRoute>} />
          {/* <Route path="/home" element={<Home />} /> */}
          <Route path="/ai-assistant" element={<SecureRoute><AiAssistant /></SecureRoute>} />
          <Route path="/rex-agent" element={<SecureRoute><RexAgent/></SecureRoute>} />
          <Route path="/plans" element={<Plans/>} />
          <Route path="/rplans" element={<Plan/>} />

          
          <Route path="/checkout" element={<SubscriptionFlow />} />
          <Route path="/rcheckout" element={<SubscriptionFlow_ />} />


          <Route path="/calendar" element={<SecureRoute><Calendar /></SecureRoute>} />
          <Route path="/totalcall-list" element={<TotalsCallsList />} />


              <Route path="/business-details" element={<BusinessDetails />} />
              <Route path="/agent-detail" element={<AgentDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />

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
              <Route path="/plans" element={<Plans />} />
              <Route path="/checkout" element={<SubscriptionFlow />} />
              <Route
                path="/calendar"
                element={
                  <SecureRoute>
                    <Calendar />
                  </SecureRoute>
                }
              />
              <Route path="/totalcall-list" element={<TotalsCallsList />} />
              <Route path="/call-transfer" element={<CallTransfer />} />
              <Route path="/call-details" element={<CallDetails />} />
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
              <Route path="/plans" element={<Plans />} />
              <Route path="/checkout" element={<SubscriptionFlow />} />
              <Route
                path="/calendar"
                element={
                  <SecureRoute>
                    <Calendar />
                  </SecureRoute>
                }
              />
              <Route path="/totalcall-list" element={<TotalsCallsList />} />
              <Route path="/call-transfer" element={<CallTransfer />} />
            </Routes>
          </div>
        </BrowserRouter>
      </div>
      </div>
      
    </>
  );
}

export default App; 