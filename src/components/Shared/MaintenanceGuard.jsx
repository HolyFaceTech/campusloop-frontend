import React, { useState, useEffect } from "react";
import axios from "axios";
import GlobalSpinner from "./GlobalSpinner";
import Maintenance from "./Maintenance";

const MaintenanceGuard = ({ children }) => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkMaintenanceStatus = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/settings?t=${new Date().getTime()}`,
      );

      if (response.data) {
        // Strict check para iwas conflict sa integer/boolean ng MySQL
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
    checkMaintenanceStatus();

    // 3 Minutes Polling Interval para iwas Self-DDoS
    const intervalId = setInterval(() => {
      checkMaintenanceStatus();
    }, 180000);

    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return <GlobalSpinner isLoading={true} text="Verifying system status..." />;
  }

  if (isMaintenance) {
    return <Maintenance />;
  }

  return children;
};

export default MaintenanceGuard;
