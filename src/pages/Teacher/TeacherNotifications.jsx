import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import { useNavigate } from "react-router-dom";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const TeacherNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications(true);
    const intervalId = setInterval(() => {
      fetchNotifications(false);
    }, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchNotifications = async (showSpinner = true) => {
    if (showSpinner) setIsLoading(true);
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
      console.error("Failed to load notifications", error);
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notif) => {
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
      } catch (error) {
        console.error("Failed to mark as read", error);
      }
    }
    navigate(notif.link);
  };

  const markAllAsRead = async () => {
    setIsLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/teacher/notifications/mark-all-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      sileo.success({
        title: "Success",
        description: "All notifications marked as read.",
        ...darkToast,
      });
      fetchNotifications(false);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to mark all as read.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const options = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const filteredNotifications = notifications.filter((notif) =>
    notif.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text="Loading notifications..." />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            Notifications <i className="bi bi-bell ms-1"></i>
          </h3>
          <p className="text-muted small mb-0">
            Stay updated with classroom and system activities.
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          className="btn btn-campusloop shadow-sm px-4 rounded-3 d-flex align-items-center gap-2"
          disabled={!notifications.some((n) => !n.is_read)}
        >
          <i className="bi bi-check2-all fs-5"></i> Mark All as Read
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-12 col-md-6 col-xl-4">
          <div className="input-group shadow-sm rounded-3 overflow-hidden">
            <span className="input-group-text bg-white border-end-0 text-muted px-3">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0 toolbar-input"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="card-body p-0">
          {notifications.length === 0 && !isLoading ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-bell-slash fs-1 d-block mb-2 opacity-50"></i>
              No notifications yet.
            </div>
          ) : filteredNotifications.length === 0 && !isLoading ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-search fs-1 d-block mb-2 opacity-50"></i>
              No matching notifications found.
            </div>
          ) : (
            <div className="table-responsive custom-scrollbar">
              <table className="table table-hover align-middle mb-0">
                <tbody>
                  {filteredNotifications.map((notif) => (
                    <tr
                      key={notif.id}
                      style={{
                        cursor: "pointer",
                        backgroundColor: notif.is_read
                          ? "transparent"
                          : "rgba(98, 111, 71, 0.05)",
                      }}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <td className="ps-4 py-3" style={{ width: "60px" }}>
                        <div
                          className="rounded-circle text-white d-flex align-items-center justify-content-center"
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: notif.is_read
                              ? "#adb5bd"
                              : "var(--primary-color)",
                          }}
                        >
                          <i
                            className={`bi ${notif.is_read ? "bi-bell" : "bi-bell-fill"}`}
                          ></i>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`d-block ${notif.is_read ? "text-muted" : "fw-bold text-dark"}`}
                        >
                          {notif.description}
                        </span>
                        <span className="small text-muted">
                          <i className="bi bi-clock me-1"></i>{" "}
                          {formatDateTime(notif.created_at)}
                        </span>
                      </td>
                      <td
                        className="pe-4 py-3 text-end"
                        style={{ width: "120px" }}
                      >
                        {!notif.is_read && (
                          <span className="badge bg-danger rounded-3">New</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TeacherNotifications;
