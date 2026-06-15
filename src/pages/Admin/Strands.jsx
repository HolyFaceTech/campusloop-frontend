import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import StrandFormModal from "./StrandFormModal";
import { Modal } from "bootstrap";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const Strands = () => {
  const [strands, setStrands] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [modalMode, setModalMode] = useState("");
  const [selectedStrand, setSelectedStrand] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const getAuthToken = () => {
    return (
      localStorage.getItem("campusloop_token") ||
      sessionStorage.getItem("campusloop_token")
    );
  };

  useEffect(() => {
    fetchStrands();
  }, []);

  // LOCAL DEBOUNCE EFFECT
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300); // 300 milliseconds delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".strand-card-dropdown")) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchStrands = async () => {
    setIsLoading(true);
    setLoadingText("Loading strands...");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/strands`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        },
      );
      setStrands(response.data);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to fetch strands.";
      sileo.error({
        title: "Error",
        description: errorMsg,
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConfirmUpdateClick = (strand) => {
    setOpenDropdownId(null);
    setSelectedStrand(strand);
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

      if (selectedStrand) {
        openFormModal("update", selectedStrand);
      }
    }, 400);
  };

  const openFormModal = (mode, strand = null) => {
    setOpenDropdownId(null);
    setModalMode(mode);
    if (strand) {
      setSelectedStrand(strand);
      setFormData({ name: strand.name, description: strand.description });
    } else {
      setSelectedStrand(null);
      setFormData({ name: "", description: "" });
    }
    const modalElement = document.getElementById("strandFormModal");
    const modal = Modal.getInstance(modalElement) || new Modal(modalElement);
    modal.show();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const modalElement = document.getElementById("strandFormModal");
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
      modalMode === "create" ? "Creating Strand..." : "Saving Changes...",
    );

    try {
      if (modalMode === "create") {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/strands`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          },
        );
        sileo.success({
          title: "Success",
          description: "New strand added successfully.",
          ...darkToast,
        });
      } else {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/strands/${selectedStrand.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          },
        );
        sileo.success({
          title: "Updated",
          description: "Strand information updated.",
          ...darkToast,
        });
      }
      fetchStrands();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Please check your inputs.";
      sileo.error({
        title: "Failed",
        description: errorMsg,
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (strand) => {
    setOpenDropdownId(null);
    setSelectedStrand(strand);
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
      setLoadingText("Deleting Strand...");
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/strands/${selectedStrand.id}`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          },
        );
        sileo.success({
          title: "Deleted",
          description: "Strand moved to recycle bin.",
          ...darkToast,
        });
        fetchStrands();
      } catch (error) {
        const errorMsg =
          error.response?.data?.message || "Could not delete strand.";
        sileo.error({
          title: "Failed",
          description: errorMsg,
          ...darkToast,
        });
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  const filteredStrands = strands.filter(
    (strand) =>
      strand.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      strand.description.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-3 gap-3">
        <div className="flex-grow-1">
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            Strand Management <i className="bi bi-diagram-3 ms-1"></i>
          </h3>
          <p className="text-muted small mb-0">
            Manage all academic strands and view enrolled students.
          </p>
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={() => openFormModal("create")}
            className="btn btn-campusloop fw-medium shadow-sm px-4 rounded-3 d-flex align-items-center gap-2 w-100 justify-content-center"
          >
            <i className="bi bi-plus-lg fs-5"></i> New Strand
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12 col-md-6 col-xl-4">
          <div className="input-group shadow-sm rounded-3 overflow-hidden">
            <span className="input-group-text bg-white border-end-0 text-muted px-3">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0 toolbar-input"
              placeholder="Search Name or Description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row g-4">
        {filteredStrands.map((strand) => (
          <div className="col-md-6 col-xl-4" key={strand.id}>
            <div
              className="card border-0 shadow-sm rounded-4 h-100 premium-hover-card bg-white"
              style={{ borderRadius: "1rem" }}
            >
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
                        openDropdownId === strand.id ? null : strand.id,
                      )
                    }
                    style={{
                      backgroundColor: "rgba(0,0,0,0.2)",
                      width: "35px",
                      height: "35px",
                    }}
                  >
                    <i
                      className="bi bi-three-dots-vertical"
                      style={{ pointerEvents: "none" }}
                    ></i>
                  </button>
                  <ul
                    className={`dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-1 ${openDropdownId === strand.id ? "show" : ""}`}
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
                        onClick={() => handleConfirmUpdateClick(strand)}
                      >
                        <i
                          className="bi bi-pencil-square me-2"
                          style={{ color: "var(--primary-color)" }}
                        ></i>{" "}
                        Update
                      </button>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item py-2 fw-medium text-danger"
                        onClick={() => confirmDelete(strand)}
                      >
                        <i className="bi bi-trash-fill me-2"></i> Delete
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="pe-4 position-relative z-1">
                  <h4 className="fw-bold text-white mb-1 text-truncate">
                    {strand.name}
                  </h4>
                  <span className="badge bg-white text-dark bg-opacity-25 px-2 py-1 fw-semibold shadow-sm">
                    Academic Strand
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
                  <i className="bi bi-diagram-3-fill"></i>
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
                    Description
                  </span>
                  <p className="text-dark small fw-medium mb-0 text-clamp-3">
                    {strand.description}
                  </p>
                </div>

                <div className="bg-light rounded-4 p-3 mt-auto border border-light-subtle d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle bg-success shadow-sm d-flex justify-content-center align-items-center me-2 flex-shrink-0"
                      style={{ width: "35px", height: "35px" }}
                    >
                      <i className="bi bi-people text-light"></i>
                    </div>
                    <span
                      className="text-muted fw-bold mb-0"
                      style={{ fontSize: "0.80rem" }}
                    >
                      Enrolled Students
                    </span>
                  </div>
                  <span className="text-success fw-bold fs-5 mb-0">
                    {strand.users_count || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredStrands.length === 0 && !isLoading && (
          <div className="col-12">
            <div className="p-5 bg-white rounded-4 shadow-sm text-center border-0 premium-hover-card">
              <i
                className="bi bi-inbox text-muted d-block mb-3"
                style={{ fontSize: "3rem", opacity: 0.5 }}
              ></i>
              <h5 className="fw-bold text-dark">No strands found.</h5>
              <p className="text-muted small mb-0">
                {debouncedSearch
                  ? "No matching strands for your search."
                  : "Click the 'New Strand' button to get started."}
              </p>
            </div>
          </div>
        )}
      </div>

      <StrandFormModal
        modalMode={modalMode}
        formData={formData}
        handleInputChange={handleInputChange}
        handleFormSubmit={handleFormSubmit}
        selectedStrand={selectedStrand}
        proceedToUpdateForm={proceedToUpdateForm}
        executeDelete={executeDelete}
      />
    </>
  );
};

export default Strands;
