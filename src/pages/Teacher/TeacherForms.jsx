import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import { useNavigate } from "react-router-dom";
import { Modal } from "bootstrap";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import FormSetupModal from "./FormSetupModal";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("campusloop_token") ||
    sessionStorage.getItem("campusloop_token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

const TeacherForms = () => {
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading forms...");
  const [modalMode, setModalMode] = useState("");
  const [selectedForm, setSelectedForm] = useState(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    instruction: "",
    timer: "",
    is_shuffle_questions: false,
    is_focus_mode: false,
  });

  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Reset page kapag nag-search o nagpalit ng entries limit
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage]);

  // SERVER-SIDE DEBOUNCE EFFECT
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchForms();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentPage, entriesPerPage]);

  useEffect(() => {
    const closeDropdown = () => setOpenDropdownId(null);
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  const fetchForms = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/forms`,
        {
          headers: getAuthHeaders(),
          params: {
            search: searchQuery,
            page: currentPage,
            entries: entriesPerPage,
          },
        },
      );
      setForms(res.data.data || []);
      setTotalPages(res.data.last_page || 1);
      setTotalRecords(res.data.total || 0);
    } catch (error) {
      console.error("Error fetching forms", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const openFormModal = (mode, item = null) => {
    setModalMode(mode);
    if (item) {
      setSelectedForm(item);
      setFormData({
        name: item.name,
        instruction: item.instruction,
        timer: item.timer > 0 ? item.timer : "",
        is_shuffle_questions:
          item.is_shuffle_questions === 1 || item.is_shuffle_questions === true,
        is_focus_mode: item.is_focus_mode === 1 || item.is_focus_mode === true,
      });
    } else {
      setSelectedForm(null);
      setFormData({
        name: "",
        instruction: "",
        timer: "",
        is_shuffle_questions: false,
        is_focus_mode: false,
      });
    }
    const modal = new Modal(document.getElementById("formSetupModal"));
    modal.show();
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (document.activeElement) document.activeElement.blur();

    const modalElement = document.getElementById("formSetupModal");
    const modal = Modal.getInstance(modalElement);
    if (modal) modal.hide();

    if (modalMode === "update") {
      const confirmModal = new Modal(
        document.getElementById("updateConfirmModal"),
      );
      confirmModal.show();
    } else {
      executeSubmit();
    }
  };

  const executeSubmit = async () => {
    setIsLoading(true);
    setLoadingText(
      modalMode === "create"
        ? "Preparing Builder..."
        : "Saving Form Settings...",
    );

    const payload = {
      name: formData.name,
      instruction: formData.instruction,
      timer: formData.timer ? Number(formData.timer) : 0,
      is_shuffle_questions: Boolean(formData.is_shuffle_questions),
      is_focus_mode: Boolean(formData.is_focus_mode),
    };

    try {
      if (modalMode === "create") {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/forms`,
          payload,
          { headers: getAuthHeaders() },
        );
        sileo.success({
          title: "Success",
          description: "Form created.",
          ...darkToast,
        });
        setTimeout(
          () => navigate(`/teacher/forms/${res.data.form.id}/builder`),
          500,
        );
      } else {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/forms/${selectedForm.id}`,
          payload,
          { headers: getAuthHeaders() },
        );
        sileo.success({
          title: "Updated",
          description: "Form settings updated.",
          ...darkToast,
        });
        fetchForms();
      }
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: error.response?.data?.message || "Could not save form.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDuplicate = (item) => {
    setSelectedForm(item);
    const modal = new Modal(document.getElementById("duplicateConfirmModal"));
    modal.show();
  };

  const executeDuplicate = async () => {
    setIsLoading(true);
    setLoadingText("Duplicating Form...");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/forms/${selectedForm.id}/duplicate`,
        null,
        { headers: getAuthHeaders() },
      );
      sileo.success({
        title: "Duplicated",
        description: "A copy has been created.",
        ...darkToast,
      });
      fetchForms();
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: "Could not duplicate form.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (item) => {
    setSelectedForm(item);
    const modal = new Modal(document.getElementById("deleteConfirmModal"));
    modal.show();
  };

  const executeDelete = async () => {
    setIsLoading(true);
    setLoadingText("Moving to Recycle Bin...");
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/forms/${selectedForm.id}`,
        { headers: getAuthHeaders() },
      );
      sileo.success({
        title: "Deleted",
        description: "Form removed.",
        ...darkToast,
      });
      fetchForms();
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: "Could not delete.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
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
        <div>
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            Quiz & Exam Forms <i className="bi bi-ui-radios"></i>
          </h3>
          <p className="text-muted small mb-0">
            Create and manage your assessments with advanced anti-cheat
            features.
          </p>
        </div>
        <button
          onClick={() => openFormModal("create")}
          className="btn btn-campusloop shadow-sm px-4 rounded-3 d-flex align-items-center gap-2 justify-content-center"
        >
          <i className="bi bi-plus-lg fs-5"></i> New Form
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden premium-hover-card">
        <div className="card-body p-0">
          <div className="d-flex flex-nowrap align-items-center justify-content-between gap-3 overflow-x-auto custom-scrollbar p-3">
            <div className="d-flex align-items-center flex-shrink-0 text-muted small">
              Show
              <select
                className="form-select form-select-sm mx-2 toolbar-input rounded-3"
                style={{ width: "70px" }}
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={100}>100</option>
              </select>
              entries
            </div>

            <div
              className="input-group flex-shrink-0"
              style={{ maxWidth: "400px", minWidth: "350px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                placeholder="Search form name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {forms.map((item) => (
          <div className="col-12 col-md-6 col-xl-4" key={item.id}>
            <div
              className="card border-0 shadow-sm rounded-4 h-100 premium-hover-card bg-white"
              style={{ borderRadius: "1rem" }}
            >
              <div
                className="p-4 position-relative d-flex flex-column justify-content-end"
                style={{
                  backgroundColor: "var(--primary-color)",
                  minHeight: "140px",
                  borderTopLeftRadius: "1rem",
                  borderTopRightRadius: "1rem",
                }}
              >
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
                <div
                  className="dropdown position-absolute top-0 end-0 mt-3 me-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="btn btn-sm text-white rounded-circle shadow-none d-flex justify-content-center align-items-center p-0"
                    onClick={() =>
                      setOpenDropdownId(
                        openDropdownId === item.id ? null : item.id,
                      )
                    }
                    style={{
                      backgroundColor: "rgba(0,0,0,0.2)",
                      width: "32px",
                      height: "32px",
                    }}
                  >
                    <i className="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul
                    className={`dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-1 ${openDropdownId === item.id ? "show" : ""}`}
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: "0",
                      zIndex: 1050,
                    }}
                  >
                    <li>
                      <button
                        className="dropdown-item py-2 fw-medium"
                        onClick={() => openFormModal("update", item)}
                      >
                        <i className="bi bi-gear-fill me-2 text-secondary"></i>{" "}
                        Form Settings
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item py-2 fw-medium"
                        onClick={() => confirmDuplicate(item)}
                      >
                        <i className="bi bi-copy me-2 text-success"></i>{" "}
                        Duplicate
                      </button>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item py-2 fw-medium text-danger"
                        onClick={() => confirmDelete(item)}
                      >
                        <i className="bi bi-trash-fill me-2"></i> Delete
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="pe-4 position-relative z-1">
                  <h4
                    className="fw-bold text-white mb-1 text-truncate"
                    title={item.name}
                  >
                    {item.name}
                  </h4>
                  <span className="badge bg-white text-dark bg-opacity-25 px-2 py-1 fw-semibold shadow-sm">
                    <i className="bi bi-ui-radios me-1"></i> Quiz/Exam Form
                  </span>
                </div>
              </div>

              <div className="card-body p-4 d-flex flex-column position-relative">
                <div
                  className="position-absolute shadow-sm rounded-circle d-flex justify-content-center align-items-center text-white"
                  style={{
                    width: "55px",
                    height: "55px",
                    top: "-27px",
                    right: "24px",
                    backgroundColor: "var(--secondary-color)",
                    border: "4px solid white",
                    fontSize: "1.5rem",
                  }}
                  title="Quiz/Exam Form"
                >
                  <i className="bi bi-card-checklist"></i>
                </div>

                <div className="mb-3 mt-1">
                  <span
                    className="d-block text-muted mb-1 text-uppercase"
                    style={{
                      fontSize: "0.65rem",
                      letterSpacing: "1px",
                      fontWeight: "700",
                    }}
                  >
                    Instructions
                  </span>
                  <div
                    className="text-dark small fw-medium text-truncate"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      whiteSpace: "normal",
                    }}
                  >
                    {item.instruction || "No instructions provided."}
                  </div>
                </div>

                <div className="bg-light rounded-4 p-3 mb-4 border border-light-subtle flex-grow-1">
                  <div className="row g-0 text-center">
                    <div className="col-4 d-flex flex-column align-items-center justify-content-center">
                      <i
                        className="bi bi-hourglass-split text-warning mb-1"
                        style={{ fontSize: "1.2rem" }}
                      ></i>
                      <span
                        className="text-muted fw-bold text-uppercase mb-1"
                        style={{ fontSize: "0.6rem" }}
                      >
                        Timer
                      </span>
                      {item.timer > 0 ? (
                        <span
                          className="badge bg-warning bg-opacity-10 text-warning fw-medium border border-warning-subtle bg-opacity-10 shadow-sm"
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.25rem 0.4rem",
                          }}
                        >
                          {item.timer} Min{item.timer > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span
                          className="badge bg-secondary bg-opacity-10 text-secondary fw-medium border border-secondary-subtle bg-opacity-10 shadow-sm"
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.25rem 0.4rem",
                          }}
                        >
                          None
                        </span>
                      )}
                    </div>

                    <div className="col-4 d-flex flex-column align-items-center justify-content-center border-start border-end px-1">
                      <i
                        className={`bi ${item.is_focus_mode ? "bi-eye-slash-fill text-danger" : "bi-shield-check text-success"} mb-1`}
                        style={{ fontSize: "1.2rem" }}
                      ></i>
                      <span
                        className="text-muted fw-bold text-uppercase mb-1"
                        style={{ fontSize: "0.6rem" }}
                      >
                        Security
                      </span>
                      {item.is_focus_mode ? (
                        <span
                          className="badge bg-danger bg-opacity-10 text-danger fw-medium border border-danger-subtle bg-opacity-10 shadow-sm"
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.25rem 0.4rem",
                          }}
                        >
                          Focus ON
                        </span>
                      ) : (
                        <span
                          className="badge bg-success bg-opacity-10 text-success fw-medium border border-success-subtle bg-opacity-10 shadow-sm"
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.25rem 0.4rem",
                          }}
                        >
                          Normal
                        </span>
                      )}
                    </div>

                    <div className="col-4 d-flex flex-column align-items-center justify-content-center">
                      <i
                        className={`bi bi-shuffle ${item.is_shuffle_questions ? "text-primary" : "text-muted"} mb-1`}
                        style={{ fontSize: "1.2rem" }}
                      ></i>
                      <span
                        className="text-muted fw-bold text-uppercase mb-1"
                        style={{ fontSize: "0.6rem" }}
                      >
                        Shuffle
                      </span>
                      {item.is_shuffle_questions ? (
                        <span
                          className="badge bg-primary bg-opacity-10 text-primary fw-medium border border-primary-subtle bg-opacity-10 shadow-sm"
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.25rem 0.4rem",
                          }}
                        >
                          ON
                        </span>
                      ) : (
                        <span
                          className="badge bg-secondary bg-opacity-10 text-secondary fw-medium border border-secondary-subtle bg-opacity-10 shadow-sm"
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.25rem 0.4rem",
                          }}
                        >
                          OFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                  <div className="d-flex flex-column">
                    <span
                      className="text-muted fw-bold text-uppercase mb-1"
                      style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                    >
                      Creator
                    </span>
                    <span
                      className="text-dark fw-bold"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {item.creator
                        ? `${item.creator.first_name} ${item.creator.last_name}`
                        : "Unknown"}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/teacher/forms/${item.id}`)}
                    className="btn btn-campusloop rounded-3 fw-bold px-4 shadow-sm"
                  >
                    <span className="d-none d-sm-inline">Open</span>{" "}
                    <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {forms.length === 0 && !isLoading && (
          <div className="col-12">
            <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
              <i
                className="bi bi-inbox text-muted d-block mb-3"
                style={{ fontSize: "3rem", opacity: 0.5 }}
              ></i>
              <h5 className="fw-bold text-dark">No records found.</h5>
              <p className="text-muted small mb-0">
                {searchQuery
                  ? "No matching forms for your search."
                  : "Click the 'New Form' button to build quizzes and exams."}
              </p>
            </div>
          </div>
        )}
      </div>

      {totalRecords > 0 && (
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-2 mb-4 gap-3 px-2">
          <p className="text-muted small mb-0">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
            {totalRecords} forms
          </p>
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

      <FormSetupModal
        modalMode={modalMode}
        formData={formData}
        handleInputChange={handleInputChange}
        handleFormSubmit={handleInitialSubmit}
        selectedForm={selectedForm}
        executeSubmit={executeSubmit}
        executeDuplicate={executeDuplicate}
        executeDelete={executeDelete}
      />
    </>
  );
};

export default TeacherForms;
