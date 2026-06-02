import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import { Modal } from "bootstrap";
import { useNavigate } from "react-router-dom";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import AdvisoryFormModal from "./AdvisoryFormModal";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const getAuthHeader = () => {
  const token =
    localStorage.getItem("campusloop_token") ||
    sessionStorage.getItem("campusloop_token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };
};

const TeacherAdvisory = () => {
  const [advisories, setAdvisories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading Advisory Classes...");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [modalMode, setModalMode] = useState("create");
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    section: "",
    school_year: "",
    capacity: "",
  });

  useEffect(() => {
    const closeDropdown = () => setOpenDropdownId(null);
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAdvisories();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentPage, entriesPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage]);

  const fetchAdvisories = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/advisory-classes`,
        {
          ...getAuthHeader(),
          params: {
            search: searchQuery,
            page: currentPage,
            entries: entriesPerPage,
          },
        },
      );
      setAdvisories(res.data.data || []);
      setTotalPages(res.data.last_page || 1);
      setTotalRecords(res.data.total || 0);
    } catch (error) {
      console.error("Error fetching advisory classes", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openFormModal = () => {
    setModalMode("create");
    setOpenDropdownId(null);
    setSelectedItem(null);
    setFormData({ section: "", school_year: "", capacity: "" });
    const modal = new Modal(document.getElementById("advisoryModal"));
    modal.show();
  };

  const handleUpdateClick = (item) => {
    setOpenDropdownId(null);
    setSelectedItem(item);
    setModalMode("update");
    setFormData({
      section: item.section,
      school_year: item.school_year,
      capacity: item.capacity,
    });
    const modal = new Modal(
      document.getElementById("updateIntentConfirmModal"),
    );
    modal.show();
  };

  const proceedToUpdateForm = () => {
    setTimeout(() => {
      const formModal = new Modal(document.getElementById("advisoryModal"));
      formModal.show();
    }, 400);
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (document.activeElement) document.activeElement.blur();

    const modalElement = document.getElementById("advisoryModal");
    const modal = Modal.getInstance(modalElement);
    if (modal) modal.hide();
    executeSubmit();
  };

  const executeSubmit = async () => {
    setIsLoading(true);
    setLoadingText(
      modalMode === "create"
        ? "Creating Advisory Class..."
        : "Saving Changes...",
    );

    try {
      if (modalMode === "create") {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/advisory-classes`,
          formData,
          getAuthHeader(),
        );
        sileo.success({
          title: "Created",
          description: "Advisory Class added.",
          ...darkToast,
        });
      } else {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/advisory-classes/${selectedItem.id}`,
          formData,
          getAuthHeader(),
        );
        sileo.success({
          title: "Updated",
          description: "Changes saved.",
          ...darkToast,
        });
      }
      fetchAdvisories();
    } catch (error) {
      const errorMsg =
        error.response?.data?.errors?.school_year?.[0] ||
        error.response?.data?.message ||
        "Could not process request.";

      sileo.error({
        title: "Failed",
        description: errorMsg,
        ...darkToast,
      });

      const modal = new Modal(document.getElementById("advisoryModal"));
      modal.show();
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (item) => {
    setOpenDropdownId(null);
    setSelectedItem(item);
    const modal = new Modal(document.getElementById("deleteConfirmModal"));
    modal.show();
  };

  const executeDelete = async () => {
    setIsLoading(true);
    setLoadingText("Deleting Advisory Class...");
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/advisory-classes/${selectedItem.id}`,
        getAuthHeader(),
      );
      sileo.success({
        title: "Deleted",
        description: "Class moved to Recycle Bin.",
        ...darkToast,
      });
      fetchAdvisories();
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: "Could not delete class.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterClass = (id) => {
    setIsLoading(true);
    setLoadingText("Opening Advisory Class...");
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/teacher/advisory/${id}`);
    }, 1000);
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

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-3 gap-3">
        <div className="flex-grow-1">
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            Advisory Classes <i className="bi bi-people-fill"></i>
          </h3>
          <p className="text-muted small mb-0">
            Manage your homeroom students, class records, and final grades.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => openFormModal()}
            className="btn btn-campusloop shadow-sm px-4 py-2 fw-medium rounded-3 d-flex align-items-center gap-2 w-100 justify-content-center"
          >
            <i className="bi bi-plus-lg fs-5"></i> New Advisory
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
        <div className="card-body p-0">
          <div className="d-flex flex-nowrap align-items-center justify-content-between overflow-x-auto custom-scrollbar p-3 gap-3">
            <div className="d-flex align-items-center flex-shrink-0 text-muted small pe-2">
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
              className="input-group"
              style={{ maxWidth: "400px", minWidth: "350px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                placeholder="Search Section or School Year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {advisories.length > 0 ? (
          advisories.map((item) => (
            <div className="col-md-6 col-xl-4" key={item.id}>
              <div className="card h-100 border-0 shadow-sm rounded-4 hover-shadow transition-all bg-white premium-hover-card overflow-hidden">
                <div
                  className="p-4 position-relative d-flex flex-column justify-content-end"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    minHeight: "110px",
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
                      pointerEvents: "none",
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
                      pointerEvents: "none",
                    }}
                  ></div>
                  <div
                    className="dropdown strand-card-dropdown position-absolute top-0 end-0 mt-3 me-3 z-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="btn btn-sm text-white rounded-circle shadow-none d-flex justify-content-center align-items-center p-0"
                      type="button"
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
                          className="dropdown-item py-2 fw-medium text-dark"
                          onClick={() => handleUpdateClick(item)}
                        >
                          <i
                            className="bi bi-pencil-square me-2"
                            style={{ color: "var(--primary-color)" }}
                          ></i>{" "}
                          Update
                        </button>
                      </li>
                      <li>
                        <hr className="dropdown-divider opacity-10" />
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
                      title={item.section}
                    >
                      {item.section}
                    </h4>
                    <span className="badge bg-white text-dark bg-opacity-25 px-2 py-1 fw-semibold shadow-sm">
                      <i className="bi bi-calendar-event me-1"></i> SY:{" "}
                      {item.school_year}
                    </span>
                  </div>
                </div>

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
                    <i className="bi bi-person-video3"></i>
                  </div>

                  <div className="bg-light rounded-4 p-3 mb-4 mt-3 border border-light-subtle d-flex align-items-center justify-content-between flex-grow-1">
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle text-white bg-success shadow-sm d-flex justify-content-center align-items-center me-3 flex-shrink-0 fw-bold"
                        style={{
                          width: "35px",
                          height: "35px",
                        }}
                      >
                        <i className="bi bi-people"></i>
                      </div>
                      <span
                        className="text-muted fw-bold mb-0 text-uppercase"
                        style={{
                          fontSize: "0.75rem",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Total Students
                      </span>
                    </div>
                    <span className="text-success fw-bolder fs-6">
                      {item.students_count || 0}{" "}
                      <span className="text-muted small fw-medium">
                        / {item.capacity}
                      </span>
                    </span>
                  </div>

                  <div className="mt-auto d-flex gap-2">
                    <button
                      className="btn btn-campusloop fw-bold w-100 rounded-3 shadow-sm"
                      onClick={() => handleEnterClass(item.id)}
                    >
                      Enter Advisory Class{" "}
                      <i className="bi bi-arrow-right ms-2"></i>
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
              <h5 className="fw-bold text-dark">No advisories found.</h5>
              <p className="text-muted small mb-0">
                {searchQuery
                  ? "No matching advisory classes for your search."
                  : "Click the 'Create Advisory' button to get started."}
              </p>
            </div>
          </div>
        )}
      </div>

      {!isLoading && totalRecords > 0 && (
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 mb-4 px-2 gap-3">
          <p className="text-muted small mb-0">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
            {totalRecords} advisories
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

      <AdvisoryFormModal
        modalMode={modalMode}
        formData={formData}
        handleInputChange={handleInputChange}
        handleInitialSubmit={handleInitialSubmit}
        selectedItem={selectedItem}
        proceedToUpdateForm={proceedToUpdateForm}
        executeSubmit={executeSubmit}
        executeDelete={executeDelete}
      />
    </>
  );
};

export default TeacherAdvisory;
