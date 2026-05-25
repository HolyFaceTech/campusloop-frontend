import React, { useState, useEffect } from "react";
import axios from "axios";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";

// Centralized Token Helper
const getAuthHeader = () => {
  const token =
    localStorage.getItem("campusloop_token") ||
    sessionStorage.getItem("campusloop_token");
  return {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  };
};

const StudentGrades = () => {
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading Grades...");

  // Server-Side Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSY, setFilterSY] = useState("all");
  const [filterSem, setFilterSem] = useState("all");
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [activeSetting, setActiveSetting] = useState(null);
  const [uniqueSchoolYears, setUniqueSchoolYears] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Reset pagination kapag may binagong filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage, filterSY, filterSem]);

  // 500ms Server-Side Debounce Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchGrades();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentPage, entriesPerPage, filterSY, filterSem]);

  const fetchGrades = async () => {
    setIsLoading(true);
    setLoadingText("Loading official grades...");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/student/grades`,
        {
          ...getAuthHeader(),
          params: {
            search: searchQuery,
            page: currentPage,
            entries: entriesPerPage,
            sy: filterSY,
            sem: filterSem,
          },
        },
      );

      const {
        active_setting,
        unique_school_years,
        grades: paginatedGrades,
      } = res.data;

      setUniqueSchoolYears(unique_school_years || []);

      if (!isInitialized && active_setting) {
        setActiveSetting(active_setting);
        setFilterSY(active_setting.school_year || "all");
        setFilterSem(active_setting.semester || "all");
        setIsInitialized(true);
      }

      setGrades(paginatedGrades.data || []);
      setTotalPages(paginatedGrades.last_page || 1);
      setTotalRecords(paginatedGrades.total || 0);
    } catch (error) {
      console.error("Failed to fetch grades", error);
    } finally {
      setIsLoading(false);
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
    <div className="container-fluid px-0">
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      {/* HEADER SECTION */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            My Grades <i className="bi bi-award-fill"></i>
          </h3>
          <p className="text-muted small mb-0">
            View your official and approved final grades per subject.
          </p>
        </div>
      </div>

      {/* UNIFIED TOP CONTROL BAR */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
        <div className="card-body p-3">
          <div className="d-flex flex-nowrap align-items-center gap-3 overflow-x-auto custom-scrollbar pb-1">
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
              style={{ minWidth: "250px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                placeholder="Search subject code or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="input-group" style={{ minWidth: "160px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-calendar3"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3 text-muted small fw-medium"
                value={filterSY}
                onChange={(e) => setFilterSY(e.target.value)}
              >
                <option value="all">All School Year</option>
                {uniqueSchoolYears.map((sy) => (
                  <option key={sy} value={sy}>
                    {sy}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group" style={{ minWidth: "160px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-clock-history"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3 text-muted small fw-medium"
                value={filterSem}
                onChange={(e) => setFilterSem(e.target.value)}
              >
                <option value="all">All Semester</option>
                <option value="1st">1st Semester</option>
                <option value="2nd">2nd Semester</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        <div className="table-responsive custom-scrollbar">
          <table
            className="table table-summer align-middle mb-0"
            style={{ minWidth: "1000px" }}
          >
            <thead>
              <tr className="bg-light">
                <th className="ps-4 py-3" style={{ width: "60px" }}>
                  #
                </th>
                <th className="text-muted small fw-bold text-uppercase py-3">
                  School Year & Semester
                </th>
                <th className="text-muted small fw-bold text-uppercase py-3">
                  Subject Code & Description
                </th>
                <th className="text-muted small fw-bold text-uppercase text-center py-3">
                  Final Grade
                </th>
                <th className="text-muted small fw-bold text-uppercase text-center pe-4 py-3">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              {grades.map((item, index) => (
                <tr key={item.id} className="hover-bg-light">
                  <td className="ps-4 py-3 fw-bold text-muted">
                    {(currentPage - 1) * entriesPerPage + index + 1}
                  </td>

                  <td>
                    <div className="d-flex align-items-center py-1">
                      <div
                        className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold me-3 shadow-sm flex-shrink-0"
                        style={{
                          width: "40px",
                          height: "40px",
                          backgroundColor: "var(--secondary-color)",
                        }}
                      >
                        <i className="bi bi-calendar2-check"></i>
                      </div>
                      <div className="overflow-hidden">
                        <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                          <span
                            className="fw-bold text-dark text-truncate"
                            style={{ maxWidth: "180px" }}
                          >
                            S.Y. {item.school_year}
                          </span>
                        </div>
                        <p
                          className="mb-0 text-muted text-truncate text-uppercase"
                          style={{
                            fontSize: "0.75rem",
                            maxWidth: "200px",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {item.semester} Semester
                        </p>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="d-flex flex-column justify-content-center py-1">
                      <span className="d-block fw-bold font-monospace text-dark">
                        {item.subject_code}
                      </span>
                      <span
                        className="d-block text-muted text-truncate fst-italic"
                        style={{
                          fontSize: "0.75rem",
                          maxWidth: "200px",
                        }}
                        title={item.subject_description}
                      >
                        {item.subject_description}
                      </span>
                    </div>
                  </td>

                  <td className="text-center py-3">
                    <span
                      className={`fw-bolder fs-5 ${item.grade >= 75 ? "text-success" : "text-danger"}`}
                    >
                      {item.grade}
                    </span>
                  </td>

                  <td className="text-center pe-4 py-3">
                    <span
                      className={`badge ${item.grade >= 75 ? "bg-success bg-opacity-10 text-success border border-success" : "bg-danger bg-opacity-10 text-danger border border-danger"} px-3 py-2 rounded-3 shadow-sm`}
                      style={{
                        fontSize: "0.7rem",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.grade >= 75 ? (
                        <>
                          <i className="bi bi-check-circle-fill me-1"></i>{" "}
                          Passed
                        </>
                      ) : (
                        <>
                          <i className="bi bi-x-circle-fill me-1"></i> Failed
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}

              {grades.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="5" className="p-4 bg-light border-bottom-0">
                    <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
                      <i
                        className="bi bi-inbox text-muted d-block mb-3"
                        style={{ fontSize: "3rem", opacity: 0.5 }}
                      ></i>
                      <h5 className="fw-bold text-dark">No records found.</h5>
                      <p className="text-muted small mb-0">
                        {searchQuery ||
                        filterSY !== "all" ||
                        filterSem !== "all"
                          ? "No matching official grades for your search."
                          : "No official grades available yet."}
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
            {totalRecords} entries
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
    </div>
  );
};

export default StudentGrades;
