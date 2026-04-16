import React, { useState, useEffect } from "react";
import axios from "axios";
import GlobalSpinner from "./GlobalSpinner";
import Maintenance from "./Maintenance";

// Tiyaking may token para hindi ma-block ng backend
const getAuthHeader = () => {
  const token =
    localStorage.getItem("campusloop_token") ||
    sessionStorage.getItem("campusloop_token");
  return {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  };
};

const MaintenanceGuard = ({ children }) => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkMaintenanceStatus = async () => {
    try {
      // Nilagyan natin ng ?t=timestamp para iwas browser CACHE!
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/settings?t=${new Date().getTime()}`,
        getAuthHeader(),
      );

      if (response.data) {
        // Sa MySQL, minsan number 1 ang return ng true, kaya strict check tayo
        const isModeOn =
          response.data.maintenance_mode === true ||
          response.data.maintenance_mode === 1;
        setIsMaintenance(isModeOn);
      }
    } catch (error) {
      console.error("Failed to check maintenance status.", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial check pagka-load
    checkMaintenanceStatus();

    // Real-time polling every 15 SECONDS (Pina-bilis natin para agad ma-kickout!)
    const intervalId = setInterval(() => {
      checkMaintenanceStatus();
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return <GlobalSpinner isLoading={true} text="Verifying system status..." />;
  }

  // Kapag naka-ON ang maintenance, harang agad!
  if (isMaintenance) {
    return <Maintenance />;
  }

  // Kapag naka-OFF, ituloy sa Layout
  return children;
};

export default MaintenanceGuard;
