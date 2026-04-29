import React from "react";

const StrandFormModal = ({
  modalMode,
  formData,
  handleInputChange,
  handleFormSubmit,
  selectedStrand,
  proceedToUpdateForm,
  executeDelete,
}) => {
  return (
    <>
      {/* MAIN FORM MODAL */}
      <div
        className="modal fade"
        id="strandFormModal"
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
                    Strand
                  </>
                ) : (
                  <>
                    <i className="bi bi-pencil-square me-2"></i> Update Strand
                  </>
                )}
              </h5>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body p-4 bg-white">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-diagram-3 me-1 text-muted"></i> Strand
                    Name (e.g., "STEM")
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light toolbar-input"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    autoFocus
                    placeholder="Enter Strand Acronym/Name"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-card-text me-1 text-muted"></i> Strand
                    Description
                  </label>
                  <textarea
                    className="form-control bg-light toolbar-input custom-scrollbar"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    placeholder="e.g., Science, Technology, Engineering, and Mathematics"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-top bg-light p-3 d-flex gap-2">
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
              <h4 className="fw-bold text-dark">Edit Strand Information</h4>
              <p className="text-muted mb-0">
                You are about to edit the records of{" "}
                <b>{selectedStrand?.name}</b>. Do you want to proceed to the
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
              <h4 className="fw-bold text-dark">Confirm Deletion</h4>
              <p className="text-muted mb-0">
                Are you sure you want to move <b>{selectedStrand?.name}</b> to
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

export default StrandFormModal;
