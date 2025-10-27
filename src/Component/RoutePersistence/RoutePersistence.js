import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const RoutePersistence = () => {
  const location = useLocation();

  useEffect(() => {
    const saveLastRoute = () => {
      localStorage.setItem("lastVisitedRoute", location.pathname);
    };

    window.addEventListener("beforeunload", saveLastRoute);
    return () => {
      window.removeEventListener("beforeunload", saveLastRoute);
    };
  }, [location]);

  return null;
};

export default RoutePersistence;
