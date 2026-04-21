import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";

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

const AdminActivityLogsModal = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/activity-logs`,
        getAuthHeader(),
      );
      setLogs(response.data);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to fetch activity logs.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const modalElement = document.getElementById("activityLogsModal");
    if (modalElement) {
      modalElement.addEventListener("show.bs.modal", fetchLogs);
    }
    return () => {
      if (modalElement) {
        modalElement.removeEventListener("show.bs.modal", fetchLogs);
      }
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const filteredLogs = logs.filter((log) => {
    return `${log.user_name} ${log.action} ${log.description}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / entriesPerPage);

  return (
    <div
      className="modal fade"
      id="activityLogsModal"
      tabIndex="-1"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-light">
          <div
            className="modal-header border-bottom pb-3"
            style={{ backgroundColor: "var(--accent-color)" }}
          >
            <h5
              className="modal-title fw-bold"
              style={{ color: "var(--primary-color)" }}
            >
              <i className="bi bi-clock-history me-2"></i> System Activity Logs
            </h5>
            <button
              type="button"
              className="btn-close shadow-none"
              data-bs-dismiss="modal"
            ></button>
          </div>

          <div
            className="modal-body p-4 custom-scrollbar"
            style={{ maxHeight: "80vh", overflowY: "auto" }}
          >
            <div className="card border-0 shadow-sm rounded-4 mb-3 bg-white overflow-hidden">
              <div className="card-body p-3">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div className="d-flex align-items-center flex-shrink-0 text-muted small">
                    Show
                    <select
                      className="form-select form-select-sm mx-2 toolbar-input rounded-3"
                      style={{ width: "70px" }}
                      value={entriesPerPage}
                      onChange={(e) =>
                        setEntriesPerPage(Number(e.target.value))
                      }
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    entries
                  </div>

                  <div
                    className="input-group ms-auto flex-grow-1"
                    style={{ maxWidth: "400px" }}
                  >
                    <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                      placeholder="Search User, Action, or Description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div
                className="table-responsive custom-scrollbar position-relative"
                style={{ minHeight: "300px" }}
              >
                <table
                  className="table table-summer align-middle mb-0"
                  style={{ minWidth: "900px" }}
                >
                  <thead>
                    <tr>
                      <th className="ps-4">User</th>
                      <th>Action</th>
                      <th>Description</th>
                      <th className="text-end pe-4">Date / Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center py-1">
                            <div
                              className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold me-3 shadow-sm flex-shrink-0"
                              style={{
                                width: "35px",
                                height: "35px",
                                backgroundColor: "var(--secondary-color)",
                              }}
                            >
                              {log.user_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                              <span className="fw-bold text-dark d-block">
                                {log.user_name}
                              </span>
                              <span
                                className="text-muted small d-block"
                                style={{
                                  fontSize: "0.75rem",
                                }}
                              >
                                {log.user_email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className="badge border text-dark text-uppercase rounded-3 px-2 py-1"
                            style={{ backgroundColor: "var(--accent-color)" }}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td
                          className="text-muted small fw-medium"
                          style={{ maxWidth: "250px" }}
                        >
                          {log.description}
                        </td>
                        <td className="text-muted small text-end pe-4">
                          {formatDateTime(log.created_at)}
                        </td>
                      </tr>
                    ))}
                    {currentLogs.length === 0 && !isLoading && (
                      <tr>
                        <td colSpan="4" className="text-center py-5 text-muted">
                          <i className="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
                          No activity logs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredLogs.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <p className="text-muted small mb-0">
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, filteredLogs.length)} of{" "}
                  {filteredLogs.length} entries
                </p>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
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
                    {[...Array(totalPages)].map((_, i) => (
                      <li
                        key={i}
                        className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                      >
                        <button
                          className="page-link page-link-summer"
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link page-link-summer"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>

          {/* MODAL FOOTER */}
          <div className="modal-footer border-top bg-white p-3 d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-light border px-4 fw-medium rounded-3 shadow-sm"
              data-bs-dismiss="modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminActivityLogsModal;
