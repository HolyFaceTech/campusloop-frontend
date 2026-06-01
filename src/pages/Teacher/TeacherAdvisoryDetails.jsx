import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { sileo } from "sileo";
import { Modal } from "bootstrap";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import AdvisoryDetailsModals from "./AdvisoryDetailsModals";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

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

const TeacherAdvisoryDetails = () => {
  const { id } = useParams();
  const [advisoryClass, setAdvisoryClass] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading Class Details...");
  const [students, setStudents] = useState([]);
  const [isFetchingEnrolled, setIsFetchingEnrolled] = useState(false);
  const [searchEnrolled, setSearchEnrolled] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalEnrolled, setTotalEnrolled] = useState(0);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [availableSearch, setAvailableSearch] = useState("");
  const [availableEntries, setAvailableEntries] = useState(10);
  const [availablePage, setAvailablePage] = useState(1);
  const [availableTotalPages, setAvailableTotalPages] = useState(1);
  const [availableTotalRecords, setAvailableTotalRecords] = useState(0);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [activeStudent, setActiveStudent] = useState(null);
  const [studentGrades, setStudentGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [encodedSubjectIds, setEncodedSubjectIds] = useState([]);
  const [isEditingGrade, setIsEditingGrade] = useState(false);
  const [viewingFeedback, setViewingFeedback] = useState(null);

  const [gradeForm, setGradeForm] = useState({
    id: null,
    subject_id: "",
    semester: "1st",
    grade: "",
  });

  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [gradesSearch, setGradesSearch] = useState("");
  const [gradesEntries, setGradesEntries] = useState(10);
  const [gradesPage, setGradesPage] = useState(1);
  const [gradesTotalPages, setGradesTotalPages] = useState(1);
  const [gradesTotalRecords, setGradesTotalRecords] = useState(0);
  const [gradesSyFilter, setGradesSyFilter] = useState("all");
  const [gradesSemFilter, setGradesSemFilter] = useState("all");
  const [gradesUniqueSYs, setGradesUniqueSYs] = useState([]);

  // DEBOUNCE EFFECTS
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAdvisoryDetails();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [id, searchEnrolled, currentPage, entriesPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchEnrolled, entriesPerPage]);

  useEffect(() => {
    if (
      !document.getElementById("addStudentsModal")?.classList.contains("show")
    )
      return;
    const delayDebounceFn = setTimeout(() => {
      fetchAvailableStudents(true);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [availableSearch, availablePage, availableEntries]);

  useEffect(() => {
    setAvailablePage(1);
  }, [availableSearch, availableEntries]);

  useEffect(() => {
    if (!activeStudent) return;
    const delayDebounceFn = setTimeout(() => {
      fetchStudentGrades(activeStudent.id, false);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [
    activeStudent,
    gradesSearch,
    gradesEntries,
    gradesPage,
    gradesSyFilter,
    gradesSemFilter,
  ]);

  useEffect(() => {
    setGradesPage(1);
  }, [gradesSearch, gradesEntries, gradesSyFilter, gradesSemFilter]);

  const fetchAdvisoryDetails = async () => {
    setIsLoading(true);
    setLoadingText("Loading Class Details...");

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/advisory-classes/${id}`,
        {
          ...getAuthHeader(),
          params: {
            search: searchEnrolled,
            page: currentPage,
            entries: entriesPerPage,
          },
        },
      );
      setAdvisoryClass(res.data.advisory);
      setStudents(res.data.students || []);
      setTotalPages(res.data.last_page || 1);
      setTotalRecords(res.data.total || 0);
      setTotalEnrolled(res.data.total_enrolled || 0);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Class not found.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
      setIsFetchingEnrolled(false);
    }
  };

  const fetchAvailableStudents = async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    else setIsLoadingAvailable(true);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/advisory-classes/${id}/available-students`,
        {
          ...getAuthHeader(),
          params: {
            search: availableSearch,
            entries: availableEntries,
            page: availablePage,
          },
        },
      );
      setAvailableStudents(res.data.data || []);
      setAvailableTotalPages(res.data.last_page || 1);
      setAvailableTotalRecords(res.data.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsLoadingAvailable(false);
    }
  };

  const fetchStudentGrades = async (studentId, showGlobalSpinner = true) => {
    if (showGlobalSpinner) setIsLoading(true);
    else setIsLoadingGrades(true);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/advisory-classes/${id}/students/${studentId}/grades`,
        {
          ...getAuthHeader(),
          params: {
            search: gradesSearch,
            entries: gradesEntries,
            page: gradesPage,
            syFilter: gradesSyFilter,
            semFilter: gradesSemFilter,
          },
        },
      );
      setStudentGrades(res.data.data || []);
      setGradesTotalPages(res.data.last_page || 1);
      setGradesTotalRecords(res.data.total || 0);
      setEncodedSubjectIds(res.data.encoded_subject_ids || []);
      setGradesUniqueSYs(res.data.unique_sys || []);
      setSubjects(res.data.allowed_subjects || []);
    } catch (error) {
      sileo.error({
        title: "Fetch Error",
        description: error.response?.data?.message || "Server error.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
      setIsLoadingGrades(false);
    }
  };

  const openAddStudentModal = () => {
    setAvailableSearch("");
    setAvailableEntries(10);
    setAvailablePage(1);
    setSelectedStudentIds([]);
    fetchAvailableStudents(true);
    const modal = new Modal(document.getElementById("addStudentsModal"));
    modal.show();
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((i) => i !== studentId)
        : [...prev, studentId],
    );
  };

  const confirmAddStudents = () => {
    if (selectedStudentIds.length === 0) return;
    Modal.getInstance(document.getElementById("addStudentsModal"))?.hide();
    setTimeout(() => {
      new Modal(document.getElementById("confirmAddStudentsModal")).show();
    }, 400);
  };

  const executeAddStudents = async () => {
    setIsLoading(true);
    setLoadingText("Adding students...");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/advisory-classes/${id}/add-students`,
        { student_ids: selectedStudentIds },
        getAuthHeader(),
      );
      sileo.success({
        title: "Success",
        description: "Students added.",
        ...darkToast,
      });
      fetchAdvisoryDetails();
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: error.response?.data?.message || "Could not add.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerRemoveStudent = (student) => {
    setStudentToRemove(student);
    const modal = new Modal(document.getElementById("removeStudentModal"));
    modal.show();
  };

  const executeRemoveStudent = async () => {
    setIsLoading(true);
    setLoadingText("Removing student...");
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/advisory-classes/${id}/students/${studentToRemove.id}`,
        getAuthHeader(),
      );
      sileo.success({
        title: "Removed",
        description: "Student removed.",
        ...darkToast,
      });
      fetchAdvisoryDetails(true);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to remove student.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openGradesModal = (student) => {
    setActiveStudent(student);
    setIsEditingGrade(false);
    setViewingFeedback(null);
    setGradeForm({ id: null, subject_id: "", semester: "1st", grade: "" });
    setGradesSearch("");
    setGradesEntries(10);
    setGradesPage(1);
    setGradesSyFilter("all");
    setGradesSemFilter("all");
    fetchStudentGrades(student.id, false);
    const modal = new Modal(document.getElementById("gradesModal"));
    modal.show();
  };

  const handleGradeSubmit = (e) => {
    e.preventDefault();
    if (document.activeElement) document.activeElement.blur();
    Modal.getInstance(document.getElementById("gradesModal"))?.hide();
    setTimeout(() => {
      new Modal(document.getElementById("confirmGradeModal")).show();
    }, 400);
  };

  const executeSaveGrade = async () => {
    setIsLoading(true);
    setLoadingText("Saving Grade...");
    try {
      if (isEditingGrade && gradeForm.id) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/advisory-classes/${id}/students/${activeStudent.id}/grades/${gradeForm.id}`,
          gradeForm,
          getAuthHeader(),
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/advisory-classes/${id}/students/${activeStudent.id}/grades`,
          gradeForm,
          getAuthHeader(),
        );
      }
      sileo.success({
        title: "Grade Saved",
        description: "Grade submitted.",
        ...darkToast,
      });
      fetchStudentGrades(activeStudent.id, false);
      setIsEditingGrade(false);
      setGradeForm({ id: null, subject_id: "", semester: "1st", grade: "" });
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: error.response?.data?.message || "Invalid input.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        new Modal(document.getElementById("gradesModal")).show();
      }, 400);
    }
  };

  const classCapacity = advisoryClass?.capacity || 0;
  const isClassFull = totalEnrolled >= classCapacity;

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
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="card bg-white border-0 shadow-sm rounded-4 mb-4 overflow-hidden position-relative premium-hover-card">
        <div className="card-body p-4 p-md-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-4">
            <div className="flex-grow-1" style={{ maxWidth: "800px" }}>
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  className="rounded-circle text-white d-flex justify-content-center align-items-center shadow-sm flex-shrink-0"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "var(--primary-color)",
                  }}
                >
                  <i className="bi bi-people-fill fs-4"></i>
                </div>
                <h2
                  className="fw-bolder text-dark mb-0"
                  style={{ letterSpacing: "-0.5px" }}
                >
                  {advisoryClass?.section}
                </h2>
              </div>
              <p
                className="text-muted mt-3 mb-0"
                style={{
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                }}
              >
                Manage your homeroom students, monitor class records, and input
                final grades for admin review.
              </p>
            </div>

            <button
              onClick={openAddStudentModal}
              disabled={isClassFull}
              className={`btn ${isClassFull ? "btn-secondary-outlined opacity-75" : "btn-campusloop shadow-sm"} px-4 py-2 rounded-3 d-flex align-items-center gap-2 fw-medium flex-shrink-0 transition-all justify-content-center`}
            >
              {isClassFull ? (
                <>
                  <i className="bi bi-lock-fill"></i> Class Full
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus-fill"></i> Add Students
                </>
              )}
            </button>
          </div>
          <hr className="opacity-10 my-4" />
          <div className="d-flex flex-wrap justify-content-center gap-4 gap-md-4 align-items-center bg-light p-3 rounded-4 border border-light-subtle">
            <div className="d-flex align-items-center gap-3 pe-md-4 border-end-md">
              <div
                className="rounded-circle bg-white shadow-sm d-flex justify-content-center align-items-center flex-shrink-0"
                style={{ width: "40px", height: "40px" }}
              >
                <i className="bi bi-calendar-event text-primary fs-5"></i>
              </div>
              <div>
                <span
                  className="d-block small text-muted fw-bold mb-0"
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  School Year
                </span>
                <span className="d-block text-dark small fw-bolder">
                  {advisoryClass?.school_year || "..."}
                </span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3 pe-md-4">
              <div
                className="rounded-circle bg-white shadow-sm d-flex justify-content-center align-items-center flex-shrink-0"
                style={{ width: "40px", height: "40px" }}
              >
                <i
                  className={`bi bi-person-bounding-box ${isClassFull ? "text-danger" : "text-success"} fs-5`}
                ></i>
              </div>
              <div>
                <span
                  className="d-block small text-muted fw-bold mb-0"
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Capacity
                </span>
                <span
                  className={`badge ${isClassFull ? "bg-danger text-danger border-danger" : "bg-success text-success border-success"} bg-opacity-10 border border-opacity-25 mt-1 px-2 py-1 fw-medium shadow-sm`}
                >
                  {totalEnrolled} / {classCapacity} Enrolled
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-3 bg-white overflow-hidden premium-hover-card">
        <div className="card-body p-0">
          <div className="d-flex flex-nowrap align-items-center justify-content-between overflow-x-auto custom-scrollbar p-3 gap-3">
            <div className="d-flex align-items-center flex-shrink-0 text-muted small pe-2">
              Show
              <select
                className="form-select form-select-sm mx-2 toolbar-input rounded-3"
                style={{ width: "70px" }}
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
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
                placeholder="Search Name, Email, or LRN..."
                value={searchEnrolled}
                onChange={(e) => setSearchEnrolled(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4 premium-hover-card">
        <div className="table-responsive custom-scrollbar">
          <table
            className="table table-summer align-middle mb-0"
            style={{ minWidth: "1000px" }}
          >
            <thead style={{ backgroundColor: "#F5ECD5" }}>
              <tr>
                <th className="ps-4" style={{ width: "60px" }}>
                  #
                </th>
                <th style={{ borderTop: "none" }}>STUDENT DETAILS</th>
                <th style={{ borderTop: "none" }}>LRN</th>
                <th style={{ borderTop: "none" }}>STRAND</th>
                <th style={{ borderTop: "none" }}>GENDER</th>
                <th
                  className="text-center pe-4"
                  style={{ borderTop: "none", width: "150px" }}
                >
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student, index) => (
                  <tr key={student.id}>
                    <td className="ps-4 fw-bold text-muted py-2">
                      {(currentPage - 1) * entriesPerPage + index + 1}
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
                          {student.first_name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <span
                            className="fw-bold text-dark text-truncate d-block mb-1"
                            style={{ maxWidth: "250px" }}
                          >
                            {student.first_name} {student.last_name}
                          </span>
                          <p
                            className="mb-0 text-muted text-truncate"
                            style={{ fontSize: "0.80rem", maxWidth: "250px" }}
                          >
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2">
                      <span
                        className="d-block fw-bold font-monospace text-dark tracking-wide"
                        style={{ fontSize: "0.90rem" }}
                      >
                        <i className="bi bi-123 me-1 text-muted"></i>{" "}
                        {student.lrn || "N/A"}
                      </span>
                    </td>
                    <td className="py-2">
                      <span
                        className="badge bg-opacity-10 text-dark fw-medium text-uppercase rounded-3 px-2 py-1 border border-dark-subtle shadow-sm"
                        style={{ backgroundColor: "var(--accent-color)" }}
                      >
                        {student.strand?.name || "N/A"}
                      </span>
                    </td>
                    <td className="text-muted small fw-bold py-2">
                      {student.gender ? student.gender.toUpperCase() : "N/A"}
                    </td>
                    <td className="text-center py-2">
                      <button
                        onClick={() => openGradesModal(student)}
                        className="btn btn-sm btn-light border-0 shadow-sm me-2 rounded-circle"
                        style={{ width: "35px", height: "35px" }}
                        title="Manage Grades"
                      >
                        <i
                          className="bi bi-journal-check"
                          style={{ color: "var(--primary-color)" }}
                        ></i>
                      </button>
                      <button
                        onClick={() => triggerRemoveStudent(student)}
                        className="btn btn-sm btn-light border-0 shadow-sm rounded-circle"
                        style={{ width: "35px", height: "35px" }}
                        title="Remove Student"
                      >
                        <i className="bi bi-trash-fill text-danger"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-4 bg-light border-bottom-0">
                    <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
                      <i
                        className="bi bi-inbox text-muted d-block mb-3"
                        style={{ fontSize: "3rem", opacity: 0.5 }}
                      ></i>
                      <h5 className="fw-bold text-dark">
                        {searchEnrolled
                          ? "No matching records found."
                          : "No students enrolled yet."}
                      </h5>
                      <p className="text-muted small mb-0">
                        {searchEnrolled
                          ? "Try adjusting your search query."
                          : "Click the 'Add Students' button to enroll students in this class."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalRecords > 0 && !isFetchingEnrolled && (
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-2 mb-4 px-1">
          <span className="text-muted small">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
            {totalRecords} entries
          </span>
          <nav>
            <ul className="pagination pagination-sm mb-0">
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
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      <AdvisoryDetailsModals
        selectedStudentIds={selectedStudentIds}
        toggleStudentSelection={toggleStudentSelection}
        confirmAddStudents={confirmAddStudents}
        executeAddStudents={executeAddStudents}
        studentToRemove={studentToRemove}
        executeRemoveStudent={executeRemoveStudent}
        activeStudent={activeStudent}
        isEditingGrade={isEditingGrade}
        setIsEditingGrade={setIsEditingGrade}
        handleGradeSubmit={handleGradeSubmit}
        executeSaveGrade={executeSaveGrade}
        subjects={subjects}
        studentGrades={studentGrades}
        gradeForm={gradeForm}
        setGradeForm={setGradeForm}
        viewingFeedback={viewingFeedback}
        setViewingFeedback={setViewingFeedback}
        encodedSubjectIds={encodedSubjectIds}
        isLoadingGrades={isLoadingGrades}
        gradesSearch={gradesSearch}
        setGradesSearch={setGradesSearch}
        gradesEntries={gradesEntries}
        setGradesEntries={setGradesEntries}
        gradesPage={gradesPage}
        setGradesPage={setGradesPage}
        gradesTotalPages={gradesTotalPages}
        gradesTotalRecords={gradesTotalRecords}
        gradesSyFilter={gradesSyFilter}
        setGradesSyFilter={setGradesSyFilter}
        gradesSemFilter={gradesSemFilter}
        setGradesSemFilter={setGradesSemFilter}
        gradesUniqueSYs={gradesUniqueSYs}
        availableStudents={availableStudents}
        isLoadingAvailable={isLoadingAvailable}
        availableSearch={availableSearch}
        setAvailableSearch={setAvailableSearch}
        availableEntries={availableEntries}
        setAvailableEntries={setAvailableEntries}
        availablePage={availablePage}
        setAvailablePage={setAvailablePage}
        availableTotalPages={availableTotalPages}
        availableTotalRecords={availableTotalRecords}
      />
    </>
  );
};

export default TeacherAdvisoryDetails;
