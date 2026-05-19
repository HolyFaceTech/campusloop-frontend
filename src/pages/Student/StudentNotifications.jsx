import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import { useNavigate } from "react-router-dom";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";

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

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading notifications...");

  const navigate = useNavigate();

  // STATES PARA SA DEBOUNCE AT PAGINATION
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // BACKGROUND POLLING Every 60s
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchNotifications(false);
    }, 60000);
    return () => clearInterval(intervalId);
  }, [searchQuery, currentPage, entriesPerPage]);

  // RESET PAGE PAG NAG-TYPE SA SEARCH
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage]);

  // SERVER-SIDE DEBOUNCE EFFECT (500ms)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchNotifications(true);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentPage, entriesPerPage]);

  const fetchNotifications = async (showSpinner = true) => {
    if (showSpinner) {
      setLoadingText("Loading notifications...");
      setIsLoading(true);
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/student/notifications`,
        {
          headers: getAuthHeader().headers,
          params: {
            search: searchQuery,
            page: currentPage,
            entries: entriesPerPage,
          },
        },
      );
      setNotifications(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
      setTotalRecords(response.data.total || 0);
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
          `${import.meta.env.VITE_API_BASE_URL}/student/notifications/${notif.id}/read`,
          {},
          getAuthHeader(),
        );
      } catch (error) {
        console.error("Failed to mark as read", error);
      }
    }
    navigate(notif.link);
  };

  const markAllAsRead = async () => {
    setLoadingText("Marking all as read...");
    setIsLoading(true);

    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/student/notifications/mark-all-read`,
        {},
        getAuthHeader(),
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
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const renderPageNumbers = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, "...", totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        pages = [
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        ];
      }
    }

    return pages.map((page, index) => (
      <li
        key={index}
        className={`page-item ${currentPage === page ? "active" : ""} ${page === "..." ? "disabled" : ""}`}
      >
        <button
          className={`page-link ${page === "..." ? "border-0 bg-transparent text-muted" : "page-link-summer"}`}
          onClick={() => page !== "..." && setCurrentPage(page)}
          style={page === "..." ? { cursor: "default" } : {}}
        >
          {page}
        </button>
      </li>
    ));
  };

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

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
          className="btn btn-campusloop shadow-sm fw-medium px-3 rounded-3 d-flex align-items-center gap-2"
          disabled={!notifications.some((n) => !n.is_read)}
        >
          <i className="bi bi-check2-all fs-5"></i>{" "}
          <span className="d-none d-sm-inline">Mark All as Read</span>
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-3 bg-white overflow-hidden">
        <div className="card-body p-0">
          <div className="d-flex flex-nowrap align-items-center justify-content-between overflow-x-auto custom-scrollbar p-3 gap-3">
            <div className="d-flex align-items-center flex-shrink-0 text-muted small pe-2">
              Show
              <select
                className="form-select form-select-sm mx-2 toolbar-input rounded-3"
                style={{ width: "70px" }}
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              entries
            </div>

            <div
              className="input-group"
              style={{ maxWidth: "400px", minWidth: "350px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                placeholder="Search Notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
        <div className="table-responsive custom-scrollbar">
          <table
            className="table table-hover align-middle mb-0"
            style={{ minWidth: "700px" }}
          >
            <tbody>
              {notifications.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan="3" className="p-4 bg-light border-bottom-0">
                    <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
                      <i
                        className="bi bi-inbox text-muted d-block mb-3"
                        style={{ fontSize: "3rem", opacity: 0.5 }}
                      ></i>
                      <h5 className="fw-bold text-dark">
                        {searchQuery
                          ? "No records found."
                          : "No notifications yet."}
                      </h5>
                      <p className="text-muted small mb-0">
                        {searchQuery
                          ? `No matching notifications found for search.`
                          : "You have no classroom or system activities at the moment."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                notifications.map((notif) => (
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
                        <span className="badge bg-success bg-opacity-10 text-success fw-medium border border-success-subtle rounded-3">
                          New
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && totalRecords > 0 && (
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 mb-4 px-2 gap-3">
          <p className="text-muted small mb-0">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
            {totalRecords} notifications
          </p>
          <nav>
            <ul className="pagination pagination-sm mb-0 flex-wrap justify-content-end">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link page-link-summer"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                >
                  Previous
                </button>
              </li>

              {renderPageNumbers()}

              <li
                className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link page-link-summer"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
};

export default StudentNotifications;
