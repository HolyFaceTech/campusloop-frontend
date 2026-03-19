import React, { useState } from "react";
import { Modal } from "bootstrap";

const AdminStudentGradesModals = ({
  activeStudent,
  studentGrades,
  triggerApprove,
  triggerDecline,
  proceedToFeedback,
  executeApprove,
  executeDecline,
  declineFeedback,
  setDeclineFeedback,
}) => {
  const [syFilter, setSyFilter] = useState("all");
  const [semFilter, setSemFilter] = useState("all");

  // Get unique school years for the filter dropdown
  const uniqueSYs = [...new Set(studentGrades.map((g) => g.school_year))];

  // Filtering Logic para sa loob ng modal table
  const filteredGrades = studentGrades.filter((grade) => {
    const matchSy = syFilter === "all" || grade.school_year === syFilter;
    const matchSem = semFilter === "all" || grade.semester === semFilter;
    return matchSy && matchSem;
  });

  const handleCloseMainModal = () => {
    setSyFilter("all");
    setSemFilter("all");
  };

  const handleCancelAction = () => {
    // Ibabalik ang main modal kapag nag-cancel sa confirmation modal
    setTimeout(() => {
      new Modal(document.getElementById("studentGradesModal")).show();
    }, 400);
  };

  return (
    <>
      <div
        className="modal fade"
        id="studentGradesModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div
              className="modal-header border-bottom pb-3"
              style={{ backgroundColor: "var(--accent-color)" }}
            >
              <h5
                className="modal-title fw-bold"
                style={{ color: "var(--primary-color)" }}
              >
                <i className="bi bi-journal-bookmark-fill me-2"></i>
                Academic Records: {activeStudent?.first_name}{" "}
                {activeStudent?.last_name}
              </h5>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
                onClick={handleCloseMainModal}
              ></button>
            </div>

            <div className="modal-body p-4 bg-white">
              <div className="d-flex flex-wrap justify-content-end gap-3 mb-3">
                {/* SY FILTER */}
                <div className="col-12 col-md-auto">
                  <div className="input-group" style={{ width: "300px" }}>
                    <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                      <i className="bi bi-calendar-event"></i>
                    </span>
                    <select
                      className="form-select border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                      value={syFilter}
                      onChange={(e) => setSyFilter(e.target.value)}
                    >
                      <option value="all">All School Years</option>
                      {uniqueSYs.map((sy) => (
                        <option key={sy} value={sy}>
                          {sy}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* SEM FILTER */}
                <div className="col-12 col-md-auto">
                  <div className="input-group" style={{ width: "300px" }}>
                    <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                      <i className="bi bi-calendar-range"></i>
                    </span>
                    <select
                      className="form-select border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                      value={semFilter}
                      onChange={(e) => setSemFilter(e.target.value)}
                    >
                      <option value="all">All Semesters</option>
                      <option value="1st">1st Semester</option>
                      <option value="2nd">2nd Semester</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* GRADES TABLE */}
              <div className="border rounded-4 overflow-hidden shadow-sm">
                <div
                  className="table-responsive custom-scrollbar bg-white"
                  style={{ maxHeight: "400px" }}
                >
                  <table className="table table-hover align-middle mb-0 custom-table">
                    <thead className="bg-light sticky-top">
                      <tr>
                        <th className="small fw-bold text-muted px-4 py-3 text-uppercase">
                          SY & Sem
                        </th>
                        <th className="small fw-bold text-muted py-3 text-uppercase">
                          Subject Code
                        </th>
                        <th className="small fw-bold text-muted py-3 text-uppercase">
                          Encoded By
                        </th>
                        <th className="small fw-bold text-muted py-3 text-center text-uppercase">
                          Final Grade
                        </th>
                        <th className="small fw-bold text-muted py-3 text-center text-uppercase">
                          Status
                        </th>
                        <th className="small fw-bold text-muted py-3 text-center pe-4 text-uppercase">
                          Admin Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="border-top-0">
                      {filteredGrades.length > 0 ? (
                        filteredGrades.map((record) => (
                          <tr key={record.id}>
                            <td className="px-4">
                              <span className="d-block fw-bold text-dark small">
                                {record.school_year}
                              </span>
                              <span
                                className="d-block text-muted"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {record.semester} Semester
                              </span>
                            </td>
                            <td>
                              <span className="d-block fw-bold font-monospace text-primary">
                                {record.subject_code}
                              </span>
                              <span
                                className="d-block text-muted text-truncate"
                                style={{
                                  fontSize: "0.75rem",
                                  maxWidth: "200px",
                                }}
                                title={record.subject_description}
                              >
                                {record.subject_description}
                              </span>
                            </td>
                            {/* TEACHER PANGALAN DITO */}
                            <td>
                              <span className="d-block text-dark fw-bold small">
                                {record.teacher_name || "Unknown Teacher"}
                              </span>
                            </td>
                            <td
                              className={`text-center fw-bolder fs-5 ${record.grade < 75 ? "text-danger" : "text-dark"}`}
                            >
                              {record.grade}
                            </td>
                            <td className="text-center">
                              {record.status === "pending" && (
                                <span className="badge bg-warning bg-opacity-25 text-dark border border-warning px-3 py-1 rounded-3">
                                  Pending Review
                                </span>
                              )}
                              {record.status === "approved" && (
                                <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-1 rounded-3">
                                  <i className="bi bi-lock-fill me-1"></i>{" "}
                                  Locked
                                </span>
                              )}
                              {record.status === "declined" && (
                                <span className="badge bg-danger bg-opacity-10 text-danger border border-danger px-3 py-1 rounded-3">
                                  Declined
                                </span>
                              )}
                            </td>
                            <td className="text-center pe-4">
                              {record.status === "pending" ? (
                                <div className="d-flex justify-content-center gap-2">
                                  <button
                                    className="btn btn-sm btn-success fw-bold px-3 rounded-3 shadow-sm"
                                    onClick={() => triggerApprove(record.id)}
                                  >
                                    <i className="bi bi-check-lg"></i> Approve
                                  </button>
                                  <button
                                    className="btn btn-sm btn-warning text-dark fw-bold px-3 rounded-3 shadow-sm"
                                    onClick={() => triggerDecline(record.id)}
                                  >
                                    <i className="bi bi-x-lg"></i> Decline
                                  </button>
                                </div>
                              ) : (
                                <span className="text-muted small fw-medium italic">
                                  <i className="bi bi-check2-all"></i> Reviewed
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center py-5 text-muted"
                          >
                            <i className="bi bi-inbox fs-2 d-block mb-2 opacity-50"></i>
                            No grade records found for the selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="modal-footer border-top bg-light p-3 d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-light border px-4 fw-medium rounded-3 shadow-sm"
                data-bs-dismiss="modal"
                onClick={handleCloseMainModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* APPROVE CONFIRMATION MODAL */}
      <div
        className="modal fade"
        id="confirmApproveGradeModal"
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
                  className="bi bi-check-circle-fill text-success"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark mt-2">Approve Grade</h4>
              <p className="text-muted mb-0">
                Are you sure you want to approve this grade? This action will{" "}
                <b>lock</b> the record, and the teacher will no longer be able
                to edit it.
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
                onClick={handleCancelAction}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success px-4 fw-bold shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={executeApprove}
              >
                Yes, Lock Grade
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DECLINE INTENT MODAL */}
      <div
        className="modal fade"
        id="confirmDeclineGradeModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-0 pb-0 justify-content-center mt-4">
              <div
                className="rounded-circle bg-warning bg-opacity-10 d-flex justify-content-center align-items-center"
                style={{ width: "80px", height: "80px" }}
              >
                <i
                  className="bi bi-exclamation-circle-fill text-warning"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark mt-2">Decline Grade</h4>
              <p className="text-muted mb-0">
                Are you sure you want to decline this grade? It will be returned
                to the teacher for correction.
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
                onClick={handleCancelAction}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-warning text-dark px-4 fw-bold shadow-sm rounded-3"
                onClick={proceedToFeedback}
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DECLINE FEEDBACK MODAL */}
      <div
        className="modal fade"
        id="feedbackDeclineGradeModal"
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
                <i className="bi bi-chat-left-dots-fill me-2"></i> Teacher
                Feedback
              </h5>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
                onClick={handleCancelAction}
              ></button>
            </div>
            <form onSubmit={executeDecline}>
              <div className="modal-body p-4 bg-white">
                <label className="form-label small fw-bold text-dark">
                  Reason for Declining <span className="text-danger">*</span>
                </label>
                <p className="small text-muted mb-2">
                  Please explain why this grade is being declined so the teacher
                  can make the necessary corrections.
                </p>
                <textarea
                  className="form-control bg-light toolbar-input custom-scrollbar"
                  rows="4"
                  required
                  autoFocus
                  placeholder="e.g. Please verify the calculation for this student..."
                  value={declineFeedback}
                  onChange={(e) => setDeclineFeedback(e.target.value)}
                ></textarea>
              </div>
              <div className="modal-footer border-top bg-light p-3 d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-light border px-4 fw-medium rounded-3"
                  data-bs-dismiss="modal"
                  onClick={handleCancelAction}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-campusloop px-4 fw-medium shadow-sm rounded-3"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminStudentGradesModals;
