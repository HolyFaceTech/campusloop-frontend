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

const StudentClassrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading your classrooms...");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // STATE PARA SA CLASSROOM CODE
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    fetchMyClassrooms();
  }, []);

  const fetchMyClassrooms = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/student/classrooms`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      setClassrooms(res.data);
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

  // TRIGGER MODAL PARA MAG-JOIN
  const triggerJoinModal = () => {
    setJoinCode("");
    new Modal(document.getElementById("joinClassroomModal")).show();
  };

  // EXECUTE JOIN REQUEST
  const executeJoinClassroom = async (e) => {
    e.preventDefault();
    Modal.getInstance(document.getElementById("joinClassroomModal"))?.hide();

    setIsLoading(true);
    setLoadingText("Sending join request...");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/student/classrooms/join`,
        { code: joinCode },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
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

      return `${schedObj.days.join(", ")} | ${formatTime(
        schedObj.start_time,
      )} - ${formatTime(schedObj.end_time)}`;
    } catch (e) {
      return typeof schedule === "string" ? schedule : "Invalid Schedule";
    }
  };

  const filteredClassrooms = classrooms.filter((item) => {
    const searchStr =
      `${item.subject?.description} ${item.subject?.code} ${item.section} ${item.creator?.first_name} ${item.creator?.last_name}`.toLowerCase();
    return searchStr.includes(searchQuery.toLowerCase());
  });

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

      <div className="row mb-4">
        <div className="col-12 col-md-6 col-xl-4">
          <div className="input-group shadow-sm rounded-3 overflow-hidden">
            <span className="input-group-text bg-white border-end-0 text-muted px-3">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0 toolbar-input"
              placeholder="Search Subject, Section, or Teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row g-4">
        {filteredClassrooms.length > 0 ? (
          filteredClassrooms.map((item) => (
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
                        {item.code || "---"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleEnterClassroom(item.id)}
                      className="btn btn-campusloop rounded-3 fw-bold px-4 shadow-sm"
                    >
                      Enter <i className="bi bi-arrow-right ms-1"></i>
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
                className="bi bi-easel text-muted d-block mb-3"
                style={{ fontSize: "3rem", opacity: 0.5 }}
              ></i>
              <h5 className="fw-bold text-dark">No classrooms found.</h5>
              <p className="text-muted small mb-0">
                You are not enrolled in any active classroom yet. Click "Join
                Class" to request entry.
              </p>
            </div>
          </div>
        )}
      </div>

      <StudentClassroomsModals
        joinCode={joinCode}
        setJoinCode={setJoinCode}
        executeJoinClassroom={executeJoinClassroom}
      />
    </>
  );
};

export default StudentClassrooms;
