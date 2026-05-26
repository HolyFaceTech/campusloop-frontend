import React from "react";

const StudentCalendarEventModal = ({ selectedEvent }) => {
  const formatDisplayDateTime = (dateObj) => {
    if (!dateObj) return "N/A";
    const options = {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateObj).toLocaleDateString("en-US", options);
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (extension) => {
    const ext = extension?.toLowerCase();
    if (["pdf"].includes(ext))
      return {
        icon: "bi-file-earmark-pdf-fill",
        color: "#dc3545",
        bg: "#f8d7da",
        label: "PDF",
      };
    if (["jpg", "jpeg", "gif"].includes(ext))
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

  // XSS PREVENTION
  const isSafeLink = (url) => {
    if (!url) return false;
    return (
      /^https?:\/\//i.test(url.trim()) || !/^javascript:/i.test(url.trim())
    );
  };

  const getSafeUrl = (url) => {
    if (!url) return "#";
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  return (
    <div
      className="modal fade"
      id="eventDetailsModal"
      tabIndex="-1"
      aria-hidden="true"
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
              <i className="bi bi-calendar2-week-fill me-2"></i> Schedule
              Details
            </h5>
            <button
              type="button"
              className="btn-close shadow-none"
              data-bs-dismiss="modal"
            ></button>
          </div>

          <div className="modal-body p-0 bg-white">
            {selectedEvent && (
              <div className="row g-0">
                <div className="col-md-7 p-4 border-end">
                  <div className="mb-3 d-flex align-items-center flex-wrap gap-2">
                    <span className="badge bg-secondary text-light fw-medium shadow-sm border rounded-3 px-3 py-2">
                      <i className="bi bi-megaphone me-1"></i>{" "}
                      {selectedEvent.type}
                    </span>
                    {selectedEvent.status === "Pending" && (
                      <span className="badge bg-warning bg-opacity-10 text-warning fw-medium rounded-3 px-3 py-2 border border-warning-subtle">
                        <i className="bi bi-hourglass-split"></i> Pending
                      </span>
                    )}
                    {selectedEvent.status === "Published" && (
                      <span className="badge bg-success bg-opacity-10 text-success fw-medium rounded-3 px-3 py-2 border border-success-subtle">
                        <i className="bi bi-check-circle-fill"></i> Published
                      </span>
                    )}
                    {selectedEvent.status === "Done" && (
                      <span className="badge bg-secondary bg-opacity-10 text-secondary fw-medium rounded-3 px-3 py-2 border border-secondary-subtle">
                        <i className="bi bi-dash-circle-fill"></i> Done
                      </span>
                    )}
                  </div>

                  <h4 className="fw-bold text-dark mb-4">
                    {selectedEvent.title}
                  </h4>

                  <div className="mb-4">
                    <label
                      className="text-muted small fw-bold mb-2 text-uppercase"
                      style={{ letterSpacing: "1px" }}
                    >
                      <i className="bi bi-text-paragraph me-1"></i> Full Content
                    </label>
                    <p
                      className="text-dark small lh-lg"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {selectedEvent.content}
                    </p>
                  </div>
                </div>

                <div className="col-md-5 p-4 bg-light">
                  <label
                    className="text-muted small fw-bold mb-2 text-uppercase"
                    style={{ letterSpacing: "1px" }}
                  >
                    <i className="bi bi-clock-history me-1"></i> Timeline
                  </label>
                  <div className="p-3 bg-white border rounded-4 shadow-sm mb-4">
                    <div className="d-flex align-items-start mb-3">
                      <div
                        className="rounded-circle bg-success bg-opacity-10 d-flex justify-content-center align-items-center me-3 mt-1 flex-shrink-0"
                        style={{ width: "32px", height: "32px" }}
                      >
                        <i className="bi bi-calendar-check text-success"></i>
                      </div>
                      <div>
                        <span className="d-block small text-muted fw-bold">
                          Publish From
                        </span>
                        <span className="d-block text-dark small fw-medium">
                          {formatDisplayDateTime(selectedEvent.start)}
                        </span>
                      </div>
                    </div>
                    <div className="d-flex align-items-start">
                      <div
                        className="rounded-circle bg-danger bg-opacity-10 d-flex justify-content-center align-items-center me-3 mt-1 flex-shrink-0"
                        style={{ width: "32px", height: "32px" }}
                      >
                        <i className="bi bi-calendar-x text-danger"></i>
                      </div>
                      <div>
                        <span className="d-block small text-muted fw-bold">
                          Valid Until
                        </span>
                        <span className="d-block text-dark small fw-medium">
                          {formatDisplayDateTime(selectedEvent.end)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <label
                    className="text-muted small fw-bold mb-2 text-uppercase"
                    style={{ letterSpacing: "1px" }}
                  >
                    <i className="bi bi-paperclip me-1"></i> Attachments
                  </label>

                  {selectedEvent.link && isSafeLink(selectedEvent.link) && (
                    <a
                      href={getSafeUrl(selectedEvent.link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-flex align-items-center p-3 bg-white border border-primary-subtle rounded-4 shadow-sm mb-2 text-decoration-none class-link-hover"
                    >
                      <div
                        className="rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                        style={{
                          width: "40px",
                          height: "40px",
                        }}
                      >
                        <i className="bi bi-link-45deg fs-5"></i>
                      </div>
                      <div className="overflow-hidden">
                        <span
                          className="d-block fw-bold text-dark text-truncate"
                          style={{ fontSize: "0.85rem" }}
                        >
                          Attached URL Link
                        </span>
                        <span
                          className="d-block text-muted text-truncate"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {selectedEvent.link}
                        </span>
                      </div>
                    </a>
                  )}

                  {selectedEvent.files && selectedEvent.files.length > 0 && (
                    <div
                      className="d-flex flex-column gap-2 custom-scrollbar"
                      style={{ maxHeight: "180px", overflowY: "auto" }}
                    >
                      {selectedEvent.files.map((file) => {
                        const style = getFileIcon(file.file_extension);
                        return (
                          <a
                            href={`${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${file.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={file.id}
                            className="d-flex align-items-center p-3 bg-white border rounded-4 shadow-sm text-decoration-none class-link-hover"
                          >
                            <div
                              className="rounded-3 d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                              style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: style.bg,
                                color: style.color,
                              }}
                            >
                              <i className={`bi ${style.icon} fs-5`}></i>
                            </div>
                            <div className="overflow-hidden">
                              <span
                                className="d-block fw-bold text-dark text-truncate"
                                style={{ fontSize: "0.85rem" }}
                              >
                                {file.name}
                              </span>
                              <span
                                className="d-block text-muted"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {formatSize(file.file_size)} • {style.label}
                              </span>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  )}

                  {(!selectedEvent.link || !isSafeLink(selectedEvent.link)) &&
                    (!selectedEvent.files ||
                      selectedEvent.files.length === 0) && (
                      <div className="p-3 text-center bg-white border rounded-4 shadow-sm">
                        <i className="bi bi-inbox fs-4 text-muted d-block mb-1 opacity-50"></i>
                        <span className="small text-muted">No attachments</span>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer border-top bg-light p-3 d-flex justify-content-end gap-2">
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

export default StudentCalendarEventModal;
