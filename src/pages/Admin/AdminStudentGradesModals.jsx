import React, { useState, useEffect } from "react";
import { Modal } from "bootstrap";

const AdminStudentGradesModals = ({
  activeStudent,
  studentGrades,
  isLoadingGrades,
  triggerApprove,
  triggerDecline,
  triggerDelete,
  proceedToFeedback,
  executeApprove,
  executeDecline,
  executeDelete,
  declineFeedback,
  setDeclineFeedback,
  selectedGradeIds,
  setSelectedGradeIds,
  isBulkAction,
}) => {
  const [syFilter, setSyFilter] = useState("all");
  const [termFilter, setTermFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const uniqueSYs = [...new Set(studentGrades.map((g) => g.school_year))];

  // DEBOUNCE EFFECT (500ms Delay)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [syFilter, termFilter, debouncedSearch, entriesPerPage]);

  const filteredGrades = studentGrades.filter((grade) => {
    const matchSy = syFilter === "all" || grade.school_year === syFilter;
    const matchTerm = termFilter === "all" || grade.term === termFilter;
    const matchSearch =
      `${grade.subject_code} ${grade.subject_description} ${grade.teacher_name}`
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());
    return matchSy && matchTerm && matchSearch;
  });

  const totalPages = Math.ceil(filteredGrades.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;

  const currentGrades = filteredGrades.slice(
    startIndex,
    startIndex + entriesPerPage,
  );

  const selectedGradesData = currentGrades.filter((g) =>
    selectedGradeIds.includes(g.id),
  );

  const hasSelection = selectedGradeIds.length > 0;

  const canApproveOrDecline =
    hasSelection &&
    selectedGradesData.some((g) => g.status === "pending");

  const canDelete =
    hasSelection &&
    selectedGradesData.some((g) => g.status === "approved");

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedGradeIds(currentGrades.map((g) => g.id));
    } else {
      setSelectedGradeIds([]);
    }
  };

  const toggleSelection = (id) => {
    if (selectedGradeIds.includes(id)) {
      setSelectedGradeIds((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedGradeIds((prev) => [...prev, id]);
    }
  };

  const handleCloseMainModal = () => {
    setSyFilter("all");
    setTermFilter("all");
    setSearchQuery("");
    setDebouncedSearch("");
    setCurrentPage(1);
    setSelectedGradeIds([]);
  };

  const handleCancelAction = () => {
    setTimeout(() => {
      new Modal(document.getElementById("studentGradesModal")).show();
    }, 400);
  };

  const renderPageNumbers = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, "...", totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        pages = [
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        ];
      }
    }

    return pages.map((page, index) => (
      <li
        key={index}
        className={`page-item ${currentPage === page ? "active" : ""} ${page === "..." ? "disabled" : ""}`}
      >
        <button
          className={`page-link ${page === "..." ? "border-0 bg-transparent text-muted" : "page-link-summer"}`}
          onClick={() => page !== "..." && setCurrentPage(page)}
          style={page === "..." ? { cursor: "default" } : {}}
        >
          {page}
        </button>
      </li>
    ));
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
        <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-light">
            <div
              className="modal-header border-bottom py-3 d-flex flex-row align-items-center justify-content-between"
              style={{ backgroundColor: "var(--accent-color)" }}
            >
              <h5
                className="modal-title fw-bold mb-0"
                style={{ color: "var(--primary-color)" }}
              >
                <i className="bi bi-journal-bookmark-fill me-2"></i>
                Academic Records: {activeStudent?.first_name}{" "}
                {activeStudent?.last_name}
              </h5>
              <button
                type="button"
                className="btn-close shadow-none m-0"
                data-bs-dismiss="modal"
                onClick={handleCloseMainModal}
              ></button>
            </div>

            <div className="modal-body p-4 bg-light">
              <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
                <div className="card-body p-0">
                  <div className="d-flex flex-nowrap align-items-center gap-3 overflow-x-auto custom-scrollbar p-3">
                    <div className="d-flex align-items-center flex-shrink-0 text-muted small">
                      Show
                      <select
                        className="form-select form-select-sm mx-2 toolbar-input rounded-3"
                        style={{ width: "70px" }}
                        value={entriesPerPage}
                        onChange={(e) =>
                          setEntriesPerPage(Number(e.target.value))
                        }
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      entries
                    </div>

                    <div
                      className="input-group flex-grow-1"
                      style={{ minWidth: "300px" }}
                    >
                      <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                        placeholder="Search Subject or Teacher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="input-group" style={{ minWidth: "300px" }}>
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

                    <div className="input-group" style={{ minWidth: "300px" }}>
                      <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                        <i className="bi bi-calendar-range"></i>
                      </span>
                      <select
                        className="form-select border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                        value={termFilter}
                        onChange={(e) => setTermFilter(e.target.value)}
                      >
                        <option value="all">All Terms</option>
                        <option value="1st">1st Term</option>
                        <option value="2nd">2nd Term</option>
                        <option value="3rd">3rd Term</option>
                      </select>
                    </div>

                    <div className="d-flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => triggerApprove(null)}
                        disabled={!canApproveOrDecline}
                        className="btn btn-success text-light d-flex align-items-center justify-content-center gap-2 py-2 px-3 rounded-3 shadow-sm"
                      >
                        <i className="bi bi-check-circle me-1"></i> Approve
                      </button>
                      <button
                        onClick={() => triggerDecline(null)}
                        disabled={!canApproveOrDecline}
                        className="btn btn-warning text-dark d-flex align-items-center justify-content-center gap-2 py-2 px-3 rounded-3 shadow-sm"
                      >
                        <i className="bi bi-x-circle me-1"></i> Decline
                      </button>
                      <button
                        onClick={() => triggerDelete(null)}
                        disabled={!canDelete}
                        className="btn btn-danger d-flex align-items-center justify-content-center gap-2 py-2 px-3 rounded-3 shadow-sm"
                      >
                        <i className="bi bi-trash me-1"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-0">
                <div
                  className="table-responsive custom-scrollbar"
                  style={{ maxHeight: "400px" }}
                >
                  <table
                    className="table table-summer align-middle mb-0"
                    style={{ minWidth: "900px" }}
                  >
                    <thead className="bg-white sticky-top z-1 shadow-sm">
                      <tr>
                        <th
                          className="ps-4 text-center"
                          style={{ width: "50px", borderTop: "none" }}
                        >
                          <input
                            className="form-check-input shadow-sm"
                            type="checkbox"
                            style={{ cursor: "pointer" }}
                            checked={
                              currentGrades.length > 0 &&
                              selectedGradeIds.length === currentGrades.length
                            }
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th style={{ borderTop: "none" }}>SY & Term</th>
                        <th style={{ borderTop: "none" }}>Subject Details</th>
                        <th style={{ borderTop: "none" }}>Encoded By</th>
                        <th
                          className="text-center"
                          style={{ borderTop: "none" }}
                        >
                          Final Grade
                        </th>
                        <th
                          className="text-center"
                          style={{ borderTop: "none" }}
                        >
                          Status
                        </th>
                        <th
                          className="text-center pe-4"
                          style={{ borderTop: "none" }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingGrades ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-5 text-muted bg-white"
                          >
                            <div
                              className="spinner-border spinner-border-sm text-primary me-2"
                              role="status"
                            ></div>
                            Loading grades...
                          </td>
                        </tr>
                      ) : currentGrades.length > 0 ? (
                        currentGrades.map((record, index) => (
                          <tr key={record.id} className="hover-bg-light">
                            <td className="ps-4 text-center py-2">
                              <input
                                className="form-check-input shadow-sm"
                                type="checkbox"
                                style={{ cursor: "pointer" }}
                                checked={selectedGradeIds.includes(record.id)}
                                onChange={() => toggleSelection(record.id)}
                              />
                            </td>
                            <td className="py-2">
                              <span className="d-block fw-bold text-dark small">
                                {record.school_year}
                              </span>
                              <span
                                className="d-block text-muted text-uppercase"
                                style={{
                                  fontSize: "0.65rem",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                {record.term} Term
                              </span>
                            </td>
                            <td className="py-2">
                              <span className="d-block fw-bold font-monospace text-dark">
                                {record.subject_code}
                              </span>
                              <span
                                className="d-block text-muted text-truncate fst-italic"
                                style={{
                                  fontSize: "0.75rem",
                                  maxWidth: "200px",
                                }}
                                title={record.subject_description}
                              >
                                {record.subject_description}
                              </span>
                            </td>
                            <td className="py-2">
                              <div className="d-flex align-items-center py-1">
                                <span className="d-block text-dark fw-bold small">
                                  {record.teacher_name || "Unknown Teacher"}
                                </span>
                              </div>
                            </td>
                            <td
                              className={`text-center fw-bolder fs-5 py-2 ${record.grade < 75 ? "text-danger" : "text-dark"}`}
                            >
                              {record.grade}
                            </td>
                            <td className="text-center py-2">
                              {record.status === "pending" && (
                                <span className="badge bg-warning bg-opacity-10 text-warning fw-medium border border-warning px-2 py-1 rounded-3">
                                  Pending
                                </span>
                              )}
                              {record.status === "approved" && (
                                <span className="text-secondary rounded-3">
                                  <i className="bi bi-lock-fill me-1"></i>
                                </span>
                              )}
                              {record.status === "declined" && (
                                <span className="badge bg-danger bg-opacity-10 text-danger fw-medium border border-danger px-2 py-1 rounded-3">
                                  Declined
                                </span>
                              )}
                            </td>
                            <td className="text-center pe-4">
                              {record.status === "pending" ? (
                                <div className="d-flex justify-content-center">
                                  <button
                                    className="btn btn-sm btn-light border-0 shadow-sm me-2 rounded-circle"
                                    style={{ width: "35px", height: "35px" }}
                                    title="Approve Grade"
                                    onClick={() => triggerApprove(record.id)}
                                  >
                                    <i className="bi bi-check-circle-fill text-success"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-light border-0 shadow-sm rounded-circle"
                                    style={{ width: "35px", height: "35px" }}
                                    title="Decline Grade"
                                    onClick={() => triggerDecline(record.id)}
                                  >
                                    <i className="bi bi-x-circle-fill text-warning"></i>
                                  </button>
                                </div>
                              ) : record.status === "approved" ? (
                                <span className="text-muted small fw-medium">
                                  <i className="bi bi-check2-all me-1"></i>{" "}
                                  Reviewed
                                </span>
                              ) : (
                                <span className="text-muted small fw-medium">
                                  <i className="bi bi-arrow-return-left"></i>{" "}
                                  Returned
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="p-4 bg-light border-bottom-0"
                          >
                            <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
                              <i
                                className="bi bi-inbox text-muted d-block mb-3"
                                style={{ fontSize: "3rem", opacity: 0.5 }}
                              ></i>
                              <h5 className="fw-bold text-dark">
                                No records found.
                              </h5>
                              <p className="text-muted small mb-0">
                                {searchQuery ||
                                syFilter !== "all" ||
                                termFilter !== "all"
                                  ? "Try adjusting your search or filters."
                                  : "No student grade records available."}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {filteredGrades.length > 0 && !isLoadingGrades && (
                <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 px-2 gap-3">
                  <p className="text-muted small mb-0">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(
                      startIndex + entriesPerPage,
                      filteredGrades.length,
                    )}{" "}
                    of {filteredGrades.length} records
                  </p>
                  <nav>
                    <ul className="pagination pagination-sm mb-0 flex-wrap justify-content-end">
                      <li
                        className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link page-link-summer"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                        >
                          Previous
                        </button>
                      </li>

                      {renderPageNumbers()}

                      <li
                        className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link page-link-summer"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                          }
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
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
                Are you sure you want to approve{" "}
                {isBulkAction ? (
                  <b>
                    {selectedGradeIds.length} selected grade
                    {selectedGradeIds.length > 1 ? "s" : ""}
                  </b>
                ) : (
                  "this grade"
                )}
                ? This action will <b>lock</b> the{" "}
                {isBulkAction
                  ? `record${selectedGradeIds.length > 1 ? "s" : ""}`
                  : "record"}
                , and the teacher will no longer be able to edit it.
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
                className="btn btn-success px-4 fw-medium shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={executeApprove}
              >
                Yes, Lock Grade
                {isBulkAction && selectedGradeIds.length > 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      </div>

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
                Are you sure you want to decline{" "}
                {isBulkAction ? (
                  <b>
                    {selectedGradeIds.length} selected grade
                    {selectedGradeIds.length > 1 ? "s" : ""}
                  </b>
                ) : (
                  "this grade"
                )}
                ? It will be returned to the teacher for correction.
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
                className="btn btn-warning text-dark px-4 fw-medium shadow-sm rounded-3"
                onClick={proceedToFeedback}
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      </div>

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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeDecline(e);
              }}
            >
              <div className="modal-body p-4 bg-white">
                <label className="form-label small fw-bold text-dark">
                  Reason for Declining <span className="text-danger">*</span>
                </label>
                <p className="small text-muted mb-2">
                  Please explain why{" "}
                  {isBulkAction ? "these grades are" : "this grade is"} being
                  declined so the teacher can make the necessary corrections.
                </p>
                <textarea
                  className="form-control bg-light toolbar-input custom-scrollbar"
                  rows="4"
                  required
                  autoFocus
                  placeholder="e.g. Please verify the calculation..."
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
                  className="btn btn-campusloop px-4 fw-bold shadow-sm rounded-3"
                >
                  <i className="bi bi-plus-circle-fill me-2"></i> Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="confirmDeleteGradeModal"
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
              <h4 className="fw-bold text-dark mt-2">Delete Grade</h4>
              <p className="text-muted mb-0">
                Are you sure you want to permanently delete{" "}
                <b>
                  {selectedGradeIds.length} selected grade
                  {selectedGradeIds.length > 1 ? "s" : ""}
                </b>
                ?{" "}
                <b className="text-danger fw-medium">
                  This action cannot be undone.
                </b>
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
                className="btn btn-danger text-white px-4 fw-medium shadow-sm rounded-3"
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

export default AdminStudentGradesModals;
