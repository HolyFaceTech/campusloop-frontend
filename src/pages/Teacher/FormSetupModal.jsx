import React from "react";
import { Modal } from "bootstrap";

const FormSetupModal = ({
  modalMode,
  formData,
  handleInputChange,
  handleFormSubmit,
  selectedForm,
  executeSubmit,
  executeDuplicate,
  executeDelete,
}) => {
  return (
    <>
      <div
        className="modal fade"
        id="formSetupModal"
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
                    <i className="bi bi-plus-square-fill me-2"></i> Form Setup
                  </>
                ) : (
                  <>
                    <i className="bi bi-pencil-square me-2"></i> Form Settings
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
                <div className="mb-4">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-fonts me-1 text-muted"></i> Form Name{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-control form-control-lg bg-light toolbar-input text-dark fw-bold fs-6"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Midterm Examination in Web Dev"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-card-text me-1 text-muted"></i> General
                    Instructions <span className="text-danger">*</span>
                  </label>
                  <textarea
                    name="instruction"
                    className="form-control bg-light toolbar-input text-dark custom-scrollbar"
                    rows="3"
                    value={formData.instruction}
                    onChange={handleInputChange}
                    placeholder="Provide clear instructions for the students..."
                    required
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-hourglass-split me-1 text-muted"></i>
                    Time Limit (Minutes)
                  </label>
                  <input
                    type="number"
                    name="timer"
                    className="form-control bg-light toolbar-input"
                    value={formData.timer}
                    onChange={handleInputChange}
                    placeholder="Leave blank for no time limit"
                    min="0"
                  />
                  <div className="form-text small opacity-75">
                    Forms will auto-submit when the timer runs out.
                  </div>
                </div>

                <div className="d-flex flex-column gap-3 bg-light p-3 rounded-4 border border-light-subtle">
                  <div className="form-check form-switch d-flex align-items-start ps-0">
                    <input
                      className="form-check-input ms-0 me-3 mt-1"
                      type="checkbox"
                      id="shuffleCheck"
                      name="is_shuffle_questions"
                      checked={formData.is_shuffle_questions}
                      onChange={handleInputChange}
                      style={{ cursor: "pointer" }}
                    />
                    <label
                      className="form-check-label small fw-bold  text-primary"
                      htmlFor="shuffleCheck"
                      style={{ cursor: "pointer" }}
                    >
                      <i className="bi bi-shuffle me-1"></i> Shuffle Questions
                      <span
                        className="d-block text-muted fw-normal mt-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Randomize the order of questions for each student.
                      </span>
                    </label>
                  </div>

                  <hr className="my-1 border-secondary opacity-10" />

                  <div className="form-check form-switch d-flex align-items-start ps-0">
                    <input
                      className="form-check-input ms-0 me-3 mt-1"
                      type="checkbox"
                      id="focusCheck"
                      name="is_focus_mode"
                      checked={formData.is_focus_mode}
                      onChange={handleInputChange}
                      style={{ cursor: "pointer" }}
                    />
                    <label
                      className="form-check-label small fw-bold text-danger"
                      htmlFor="focusCheck"
                      style={{ cursor: "pointer" }}
                    >
                      <i className="bi bi-shield-lock-fill me-1 text-danger"></i>{" "}
                      Enable Focus Mode (Anti-Cheat)
                      <span
                        className="d-block text-muted fw-normal mt-1"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Auto-submits if student switches tabs. Disables copy,
                        paste, and right-click.
                      </span>
                    </label>
                  </div>
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
                      <i className="bi bi-pencil-square me-2"></i> Proceed to
                      Builder
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
        id="updateConfirmModal"
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
                  className="bi bi-pencil-square text-campusloop"
                  style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark mt-2">Save Changes</h4>
              <p className="text-muted mb-0">
                Are you sure you want to update the settings for{" "}
                <b>{selectedForm?.name}</b>?
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
                onClick={() => {
                  const modal = new Modal(
                    document.getElementById("formSetupModal"),
                  );
                  modal.show();
                }}
              >
                Cancel
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
        id="duplicateConfirmModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-0 pb-0 justify-content-center mt-4">
              <div
                className="rounded-circle bg-success bg-opacity-10 d-flex justify-content-center align-items-center"
                style={{ width: "80px", height: "80px" }}
              >
                <i
                  className="bi bi-copy text-success"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark mt-2">Duplicate Form</h4>
              <p className="text-muted mb-0">
                Are you sure you want to create a copy of{" "}
                <b>{selectedForm?.name}</b>?
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
                className="btn btn-success px-4 fw-medium shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={executeDuplicate}
              >
                Yes, Duplicate
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
              <h4 className="fw-bold text-dark mt-2">Delete Form</h4>
              <p className="text-muted mb-0">
                Are you sure you want to move <b>{selectedForm?.name}</b> to the
                recycle bin?
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

export default FormSetupModal;
