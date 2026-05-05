import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import SubjectFormModal from "./SubjectFormModal";
import { Modal } from "bootstrap";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [strandsList, setStrandsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStrand, setFilterStrand] = useState("all");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterSemester, setFilterSemester] = useState("all");

  const [selectedIds, setSelectedIds] = useState([]);

  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modal & Form States
  const [modalMode, setModalMode] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    strand_id: "",
    grade_level: "",
    semester: "",
  });

  // Helper function para laging updated ang token na kukunin
  const getAuthToken = () => {
    return (
      localStorage.getItem("campusloop_token") ||
      sessionStorage.getItem("campusloop_token")
    );
  };

  useEffect(() => {
    fetchStrands();
  }, []);

  // Reset to page 1 kapag nagbago ang mga filters
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStrand, filterGrade, filterSemester, entriesPerPage]);

  // DEBOUNCE EFFECT: Mag-fe-fetch sa server kapag nag-stop na mag-type
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSubjects(true);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [
    searchQuery,
    filterStrand,
    filterGrade,
    filterSemester,
    currentPage,
    entriesPerPage,
  ]);

  const fetchStrands = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/strands`,
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        },
      );
      setStrandsList(response.data);
    } catch (error) {
      console.error("Failed to load strands", error);
    }
  };

  const fetchSubjects = async (showSpinner = true) => {
    if (showSpinner) {
      setIsLoading(true);
      setLoadingText("Fetching subjects...");
    }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/subjects`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
          params: {
            search: searchQuery,
            filterStrand: filterStrand,
            filterGrade: filterGrade,
            filterSemester: filterSemester,
            page: currentPage,
            entries: entriesPerPage,
          },
        },
      );
      // Galing na sa server ang naka-paginate na data
      setSubjects(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
      setTotalRecords(response.data.total || 0);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to fetch subjects.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConfirmUpdateClick = (subject) => {
    setSelectedSubject(subject);
    const modalElement = document.getElementById("updateConfirmModal");
    const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
    modal.show();
  };

  const proceedToUpdateForm = () => {
    setTimeout(() => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      if (selectedSubject) {
        setModalMode("update");
        setFormData({
          code: selectedSubject.code,
          description: selectedSubject.description,
          strand_id: selectedSubject.strand_id,
          grade_level: selectedSubject.grade_level,
          semester: selectedSubject.semester,
        });
        const formModalElement = document.getElementById("subjectFormModal");
        const formModal =
          Modal.getInstance(formModalElement) || new Modal(formModalElement);
        formModal.show();
      }
    }, 400);
  };

  const openFormModalForCreate = () => {
    setModalMode("create");
    setSelectedSubject(null);
    setFormData({
      code: "",
      description: "",
      strand_id: "",
      grade_level: "",
      semester: "",
    });
    const modalElement = document.getElementById("subjectFormModal");
    const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
    modal.show();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const modalElement = document.getElementById("subjectFormModal");
    const modal = Modal.getInstance(modalElement);
    if (modal) modal.hide();

    setTimeout(() => executeSubmit(), 400);
  };

  const executeSubmit = async () => {
    document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";

    setIsLoading(true);
    setLoadingText(
      modalMode === "create" ? "Creating Subject..." : "Saving Changes...",
    );

    try {
      if (modalMode === "create") {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/subjects`,
          formData,
          {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          },
        );
        sileo.success({
          title: "Success",
          description: "New subject added successfully.",
          ...darkToast,
        });
      } else {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/subjects/${selectedSubject.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          },
        );
        sileo.success({
          title: "Updated",
          description: "Subject information updated.",
          ...darkToast,
        });
      }
      fetchSubjects();
      setSelectedIds([]); // Clear selection incase they edited something that is selected
    } catch (error) {
      sileo.error({
        title: "Failed",
        description:
          error.response?.data?.message || "Please check your inputs.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (subject = null) => {
    setSelectedSubject(subject); // If null, it means bulk delete
    const modal = new Modal(document.getElementById("deleteConfirmModal"));
    modal.show();
  };

  const executeDelete = () => {
    setTimeout(async () => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      setIsLoading(true);
      setLoadingText(
        selectedSubject ? "Deleting Subject..." : "Deleting Selection...",
      );

      try {
        if (selectedSubject) {
          await axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/subjects/${selectedSubject.id}`,
            {
              headers: { Authorization: `Bearer ${getAuthToken()}` },
            },
          );
        } else {
          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/subjects/bulk-delete`,
            { ids: selectedIds },
            {
              headers: { Authorization: `Bearer ${getAuthToken()}` },
            },
          );
          setSelectedIds([]);
        }
        sileo.success({
          title: "Deleted",
          description: "Moved to recycle bin.",
          ...darkToast,
        });
        setCurrentPage(1); // Balik page 1 kapag nakadelete
        fetchSubjects();
      } catch (error) {
        sileo.error({
          title: "Failed",
          description: "Could not delete.",
          ...darkToast,
        });
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(subjects.map((s) => s.id));
    else setSelectedIds([]);
  };

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            Subject Management <i className="bi bi-book"></i>
          </h3>
          <p className="text-muted small mb-0">
            Manage and assign subjects to specific strands and semesters.
          </p>
        </div>
        <button
          onClick={openFormModalForCreate}
          className="btn btn-campusloop shadow-sm px-4 rounded-3 d-flex align-items-center gap-2"
        >
          <i className="bi bi-plus-lg fs-5"></i> New Subject
        </button>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
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
              style={{ minWidth: "400px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                placeholder="Search Subject Code or Description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="input-group" style={{ minWidth: "200px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-journal-text"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterStrand}
                onChange={(e) => setFilterStrand(e.target.value)}
              >
                <option value="all">All Strands</option>
                {strandsList.map((strand) => (
                  <option key={strand.id} value={strand.id}>
                    {strand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group" style={{ minWidth: "200px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-bar-chart-steps"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
              >
                <option value="all">All Grades</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </div>

            <div className="input-group" style={{ minWidth: "200px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-clock-history"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
              >
                <option value="all">All Semesters</option>
                <option value="1st">1st Semester</option>
                <option value="2nd">2nd Semester</option>
              </select>
            </div>

            <button
              className="btn btn-danger d-flex align-items-center justify-content-center gap-2 py-2 px-4 flex-shrink-0 rounded-3 shadow-sm"
              disabled={selectedIds.length === 0}
              onClick={() => confirmDelete(null)}
            >
              <i className="bi bi-trash-fill"></i> Delete{" "}
              {selectedIds.length > 0 && `(${selectedIds.length})`}
            </button>
          </div>
        </div>
      </div>

      {/* DATATABLE */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        <div className="table-responsive custom-scrollbar">
          <table
            className="table table-summer align-middle mb-0"
            style={{ minWidth: "900px" }}
          >
            <thead>
              <tr>
                <th className="ps-4" style={{ width: "50px" }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    onChange={handleSelectAll}
                    checked={
                      selectedIds.length === subjects.length &&
                      subjects.length > 0
                    }
                  />
                </th>
                <th style={{ width: "60px" }}>#</th>
                <th>Subject Code</th>
                <th>Description</th>
                <th>Strand</th>
                <th>Grade Level / Semester</th>
                <th className="text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => (
                <tr key={subject.id}>
                  <td className="ps-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedIds.includes(subject.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedIds((prev) =>
                          checked
                            ? [...prev, subject.id]
                            : prev.filter((id) => id !== subject.id),
                        );
                      }}
                    />
                  </td>
                  <td className="fw-bold text-muted">
                    {(currentPage - 1) * entriesPerPage + index + 1}
                  </td>
                  <td>
                    <span className="text-dark fw-bold">{subject.code}</span>
                  </td>
                  <td>
                    <span
                      className="text-dark text-truncate d-inline-block fst-italic"
                      style={{ maxWidth: "250px" }}
                    >
                      {subject.description}
                    </span>
                  </td>
                  <td>
                    <span
                      className="badge rounded-3 text-dark px-3 py-2"
                      style={{ backgroundColor: "var(--accent-color)" }}
                    >
                      {subject.strand?.name || "N/A"}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold text-muted small">
                        <i
                          className="bi bi-mortarboard-fill me-1"
                          style={{ color: "var(--primary-color)" }}
                        ></i>{" "}
                        Grade {subject.grade_level}
                      </span>
                      <div className="vr"></div>
                      <span className="fw-bold text-muted small">
                        <i className="bi bi-clock me-1 text-secondary"></i>{" "}
                        {subject.semester} Semester
                      </span>
                    </div>
                  </td>
                  <td className="text-center pe-4">
                    <button
                      onClick={() => handleConfirmUpdateClick(subject)}
                      className="btn btn-sm btn-light border-0 shadow-sm me-2 rounded-circle"
                      style={{ width: "35px", height: "35px" }}
                      title="Edit Subject"
                    >
                      <i
                        className="bi bi-pencil-fill"
                        style={{ color: "var(--primary-color)" }}
                      ></i>
                    </button>
                    <button
                      onClick={() => confirmDelete(subject)}
                      className="btn btn-sm btn-light border-0 shadow-sm rounded-circle"
                      style={{ width: "35px", height: "35px" }}
                      title="Delete Subject"
                    >
                      <i className="bi bi-trash-fill text-danger"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="7" className="p-4 bg-light border-bottom-0">
                    <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
                      <i
                        className="bi bi-inbox text-muted d-block mb-3"
                        style={{ fontSize: "3rem", opacity: 0.5 }}
                      ></i>
                      <h5 className="fw-bold text-dark">No records found.</h5>
                      <p className="text-muted small mb-0">
                        {searchQuery
                          ? "No matching subjects for your search."
                          : "Click the 'New Subject' button to get started."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION CONTROLS */}
      {totalRecords > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
          <p className="text-muted small mb-0">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
            {totalRecords} subjects
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

      <SubjectFormModal
        modalMode={modalMode}
        formData={formData}
        handleInputChange={handleInputChange}
        handleFormSubmit={handleFormSubmit}
        strandsList={strandsList}
        selectedSubject={selectedSubject}
        proceedToUpdateForm={proceedToUpdateForm}
        executeDelete={executeDelete}
        selectedIdsCount={selectedIds.length}
      />
    </>
  );
};

export default Subjects;
