import React, { useState, useEffect } from "react";

const StudentELibraryModal = ({ viewingItem }) => {
  const formatBytes = (bytes) => {
    if (bytes === 0 || !bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsExpanded(false);
  }, [viewingItem]);

  const getFileDetails = (extension) => {
    const ext = extension?.toLowerCase();
    if (["pdf"].includes(ext))
      return {
        icon: "bi-file-earmark-pdf-fill",
        color: "#dc3545",
        bg: "#f8d7da",
      };
    return { icon: "bi-file-earmark-fill", color: "#6c757d", bg: "#e2e3e5" };
  };

  const handleViewDocument = (filePath) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
    window.open(`${baseUrl}/storage/${filePath}`, "_blank");
  };

  const rawDescription = viewingItem?.description || "";
  const descriptionLimit = 250;
  const shouldTruncate = rawDescription.length > descriptionLimit;
  const displayDescription =
    isExpanded || !shouldTruncate
      ? rawDescription
      : rawDescription.substring(0, descriptionLimit) + "...";

  return (
    <div
      className="modal fade"
      id="viewContentModal"
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
            {viewingItem ? (
              <>
                <div className="mb-4">
                  <span className="badge bg-light text-dark border shadow-sm mb-2 px-2 py-1">
                    <i className="bi bi-info-circle-fill text-primary me-1"></i>{" "}
                    Resource Info
                  </span>
                  <h4 className="fw-bolder text-dark mb-2">
                    {viewingItem.title}
                  </h4>
                  <p
                    className={`text-muted small ${shouldTruncate && !isExpanded ? "mb-1" : "mb-3"}`}
                    style={{ lineHeight: "1.6", whiteSpace: "pre-wrap" }}
                  >
                    {displayDescription}
                  </p>
                  {shouldTruncate && (
                    <button
                      className="btn btn-link p-0 text-decoration-none fw-bold shadow-none mb-3 d-block"
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--primary-color)",
                      }}
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      {isExpanded ? "See Less" : "See More"}
                    </button>
                  )}
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
                  {viewingItem.files && viewingItem.files.length > 0 ? (
                    viewingItem.files.map((file) => {
                      const details = getFileDetails(file.file_extension);
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
                                backgroundColor: details.bg,
                                color: details.color,
                              }}
                            >
                              <i className={`bi ${details.icon} fs-4`}></i>
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
                                {file.file_extension?.toUpperCase()}
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
                      );
                    })
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
            ) : (
              <div className="text-center py-5 text-muted">
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></div>
                Loading content...
              </div>
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
  );
};

export default StudentELibraryModal;
