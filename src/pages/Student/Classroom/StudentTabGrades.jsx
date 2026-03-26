import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import GlobalSpinner from "../../../components/Shared/GlobalSpinner";

const StudentTabGrades = () => {
  const { id } = useParams();
  const [classworks, setClassworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters, Sort, & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  useEffect(() => {
    fetchGrades();
  }, [id]);

  // Reset to Page 1 on any filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, sortOrder, entriesPerPage]);

  const fetchGrades = async () => {
    try {
      // GINAMIT NATIN ANG STREAM ENDPOINT PARA MAKUHA LAHAT (PENDING, MISSING, GRADED, ETC.)
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/student/classrooms/${id}/stream`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );

      // TANGGALIN ANG MATERIALS DAHIL HINDI NAMAN ITO GINAGRADE-AN
      const gradableWorks = res.data.filter((cw) => cw.type !== "material");
      setClassworks(gradableWorks);
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
      case "DONE":
      case "GRADED":
        return (
          <span
            className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1"
            style={{ fontSize: "0.65rem" }}
          >
            <i
              className="bi bi-check-circle-fill me-1"
              style={{ fontSize: "0.5rem" }}
            ></i>{" "}
            Graded / Done
          </span>
        );
      case "DONE LATE":
        return (
          <span
            className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-2 py-1"
            style={{ fontSize: "0.65rem" }}
          >
            <i
              className="bi bi-clock-history me-1"
              style={{ fontSize: "0.5rem" }}
            ></i>{" "}
            Done Late
          </span>
        );
      case "RETURNED":
        return (
          <span
            className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-1"
            style={{ fontSize: "0.65rem" }}
          >
            <i
              className="bi bi-arrow-return-left me-1"
              style={{ fontSize: "0.5rem" }}
            ></i>{" "}
            Returned
          </span>
        );
      case "MISSING":
        return (
          <span
            className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-1"
            style={{ fontSize: "0.65rem" }}
          >
            <i
              className="bi bi-x-circle-fill me-1"
              style={{ fontSize: "0.5rem" }}
            ></i>{" "}
            Missing
          </span>
        );
      case "DUE SOON":
        return (
          <span
            className="badge bg-warning bg-opacity-25 text-dark rounded-pill px-2 py-1"
            style={{ fontSize: "0.65rem" }}
          >
            <i
              className="bi bi-clock-fill me-1"
              style={{ fontSize: "0.5rem" }}
            ></i>{" "}
            Due Soon
          </span>
        );
      default:
        return (
          <span
            className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-2 py-1"
            style={{ fontSize: "0.65rem" }}
          >
            Pending
          </span>
        );
    }
  };

  // CURRENT STANDING CALCULATION (BINABASE LANG SA MGA "GRADED" NA CLASSWORKS)
  const gradedWorks = classworks.filter((cw) => cw.student_status === "GRADED");
  const totalEarned = gradedWorks.reduce(
    (sum, cw) => sum + (Number(cw.student_submission?.grade) || 0),
    0,
  );
  const totalPossible = gradedWorks.reduce(
    (sum, cw) => sum + (Number(cw.points) || 0),
    0,
  );
  const percentage =
    totalPossible > 0 ? ((totalEarned / totalPossible) * 100).toFixed(1) : 0;

  // LOGIC PARA SA SEARCH, FILTER, AT SORT
  let processedClassworks = classworks.filter((cw) => {
    const matchesSearch = cw.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || cw.type === filterType;
    return matchesSearch && matchesType;
  });

  processedClassworks.sort((a, b) => {
    const dateA = a.student_submission?.submitted_at
      ? new Date(a.student_submission.submitted_at).getTime()
      : new Date(a.created_at).getTime();
    const dateB = b.student_submission?.submitted_at
      ? new Date(b.student_submission.submitted_at).getTime()
      : new Date(b.created_at).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  // LOGIC PARA SA PAGINATION
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = processedClassworks.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(processedClassworks.length / entriesPerPage);

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text="Fetching Grades..." />

      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
        <div className="card-body p-3">
          <div className="d-flex flex-nowrap align-items-center gap-3 overflow-x-auto custom-scrollbar pb-1">
            {/* ENTRIES PER PAGE */}
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

            {/* SEARCH */}
            <div
              className="input-group"
              style={{ minWidth: "250px", maxWidth: "350px" }}
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

            {/* FILTER TYPE */}
            <div className="input-group" style={{ minWidth: "150px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-funnel"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="assignment">Assignment</option>
                <option value="activity">Activity</option>
                <option value="quiz">Quiz</option>
                <option value="exam">Exam</option>
              </select>
            </div>

            {/* SORT ORDER */}
            <div className="input-group" style={{ minWidth: "160px" }}>
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

            {/* CURRENT STANDING PUSHED TO RIGHT */}
            {classworks.length > 0 && (
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
            )}
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
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
              {currentItems.map((cw, index) => {
                const display = getTypeDisplay(cw.type);
                const sub = cw.student_submission;

                return (
                  <tr key={cw.id} className="hover-bg-light">
                    <td className="ps-4 py-3 fw-medium text-muted">
                      {indexOfFirstItem + index + 1}
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
                            {cw.points ? `${cw.points} Points` : "No Points"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      <span
                        className={`badge bg-opacity-10 border px-2 py-1 text-uppercase ${display.color} border-${display.color.split("-")[1]}`}
                        style={{
                          fontSize: "0.65rem",
                          backgroundColor: `var(--bs-${display.color.split("-")[1]})`,
                        }}
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
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </span>
                    </td>

                    <td className="text-center pe-4 py-3">
                      {cw.student_status === "GRADED" ? (
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
              })}

              {currentItems.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    {classworks.length === 0 ? (
                      <>
                        <i className="bi bi-journal-x fs-1 d-block mb-2 opacity-50"></i>
                        <span className="fw-medium">
                          No classworks assigned yet.
                        </span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search fs-1 d-block mb-2 opacity-50"></i>
                        <span className="fw-medium">
                          No matching records found.
                        </span>
                      </>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {processedClassworks.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
          <p className="text-muted small mb-0">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, processedClassworks.length)} of{" "}
            {processedClassworks.length} entries
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

export default StudentTabGrades;
