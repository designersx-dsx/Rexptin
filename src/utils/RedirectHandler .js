// import { useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// const RedirectHandler = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     // Get path after domain
//     const slug = location.pathname.split("/")[1]; // e.g., "AARTI_AT88HE"
//     console.log("Slug is:", slug);

//     if (slug) {
//       // Optional: save slug in localStorage/sessionStorage if needed
//       sessionStorage.setItem("referredByName", slug);

//       // Redirect to root
//       navigate("/signup", { replace: true });
//     }
//   }, [location, navigate]);

//   return null;
// };

// export default RedirectHandler;

import axios from "axios";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { token } from "../Store/apiStore";

const RedirectHandler = () => {
  console.log("RedirectHandler component mounted");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const slug = location.pathname.split("/")[1] || "";
    const currentDomain = window.location.hostname;
    const isFromReferrerLink = currentDomain === "refer.rxpt.us" || currentDomain === "refer.rxpt.ca";

    const searchParams = new URLSearchParams(location.search);
    const referral = searchParams.get("referral");
    const selectedPlan = searchParams.get("plan");
    const businessType = searchParams.get("businessType");
    console.log("Slug:", slug);
    console.log("Referral:", referral);
    console.log("Selected Plan:", selectedPlan);
    console.log("Is from refer domain:", isFromReferrerLink);

    const handleRedirect = async () => {
      console.log("Handling redirect with slug");
      try {
    
        if (slug && isFromReferrerLink) {
          const res = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/endusers/validate-referral/${slug}` ,{
               headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
            }
          );
          console.log("Response from API:", res.data);

          if (res?.data?.valid) {
            console.log("Valid slug referral:", slug);
           sessionStorage.setItem("referredByName", res?.data?.referalName);
            sessionStorage.setItem("referredBy", res?.data?.referralCode);
            // window.location.href = `https://app.rexpt.in/${slug}`;
            window.location.href = `https://app.rexpt.in/${slug}`;
            navigate("/signup", { replace: true });
            return;
          } else {
            console.log("Invalid slug referral:", slug);
            sessionStorage.removeItem("referredByName");
            window.location.href = `https://app.rexpt.in/`;
            navigate("/", { replace: true });
          }
        } else {
          const slug = location.pathname.split("/")[1]; // e.g., "AARTI_AT88HE"
          console.log("Slug is:", slug);

          if (slug) {
             const res = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/endusers/validate-referral/${slug}` , {
               headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
            }
          );
          if (res?.data?.valid) {
            sessionStorage.setItem("referredByName", res?.data?.referalName);
            sessionStorage.setItem("referredBy", res?.data?.referralCode);
            navigate("/signup", { replace: true });
          }else{
            sessionStorage.removeItem("referredByName");
            navigate("/", { replace: true });
          }
          }
        }
      } catch (err) {

        console.error("Redirect error:", err);
        // navigate("/signup", { replace: true });
        window.location.href = `https://app.rexpt.in/`;
        navigate("/", { replace: true });
      }
    };

    handleRedirect();
  }, [location.pathname, location.search, navigate]);

  return null;
};

export default RedirectHandler;
