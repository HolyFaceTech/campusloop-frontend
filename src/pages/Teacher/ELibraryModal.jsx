import React, { useRef } from "react";

const ELibraryModal = ({
  modalMode,
  formData,
  handleInputChange,
  handleFileChange,
  removeFile,
  existingFiles,
  setExistingFiles,
  setDeletedFileIds,
  handleInitialSubmit,
  selectedLib,
  executeDelete,
  proceedToUpdateForm,
}) => {
  const fileInputRef = useRef(null);

  const formatBytes = (bytes) => {
    if (bytes === 0 || !bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e) => {
    e.preventDefault();
    handleFileChange({ target: { files: e.dataTransfer.files } });
  };

  return (
    <>
      <div
        className="modal fade"
        id="elibraryModal"
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
                    <i className="bi bi-cloud-arrow-up-fill me-2"></i> Upload to
                    E-Library
                  </>
                ) : (
                  <>
                    <i className="bi bi-pencil-square me-2"></i> Update Document
                  </>
                )}
              </h5>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <form onSubmit={handleInitialSubmit}>
              <div className="modal-body p-4 p-md-5 bg-white">
                <div className="alert bg-warning bg-opacity-10 border border-warning text-dark small fw-medium rounded-3 mb-4 d-flex align-items-center">
                  <i className="bi bi-info-circle-fill text-warning me-2 fs-5"></i>
                  Files uploaded or updated will undergo Admin Approval before
                  being visible to students.
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-fonts me-1 text-muted"></i> Document
                    Title
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light toolbar-input"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Earth Science Module 1"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-card-text me-1 text-muted"></i>{" "}
                    Description
                  </label>
                  <textarea
                    className="form-control bg-light toolbar-input custom-scrollbar"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    required
                    placeholder="Provide a short overview of this resource..."
                  ></textarea>
                </div>

                <hr className="my-4 opacity-10" />

                <div className="mb-3">
                  <div className="text-center mb-3">
                    <label
                      className="form-label small fw-bold text-muted mb-1 text-uppercase w-100"
                      style={{ letterSpacing: "1px" }}
                    >
                      <i className="bi bi-file-earmark-arrow-up me-1"></i>{" "}
                      Upload Files
                    </label>
                  </div>

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
                      Accepted formats: PDF <br /> Max file size: 15MB
                    </p>
                    <p className="fw-medium text-dark mb-1">
                      Drag & Drop your files here
                    </p>
                    <p className="small text-muted mb-3">OR</p>
                    <button
                      type="button"
                      className="btn text-white rounded-3 px-4 shadow-sm"
                      style={{ backgroundColor: "#626F47" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current.click();
                      }}
                    >
                      Browse Files
                    </button>
                    <input
                      type="file"
                      className="d-none"
                      ref={fileInputRef}
                      multiple
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                    />
                  </div>

                  {((existingFiles && existingFiles.length > 0) ||
                    (formData.files && formData.files.length > 0)) && (
                    <div>
                      <span className="small text-muted mb-2 d-block">
                        Attached Files:
                      </span>
                      <div
                        className="d-flex flex-column gap-2 custom-scrollbar"
                        style={{ maxHeight: "250px", overflowY: "auto" }}
                      >
                        {existingFiles &&
                          existingFiles.map((file) => (
                            <div
                              key={`existing-${file.id}`}
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
                                type="button"
                                className="btn btn-sm btn-light rounded-circle text-muted"
                                onClick={() => {
                                  setExistingFiles((prev) =>
                                    prev.filter((f) => f.id !== file.id),
                                  );
                                  setDeletedFileIds((prev) => [
                                    ...prev,
                                    file.id,
                                  ]);
                                }}
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </div>
                          ))}

                        {formData.files &&
                          formData.files.map((file, index) => (
                            <div
                              key={`new-${index}`}
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
                                    {formatBytes(file.size)} •{" "}
                                    {file.name.split(".").pop()}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-light rounded-circle text-muted"
                                onClick={() => removeFile(index)}
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
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
                  type="submit"
                  className="btn btn-campusloop px-4 fw-bold rounded-3"
                >
                  {modalMode === "create" ? (
                    <>
                      <i className="bi bi-plus-circle-fill me-2"></i> Submit
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
      </div>

      <div
        className="modal fade"
        id="editConfirmModal"
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
              <h4 className="fw-bold text-dark mt-2">Edit Resource</h4>
              <p className="text-muted mb-0">
                You are about to edit the files and details of{" "}
                <b>{selectedLib?.title}</b>. Do you want to proceed to the
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
              <h4 className="fw-bold text-dark mt-2">Delete File</h4>
              <p className="text-muted mb-0">
                Are you sure you want to move <b>{selectedLib?.title}</b> to the
                Recycle Bin?
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

export default ELibraryModal;
