import React from "react";

const AdminELibraryModals = ({
  viewItem,
  selectedCount,
  executeApprove,
  proceedToFeedback,
  executeDecline,
  executeDelete,
  declineFeedback,
  setDeclineFeedback,
}) => {
  const handleViewDocument = (filePath) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
    window.open(`${baseUrl}/storage/${filePath}`, "_blank");
  };

  const formatBytes = (bytes) => {
    if (bytes === 0 || !bytes) return "Unknown Size";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      <div
        className="modal fade"
        id="viewELibraryModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div
              className="modal-header border-bottom pb-3"
              style={{ backgroundColor: "var(--accent-color)" }}
            >
              <h5
                className="modal-title fw-bold"
                style={{ color: "var(--primary-color)" }}
              >
                <i className="bi bi-folder2-open me-2"></i> Resource Content
              </h5>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body p-4 p-md-5 bg-white">
              {viewItem && (
                <>
                  <div className="mb-4">
                    <span className="badge bg-light text-dark border shadow-sm mb-2 px-2 py-1">
                      <i className="bi bi-info-circle-fill text-primary me-1"></i>{" "}
                      Resource Info
                    </span>
                    <h4 className="fw-bolder text-dark mb-2">
                      {viewItem.title}
                    </h4>
                    <p
                      className="text-muted small mb-0"
                      style={{ lineHeight: "1.6", whiteSpace: "pre-wrap" }}
                    >
                      {viewItem.description}
                    </p>
                  </div>

                  <span
                    className="small text-muted fw-bold mb-3 d-block text-uppercase"
                    style={{ letterSpacing: "1px" }}
                  >
                    <i className="bi bi-paperclip me-1"></i> Attached Documents
                  </span>

                  <div
                    className="d-flex flex-column gap-3 custom-scrollbar"
                    style={{
                      maxHeight: "300px",
                      overflowY: "auto",
                      paddingRight: "5px",
                    }}
                  >
                    {viewItem.files && viewItem.files.length > 0 ? (
                      viewItem.files.map((file) => (
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
                                backgroundColor: "#f8d7da",
                                color: "#dc3545",
                              }}
                            >
                              <i className="bi bi-file-earmark-pdf-fill fs-4"></i>
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
                                {file.file_extension}
                              </p>
                            </div>
                          </div>
                          <button
                            className="btn btn-sm btn-campusloop ms-3 rounded-3 shadow-sm d-flex justify-content-center align-items-center flex-shrink-0"
                            onClick={() => handleViewDocument(file.path)}
                          >
                            <i className="bi bi-box-arrow-up-right"></i>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4 bg-light rounded-4 border border-dashed">
                        <i className="bi bi-folder-x fs-1 text-muted opacity-50 mb-2 d-block"></i>
                        <p className="text-muted mb-0 small fw-medium">
                          No files attached to this resource.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer border-top bg-light p-3">
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

      <div
        className="modal fade"
        id="confirmApproveModal"
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
              <h4 className="fw-bold text-dark mt-2">Approve Materials</h4>
              <p className="text-muted mb-0">
                Are you sure you want to approve{" "}
                <b>{selectedCount} selected material(s)</b>? They will become
                visible to all students.
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success px-4 fw-medium shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={executeApprove}
              >
                Yes, Approve
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="confirmDeclineModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-0 pb-0 justify-content-center mt-4">
              <div
                className="rounded-circle bg-warning bg-opacity-10 d-flex justify-content-center align-items-center"
                style={{ width: "80px", height: "80px" }}
              >
                <i
                  className="bi bi-exclamation-circle-fill text-warning"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark mt-2">Decline Materials</h4>
              <p className="text-muted mb-0">
                Are you sure you want to decline{" "}
                <b>{selectedCount} selected material(s)</b>?
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-warning text-dark px-4 fw-medium shadow-sm rounded-3"
                onClick={proceedToFeedback}
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="feedbackDeclineModal"
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
                <i className="bi bi-chat-left-dots-fill me-2"></i> Decline
                Feedback
              </h5>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <form onSubmit={executeDecline}>
              <div className="modal-body p-4 bg-white">
                <label className="form-label small fw-bold text-dark">
                  Reason for Declining <span className="text-danger">*</span>
                </label>
                <p className="small text-muted mb-2">
                  Please explain why the selected materials are being declined.
                  This will be sent back to the creator for revision.
                </p>
                <textarea
                  className="form-control bg-light toolbar-input custom-scrollbar"
                  rows="4"
                  required
                  autoFocus
                  placeholder="e.g. Please revise the contents to align with the curriculum..."
                  value={declineFeedback}
                  onChange={(e) => setDeclineFeedback(e.target.value)}
                ></textarea>
              </div>
              <div className="modal-footer border-top bg-light p-3 d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-light border px-4 fw-medium rounded-3"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-campusloop px-4 fw-bold shadow-sm rounded-3"
                >
                  <i className="bi bi-plus-circle-fill me-2"></i>
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="confirmDeleteModal"
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
              <h4 className="fw-bold text-dark mt-2">Delete Materials</h4>
              <p className="text-muted mb-0">
                Are you sure you want to move{" "}
                <b>{selectedCount} selected material(s)</b>
                to the Recycle Bin?
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger px-4 fw-medium shadow-sm rounded-3"
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

export default AdminELibraryModals;
