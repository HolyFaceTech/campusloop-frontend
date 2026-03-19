import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { sileo } from "sileo";
import GlobalSpinner from "../Shared/GlobalSpinner";
import TermsAndPolicy from "../Shared/TermsAndPolicy";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const navigate = useNavigate();

  // FOOLPROOF REACT STATES PARA SA DROPDOWNS
  const [showAvatar, setShowAvatar] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [hasActiveEvent, setHasActiveEvent] = useState(false);

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

  // KUNIN ANG ACTIVE SETTINGS AT ACTIVE INDICATOR AT MAKINIG SA "settingsChanged" EVENT
  useEffect(() => {
    fetchActiveSettings();
    fetchActiveIndicator();

    // Event listener para kapag nag-save sa Settings, mag-update ito nang walang reload!
    window.addEventListener("settingsChanged", fetchActiveSettings);

    // Cleanup function
    return () => {
      window.removeEventListener("settingsChanged", fetchActiveSettings);
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
        setActiveSettings({
          school_year: "Not Set",
          semester: "Not Set",
        });
      }
    } catch (error) {
      setActiveSettings({
        school_year: "Error",
        semester: "Error",
      });
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

  // ISARA ANG DROPDOWNS KAPAG PUMINDOT SA LABAS
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setShowAvatar(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
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

  const handleViewAllNotifications = () => {
    setShowNotif(false);
    setLoadingText("Fetching Notifications...");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/admin/notifications");
    }, 1200);
  };

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="admin-layout">
        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div
            className="sidebar-backdrop d-lg-none"
            onClick={toggleSidebarMobile}
          ></div>
        )}

        {/* SIDEBAR SECTION */}
        <aside
          className={`admin-sidebar shadow-sm bg-white ${isSidebarOpen ? "show" : ""} ${isSidebarCollapsed ? "collapsed" : ""}`}
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
              className="sidebar-badge badge rounded-pill w-100 py-2"
              style={{ backgroundColor: "var(--secondary-color)" }}
            >
              <i className="bi bi-shield-lock me-1"></i> ADMIN
            </span>
          </div>

          <div className="sidebar-links-container custom-scrollbar py-3">
            <NavLink
              to="/admin/dashboard"
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-grid-1x2"></i>{" "}
              <span className="sidebar-text">Dashboard</span>
            </NavLink>
            <NavLink
              to="/admin/users"
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-people"></i>{" "}
              <span className="sidebar-text">User Records</span>
            </NavLink>
            <NavLink
              to="/admin/student-grades"
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-award"></i>{" "}
              <span className="sidebar-text">Student Grades</span>
            </NavLink>

            <div
              className="menu-header text-muted small fw-bold px-4 mt-4 mb-2"
              style={{ letterSpacing: "1px", fontSize: "0.75rem" }}
            >
              ACADEMIC MANAGEMENT
            </div>
            <NavLink
              to="/admin/strands"
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-diagram-3"></i>{" "}
              <span className="sidebar-text">Strands</span>
            </NavLink>
            <NavLink
              to="/admin/subjects"
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-book"></i>{" "}
              <span className="sidebar-text">Subjects</span>
            </NavLink>

            <div
              className="menu-header text-muted small fw-bold px-4 mt-4 mb-2"
              style={{ letterSpacing: "1px", fontSize: "0.75rem" }}
            >
              MONITORING & OVERSIGHT
            </div>
            <NavLink
              to="/admin/classrooms"
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-easel"></i>{" "}
              <span className="sidebar-text">Classrooms</span>
            </NavLink>
            <NavLink
              to="/admin/forms"
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-file-earmark-text"></i>{" "}
              <span className="sidebar-text">Forms</span>
            </NavLink>
            <NavLink
              to="/admin/files"
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-folder"></i>{" "}
              <span className="sidebar-text">Files</span>
            </NavLink>

            <div
              className="menu-header text-muted small fw-bold px-4 mt-4 mb-2"
              style={{ letterSpacing: "1px", fontSize: "0.75rem" }}
            >
              CONTENT APPROVAL
            </div>
            <NavLink
              to="/admin/announcements"
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-megaphone"></i>{" "}
              <span className="sidebar-text">Announcements</span>
            </NavLink>
            <NavLink
              to="/admin/e-libraries"
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-journal-bookmark"></i>{" "}
              <span className="sidebar-text">E-Library</span>
            </NavLink>

            <div
              className="menu-header text-muted small fw-bold px-4 mt-4 mb-2"
              style={{ letterSpacing: "1px", fontSize: "0.75rem" }}
            >
              SYSTEM SETTINGS
            </div>
            <NavLink
              to="/admin/settings"
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-gear"></i>{" "}
              <span className="sidebar-text">Settings</span>
            </NavLink>
            <NavLink
              to="/admin/recycle-bin"
              className="sidebar-link"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="bi bi-trash"></i>{" "}
              <span className="sidebar-text">Recycle Bin</span>
            </NavLink>
          </div>

          {/* AVATAR DROPDOWN */}
          <div className="p-3 border-top bg-light flex-shrink-0">
            <div className="dropup w-100 position-relative" ref={avatarRef}>
              <button
                className="sidebar-footer-btn btn w-100 text-start d-flex align-items-center justify-content-between border-0 p-1"
                type="button"
                onClick={() => setShowAvatar(!showAvatar)}
              >
                <div className="d-flex align-items-center justify-content-center w-100 text-lg-start">
                  <div
                    className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold shadow-sm"
                    style={{
                      width: "40px",
                      height: "40px",
                      fontSize: "1.2rem",
                      flexShrink: 0,
                      backgroundColor: "var(--primary-color)",
                    }}
                  >
                    {user.first_name ? user.first_name.charAt(0) : "A"}
                  </div>
                  <div className="sidebar-footer-text ms-3 overflow-hidden text-start flex-grow-1">
                    <p
                      className="mb-0 fw-bold text-truncate text-dark"
                      style={{ fontSize: "0.90rem" }}
                    >
                      {user.first_name} {user.last_name}
                    </p>
                    <p
                      className="mb-0 text-muted text-truncate"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {user.email || "admin@campusloop.com"}
                    </p>
                  </div>
                </div>
              </button>

              <ul
                className={`dropdown-menu shadow-lg border-0 rounded-4 mb-2 ${showAvatar ? "show" : ""}`}
                style={{
                  display: showAvatar ? "block" : "none",
                  position: "absolute",
                  bottom: "100%",
                  left: "0",
                  minWidth: "250px",
                }}
              >
                <li>
                  <button
                    className="dropdown-item py-2 fw-medium"
                    data-bs-toggle="modal"
                    data-bs-target="#activityLogsModal"
                    onClick={() => setShowAvatar(false)}
                  >
                    <i className="bi bi-clock-history text-primary me-2"></i>{" "}
                    Activity Logs
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item py-2 fw-medium"
                    data-bs-toggle="modal"
                    data-bs-target="#adminHelpModal"
                    onClick={() => setShowAvatar(false)}
                  >
                    <i className="bi bi-question-circle text-primary me-2"></i>{" "}
                    Help Center
                  </button>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item py-2 fw-bold text-danger"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
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

            {/* NOTIFICATION DROPDOWN */}
            <div className="d-flex align-items-center gap-2">
              <Link
                to="/admin/calendar"
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
                {hasActiveEvent && (
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
                  <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
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
                    <span className="badge rounded-pill bg-danger">
                      2 Unread
                    </span>
                  </div>

                  <div
                    className="overflow-y-auto custom-scrollbar"
                    style={{ maxHeight: "350px" }}
                  >
                    <a
                      href="#"
                      className="dropdown-item py-3 border-bottom text-wrap"
                      style={{ backgroundColor: "rgba(98, 111, 71, 0.05)" }}
                    >
                      <div className="d-flex align-items-start">
                        <div
                          className="rounded-circle text-white d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: "var(--primary-color)",
                            flexShrink: 0,
                          }}
                        >
                          <i className="bi bi-person-check"></i>
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-1 small text-dark fw-bold">
                            New user registered!
                          </p>
                          <p
                            className="mb-0 text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            A new teacher account was created.
                          </p>
                          <p
                            className="mb-0 mt-1 fw-bold"
                            style={{
                              fontSize: "0.70rem",
                              color: "var(--secondary-color)",
                            }}
                          >
                            Just now
                          </p>
                        </div>
                        <div className="ms-2 mt-2">
                          <span
                            className="p-1 rounded-circle d-inline-block"
                            style={{ backgroundColor: "var(--primary-color)" }}
                          ></span>
                        </div>
                      </div>
                    </a>
                  </div>

                  <div className="p-3 text-center bg-white border-top">
                    <button
                      onClick={handleViewAllNotifications}
                      className="btn btn-campusloop btn-sm w-100 fw-bold rounded-pill"
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

            {/* TERMS & POLICY */}
            <footer className="py-3 bg-white text-center border-top mt-auto flex-shrink-0">
              <small className="text-muted fw-medium">
                &copy; {new Date().getFullYear()} CampusLoop. All rights
                reserved. <br className="d-md-none" />
                <span className="d-none d-md-inline"> | </span>
                <a
                  href="#"
                  className="text-decoration-none ms-md-2 fw-bold"
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

      {/* RENDER ANG TERMS & POLICY DRAWER */}
      <TermsAndPolicy />

      <div
        className="modal fade"
        id="activityLogsModal"
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
                <i className="bi bi-clock-history me-2"></i> Activity Logs
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body p-4 text-center">
              <img
                src="/images/spinner.svg"
                alt="Logs"
                className="img-fluid opacity-50 mb-3"
                style={{ maxWidth: "100px" }}
              />
              <h5 className="text-muted">Activity Logs (Coming Soon)</h5>
              <p className="small text-muted mb-0">
                Dito ilalagay ang Datatable ng lahat ng activities ng Admin at
                Users.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="adminHelpModal"
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
                <i className="bi bi-question-circle me-2"></i> Admin Help Center
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body p-4 text-center">
              <img
                src="/images/help.svg"
                alt="Help"
                className="img-fluid mb-3"
                style={{ maxWidth: "150px" }}
              />
              <h5 className="text-muted">Help Center (Coming Soon)</h5>
              <p className="small text-muted mb-0">
                Dito gagawin ang Accordion ng mga instructions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
