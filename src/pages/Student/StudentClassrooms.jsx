import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import { useNavigate } from "react-router-dom";
import { Modal } from "bootstrap";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import StudentClassroomsModals from "./StudentClassroomsModals";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

// CENTRALIZED TOKEN HELPER
const getAuthHeader = () => {
  const token =
    localStorage.getItem("campusloop_token") ||
    sessionStorage.getItem("campusloop_token");
  return {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  };
};

const StudentClassrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [joinCode, setJoinCode] = useState("");
  const navigate = useNavigate();

  // RESET PAGE PAG MAY NAGBAGO SA SEARCH O ENTRIES
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage]);

  // DEBOUNCE EFFECT (500ms server request delay)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMyClassrooms();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentPage, entriesPerPage]);

  const fetchMyClassrooms = async () => {
    setIsLoading(true);
    setLoadingText("Loading Classrooms...");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/student/classrooms`,
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
        title: "Fetch Error",
        description: "Failed to load classrooms.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterClassroom = (classroomId) => {
    setIsLoading(true);
    setLoadingText("Entering Classroom...");
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/student/classrooms/${classroomId}/stream`);
    }, 800);
  };

  const triggerJoinModal = () => {
    setJoinCode("");
    new Modal(document.getElementById("joinClassroomModal")).show();
  };

  const executeJoinClassroom = async (e) => {
    e.preventDefault();
    Modal.getInstance(document.getElementById("joinClassroomModal"))?.hide();

    setIsLoading(true);
    setLoadingText("Sending join request...");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/student/classrooms/join`,
        { code: joinCode },
        getAuthHeader(),
      );
      sileo.success({
        title: "Request Sent",
        description: res.data.message,
        ...darkToast,
      });
      fetchMyClassrooms();
    } catch (error) {
      sileo.error({
        title: "Failed to Join",
        description: error.response?.data?.message || "Invalid classroom code.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
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
      return `${schedObj.days.join(", ")} | ${formatTime(schedObj.start_time)} - ${formatTime(schedObj.end_time)}`;
    } catch (e) {
      return typeof schedule === "string" ? schedule : "Invalid Schedule";
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
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-3 gap-3">
        <div>
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            My Classrooms <i className="bi bi-easel"></i>
          </h3>
          <p className="text-muted small mb-0">
            View and enter all your enrolled and approved classes.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={triggerJoinModal}
            className="btn btn-campusloop shadow-sm px-4 rounded-3 d-flex align-items-center gap-2 w-100 justify-content-center"
          >
            <i className="bi bi-plus-lg fs-5"></i> Join Class
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
                placeholder="Search Subject, Section, or Teacher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {classrooms.length > 0
          ? classrooms.map((item) => (
              <div className="col-12 col-md-6 col-xl-4" key={item.id}>
                <div
                  className="card border-0 shadow-sm rounded-4 h-100 premium-hover-card bg-white"
                  style={{ borderRadius: "1rem" }}
                >
                  <div
                    className="p-4 position-relative d-flex flex-column justify-content-end"
                    style={{
                      backgroundColor: item.color_bg || "var(--primary-color)",
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
                    <div className="pe-4 position-relative z-1">
                      <h4
                        className="fw-bold text-white mb-1 text-truncate"
                        title={item.subject?.description || "Unknown Subject"}
                      >
                        {item.subject?.description || "Unknown Subject"}
                      </h4>
                      <span className="badge bg-white text-dark bg-opacity-25 px-2 py-1 fw-semibold shadow-sm">
                        {item.section}{" "}
                        {item.grade_level ? `• Grade ${item.grade_level}` : ""}
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
                      title={`Teacher: ${item.creator?.first_name} ${item.creator?.last_name}`}
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
                        Teacher
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
                          {item.code || "---"}
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
            ))
          : !isLoading && (
              <div className="col-12">
                <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
                  <i
                    className="bi bi-inbox text-muted d-block mb-3"
                    style={{ fontSize: "3rem", opacity: 0.5 }}
                  ></i>
                  <h5 className="fw-bold text-dark">No classrooms found.</h5>
                  <p className="text-muted small mb-0">
                    {searchQuery
                      ? "No matching classrooms found for your search."
                      : 'You are not enrolled in any active classroom yet. Click "Join Class" to request entry.'}
                  </p>
                </div>
              </div>
            )}
      </div>

      {totalRecords > 0 && !isLoading && (
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 mb-4 px-2 gap-3">
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

      <StudentClassroomsModals
        joinCode={joinCode}
        setJoinCode={setJoinCode}
        executeJoinClassroom={executeJoinClassroom}
      />
    </>
  );
};

export default StudentClassrooms;
