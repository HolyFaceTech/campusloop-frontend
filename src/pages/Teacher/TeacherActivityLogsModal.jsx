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

const TeacherActivityLogsModal = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/teacher/activity-logs`,
        {
          ...getAuthHeader(),
          params: {
            search: searchQuery,
            page: currentPage,
            entries: entriesPerPage,
          },
        },
      );
      const data = response.data;
      setLogs(data.data || []);
      setTotalPages(data.last_page || 1);
      setTotalRecords(data.total || 0);
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

  // Reset page kapag nag-search o nagpalit ng entries
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage]);

  // DEBOUNCE EFFECT (500ms server request delay)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLogs();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentPage, entriesPerPage]);

  useEffect(() => {
    const modalElement = document.getElementById("teacherActivityLogsModal");
    const onShow = () => fetchLogs();
    if (modalElement) {
      modalElement.addEventListener("show.bs.modal", onShow);
    }
    return () => {
      if (modalElement) {
        modalElement.removeEventListener("show.bs.modal", onShow);
      }
    };
  }, [searchQuery, currentPage, entriesPerPage]);

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
    <div
      className="modal fade"
      id="teacherActivityLogsModal"
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
              <i className="bi bi-clock-history me-2"></i> My Activity Logs
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
              <div className="card-body p-0">
                <div className="d-flex flex-nowrap align-items-center justify-content-between overflow-x-auto custom-scrollbar p-3 gap-3">
                  <div className="d-flex align-items-center flex-shrink-0 text-muted small pe-2">
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
                    className="input-group"
                    style={{ maxWidth: "400px", minWidth: "350px" }}
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

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-0">
              <div
                className="table-responsive custom-scrollbar"
                style={{ maxHeight: "400px" }}
              >
                <table
                  className="table table-summer align-middle mb-0"
                  style={{ minWidth: "900px" }}
                >
                  <thead className="sticky-top bg-white z-1 shadow-sm">
                    <tr>
                      <th className="ps-4">User</th>
                      <th>Action</th>
                      <th>Description</th>
                      <th className="text-end pe-4">Date / Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-5 text-muted bg-white"
                        >
                          <div
                            className="spinner-border spinner-border-sm text-primary me-2"
                            role="status"
                          ></div>
                          Loading activity logs...
                        </td>
                      </tr>
                    ) : logs.length > 0 ? (
                      logs.map((log) => (
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
                              className="badge border border-dark-subtle bg-opacity-10 text-dark fw-medium text-uppercase rounded-3 px-2 py-1 shadow-sm"
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
                          <td className="text-muted small text-end pe-4 text-nowrap">
                            {formatDateTime(log.created_at)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="p-4 bg-light border-bottom-0"
                        >
                          <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
                            <i
                              className="bi bi-inbox text-muted d-block mb-3"
                              style={{ fontSize: "3rem", opacity: 0.5 }}
                            ></i>
                            <h5 className="fw-bold text-dark">
                              {searchQuery
                                ? "No records found."
                                : "Activity logs are empty."}
                            </h5>
                            <p className="text-muted small mb-0">
                              {searchQuery
                                ? "No matching activity logs found for your search."
                                : "No system activities have been recorded yet."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalRecords > 0 && !isLoading && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <p className="text-muted small mb-0">
                  Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
                  {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
                  {totalRecords} activities
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
                    {renderPageNumbers()}
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

export default TeacherActivityLogsModal;
