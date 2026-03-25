import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import GlobalSpinner from "../../../components/Shared/GlobalSpinner";

const TabGrades = () => {
  const { classroom } = useOutletContext();
  const [students, setStudents] = useState([]);
  const [classworks, setClassworks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    if (classroom) fetchGradesData();
  }, [classroom]);

  // Reset sa Page 1 kapag nag-search o nagpalit ng entries limit
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage]);

  const fetchGradesData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/classrooms/${classroom.id}/grades`,
      );
      setClassworks(res.data.classworks);
      setStudents(res.data.students);
    } catch (error) {
      console.error("Error fetching grades data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeDisplay = (type) => {
    switch (type) {
      case "assignment":
        return {
          icon: "bi-journal-code",
          color: "text-primary",
          bg: "bg-primary",
        };
      case "activity":
        return {
          icon: "bi-person-workspace",
          color: "text-success",
          bg: "bg-success",
        };
      case "quiz":
        return {
          icon: "bi-ui-checks",
          color: "text-warning",
          bg: "bg-warning",
        };
      case "exam":
        return {
          icon: "bi-file-earmark-check",
          color: "text-danger",
          bg: "bg-danger",
        };
      default:
        return {
          icon: "bi-journal-text",
          color: "text-secondary",
          bg: "bg-secondary",
        };
    }
  };

  const getStudentGrade = (student, cw) => {
    const submission = student.submissions?.find(
      (s) => s.classwork_id === cw.id,
    );

    if (!submission) {
      return (
        <span className="text-muted fw-light" style={{ opacity: 0.3 }}>
          —
        </span>
      );
    }

    if (submission.status === "graded") {
      return (
        <div className="d-flex align-items-center justify-content-center">
          <span
            className="fw-bold text-dark"
            style={{ fontSize: "1.1rem", lineHeight: "1" }}
          >
            {submission.grade}
          </span>
        </div>
      );
    }

    if (submission.status === "missing") {
      return (
        <span
          className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-1 rounded-pill fw-medium"
          style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}
        >
          Missing
        </span>
      );
    }

    if (
      submission.status === "pending" ||
      submission.status === "late_submission"
    ) {
      return (
        <span
          className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-1 rounded-pill fw-medium"
          style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}
        >
          Turned In
        </span>
      );
    }

    return <span className="text-muted fw-light">—</span>;
  };

  // LOGIC PARA SA SEARCH & PAGINATION
  const filteredStudents = students.filter((s) => {
    return `${s.first_name} ${s.last_name} ${s.lrn}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredStudents.length / entriesPerPage);

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text="Loading Class Record..." />

      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
        <div className="card-body p-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 w-100">
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

            <div className="input-group" style={{ maxWidth: "350px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                placeholder="Search Student Name or LRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        <div
          className="table-responsive custom-scrollbar"
          style={{ maxHeight: "650px" }}
        >
          <table
            className="table table-summer align-middle mb-0"
            style={{ minWidth: "100%" }}
          >
            <thead className="bg-light sticky-top" style={{ zIndex: 10 }}>
              <tr>
                <th
                  className="py-3 px-3 text-center border-bottom border-end align-middle bg-light"
                  style={{ width: "60px", borderTop: "none" }}
                >
                  #
                </th>

                {/* STICKY COLUMN FOR STUDENT DETAILS */}
                <th
                  className="py-3 px-4 border-bottom align-middle bg-light"
                  style={{
                    minWidth: "320px",
                    position: "sticky",
                    left: 0,
                    zIndex: 11,
                    borderRight: "2px solid #eaecf0",
                    boxShadow: "4px 0 8px rgba(0,0,0,0.03)",
                  }}
                >
                  Student Details
                </th>

                {classworks.length === 0 ? (
                  <th className="py-4 text-center text-muted fw-normal border-bottom border-end bg-light">
                    No gradable classworks yet.
                  </th>
                ) : (
                  classworks.map((cw) => {
                    const display = getTypeDisplay(cw.type);
                    return (
                      <th
                        key={cw.id}
                        className="py-3 px-3 border-bottom border-end bg-light align-middle"
                        style={{ minWidth: "180px" }}
                      >
                        <div className="d-flex flex-column align-items-center justify-content-center w-100">
                          <div className="d-flex align-items-center justify-content-center gap-2 mb-2 w-100">
                            <i
                              className={`bi ${display.icon} ${display.color}`}
                              style={{ fontSize: "1.1rem" }}
                            ></i>
                            <span
                              className="text-dark fw-bold text-truncate"
                              style={{
                                fontSize: "0.85rem",
                                letterSpacing: "0.3px",
                                maxWidth: "120px",
                              }}
                              title={cw.title}
                            >
                              {cw.title}
                            </span>
                          </div>
                          <div className="d-flex align-items-center justify-content-center gap-2 text-muted">
                            <span
                              className="badge bg-white text-dark border fw-semibold shadow-sm"
                              style={{
                                fontSize: "0.65rem",
                                padding: "0.25rem 0.4rem",
                              }}
                            >
                              {cw.points ? `${cw.points} PTS` : "NO PTS"}
                            </span>
                            <i
                              className="bi bi-dot opacity-50"
                              style={{ fontSize: "0.5rem" }}
                            ></i>
                            <span
                              className="font-monospace"
                              style={{ fontSize: "0.68rem" }}
                            >
                              {new Date(cw.created_at).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" },
                              )}
                            </span>
                          </div>
                        </div>
                      </th>
                    );
                  })
                )}
              </tr>
            </thead>

            <tbody>
              {currentStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={classworks.length + 2}
                    className="text-center py-5 text-muted bg-white"
                  >
                    <i className="bi bi-inbox fs-1 d-block mb-3 opacity-25"></i>
                    <span className="fw-medium">No student records found.</span>
                  </td>
                </tr>
              ) : (
                currentStudents.map((student, index) => (
                  <tr key={student.id} className="hover-bg-light">
                    <td
                      className="text-center fw-medium text-muted border-end bg-white"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {indexOfFirstItem + index + 1}
                    </td>

                    {/* STICKY DATA FOR STUDENT NAME */}
                    <td
                      className="px-4 py-3 bg-white"
                      style={{
                        position: "sticky",
                        left: 0,
                        zIndex: 1,
                        borderRight: "2px solid #eaecf0",
                        boxShadow: "4px 0 8px rgba(0,0,0,0.02)",
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold me-3 shadow-sm flex-shrink-0"
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: "var(--secondary-color)",
                            fontSize: "1.1rem",
                          }}
                        >
                          {student.first_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span
                            className="fw-bold text-dark d-block text-truncate"
                            style={{ fontSize: "0.95rem" }}
                          >
                            {student.first_name} {student.last_name}
                          </span>
                          <span
                            className="text-muted small d-block font-monospace tracking-wide mt-1"
                            style={{ fontSize: "0.75rem" }}
                          >
                            LRN: {student.lrn || "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* DYNAMIC GRADES CELLS */}
                    {classworks.length === 0 ? (
                      <td className="text-center bg-white border-end"></td>
                    ) : (
                      classworks.map((cw) => (
                        <td
                          key={cw.id}
                          className="text-center align-middle border-end bg-white py-3 hover-bg-light"
                        >
                          {getStudentGrade(student, cw)}
                        </td>
                      ))
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredStudents.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
          <p className="text-muted small mb-0">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredStudents.length)} of{" "}
            {filteredStudents.length} entries
          </p>
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
    </>
  );
};

export default TabGrades;
