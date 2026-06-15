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
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [strandFilter, setStrandFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("az");
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [strands, setStrands] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);
  const [studentGrades, setStudentGrades] = useState([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [selectedGradeId, setSelectedGradeId] = useState(null);
  const [selectedGradeIds, setSelectedGradeIds] = useState([]);
  const [isBulkAction, setIsBulkAction] = useState(false);
  const [declineFeedback, setDeclineFeedback] = useState("");

  useEffect(() => {
    fetchStrands();
  }, []);

  // Reset page kapag nagbago ang search o filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage, strandFilter, genderFilter, sortOrder]);

  // SERVER-SIDE DEBOUNCE EFFECT (500ms)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [
    searchQuery,
    strandFilter,
    genderFilter,
    sortOrder,
    currentPage,
    entriesPerPage,
  ]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/student-grades`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
          params: {
            search: searchQuery,
            strand: strandFilter,
            gender: genderFilter,
            sort: sortOrder,
            page: currentPage,
            entries: entriesPerPage,
          },
        },
      );
      setStudents(res.data.data || []);
      setTotalPages(res.data.last_page || 1);
      setTotalRecords(res.data.total || 0);
    } catch (error) {
      sileo.error({
        title: "Fetch Error",
        description: "Failed to load student records.",
        ...darkToast,
      });
      setStudents([]);
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
    setActiveStudent(student);
    setStudentGrades([]);
    setSelectedGradeIds([]);

    const modalEl = document.getElementById("studentGradesModal");
    if (modalEl) Modal.getOrCreateInstance(modalEl).show();

    setIsLoadingGrades(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/student-grades/${student.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      setStudentGrades(res.data);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Could not fetch grades.",
        ...darkToast,
      });
    } finally {
      setIsLoadingGrades(false);
    }
  };

  const triggerApprove = (gradeId = null) => {
    if (gradeId) {
      setSelectedGradeId(gradeId);
      setIsBulkAction(false);
    } else {
      setIsBulkAction(true);
    }
    Modal.getInstance(document.getElementById("studentGradesModal"))?.hide();
    setTimeout(() => {
      new Modal(document.getElementById("confirmApproveGradeModal")).show();
    }, 400);
  };

  const triggerDecline = (gradeId = null) => {
    if (gradeId) {
      setSelectedGradeId(gradeId);
      setIsBulkAction(false);
    } else {
      setIsBulkAction(true);
    }
    setDeclineFeedback("");
    Modal.getInstance(document.getElementById("studentGradesModal"))?.hide();
    setTimeout(() => {
      new Modal(document.getElementById("confirmDeclineGradeModal")).show();
    }, 400);
  };

  const triggerDelete = (gradeId = null) => {
    if (gradeId) {
      setSelectedGradeId(gradeId);
      setIsBulkAction(false);
    } else {
      setIsBulkAction(true);
    }
    Modal.getInstance(document.getElementById("studentGradesModal"))?.hide();
    setTimeout(() => {
      new Modal(document.getElementById("confirmDeleteGradeModal")).show();
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
    setLoadingText(
      isBulkAction ? "Approving Selected Grades..." : "Approving Grade...",
    );
    Modal.getInstance(
      document.getElementById("confirmApproveGradeModal"),
    )?.hide();

    const payload = isBulkAction
      ? { grade_ids: selectedGradeIds }
      : { grade_id: selectedGradeId };
    const url = isBulkAction
      ? "/admin/student-grades/bulk-approve"
      : "/admin/student-grades/approve";

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}${url}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
        },
      });
      sileo.success({
        title: "Approved",
        description: "Grade record(s) locked successfully.",
        ...darkToast,
      });

      setSelectedGradeIds([]);
      await refreshGrades();
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
    setLoadingText(
      isBulkAction ? "Declining Selected Grades..." : "Declining Grade...",
    );

    const payload = isBulkAction
      ? { grade_ids: selectedGradeIds, feedback: declineFeedback }
      : { grade_id: selectedGradeId, feedback: declineFeedback };
    const url = isBulkAction
      ? "/admin/student-grades/bulk-decline"
      : "/admin/student-grades/decline";

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}${url}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
        },
      });
      sileo.success({
        title: "Declined",
        description: "Grade(s) returned to teacher.",
        ...darkToast,
      });

      setSelectedGradeIds([]);
      await refreshGrades();
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

  const executeDelete = async () => {
    setIsLoading(true);
    setLoadingText(isBulkAction ? "Deleting Records..." : "Deleting Record...");
    Modal.getInstance(
      document.getElementById("confirmDeleteGradeModal"),
    )?.hide();

    try {
      if (isBulkAction) {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/admin/student-grades/bulk-delete`,
          { grade_ids: selectedGradeIds },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
            },
          },
        );
      } else {
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/admin/student-grades/${selectedGradeId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
            },
          },
        );
      }

      sileo.success({
        title: "Deleted",
        description: "Record(s) deleted permanently.",
        ...darkToast,
      });
      setSelectedGradeIds([]);
      await refreshGrades();
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: error.response?.data?.message || "Could not delete grade.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        new Modal(document.getElementById("studentGradesModal")).show();
      }, 400);
    }
  };

  const refreshGrades = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/admin/student-grades/${activeStudent.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
        },
      },
    );
    setStudentGrades(res.data);
    fetchStudents(); // Para ma-update yung global counts
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
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-4 gap-3">
        <div className="flex-grow-1">
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            Final Grade Records <i className="bi bi-award"></i>
          </h3>
          <p className="text-muted small mb-0">
            Review, approve, and lock final grades submitted by teachers.
          </p>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden premium-hover-card">
        <div className="card-body p-0">
          <div className="d-flex flex-nowrap align-items-center gap-3 overflow-x-auto custom-scrollbar p-3">
            <div className="d-flex align-items-center flex-shrink-0 text-muted small">
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
              className="input-group flex-shrink-0"
              style={{ maxWidth: "327px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                placeholder="Search by Name or LRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div
              className="input-group flex-shrink-0"
              style={{ width: "327px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-diagram-3"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
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

            <div
              className="input-group flex-shrink-0"
              style={{ width: "327px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-gender-ambiguous"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
              >
                <option value="all">All Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div
              className="input-group flex-shrink-0"
              style={{ width: "327px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-sort-alpha-down"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="az">Sort A-Z</option>
                <option value="za">Sort Z-A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4 premium-hover-card">
        <div className="table-responsive custom-scrollbar">
          <table
            className="table table-summer align-middle mb-0"
            style={{ minWidth: "1100px" }}
          >
            <thead className="bg-light sticky-top" style={{ zIndex: 10 }}>
              <tr>
                <th
                  className="ps-4"
                  style={{ width: "60px", borderTop: "none" }}
                >
                  #
                </th>
                <th style={{ borderTop: "none" }}>Student Details</th>
                <th style={{ borderTop: "none" }}>LRN</th>
                <th style={{ borderTop: "none" }}>Strand</th>
                <th style={{ borderTop: "none" }}>Gender</th>
                <th className="text-center" style={{ borderTop: "none" }}>
                  Status
                </th>
                <th className="text-center" style={{ borderTop: "none" }}>
                  Encoded Grades
                </th>
                <th
                  className="text-center pe-4"
                  style={{ borderTop: "none", width: "150px" }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student, index) => (
                  <tr key={student.id} className="hover-bg-light">
                    <td className="fw-bold text-muted ps-4 py-2">
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
                          {student.first_name?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <span
                            className="fw-bold text-dark text-truncate d-block mb-1"
                            style={{ maxWidth: "250px" }}
                          >
                            {student.last_name}, {student.first_name}
                          </span>
                          <p
                            className="mb-0 text-muted text-truncate"
                            style={{ fontSize: "0.80rem", maxWidth: "250px" }}
                          >
                            {student.email || "No Email"}
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
                        className="badge border border-dark-subtle bg-opacity-10 text-dark fw-medium text-uppercase rounded-3 px-2 py-1 shadow-sm"
                        style={{ backgroundColor: "var(--accent-color)" }}
                      >
                        {student.strand?.name || "N/A"}
                      </span>
                    </td>

                    <td className="py-2">
                      <span className="text-muted small fw-bold">
                        {student.gender ? student.gender.toUpperCase() : "N/A"}
                      </span>
                    </td>

                    <td className="text-center py-2">
                      {student.has_pending_grades ? (
                        <span
                          className="badge bg-warning bg-opacity-10 text-warning fw-medium border border-warning rounded-3 px-2 py-1 shadow-sm"
                          style={{ fontSize: "0.65rem" }}
                        >
                          Action Needed
                        </span>
                      ) : (
                        <span
                          className="badge bg-success bg-opacity-10 text-success fw-medium border border-success rounded-3 px-2 py-1 shadow-sm"
                          style={{ fontSize: "0.65rem" }}
                        >
                          Cleared
                        </span>
                      )}
                    </td>

                    <td className="text-center py-2">
                      <div className="d-flex flex-column align-items-center justify-content-center">
                        <span className="fw-bolder fs-5 text-primary">
                          {student.grades_count}
                        </span>
                        <span
                          className="text-muted fw-bold d-block text-uppercase"
                          style={{ fontSize: "0.6rem", letterSpacing: "1px" }}
                        >
                          Record{student.grades_count > 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>

                    <td className="text-center pe-4 py-2">
                      <button
                        onClick={() => handleViewGrades(student)}
                        className="btn btn-sm btn-light border-0 shadow-sm me-2 rounded-circle"
                        style={{ width: "35px", height: "35px" }}
                        title="View Grades"
                      >
                        <i
                          className="bi bi-folder-fill"
                          style={{ color: "var(--primary-color)" }}
                        ></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-4 bg-light border-bottom-0">
                    <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
                      <i
                        className="bi bi-inbox text-muted d-block mb-3"
                        style={{ fontSize: "3rem", opacity: 0.5 }}
                      ></i>
                      <h5 className="fw-bold text-dark">No records found.</h5>
                      <p className="text-muted small mb-0">
                        {searchQuery ||
                        strandFilter !== "all" ||
                        genderFilter !== "all"
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

      {totalRecords > 0 && (
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-2 mb-4 gap-3 px-2">
          <span className="text-muted small">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
            {totalRecords} students
          </span>
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

      <AdminStudentGradesModals
        activeStudent={activeStudent}
        studentGrades={studentGrades}
        isLoadingGrades={isLoadingGrades}
        triggerApprove={triggerApprove}
        triggerDecline={triggerDecline}
        triggerDelete={triggerDelete}
        proceedToFeedback={proceedToFeedback}
        executeApprove={executeApprove}
        executeDecline={executeDecline}
        executeDelete={executeDelete}
        declineFeedback={declineFeedback}
        setDeclineFeedback={setDeclineFeedback}
        selectedGradeIds={selectedGradeIds}
        setSelectedGradeIds={setSelectedGradeIds}
        isBulkAction={isBulkAction}
      />
    </>
  );
};

export default AdminStudentGrades;
