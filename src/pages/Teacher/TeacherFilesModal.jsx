import React from "react";

const TeacherFilesModal = ({ selectedIds, executeDownloadZip }) => {
  return (
    <div
      className="modal fade"
      id="downloadZipModal"
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
                className="bi bi-file-earmark-zip-fill"
                style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}
              ></i>
            </div>
          </div>
          <div className="modal-body text-center p-4">
            <h4 className="fw-bold text-dark mt-2">Download Files</h4>
            <p className="text-muted mb-0">
              Are you sure you want to download <b>{selectedIds.length}</b>{" "}
              selected file{selectedIds.length > 1 ? "s" : ""} as a ZIP archive?
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
              onClick={executeDownloadZip}
            >
              Yes, Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherFilesModal;
