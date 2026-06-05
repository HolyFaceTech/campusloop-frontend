import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal } from "bootstrap";

const AdminRespondentsModal = ({ selectedItem }) => {
  const [respondents, setRespondents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Kapag nagpalit ng Modal (Item), I-reset ang page sa 1
  useEffect(() => {
    if (selectedItem && selectedItem.type !== "material") {
      setCurrentPage(1);
      fetchRespondents();
    }
  }, [selectedItem]);

  // DEBOUNCE EFFECT
  useEffect(() => {
    if (selectedItem && selectedItem.type !== "material") {
      const delayDebounceFn = setTimeout(() => {
        fetchRespondents();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, currentPage, entriesPerPage]);

  const fetchRespondents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/classworks/${selectedItem.id}/submissions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
          params: {
            search: searchTerm,
            page: currentPage,
            entries: entriesPerPage,
          },
        },
      );
      setRespondents(res.data.data || []);
      setTotalPages(res.data.last_page || 1);
      setTotalRecords(res.data.total || 0);
    } catch (error) {
      console.error("Failed to fetch respondents", error);
      setRespondents([]);
      import("sileo").then(({ sileo }) => {
        const errorMsg =
          error.response?.data?.message || "Failed to load respondents.";
        sileo.error({
          title: "Error",
          description: errorMsg,
          fill: "#242424",
          styles: {
            title: "sileo-toast-title",
            description: "sileo-toast-desc",
          },
        });
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchModal = (hideId, showId) => {
    const hideEl = document.getElementById(hideId);
    if (hideEl) {
      const hideModalInstance = Modal.getInstance(hideEl);
      if (hideModalInstance) hideModalInstance.hide();
    }

    setTimeout(() => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      if (showId) {
        const showEl = document.getElementById(showId);
        if (showEl) {
          const showModalInstance = Modal.getOrCreateInstance(showEl);
          showModalInstance.show();
        }
      }
    }, 400);
  };

  const closeAllModals = () => {
    document.querySelectorAll(".modal.show").forEach((modal) => {
      const instance = Modal.getInstance(modal);
      if (instance) instance.hide();
    });
    setTimeout(() => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }, 400);
  };

  const openViewSubmission = (student) => {
    setSelectedStudent(student);
    switchModal("adminRespondentsModal", "adminViewSubmissionModal");
  };

  const closeViewSubmission = () => {
    switchModal("adminViewSubmissionModal", "adminRespondentsModal");
  };

  const formatBytes = (bytes) => {
    if (bytes === 0 || !bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileDetails = (extension) => {
    const ext = extension?.toLowerCase();
    if (["pdf"].includes(ext))
      return {
        icon: "bi-file-earmark-pdf-fill",
        color: "#dc3545",
        bg: "#f8d7da",
        label: "PDF",
      };
    if (["doc", "docx"].includes(ext))
      return {
        icon: "bi-file-earmark-word-fill",
        color: "#0d6efd",
        bg: "#cfe2ff",
        label: "DOCX",
      };
    if (["xls", "xlsx", "csv"].includes(ext))
      return {
        icon: "bi-file-earmark-excel-fill",
        color: "#198754",
        bg: "#d1e7dd",
        label: "EXCEL",
      };
    if (["ppt", "pptx"].includes(ext))
      return {
        icon: "bi-file-earmark-ppt-fill",
        color: "#fd7e14",
        bg: "#ffe5d0",
        label: "POWERPOINT",
      };
    if (["png", "jpg", "jpeg", "gif"].includes(ext))
      return {
        icon: "bi-file-earmark-image-fill",
        color: "#6f42c1",
        bg: "#e0cffc",
        label: "IMAGE",
      };
    if (["mp4", "avi", "mov"].includes(ext))
      return {
        icon: "bi-file-earmark-play-fill",
        color: "#fd7e14",
        bg: "#ffe5d0",
        label: "VIDEO",
      };
    return {
      icon: "bi-file-earmark-fill",
      color: "#6c757d",
      bg: "#e2e3e5",
      label: "FILE",
    };
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
      <div
        className="modal fade"
        id="adminRespondentsModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-light">
            <div
              className="modal-header border-bottom py-3 d-flex flex-row align-items-center justify-content-between"
              style={{ backgroundColor: "var(--accent-color)" }}
            >
              <h5
                className="modal-title fw-bold mb-0"
                style={{ color: "var(--primary-color)" }}
              >
                <i className="bi bi-people-fill me-2"></i> Respondents:{" "}
                {selectedItem?.title || "Classwork"}
                {selectedItem?.points
                  ? ` • Total Points: ${selectedItem.points}`
                  : ""}
              </h5>
              <button
                type="button"
                className="btn-close shadow-none m-0"
                onClick={closeAllModals}
              ></button>
            </div>

            <div className="modal-body p-4 bg-light">
              <div className="card border-0 shadow-sm rounded-4 mb-3 bg-white overflow-hidden">
                <div className="card-body p-0">
                  <div className="d-flex flex-nowrap align-items-center justify-content-between overflow-x-auto custom-scrollbar p-3 gap-3">
                    <div className="d-flex align-items-center flex-shrink-0 text-muted small">
                      Show
                      <select
                        className="form-select form-select-sm mx-2 toolbar-input rounded-3"
                        style={{ width: "70px" }}
                        value={entriesPerPage}
                        onChange={(e) => {
                          setEntriesPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
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
                        placeholder="Search Name or LRN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                        <th style={{ width: "60px" }} className="ps-4">
                          #
                        </th>
                        <th>Student Details</th>
                        <th className="text-center">Status</th>
                        <th className="text-center">Date & Time</th>
                        <th className="text-center">Grade</th>
                        <th className="text-center pe-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center py-5 text-muted bg-white"
                          >
                            <div
                              className="spinner-border spinner-border-sm text-primary me-2"
                              role="status"
                            ></div>
                            Loading respondents...
                          </td>
                        </tr>
                      ) : respondents.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="p-4 bg-light border-bottom-0"
                          >
                            <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
                              <i
                                className="bi bi-inbox text-muted d-block mb-3"
                                style={{ fontSize: "3rem", opacity: 0.5 }}
                              ></i>
                              <h5 className="fw-bold text-dark">
                                No respondents found.
                              </h5>
                              <p className="text-muted small mb-0">
                                {searchTerm
                                  ? "No matching students for your search."
                                  : "No respondents for this classwork yet."}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        respondents.map((student, index) => {
                          const sub = student.submission;
                          const hasSubmission =
                            sub !== null && sub !== undefined;
                          const isGraded =
                            hasSubmission &&
                            sub.grade !== null &&
                            sub.grade !== undefined;
                          const isReturned =
                            hasSubmission &&
                            !isGraded &&
                            (sub.teacher_feedback || sub.status === "returned");
                          const hasDeadline = selectedItem?.deadline;
                          const deadlineTime = hasDeadline
                            ? new Date(selectedItem.deadline).getTime()
                            : null;
                          const submitTime =
                            hasSubmission && sub.submitted_at
                              ? new Date(sub.submitted_at).getTime()
                              : null;
                          const currentTime = new Date().getTime();

                          const isDoneLate =
                            hasDeadline &&
                            hasSubmission &&
                            submitTime > deadlineTime;
                          const isMissing =
                            hasDeadline &&
                            !hasSubmission &&
                            currentTime > deadlineTime;

                          return (
                            <tr key={student.id || index}>
                              <td className="ps-4 fw-bold text-muted">
                                {(currentPage - 1) * entriesPerPage + index + 1}
                              </td>
                              <td>
                                <div className="d-flex align-items-center py-1">
                                  <div
                                    className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold me-3 shadow-sm flex-shrink-0"
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      backgroundColor: "var(--secondary-color)",
                                    }}
                                  >
                                    {student.first_name
                                      ? student.first_name.charAt(0)
                                      : "U"}
                                  </div>
                                  <div className="overflow-hidden">
                                    <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                                      <span
                                        className="fw-bold text-dark text-truncate"
                                        style={{ maxWidth: "250px" }}
                                      >
                                        {student.last_name || ""},{" "}
                                        {student.first_name || "Unknown"}
                                      </span>
                                    </div>
                                    <p
                                      className="mb-0 text-muted text-truncate"
                                      style={{
                                        fontSize: "0.80rem",
                                        maxWidth: "250px",
                                      }}
                                    >
                                      <i className="bi bi-123 me-1 text-muted"></i>{" "}
                                      {student.lrn || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="text-center">
                                {isGraded ? (
                                  <span className="badge bg-success bg-opacity-10 text-success fw-medium border border-success rounded-3 px-2 py-1 shadow-sm">
                                    Graded
                                  </span>
                                ) : isReturned ? (
                                  <span className="badge bg-danger bg-opacity-10 text-danger fw-medium border border-danger rounded-3 px-2 py-1 shadow-sm">
                                    Returned
                                  </span>
                                ) : isDoneLate ? (
                                  <span className="badge bg-warning bg-opacity-10 text-warning fw-medium border border-warning rounded-3 px-2 py-1 shadow-sm">
                                    Done Late
                                  </span>
                                ) : hasSubmission ? (
                                  <span className="badge bg-primary bg-opacity-10 text-primary fw-medium border border-primary rounded-3 px-2 py-1 shadow-sm">
                                    Turned In
                                  </span>
                                ) : isMissing ? (
                                  <span className="badge bg-danger bg-opacity-10 text-danger fw-medium border border-danger rounded-3 px-2 py-1 shadow-sm">
                                    Missing
                                  </span>
                                ) : (
                                  <span className="badge bg-secondary bg-opacity-10 text-secondary fw-medium border border-secondary rounded-3 px-2 py-1 shadow-sm">
                                    Pending
                                  </span>
                                )}
                              </td>
                              <td className="text-muted text-center small">
                                {sub?.submitted_at ? (
                                  <>
                                    <i className="bi bi-clock me-1"></i>{" "}
                                    {new Date(sub.submitted_at).toLocaleString(
                                      [],
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="text-center fs-6">
                                {isGraded ? (
                                  <span className="text-success fw-bolder">
                                    {sub.grade}
                                  </span>
                                ) : (
                                  <span className="text-muted small">-</span>
                                )}
                              </td>
                              <td className="text-center pe-4">
                                {hasSubmission ? (
                                  <button
                                    className="btn btn-sm btn-light border-0 shadow-sm rounded-circle"
                                    style={{ width: "35px", height: "35px" }}
                                    onClick={() => openViewSubmission(student)}
                                    title="View Submission"
                                  >
                                    <i
                                      className="bi bi-eye-fill"
                                      style={{ color: "var(--primary-color)" }}
                                    ></i>
                                  </button>
                                ) : (
                                  <span className="text-secondary rounded-3">
                                    <i className="bi bi-lock-fill me-1"></i>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {totalRecords > 0 && (
                <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-3 px-2">
                  <p className="text-muted small mb-0">
                    Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
                    {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
                    {totalRecords} respondents
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

            <div className="modal-footer border-top bg-light p-3 d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-light border px-4 fw-medium rounded-3 shadow-sm"
                onClick={closeAllModals}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="adminViewSubmissionModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-light">
            <div
              className="modal-header border-bottom py-3"
              style={{ backgroundColor: "var(--accent-color)" }}
            >
              <h5
                className="modal-title fw-bold mb-0"
                style={{ color: "var(--primary-color)" }}
              >
                <i className="bi bi-folder-symlink me-2"></i> Student Submission
              </h5>
              <button
                type="button"
                className="btn-close shadow-none"
                onClick={closeViewSubmission}
              ></button>
            </div>

            <div className="modal-body p-4 bg-white custom-scrollbar">
              <div className="d-flex justify-content-between align-items-center mb-4 p-3">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold fs-5 shadow-sm"
                    style={{
                      width: "50px",
                      height: "50px",
                      backgroundColor: "var(--secondary-color)",
                    }}
                  >
                    {selectedStudent?.first_name
                      ? selectedStudent.first_name.charAt(0)
                      : "U"}
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-0">
                      {selectedStudent?.first_name || ""}{" "}
                      {selectedStudent?.last_name || ""}
                    </h5>
                    <span className="text-muted small">
                      <i className="bi bi-123 me-1 text-muted"></i>{" "}
                      {selectedStudent?.lrn || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="text-end">
                  <span
                    className="d-block text-muted small fw-bold text-uppercase mb-2"
                    style={{ letterSpacing: "0.5px", fontSize: "0.65rem" }}
                  >
                    Date Submitted :
                  </span>
                  <span className="text-dark px-3 py-2 fw-medium small">
                    <i className="bi bi-calendar-check me-2 text-primary"></i>
                    {selectedStudent?.submission?.submitted_at
                      ? new Date(
                          selectedStudent.submission.submitted_at,
                        ).toLocaleString([], {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </span>
                </div>
              </div>

              <h6 className="small text-muted mb-2 d-block">Attached Files:</h6>
              {selectedStudent?.submission?.files &&
              selectedStudent.submission.files.length > 0 ? (
                <div className="d-flex flex-column gap-2 mb-4">
                  {selectedStudent.submission.files.map((file) => {
                    const style = getFileDetails(file.file_extension);
                    return (
                      <div
                        key={file.id}
                        className="d-flex align-items-center justify-content-between p-3 bg-white border rounded-4 shadow-sm transition-all hover-shadow"
                      >
                        <div className="d-flex align-items-center overflow-hidden pe-3">
                          <div
                            className="rounded-3 d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                            style={{
                              width: "45px",
                              height: "45px",
                              backgroundColor: style.bg,
                              color: style.color,
                            }}
                          >
                            <i className={`bi ${style.icon} fs-4`}></i>
                          </div>
                          <div className="overflow-hidden">
                            <p
                              className="mb-0 fw-bold text-dark text-truncate"
                              style={{ fontSize: "0.95rem" }}
                              title={file.name}
                            >
                              {file.name}
                            </p>
                            <p
                              className="mb-0 text-muted text-uppercase"
                              style={{ fontSize: "0.75rem" }}
                            >
                              {formatBytes(file.file_size)} • {style.label}
                            </p>
                          </div>
                        </div>
                        <a
                          href={`${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${file.path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-campusloop rounded-3 shadow-sm flex-shrink-0 ms-3 d-flex justify-content-center align-items-center"
                          style={{ width: "38px", height: "38px" }}
                        >
                          <i className="bi bi-eye-fill"></i>
                        </a>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-4 bg-light rounded-4 border border-light-subtle mb-4">
                  <p className="text-muted small mb-0 fw-medium">
                    No files attached to this submission.
                  </p>
                </div>
              )}

              {selectedStudent?.submission?.teacher_feedback && (
                <div
                  className="mb-4 p-3 rounded-4 shadow-sm"
                  style={{
                    backgroundColor: "#f8d7da",
                    border: "1px solid #f5c2c7",
                  }}
                >
                  <h6 className="fw-bold text-danger small mb-3">
                    <i className="bi bi-exclamation-triangle me-2"></i>{" "}
                    Teacher's Feedback
                  </h6>
                  <div
                    className="bg-white p-3 rounded-3 border border-danger border-opacity-25 text-dark mb-0 custom-scrollbar shadow-sm"
                    style={{
                      fontSize: "0.95rem",
                      lineHeight: "1.6",
                      maxHeight: "150px",
                      overflowY: "auto",
                    }}
                  >
                    {selectedStudent.submission.teacher_feedback}
                  </div>
                </div>
              )}

              <div
                className="p-4 rounded-4 shadow-sm"
                style={{
                  backgroundColor: "var(--accent-color)",
                  border: "1px solid rgba(98, 111, 71, 0.2)",
                }}
              >
                <div className="d-flex justify-content-between align-items-center w-100">
                  <label className="form-label fw-bold text-dark mb-0 fs-6">
                    <i className="bi bi-award-fill text-warning me-2"></i>
                    Assignment Grade:
                  </label>
                  <div className="d-inline-flex align-items-baseline">
                    <span className="fw-bolder text-primary fs-5 lh-1">
                      {selectedStudent?.submission?.grade ?? "-"}
                    </span>
                    <span className="text-muted small fw-medium ms-1 lh-1">
                      / {selectedItem?.points || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top bg-light p-3 d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-light border px-4 fw-medium rounded-3 shadow-sm"
                onClick={closeViewSubmission}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminRespondentsModal;
