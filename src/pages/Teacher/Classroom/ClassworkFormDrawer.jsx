import React, { useState, useEffect, useRef } from "react";
import { Offcanvas } from "bootstrap";
import { sileo } from "sileo";
import axios from "axios";

const ClassworkFormDrawer = ({
  drawerMode,
  formData,
  handleInputChange,
  includeLink,
  setIncludeLink,
  includeFiles,
  setIncludeFiles,
  includeForm,
  setIncludeForm,
  newFiles,
  setNewFiles,
  existingFiles,
  setExistingFiles,
  setDeletedFileIds,
  triggerSaveConfirmation,
  executeSubmit,
  selectedItem,
  proceedToUpdateForm,
}) => {
  const [availableForms, setAvailableForms] = useState([]);
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
      };
    if (["doc", "docx"].includes(ext))
      return {
        icon: "bi-file-earmark-word-fill",
        color: "#0d6efd",
        bg: "#cfe2ff",
      };
    if (["xls", "xlsx", "csv"].includes(ext))
      return {
        icon: "bi-file-earmark-excel-fill",
        color: "#198754",
        bg: "#d1e7dd",
      };
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext))
      return {
        icon: "bi-file-earmark-image-fill",
        color: "#6f42c1",
        bg: "#e0cffc",
      };
    if (["mp4", "avi", "mov"].includes(ext))
      return {
        icon: "bi-file-earmark-play-fill",
        color: "#fd7e14",
        bg: "#ffe5d0",
      };
    return { icon: "bi-file-earmark-fill", color: "#6c757d", bg: "#e2e3e5" };
  };

  useEffect(() => {
    if (includeForm) {
      const fetchForms = async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/forms`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
              },
            },
          );
          setAvailableForms(res.data);
        } catch (error) {
          console.error("Failed to fetch forms", error);
        }
      };
      fetchForms();
    } else {
      handleInputChange({ target: { name: "form_id", value: "" } });
    }
  }, [includeForm]);

  useEffect(() => {
    if (!includeLink)
      handleInputChange({ target: { name: "link", value: "" } });
  }, [includeLink]);

  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e) => {
    e.preventDefault();
    validateAndAddFiles(Array.from(e.dataTransfer.files));
  };
  const onFileInputChange = (e) =>
    validateAndAddFiles(Array.from(e.target.files));

  const validateAndAddFiles = (files) => {
    const maxSizeBytes = 50 * 1024 * 1024;

    const validFiles = files.filter((f) => {
      if (f.size > maxSizeBytes) {
        sileo.error({
          title: "File too large",
          description: `${f.name} exceeds the 50MB limit.`,
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

  const executeTrigger = (e) => {
    e.preventDefault();
    triggerSaveConfirmation();
  };

  return (
    <>
      <div
        className="offcanvas offcanvas-end shadow-lg border-0"
        tabIndex="-1"
        id="classworkDrawer"
        style={{ width: "500px" }}
      >
        <div
          className="offcanvas-header border-bottom py-3"
          style={{ backgroundColor: "var(--accent-color)" }}
        >
          <h5
            className="offcanvas-title fw-bold d-flex align-items-center"
            style={{ color: "var(--primary-color)" }}
          >
            {drawerMode === "create" ? (
              <>
                <i className="bi bi-file-earmark-plus-fill me-2 fs-4"></i> Post
                Classwork
              </>
            ) : (
              <>
                <i className="bi bi-pencil-square me-2 fs-4"></i> Update
                Classwork
              </>
            )}
          </h5>
          <button
            type="button"
            className="btn-close shadow-none"
            data-bs-dismiss="offcanvas"
          ></button>
        </div>

        <div className="offcanvas-body custom-scrollbar p-4 bg-white">
          <form onSubmit={executeTrigger}>
            <div className="mb-4">
              <label className="form-label small fw-bold text-dark">
                Classwork Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="title"
                className="form-control form-control-lg bg-light toolbar-input text-dark fw-bold fs-6"
                value={formData.title || ""}
                onChange={handleInputChange}
                required
                placeholder="e.g. Activity 1: System Config"
              />
            </div>

            <div className="row g-3 mb-4">
              <div className="col-6">
                <label className="form-label small fw-bold text-dark">
                  Type <span className="text-danger">*</span>
                </label>
                <select
                  name="type"
                  className="form-select bg-light toolbar-input text-dark"
                  value={formData.type || ""}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>
                    Select...
                  </option>
                  <option value="assignment">Assignment</option>
                  <option value="activity">Activity</option>
                  <option value="quiz">Quiz</option>
                  <option value="exam">Exam</option>
                  <option value="material">Material</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label small fw-bold text-dark">
                  Points
                </label>
                <input
                  type="number"
                  name="points"
                  className="form-control bg-light toolbar-input text-dark"
                  value={formData.points || ""}
                  onChange={handleInputChange}
                  disabled={formData.type === "material"}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-dark">
                Deadline / Due Date
              </label>
              <input
                type="datetime-local"
                name="deadline"
                className="form-control bg-light toolbar-input text-dark"
                value={formData.deadline ? formData.deadline.slice(0, 16) : ""}
                onChange={handleInputChange}
                disabled={formData.type === "material"}
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-dark">
                Instructions <span className="text-danger">*</span>
              </label>
              <textarea
                name="instruction"
                className="form-control bg-light toolbar-input text-dark custom-scrollbar"
                rows="5"
                value={formData.instruction || ""}
                onChange={handleInputChange}
                required
                placeholder="Describe the task or material..."
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-paperclip me-1 text-muted"></i> Attachment
                Options
              </label>
              <div
                className="d-flex flex-wrap gap-4 p-3 rounded-3"
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
                    Include Link
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
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="checkForm"
                    checked={includeForm}
                    onChange={(e) => setIncludeForm(e.target.checked)}
                  />
                  <label
                    className="form-check-label small fw-bold text-dark"
                    htmlFor="checkForm"
                  >
                    Include Form
                  </label>
                </div>
              </div>
            </div>

            {includeLink && (
              <div className="mb-4">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-link-45deg me-1 text-muted"></i> URL Link
                </label>
                <input
                  type="url"
                  className="form-control bg-light toolbar-input"
                  name="link"
                  value={formData.link || ""}
                  onChange={handleInputChange}
                  required
                  placeholder="https://example.com"
                />
              </div>
            )}

            {includeForm && (
              <div className="mb-4">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-ui-radios me-1 text-muted"></i> Select
                  Quiz/Exam Form
                </label>
                <select
                  name="form_id"
                  className="form-select bg-light toolbar-input"
                  value={formData.form_id || ""}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select an existing form...</option>
                  {availableForms.map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {includeFiles && (
              <div className="mb-3">
                <div className="text-center mb-3">
                  <label
                    className="form-label small fw-bold text-muted mb-1 text-uppercase w-100"
                    style={{ letterSpacing: "1px" }}
                  >
                    <i className="bi bi-file-earmark-arrow-up me-1"></i> Upload
                    Files
                  </label>
                </div>
                <div
                  className="p-4 text-center mb-4 rounded-4"
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
                    style={{ fontSize: "2.5rem", color: "#626F47" }}
                  ></i>
                  <p
                    className="text-muted mb-2"
                    style={{ fontSize: "0.75rem" }}
                  >
                    Accepted formats: All file types
                    <br />
                    Max file size: 50MB
                  </p>
                  <p className="fw-medium text-dark mb-0">
                    Drag & Drop or Click to Browse
                  </p>
                  <input
                    type="file"
                    className="d-none"
                    ref={fileInputRef}
                    multiple
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
                            className="d-flex align-items-center justify-content-between p-2 bg-white border rounded-3 shadow-sm"
                          >
                            <div className="d-flex align-items-center">
                              <div
                                className="rounded-3 d-flex align-items-center justify-content-center me-3"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  backgroundColor: style.bg,
                                  color: style.color,
                                }}
                              >
                                <i className={`bi ${style.icon} fs-5`}></i>
                              </div>
                              <div>
                                <p
                                  className="mb-0 fw-bold text-dark text-truncate"
                                  style={{
                                    fontSize: "0.85rem",
                                    maxWidth: "250px",
                                  }}
                                >
                                  {file.name}
                                </p>
                                <p
                                  className="mb-0 text-muted"
                                  style={{ fontSize: "0.70rem" }}
                                >
                                  {formatSize(file.file_size)}
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
                            className="d-flex align-items-center justify-content-between p-2 bg-white border rounded-3 shadow-sm"
                            style={{
                              borderLeft: `4px solid ${style.color} !important`,
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <div
                                className="rounded-3 d-flex align-items-center justify-content-center me-3"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  backgroundColor: style.bg,
                                  color: style.color,
                                }}
                              >
                                <i className={`bi ${style.icon} fs-5`}></i>
                              </div>
                              <div>
                                <p
                                  className="mb-0 fw-bold text-dark text-truncate"
                                  style={{
                                    fontSize: "0.85rem",
                                    maxWidth: "250px",
                                  }}
                                >
                                  {file.name}
                                </p>
                                <p
                                  className="mb-0 text-muted"
                                  style={{ fontSize: "0.70rem" }}
                                >
                                  {formatSize(file.size)}
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

            <div className="mt-5 pt-3 border-top">
              <button
                type="submit"
                className="btn btn-campusloop w-100 rounded-3 shadow-sm"
              >
                {drawerMode === "create" ? (
                  <>
                    <i className="bi bi-send-check-fill me-2"></i> Post
                    Classwork
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle-fill me-2"></i> Save
                    Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* UPDATE CONFIRMATION MODAL */}
      <div
        className="modal fade"
        id="updateConfirmModal"
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
              <h4 className="fw-bold text-dark">Edit Classwork Information</h4>
              <p className="text-muted mb-0">
                You are about to edit the records of{" "}
                <b>{selectedItem?.title}</b>. Do you want to proceed to the
                update form?
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

      {/* SAVE CONFIRMATION MODAL */}
      <div
        className="modal fade"
        id="saveConfirmModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-body text-center p-4">
              <div
                className="rounded-circle bg-success bg-opacity-10 d-flex justify-content-center align-items-center mx-auto mb-3"
                style={{ width: "80px", height: "80px" }}
              >
                <i
                  className="bi bi-check-circle-fill text-success"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
              <h4 className="fw-bold text-dark mt-3">
                {drawerMode === "create" ? "Post Classwork" : "Save Changes"}
              </h4>
              <p className="text-muted mb-4">
                Are you sure you want to proceed with these details?
              </p>
              <div className="d-flex justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                  data-bs-dismiss="modal"
                  onClick={() =>
                    new Offcanvas(
                      document.getElementById("classworkDrawer"),
                    ).show()
                  }
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-campusloop px-4 fw-medium shadow-sm rounded-3"
                  data-bs-dismiss="modal"
                  onClick={executeSubmit}
                >
                  Yes, Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClassworkFormDrawer;
