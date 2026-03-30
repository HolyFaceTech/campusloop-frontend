import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import { useNavigate } from "react-router-dom";
import { Modal } from "bootstrap";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import { DeleteFormsModal } from "./AdminFormModals";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const AdminForms = () => {
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading forms...");

  // States para sa Unified Control Bar
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterTeacher, setFilterTeacher] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/forms`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      setForms(res.data);
      setSelectedIds([]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (e, id) => {
    if (e.target.checked) setSelectedIds([...selectedIds, id]);
    else setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredForms.map((f) => f.id));
    } else {
      setSelectedIds([]);
    }
  };

  const confirmBulkDelete = () => {
    const modal = new Modal(document.getElementById("deleteFormsModal"));
    modal.show();
  };

  const executeBulkDelete = async () => {
    setIsLoading(true);
    setLoadingText("Moving to Recycle Bin...");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/admin/forms/bulk-delete`,
        { ids: selectedIds },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      sileo.success({
        title: "Deleted",
        description: "Forms moved to recycle bin.",
        ...darkToast,
      });
      fetchForms();
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: "Could not delete.",
        ...darkToast,
      });
      setIsLoading(false);
    }
  };

  // KUKUNIN ANG MGA UNIQUE TEACHERS PARA SA DROPDOWN
  const uniqueTeachersMap = new Map();
  forms.forEach((f) => {
    if (f.creator) {
      uniqueTeachersMap.set(
        f.creator.id,
        `${f.creator.first_name} ${f.creator.last_name}`,
      );
    }
  });
  const uniqueTeachers = Array.from(uniqueTeachersMap.entries());

  // FILTER & SORT LOGIC
  let filteredForms = forms.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.creator &&
        `${f.creator.first_name} ${f.creator.last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));

    const matchesTeacher =
      filterTeacher === "all" ||
      (f.creator && String(f.creator.id) === String(filterTeacher));

    return matchesSearch && matchesTeacher;
  });

  filteredForms.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="container-fluid px-0">
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      {/* HEADER TITLE */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-4 gap-3">
        <div>
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            Quiz & Exam Forms <i className="bi bi-ui-radios"></i>
          </h3>
          <p className="text-muted small mb-0">
            Manage, monitor, and print all school assessments created by
            teachers.
          </p>
        </div>
      </div>

      {/* UNIFIED TOP CONTROL BAR */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
        <div className="card-body p-3">
          <div className="d-flex flex-nowrap align-items-center gap-3 overflow-x-auto custom-scrollbar pb-1">
            {/* SELECT ALL CHECKBOX */}
            <div className="d-flex align-items-center flex-shrink-0 pe-2">
              <div className="form-check m-0 d-flex align-items-center">
                <input
                  type="checkbox"
                  className="form-check-input mt-0 shadow-sm"
                  id="selectAll"
                  checked={
                    selectedIds.length === filteredForms.length &&
                    filteredForms.length > 0
                  }
                  onChange={handleSelectAll}
                  style={{
                    cursor: "pointer",
                    width: "1.2rem",
                    height: "1.2rem",
                  }}
                />
                <label
                  className="text-dark fw-bold mb-0 ms-2 pe-2"
                  htmlFor="selectAll"
                  style={{ cursor: "pointer" }}
                >
                  Select All
                  <span className="badge bg-primary rounded-pill ms-2">
                    {selectedIds.length}
                  </span>
                </label>
              </div>
            </div>

            {/* EXPANDED SEARCH INPUT */}
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
                placeholder="Search by Form Name or Teacher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* FILTER BY TEACHER */}
            <div
              className="input-group flex-shrink-0"
              style={{ width: "300px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-person-badge"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
              >
                <option value="all">All Teachers</option>
                {uniqueTeachers.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* SORT ORDER */}
            <div
              className="input-group flex-shrink-0"
              style={{ width: "300px" }}
            >
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

            {/* DELETE BUTTON */}
            <div className="d-flex gap-2 flex-shrink-0 ms-auto ps-2">
              <button
                onClick={confirmBulkDelete}
                disabled={selectedIds.length === 0}
                className="btn btn-danger d-flex align-items-center justify-content-center gap-2 py-2 px-3 rounded-3 shadow-sm ms-2"
              >
                <i className="bi bi-trash3-fill"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GRID CARDS */}
      <div className="row g-4">
        {filteredForms.map((item) => (
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
                {/* Decorative Circles */}
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
                {/* ADMIN SELECTION CHECKBOX (Top Right) */}
                <div
                  className="dropdown position-absolute top-0 end-0 mt-3 me-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="d-flex justify-content-center align-items-center rounded-circle"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.2)",
                      width: "32px",
                      height: "32px",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input m-0 shadow-none border-0"
                      checked={selectedIds.includes(item.id)}
                      onChange={(e) => handleSelect(e, item.id)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
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
                {/* FLOATING ICON */}
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
                          className="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25"
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.25rem 0.4rem",
                          }}
                        >
                          {item.timer} Mins
                        </span>
                      ) : (
                        <span
                          className="badge bg-light text-muted border"
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
                          className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25"
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.25rem 0.4rem",
                          }}
                        >
                          Focus ON
                        </span>
                      ) : (
                        <span
                          className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25"
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
                          className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25"
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.25rem 0.4rem",
                          }}
                        >
                          ON
                        </span>
                      ) : (
                        <span
                          className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25"
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
                    onClick={() => navigate(`/admin/forms/${item.id}`)}
                    className="btn btn-campusloop rounded-3 fw-bold px-4 shadow-sm"
                  >
                    Enter <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* EMPTY STATE */}
        {filteredForms.length === 0 && !isLoading && (
          <div className="col-12">
            <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
              <i
                className="bi bi-ui-radios text-muted d-block mb-3"
                style={{ fontSize: "3rem", opacity: 0.5 }}
              ></i>
              <h5 className="fw-bold text-dark">No Forms Found.</h5>
              <p className="text-muted small mb-0">
                {searchQuery || filterTeacher !== "all"
                  ? "No matching forms for your search or filter."
                  : "No quiz or exam forms have been created yet."}
              </p>
            </div>
          </div>
        )}
      </div>

      <DeleteFormsModal executeBulkDelete={executeBulkDelete} />
    </div>
  );
};

export default AdminForms;
