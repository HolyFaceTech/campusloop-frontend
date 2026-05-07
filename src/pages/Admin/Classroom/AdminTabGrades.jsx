import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import GlobalSpinner from "../../../components/Shared/GlobalSpinner";

const AdminTabGrades = () => {
  const { classroom } = useOutletContext();
  const [students, setStudents] = useState([]);
  const [classworks, setClassworks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Reset sa Page 1 kapag nag-search o nagpalit ng entries limit
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage]);

  // SERVER-SIDE DEBOUNCE EFFECT
  useEffect(() => {
    if (classroom && classroom.id) {
      const delayDebounceFn = setTimeout(() => {
        fetchGradesData();
      }, 500); // 500ms delay

      return () => clearTimeout(delayDebounceFn);
    }
  }, [classroom?.id, searchQuery, currentPage, entriesPerPage]);

  const fetchGradesData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/classrooms/${classroom.id}/grades`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
          params: {
            search: searchQuery,
            page: currentPage,
            entries: entriesPerPage,
          },
        },
      );

      const data = res.data;
      setClassworks(data.classworks || []);
      setStudents(data.students || []);
      setTotalPages(data.last_page || 1);
      setTotalRecords(data.total || 0);
    } catch (error) {
      console.error("Error fetching grades data", error);
      const errorMessage =
        error.response?.data?.message ||
        "An unexpected error occurred while loading grades.";
      alert("System Error: \n\n" + errorMessage);
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
    // Hanapin kung may submission yung student sa specific na classwork
    const submission = student.submissions?.find(
      (s) => s.classwork_id === cw.id,
    );

    // I-setup ang time logic para sa Late at Missing
    const hasDeadline = cw.deadline ? true : false;
    const deadlineTime = hasDeadline ? new Date(cw.deadline).getTime() : null;
    const submitTime =
      submission && submission.submitted_at
        ? new Date(submission.submitted_at).getTime()
        : null;
    const currentTime = new Date().getTime();

    // I-define ang mga status boolean variables (katulad sa Respondents Modal)
    // Naglalagay ang backend natin ng status = 'missing' kapag lagpas na deadline.
    const hasSubmission = submission && submission.status !== "missing";
    const isGraded =
      hasSubmission &&
      submission.grade !== null &&
      submission.grade !== undefined;
    const isReturned =
      hasSubmission &&
      !isGraded &&
      (submission.teacher_feedback || submission.status === "returned");
    const isDoneLate =
      hasDeadline && hasSubmission && submitTime > deadlineTime;
    const isMissing =
      submission?.status === "missing" ||
      (hasDeadline && !hasSubmission && currentTime > deadlineTime);

    // RENDER BADGES BATAY SA STATUS HIERARCHY
    if (isGraded) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center">
          <span
            className="fw-bold text-dark"
            style={{ fontSize: "1.1rem", lineHeight: "1" }}
          >
            {submission.grade}
          </span>
          {isDoneLate && (
            <span
              className="badge bg-warning bg-opacity-10 border border-warning border-opacity-25 text-warning fw-medium mt-1 rounded-3"
              style={{ fontSize: "0.6rem" }}
            >
              Done Late
            </span>
          )}
        </div>
      );
    }

    if (isReturned) {
      return (
        <span
          className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-1 rounded-3 fw-medium"
          style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}
        >
          Returned
        </span>
      );
    }

    if (isDoneLate) {
      return (
        <span
          className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-1 rounded-3 fw-medium"
          style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}
        >
          Done Late
        </span>
      );
    }

    if (hasSubmission) {
      return (
        <span
          className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1 rounded-3 fw-medium"
          style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}
        >
          Turned In
        </span>
      );
    }

    if (isMissing) {
      return (
        <span
          className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-1 rounded-3 fw-medium"
          style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}
        >
          Missing
        </span>
      );
    }

    // Default status kung wala pang pinapasa at hindi pa lumalagpas ang deadline
    return (
      <span
        className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-3 py-1 rounded-3 fw-medium"
        style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}
      >
        Pending
      </span>
    );
  };

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text="Loading Class Record..." />

      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
        <div className="card-body p-0">
          <div className="d-flex flex-nowrap align-items-center justify-content-between gap-3 overflow-x-auto custom-scrollbar p-3">
            {/* LEFT SIDE: Show Entries */}
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

            {/* RIGHT SIDE: Search Bar */}
            <div
              className="input-group flex-shrink-0"
              style={{ maxWidth: "350px", minWidth: "280px" }}
            >
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
                              className="text-dark fw-semibold "
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
                                {
                                  year: "numeric",
                                  month: "numeric",
                                  day: "numeric",
                                },
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
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={classworks.length + 2}
                    className="p-4 bg-light border-bottom-0"
                  >
                    <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
                      <i
                        className="bi bi-inbox text-muted d-block mb-3"
                        style={{ fontSize: "3rem", opacity: 0.5 }}
                      ></i>
                      <h5 className="fw-bold text-dark">No records found.</h5>
                      <p className="text-muted small mb-0">
                        {searchQuery
                          ? "No matching students for your search."
                          : "There are no students enrolled in this classroom yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((student, index) => (
                  <tr key={student.id} className="hover-bg-light">
                    <td
                      className="text-center fw-medium text-muted border-end bg-white"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {(currentPage - 1) * entriesPerPage + index + 1}
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

      {totalRecords > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
          <p className="text-muted small mb-0">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
            {totalRecords} entries
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

export default AdminTabGrades;
