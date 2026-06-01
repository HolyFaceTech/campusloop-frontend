import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const getAuthHeader = () => {
  const token =
    localStorage.getItem("campusloop_token") ||
    sessionStorage.getItem("campusloop_token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };
};

const ClassroomFormDrawer = ({
  drawerMode,
  formData,
  handleInputChange,
  handleScheduleChange,
  handleSubmit,
  executeDelete,
  proceedToUpdate,
  selectedItem,
}) => {
  const [strands, setStrands] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const subjectDropdownRef = useRef(null);
  const [subjectSearchQuery, setSubjectSearchQuery] = useState("");
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  useEffect(() => {
    fetchStrandsAndSubjects();
  }, []);

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

  const fetchStrandsAndSubjects = async () => {
    try {
      const strandRes = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/strands`,
        getAuthHeader(),
      );
      const subjectRes = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/subjects`,
        getAuthHeader(),
      );
      setStrands(strandRes.data?.data || strandRes.data || []);
      setSubjects(subjectRes.data?.data || subjectRes.data || []);
    } catch (error) {
      console.error("Failed to load options.");
    }
  };

  const safeSubjects = Array.isArray(subjects) ? subjects : [];
  const filteredSubjects = safeSubjects.filter(
    (sub) =>
      String(sub.strand_id) === String(formData.strand_id) &&
      String(sub.grade_level) === String(formData.grade_level),
  );

  const searchedSubjects = filteredSubjects.filter((subj) =>
    `${subj.code} ${subj.description}`
      .toLowerCase()
      .includes(subjectSearchQuery.toLowerCase()),
  );

  const selectedSubjectObj = filteredSubjects.find(
    (s) => String(s.id) === String(formData.subject_id),
  );

  const subjectDisplayValue = showSubjectDropdown
    ? subjectSearchQuery
    : selectedSubjectObj
      ? `${selectedSubjectObj.code} - ${selectedSubjectObj.description}`
      : "";

  const daysOfWeek = [
    { id: "Mon", label: "M" },
    { id: "Tue", label: "T" },
    { id: "Wed", label: "W" },
    { id: "Thu", label: "TH" },
    { id: "Fri", label: "F" },
    { id: "Sat", label: "S" },
  ];

  const safeSchedule = formData.schedule || {
    days: [],
    start_time: "",
    end_time: "",
  };
  const safeDays = Array.isArray(safeSchedule.days) ? safeSchedule.days : [];

  return (
    <>
      <div
        className="offcanvas offcanvas-end shadow-lg border-0"
        tabIndex="-1"
        id="classroomDrawer"
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
            {drawerMode === "create" ? (
              <>
                <i className="bi bi-easel2-fill me-2 fs-4"></i> Create New
                Classroom
              </>
            ) : (
              <>
                <i className="bi bi-pencil-square me-2 fs-4"></i> Update
                Classroom
              </>
            )}
          </h5>
          <button
            type="button"
            className="btn-close shadow-none"
            data-bs-dismiss="offcanvas"
          ></button>
        </div>

        <div className="offcanvas-body custom-scrollbar p-4 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="row g-4">
              <div className="col-12">
                <h6
                  className="fw-bold text-muted mb-0 border-bottom pb-2"
                  style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                >
                  CLASSROOM DETAILS
                </h6>
              </div>
              <div className="col-12">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-door-open me-1 text-muted"></i> Classroom
                  Section
                </label>
                <input
                  type="text"
                  className="form-control bg-light toolbar-input"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  autoFocus
                  required
                  placeholder="e.g. Newton"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-journal-text me-1 text-muted"></i> Select
                  Strand
                </label>
                <select
                  className="form-select bg-light toolbar-input"
                  name="strand_id"
                  value={formData.strand_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Choose Strand</option>
                  {strands.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-bar-chart-steps me-1 text-muted"></i>{" "}
                  Grade Level
                </label>
                <select
                  className="form-select bg-light toolbar-input"
                  name="grade_level"
                  value={formData.grade_level}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Choose Grade</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </select>
              </div>

              <div
                className="col-12 position-relative"
                ref={subjectDropdownRef}
                style={{ zIndex: 1050 }}
              >
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-book-half me-1 text-muted"></i> Classroom
                  Subject
                </label>
                <div className="input-group shadow-sm">
                  <input
                    type="text"
                    className="form-control bg-light toolbar-input border-end-0 text-truncate"
                    placeholder={
                      !formData.strand_id || !formData.grade_level
                        ? "Select Strand & Grade first"
                        : "Search subject..."
                    }
                    value={subjectDisplayValue}
                    disabled={!formData.strand_id || !formData.grade_level}
                    onChange={(e) => {
                      setSubjectSearchQuery(e.target.value);
                      setShowSubjectDropdown(true);
                      if (formData.subject_id) {
                        handleInputChange({
                          target: { name: "subject_id", value: "" },
                        });
                      }
                    }}
                    onClick={() => {
                      if (formData.strand_id && formData.grade_level) {
                        setShowSubjectDropdown(true);
                        setSubjectSearchQuery("");
                      }
                    }}
                    style={{
                      cursor:
                        formData.strand_id && formData.grade_level
                          ? "text"
                          : "not-allowed",
                    }}
                  />
                  <span
                    className="input-group-text bg-light border-start-0 text-muted"
                    style={{
                      cursor:
                        formData.strand_id && formData.grade_level
                          ? "pointer"
                          : "not-allowed",
                    }}
                    onClick={() => {
                      if (formData.strand_id && formData.grade_level) {
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
                  value={formData.subject_id || ""}
                  onChange={() => {}}
                  className="position-absolute"
                  style={{ opacity: 0, zIndex: -1, bottom: 10, left: "50%" }}
                  title="Please select a subject from the dropdown."
                />

                <ul
                  className={`dropdown-menu shadow-lg border border-light-subtle rounded-4 custom-scrollbar p-2 ${showSubjectDropdown ? "show" : ""}`}
                  style={{
                    width: "100%",
                    left: 0,
                    right: 0,
                    maxHeight: "260px",
                    overflowY: "auto",
                    position: "absolute",
                    top: "100%",
                    zIndex: 1050,
                    marginTop: "0.5rem",
                  }}
                >
                  {searchedSubjects.length > 0 ? (
                    searchedSubjects.map((subj) => {
                      const isSelected =
                        String(formData.subject_id) === String(subj.id);
                      const subjectStrand = strands.find(
                        (s) => String(s.id) === String(subj.strand_id),
                      );
                      const strandName = subjectStrand
                        ? subjectStrand.name
                        : subj.strand_name || "Core";

                      return (
                        <li key={subj.id} className="mb-1">
                          <button
                            type="button"
                            className={`dropdown-item py-2 px-3 rounded-3 transition-all d-flex justify-content-between align-items-center ${isSelected ? "bg-primary text-white shadow-sm" : "hover-bg-light text-dark"}`}
                            onClick={() => {
                              handleInputChange({
                                target: { name: "subject_id", value: subj.id },
                              });
                              setShowSubjectDropdown(false);
                              setSubjectSearchQuery("");
                            }}
                          >
                            <div className="d-flex flex-column text-start overflow-hidden pe-2">
                              <span
                                className="fw-bold d-block font-monospace"
                                style={{ fontSize: "0.85rem" }}
                              >
                                {subj.code}
                              </span>
                              <span
                                className={`fst-italic small text-truncate ${isSelected ? "text-white opacity-75" : "text-muted"}`}
                                style={{
                                  fontSize: "0.75rem",
                                  maxWidth: "180px",
                                }}
                              >
                                {subj.description}
                              </span>
                            </div>

                            <div className="flex-shrink-0 ms-2">
                              <span
                                className={`badge ${isSelected ? "bg-white text-primary" : "bg-opacity-10 text-dark border border-dark-subtle"} rounded-3 px-2 py-1 fw-medium`}
                                style={{
                                  fontSize: "0.65rem",
                                  letterSpacing: "0.5px",
                                  backgroundColor: isSelected
                                    ? ""
                                    : "var(--accent-color)",
                                }}
                              >
                                {strandName}
                              </span>
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

              <div className="col-12 mt-4">
                <h6
                  className="fw-bold text-muted mb-0 border-bottom pb-2"
                  style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                >
                  CAPACITY & SCHEDULE
                </h6>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-people me-1 text-muted"></i> Capacity
                </label>
                <input
                  type="number"
                  className="form-control bg-light toolbar-input"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  placeholder="e.g. 40"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-palette me-1 text-muted"></i> Header Color
                </label>
                <input
                  type="color"
                  className="form-control form-control-color w-100 p-1 bg-light border-0 shadow-sm"
                  name="color_bg"
                  value={formData.color_bg}
                  onChange={handleInputChange}
                  required
                  style={{ height: "38px", cursor: "pointer" }}
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-calendar-day me-1 text-muted"></i> Select
                  Days
                </label>
                <div className="d-flex gap-2">
                  {daysOfWeek.map((day) => {
                    const isSelected = safeDays.includes(day.id);
                    return (
                      <div key={day.id}>
                        <input
                          type="checkbox"
                          className="btn-check"
                          id={`day-${day.id}`}
                          checked={isSelected}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const newDays = checked
                              ? [...safeDays, day.id]
                              : safeDays.filter((d) => d !== day.id);
                            handleScheduleChange("days", newDays);
                          }}
                        />
                        <label
                          className={`btn rounded-circle fw-bold d-flex align-items-center justify-content-center ${isSelected ? "btn-campusloop shadow-sm" : "btn-light border text-muted"}`}
                          htmlFor={`day-${day.id}`}
                          style={{ width: "40px", height: "40px", padding: 0 }}
                        >
                          {day.label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-clock me-1 text-muted"></i> Time Start
                </label>
                <input
                  type="time"
                  className="form-control bg-light toolbar-input"
                  value={safeSchedule.start_time}
                  onChange={(e) =>
                    handleScheduleChange("start_time", e.target.value)
                  }
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-clock-history me-1 text-muted"></i> Time
                  End
                </label>
                <input
                  type="time"
                  className="form-control bg-light toolbar-input"
                  value={safeSchedule.end_time}
                  onChange={(e) =>
                    handleScheduleChange("end_time", e.target.value)
                  }
                  required
                />
              </div>
            </div>
            <div className="mt-5 pt-3 border-top">
              <button
                type="submit"
                className="btn btn-campusloop w-100 rounded-3 shadow-sm d-flex justify-content-center align-items-center"
              >
                {drawerMode === "create" ? (
                  <>
                    <i className="bi bi-plus-circle-fill me-2"></i> Create
                    Classroom
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
                  className="bi bi-pencil-fill"
                  style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark">Edit Classroom</h4>
              <p className="text-muted mb-0">
                You are about to edit the records of{" "}
                <b>{selectedItem?.subject?.description}</b>. Do you want to
                proceed to the update form?
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
                onClick={proceedToUpdate}
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
              <h4 className="fw-bold text-dark">Delete Classroom</h4>
              <p className="text-muted mb-0">
                Are you sure you want to move{" "}
                <b>{selectedItem?.subject?.description}</b> to the recycle bin?
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

export default ClassroomFormDrawer;
