import React, { useRef } from "react";
import { sileo } from "sileo";
import { Modal } from "bootstrap";

const AnnouncementFormModal = ({
  modalMode,
  formData,
  handleInputChange,
  includeLink,
  setIncludeLink,
  includeFiles,
  setIncludeFiles,
  newFiles,
  setNewFiles,
  existingFiles,
  setExistingFiles,
  setDeletedFileIds,
  triggerSaveConfirmation,
  executeSubmit,
  proceedToUpdateForm,
  executeDelete,
  selectedItem,
  selectedIds,
}) => {
  const fileInputRef = useRef(null);

  const formatSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
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

  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e) => {
    e.preventDefault();
    validateAndAddFiles(Array.from(e.dataTransfer.files));
  };
  const onFileInputChange = (e) => {
    validateAndAddFiles(Array.from(e.target.files));
  };

  const validateAndAddFiles = (files) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/gif",
      "video/mp4",
      "video/avi",
      "video/quicktime",
    ];
    const maxSizeBytes = 20 * 1024 * 1024;

    const validFiles = files.filter((f) => {
      if (
        !allowedTypes.includes(f.type) &&
        !f.name.match(/\.(pdf|jpg|jpeg|gif|mp4|avi|mov)$/i)
      ) {
        sileo.error({
          title: "Invalid File Format",
          description: `${f.name} is not allowed. Only PDF, Images (JPG/GIF), and specific videos are accepted.`,
        });
        return false;
      }
      if (f.size > maxSizeBytes) {
        sileo.error({
          title: "File too large",
          description: `${f.name} exceeds 20MB limit.`,
        });
        return false;
      }
      return true;
    });

    setNewFiles((prev) => [...prev, ...validFiles]);
  };

  const removeNewFile = (index) =>
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  const removeExistingFile = (file) => {
    setExistingFiles((prev) => prev.filter((f) => f.id !== file.id));
    setDeletedFileIds((prev) => [...prev, file.id]);
  };

  return (
    <>
      <div
        className="modal fade"
        id="announcementFormModal"
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
                {modalMode === "create" ? (
                  <>
                    <i className="bi bi-megaphone-fill me-2"></i> Create New
                    Announcement
                  </>
                ) : (
                  <>
                    <i className="bi bi-pencil-square me-2"></i> Update
                    Announcement
                  </>
                )}
              </h5>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body p-4 bg-white">
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-card-heading me-1 text-muted"></i>{" "}
                  Announcement Title
                </label>
                <input
                  type="text"
                  className="form-control bg-light toolbar-input"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  autoFocus
                  placeholder="e.g. No Classes Tomorrow"
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-body-text me-1 text-muted"></i> Content
                </label>
                <textarea
                  className="form-control bg-light toolbar-input custom-scrollbar"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  placeholder="Enter full details here..."
                ></textarea>
              </div>

              <div className="row mb-4">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-calendar-check me-1 text-muted"></i>{" "}
                    Publish From
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control bg-light toolbar-input"
                    name="publish_from"
                    value={formData.publish_from}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-calendar-x me-1 text-muted"></i> Valid
                    Until
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control bg-light toolbar-input"
                    name="valid_until"
                    value={formData.valid_until}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-dark d-block text-center">
                  <i className="bi bi-paperclip me-1 text-muted"></i> Attachment
                  Options
                </label>
                <div
                  className="d-flex justify-content-center gap-4 p-3 rounded-3"
                  style={{ backgroundColor: "var(--accent-color)" }}
                >
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="checkLink"
                      checked={includeLink}
                      onChange={(e) => setIncludeLink(e.target.checked)}
                    />
                    <label
                      className="form-check-label small fw-bold text-dark"
                      htmlFor="checkLink"
                    >
                      Include a Link
                    </label>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="checkFiles"
                      checked={includeFiles}
                      onChange={(e) => setIncludeFiles(e.target.checked)}
                    />
                    <label
                      className="form-check-label small fw-bold text-dark"
                      htmlFor="checkFiles"
                    >
                      Attach Files
                    </label>
                  </div>
                </div>
              </div>

              {includeLink && (
                <div className="mb-4">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-link-45deg me-1 text-muted"></i> URL
                    Link
                  </label>
                  <input
                    type="url"
                    className="form-control bg-light toolbar-input"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    required
                    placeholder="https://example.com"
                  />
                </div>
              )}

              {includeFiles && (
                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark d-block text-center">
                    <i className="bi bi-file-earmark-arrow-up me-1 text-muted"></i>{" "}
                    Upload Files
                  </label>
                  <div
                    className="p-5 text-center mb-4 rounded-4"
                    style={{
                      border: "2px dashed #A4B465",
                      backgroundColor: "#f8f9fc",
                      cursor: "pointer",
                      transition: "0.3s",
                    }}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <i
                      className="bi bi-cloud-arrow-up-fill mb-2 d-block"
                      style={{ fontSize: "3rem", color: "#626F47" }}
                    ></i>
                    <p
                      className="text-muted mb-3"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Accepted formats: PDF, JPG, JPEG, GIF, MP4, AVI, MOV{" "}
                      <br /> Max file size: 20MB
                    </p>
                    <p className="fw-medium text-dark mb-1">
                      Drag & Drop your files here
                    </p>
                    <p className="small text-muted mb-3">OR</p>
                    <button
                      type="button"
                      className="btn text-white rounded-3 px-4 shadow-sm"
                      style={{ backgroundColor: "#626F47" }}
                    >
                      Browse Files
                    </button>
                    <input
                      type="file"
                      className="d-none"
                      ref={fileInputRef}
                      multiple
                      accept=".pdf,.jpg,.jpeg,.gif,.mp4,.avi,.mov"
                      onChange={onFileInputChange}
                    />
                  </div>
                  {((existingFiles && existingFiles.length > 0) ||
                    newFiles.length > 0) && (
                    <div>
                      <span className="small text-muted mb-2 d-block">
                        Attached Files:
                      </span>
                      <div
                        className="d-flex flex-column gap-2 custom-scrollbar"
                        style={{ maxHeight: "250px", overflowY: "auto" }}
                      >
                        {existingFiles.map((file) => {
                          const style = getFileIcon(file.file_extension);
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
                                    {formatSize(file.file_size)} • {style.label}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-light rounded-circle text-muted"
                                onClick={() => removeExistingFile(file)}
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </div>
                          );
                        })}
                        {newFiles.map((file, index) => {
                          const ext = file.name.split(".").pop();
                          const style = getFileIcon(ext);
                          return (
                            <div
                              key={index}
                              className="d-flex align-items-center justify-content-between p-3 bg-white border rounded-4 shadow-sm transition-all hover-shadow"
                              style={{
                                borderLeft: `4px solid ${style.color} !important`,
                              }}
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
                                    {formatSize(file.size)} • {style.label}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-light rounded-circle text-muted"
                                onClick={() => removeNewFile(index)}
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
                onClick={triggerSaveConfirmation}
              >
                {modalMode === "create" ? (
                  <>
                    <i className="bi bi-send-check-fill me-2"></i> Post
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle-fill me-2"></i> Save
                    Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="createConfirmModal"
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
                  className="bi bi-send-check-fill"
                  style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark">Post Announcement</h4>
              <p className="text-muted mb-0">
                Are you sure you want to schedule this to the global feed?
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
                onClick={() => {
                  const m = new Modal(
                    document.getElementById("announcementFormModal"),
                  );
                  m.show();
                }}
              >
                Go Back
              </button>
              <button
                type="button"
                className="btn btn-campusloop px-4 fw-medium shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={executeSubmit}
              >
                Yes, Publish
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="updatePreConfirmModal"
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
              <h4 className="fw-bold text-dark">Edit Announcement</h4>
              <p className="text-muted mb-0">
                Proceed to edit <b>{selectedItem?.title}</b>?
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
                className="btn btn-campusloop px-4 fw-medium shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={proceedToUpdateForm}
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="saveConfirmModal"
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
                  className="bi bi-cloud-arrow-up-fill"
                  style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark">Save Changes</h4>
              <p className="text-muted mb-0">
                Apply these updates to the global feed?
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
                onClick={() => {
                  const m = new Modal(
                    document.getElementById("announcementFormModal"),
                  );
                  m.show();
                }}
              >
                Go Back
              </button>
              <button
                type="button"
                className="btn btn-campusloop px-4 fw-medium shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={executeSubmit}
              >
                Yes, Update
              </button>
            </div>
          </div>
        </div>
      </div>

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
              <h4 className="fw-bold text-dark">Delete Announcement</h4>
              <p className="text-muted mb-0">
                Are you sure you want to move{" "}
                {selectedItem ? (
                  <b>"{selectedItem.title}"</b>
                ) : (
                  <b>
                    {selectedIds.length} selected announcement
                    {selectedIds.length > 1 ? "s" : ""}
                  </b>
                )}{" "}
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

export default AnnouncementFormModal;
