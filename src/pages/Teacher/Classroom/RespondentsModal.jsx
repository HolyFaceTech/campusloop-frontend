import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import { Modal } from "bootstrap";
import GlobalSpinner from "../../../components/Shared/GlobalSpinner";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const RespondentsModal = ({ selectedItem, executeDelete }) => {
  const [respondents, setRespondents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // VIEW SUBMISSION MODAL STATES
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [isUnsubmitMode, setIsUnsubmitMode] = useState(false);

  // TABLE CONTROLS STATE (SEARCH ONLY)
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
        `${import.meta.env.VITE_API_BASE_URL}/classworks/${selectedItem.id}/submissions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      setRespondents(res.data);
    } catch (error) {
      console.error("Failed to fetch respondents", error);
    } finally {
      setIsLoading(false);
    }
  };

  // SAFE MODAL TRANSITION HELPER
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

  // VIEW SUBMISSION & GRADING LOGIC
  const openViewSubmission = (student) => {
    setSelectedStudent(student);
    setGradeInput(
      student.submission?.grade !== null &&
        student.submission?.grade !== undefined
        ? student.submission.grade
        : "",
    );
    setFeedbackText(student.submission?.teacher_feedback || "");
    setIsUnsubmitMode(false);
    switchModal("respondentsModal", "viewSubmissionModal");
  };

  const closeViewSubmission = () => {
    switchModal("viewSubmissionModal", "respondentsModal");
  };

  const hasExistingGrade =
    selectedStudent?.submission?.grade !== null &&
    selectedStudent?.submission?.grade !== undefined;

  const promptGradeUpdateConfirm = () => {
    if (gradeInput === "" || gradeInput === null) return;
    if (
      selectedItem?.points &&
      parseFloat(gradeInput) > parseFloat(selectedItem.points)
    ) {
      sileo.error({
        title: "Invalid Grade",
        description: `Grade cannot exceed the maximum points (${selectedItem.points}).`,
        ...darkToast,
      });
      return;
    }
    if (parseFloat(gradeInput) < 0) {
      sileo.error({
        title: "Invalid Grade",
        description: "Grade cannot be negative.",
        ...darkToast,
      });
      return;
    }
    switchModal("viewSubmissionModal", "confirmGradeUpdateModal");
  };

  const executeGrade = async () => {
    if (gradeInput === "" || gradeInput === null) return;
    if (
      selectedItem?.points &&
      parseFloat(gradeInput) > parseFloat(selectedItem.points)
    ) {
      sileo.error({
        title: "Invalid Grade",
        description: `Grade cannot exceed maximum points.`,
        ...darkToast,
      });
      return;
    }

    const modalToHide = hasExistingGrade
      ? "confirmGradeUpdateModal"
      : "viewSubmissionModal";
    const hideEl = document.getElementById(modalToHide);
    if (hideEl) {
      const m = Modal.getInstance(hideEl);
      if (m) m.hide();
    }

    setTimeout(async () => {
      setIsProcessing(true);
      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/classworks/${selectedItem.id}/submissions/${selectedStudent.id}/grade`,
          { grade: gradeInput },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
            },
          },
        );
        sileo.success({
          title: "Success",
          description: "Grade saved successfully.",
          ...darkToast,
        });
        await fetchRespondents();

        setSelectedStudent((prev) => ({
          ...prev,
          submission: {
            ...prev.submission,
            grade: gradeInput,
            status: "graded",
          },
        }));
      } catch (error) {
        sileo.error({
          title: "Failed",
          description: "Failed to save grade.",
          ...darkToast,
        });
      } finally {
        setIsProcessing(false);
        const respEl = document.getElementById("respondentsModal");
        if (respEl) Modal.getOrCreateInstance(respEl).show();
      }
    }, 400);
  };

  // RETURNING / UNSUBMIT LOGIC
  const promptUnsubmit = () => {
    switchModal("viewSubmissionModal", "confirmReturnModal");
  };

  const proceedToFeedback = () => {
    setIsUnsubmitMode(true);
    switchModal("confirmReturnModal", "viewSubmissionModal");
  };

  const executeReturn = async () => {
    if (!feedbackText.trim()) {
      sileo.error({
        title: "Required",
        description: "Feedback is required.",
        ...darkToast,
      });
      return;
    }

    const hideEl = document.getElementById("viewSubmissionModal");
    if (hideEl) {
      const m = Modal.getInstance(hideEl);
      if (m) m.hide();
    }

    setTimeout(async () => {
      setIsProcessing(true);

      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/classworks/${selectedItem.id}/submissions/${selectedStudent.id}/return`,
          { feedback: feedbackText },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
            },
          },
        );
        sileo.success({
          title: "Returned",
          description: "Submission returned to student.",
          ...darkToast,
        });
        await fetchRespondents();
      } catch (error) {
        sileo.error({
          title: "Failed",
          description: "Failed to return submission.",
          ...darkToast,
        });
      } finally {
        setIsProcessing(false);
        const respEl = document.getElementById("respondentsModal");
        if (respEl) Modal.getOrCreateInstance(respEl).show();
      }
    }, 400);
  };

  // HELPER FOR FILE SIZES
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

  const filteredRespondents = respondents.filter((s) => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    const lrn = s.lrn ? s.lrn.toLowerCase() : "";
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || lrn.includes(search);
  });

  return (
    <>
      <GlobalSpinner isLoading={isProcessing} text="Processing Request..." />

      {/* MAIN RESPONDENTS MODAL */}
      <div
        className="modal fade"
        id="respondentsModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-light">
            {/* HEADER */}
            <div
              className="modal-header border-bottom py-3 d-flex flex-row align-items-center justify-content-between"
              style={{ backgroundColor: "var(--accent-color)" }}
            >
              <div className="d-flex align-items-center flex-wrap gap-2">
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
              </div>
              <button
                type="button"
                className="btn-close shadow-none m-0"
                onClick={closeAllModals}
              ></button>
            </div>

            {/* EXACT SEARCH BAR DESIGN FROM PROMPT */}
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

            {/* MAIN TABLE WRAPPER */}
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
                            <div
                              className="spinner-border spinner-border-sm me-2 text-primary"
                              role="status"
                            ></div>
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
                          const isReturned =
                            sub?.status === "returned" ||
                            (sub?.status === "pending" &&
                              sub?.teacher_feedback);

                          return (
                            <tr key={student.id}>
                              <td className="px-4 text-muted fw-medium text-center">
                                {index + 1}
                              </td>

                              {/* 1. STUDENT DETAILS */}
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div
                                    className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold flex-shrink-0 shadow-sm"
                                    style={{
                                      width: "38px",
                                      height: "38px",
                                      fontSize: "0.9rem",
                                      backgroundColor: "var(--secondary-color)",
                                    }}
                                  >
                                    {student.first_name.charAt(0)}
                                  </div>
                                  <div>
                                    <span
                                      className="d-block fw-bold text-dark lh-sm"
                                      style={{ fontSize: "0.9rem" }}
                                    >
                                      {student.last_name}, {student.first_name}
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

                              {/* 2. STATUS */}
                              <td className="text-center">
                                {sub ? (
                                  isReturned ? (
                                    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger rounded-3 px-2 py-1">
                                      Returned
                                    </span>
                                  ) : sub.status === "late_submission" ? (
                                    <span className="badge bg-warning bg-opacity-10 text-warning border border-warning rounded-3 px-2 py-1">
                                      Done Late
                                    </span>
                                  ) : sub.status === "graded" ? (
                                    <span className="badge bg-success bg-opacity-10 text-success border border-success rounded-3 px-2 py-1">
                                      Graded
                                    </span>
                                  ) : (
                                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-3 px-2 py-1">
                                      Turned In
                                    </span>
                                  )
                                ) : (
                                  <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary rounded-3 px-2 py-1">
                                    Pending
                                  </span>
                                )}
                              </td>

                              {/* 3. DATE & TIME */}
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

                              {/* 4. GRADE */}
                              <td className="text-center fw-bolder fs-6">
                                {sub?.grade !== null &&
                                sub?.grade !== undefined ? (
                                  <span
                                    className={
                                      sub.grade <
                                      (selectedItem?.points / 2 || 0)
                                        ? "text-danger"
                                        : "text-success"
                                    }
                                  >
                                    {sub.grade}
                                  </span>
                                ) : (
                                  <span className="text-muted small">-</span>
                                )}
                              </td>

                              {/* 5. ACTION (VIEW SUBMISSION) */}
                              <td className="pe-4 text-center">
                                {sub ? (
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

            {/* MODAL FOOTER */}
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

      {/* VIEW SUBMISSION MODAL (NANDITO NA ANG FILES, GRADE, AT UNSUBMIT LOGIC) */}
      <div
        className="modal fade"
        id="viewSubmissionModal"
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
              {/* STUDENT INFO HEADER */}
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
                    {selectedStudent?.first_name?.charAt(0)}
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-0">
                      {selectedStudent?.first_name} {selectedStudent?.last_name}
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

              {/* ATTACHED FILES (VERTICAL STACK LIST) */}
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
                              title={file.name}
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

              {/* DYNAMIC ACTION SECTION (GRADING VS UNSUBMITTING) */}
              <div
                className="p-4 rounded-4 shadow-sm"
                style={{
                  backgroundColor: isUnsubmitMode
                    ? "rgba(220, 53, 69, 0.05)"
                    : "var(--accent-color)",
                  border: isUnsubmitMode
                    ? "1px solid rgba(220, 53, 69, 0.2)"
                    : "1px solid rgba(98, 111, 71, 0.2)",
                }}
              >
                {!isUnsubmitMode ? (
                  // GRADING VIEW
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div>
                      <label className="form-label small fw-bold text-dark mb-2">
                        <i className="bi bi-award-fill text-warning me-1"></i>{" "}
                        Assignment Grade
                      </label>
                      <div
                        className="input-group shadow-sm rounded-3 overflow-hidden border bg-white"
                        style={{ width: "220px" }}
                      >
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max={selectedItem?.points || ""}
                          className="form-control border-0 text-center fw-bold text-primary py-2"
                          value={gradeInput}
                          onChange={(e) => setGradeInput(e.target.value)}
                          placeholder="0.00"
                        />
                        <span className="input-group-text bg-light border-0 text-muted small fw-medium">
                          / {selectedItem?.points || "-"}
                        </span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
                      {/* HIDE UNSUBMIT KUNG RETURNED NA O KUNG FORM ANG CLASSWORK */}
                      {selectedStudent?.submission?.status !== "returned" &&
                        !selectedItem?.form_id && (
                          <button
                            className="btn btn-outline-danger rounded-3 fw-bold shadow-sm px-4 py-2"
                            onClick={promptUnsubmit}
                          >
                            <i className="bi bi-arrow-return-left me-1"></i>{" "}
                            Unsubmit
                          </button>
                        )}
                      <button
                        className="btn btn-campusloop rounded-3 fw-bold shadow-sm px-4 py-2"
                        onClick={
                          hasExistingGrade
                            ? promptGradeUpdateConfirm
                            : executeGrade
                        }
                      >
                        <i className="bi bi-check-circle-fill me-1"></i>{" "}
                        {hasExistingGrade ? "Save Changes" : "Submit"}
                      </button>
                    </div>
                  </div>
                ) : (
                  // UNSUBMIT VIEW
                  <div className="animate__animated animate__fadeIn">
                    <h6 className="fw-bold text-danger mb-2">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>{" "}
                      Unsubmit Student Work
                    </h6>
                    <p className="small text-dark mb-3">
                      Please provide a reason or feedback for unsubmitting this
                      work. The student will be required to resubmit.
                    </p>
                    <textarea
                      className="form-control mb-3 shadow-sm border-danger-subtle rounded-3 p-3"
                      rows="3"
                      placeholder="e.g. Missing requirements, corrupted file, etc..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      style={{ resize: "vertical", fontSize: "0.95rem" }}
                    ></textarea>
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        className="btn btn-light border px-4 rounded-3 fw-medium shadow-sm"
                        onClick={() => setIsUnsubmitMode(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-danger px-4 rounded-3 fw-bold shadow-sm"
                        onClick={executeReturn}
                      >
                        Unsubmit
                      </button>
                    </div>
                  </div>
                )}
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

      {/* CONFIRM GRADE UPDATE MODAL */}
      <div
        className="modal fade"
        id="confirmGradeUpdateModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-0 pb-0 justify-content-center mt-4">
              <div
                className="rounded-circle d-flex justify-content-center align-items-center"
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "rgba(98, 111, 71, 0.1)",
                }}
              >
                <i
                  className="bi bi-pencil-square"
                  style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark">Update Existing Grade?</h4>
              <p className="text-muted mb-0">
                Are you sure you want to change the grade of{" "}
                <b>
                  {selectedStudent?.first_name} {selectedStudent?.last_name}
                </b>{" "}
                to <b className="text-primary">{gradeInput}</b>?
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light border px-4 fw-medium rounded-3"
                onClick={() =>
                  switchModal("confirmGradeUpdateModal", "viewSubmissionModal")
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-campusloop px-4 fw-bold shadow-sm rounded-3"
                onClick={executeGrade}
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRM RETURN MODAL */}
      <div
        className="modal fade"
        id="confirmReturnModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-0 pb-0 justify-content-center mt-4">
              <div
                className="rounded-circle bg-danger bg-opacity-10 d-flex justify-content-center align-items-center"
                style={{ width: "80px", height: "80px" }}
              >
                <i
                  className="bi bi-question-circle-fill text-danger"
                  style={{ fontSize: "3rem" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark">Unsubmit Work?</h4>
              <p className="text-muted mb-0">
                Are you sure you want to unsubmit the work of{" "}
                <b>
                  {selectedStudent?.first_name} {selectedStudent?.last_name}
                </b>
                ?
                <br />
                You will be asked to provide feedback on the next step.
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light border px-4 fw-medium rounded-3"
                onClick={() =>
                  switchModal("confirmReturnModal", "viewSubmissionModal")
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger px-4 fw-bold shadow-sm rounded-3"
                onClick={proceedToFeedback}
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <div
        className="modal fade"
        id="deleteConfirmModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-0 pb-0 justify-content-center mt-4">
              <div
                className="rounded-circle bg-danger bg-opacity-10 d-flex justify-content-center align-items-center"
                style={{ width: "80px", height: "80px" }}
              >
                <i
                  className="bi bi-exclamation-triangle-fill text-danger"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark">Confirm Deletion</h4>
              <p className="text-muted mb-0">
                Are you sure you want to move <b>{selectedItem?.title}</b> to
                the Recycle Bin? This action can be undone later.
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light border px-4 fw-medium rounded-3"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger px-4 fw-bold shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={executeDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RespondentsModal;
