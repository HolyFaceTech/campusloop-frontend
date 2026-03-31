import React, { useState, useEffect } from "react";
import axios from "axios";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";

const StudentGrades = () => {
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading Grades...");

  // Datatable & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSY, setFilterSY] = useState("all");
  const [filterSem, setFilterSem] = useState("all");

  // STATE PARA SA ACTIVE SETTING
  const [activeSetting, setActiveSetting] = useState(null);

  useEffect(() => {
    fetchGrades();
  }, []);

  // Reset pagination kapag may binagong filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage, filterSY, filterSem]);

  const fetchGrades = async () => {
    setIsLoading(true);
    setLoadingText("Fetching official grades...");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/student/grades`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );

      const { active_setting, grades: fetchedGrades } = res.data;

      // I-set agad yung default SY at Semester kung ano yung active sa system settings
      if (active_setting) {
        setActiveSetting(active_setting); // I-save sa state
        setFilterSY(active_setting.school_year || "all");
        setFilterSem(active_setting.semester || "all");
      }

      setGrades(fetchedGrades || []);
    } catch (error) {
      console.error("Failed to fetch grades", error);
    } finally {
      setIsLoading(false);
    }
  };

  // SINIGURO NATIN NA LAGING KASAMA ANG ACTIVE SCHOOL YEAR SA DROPDOWN
  const uniqueSchoolYears = [
    ...new Set([
      activeSetting?.school_year, // Isama ang active SY kahit walang grades
      ...(grades || []).map((g) => g?.school_year),
    ]),
  ].filter(Boolean); // Tatanggalin nito ang null or undefined

  // BULLET-PROOF LOGIC PARA SA FILTERING AT SEARCHING
  const filteredGrades = (grades || []).filter((g) => {
    if (!g) return false;

    const safeSearch = typeof searchQuery === "string" ? searchQuery : "";
    const safeCode =
      typeof g.subject_code === "string"
        ? g.subject_code
        : String(g.subject_code || "");
    const safeDesc =
      typeof g.subject_description === "string"
        ? g.subject_description
        : String(g.subject_description || "");

    const matchesSearch = `${safeCode} ${safeDesc}`
      .toLowerCase()
      .includes(safeSearch.toLowerCase());

    const matchesSY = filterSY === "all" || g.school_year === filterSY;

    // I-format nang tama para tugma sa data ng database ('1st' or '1st Sem' base sa setup mo)
    let formatSem = filterSem;
    if (filterSem === "1st" || filterSem === "2nd") {
      const matchesSemStrict =
        g.semester === filterSem ||
        g.semester === `${filterSem} Sem` ||
        g.semester === `${filterSem} Semester`;
      return matchesSearch && matchesSY && matchesSemStrict;
    }

    const matchesSem = filterSem === "all" || g.semester === filterSem;

    return matchesSearch && matchesSY && matchesSem;
  });

  // LOGIC PARA SA PAGINATION
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentGrades = filteredGrades.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredGrades.length / entriesPerPage);

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
              <tr>
                <th className="ps-4" style={{ width: "60px" }}>
                  #
                </th>
                <th>School Year & Semester</th>
                <th>Subject Code & Description</th>
                <th className="text-center">Final Grade</th>
                <th className="text-center pe-4">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {currentGrades.map((item, index) => (
                <tr key={item.id}>
                  <td className="ps-4 fw-bold text-muted">
                    {indexOfFirstItem + index + 1}
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
                      <span className="font-monospace text-primary fw-bold">
                        {item.subject_code}
                      </span>
                      <span
                        className="text-muted small text-wrap"
                        style={{ maxWidth: "450px" }}
                      >
                        {item.subject_description}
                      </span>
                    </div>
                  </td>

                  <td className="text-center">
                    <span
                      className={`fw-bolder fs-6 ${item.grade >= 75 ? "text-success" : "text-danger"}`}
                    >
                      {item.grade}
                    </span>
                  </td>

                  <td className="text-center pe-4">
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

              {currentGrades.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    {grades.length === 0 ? (
                      <>
                        <i className="bi bi-award fs-1 d-block mb-2 opacity-50"></i>
                        No official grades available yet for this semester.
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search fs-1 d-block mb-2 opacity-50"></i>
                        No matching records found.
                      </>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredGrades.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
          <p className="text-muted small mb-0">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredGrades.length)} of{" "}
            {filteredGrades.length} entries
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
    </div>
  );
};

export default StudentGrades;
