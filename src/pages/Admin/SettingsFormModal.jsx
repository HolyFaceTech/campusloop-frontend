import React from "react";

const SettingsFormModal = ({
  formData,
  handleInputChange,
  handleFormSubmit,
  executeReset,
  currentSetting,
  executeMaintenanceToggle,
}) => {
  return (
    <>
      <div
        className="modal fade"
        id="setSettingsModal"
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
                <i className="bi bi-gear-fill me-2"></i> Configure School
                Settings
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
                    <i className="bi bi-calendar-event me-1 text-muted"></i>{" "}
                    School Year (Format: YYYY-YYYY)
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light toolbar-input text-center fs-5 fw-bold"
                    name="school_year"
                    value={formData.school_year}
                    onChange={handleInputChange}
                    pattern="\d{4}-\d{4}"
                    title="Must be in YYYY-YYYY format (e.g., 2025-2026)"
                    required
                    autoFocus
                    placeholder="e.g., 2025-2026"
                  />
                  <small
                    className="text-muted d-block mt-2 text-center"
                    style={{ fontSize: "0.75rem" }}
                  >
                    Ensure the format is exact to avoid data issues.
                  </small>
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-clock-history me-1 text-muted"></i> Term
                  </label>
                  <select
                    className="form-select bg-light toolbar-input"
                    name="term"
                    value={formData.term}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Term</option>
                    <option value="1st">1st Term</option>
                    <option value="2nd">2nd Term</option>
                    <option value="3rd">3rd Term</option>
                  </select>
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
                  <i className="bi bi-plus-circle-fill me-2"></i>
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="resetConfirmModal"
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
              <h4 className="fw-bold text-dark">Reset Settings?</h4>
              <p className="text-muted mb-0">
                Are you sure you want to clear the current School Year and Term?
                This might affect data displaying on the dashboard.
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
                onClick={executeReset}
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="maintenanceConfirmModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-0 pb-0 justify-content-center mt-4">
              <div
                className={`rounded-circle d-flex justify-content-center align-items-center ${currentSetting?.maintenance_mode ? "bg-success" : "bg-danger"} bg-opacity-10`}
                style={{ width: "80px", height: "80px" }}
              >
                <i
                  className={`bi ${currentSetting?.maintenance_mode ? "bi-unlock-fill text-success" : "bi-lock-fill text-danger"}`}
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark">
                {currentSetting?.maintenance_mode
                  ? "Disable Maintenance Mode?"
                  : "Enable Maintenance Mode?"}
              </h4>
              <p className="text-muted mb-0">
                {currentSetting?.maintenance_mode
                  ? "Are you sure you want to turn OFF maintenance mode? Teachers and Students will regain access to the system."
                  : "Are you sure you want to turn ON maintenance mode? This will instantly block Teachers and Students from accessing the system."}
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
                className={`btn px-4 fw-medium shadow-sm rounded-3 ${currentSetting?.maintenance_mode ? "btn-success" : "btn-danger"}`}
                data-bs-dismiss="modal"
                onClick={executeMaintenanceToggle}
              >
                Yes, {currentSetting?.maintenance_mode ? "Turn OFF" : "Turn ON"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsFormModal;
