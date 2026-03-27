import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import { useNavigate } from "react-router-dom";
import { Modal } from "bootstrap";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import AdminClassroomsModal from "./AdminClassroomsModal";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const AdminClassrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading Classrooms...");

  // Selection, Search, and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterGradeLevel, setFilterGradeLevel] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/classrooms`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      setClassrooms(res.data);
      setSelectedIds([]);
    } catch (error) {
      console.error("Error fetching classrooms", error);
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
      setSelectedIds(filteredClassrooms.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const confirmDelete = () => {
    const modal = new Modal(document.getElementById("deleteConfirmModal"));
    modal.show();
  };

  const executeDelete = async () => {
    setIsLoading(true);
    setLoadingText("Moving to Recycle Bin...");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/admin/classrooms/bulk-delete`,
        { ids: selectedIds },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      sileo.success({
        title: "Deleted",
        description: "Classrooms moved to recycle bin.",
        ...darkToast,
      });
      fetchClassrooms();
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: "Could not delete classrooms.",
        ...darkToast,
      });
      setIsLoading(false);
    }
  };

  const enterClassroom = (id) => {
    setIsLoading(true);
    setLoadingText("Entering Classroom...");
    setTimeout(() => {
      navigate(`/admin/classrooms/${id}`);
    }, 800);
  };

  const formatScheduleText = (schedule) => {
    try {
      const schedObj =
        typeof schedule === "string" ? JSON.parse(schedule) : schedule;
      if (
        !schedObj ||
        !Array.isArray(schedObj.days) ||
        schedObj.days.length === 0
      )
        return "No Schedule";

      const formatTime = (time24) => {
        if (!time24) return "";
        const [h, m] = time24.split(":");
        let hours = parseInt(h);
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `${hours}:${m} ${ampm}`;
      };

      return `${schedObj.days.join(", ")} | ${formatTime(
        schedObj.start_time,
      )} - ${formatTime(schedObj.end_time)}`;
    } catch (e) {
      return typeof schedule === "string" ? schedule : "Invalid Schedule";
    }
  };

  // KUKUNIN LAHAT NG UNIQUE GRADE LEVELS MULA SA CLASSROOMS PARA SA DROPDOWN
  const uniqueGradeLevels = [...new Set(classrooms.map((c) => c.grade_level))]
    .filter(Boolean)
    .sort((a, b) => a - b);

  // FILTER & SORT LOGIC
  let filteredClassrooms = classrooms.filter((c) => {
    const matchesSearch =
      `${c.subject?.description} ${c.section} ${c.creator?.first_name} ${c.creator?.last_name} ${c.code}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesGradeLevel =
      filterGradeLevel === "all" ||
      String(c.grade_level) === String(filterGradeLevel);

    return matchesSearch && matchesGradeLevel;
  });

  filteredClassrooms.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      {/* HEADER TITLE */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            Classroom Oversight <i className="bi bi-easel"></i>
          </h3>
          <p className="text-muted small mb-0">
            Monitor all active classrooms, manage records, and enforce
            compliance.
          </p>
        </div>
      </div>

      {/* UNIFIED TOP CONTROL BAR */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
        <div className="card-body p-3">
          <div className="d-flex flex-nowrap align-items-center gap-3 overflow-x-auto custom-scrollbar pb-1">
            {/* SELECT ALL CHECKBOX WITH PRIMARY PILL COUNTER */}
            <div className="d-flex align-items-center flex-shrink-0 pe-2">
              <div className="form-check m-0 d-flex align-items-center">
                <input
                  type="checkbox"
                  className="form-check-input mt-0 shadow-sm"
                  id="selectAll"
                  checked={
                    selectedIds.length === filteredClassrooms.length &&
                    filteredClassrooms.length > 0
                  }
                  onChange={handleSelectAll}
                  style={{
                    cursor: "pointer",
                    width: "1.2rem",
                    height: "1.2rem",
                  }}
                />
                <label
                  className="text-dark fw-bold mb-0 ms-2"
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
                placeholder="Search by Subject, Section, Code, or Teacher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* GRADE LEVEL FILTER */}
            <div
              className="input-group flex-shrink-0"
              style={{ width: "300px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-bar-chart-steps"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterGradeLevel}
                onChange={(e) => setFilterGradeLevel(e.target.value)}
              >
                <option value="all">All Grades</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </div>

            {/* SORT FILTER */}
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

            {/* SIMPLIFIED BULK DELETE BUTTON */}
            <div className="d-flex gap-2 flex-shrink-0 ms-auto ps-2">
              <button
                onClick={confirmDelete}
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
        {filteredClassrooms.map((item) => (
          <div className="col-12 col-md-6 col-xl-4" key={item.id}>
            <div
              className="card border-0 shadow-sm rounded-4 h-100 premium-hover-card bg-white"
              style={{ borderRadius: "1rem" }}
            >
              <div
                className="p-4 position-relative d-flex flex-column justify-content-end"
                style={{
                  backgroundColor: item.color_bg,
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

                {/* YUNG DATING DROPDOWN MENU PINALITAN NATIN NG CHECKBOX */}
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
                    title={item.subject?.description}
                  >
                    {item.subject?.description}
                  </h4>
                  <span className="badge bg-white text-dark bg-opacity-25 px-2 py-1 fw-semibold shadow-sm">
                    {item.section} • Grade {item.grade_level}
                  </span>
                </div>
              </div>

              <div className="card-body p-4 d-flex flex-column position-relative">
                <div
                  className="position-absolute shadow-sm rounded-circle d-flex justify-content-center align-items-center fw-bold text-white"
                  style={{
                    width: "55px",
                    height: "55px",
                    top: "-27px",
                    right: "24px",
                    backgroundColor: "var(--primary-color)",
                    border: "4px solid white",
                    fontSize: "1.3rem",
                  }}
                  title={`Creator: ${item.creator?.first_name} ${item.creator?.last_name}`}
                >
                  {item.creator?.first_name
                    ? item.creator.first_name.charAt(0).toUpperCase()
                    : "T"}
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
                    Creator
                  </span>
                  <div className="d-flex align-items-center">
                    <span className="text-dark small fw-bold">
                      {item.creator
                        ? `${item.creator.first_name} ${item.creator.last_name}`
                        : "Unknown Teacher"}
                    </span>
                  </div>
                </div>

                <div className="bg-light rounded-4 p-3 mb-4 border border-light-subtle flex-grow-1">
                  <div className="d-flex align-items-start mb-3">
                    <div
                      className="rounded-circle bg-white shadow-sm d-flex justify-content-center align-items-center me-3 flex-shrink-0"
                      style={{ width: "35px", height: "35px" }}
                    >
                      <i className="bi bi-calendar3 text-primary"></i>
                    </div>
                    <div className="overflow-hidden">
                      <span
                        className="d-block small text-muted fw-bold mb-1"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Class Schedule
                      </span>
                      <span className="d-block text-dark small fw-medium text-truncate">
                        {formatScheduleText(item.schedule)}
                      </span>
                    </div>
                  </div>
                  <div className="d-flex align-items-start">
                    <div
                      className="rounded-circle bg-white shadow-sm d-flex justify-content-center align-items-center me-3 flex-shrink-0"
                      style={{ width: "35px", height: "35px" }}
                    >
                      <i className="bi bi-people text-success"></i>
                    </div>
                    <div>
                      <span
                        className="d-block small text-muted fw-bold mb-1"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Enrolled Students
                      </span>
                      <span className="d-block text-dark small fw-medium">
                        <b
                          className={
                            item.enrolled_count >= item.capacity
                              ? "text-danger"
                              : "text-success"
                          }
                        >
                          {item.enrolled_count}
                        </b>{" "}
                        / {item.capacity}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                  <div className="d-flex flex-column">
                    <span
                      className="text-muted fw-bold text-uppercase mb-1"
                      style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                    >
                      Class Code
                    </span>
                    <span
                      className="badge bg-secondary bg-opacity-10 text-dark border px-3 py-2 fw-bold"
                      style={{ letterSpacing: "1px", fontSize: "0.85rem" }}
                    >
                      {item.code}
                    </span>
                  </div>
                  <button
                    onClick={() => enterClassroom(item.id)}
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
        {filteredClassrooms.length === 0 && !isLoading && (
          <div className="col-12">
            <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
              <i
                className="bi bi-easel text-muted d-block mb-3"
                style={{ fontSize: "3rem", opacity: 0.5 }}
              ></i>
              <h5 className="fw-bold text-dark">No Classrooms Found.</h5>
              <p className="text-muted small mb-0">
                No active classes available matching your query.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ADMIN CLASSROOM MODAL */}
      <AdminClassroomsModal
        selectedIdsCount={selectedIds.length}
        executeDelete={executeDelete}
      />
    </>
  );
};

export default AdminClassrooms;
