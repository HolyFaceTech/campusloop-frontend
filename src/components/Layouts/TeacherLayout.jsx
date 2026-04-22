import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { sileo } from "sileo";
import GlobalSpinner from "../Shared/GlobalSpinner";
import TermsAndPolicy from "../Shared/TermsAndPolicy";
import { Modal } from "bootstrap";
import TeacherActivityLogsModal from "../../pages/Teacher/TeacherActivityLogsModal";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const TeacherLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const navigate = useNavigate();

  const [showAvatar, setShowAvatar] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const [hasActiveEvent, setHasActiveEvent] = useState(false);
  const [hasTodayAlert, setHasTodayAlert] = useState(false);

  // MGA STATES PARA SA NOTIFICATIONS
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const avatarRef = useRef(null);
  const notifRef = useRef(null);

  const user = JSON.parse(
    localStorage.getItem("campusloop_user") ||
      sessionStorage.getItem("campusloop_user") ||
      "{}",
  );

  const [activeSettings, setActiveSettings] = useState({
    school_year: "Loading...",
    semester: "...",
  });

  const toggleSidebarMobile = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleSidebarDesktop = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  useEffect(() => {
    fetchActiveSettings();
    fetchActiveIndicator();
    checkTodayAlerts();
    fetchNotifications();

    window.addEventListener("settingsChanged", fetchActiveSettings);
    window.addEventListener("announcementsChanged", checkTodayAlerts);

    const intervalId = setInterval(() => {
      checkTodayAlerts();
      fetchActiveIndicator();
      fetchNotifications(); // Realtime polling
    }, 30000);

    return () => {
      window.removeEventListener("settingsChanged", fetchActiveSettings);
      window.removeEventListener("announcementsChanged", checkTodayAlerts);
      clearInterval(intervalId);
    };
  }, []);

  const fetchActiveSettings = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/settings`,
      );
      if (response.data) {
        setActiveSettings({
          school_year: response.data.school_year,
          semester: response.data.semester,
        });
      } else {
        setActiveSettings({ school_year: "Not Set", semester: "Not Set" });
      }
    } catch (error) {
      setActiveSettings({ school_year: "Error", semester: "Error" });
    }
  };

  const fetchActiveIndicator = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/calendar/active-indicator`,
      );
      setHasActiveEvent(response.data.has_active_events);
    } catch (error) {
      console.error("Failed to fetch calendar indicator", error);
    }
  };

  const checkTodayAlerts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/teacher/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );

      const today = new Date();
      const todayStr =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");

      const hasPublishedToday = response.data.announcements?.some((a) => {
        const pubDateObj = new Date(a.publish_from);
        const pubDateStr =
          pubDateObj.getFullYear() +
          "-" +
          String(pubDateObj.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(pubDateObj.getDate()).padStart(2, "0");
        return pubDateStr === todayStr;
      });

      const hasSchedulesToday = response.data.today_schedules?.length > 0;
      setHasTodayAlert(hasPublishedToday || hasSchedulesToday);
    } catch (error) {
      console.error("Failed to check today's alerts", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/teacher/notifications`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleNotificationClick = async (notif) => {
    setShowNotif(false);
    if (!notif.is_read) {
      try {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/teacher/notifications/${notif.id}/read`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
            },
          },
        );
        fetchNotifications();
      } catch (error) {
        console.error("Failed to mark as read", error);
      }
    }
    navigate(notif.link);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target))
        setShowAvatar(false);
      if (notifRef.current && !notifRef.current.contains(event.target))
        setShowNotif(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowAvatar(false);
    setLoadingText("Signing out...");
    setIsLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/logout`);
      localStorage.clear();
      sessionStorage.clear();
      sileo.success({
        title: "Logged Out",
        description: "You have been logged out successfully.",
        ...darkToast,
      });
      navigate("/login");
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to logout.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // PROGRAMMATIC MODAL OPENERS (Iwas Illegal Invocation Error)
  const openActivityLogs = () => {
    setShowAvatar(false);
    const modalElement = document.getElementById("teacherActivityLogsModal");
    if (modalElement) {
      const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
      modal.show();
    }
  };

  const openHelpCenter = () => {
    setShowAvatar(false);
    const modalElement = document.getElementById("teacherHelpModal");
    if (modalElement) {
      const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
      modal.show();
    }
  };

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="admin-layout">
        {isSidebarOpen && (
          <div
            className="sidebar-backdrop d-lg-none"
            onClick={toggleSidebarMobile}
          ></div>
        )}

        <aside
          className={`admin-sidebar flex-shrink-0 shadow-sm bg-white ${isSidebarOpen ? "show" : ""} ${isSidebarCollapsed ? "collapsed" : ""}`}
        >
          <div className="p-3 border-bottom text-center sidebar-header flex-shrink-0">
            <div className="sidebar-logo-container d-flex align-items-center justify-content-center mb-2">
              <img
                src="/images/logo.png"
                alt="Logo"
                style={{ width: "35px", height: "35px", objectFit: "contain" }}
              />
              <span
                className="sidebar-text ms-2 fw-bold fs-5"
                style={{ color: "var(--primary-color)", letterSpacing: "1px" }}
              >
                CAMPUSLOOP
              </span>
            </div>
            <span
              className="sidebar-badge badge rounded-3 w-100 py-2"
              style={{ backgroundColor: "var(--secondary-color)" }}
            >
              <i className="bi bi-person-video3 me-1"></i> TEACHER
            </span>
          </div>

          <div className="sidebar-links-container custom-scrollbar py-3">
            <NavLink
              to="/teacher/home"
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-house-door"></i>{" "}
              <span className="sidebar-text">Home</span>
            </NavLink>
            <NavLink
              to="/teacher/advisory"
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-people"></i>{" "}
              <span className="sidebar-text">Advisory Class</span>
            </NavLink>
            <NavLink
              to="/teacher/classrooms"
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-easel"></i>{" "}
              <span className="sidebar-text">Classrooms</span>
            </NavLink>
            <NavLink
              to="/teacher/forms"
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-file-earmark-text"></i>{" "}
              <span className="sidebar-text">Forms</span>
            </NavLink>
            <NavLink
              to="/teacher/files"
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-folder"></i>{" "}
              <span className="sidebar-text">Files</span>
            </NavLink>
            <NavLink
              to="/teacher/e-library"
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-journal-bookmark"></i>{" "}
              <span className="sidebar-text">E-Library</span>
            </NavLink>
            <NavLink
              to="/teacher/recycle-bin"
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-trash"></i>{" "}
              <span className="sidebar-text">Recycle Bin</span>
            </NavLink>
          </div>

          <div className="p-3 border-top bg-light flex-shrink-0 d-flex align-items-center justify-content-center">
            <div
              className="dropup position-relative flex-shrink-0"
              ref={avatarRef}
            >
              <button
                className="btn p-0 border-0 shadow-none d-flex align-items-center justify-content-center"
                type="button"
                onClick={() => setShowAvatar(!showAvatar)}
              >
                <div
                  className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold shadow-sm transition-all hover-shadow"
                  style={{
                    width: "40px",
                    height: "40px",
                    fontSize: "1.2rem",
                    backgroundColor: "var(--primary-color)",
                  }}
                >
                  {user.first_name ? user.first_name.charAt(0) : "T"}
                </div>
              </button>

              <ul
                className={`dropdown-menu shadow-lg border-0 rounded-4 mb-2 ${showAvatar ? "show" : ""}`}
                style={{
                  display: showAvatar ? "block" : "none",
                  position: "absolute",
                  bottom: "100%",
                  left: "0",
                  minWidth: "260px",
                  width: "max-content",
                  paddingBottom: "0",
                  overflow: "hidden",
                }}
              >
                <li className="p-4 text-muted border-bottom">
                  <span
                    className="fw-bold d-block text-dark mb-1"
                    style={{ fontSize: "0.75rem", letterSpacing: "1px" }}
                  >
                    SIGNED IN AS:
                  </span>
                  <span
                    className="d-block fw-bold text-dark"
                    style={{ fontSize: "0.95rem", whiteSpace: "nowrap" }}
                  >
                    {user.first_name} {user.last_name}
                  </span>
                  <span
                    className="d-block text-muted mt-1"
                    style={{ fontSize: "0.80rem", whiteSpace: "nowrap" }}
                  >
                    {user.email || "teacher@campusloop.com"}
                  </span>
                </li>
                <li>
                  <button
                    className="dropdown-item py-2 fw-medium"
                    onClick={openActivityLogs}
                  >
                    <i className="bi bi-clock-history text-primary me-2"></i>{" "}
                    Activity Logs
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item py-2 fw-medium"
                    onClick={openHelpCenter}
                  >
                    <i className="bi bi-question-circle text-primary me-2"></i>{" "}
                    Help Center
                  </button>
                </li>
              </ul>
            </div>
            <button
              onClick={handleLogout}
              className="sidebar-footer-text btn btn-danger shadow-sm ms-3 flex-grow-1 rounded-3"
              style={{ transition: "all 0.3s ease" }}
            >
              <i className="bi bi-box-arrow-right me-1"></i> Sign Out
            </button>
          </div>
        </aside>

        <main className="admin-main-content custom-scrollbar">
          <header className="admin-navbar bg-white px-4 py-3">
            <div className="d-flex align-items-center">
              <button
                className="btn border-0 fs-4 text-dark p-0 me-3 d-none d-lg-block"
                onClick={toggleSidebarDesktop}
              >
                <i className="bi bi-list"></i>
              </button>
              <button
                className="btn border-0 fs-3 text-dark p-0 me-3 d-lg-none"
                onClick={toggleSidebarMobile}
              >
                <i className="bi bi-list"></i>
              </button>

              <div className="d-none d-md-flex align-items-center gap-3 border rounded-pill px-3 py-1 bg-light">
                <span className="fw-bold text-muted small">
                  <i
                    className="bi bi-calendar-event me-2"
                    style={{ color: "var(--primary-color)" }}
                  ></i>{" "}
                  {activeSettings.school_year !== "Not Set"
                    ? `SY: ${activeSettings.school_year}`
                    : "SY: Not Set"}
                </span>
                <div className="vr"></div>
                <span className="fw-bold text-muted small">
                  <i
                    className="bi bi-clock-history me-2"
                    style={{ color: "var(--primary-color)" }}
                  ></i>{" "}
                  {activeSettings.semester !== "Not Set"
                    ? `${activeSettings.semester} Semester`
                    : "Semester Not Set"}
                </span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Link
                to="/teacher/calendar"
                className="btn btn-light rounded-circle shadow-sm position-relative"
                style={{
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className="bi bi-calendar-date text-dark fs-5"></i>
                {(hasActiveEvent || hasTodayAlert) && (
                  <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
                )}
              </Link>

              <div className="dropdown position-relative" ref={notifRef}>
                <button
                  className="btn btn-light rounded-circle shadow-sm position-relative"
                  style={{
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  type="button"
                  onClick={() => setShowNotif(!showNotif)}
                >
                  <i className="bi bi-bell text-dark fs-5"></i>
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
                  )}
                </button>

                <div
                  className={`dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 mt-2 ${showNotif ? "show" : ""}`}
                  style={{
                    display: showNotif ? "block" : "none",
                    position: "absolute",
                    top: "100%",
                    right: "0",
                    width: "350px",
                    maxWidth: "90vw",
                    padding: 0,
                    overflow: "hidden",
                  }}
                >
                  <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                    <h6
                      className="mb-0 fw-bold"
                      style={{ color: "var(--primary-color)" }}
                    >
                      Notifications
                    </h6>
                    {unreadCount > 0 && (
                      <span className="badge rounded-3 bg-danger">
                        {unreadCount} Unread
                      </span>
                    )}
                  </div>

                  <div
                    className="overflow-y-auto custom-scrollbar"
                    style={{ maxHeight: "350px" }}
                  >
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-muted small">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 50).map((notif) => (
                        <div
                          key={notif.id}
                          className="dropdown-item py-3 border-bottom text-wrap"
                          style={{
                            backgroundColor: notif.is_read
                              ? "transparent"
                              : "rgba(98, 111, 71, 0.05)",
                            cursor: "pointer",
                          }}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <div className="d-flex align-items-start">
                            <div
                              className="rounded-circle text-white d-flex align-items-center justify-content-center me-3"
                              style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: notif.is_read
                                  ? "#adb5bd"
                                  : "var(--primary-color)",
                                flexShrink: 0,
                              }}
                            >
                              <i
                                className={`bi ${notif.is_read ? "bi-bell" : "bi-bell-fill"}`}
                              ></i>
                            </div>
                            <div className="flex-grow-1">
                              <p
                                className={`mb-1 small ${notif.is_read ? "text-muted" : "text-dark fw-bold"}`}
                              >
                                {notif.description}
                              </p>
                              <p
                                className="mb-0 mt-1 fw-bold"
                                style={{
                                  fontSize: "0.70rem",
                                  color: "var(--secondary-color)",
                                }}
                              >
                                {formatTimeAgo(notif.created_at)}
                              </p>
                            </div>
                            {!notif.is_read && (
                              <div className="ms-2 mt-2">
                                <span
                                  className="p-1 rounded-circle d-inline-block"
                                  style={{
                                    backgroundColor: "var(--primary-color)",
                                  }}
                                ></span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 text-center bg-white border-top">
                    <button
                      onClick={() => {
                        setShowNotif(false);
                        navigate("/teacher/notifications");
                      }}
                      className="btn btn-campusloop btn-sm w-100 fw-bold rounded-3"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="d-flex flex-column flex-grow-1">
            <div className="container-fluid p-4 flex-grow-1">
              <Outlet />
            </div>

            <footer className="py-3 bg-white text-center border-top mt-auto flex-shrink-0 px-4">
              <small className="text-muted fw-medium">
                &copy; {new Date().getFullYear()} CampusLoop. All rights
                reserved.
                <span className="d-none d-md-inline mx-2">|</span>
                <br className="d-md-none" />
                <a
                  href="#"
                  className="text-decoration-none fw-bold"
                  style={{ color: "var(--primary-color)" }}
                  data-bs-toggle="offcanvas"
                  data-bs-target="#termsDrawer"
                >
                  Terms & Policy
                </a>
              </small>
            </footer>
          </div>
        </main>
      </div>

      <TermsAndPolicy />
      <TeacherActivityLogsModal />

      <div
        className="modal fade"
        id="teacherHelpModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-bottom-0 pb-0">
              <h5
                className="modal-title fw-bold"
                style={{ color: "var(--primary-color)" }}
              >
                <i className="bi bi-question-circle me-2"></i> Teacher Help
                Center
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body p-4 text-center">
              <h5 className="text-muted">Help Center (Coming Soon)</h5>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherLayout;
