import React, { useState, useEffect, useRef } from "react";
import { Modal } from "bootstrap";

const AdvisoryDetailsModals = ({
  selectedStudentIds = [],
  toggleStudentSelection,
  confirmAddStudents,
  executeAddStudents,
  studentToRemove,
  executeRemoveStudent,
  activeStudent,
  isEditingGrade,
  setIsEditingGrade,
  handleGradeSubmit,
  executeSaveGrade,
  subjects = [],
  studentGrades = [],
  gradeForm = {},
  setGradeForm,
  viewingFeedback,
  setViewingFeedback,
  encodedSubjectIds = [],
  isLoadingGrades,
  gradesSearch,
  setGradesSearch,
  gradesEntries,
  setGradesEntries,
  gradesPage,
  setGradesPage,
  gradesTotalPages,
  gradesTotalRecords,
  gradesSyFilter,
  setGradesSyFilter,
  gradesTermFilter,
  setGradesTermFilter,
  gradesUniqueSYs = [],
  availableStudents = [],
  isLoadingAvailable,
  availableSearch,
  setAvailableSearch,
  availableEntries,
  setAvailableEntries,
  availablePage,
  setAvailablePage,
  availableTotalPages,
  availableTotalRecords,
}) => {
  const subjectDropdownRef = useRef(null);
  const [subjectSearchQuery, setSubjectSearchQuery] = useState("");
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        subjectDropdownRef.current &&
        !subjectDropdownRef.current.contains(event.target)
      ) {
        setShowSubjectDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditClick = (record) => {
    setIsEditingGrade(true);
    setViewingFeedback(null);
    setGradeForm({
      id: record.id,
      subject_id: record.subject_id || "",
      term: record.term || "",
      grade: record.grade || "",
    });
  };

  const handleViewFeedback = (feedback) => {
    setViewingFeedback(feedback);
    setIsEditingGrade(false);
  };

  const resetForm = () => {
    setIsEditingGrade(false);
    setViewingFeedback(null);
    setGradeForm({ id: null, subject_id: "", term: "1st", grade: "" });
  };

  const safeSubjects = Array.isArray(subjects) ? subjects : [];

  const safeEncodedIds = Array.isArray(encodedSubjectIds)
    ? encodedSubjectIds.map((id) => String(id))
    : [];

  const availableSubjectsForEncoding = safeSubjects.filter((subj) => {
    const isAlreadyGraded = safeEncodedIds.includes(String(subj.id));
    if (isEditingGrade && String(gradeForm?.subject_id) === String(subj.id)) {
      return true;
    }
    return !isAlreadyGraded;
  });

  const filteredAvailableSubjects = availableSubjectsForEncoding.filter(
    (subj) =>
      `${subj.code} ${subj.description}`
        .toLowerCase()
        .includes(subjectSearchQuery.toLowerCase()),
  );

  const selectedSubjectObj = safeSubjects.find(
    (s) => String(s.id) === String(gradeForm?.subject_id),
  );

  const subjectDisplayValue = showSubjectDropdown
    ? subjectSearchQuery
    : selectedSubjectObj
      ? `${selectedSubjectObj.code}: ${selectedSubjectObj.description}`
      : "";

  const renderGradesPageNumbers = () => {
    let pages = [];
    if (gradesTotalPages <= 5) {
      for (let i = 1; i <= gradesTotalPages; i++) pages.push(i);
    } else {
      if (gradesPage <= 3) {
        pages = [1, 2, 3, 4, "...", gradesTotalPages];
      } else if (gradesPage >= gradesTotalPages - 2) {
        pages = [
          1,
          "...",
          gradesTotalPages - 3,
          gradesTotalPages - 2,
          gradesTotalPages - 1,
          gradesTotalPages,
        ];
      } else {
        pages = [
          1,
          "...",
          gradesPage - 1,
          gradesPage,
          gradesPage + 1,
          "...",
          gradesTotalPages,
        ];
      }
    }
    return pages.map((page, index) => (
      <li
        key={index}
        className={`page-item ${gradesPage === page ? "active" : ""} ${page === "..." ? "disabled" : ""}`}
      >
        <button
          className={`page-link ${page === "..." ? "border-0 bg-transparent text-muted" : "page-link-summer"}`}
          onClick={() => page !== "..." && setGradesPage(page)}
          style={page === "..." ? { cursor: "default" } : {}}
        >
          {page}
        </button>
      </li>
    ));
  };

  const renderAvailablePageNumbers = () => {
    let pages = [];
    if (availableTotalPages <= 5) {
      for (let i = 1; i <= availableTotalPages; i++) pages.push(i);
    } else {
      if (availablePage <= 3) {
        pages = [1, 2, 3, 4, "...", availableTotalPages];
      } else if (availablePage >= availableTotalPages - 2) {
        pages = [
          1,
          "...",
          availableTotalPages - 3,
          availableTotalPages - 2,
          availableTotalPages - 1,
          availableTotalPages,
        ];
      } else {
        pages = [
          1,
          "...",
          availablePage - 1,
          availablePage,
          availablePage + 1,
          "...",
          availableTotalPages,
        ];
      }
    }
    return pages.map((page, index) => (
      <li
        key={index}
        className={`page-item ${availablePage === page ? "active" : ""} ${page === "..." ? "disabled" : ""}`}
      >
        <button
          className={`page-link ${page === "..." ? "border-0 bg-transparent text-muted" : "page-link-summer"}`}
          onClick={() => page !== "..." && setAvailablePage(page)}
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
        id="addStudentsModal"
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
                <i className="bi bi-person-plus-fill me-2"></i> Add Students to
                Advisory
              </h5>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body p-4 bg-light">
              <div className="card border-0 shadow-sm rounded-4 mb-3 bg-white overflow-hidden">
                <div className="card-body p-0">
                  <div className="d-flex flex-nowrap align-items-center justify-content-between overflow-x-auto custom-scrollbar p-3 gap-3">
                    <div className="d-flex align-items-center flex-shrink-0 text-muted small">
                      Show
                      <select
                        className="form-select form-select-sm mx-2 toolbar-input rounded-3"
                        style={{ width: "70px" }}
                        value={availableEntries}
                        onChange={(e) =>
                          setAvailableEntries(Number(e.target.value))
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
                      className="input-group"
                      style={{ maxWidth: "400px", minWidth: "350px" }}
                    >
                      <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                        placeholder="Search Name or LRN..."
                        value={availableSearch}
                        onChange={(e) => setAvailableSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-2">
                <div
                  className="table-responsive custom-scrollbar"
                  style={{ maxHeight: "350px" }}
                >
                  <table
                    className="table table-summer align-middle mb-0"
                    style={{ minWidth: "700px" }}
                  >
                    <thead className="bg-white sticky-top shadow-sm z-1">
                      <tr>
                        <th
                          className="px-4 text-center"
                          style={{ width: "5%", borderTop: "none" }}
                        >
                          Select
                        </th>
                        <th style={{ borderTop: "none" }}>Student Details</th>
                        <th
                          className="text-end px-4"
                          style={{ borderTop: "none" }}
                        >
                          Strand
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingAvailable ? (
                        <tr>
                          <td
                            colSpan="3"
                            className="text-center py-5 text-muted bg-white border-bottom-0"
                          >
                            <div
                              className="spinner-border spinner-border-sm text-primary me-2"
                              role="status"
                            ></div>
                            Loading students...
                          </td>
                        </tr>
                      ) : availableStudents && availableStudents.length > 0 ? (
                        availableStudents.map((student) => (
                          <tr
                            key={student.id}
                            style={{ cursor: "pointer" }}
                            onClick={() => toggleStudentSelection(student.id)}
                            className={
                              selectedStudentIds.includes(student.id)
                                ? "table-success bg-opacity-25"
                                : "hover-bg-light"
                            }
                          >
                            <td
                              className="px-4 text-center"
                              style={{ width: "5%" }}
                            >
                              <input
                                type="checkbox"
                                className="form-check-input"
                                style={{ cursor: "pointer" }}
                                checked={selectedStudentIds.includes(
                                  student.id,
                                )}
                                readOnly
                              />
                            </td>
                            <td className="py-2">
                              <div className="d-flex align-items-center py-1">
                                <div
                                  className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold me-3 shadow-sm flex-shrink-0"
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    backgroundColor: "var(--secondary-color)",
                                  }}
                                >
                                  {student.first_name?.charAt(0) || "?"}
                                </div>
                                <div className="overflow-hidden">
                                  <span
                                    className="fw-bold text-dark text-truncate"
                                    style={{ maxWidth: "250px" }}
                                  >
                                    {student.first_name} {student.last_name}
                                  </span>
                                  <span
                                    className="d-block small text-muted font-monospace tracking-wide"
                                    style={{
                                      fontSize: "0.80rem",
                                      maxWidth: "250px",
                                    }}
                                  >
                                    <i className="bi bi-123 me-1 text-muted"></i>{" "}
                                    {student.lrn || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="text-end px-4 py-2">
                              <span
                                className="badge bg-opacity-10 rounded-3 text-dark fw-medium px-2 py-1 border border-dark-subtle shadow-sm"
                                style={{
                                  backgroundColor: "var(--accent-color)",
                                }}
                              >
                                {student.strand?.name || "No Strand"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="3"
                            className="p-4 bg-light border-bottom-0"
                          >
                            <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
                              <i
                                className="bi bi-inbox text-muted d-block mb-3"
                                style={{ fontSize: "3rem", opacity: 0.5 }}
                              ></i>
                              <h5 className="fw-bold text-dark">
                                No students found.
                              </h5>
                              <p className="text-muted small mb-0">
                                {availableSearch
                                  ? "Try adjusting your search query."
                                  : "All active students are already assigned to an advisory class."}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {availableTotalRecords > 0 && !isLoadingAvailable && (
                <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 px-2 gap-3">
                  <p className="text-muted small mb-0">
                    Showing {(availablePage - 1) * availableEntries + 1} to{" "}
                    {Math.min(
                      availablePage * availableEntries,
                      availableTotalRecords,
                    )}{" "}
                    of {availableTotalRecords} students
                  </p>
                  <nav>
                    <ul className="pagination pagination-sm mb-0 flex-wrap justify-content-end">
                      <li
                        className={`page-item ${availablePage === 1 ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link page-link-summer"
                          onClick={() =>
                            setAvailablePage((prev) => Math.max(prev - 1, 1))
                          }
                        >
                          Previous
                        </button>
                      </li>
                      {renderAvailablePageNumbers()}
                      <li
                        className={`page-item ${availablePage === availableTotalPages ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link page-link-summer"
                          onClick={() =>
                            setAvailablePage((prev) =>
                              Math.min(prev + 1, availableTotalPages),
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

            <div className="modal-footer border-top bg-white p-3 d-flex gap-2 justify-content-between">
              <label className="text-dark fw-bold mb-0 ms-2 pe-2">
                Selected{" "}
                <span className="badge bg-primary rounded-3 me-1 px-2 fw-medium shadow-sm">
                  {selectedStudentIds.length}
                </span>
              </label>
              <div>
                <button
                  type="button"
                  className="btn btn-light border px-4 fw-medium rounded-3 me-2 shadow-sm"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-campusloop px-4 fw-bold rounded-3 shadow-sm"
                  disabled={selectedStudentIds.length === 0}
                  onClick={confirmAddStudents}
                >
                  <i className="bi bi-plus-circle-fill me-2"></i> Add Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRADES RECORD MODAL */}
      <div
        className="modal fade"
        id="gradesModal"
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
                <i className="bi bi-journal-bookmark-fill me-2"></i> Grades
                Record: {activeStudent?.first_name} {activeStudent?.last_name}
              </h5>
              <button
                type="button"
                className="btn-close shadow-none m-0"
                data-bs-dismiss="modal"
                onClick={resetForm}
              ></button>
            </div>

            <div className="modal-body p-4 bg-light">
              <div
                className="card border-0 shadow-sm rounded-4 mb-4 bg-white border border-light-subtle"
                style={{ overflow: "visible" }}
              >
                {viewingFeedback ? (
                  <div className="card-body p-4 bg-danger bg-opacity-10 border rounded-4 border-danger-subtle">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center">
                        <h6 className="fw-bold text-danger mb-2">
                          <i className="bi bi-exclamation-triangle-fill me-2"></i>{" "}
                          Admin's Feedback
                        </h6>
                      </div>
                      <button
                        type="button"
                        className="btn btn-medium btn-light px-3 fw-medium rounded-3 shadow-sm border border-secondary-subtle"
                        onClick={resetForm}
                      >
                        Close
                      </button>
                    </div>
                    <div
                      className="bg-white p-3 rounded-3 border border-danger border-opacity-25 text-dark mb-0 custom-scrollbar shadow-sm"
                      style={{
                        fontSize: "0.95rem",
                        lineHeight: "1.6",
                        maxHeight: "150px",
                        overflowY: "auto",
                      }}
                    >
                      {viewingFeedback}
                    </div>
                  </div>
                ) : (
                  <div className="card-body p-4 bg-light">
                    <h6
                      className="fw-bold mb-3"
                      style={{ color: "var(--primary-color)" }}
                    >
                      {isEditingGrade ? (
                        <>
                          <i className="bi bi-pencil-square me-2"></i>Update
                          Subject Grade
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-circle-fill me-2"></i>Encode
                          Subject Grade
                        </>
                      )}
                    </h6>
                    <form onSubmit={handleGradeSubmit}>
                      <div className="row g-3 align-items-end">
                        <div
                          className="col-md-4 position-relative"
                          ref={subjectDropdownRef}
                          style={{ zIndex: 1050 }}
                        >
                          <label className="form-label small fw-bold text-dark">
                            <i className="bi bi-book me-1 text-muted"></i>{" "}
                            Subject
                          </label>
                          <div className="input-group shadow-sm">
                            <input
                              type="text"
                              className="form-control bg-white toolbar-input border-end-0 text-truncate"
                              placeholder={
                                availableSubjectsForEncoding.length === 0
                                  ? "All encoded"
                                  : "Search subject..."
                              }
                              value={subjectDisplayValue}
                              disabled={
                                availableSubjectsForEncoding.length === 0
                              }
                              onChange={(e) => {
                                setSubjectSearchQuery(e.target.value);
                                setShowSubjectDropdown(true);
                                if (gradeForm.subject_id) {
                                  setGradeForm({
                                    ...gradeForm,
                                    subject_id: "",
                                    term: "",
                                  });
                                }
                              }}
                              onClick={() => {
                                if (availableSubjectsForEncoding.length > 0) {
                                  setShowSubjectDropdown(true);
                                  setSubjectSearchQuery("");
                                }
                              }}
                              style={{
                                cursor:
                                  availableSubjectsForEncoding.length > 0
                                    ? "text"
                                    : "not-allowed",
                              }}
                            />
                            <span
                              className="input-group-text bg-white border-start-0 text-muted"
                              style={{
                                cursor:
                                  availableSubjectsForEncoding.length > 0
                                    ? "pointer"
                                    : "not-allowed",
                              }}
                              onClick={() => {
                                if (availableSubjectsForEncoding.length > 0) {
                                  setShowSubjectDropdown(!showSubjectDropdown);
                                }
                              }}
                            >
                              <i
                                className={`bi ${showSubjectDropdown ? "bi-chevron-up" : "bi-chevron-down"}`}
                              ></i>
                            </span>
                          </div>

                          <input
                            type="text"
                            required
                            value={gradeForm?.subject_id || ""}
                            onChange={() => {}}
                            className="position-absolute"
                            style={{
                              opacity: 0,
                              zIndex: -1,
                              bottom: 10,
                              left: "50%",
                            }}
                            title="Please select a subject from the dropdown."
                          />

                          <ul
                            className={`dropdown-menu shadow-lg border border-light-subtle rounded-4 w-100 custom-scrollbar p-2 ${showSubjectDropdown ? "show" : ""}`}
                            style={{
                              maxHeight: "280px",
                              overflowY: "auto",
                              position: "absolute",
                              top: "100%",
                              zIndex: 1050,
                              marginTop: "0.4rem",
                            }}
                          >
                            {filteredAvailableSubjects.length > 0 ? (
                              filteredAvailableSubjects.map((subj) => {
                                const isSelected =
                                  String(gradeForm?.subject_id) ===
                                  String(subj.id);
                                return (
                                  <li key={subj.id} className="mb-1">
                                    <button
                                      type="button"
                                      className={`dropdown-item py-2 px-3 rounded-3 transition-all d-flex justify-content-between align-items-center ${isSelected ? "bg-primary text-white shadow-sm" : "hover-bg-light text-dark"}`}
                                      onClick={() => {
                                        setGradeForm({
                                          ...gradeForm,
                                          subject_id: subj.id,
                                          term: subj.term || "",
                                        });
                                        setShowSubjectDropdown(false);
                                        setSubjectSearchQuery("");
                                      }}
                                    >
                                      <div className="d-flex flex-column text-start overflow-hidden pe-3">
                                        <span
                                          className="fw-bold d-block font-monospace"
                                          style={{ fontSize: "0.85rem" }}
                                        >
                                          {subj.code}
                                        </span>
                                        <span
                                          className={`fst-italic small text-truncate w-100 ${isSelected ? "text-white opacity-75" : "text-muted"}`}
                                          style={{ fontSize: "0.75rem" }}
                                        >
                                          {subj.description}
                                        </span>
                                      </div>

                                      <div className="flex-shrink-0">
                                        {subj.strand_name ? (
                                          <span
                                            className={`badge ${isSelected ? "bg-white text-primary" : " bg-opacity-10 text-dark border border-dark-subtle"} rounded-3 px-2 py-1 fw-medium`}
                                            style={{
                                              fontSize: "0.65rem",
                                              letterSpacing: "0.5px",
                                              backgroundColor:
                                                "var(--accent-color)",
                                            }}
                                          >
                                            {subj.strand_name}
                                          </span>
                                        ) : (
                                          <span
                                            className={`badge ${isSelected ? "bg-white bg-opacity-25 text-white border-0" : "bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle"} rounded-3 px-2 py-1 fw-medium`}
                                            style={{
                                              fontSize: "0.65rem",
                                              letterSpacing: "0.5px",
                                            }}
                                          >
                                            Core
                                          </span>
                                        )}
                                      </div>
                                    </button>
                                  </li>
                                );
                              })
                            ) : (
                              <li>
                                <div className="text-center py-4 text-muted">
                                  <i className="bi bi-inbox fs-3 d-block mb-2 opacity-25"></i>
                                  <span className="small fw-medium">
                                    No matching subjects found.
                                  </span>
                                </div>
                              </li>
                            )}
                          </ul>
                        </div>

                        <div className="col-md-3">
                          <label className="form-label small fw-bold text-dark">
                            <i className="bi bi-calendar-range me-1 text-muted"></i>{" "}
                            Term
                          </label>
                          <input
                            type="text"
                            className="form-control bg-light toolbar-input text-center"
                            value={
                              gradeForm?.term
                                ? `${gradeForm.term} Term`
                                : "Auto-filled"
                            }
                            readOnly
                            disabled
                          />
                        </div>

                        <div className="col-md-2">
                          <label className="form-label small fw-bold text-dark">
                            <i className="bi bi-award me-1 text-muted"></i>{" "}
                            Final Grade
                          </label>
                          <div className="input-group shadow-sm">
                            <input
                              type="number"
                              step="0.01"
                              min="1"
                              max="100"
                              className="form-control bg-light toolbar-input text-center"
                              placeholder="00.00"
                              required
                              value={gradeForm?.grade || ""}
                              onChange={(e) =>
                                setGradeForm({
                                  ...gradeForm,
                                  grade: e.target.value,
                                })
                              }
                              onKeyDown={(e) => {
                                if (["e", "E", "+", "-"].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                            />
                            <span className="input-group-text bg-white border-star-0 text-muted ps-3 rounded-end-3">
                              %
                            </span>
                          </div>
                        </div>

                        <div className="col-md-3 d-flex gap-2">
                          <button
                            type="submit"
                            className="btn w-100 fw-bold rounded-3 shadow-sm btn-campusloop d-flex justify-content-center align-items-center"
                          >
                            <i
                              className={`bi ${isEditingGrade ? "bi-check-circle-fill" : "bi-plus-circle-fill"} me-2`}
                            ></i>
                            {isEditingGrade ? "Save" : "Submit"}
                          </button>
                          {isEditingGrade && (
                            <button
                              type="button"
                              className="btn btn-light border fw-medium rounded-3 px-3 text-nowrap shadow-sm"
                              onClick={resetForm}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              <div className="card border-0 shadow-sm rounded-4 mb-3 bg-white overflow-hidden">
                <div className="card-body p-0">
                  <div className="d-flex flex-nowrap align-items-center justify-content-between overflow-x-auto custom-scrollbar p-3 gap-3">
                    <div className="d-flex align-items-center flex-shrink-0 text-muted small">
                      Show
                      <select
                        className="form-select form-select-sm mx-2 toolbar-input rounded-3"
                        style={{ width: "70px" }}
                        value={gradesEntries}
                        onChange={(e) =>
                          setGradesEntries(Number(e.target.value))
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
                      style={{ minWidth: "200px" }}
                    >
                      <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                        placeholder="Search Subject..."
                        value={gradesSearch}
                        onChange={(e) => setGradesSearch(e.target.value)}
                      />
                    </div>
                    <div className="input-group" style={{ minWidth: "200px" }}>
                      <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                        <i className="bi bi-calendar-event"></i>
                      </span>
                      <select
                        className="form-select border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                        value={gradesSyFilter}
                        onChange={(e) => setGradesSyFilter(e.target.value)}
                      >
                        <option value="all">All School Year</option>
                        {gradesUniqueSYs.map((sy) => (
                          <option key={sy} value={sy}>
                            {sy}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group" style={{ minWidth: "200px" }}>
                      <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                        <i className="bi bi-calendar-range"></i>
                      </span>
                      <select
                        className="form-select border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                        value={gradesTermFilter}
                        onChange={(e) => setGradesTermFilter(e.target.value)}
                      >
                        <option value="all">All Terms</option>
                        <option value="1st">1st Term</option>
                        <option value="2nd">2nd Term</option>
                        <option value="3rd">3rd Term</option>
                      </select>
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
                          className="ps-4"
                          style={{ width: "60px", borderTop: "none" }}
                        >
                          #
                        </th>
                        <th style={{ borderTop: "none" }}>SY & Term</th>
                        <th style={{ borderTop: "none" }}>Subject Details</th>
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
                            colSpan="6"
                            className="text-center py-5 text-muted bg-white border-bottom-0"
                          >
                            <div
                              className="spinner-border spinner-border-sm text-primary me-2"
                              role="status"
                            ></div>
                            Loading records...
                          </td>
                        </tr>
                      ) : studentGrades.length > 0 ? (
                        studentGrades.map((record, index) => (
                          <tr key={record.id} className="hover-bg-light">
                            <td className="ps-4 fw-bold text-muted py-2">
                              {(gradesPage - 1) * gradesEntries + index + 1}
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
                            <td
                              className={`text-center fw-bolder fs-5 py-2 ${record.grade < 75 ? "text-danger" : "text-success"}`}
                            >
                              {record.grade}
                            </td>
                            <td className="text-center py-2">
                              {record.status === "pending" && (
                                <span className="badge bg-warning bg-opacity-10 text-warning fw-medium border border-warning-subtle px-2 py-1 rounded-3 shadow-sm">
                                  Pending
                                </span>
                              )}
                              {record.status === "approved" && (
                                <span className="text-secondary rounded-3">
                                  <i className="bi bi-lock-fill me-1"></i>
                                </span>
                              )}
                              {record.status === "declined" && (
                                <span className="badge bg-danger bg-opacity-10 text-danger fw-medium border border-danger-subtle px-2 py-1 rounded-3 shadow-sm">
                                  Declined
                                </span>
                              )}
                            </td>
                            <td className="text-center pe-4 py-2">
                              {record.status !== "approved" ? (
                                <div className="d-flex justify-content-center">
                                  {record.status === "declined" && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-light border-0 shadow-sm me-2 rounded-circle"
                                      style={{ width: "35px", height: "35px" }}
                                      onClick={() =>
                                        handleViewFeedback(
                                          record.admin_feedback ||
                                            "No feedback provided.",
                                        )
                                      }
                                      title="View Admin Note"
                                    >
                                      <i className="bi bi-chat-left-text-fill text-danger"></i>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-light border-0 shadow-sm me-2 rounded-circle"
                                    style={{ width: "35px", height: "35px" }}
                                    onClick={() => handleEditClick(record)}
                                    title="Edit Grade"
                                  >
                                    <i className="bi bi-pencil-fill text-dark"></i>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-muted small fw-medium italic">
                                  <i className="bi bi-check2-all"></i> Encoded
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
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
                                {gradesSearch ||
                                gradesSyFilter !== "all" ||
                                gradesTermFilter !== "all"
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

              {studentGrades.length > 0 && !isLoadingGrades && (
                <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 px-2 gap-3">
                  <p className="text-muted small mb-0">
                    Showing {(gradesPage - 1) * gradesEntries + 1} to{" "}
                    {Math.min(gradesPage * gradesEntries, gradesTotalRecords)}{" "}
                    of {gradesTotalRecords} records
                  </p>
                  <nav>
                    <ul className="pagination pagination-sm mb-0 flex-wrap justify-content-end">
                      <li
                        className={`page-item ${gradesPage === 1 ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link page-link-summer"
                          onClick={() =>
                            setGradesPage((prev) => Math.max(prev - 1, 1))
                          }
                        >
                          Previous
                        </button>
                      </li>
                      {renderGradesPageNumbers()}
                      <li
                        className={`page-item ${gradesPage === gradesTotalPages ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link page-link-summer"
                          onClick={() =>
                            setGradesPage((prev) =>
                              Math.min(prev + 1, gradesTotalPages),
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
                onClick={resetForm}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="confirmGradeModal"
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
                  className="bi bi-check-circle-fill"
                  style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark mt-2">
                {isEditingGrade ? "Save Updates" : "Submit Grade"}
              </h4>
              <p className="text-muted mb-0">
                Are you sure you want to submit this grade for Admin Approval?
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
                onClick={() =>
                  new Modal(document.getElementById("gradesModal")).show()
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-campusloop px-4 fw-medium shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={executeSaveGrade}
              >
                {isEditingGrade ? "Yes, Save" : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="confirmAddStudentsModal"
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
                  className="bi bi-person-check-fill"
                  style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark mt-2">Confirm Enrollment</h4>
              <p className="text-muted mb-0">
                Are you sure you want to add the selected{" "}
                <b>
                  {selectedStudentIds.length} selected student
                  {selectedStudentIds.length > 1 ? "s" : ""}
                </b>
                ?
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
                onClick={() =>
                  new Modal(document.getElementById("addStudentsModal")).show()
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-campusloop px-4 fw-medium shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={executeAddStudents}
              >
                Yes, Enroll
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="removeStudentModal"
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
              <h4 className="fw-bold text-dark mt-2">Remove Student</h4>
              <p className="text-muted mb-0">
                Are you sure you want to remove{" "}
                <b>
                  {studentToRemove?.first_name} {studentToRemove?.last_name}
                </b>{" "}
                from this class?
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
                onClick={executeRemoveStudent}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdvisoryDetailsModals;
