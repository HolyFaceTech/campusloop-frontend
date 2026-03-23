import React from "react";

const StudentClassroomsModals = ({
  joinCode,
  setJoinCode,
  executeJoinClassroom,
}) => {
  return (
    <>
      {/* JOIN CLASSROOM MODAL */}
      <div
        className="modal fade"
        id="joinClassroomModal"
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
                <i className="bi bi-door-open-fill me-2"></i> Join Classroom
              </h5>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <form onSubmit={executeJoinClassroom}>
              <div className="modal-body p-4 bg-white">
                <div className="text-center mb-4">
                  <i
                    className="bi bi-upc-scan text-muted"
                    style={{ fontSize: "3rem", opacity: 0.3 }}
                  ></i>
                  <h6 className="fw-bold text-dark mt-2">Enter Class Code</h6>
                  <p className="small text-muted mb-0">
                    Ask your teacher for the 9-character classroom code, then
                    enter it here.
                  </p>
                </div>

                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control form-control-lg bg-light text-center fw-bold font-monospace letter-spacing-wide shadow-none"
                    placeholder="e.g. ASD-3G3-QWE"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength="11"
                    required
                    autoFocus
                  />
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
                  disabled={!joinCode}
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentClassroomsModals;
