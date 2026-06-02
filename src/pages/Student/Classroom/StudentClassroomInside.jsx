import React, { useState, useEffect } from "react";
import {
  useParams,
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import axios from "axios";
import { sileo } from "sileo";
import GlobalSpinner from "../../../components/Shared/GlobalSpinner";

// CENTRALIZED TOKEN HELPER
const getAuthHeader = () => {
  const token =
    localStorage.getItem("campusloop_token") ||
    sessionStorage.getItem("campusloop_token");
  return {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  };
};

const StudentClassroomInside = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [classroom, setClassroom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClassroomDetails();
  }, [id]);

  useEffect(() => {
    if (classroom && location.pathname === `/student/classrooms/${id}`) {
      navigate(`/student/classrooms/${id}/stream`, { replace: true });
    }
  }, [classroom, location, navigate, id]);

  const fetchClassroomDetails = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/student/classrooms/${id}`,
        getAuthHeader(),
      );
      setClassroom(res.data);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to load classroom data.",
      });
      navigate("/student/classrooms");
    } finally {
      setIsLoading(false);
    }
  };

  const formatSchedule = (schedule) => {
    try {
      const sched =
        typeof schedule === "string" ? JSON.parse(schedule) : schedule;
      if (!sched || !Array.isArray(sched.days)) return "No Schedule Setup";
      const formatTime = (time24) => {
        if (!time24) return "";
        const [h, m] = time24.split(":");
        let hours = parseInt(h);
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `${hours}:${m} ${ampm}`;
      };
      return `${sched.days.join(", ")} | ${formatTime(sched.start_time)} - ${formatTime(sched.end_time)}`;
    } catch (e) {
      return "Invalid Schedule";
    }
  };

  if (isLoading)
    return <GlobalSpinner isLoading={true} text="Entering Classroom..." />;
  if (!classroom) return null;

  return (
    <div className="classroom-view-container custom-scrollbar">
      <div
        className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 position-relative premium-hover-card"
        style={{
          minHeight: "280px",
          backgroundColor: classroom.color_bg || "var(--primary-color)",
        }}
      >
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundImage: "url('/images/classroom.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.3,
            mixBlendMode: "overlay",
          }}
        ></div>

        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%)",
          }}
        ></div>

        <div className="card-body p-4 p-md-5 d-flex flex-column justify-content-between position-relative z-1 h-100">
          <div className="d-flex justify-content-between align-items-start gap-4">
            <div>
              <span
                className="badge bg-white text-dark bg-opacity-25 px-3 py-2 mb-3 fw-semibold shadow-sm rounded-pill"
                style={{ backdropFilter: "blur(5px)" }}
              >
                <i className="bi bi-door-open me-2"></i>
                {classroom.section} • Grade {classroom.grade_level}
              </span>
              <h1
                className="fw-bold text-white mb-2"
                style={{ letterSpacing: "-1px", fontSize: "2.5rem" }}
              >
                {classroom.subject?.description || "Classroom"}
              </h1>
              <div className="d-flex align-items-center text-white opacity-75 fw-medium mt-2">
                <i className="bi bi-people-fill me-2 fs-5"></i>{" "}
                {classroom.enrolled_count || 0} Enrolled Students
              </div>
            </div>

            <div className="text-center d-none d-sm-block">
              <div
                className="shadow-sm rounded-circle d-flex justify-content-center align-items-center fw-bold text-white mx-auto"
                style={{
                  width: "65px",
                  height: "65px",
                  backgroundColor: "var(--secondary-color)",
                  border: "3px solid rgba(255, 255, 255, 0.4)",
                  fontSize: "1.8rem",
                }}
                title={`Teacher: ${classroom.creator?.first_name || "Unknown"} ${classroom.creator?.last_name || ""}`}
              >
                {classroom.creator?.first_name
                  ? classroom.creator.first_name.charAt(0).toUpperCase()
                  : "T"}
              </div>
              <span
                className="d-block text-white opacity-75 small mt-2 fw-medium text-uppercase"
                style={{ letterSpacing: "1px", fontSize: "0.65rem" }}
              >
                Instructor
              </span>
            </div>
          </div>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mt-5 pt-4 border-top border-white border-opacity-10 gap-3">
            <div className="d-flex align-items-center text-white opacity-75 fw-medium">
              <div
                className="bg-white bg-opacity-25 p-2 rounded-circle me-3 d-flex align-items-center justify-content-center"
                style={{
                  width: "40px",
                  height: "40px",
                  backdropFilter: "blur(5px)",
                }}
              >
                <i className="bi bi-calendar3 text-white fs-5"></i>
              </div>
              <div>
                <span
                  className="d-block small opacity-75 text-uppercase"
                  style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                >
                  Class Schedule
                </span>
                <span className="d-block fs-6">
                  {formatSchedule(classroom.schedule)}
                </span>
              </div>
            </div>

            <div
              className="d-flex align-items-center gap-3 bg-dark bg-opacity-50 p-2 pe-3 rounded-pill shadow-sm"
              style={{ backdropFilter: "blur(5px)" }}
            >
              <div
                className="bg-white text-dark rounded-circle d-flex justify-content-center align-items-center"
                style={{ width: "35px", height: "35px" }}
              >
                <i className="bi bi-upc-scan"></i>
              </div>
              <div>
                <span
                  className="text-white opacity-75 small text-uppercase fw-bold me-2"
                  style={{ fontSize: "0.70rem", letterSpacing: "1px" }}
                >
                  Class Code:
                </span>
                <span className="text-white fs-5 fw-bold font-monospace tracking-wide">
                  {classroom.code}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-4 shadow-sm mb-4 overflow-hidden">
        <ul className="nav nav-justified custom-premium-tabs m-0">
          <li className="nav-item">
            <NavLink
              to={`/student/classrooms/${id}/stream`}
              className="nav-link d-flex align-items-center justify-content-center fs-6"
            >
              <i className="bi bi-journal-text me-2"></i> Stream
            </NavLink>
          </li>
          <li className="nav-item border-start">
            <NavLink
              to={`/student/classrooms/${id}/grades`}
              className="nav-link d-flex align-items-center justify-content-center fs-6"
            >
              <i className="bi bi-file-earmark-spreadsheet-fill me-2"></i>{" "}
              Grades
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="tab-content-wrapper pb-5">
        <Outlet context={{ classroom }} />
      </div>
    </div>
  );
};

export default StudentClassroomInside;
