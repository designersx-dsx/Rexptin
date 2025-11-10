import { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../Store/apiStore';
import Loader2 from '../Component/Loader2/Loader2';
const SecureRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);
  const token = localStorage.getItem('token');
  const onboardComplete = localStorage.getItem('onboardComplete');
  const onboardAgentComplete = localStorage.getItem("onboardAgentComplete")
  const location = useLocation()
  useEffect(() => {
    const verifyToken = async () => {
      try { 
        const res = await axios.post(`${API_BASE_URL}/endusers/verifyToken`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsValid(res.data.valid);
      } catch (err) {
        setIsValid(false);
      }
    };
    if (token) {
      verifyToken();
    } else {
      setIsValid(false);
    }
  }, [token]);
 
  // This useEffect handles redirect when token is invalid
  useEffect(() => {
    if (isValid === false) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/signup";
    }
  }, [isValid]);
   if (isValid === null ) {
    return <Loader2 />;
  }
  //  Prevent access to restricted routes if onboarding is incomplete
  if (
    isValid === true &&
    onboardComplete !== 'true' &&
    ["/dashboard"].includes(location.pathname)
  ) {
    return <Navigate to="/details" replace />;
  }
  if (isValid === true) {
    return children;
  }

  // While redirecting, return null
  return null;
};
export default SecureRoute


// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Navigate, useLocation, useNavigate } from 'react-router-dom';
// import { API_BASE_URL } from '../Store/apiStore';
// import Loader2 from '../Component/Loader2/Loader2';

// const SecureRoute = ({ children }) => {
//   const [isValid, setIsValid] = useState(null);
//   const token = localStorage.getItem('token');
//   const onboardComplete = localStorage.getItem('onboardComplete');
//   const onboardAgentComplete = localStorage.getItem('onboardAgentComplete');
//   const location = useLocation();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const verifyToken = async () => {
//       try {
//         const res = await axios.post(
//           `${API_BASE_URL}/endusers/verifyToken`,
//           {},
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         console.log("✅ Verify token response:", res.data);
//         setIsValid(res.data?.valid === true);
//       } catch (err) {
//         console.error("❌ Token verification failed:", err);
//         setIsValid(false);
//       }
//     };

//     if (token) verifyToken();
//     else setIsValid(false);
//   }, [token]);

//   // ✅ Redirect to /signup only if token is invalid (not onboarding related)
//   useEffect(() => {
//     if (isValid === false) {
//       console.warn("Invalid token — redirecting to signup...");
//       setTimeout(() => {
//         localStorage.clear();
//         sessionStorage.clear();
//         window.location.href = "/signup";
//       }, 500);
//     }
//   }, [isValid]);
//    useEffect(() => {
//     if (isValid === true && onboardComplete !== 'true' && location.pathname !== '/details') {
//       console.log("🔁 Redirecting to details page for onboarding...");
//       navigate('/details', { replace: true });
//     }
//   }, [isValid, onboardComplete, location.pathname, navigate]);

//   // ✅ Show loader while verifying
//   if (isValid === null) {
//     return <Loader2 />;
//   }

//   // ✅ If token valid but onboarding not complete → redirect to /details
 

//   // ✅ Allow rendering children if token is valid
//   if (isValid === true) {
//     return children;
//   }

//   return null;
// };

// export default SecureRoute;
