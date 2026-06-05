import React from "react";
import { Modal } from "bootstrap";

const StudentWorkModal = ({
  selectedItemForWork,
  workFiles,
  workFileInputRef,
  onWorkDragOver,
  onWorkDrop,
  onWorkFileInputChange,
  removeWorkFile,
  submitStudentWork,
  executeUnsubmit,
  formatBytes,
  getFileDetails,
  openAddWorkModal,
}) => {
  return (
    <>
      <div
        className="modal fade"
        id="addWorkModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div
              className="modal-header border-bottom pb-3"
              style={{ backgroundColor: "var(--accent-color)" }}
            >
              <h5
                className="modal-title fw-bold"
                style={{ color: "var(--primary-color)" }}
              >
                <i className="bi bi-cloud-upload-fill me-2"></i>{" "}
                {selectedItemForWork?.student_status === "returned"
                  ? "Re-submit Work"
                  : "Add Work"}
              </h5>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body p-4 bg-white">
              <p className="text-muted small mb-3">
                Attach your files for <b>{selectedItemForWork?.title}</b>.
              </p>

              <div
                className="p-4 text-center mb-4 rounded-4"
                style={{
                  border: "2px dashed #A4B465",
                  backgroundColor: "#f8f9fc",
                  cursor: "pointer",
                  transition: "0.3s",
                }}
                onDragOver={onWorkDragOver}
                onDrop={onWorkDrop}
                onClick={() => workFileInputRef.current.click()}
              >
                <i
                  className="bi bi-cloud-arrow-up-fill mb-2 d-block"
                  style={{ fontSize: "2.5rem", color: "#626F47" }}
                ></i>
                <p className="text-muted mb-2" style={{ fontSize: "0.75rem" }}>
                  Accepted formats: PDF, DOC, EXCEL, PPT, IMG, VIDEO <br />
                  Max file size: 50MB
                </p>
                <p className="fw-medium text-dark mb-0">
                  Drag & Drop or Click to Browse
                </p>
                <input
                  type="file"
                  className="d-none"
                  ref={workFileInputRef}
                  multiple
                  onChange={onWorkFileInputChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.mp4,.avi,.mov"
                />
              </div>

              {workFiles.length > 0 && (
                <div>
                  <span className="small text-muted mb-2 d-block">
                    Files to Turn In:
                  </span>
                  <div
                    className="d-flex flex-column gap-2 custom-scrollbar"
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                  >
                    {workFiles.map((file, index) => {
                      const ext = file.name.split(".").pop();
                      const style = getFileDetails(ext);
                      return (
                        <div
                          key={index}
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
                              <i className={`bi ${style.icon} fs-5`}></i>
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
                                {formatBytes(file.size)} •{" "}
                                {style.label || "FILE"}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-light rounded-circle text-muted"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeWorkFile(index);
                            }}
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer border-top bg-light p-3 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light border px-4 fw-medium rounded-3"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-campusloop px-4 fw-bold rounded-3"
                onClick={submitStudentWork}
                disabled={workFiles.length === 0}
              >
                <i className="bi bi-send-check-fill me-2"></i>{" "}
                {selectedItemForWork?.student_status === "returned"
                  ? "Turn In Again"
                  : "Turn In"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="markDoneModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-0 pb-0 justify-content-center mt-4">
              <div
                className="rounded-circle bg-success bg-opacity-10 d-flex justify-content-center align-items-center"
                style={{ width: "80px", height: "80px" }}
              >
                <i
                  className="bi bi-check-circle-fill text-success"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark">
                {selectedItemForWork?.student_status === "returned"
                  ? "Mark as Re-submitted"
                  : "Mark as Done"}
              </h4>
              <p className="text-muted mb-0">
                You haven't attached any work for{" "}
                <b>{selectedItemForWork?.title}</b>. Are you sure you want to
                mark this as{" "}
                {selectedItemForWork?.student_status === "returned"
                  ? "re-submitted"
                  : "done"}
                ?
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
                className="btn btn-success px-4 fw-medium rounded-3"
                onClick={submitStudentWork}
              >
                Yes, Mark as{" "}
                {selectedItemForWork?.student_status === "returned"
                  ? "Re-submitted"
                  : "Done"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="unsubmitConfirmModal"
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
              <h4 className="fw-bold text-dark">Unsubmit Work</h4>
              <p className="text-muted mb-0">
                Are you sure you want to unsubmit your work for{" "}
                <b>{selectedItemForWork?.title}</b>? Any attached files will be
                removed.
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
                className="btn btn-danger px-4 fw-medium rounded-3"
                onClick={executeUnsubmit}
              >
                Yes, Unsubmit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="viewSubmissionModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div
              className="modal-header border-bottom pb-3"
              style={{ backgroundColor: "var(--accent-color)" }}
            >
              <h5
                className="modal-title fw-bold"
                style={{ color: "var(--primary-color)" }}
              >
                <i className="bi bi-folder-check me-2"></i> Your Submission
              </h5>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body p-4 bg-white">
              {selectedItemForWork?.student_status === "returned" && (
                <div className="card-body p-4 bg-danger bg-opacity-10 border rounded-4 border-danger-subtle mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <h6 className="fw-bold text-danger mb-2">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>{" "}
                        Teacher's Feedback
                      </h6>
                    </div>
                  </div>
                  <div
                    className="bg-white p-3 rounded-3 border border-danger border-opacity-25 text-dark mb-0 custom-scrollbar shadow-sm"
                    style={{
                      fontSize: "0.95rem",
                      lineHeight: "1.6",
                      maxHeight: "150px",
                      overflowY: "auto",
                    }}
                  >
                    {selectedItemForWork.student_submission?.teacher_feedback}
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                <div>
                  <h6 className="fw-bold text-dark mb-1">
                    {selectedItemForWork?.title}
                  </h6>
                  <span className="text-muted small">
                    <i className="bi bi-calendar-check me-1"></i>
                    Submitted on:{" "}
                    {selectedItemForWork?.student_submission?.submitted_at
                      ? new Date(
                          selectedItemForWork.student_submission.submitted_at,
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
                <div className="text-end">
                  {selectedItemForWork?.student_status === "graded" ? (
                    <span className="badge bg-success px-3 py-2 fw-medium shadow-sm">
                      Grade: {selectedItemForWork.student_submission?.grade} /{" "}
                      {selectedItemForWork.points}
                    </span>
                  ) : selectedItemForWork?.student_status === "returned" ? (
                    <span className="badge bg-danger bg-opacity-10 text-danger fw-medium border border-danger px-2 py-1 shadow-sm">
                      Returned
                    </span>
                  ) : (
                    <span className="badge bg-secondary bg-opacity-10 text-secondary fw-medium border border-secondary px-2 py-1 shadow-sm">
                      Pending Grade
                    </span>
                  )}
                </div>
              </div>

              <span className="small text-muted mb-2 d-block">
                Attached Files:
              </span>

              {selectedItemForWork?.student_submission?.files &&
              selectedItemForWork.student_submission.files.length > 0 ? (
                <div
                  className="d-flex flex-column gap-2 custom-scrollbar"
                  style={{ maxHeight: "250px", overflowY: "auto" }}
                >
                  {selectedItemForWork.student_submission.files.map((file) => {
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
                            <i className={`bi ${style.icon} fs-5`}></i>
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
                              {formatBytes(file.file_size)} •{" "}
                              {style.label || "FILE"}
                            </p>
                          </div>
                        </div>
                        <a
                          href={`${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${file.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-campusloop rounded-3 shadow-sm flex-shrink-0 ms-3 d-flex justify-content-center align-items-center"
                          style={{ width: "35px", height: "35px" }}
                        >
                          <i className="bi bi-eye-fill"></i>
                        </a>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-4 bg-light rounded-4 border border-light-subtle">
                  <p className="text-muted small mb-0 fw-medium">
                    No files attached to this submission.
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer border-top bg-light p-3 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light border px-4 fw-medium rounded-3"
                data-bs-dismiss="modal"
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

export default StudentWorkModal;
