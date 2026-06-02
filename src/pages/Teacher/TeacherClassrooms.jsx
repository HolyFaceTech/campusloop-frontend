import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import { useNavigate } from "react-router-dom";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import ClassroomFormDrawer from "./ClassroomFormDrawer";
import { Modal, Offcanvas } from "bootstrap";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const getAuthHeader = () => {
  const token =
    localStorage.getItem("campusloop_token") ||
    sessionStorage.getItem("campusloop_token");
  return {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  };
};

const TeacherClassrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [drawerMode, setDrawerMode] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [formData, setFormData] = useState({
    section: "",
    strand_id: "",
    grade_level: "",
    subject_id: "",
    capacity: "",
    color_bg: "#626F47",
    schedule: { days: [], start_time: "", end_time: "" },
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchClassrooms();
    }, 500);

    const closeDropdown = () => setOpenDropdownId(null);
    document.addEventListener("click", closeDropdown);

    return () => {
      clearTimeout(delayDebounceFn);
      document.removeEventListener("click", closeDropdown);
    };
  }, [searchQuery, currentPage, entriesPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage]);

  const fetchClassrooms = async () => {
    setIsLoading(true);
    setLoadingText("Loading classrooms...");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/classrooms`,
        {
          ...getAuthHeader(),
          params: {
            search: searchQuery,
            page: currentPage,
            entries: entriesPerPage,
          },
        },
      );
      setClassrooms(res.data.data || []);
      setTotalPages(res.data.last_page || 1);
      setTotalRecords(res.data.total || 0);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to fetch classrooms.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleScheduleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...(prev.schedule || { days: [], start_time: "", end_time: "" }),
        [field]: value,
      },
    }));
  };

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedItem(null);
    setFormData({
      section: "",
      strand_id: "",
      grade_level: "",
      subject_id: "",
      capacity: "",
      color_bg: "#626F47",
      schedule: { days: [], start_time: "", end_time: "" },
    });
    new Offcanvas(document.getElementById("classroomDrawer")).show();
  };

  const promptUpdate = (item) => {
    setSelectedItem(item);
    new Modal(document.getElementById("updateConfirmModal")).show();
  };

  const proceedToUpdate = () => {
    setDrawerMode("update");
    let parsedSchedule = { days: [], start_time: "", end_time: "" };
    if (selectedItem.schedule) {
      parsedSchedule =
        typeof selectedItem.schedule === "object"
          ? selectedItem.schedule
          : JSON.parse(selectedItem.schedule);
    }
    setFormData({
      section: selectedItem.section,
      strand_id: selectedItem.strand_id,
      grade_level: selectedItem.grade_level,
      subject_id: selectedItem.subject_id,
      capacity: selectedItem.capacity,
      color_bg: selectedItem.color_bg,
      schedule: parsedSchedule,
    });

    setTimeout(() => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      new Offcanvas(document.getElementById("classroomDrawer")).show();
    }, 400);
  };

  const handleSubmit = () => {
    if (
      !formData.section ||
      !formData.strand_id ||
      !formData.subject_id ||
      !formData.capacity
    ) {
      sileo.error({
        title: "Incomplete",
        description: "Please fill in all required fields.",
        ...darkToast,
      });
      return;
    }
    const safeSchedule = formData.schedule || {};
    if (
      (safeSchedule.days || []).length === 0 ||
      !safeSchedule.start_time ||
      !safeSchedule.end_time
    ) {
      sileo.error({
        title: "Invalid Schedule",
        description: "Please select days and setup the time.",
        ...darkToast,
      });
      return;
    }
    if (safeSchedule.start_time >= safeSchedule.end_time) {
      sileo.error({
        title: "Invalid Time",
        description: "End time must be after Start time.",
        ...darkToast,
      });
      return;
    }

    Offcanvas.getInstance(document.getElementById("classroomDrawer"))?.hide();
    setTimeout(() => {
      document
        .querySelectorAll(".offcanvas-backdrop")
        .forEach((el) => el.remove());
      executeSubmit();
    }, 300);
  };

  const executeSubmit = async () => {
    setIsLoading(true);
    setLoadingText(
      drawerMode === "create" ? "Creating Classroom..." : "Saving Changes...",
    );
    try {
      if (drawerMode === "create") {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/classrooms`,
          formData,
          getAuthHeader(),
        );
        sileo.success({
          title: "Success",
          description: `Classroom created! Code: ${res.data.code}`,
          ...darkToast,
        });
      } else {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/classrooms/${selectedItem.id}`,
          formData,
          getAuthHeader(),
        );
        sileo.success({
          title: "Updated",
          description: "Classroom updated.",
          ...darkToast,
        });
      }
      fetchClassrooms();
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: "Process failed.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const promptDelete = (item) => {
    setSelectedItem(item);
    new Modal(document.getElementById("deleteConfirmModal")).show();
  };

  const executeDelete = async () => {
    setIsLoading(true);
    setLoadingText("Moving to Recycle Bin...");
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/classrooms/${selectedItem.id}`,
        getAuthHeader(),
      );
      sileo.success({
        title: "Deleted",
        description: "Classroom removed.",
        ...darkToast,
      });
      fetchClassrooms();
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: "Deletion failed.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterClassroom = (id) => {
    setIsLoading(true);
    setLoadingText("Entering Classroom...");
    setTimeout(() => {
      navigate(`/teacher/classrooms/${id}`);
      setIsLoading(false);
    }, 800);
  };

  const formatScheduleText = (schedule) => {
    try {
      const s = typeof schedule === "string" ? JSON.parse(schedule) : schedule;
      if (!s || !s.days?.length) return "No Schedule";
      const fmt = (t) => {
        if (!t) return "";
        const [h, m] = t.split(":");
        const h12 = h % 12 || 12;
        return `${h12}:${m} ${h >= 12 ? "PM" : "AM"}`;
      };
      return `${s.days.join(", ")} | ${fmt(s.start_time)} - ${fmt(s.end_time)}`;
    } catch (e) {
      return "Invalid Schedule";
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

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-3 gap-3">
        <div>
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            Classroom Management <i className="bi bi-easel"></i>
          </h3>
          <p className="text-muted small mb-0">
            Create and manage your digital classrooms.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={openCreateDrawer}
            className="btn btn-campusloop shadow-sm px-4 rounded-3 d-flex align-items-center gap-2 w-100 justify-content-center"
          >
            <i className="bi bi-plus-lg fs-5"></i> New Classroom
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden premium-hover-card">
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
                placeholder="Search Subject, Section, or Code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {classrooms.map((item) => (
          <div
            className="col-12 col-md-6 col-xl-4"
            key={item.id}
            style={{
              zIndex: openDropdownId === item.id ? 1050 : 1,
              position: openDropdownId === item.id ? "relative" : "static",
            }}
          >
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
                  className="dropdown position-absolute top-0 end-0 mt-3 me-3"
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
                    className={`dropdown-menu shadow-sm border-0 rounded-3 mt-1 ${openDropdownId === item.id ? "show" : ""}`}
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: "0",
                      left: "auto",
                      minWidth: "160px",
                    }}
                  >
                    <li>
                      <button
                        className="dropdown-item py-2 fw-medium"
                        onClick={() => {
                          promptUpdate(item);
                          setOpenDropdownId(null);
                        }}
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
                        onClick={() => {
                          promptDelete(item);
                          setOpenDropdownId(null);
                        }}
                      >
                        <i className="bi bi-trash-fill me-2"></i> Delete
                      </button>
                    </li>
                  </ul>
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
                >
                  {item.creator?.first_name?.charAt(0).toUpperCase()}
                </div>
                <div className="mb-3 mt-1">
                  <span
                    className="d-block text-muted mb-1 text-uppercase fw-bold"
                    style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                  >
                    Creator
                  </span>
                  <span className="text-dark small fw-bold">
                    {item.creator?.first_name} {item.creator?.last_name}
                  </span>
                </div>
                <div className="bg-light rounded-4 p-3 mb-4 border border-light-subtle flex-grow-1">
                  <div className="d-flex align-items-start mb-3">
                    <div
                      className="rounded-circle bg-primary shadow-sm d-flex justify-content-center align-items-center me-3 flex-shrink-0"
                      style={{ width: "35px", height: "35px" }}
                    >
                      <i className="bi bi-calendar3 text-white"></i>
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
                      className="rounded-circle bg-success shadow-sm d-flex justify-content-center align-items-center me-3 flex-shrink-0"
                      style={{ width: "35px", height: "35px" }}
                    >
                      <i className="bi bi-people text-white"></i>
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
                      className="badge bg-secondary bg-opacity-10 text-dark border px-3 py-2 fw-bold shadow-sm"
                      style={{ letterSpacing: "1px", fontSize: "0.85rem" }}
                    >
                      {item.code}
                    </span>
                  </div>
                  <button
                    onClick={() => handleEnterClassroom(item.id)}
                    className="btn btn-campusloop rounded-3 fw-bold px-4 shadow-sm"
                  >
                    <span className="d-none d-sm-inline">Enter</span>{" "}
                    <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {classrooms.length === 0 && !isLoading && (
          <div className="col-12">
            <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
              <i
                className="bi bi-inbox text-muted d-block mb-3"
                style={{ fontSize: "3rem", opacity: 0.5 }}
              ></i>
              <h5 className="fw-bold text-dark">No classrooms found.</h5>
              <p className="text-muted small mb-0">
                {searchQuery
                  ? "Try adjusting your search query."
                  : "Click the 'New Classroom' button to get started."}
              </p>
            </div>
          </div>
        )}
      </div>

      {totalRecords > 0 && !isLoading && (
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-2 mb-4 px-1 gap-3">
          <span className="text-muted small">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
            {totalRecords} classrooms
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

      <ClassroomFormDrawer
        drawerMode={drawerMode}
        formData={formData}
        handleInputChange={handleInputChange}
        handleScheduleChange={handleScheduleChange}
        handleSubmit={handleSubmit}
        executeDelete={executeDelete}
        proceedToUpdate={proceedToUpdate}
        selectedItem={selectedItem}
      />
    </>
  );
};

export default TeacherClassrooms;
