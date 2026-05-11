import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import SettingsFormModal from "./SettingsFormModal";
import { Modal } from "bootstrap";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const getAuthHeader = () => {
  const token =
    localStorage.getItem("campusloop_token") ||
    sessionStorage.getItem("campusloop_token");
  return {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  };
};

const Settings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");

  const [currentSetting, setCurrentSetting] = useState(null);
  const [formData, setFormData] = useState({ school_year: "", semester: "" });

  const [pstTime, setPstTime] = useState("");

  useEffect(() => {
    fetchSettings();

    const updateTime = () => {
      const now = new Date();
      const options = {
        timeZone: "Asia/Manila",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setPstTime(now.toLocaleTimeString("en-US", options));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    setLoadingText("Loading settings...");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/settings`,
        getAuthHeader(),
      );
      setCurrentSetting(response.data);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to fetch system settings.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openSetModal = () => {
    if (currentSetting) {
      setFormData({
        school_year: currentSetting.school_year || "",
        semester: currentSetting.semester || "",
      });
    } else {
      setFormData({ school_year: "", semester: "" });
    }
    const modalElement = document.getElementById("setSettingsModal");
    const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
    modal.show();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const modalElement = document.getElementById("setSettingsModal");
    const modal = Modal.getInstance(modalElement);
    if (modal) modal.hide();

    setTimeout(async () => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      setIsLoading(true);
      setLoadingText("Applying Settings...");

      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/settings`,
          formData,
          getAuthHeader(),
        );
        sileo.success({
          title: "Success",
          description: "School settings successfully applied.",
          ...darkToast,
        });
        fetchSettings();
        window.dispatchEvent(new Event("settingsChanged"));
      } catch (error) {
        sileo.error({
          title: "Failed",
          description:
            error.response?.data?.message || "Please check your inputs.",
          ...darkToast,
        });
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  const confirmReset = () => {
    const modal = new Modal(document.getElementById("resetConfirmModal"));
    modal.show();
  };

  const executeReset = () => {
    setTimeout(async () => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      setIsLoading(true);
      setLoadingText("Resetting System...");
      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/settings/reset`,
          {},
          getAuthHeader(),
        );
        sileo.success({
          title: "Reset Complete",
          description: "School settings cleared.",
          ...darkToast,
        });
        setCurrentSetting(null);
        fetchSettings();
        window.dispatchEvent(new Event("settingsChanged"));
      } catch (error) {
        sileo.error({
          title: "Failed",
          description: "Could not reset settings.",
          ...darkToast,
        });
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  const downloadReport = async () => {
    setIsLoading(true);
    setLoadingText("Generating PDF Report...");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/settings/report`,
        {
          responseType: "blob",
          ...getAuthHeader(),
        },
      );
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute(
        "download",
        `CampusLoop_System_Report_${new Date().toISOString().split("T")[0]}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileURL);
      sileo.success({
        title: "Download Complete",
        description: "PDF Report generated successfully.",
        ...darkToast,
      });
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to generate report.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmMaintenance = () => {
    if (!currentSetting) {
      sileo.error({
        title: "Action Failed",
        description: "Please set School Year & Semester first.",
        ...darkToast,
      });
      return;
    }
    const modal = new Modal(document.getElementById("maintenanceConfirmModal"));
    modal.show();
  };

  const executeMaintenanceToggle = () => {
    setTimeout(async () => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      setIsLoading(true);
      const isTurningOn = !currentSetting.maintenance_mode;
      setLoadingText(
        isTurningOn
          ? "Enabling Maintenance Mode..."
          : "Disabling Maintenance Mode...",
      );

      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/settings/maintenance`,
          {},
          getAuthHeader(),
        );
        sileo.success({
          title: "Success",
          description: `Maintenance Mode ${isTurningOn ? "enabled" : "disabled"}.`,
          ...darkToast,
        });
        fetchSettings();
      } catch (error) {
        sileo.error({
          title: "Error",
          description: "Failed to toggle maintenance mode.",
          ...darkToast,
        });
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="mb-4">
        <h3 className="fw-bold mb-1" style={{ color: "var(--primary-color)" }}>
          System Settings <i className="bi bi-gear"></i>
        </h3>
        <p className="text-muted small mb-0">
          Configure school year, semester, generate reports, and manage system
          status.
        </p>
      </div>

      <div className="row g-4">
        {/* SCHOOL SETTINGS CARD */}
        <div className="col-md-6 col-xl-4">
          <div
            className="card border-0 shadow-sm rounded-4 h-100 premium-hover-card bg-white"
            style={{ borderRadius: "1rem" }}
          >
            <div
              className="p-4 position-relative d-flex flex-column justify-content-end"
              style={{
                backgroundColor: "var(--primary-color)",
                minHeight: "140px",
                borderTopLeftRadius: "1rem",
                borderTopRightRadius: "1rem",
              }}
            >
              <div
                className="position-absolute rounded-circle"
                style={{
                  width: "100px",
                  height: "100px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  top: "-20px",
                  right: "-20px",
                }}
              ></div>
              <div
                className="position-absolute rounded-circle"
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  bottom: "-10px",
                  left: "20%",
                }}
              ></div>
              <div className="pe-4 position-relative z-1">
                <h4 className="fw-bold text-white mb-1 text-truncate">
                  School Settings
                </h4>
                <span className="badge bg-white text-dark bg-opacity-25 px-2 py-1 fw-semibold shadow-sm">
                  Active Configurations
                </span>
              </div>
            </div>

            <div className="card-body p-4 d-flex flex-column position-relative">
              <div
                className="position-absolute shadow-sm rounded-circle d-flex justify-content-center align-items-center fw-bold text-white"
                style={{
                  width: "55px",
                  height: "55px",
                  top: "-27px",
                  right: "24px",
                  backgroundColor: "var(--secondary-color)",
                  border: "4px solid white",
                  fontSize: "1.4rem",
                }}
              >
                <i className="bi bi-building"></i>
              </div>

              <div className="mb-3 mt-1 pe-4">
                <span
                  className="d-block text-muted mb-1 text-uppercase"
                  style={{
                    fontSize: "0.65rem",
                    letterSpacing: "1px",
                    fontWeight: "700",
                  }}
                >
                  Description
                </span>
                <p
                  className="text-dark small fw-medium mb-0 lh-base"
                  style={{ minHeight: "45px" }}
                >
                  Configure and apply the active School Year and Semester that
                  will reflect across all modules.
                </p>
              </div>

              <div className="d-flex gap-3 mb-4 flex-grow-1">
                <div className="bg-light rounded-4 p-3 border border-light-subtle flex-fill d-flex flex-column justify-content-center align-items-center text-center position-relative overflow-hidden hover-shadow transition-all">
                  <div
                    className="position-absolute top-0 start-0 w-100 bg-opacity-75"
                    style={{ height: "4px" }}
                  ></div>
                  <i
                    className="bi bi-calendar-check text-primary mb-1"
                    style={{ fontSize: "2.2rem" }}
                  ></i>
                  <span
                    className="d-block text-muted fw-bold text-uppercase mb-1"
                    style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                  >
                    School Year
                  </span>
                  <span className="d-block text-dark fw-bolder fs-5">
                    {currentSetting?.school_year || "Not Set"}
                  </span>
                </div>
                <div className="bg-light rounded-4 p-3 border border-light-subtle flex-fill d-flex flex-column justify-content-center align-items-center text-center position-relative overflow-hidden hover-shadow transition-all">
                  <div
                    className="position-absolute top-0 start-0 w-100 bg-opacity-75"
                    style={{ height: "4px" }}
                  ></div>
                  <i
                    className="bi bi-clock-history text-success mb-1"
                    style={{ fontSize: "2.2rem" }}
                  ></i>
                  <span
                    className="d-block text-muted fw-bold text-uppercase mb-1"
                    style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                  >
                    Semester
                  </span>
                  <span className="d-block text-dark fw-bolder fs-5">
                    {currentSetting?.semester
                      ? `${currentSetting.semester} Sem`
                      : "Not Set"}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center gap-2">
                <button
                  className="btn btn-campusloop flex-grow-1 rounded-3 fw-bold shadow-sm"
                  onClick={openSetModal}
                >
                  <i className="bi bi-gear-fill me-2"></i> Set Settings
                </button>
                <button
                  className="btn btn-light border flex-shrink-0 rounded-circle shadow-sm"
                  style={{
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  disabled={!currentSetting}
                  onClick={confirmReset}
                  title="Reset Settings"
                >
                  <i className="bi bi-arrow-counterclockwise text-danger"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* REPORTS CARD */}
        <div className="col-md-6 col-xl-4">
          <div
            className="card border-0 shadow-sm rounded-4 h-100 premium-hover-card bg-white"
            style={{ borderRadius: "1rem" }}
          >
            <div
              className="p-4 position-relative d-flex flex-column justify-content-end"
              style={{
                backgroundColor: "#6c757d",
                minHeight: "140px",
                borderTopLeftRadius: "1rem",
                borderTopRightRadius: "1rem",
              }}
            >
              <div
                className="position-absolute rounded-circle"
                style={{
                  width: "100px",
                  height: "100px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  top: "-20px",
                  right: "-20px",
                }}
              ></div>
              <div
                className="position-absolute rounded-circle"
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  bottom: "-10px",
                  left: "20%",
                }}
              ></div>
              <div className="pe-4 position-relative z-1">
                <h4 className="fw-bold text-white mb-1 text-truncate">
                  System Reports
                </h4>
                <span className="badge bg-white text-dark bg-opacity-25 px-2 py-1 fw-semibold shadow-sm">
                  Analytics & Data
                </span>
              </div>
            </div>

            <div className="card-body p-4 d-flex flex-column position-relative">
              <div
                className="position-absolute shadow-sm rounded-circle d-flex justify-content-center align-items-center fw-bold text-white"
                style={{
                  width: "55px",
                  height: "55px",
                  top: "-27px",
                  right: "24px",
                  backgroundColor: "#495057",
                  border: "4px solid white",
                  fontSize: "1.4rem",
                }}
              >
                <i className="bi bi-file-earmark-bar-graph"></i>
              </div>

              <div className="mb-3 mt-1 pe-4">
                <span
                  className="d-block text-muted mb-1 text-uppercase"
                  style={{
                    fontSize: "0.65rem",
                    letterSpacing: "1px",
                    fontWeight: "700",
                  }}
                >
                  Description
                </span>
                <p
                  className="text-dark small fw-medium mb-0 lh-base"
                  style={{ minHeight: "45px" }}
                >
                  Generate and download comprehensive PDF reports containing
                  detailed system data and overall metrics.
                </p>
              </div>

              <div className="bg-light rounded-4 p-4 mb-4 border border-light-subtle flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center position-relative overflow-hidden hover-shadow transition-all">
                <div
                  className="position-absolute top-0 start-0 w-100 bg-opacity-75"
                  style={{ height: "4px" }}
                ></div>
                <i
                  className="bi bi-file-earmark-pdf-fill text-danger mb-2"
                  style={{ fontSize: "3rem" }}
                ></i>
                <h6 className="fw-bold text-dark mb-1">
                  Executive Summary Report
                </h6>
                <span className="small text-muted">A4 Size Document</span>
              </div>

              <div className="mt-auto pt-3 border-top">
                <button
                  className="btn btn-dark w-100 rounded-3 fw-bold shadow-sm"
                  onClick={downloadReport}
                >
                  <i className="bi bi-download me-2"></i> Generate PDF Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MAINTENANCE CARD */}
        <div className="col-md-6 col-xl-4">
          <div
            className="card border-0 shadow-sm rounded-4 h-100 premium-hover-card bg-white"
            style={{ borderRadius: "1rem" }}
          >
            <div
              className="p-4 position-relative d-flex flex-column justify-content-end"
              style={{
                backgroundColor: currentSetting?.maintenance_mode
                  ? "#b02a37"
                  : "#dc3545",
                minHeight: "140px",
                borderTopLeftRadius: "1rem",
                borderTopRightRadius: "1rem",
                transition: "all 0.3s",
              }}
            >
              <div
                className="position-absolute rounded-circle"
                style={{
                  width: "100px",
                  height: "100px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  top: "-20px",
                  right: "-20px",
                }}
              ></div>
              <div
                className="position-absolute rounded-circle"
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  bottom: "-10px",
                  left: "20%",
                }}
              ></div>
              <div className="pe-4 position-relative z-1">
                <h4 className="fw-bold text-white mb-1 text-truncate">
                  Maintenance
                </h4>
                <span className="badge bg-white text-dark bg-opacity-25 px-2 py-1 fw-semibold shadow-sm">
                  {currentSetting?.maintenance_mode
                    ? "System Locked"
                    : "System Override"}
                </span>
              </div>
            </div>

            <div className="card-body p-4 d-flex flex-column position-relative">
              <div
                className="position-absolute shadow-sm rounded-circle d-flex justify-content-center align-items-center fw-bold text-white"
                style={{
                  width: "55px",
                  height: "55px",
                  top: "-27px",
                  right: "24px",
                  backgroundColor: currentSetting?.maintenance_mode
                    ? "#dc3545"
                    : "#b02a37",
                  border: "4px solid white",
                  fontSize: "1.4rem",
                  transition: "all 0.3s",
                }}
              >
                <i
                  className={
                    currentSetting?.maintenance_mode
                      ? "bi bi-lock-fill"
                      : "bi bi-exclamation-triangle"
                  }
                ></i>
              </div>

              <div className="mb-3 mt-1 pe-4">
                <span
                  className="d-block text-muted mb-1 text-uppercase"
                  style={{
                    fontSize: "0.65rem",
                    letterSpacing: "1px",
                    fontWeight: "700",
                  }}
                >
                  Description
                </span>
                <p
                  className="text-dark small fw-medium mb-0 lh-base"
                  style={{ minHeight: "45px" }}
                >
                  Enable maintenance mode loop. Instantly restricts all teacher
                  and student access to the system.
                </p>
              </div>

              <div
                className={`bg-light rounded-4 p-4 mb-4 border ${currentSetting?.maintenance_mode ? "border-danger" : "border-light-subtle"} flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center position-relative overflow-hidden transition-all`}
              >
                <div
                  className={`position-absolute top-0 start-0 w-100 ${currentSetting?.maintenance_mode ? "bg-danger" : ""} bg-opacity-75`}
                  style={{ height: "4px" }}
                ></div>

                <h6
                  className="fw-bold text-dark mb-1"
                  style={{ fontSize: "0.85rem" }}
                >
                  Philippine Standard Time
                </h6>
                <h3
                  className={`fw-bolder mb-3 font-monospace ${currentSetting?.maintenance_mode ? "text-danger" : "text-dark"}`}
                >
                  {pstTime}
                </h3>

                <div
                  className="small text-muted fw-medium lh-sm"
                  style={{ fontSize: "0.75rem" }}
                >
                  <i className="bi bi-info-circle-fill me-1 text-primary"></i>
                  <b>Advisory:</b> Maximum 1 hour. If it exceeds, users must
                  wait.
                </div>
              </div>

              <div className="mt-auto pt-3 border-top">
                <button
                  className={`btn ${currentSetting?.maintenance_mode ? "btn-danger" : "btn-outline-danger"} w-100 rounded-3 fw-bold shadow-sm`}
                  onClick={confirmMaintenance}
                >
                  <i className="bi bi-power me-2"></i>{" "}
                  {currentSetting?.maintenance_mode
                    ? "Turn OFF Maintenance"
                    : "Turn ON Maintenance"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SettingsFormModal
        formData={formData}
        handleInputChange={handleInputChange}
        handleFormSubmit={handleFormSubmit}
        executeReset={executeReset}
        currentSetting={currentSetting}
        executeMaintenanceToggle={executeMaintenanceToggle}
      />
    </>
  );
};

export default Settings;
