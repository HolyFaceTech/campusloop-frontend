import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import GlobalSpinner from "../../../components/Shared/GlobalSpinner";

const getAuthHeader = () => {
  const token =
    localStorage.getItem("campusloop_token") ||
    sessionStorage.getItem("campusloop_token");
  return {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  };
};

const StudentTabGrades = () => {
  const { id } = useParams();
  const [classworks, setClassworks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Reset to Page 1 on any filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, sortOrder, entriesPerPage]);

  // Server-Side Debounce Effect (500ms)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchGrades();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [id, searchQuery, filterType, sortOrder, currentPage, entriesPerPage]);

  const fetchGrades = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/student/classrooms/${id}/grades`,
        {
          ...getAuthHeader(),
          params: {
            search: searchQuery,
            filter: filterType,
            sort: sortOrder,
            page: currentPage,
            entries: entriesPerPage,
          },
        },
      );

      setClassworks(res.data.grades.data || []);
      setTotalPages(res.data.grades.last_page || 1);
      setTotalRecords(res.data.grades.total || 0);
      setPercentage(res.data.percentage || 0);
    } catch (error) {
      console.error("Failed to load grades.");
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "graded":
        return (
          <span className="badge bg-success bg-opacity-10 text-success fw-medium border border-success px-2 py-1 shadow-sm">
            Graded
          </span>
        );
      case "turned_in":
        return (
          <span className="badge bg-success bg-opacity-10 text-success fw-medium border border-success px-2 py-1 shadow-sm">
            Done
          </span>
        );
      case "late_submission":
        return (
          <span className="badge bg-warning bg-opacity-10 text-warning fw-medium border border-warning px-2 py-1 shadow-sm">
            Done Late
          </span>
        );
      case "returned":
        return (
          <span className="badge bg-danger bg-opacity-10 text-danger fw-medium border border-danger px-2 py-1 shadow-sm">
            Returned
          </span>
        );
      case "missing":
        return (
          <span className="badge bg-danger bg-opacity-10 text-danger fw-medium border border-danger px-2 py-1 shadow-sm">
            Missing
          </span>
        );
      case "pending":
      default:
        return (
          <span className="badge bg-primary bg-opacity-10 text-primary fw-medium border border-primary px-2 py-1 shadow-sm">
            Pending
          </span>
        );
    }
  };

  const renderPageNumbers = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) pages = [1, 2, 3, 4, "...", totalPages];
      else if (currentPage >= totalPages - 2)
        pages = [
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      else
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
      <GlobalSpinner isLoading={isLoading} text="Loading Grades..." />

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
              className="input-group flex-grow-1"
              style={{ minWidth: "300px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                placeholder="Search Classwork Title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="input-group" style={{ minWidth: "300px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-funnel"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option
                  value="assignment"
                  style={{ backgroundColor: "#cfe2ff", color: "#084298" }}
                >
                  Assignment
                </option>
                <option
                  value="activity"
                  style={{ backgroundColor: "#d1e7dd", color: "#0f5132" }}
                >
                  Activity
                </option>
                <option
                  value="quiz"
                  style={{ backgroundColor: "#fff3cd", color: "#664d03" }}
                >
                  Quiz
                </option>
                <option
                  value="exam"
                  style={{ backgroundColor: "#f8d7da", color: "#842029" }}
                >
                  Exam
                </option>
              </select>
            </div>

            <div className="input-group" style={{ minWidth: "300px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-sort-down"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <div className="text-end border-start ps-4 ms-auto flex-shrink-0">
              <span
                className="d-block small text-muted fw-bold"
                style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
              >
                CURRENT STANDING
              </span>
              <span className="d-block fs-4 fw-bolder text-primary lh-1 mt-1">
                {percentage}%
              </span>
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
            <thead className="bg-light">
              <tr>
                <th className="ps-4 py-3" style={{ width: "60px" }}>
                  #
                </th>
                <th className="text-muted small fw-bold text-uppercase py-3">
                  Classwork Details
                </th>
                <th className="text-muted small fw-bold text-uppercase py-3">
                  Type
                </th>
                <th className="text-muted small fw-bold text-uppercase py-3">
                  Status
                </th>
                <th className="text-muted small fw-bold text-uppercase py-3">
                  Submitted At
                </th>
                <th className="text-muted small fw-bold text-uppercase text-center pe-4 py-3">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {classworks.length > 0
                ? classworks.map((cw, index) => {
                    const display = getTypeDisplay(cw.type);
                    const sub = cw.student_submission;

                    return (
                      <tr key={cw.id} className="hover-bg-light">
                        <td className="ps-4 py-3 fw-medium text-muted">
                          {(currentPage - 1) * entriesPerPage + index + 1}
                        </td>

                        <td>
                          <div className="d-flex align-items-center py-1">
                            <div
                              className={`rounded-circle text-white d-flex justify-content-center align-items-center fw-bold me-3 shadow-sm flex-shrink-0 ${display.bg}`}
                              style={{ width: "40px", height: "40px" }}
                            >
                              <i className={`bi ${display.icon} fs-5`}></i>
                            </div>
                            <div className="overflow-hidden">
                              <span className="fw-bold text-dark d-block">
                                {cw.title}
                              </span>
                              <span
                                className="text-muted small d-block font-monospace tracking-wide mt-1"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {cw.points
                                  ? `${cw.points} Point${cw.points > 1 ? "s" : ""}`
                                  : "No Points"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3">
                          <span
                            className={`badge shadow-sm  border px-3 py-2 text-uppercase fw-medium ${display.bg} border-${display.bg.split("-")[0]}`}
                          >
                            {cw.type}
                          </span>
                        </td>

                        <td className="py-3">
                          {getStatusBadge(cw.student_status)}
                        </td>

                        <td className="py-3">
                          <span className="text-muted small fw-medium">
                            {sub?.submitted_at
                              ? new Date(sub.submitted_at).toLocaleString([], {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </span>
                        </td>

                        <td className="text-center pe-4 py-3">
                          {cw.student_status === "graded" ||
                          (cw.student_status === "late_submission" &&
                            sub?.grade &&
                            sub?.grade !== "NULL") ? (
                            <div className="d-flex flex-column align-items-center justify-content-center">
                              <span
                                className="fw-bolder text-primary"
                                style={{ fontSize: "1.1rem", lineHeight: "1" }}
                              >
                                {sub?.grade}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted fw-light">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                : !isLoading && (
                    <tr>
                      <td colSpan="6" className="p-4 bg-light border-bottom-0">
                        <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
                          <i
                            className="bi bi-inbox text-muted d-block mb-3"
                            style={{ fontSize: "3rem", opacity: 0.5 }}
                          ></i>
                          <h5 className="fw-bold text-dark">
                            No records found.
                          </h5>
                          <p className="text-muted small mb-0">
                            {searchQuery
                              ? "No matching graded classworks for your search."
                              : "You don't have any graded classworks in this classroom yet."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>

      {totalRecords > 0 && !isLoading && (
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-2 mb-4 px-2 gap-3">
          <span className="text-muted small">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
            {totalRecords} records
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
    </>
  );
};

export default StudentTabGrades;
