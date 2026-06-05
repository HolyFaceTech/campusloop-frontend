import React, { useRef, useState } from "react";
import { Modal } from "bootstrap";
import axios from "axios";
import { sileo } from "sileo";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const SubjectImportModal = ({
  fetchSubjects,
  setIsLoading,
  setLoadingText,
}) => {
  const [importFile, setImportFile] = useState(null);
  const importFileInputRef = useRef(null);

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-primary", "bg-light");

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateFile(e.target.files[0]);
    }
    e.target.value = null;
  };

  const validateFile = (file) => {
    const isCsvExt = file.name.toLowerCase().endsWith(".csv");
    const isCsvMime =
      file.type === "text/csv" || file.type === "application/vnd.ms-excel";

    if (!isCsvExt && !isCsvMime) {
      sileo.error({
        title: "Invalid File",
        description: "Please upload a valid .csv file.",
        ...darkToast,
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      sileo.error({
        title: "File Too Large",
        description: "Maximum file size is 5MB.",
        ...darkToast,
      });
      return;
    }
    setImportFile(file);
  };

  const triggerConfirmation = () => {
    if (!importFile) {
      sileo.warning({
        title: "No File",
        description: "Please attach a CSV file first.",
        ...darkToast,
      });
      return;
    }

    const firstModalEl = document.getElementById("importSubjectModal");
    const firstModal = Modal.getInstance(firstModalEl);

    if (firstModal) {
      firstModal.hide();
    }

    setTimeout(() => {
      const confirmModal = new Modal(
        document.getElementById("importSubjectConfirmModal"),
      );
      confirmModal.show();
    }, 400);
  };

  const executeImport = async () => {
    document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";

    setIsLoading(true);
    setLoadingText("Importing subjects...");

    const formData = new FormData();
    formData.append("file", importFile);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/subjects/import`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );

      sileo.success({
        title: "Import Successful",
        description: response.data.message,
        ...darkToast,
      });
      setImportFile(null);
      fetchSubjects();
    } catch (error) {
      sileo.error({
        title: "Import Failed",
        description:
          error.response?.data?.message || "Failed to import subjects.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToImportModal = () => {
    const secondModalEl = document.getElementById("importSubjectConfirmModal");
    const secondModal = Modal.getInstance(secondModalEl);

    if (secondModal) {
      secondModal.hide();
    }

    setTimeout(() => {
      const firstModal = new Modal(
        document.getElementById("importSubjectModal"),
      );
      firstModal.show();
    }, 400);
  };

  return (
    <>
      <div
        className="modal fade"
        id="importSubjectModal"
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
                <i className="bi bi-file-earmark-arrow-up-fill me-2"></i> Import
                Subjects
              </h5>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setImportFile(null)}
              ></button>
            </div>

            <div className="modal-body p-4 bg-white">
              <p className="text-muted small mb-3">
                Attach your CSV file containing the subject records.
              </p>

              <div
                className="p-4 text-center mb-4 rounded-4"
                style={{
                  border: "2px dashed #A4B465",
                  backgroundColor: "#f8f9fc",
                  cursor: "pointer",
                  transition: "0.3s",
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add("border-primary", "bg-light");
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove(
                    "border-primary",
                    "bg-light",
                  );
                }}
                onDrop={handleFileDrop}
                onClick={() => importFileInputRef.current?.click()}
              >
                <i
                  className="bi bi-cloud-arrow-up-fill mb-2 d-block"
                  style={{ fontSize: "2.5rem", color: "#626F47" }}
                ></i>
                <p className="text-muted mb-2" style={{ fontSize: "0.75rem" }}>
                  Accepted format: CSV only <br /> Max file size: 5MB
                </p>
                <p className="fw-medium text-dark mb-0">
                  Drag & Drop or Click to Browse
                </p>

                <input
                  type="file"
                  className="d-none"
                  ref={importFileInputRef}
                  accept=".csv, application/vnd.ms-excel, text/csv"
                  onChange={handleFileChange}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {importFile && (
                <div>
                  <span className="small text-muted mb-2 d-block fw-bold">
                    File to Import:
                  </span>
                  <div className="d-flex align-items-center justify-content-between p-3 bg-white border rounded-4 shadow-sm transition-all hover-shadow">
                    <div className="d-flex align-items-center overflow-hidden pe-3">
                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                        style={{
                          width: "45px",
                          height: "45px",
                          backgroundColor: "rgba(70, 165, 121, 0.25)",
                          color: "#198754",
                        }}
                      >
                        <i className="bi bi-file-earmark-excel-fill fs-5"></i>
                      </div>
                      <div className="overflow-hidden">
                        <p
                          className="mb-0 fw-bold text-dark text-truncate"
                          style={{ fontSize: "0.95rem" }}
                          title={importFile.name}
                        >
                          {importFile.name}
                        </p>
                        <p
                          className="mb-0 text-muted text-uppercase"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {formatBytes(importFile.size)} •{" "}
                          {importFile.name.split(".").pop().toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-light rounded-circle text-muted"
                      onClick={() => setImportFile(null)}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer border-top bg-light p-3 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light border px-4 fw-medium rounded-3"
                data-bs-dismiss="modal"
                onClick={() => setImportFile(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-campusloop px-4 fw-bold rounded-3"
                onClick={triggerConfirmation}
                disabled={!importFile}
              >
                <i className="bi bi-plus-circle-fill me-2"></i> Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="importSubjectConfirmModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-0 pb-0 justify-content-center mt-4">
              <div
                className="rounded-circle bg-opacity-10 d-flex justify-content-center align-items-center"
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "rgba(98, 111, 71, 0.1)",
                }}
              >
                <i
                  className="bi bi-check-circle-fill"
                  style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark">Import Subjects</h4>
              <p className="text-muted mb-0">
                You are about to import subjects from <b>{importFile?.name}</b>.
                The system will automatically map them to the correct academic
                strands. Proceed?
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                onClick={goBackToImportModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-campusloop px-4 fw-medium shadow-sm rounded-3"
                onClick={() => {
                  const m = Modal.getInstance(
                    document.getElementById("importSubjectConfirmModal"),
                  );
                  if (m) m.hide();
                  setTimeout(() => executeImport(), 400);
                }}
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubjectImportModal;
