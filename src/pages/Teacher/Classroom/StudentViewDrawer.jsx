import React from "react";

const StudentViewDrawer = ({
  student,
  actionType,
  selectedIdsCount,
  executeAction,
}) => {
  const calculateAge = (birthday) => {
    if (!birthday) return "";
    const ageDifMs = Date.now() - new Date(birthday).getTime();
    return Math.abs(new Date(ageDifMs).getUTCFullYear() - 1970);
  };

  return (
    <>
      <div
        className="offcanvas offcanvas-end shadow-lg border-0"
        tabIndex="-1"
        id="studentViewDrawer"
        style={{ width: "450px" }}
      >
        <div
          className="offcanvas-header border-bottom py-3"
          style={{ backgroundColor: "var(--accent-color)" }}
        >
          <h5
            className="offcanvas-title fw-bold d-flex align-items-center"
            style={{ color: "var(--primary-color)" }}
          >
            <i className="bi bi-person-badge-fill me-2 fs-4"></i> Student
            Details
          </h5>
          <button
            type="button"
            className="btn-close shadow-none"
            data-bs-dismiss="offcanvas"
          ></button>
        </div>

        <div className="offcanvas-body custom-scrollbar p-4 bg-white">
          {student ? (
            <div className="row g-4">
              {/* Personal Information Section */}
              <div className="col-12">
                <h6
                  className="fw-bold text-muted mb-0 border-bottom pb-2"
                  style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                >
                  PERSONAL INFORMATION
                </h6>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-person me-1 text-muted"></i> First Name
                </label>
                <input
                  type="text"
                  className="form-control bg-light toolbar-input"
                  value={student.first_name || ""}
                  disabled
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-person me-1 text-muted"></i> Last Name
                </label>
                <input
                  type="text"
                  className="form-control bg-light toolbar-input"
                  value={student.last_name || ""}
                  disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-gender-ambiguous me-1 text-muted"></i>{" "}
                  Gender
                </label>
                <input
                  type="text"
                  className="form-control bg-light toolbar-input"
                  value={student.gender || "N/A"}
                  disabled
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-calendar-date me-1 text-muted"></i>{" "}
                  Birthday & Age
                </label>
                <div className="input-group">
                  <input
                    type="date"
                    className="form-control bg-light toolbar-input border-end-0"
                    value={
                      student.birthday ? student.birthday.substring(0, 10) : ""
                    }
                    disabled
                  />
                  <div className="input-group-text bg-white border-top border-bottom border-0 px-1">
                    <div
                      className="vr text-muted"
                      style={{ width: "2px", height: "20px" }}
                    ></div>
                  </div>
                  <span
                    className="input-group-text bg-white toolbar-input border-start-0 text-primary fw-bold px-2"
                    style={{ minWidth: "55px", justifyContent: "center" }}
                  >
                    {calculateAge(student.birthday) || "-"}
                  </span>
                </div>
              </div>

              {/* Account Settings Section */}
              <div className="col-12 mt-4">
                <h6
                  className="fw-bold text-muted mb-0 border-bottom pb-2"
                  style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                >
                  ACCOUNT SETTINGS
                </h6>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-shield-lock me-1 text-muted"></i> Role
                </label>
                <input
                  type="text"
                  className="form-control bg-light toolbar-input text-capitalize"
                  value="Student"
                  disabled
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-toggle-on me-1 text-muted"></i> Status
                </label>
                <input
                  type="text"
                  className="form-control bg-light toolbar-input text-capitalize"
                  value={student.pivot?.status || "N/A"}
                  disabled
                />
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-envelope-at me-1 text-muted"></i> Email
                  Address
                </label>
                <input
                  type="email"
                  className="form-control bg-light toolbar-input"
                  value={student.email || ""}
                  disabled
                />
              </div>

              {/* Academic Details */}
              <div className="col-12 mt-4">
                <h6
                  className="fw-bold text-muted mb-0 border-bottom pb-2"
                  style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                >
                  ACADEMIC DETAILS
                </h6>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-123 me-1 text-muted"></i> LRN
                </label>
                <input
                  type="text"
                  className="form-control bg-light toolbar-input"
                  value={student.lrn || "N/A"}
                  disabled
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-journal-text me-1 text-muted"></i> Strand
                </label>
                <input
                  type="text"
                  className="form-control bg-light toolbar-input"
                  value={student.strand?.name || "N/A"}
                  disabled
                />
              </div>
            </div>
          ) : (
            <div className="text-center mt-5">
              <p className="text-muted">No student selected.</p>
            </div>
          )}

          <div className="mt-5 pt-3 border-top">
            <button
              type="button"
              className="btn btn-campusloop w-100 rounded-3 shadow-sm"
              data-bs-dismiss="offcanvas"
            >
              <i className="bi bi-check-circle me-2"></i> Okay, Got it!
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      <div
        className="modal fade"
        id="actionConfirmModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-body text-center p-4">
              <div
                className={`rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3 ${actionType === "approve" ? "bg-success" : "bg-danger"} bg-opacity-10`}
                style={{ width: "80px", height: "80px" }}
              >
                <i
                  className={`bi ${actionType === "approve" ? "bi-person-check-fill text-success" : actionType === "decline" ? "bi-person-x-fill text-warning" : "bi-exclamation-triangle-fill text-danger"}`}
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
              <h4 className="fw-bold text-dark mt-3 text-capitalize">
                {actionType} Students
              </h4>
              <p className="text-muted mb-4">
                Are you sure you want to {actionType} the{" "}
                <b>
                  {selectedIdsCount} selected student
                  {selectedIdsCount > 1 ? "s" : ""}
                </b>
                ?
              </p>
              <div className="d-flex justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`btn ${actionType === "approve" ? "btn-success" : actionType === "decline" ? "btn-warning" : "btn-danger"} px-4 fw-medium shadow-sm rounded-3`}
                  data-bs-dismiss="modal"
                  onClick={executeAction}
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

export default StudentViewDrawer;
