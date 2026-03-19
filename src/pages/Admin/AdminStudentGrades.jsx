import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import { Modal } from "bootstrap";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import AdminStudentGradesModals from "./AdminStudentGradesModals";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const AdminStudentGrades = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading Student Records...");

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [strandFilter, setStrandFilter] = useState("all");

  // State para ma-populate yung dropdown ng Strands dynamically
  const [strands, setStrands] = useState([]);

  // States for Modals
  const [activeStudent, setActiveStudent] = useState(null);
  const [studentGrades, setStudentGrades] = useState([]);

  // States for Approve/Decline actions
  const [selectedGradeId, setSelectedGradeId] = useState(null);
  const [declineFeedback, setDeclineFeedback] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchStrands();
  }, []);

  // Reset page pag nagbago search or filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage, strandFilter]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/student-grades`,
      );
      setStudents(res.data);
    } catch (error) {
      sileo.error({
        title: "Fetch Error",
        description: "Failed to load student records.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStrands = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/strands`,
      );
      setStrands(res.data);
    } catch (error) {
      console.error("Failed to fetch strands");
    }
  };

  const handleViewGrades = async (student) => {
    setIsLoading(true);
    setLoadingText("Fetching Grades...");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/student-grades/${student.id}`,
      );
      setStudentGrades(res.data);
      setActiveStudent(student);

      const modal = new Modal(document.getElementById("studentGradesModal"));
      modal.show();
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Could not fetch grades.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerApprove = (gradeId) => {
    setSelectedGradeId(gradeId);

    Modal.getInstance(document.getElementById("studentGradesModal"))?.hide();

    setTimeout(() => {
      new Modal(document.getElementById("confirmApproveGradeModal")).show();
    }, 400);
  };

  const triggerDecline = (gradeId) => {
    setSelectedGradeId(gradeId);
    setDeclineFeedback("");

    Modal.getInstance(document.getElementById("studentGradesModal"))?.hide();

    setTimeout(() => {
      new Modal(document.getElementById("confirmDeclineGradeModal")).show();
    }, 400);
  };

  const proceedToFeedback = () => {
    Modal.getInstance(
      document.getElementById("confirmDeclineGradeModal"),
    )?.hide();
    setTimeout(() => {
      new Modal(document.getElementById("feedbackDeclineGradeModal")).show();
    }, 400);
  };

  const executeApprove = async () => {
    setIsLoading(true);
    setLoadingText("Approving Grade...");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/admin/student-grades/approve`,
        { grade_id: selectedGradeId },
      );
      sileo.success({
        title: "Approved",
        description: "Grade is now locked.",
        ...darkToast,
      });

      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/student-grades/${activeStudent.id}`,
      );
      setStudentGrades(res.data);

      fetchStudents();
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to approve grade.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        new Modal(document.getElementById("studentGradesModal")).show();
      }, 400);
    }
  };

  const executeDecline = async (e) => {
    e.preventDefault();
    Modal.getInstance(
      document.getElementById("feedbackDeclineGradeModal"),
    )?.hide();
    setIsLoading(true);
    setLoadingText("Declining Grade...");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/admin/student-grades/decline`,
        {
          grade_id: selectedGradeId,
          feedback: declineFeedback,
        },
      );
      sileo.success({
        title: "Declined",
        description: "Grade returned to teacher.",
        ...darkToast,
      });

      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/student-grades/${activeStudent.id}`,
      );
      setStudentGrades(res.data);

      fetchStudents();
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to decline grade.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        new Modal(document.getElementById("studentGradesModal")).show();
      }, 400);
    }
  };

  // FILTERING LOGIC
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      `${student.first_name} ${student.last_name} ${student.lrn}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStrand =
      strandFilter === "all" || student.strand_id === strandFilter;
    return matchesSearch && matchesStrand;
  });

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filteredStudents.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = filteredStudents.slice(
    startIndex,
    startIndex + entriesPerPage,
  );

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-4 gap-3">
        <div className="flex-grow-1">
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            Final Grade Records <i className="bi bi-award-fill"></i>
          </h3>
          <p className="text-muted small mb-0">
            Review, approve, and lock final grades submitted by teachers.
          </p>
        </div>
      </div>

      {/* CONTROLS TRAY */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
        <div className="card-body p-4">
          <div className="row g-3 align-items-center">
            {/* SHOW ENTRIES */}
            <div className="col-auto">
              <div className="d-flex align-items-center text-muted small fw-medium">
                Show
                <select
                  className="form-select form-select-sm mx-2 toolbar-input rounded-3 shadow-none"
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
            </div>

            {/* STRAND FILTER */}
            <div className="col-12 col-md-auto ms-xl-auto">
              <div className="input-group" style={{ width: "300px" }}>
                <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                  <i className="bi bi-funnel"></i>
                </span>
                <select
                  className="form-select border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                  value={strandFilter}
                  onChange={(e) => setStrandFilter(e.target.value)}
                >
                  <option value="all">All Strands</option>
                  {strands.map((strand) => (
                    <option key={strand.id} value={strand.id}>
                      {strand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SEARCH BAR */}
            <div className="col-12 col-md-auto">
              <div className="input-group" style={{ width: "300px" }}>
                <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                  placeholder="Search Name or LRN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRID CARDS PARA SA MGA ESTUDYANTE */}
      <div className="row g-4 mb-4">
        {currentData.length > 0 ? (
          currentData.map((student) => (
            <div className="col-md-6 col-xl-4 col-xxl-3" key={student.id}>
              <div className="card h-100 border-0 shadow-sm rounded-4 hover-shadow transition-all bg-white premium-hover-card">
                {/* Header Background */}
                <div
                  className="p-4 position-relative overflow-hidden"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    minHeight: "110px",
                    borderTopLeftRadius: "1rem",
                    borderTopRightRadius: "1rem",
                  }}
                >
                  {/* Decorative Circles */}
                  <div
                    className="position-absolute rounded-circle"
                    style={{
                      width: "100px",
                      height: "100px",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      top: "-20px",
                      right: "-20px",
                    }}
                  ></div>
                  <div
                    className="position-absolute rounded-circle"
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      bottom: "-10px",
                      left: "20%",
                    }}
                  ></div>

                  {/* Header Content */}
                  <div className="pe-5 position-relative z-1">
                    <h4
                      className="fw-bold text-white mb-2"
                      style={{ wordBreak: "break-word" }}
                    >
                      {student.first_name} {student.last_name}
                    </h4>
                    <span className="badge bg-white text-dark bg-opacity-25 px-2 py-1 fw-semibold shadow-sm">
                      <i className="bi bi-person-badge me-1"></i>{" "}
                      {student.lrn || "No LRN"}
                    </span>
                  </div>
                </div>

                {/* Beautified Card Body */}
                <div className="card-body p-4 d-flex flex-column position-relative">
                  <div
                    className="position-absolute shadow-sm rounded-circle d-flex justify-content-center align-items-center fw-bold text-white"
                    style={{
                      width: "45px",
                      height: "45px",
                      top: "-22px",
                      right: "24px",
                      backgroundColor: "var(--secondary-color)",
                      border: "3px solid white",
                      fontSize: "1.2rem",
                    }}
                  >
                    {student.first_name?.charAt(0)}
                  </div>

                  <div className="mb-3 mt-1 flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span
                        className="text-muted text-uppercase mb-0"
                        style={{
                          fontSize: "0.65rem",
                          letterSpacing: "1px",
                          fontWeight: "700",
                        }}
                      >
                        Student Details
                      </span>
                      {student.has_pending_grades && (
                        <span
                          className="badge bg-warning text-dark shadow-sm rounded-pill px-2 py-1"
                          style={{ fontSize: "0.65rem" }}
                        >
                          <i
                            className="bi bi-circle-fill text-danger me-1"
                            style={{
                              fontSize: "0.4rem",
                              verticalAlign: "middle",
                            }}
                          ></i>{" "}
                          Action Needed
                        </span>
                      )}
                    </div>

                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="rounded-circle bg-light d-flex justify-content-center align-items-center me-3 flex-shrink-0"
                        style={{ width: "38px", height: "38px" }}
                      >
                        <i className="bi bi-diagram-3 text-secondary fs-5"></i>
                      </div>
                      <div className="overflow-hidden">
                        <span
                          className="d-block small text-muted fw-bold"
                          style={{ fontSize: "0.65rem" }}
                        >
                          STRAND
                        </span>
                        <span
                          className="d-block text-dark fw-bold small text-truncate"
                          title={student.strand?.name || "N/A"}
                        >
                          {student.strand?.name || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle bg-light d-flex justify-content-center align-items-center me-3 flex-shrink-0"
                        style={{ width: "38px", height: "38px" }}
                      >
                        <i className="bi bi-award text-primary fs-5"></i>
                      </div>
                      <div>
                        <span
                          className="d-block small text-muted fw-bold"
                          style={{ fontSize: "0.65rem" }}
                        >
                          ENCODED GRADES
                        </span>
                        <span className="d-block text-primary fw-bolder small">
                          {student.grades_count} Records
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-top border-light-subtle d-flex gap-2">
                    <button
                      className="btn btn-campusloop fw-bold w-100 rounded-3 shadow-sm d-flex justify-content-center align-items-center"
                      onClick={() => handleViewGrades(student)}
                    >
                      <i className="bi bi-folder2-open me-2"></i> Open Grades
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
              <i
                className="bi bi-inbox text-muted d-block mb-3"
                style={{ fontSize: "3rem", opacity: 0.5 }}
              ></i>
              <h5 className="fw-bold text-dark">No records found.</h5>
              <p className="text-muted small mb-0">
                No matching records found.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {filteredStudents.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-2 mb-4 px-1">
          <span className="text-muted small">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + entriesPerPage, filteredStudents.length)} of{" "}
            {filteredStudents.length} entries
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
              {[...Array(totalPages)].map((_, i) => (
                <li
                  key={i}
                  className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                >
                  <button
                    className="page-link page-link-summer"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
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

      {/* MODALS COMPONENT */}
      <AdminStudentGradesModals
        activeStudent={activeStudent}
        studentGrades={studentGrades}
        triggerApprove={triggerApprove}
        triggerDecline={triggerDecline}
        proceedToFeedback={proceedToFeedback}
        executeApprove={executeApprove}
        executeDecline={executeDecline}
        declineFeedback={declineFeedback}
        setDeclineFeedback={setDeclineFeedback}
      />
    </>
  );
};

export default AdminStudentGrades;
