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
  handleSubmit,
  executeDelete,
  selectedItem,
  proceedToUpdateForm,
}) => {
  const [availableForms, setAvailableForms] = useState([]);
  const fileInputRef = useRef(null);
  const formDropdownRef = useRef(null);
  const [formSearchQuery, setFormSearchQuery] = useState("");
  const [showFormDropdown, setShowFormDropdown] = useState(false);
  const formatSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
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
        color: "#0dcaf0",
        bg: "#cff4fc",
        label: "VIDEO",
      };

    return {
      icon: "bi-file-earmark-fill",
      color: "#6c757d",
      bg: "#e2e3e5",
      label: "FILE",
    };
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
          if (Array.isArray(res.data.data)) {
            setAvailableForms(res.data.data);
          } else if (Array.isArray(res.data)) {
            setAvailableForms(res.data);
          } else {
            setAvailableForms([]);
            console.log("Unexpected forms response structure:", res.data);
          }
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        formDropdownRef.current &&
        !formDropdownRef.current.contains(event.target)
      ) {
        setShowFormDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e) => {
    e.preventDefault();
    validateAndAddFiles(Array.from(e.dataTransfer.files));
  };
  const onFileInputChange = (e) =>
    validateAndAddFiles(Array.from(e.target.files));

  const validateAndAddFiles = (files) => {
    const maxSizeBytes = 50 * 1024 * 1024;
    const allowedExtensions = [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "csv",
      "ppt",
      "pptx",
      "png",
      "jpg",
      "jpeg",
      "gif",
      "mp4",
      "avi",
      "mov",
    ];

    const validFiles = files.filter((f) => {
      const ext = f.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        sileo.error({
          title: "Invalid file type",
          description: `${f.name} is not supported.`,
        });
        return false;
      }
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

  const searchedForms = availableForms.filter((form) =>
    form.name.toLowerCase().includes(formSearchQuery.toLowerCase()),
  );

  const selectedFormObj = availableForms.find(
    (f) => String(f.id) === String(formData.form_id),
  );

  const formDisplayValue = showFormDropdown
    ? formSearchQuery
    : selectedFormObj
      ? selectedFormObj.name
      : "";

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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="mb-4">
              <label className="form-label small fw-bold text-dark">
                <i className="bi bi-fonts me-1 text-muted"></i> Classwork Title{" "}
                <span className="text-danger">*</span>
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
                  <i className="bi bi-tag me-1 text-muted"></i> Type{" "}
                  <span className="text-danger">*</span>
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
                  <i className="bi bi-award me-1 text-muted"></i> Points
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
                <i className="bi bi-calendar-event me-1 text-muted"></i>{" "}
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
                <i className="bi bi-card-text me-1 text-muted"></i> Instructions{" "}
                <span className="text-danger">*</span>
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
              <label className="form-label small fw-bold text-dark d-block text-center">
                <i className="bi bi-paperclip me-1 text-muted"></i> Attachment
                Options
              </label>
              <div
                className="d-flex flex-wrap gap-4 p-3 rounded-3 justify-content-center"
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
                    Link
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
                    Files
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
                    Form
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
              <div
                className="mb-4 position-relative"
                ref={formDropdownRef}
                style={{ zIndex: 1050 }}
              >
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-ui-radios me-1 text-muted"></i> Select
                  Quiz/Exam Form
                </label>
                <div className="input-group shadow-sm">
                  <input
                    type="text"
                    className="form-control bg-light toolbar-input border-end-0 text-truncate"
                    placeholder="Search form..."
                    value={formDisplayValue}
                    onChange={(e) => {
                      setFormSearchQuery(e.target.value);
                      setShowFormDropdown(true);
                      if (formData.form_id) {
                        handleInputChange({
                          target: { name: "form_id", value: "" },
                        });
                      }
                    }}
                    onClick={() => {
                      setShowFormDropdown(true);
                      setFormSearchQuery("");
                    }}
                    style={{ cursor: "text" }}
                  />
                  <span
                    className="input-group-text bg-light border-start-0 text-muted"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowFormDropdown(!showFormDropdown)}
                  >
                    <i
                      className={`bi ${showFormDropdown ? "bi-chevron-up" : "bi-chevron-down"}`}
                    ></i>
                  </span>
                </div>

                {/* HIDDEN INPUT FOR NATIVE HTML VALIDATION */}
                <input
                  type="text"
                  required
                  value={formData.form_id || ""}
                  onChange={() => {}}
                  className="position-absolute"
                  style={{ opacity: 0, zIndex: -1, bottom: 10, left: "50%" }}
                  title="Please select a form from the dropdown."
                />

                <ul
                  className={`dropdown-menu shadow-lg border border-light-subtle rounded-4 custom-scrollbar p-2 ${showFormDropdown ? "show" : ""}`}
                  style={{
                    width: "100%",
                    left: 0,
                    right: 0,
                    maxHeight: "260px",
                    overflowY: "auto",
                    position: "absolute",
                    top: "100%",
                    zIndex: 1050,
                    marginTop: "0.5rem",
                  }}
                >
                  {searchedForms.length > 0 ? (
                    searchedForms.map((form) => {
                      const isSelected =
                        String(formData.form_id) === String(form.id);

                      return (
                        <li key={form.id} className="mb-1">
                          <button
                            type="button"
                            className={`dropdown-item py-2 px-3 rounded-3 transition-all d-flex justify-content-between align-items-center ${isSelected ? "bg-primary text-white shadow-sm" : "hover-bg-light text-dark"}`}
                            onClick={() => {
                              handleInputChange({
                                target: { name: "form_id", value: form.id },
                              });
                              setShowFormDropdown(false);
                              setFormSearchQuery("");
                            }}
                          >
                            <span
                              className="fw-medium text-truncate"
                              style={{ fontSize: "0.85rem", maxWidth: "90%" }}
                            >
                              {form.name}
                            </span>
                            {isSelected && (
                              <i className="bi bi-check-circle-fill ms-2"></i>
                            )}
                          </button>
                        </li>
                      );
                    })
                  ) : (
                    <li>
                      <div className="text-center py-4 text-muted">
                        <i className="bi bi-inbox fs-3 d-block mb-2 opacity-25"></i>
                        <span className="small fw-medium">
                          No matching forms found.
                        </span>
                      </div>
                    </li>
                  )}
                </ul>
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
                    Accepted formats: PDF, DOC, EXCEL, PPT, IMG, VIDEO
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
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.mp4,.avi,.mov"
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
                        const style = getFileDetails(file.file_extension);
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
                        const style = getFileDetails(ext);
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
              <h4 className="fw-bold text-dark">Delete Classwork</h4>
              <p className="text-muted mb-0">
                Are you sure you want to move <b>{selectedItem?.title}</b> to
                the recycle bin?
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

export default ClassworkFormDrawer;
