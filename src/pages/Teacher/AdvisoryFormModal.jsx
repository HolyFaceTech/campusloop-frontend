import React from "react";
import { Modal } from "bootstrap";

const AdvisoryFormModal = ({
  modalMode,
  formData,
  handleInputChange,
  handleInitialSubmit,
  selectedItem,
  proceedToUpdateForm,
  executeSubmit,
  executeDelete,
}) => {
  return (
    <>
      <div
        className="modal fade"
        id="advisoryModal"
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
                {modalMode === "create" ? (
                  <>
                    <i className="bi bi-plus-square-fill me-2"></i> Create New
                    Advisory
                  </>
                ) : (
                  <>
                    <i className="bi bi-pencil-square me-2"></i> Update Advisory
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
              <div className="modal-body p-4 bg-white">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-people-fill me-1 text-muted"></i> Class
                    Section
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light toolbar-input"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    required
                    autoFocus
                    placeholder="e.g. 12 - STEM A"
                  />
                </div>

                <div className="row mb-2">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label small fw-bold text-dark">
                      <i className="bi bi-calendar-event me-1 text-muted"></i>{" "}
                      School Year
                    </label>
                    <input
                      type="text"
                      className="form-control bg-light toolbar-input"
                      name="school_year"
                      value={formData.school_year}
                      onChange={handleInputChange}
                      required
                      pattern="\d{4}-\d{4}"
                      maxLength="9"
                      title="Format must be exactly YYYY-YYYY (e.g., 2025-2026)"
                      placeholder="e.g. 2025-2026"
                    />
                    <div
                      className="form-text text-muted"
                      style={{ fontSize: "0.65rem", marginTop: "4px" }}
                    >
                      Format: YYYY-YYYY
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-dark">
                      <i className="bi bi-person-bounding-box me-1 text-muted"></i>{" "}
                      Capacity
                    </label>
                    <input
                      type="number"
                      className="form-control bg-light toolbar-input"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. 40"
                      min="1"
                    />
                  </div>
                </div>
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
                  className="btn btn-campusloop px-4 fw-bold rounded-3 shadow-sm"
                >
                  <i
                    className={`bi ${modalMode === "create" ? "bi-plus-circle-fill" : "bi-check-circle-fill"} me-2`}
                  ></i>
                  {modalMode === "create" ? "Submit" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="updateIntentConfirmModal"
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
              <h4 className="fw-bold text-dark mt-2">Update Advisory</h4>
              <p className="text-muted mb-0">
                Are you sure you want to update the details for{" "}
                <b>{selectedItem?.section}</b>?
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
              <h4 className="fw-bold text-dark mt-2">Delete Advisory</h4>
              <p className="text-muted mb-0">
                Are you sure you want to move <b>{selectedItem?.section}</b> to
                the Recycle Bin?
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

export default AdvisoryFormModal;
