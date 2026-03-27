import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal } from "bootstrap";

const AdminRespondentsModal = ({ selectedItem }) => {
  const [respondents, setRespondents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (selectedItem && selectedItem.type !== "material") {
      fetchRespondents();
    }
  }, [selectedItem]);

  const fetchRespondents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/classworks/${selectedItem.id}/submissions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );

      const data = res.data;
      if (Array.isArray(data)) {
        setRespondents(data);
      } else if (data && typeof data === "object") {
        setRespondents(Object.values(data));
      } else {
        setRespondents([]);
      }
    } catch (error) {
      console.error("Failed to fetch respondents", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(
          "MAY ERROR SA LARAVEL BACKEND: \n\n" + error.response.data.message,
        );
      }
      setRespondents([]);
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
        label: "WORD",
      };
    if (["xls", "xlsx", "csv"].includes(ext))
      return {
        icon: "bi-file-earmark-excel-fill",
        color: "#198754",
        bg: "#d1e7dd",
        label: "EXCEL",
      };
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext))
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

  const safeRespondents = Array.isArray(respondents) ? respondents : [];

  const filteredRespondents = safeRespondents.filter((s) => {
    if (!s) return false;
    const fullName = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
    const lrn = s.lrn ? String(s.lrn).toLowerCase() : "";
    const search = (searchTerm || "").toLowerCase();
    return fullName.includes(search) || lrn.includes(search);
  });

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

            <div className="p-3 bg-white border-bottom d-flex justify-content-end align-items-center">
              <div className="input-group" style={{ width: "350px" }}>
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

            <div className="modal-body p-3 bg-light">
              <div className="border rounded-3 overflow-hidden shadow-sm">
                <div
                  className="table-responsive custom-scrollbar bg-white"
                  style={{ maxHeight: "400px" }}
                >
                  <table className="table table-hover align-middle mb-0 custom-table">
                    <thead className="bg-light sticky-top">
                      <tr>
                        <th className="small fw-bold text-muted px-4 py-3 text-uppercase">
                          #
                        </th>
                        <th className="small fw-bold text-muted py-3 text-uppercase">
                          Student Details
                        </th>
                        <th className="small fw-bold text-muted py-3 text-center text-uppercase">
                          Status
                        </th>
                        <th className="small fw-bold text-muted py-3 text-center text-uppercase">
                          Date & Time
                        </th>
                        <th className="small fw-bold text-muted py-3 text-center text-uppercase">
                          Grade
                        </th>
                        <th className="small fw-bold text-muted py-3 pe-4 text-center text-uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="border-top-0">
                      {isLoading ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center py-5 text-muted"
                          >
                            Loading respondents...
                          </td>
                        </tr>
                      ) : filteredRespondents.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center py-5 text-muted"
                          >
                            <i className="bi bi-inbox fs-2 d-block mb-2 opacity-50"></i>
                            <span className="fw-medium">
                              No matching records found.
                            </span>
                          </td>
                        </tr>
                      ) : (
                        filteredRespondents.map((student, index) => {
                          const sub = student.submission;
                          const hasSubmission =
                            sub !== null && sub !== undefined;
                          const isGraded =
                            hasSubmission &&
                            sub.grade !== null &&
                            sub.grade !== undefined;
                          // LOGIC PARA SA RETURNED: Kapag walang grade pero may teacher_feedback o naka-tag na returned
                          const isReturned =
                            hasSubmission &&
                            !isGraded &&
                            (sub.teacher_feedback || sub.status === "returned");

                          return (
                            <tr key={student.id || index}>
                              <td className="px-4 text-muted fw-medium text-center">
                                {index + 1}
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div
                                    className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold shadow-sm flex-shrink-0"
                                    style={{
                                      width: "38px",
                                      height: "38px",
                                      backgroundColor: "var(--secondary-color)",
                                    }}
                                  >
                                    {student.first_name
                                      ? student.first_name.charAt(0)
                                      : "U"}
                                  </div>
                                  <div>
                                    <span
                                      className="d-block fw-bold text-dark lh-sm"
                                      style={{ fontSize: "0.9rem" }}
                                    >
                                      {student.last_name || ""},{" "}
                                      {student.first_name || "Unknown"}
                                    </span>
                                    <span
                                      className="text-muted"
                                      style={{ fontSize: "0.75rem" }}
                                    >
                                      LRN: {student.lrn || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="text-center">
                                {/* NA-UPDATE NA LOGIC NG STATUS BADGE */}
                                {isGraded ? (
                                  <span className="badge bg-success bg-opacity-10 text-success border border-success rounded-3 px-2 py-1">
                                    Graded
                                  </span>
                                ) : isReturned ? (
                                  <span className="badge bg-danger bg-opacity-10 text-danger border border-danger rounded-3 px-2 py-1">
                                    Returned
                                  </span>
                                ) : hasSubmission ? (
                                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-3 px-2 py-1">
                                    Turned In
                                  </span>
                                ) : (
                                  <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary rounded-3 px-2 py-1">
                                    Pending
                                  </span>
                                )}
                              </td>
                              <td
                                className="text-muted text-center"
                                style={{
                                  fontSize: "0.80rem",
                                  fontWeight: "500",
                                }}
                              >
                                {sub?.submitted_at
                                  ? new Date(sub.submitted_at).toLocaleString(
                                      [],
                                      {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )
                                  : "-"}
                              </td>
                              <td className="text-center fw-bolder fs-6">
                                {isGraded ? (
                                  <span className="text-success">
                                    {sub.grade}
                                  </span>
                                ) : (
                                  <span className="text-muted small">-</span>
                                )}
                              </td>
                              <td className="pe-4 text-center">
                                {hasSubmission ? (
                                  <button
                                    className="btn btn-sm btn-light border-0 shadow-sm rounded-circle d-inline-flex justify-content-center align-items-center transition-all hover-primary"
                                    style={{ width: "32px", height: "32px" }}
                                    onClick={() => openViewSubmission(student)}
                                    title="View Submission"
                                  >
                                    <i
                                      className="bi bi-eye-fill"
                                      style={{ color: "var(--primary-color)" }}
                                    ></i>
                                  </button>
                                ) : (
                                  <i className="bi bi-lock-fill text-muted opacity-50"></i>
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

      {/* VIEW SUBMISSION MODAL */}
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
              <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded-4 border border-light-subtle shadow-sm">
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
                      LRN: {selectedStudent?.lrn || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="text-end">
                  <span
                    className="d-block text-muted small fw-bold text-uppercase mb-1"
                    style={{ letterSpacing: "0.5px", fontSize: "0.65rem" }}
                  >
                    Date Submitted
                  </span>
                  <span className="badge bg-white text-dark border shadow-sm px-3 py-2 fw-medium">
                    <i className="bi bi-calendar-check me-1 text-primary"></i>
                    {selectedStudent?.submission?.submitted_at
                      ? new Date(
                          selectedStudent.submission.submitted_at,
                        ).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A"}
                  </span>
                </div>
              </div>

              <h6 className="fw-bold text-dark mb-3">
                <i className="bi bi-paperclip me-2 text-muted"></i>Attached
                Files
              </h6>
              {selectedStudent?.submission?.files &&
              selectedStudent.submission.files.length > 0 ? (
                <div className="d-flex flex-column gap-2 mb-4">
                  {selectedStudent.submission.files.map((file) => {
                    const style = getFileDetails(file.file_extension);
                    return (
                      <div
                        key={file.id}
                        className="d-flex align-items-center justify-content-between p-3 bg-light border rounded-4 shadow-sm hover-shadow transition-all w-100"
                      >
                        <div className="d-flex align-items-center overflow-hidden">
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
                            >
                              {file.name}
                            </p>
                            <p
                              className="mb-0 text-muted"
                              style={{ fontSize: "0.75rem" }}
                            >
                              {formatBytes(file.file_size)} •{" "}
                              {style.label || "FILE"}
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
                  <p className="text-muted small mb-0 fw-medium fst-italic">
                    No files attached to this submission.
                  </p>
                </div>
              )}

              {/* TEACHER FEEDBACK CARD */}
              {selectedStudent?.submission?.teacher_feedback && (
                <div
                  className="mb-4 p-3 rounded-4 shadow-sm"
                  style={{
                    backgroundColor: "#f8d7da",
                    border: "1px solid #f5c2c7",
                  }}
                >
                  <h6 className="fw-bold text-danger mb-2">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>{" "}
                    Teacher's Feedback
                  </h6>
                  <p
                    className="text-dark mb-0 small lh-base"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {selectedStudent.submission.teacher_feedback}
                  </p>
                </div>
              )}

              <div
                className="p-4 rounded-4 shadow-sm"
                style={{
                  backgroundColor: "var(--accent-color)",
                  border: "1px solid rgba(98, 111, 71, 0.2)",
                }}
              >
                {/* NA-UPDATE NA GRADE LAYOUT (LEFT AND RIGHT) */}
                <div className="d-flex justify-content-between align-items-center w-100">
                  <label className="form-label fw-bold text-dark mb-0 fs-6">
                    <i className="bi bi-award-fill text-warning me-2"></i>
                    Assignment Grade:
                  </label>
                  <div className="bg-white border rounded-3 px-3 py-1 shadow-sm d-inline-flex align-items-baseline">
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
