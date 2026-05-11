import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";

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

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [strandYear, setStrandYear] = useState("");
  const [statusYear, setStatusYear] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const adminUser = JSON.parse(
    localStorage.getItem("campusloop_user") ||
      sessionStorage.getItem("campusloop_user") ||
      "{}",
  );
  const adminName = adminUser.first_name || "Admin";

  const fetchDashboardData = async (
    showSpinner = true,
    filterStrandYr = strandYear,
    filterStatusYr = statusYear,
  ) => {
    if (showSpinner) setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/dashboard?strand_year=${filterStrandYr}&status_year=${filterStatusYr}`,
        getAuthHeader(),
      );
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      sileo.error({
        title: "Server Error",
        description: "Failed to load dashboard data.",
        ...darkToast,
      });
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(true);

    const handleClickOutside = (event) => {
      if (!event.target.closest(".custom-chart-dropdown")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStrandYearChange = (year) => {
    setStrandYear(year);
    setOpenDropdown(null);
    fetchDashboardData(false, year, statusYear);
  };

  const handleStatusYearChange = (year) => {
    setStatusYear(year);
    setOpenDropdown(null);
    fetchDashboardData(false, strandYear, year);
  };

  const CHART_COLORS = [
    "#626F47",
    "#A4B465",
    "#F5ECD5",
    "#D9534F",
    "#82ca9d",
    "#8884d8",
  ];
  const DOUGHNUT_COLORS = ["#626F47", "#dc3545"];

  let totalUsers = 0;
  let activeUsers = 0;
  let activePercentage = 0;
  if (data?.user_status) {
    totalUsers = data.user_status.reduce((sum, entry) => sum + entry.value, 0);
    activeUsers =
      data.user_status.find((e) => e.status === "active")?.value || 0;
    activePercentage =
      totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
  }

  if (isLoading || !data) {
    return <GlobalSpinner isLoading={true} text="Loading Dashboard Data..." />;
  }

  return (
    <div className="container-fluid px-0">
      {/* WELCOME & ANNOUNCEMENTS */}
      <div className="row g-4 mb-4 align-items-stretch">
        <div className="col-12 col-xl-8 d-flex flex-column">
          <div
            className="card border-0 shadow-sm rounded-4 overflow-hidden position-relative h-100 flex-grow-1 premium-hover-card"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-color) 0%, #4a5435 100%)",
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

            <div className="card-body p-4 p-md-5 position-relative z-1 d-flex align-items-center">
              <div className="text-white w-75">
                <span
                  className="badge bg-white text-dark bg-opacity-25 px-2 py-1 fw-semibold shadow-sm mb-2 text-uppercase"
                  style={{ letterSpacing: "1px" }}
                >
                  <i className="bi bi-speedometer2 me-1"></i> System Overview
                </span>
                <h2 className="fw-bold mb-2 display-6 text-white">
                  Welcome back, {adminName}!{" "}
                  <span className="wave-icon">👋</span>
                </h2>
                <p
                  className="mb-0 text-white text-opacity-75"
                  style={{ fontSize: "1rem" }}
                >
                  Monitor system activity, user growth, and content uploads
                  here.
                </p>
              </div>
              <img
                src="/images/admin.svg"
                alt="Admin Illustration"
                className="position-absolute d-none d-sm-block"
                style={{
                  right: "2%",
                  bottom: "-15px",
                  height: "170px",
                  filter: "drop-shadow(-5px 10px 10px rgba(0,0,0,0.3))",
                }}
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4 d-flex">
          <div className="card border-0 shadow-sm rounded-4 bg-white d-flex flex-column w-100 h-100 premium-hover-card">
            <div
              className="card-header bg-light border-bottom p-3 d-flex justify-content-between align-items-center rounded-top-4 flex-shrink-0"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/admin/announcements")}
              title="Go to Announcements"
            >
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center hover-primary transition-all">
                <i className="bi bi-megaphone fs-5 me-2"></i>
                Announcements
              </h6>
              <span className="badge bg-primary fw-medium rounded-3 shadow-sm">
                {data.recent_announcements?.length || 0}
              </span>
            </div>

            <div
              className="card-body p-2 custom-scrollbar flex-grow-1"
              style={{ overflowY: "auto", minHeight: "0" }}
            >
              {data.recent_announcements?.length === 0 ? (
                <div className="p-4 text-center mt-4">
                  <i
                    className="bi bi-bell-slash text-primary opacity-50 d-block mb-2"
                    style={{ fontSize: "2.5rem" }}
                  ></i>
                  <span className="d-block fw-bold text-dark mb-1">
                    No Announcements!
                  </span>
                  <span className="small text-muted">
                    There are no published announcements right now.
                  </span>
                </div>
              ) : (
                <div className="d-flex flex-column gap-1">
                  {data.recent_announcements?.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-2 rounded-3 hover-bg-light transition-all"
                      style={{
                        cursor: "pointer",
                        borderLeft: "3px solid transparent",
                      }}
                      onClick={() => navigate("/admin/announcements")}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderLeftColor =
                          "var(--bs-primary)";
                        e.currentTarget.style.backgroundColor =
                          "rgba(13, 110, 253, 0.04)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderLeftColor = "transparent";
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div className="d-flex align-items-start gap-2">
                        <div
                          className="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0 mt-1"
                          style={{
                            width: "32px",
                            height: "32px",
                            backgroundColor: "var(--bs-primary)",
                            color: "white",
                          }}
                        >
                          <i
                            className="bi bi-info-circle-fill text-center"
                            style={{ fontSize: "0.85rem" }}
                          ></i>
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <span
                            className="small fw-bold text-dark text-truncate d-block"
                            title={announcement.title}
                          >
                            {announcement.title}
                          </span>
                          <div
                            className="text-muted d-flex justify-content-between align-items-center pe-2"
                            style={{ fontSize: "0.7rem" }}
                          >
                            <span>
                              <i className="bi bi-calendar me-1"></i>{" "}
                              {announcement.date}
                            </span>
                            <span>
                              <i className="bi bi-clock me-1"></i>{" "}
                              {announcement.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 d-flex flex-row align-items-center justify-content-between premium-hover-card h-100">
            <div>
              <span
                className="d-block text-muted mb-1 fw-bold text-uppercase"
                style={{ fontSize: "0.75rem" }}
              >
                Total Students
              </span>
              <h2 className="fw-bolder text-dark mb-0 display-6">
                {data.stats.total_students}
              </h2>
            </div>
            <div
              className="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
              style={{
                width: "55px",
                height: "55px",
                backgroundColor: "rgba(71, 111, 71, 0.1)",
              }}
            >
              <i className="bi bi-people-fill fs-3 text-success"></i>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 d-flex flex-row align-items-center justify-content-between premium-hover-card h-100">
            <div>
              <span
                className="d-block text-muted mb-1 fw-bold text-uppercase"
                style={{ fontSize: "0.75rem" }}
              >
                Total Teachers
              </span>
              <h2 className="fw-bolder text-dark mb-0 display-6">
                {data.stats.total_teachers}
              </h2>
            </div>
            <div
              className="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
              style={{
                width: "55px",
                height: "55px",
                backgroundColor: "rgba(13, 110, 253, 0.1)",
              }}
            >
              <i className="bi bi-person-video3 fs-3 text-primary"></i>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 d-flex flex-row align-items-center justify-content-between premium-hover-card h-100">
            <div>
              <span
                className="d-block text-muted mb-1 fw-bold text-uppercase"
                style={{ fontSize: "0.75rem" }}
              >
                Active Classes
              </span>
              <h2 className="fw-bolder text-dark mb-0 display-6">
                {data.stats.active_classrooms}
              </h2>
            </div>
            <div
              className="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
              style={{
                width: "55px",
                height: "55px",
                backgroundColor: "rgba(217, 83, 79, 0.1)",
              }}
            >
              <i className="bi bi-easel-fill fs-3 text-danger"></i>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 d-flex flex-row align-items-center justify-content-between premium-hover-card h-100">
            <div>
              <span
                className="d-block text-muted mb-1 fw-bold text-uppercase"
                style={{ fontSize: "0.75rem" }}
              >
                Files Uploaded
              </span>
              <h2 className="fw-bolder text-dark mb-0 display-6">
                {data.stats.files_uploaded}
              </h2>
            </div>
            <div
              className="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
              style={{
                width: "55px",
                height: "55px",
                backgroundColor: "rgba(253, 249, 13, 0.1)",
              }}
            >
              <i className="bi bi-folder-fill fs-3 text-warning"></i>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS & TOP TEACHERS */}
      <div className="row g-4 mb-4">
        {/* BAR CHART: Students Per Strand */}
        <div
          className="col-12 col-md-6 col-xl-4"
          style={{
            zIndex: openDropdown === "strand" ? 10 : 1,
            position: "relative",
          }}
        >
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100 premium-hover-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold text-dark mb-0">
                <i className="bi bi-bar-chart fs-5 me-2"></i> Students Per
                Strand{" "}
                {strandYear && (
                  <span className="badge bg-primary text-light ms-1">
                    {strandYear}
                  </span>
                )}
              </h6>

              <div className="dropdown custom-chart-dropdown position-relative">
                <button
                  className="btn btn-light btn-sm rounded-circle shadow-sm"
                  onClick={() =>
                    setOpenDropdown(openDropdown === "strand" ? null : "strand")
                  }
                >
                  <i className="bi bi-calendar3"></i>
                </button>
                <ul
                  className={`dropdown-menu dropdown-menu-end shadow-sm border-0 ${openDropdown === "strand" ? "show" : ""}`}
                  style={{
                    display: openDropdown === "strand" ? "block" : "none",
                    position: "absolute",
                    zIndex: 1000,
                  }}
                >
                  <li>
                    <button
                      className="dropdown-item fw-bold text-center"
                      onClick={() => handleStrandYearChange("")}
                    >
                      All Time
                    </button>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  {yearOptions.map((y) => (
                    <li key={y}>
                      <button
                        className={`dropdown-item ${strandYear == y ? "active bg-campusloop" : ""} text-center`}
                        onClick={() => handleStrandYearChange(y)}
                      >
                        {y}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div style={{ width: "100%", height: 250 }}>
              <ResponsiveContainer>
                <BarChart
                  data={data.students_per_strand}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                  <Bar
                    dataKey="value"
                    fill="var(--primary-color)"
                    radius={[4, 4, 0, 0]}
                  >
                    {data.students_per_strand.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* DOUGHNUT CHART: Active vs Inactive Users */}
        <div
          className="col-12 col-md-6 col-xl-4"
          style={{
            zIndex: openDropdown === "status" ? 10 : 1,
            position: "relative",
          }}
        >
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100 premium-hover-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold text-dark mb-0">
                <i className="bi bi-person-check fs-5 me-2"></i> Active vs
                Inactive Users{" "}
                {statusYear && (
                  <span className="badge bg-primary text-light ms-1">
                    {statusYear}
                  </span>
                )}
              </h6>

              <div className="dropdown custom-chart-dropdown position-relative">
                <button
                  className="btn btn-light btn-sm rounded-circle shadow-sm"
                  onClick={() =>
                    setOpenDropdown(openDropdown === "status" ? null : "status")
                  }
                >
                  <i className="bi bi-calendar3"></i>
                </button>
                <ul
                  className={`dropdown-menu dropdown-menu-end shadow-sm border-0 ${openDropdown === "status" ? "show" : ""}`}
                  style={{
                    display: openDropdown === "status" ? "block" : "none",
                    position: "absolute",
                    zIndex: 1000,
                  }}
                >
                  <li>
                    <button
                      className="dropdown-item fw-bold text-center"
                      onClick={() => handleStatusYearChange("")}
                    >
                      All Time
                    </button>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  {yearOptions.map((y) => (
                    <li key={y}>
                      <button
                        className={`dropdown-item ${statusYear == y ? "active bg-campusloop" : ""} text-center`}
                        onClick={() => handleStatusYearChange(y)}
                      >
                        {y}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div
              className="position-relative"
              style={{ width: "100%", height: 250 }}
            >
              <div
                className="position-absolute top-50 start-50 translate-middle text-center mt-n3"
                style={{ pointerEvents: "none", zIndex: 0 }}
              >
                <h3 className="fw-bolder text-dark mb-0">
                  {activePercentage}%
                </h3>
                <span
                  className="small text-muted fw-bold"
                  style={{ fontSize: "0.70rem", letterSpacing: "1px" }}
                >
                  ACTIVE
                </span>
              </div>

              <div
                style={{
                  position: "relative",
                  zIndex: 10,
                  width: "100%",
                  height: "100%",
                }}
              >
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={data.user_status}
                      dataKey="value"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                    >
                      {data.user_status.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.status === "active"
                              ? DOUGHNUT_COLORS[0]
                              : DOUGHNUT_COLORS[1]
                          }
                        />
                      ))}
                    </Pie>
                    <ChartTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* TOP TEACHERS */}
        <div className="col-12 col-xl-4 d-flex">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-0 overflow-hidden d-flex flex-column w-100 premium-hover-card">
            <div className="card-header bg-light border-bottom p-3 flex-shrink-0">
              <h6 className="fw-bold text-dark mb-0 py-1">
                <i className="bi bi-trophy fs-5 me-2"></i> Top Teachers Activity
              </h6>
            </div>
            <div
              className="card-body p-0 custom-scrollbar flex-grow-1"
              style={{ overflowY: "auto", maxHeight: "260px" }}
            >
              <table className="table table-summer align-middle mb-0">
                <thead className="table-light sticky-top" style={{ zIndex: 1 }}>
                  <tr>
                    <th className="py-2 text-muted small fw-bold px-3">RANK</th>
                    <th className="py-2 text-muted small fw-bold text-start">
                      TEACHER
                    </th>
                    <th
                      className="py-2 text-muted small fw-bold text-center"
                      title="Classrooms"
                    >
                      <i className="bi bi-easel text-danger"></i>
                    </th>
                    <th
                      className="py-2 text-muted small fw-bold text-center"
                      title="Classworks"
                    >
                      <i className="bi bi-journal-text text-primary"></i>
                    </th>
                    <th
                      className="py-2 text-muted small fw-bold text-center"
                      title="Forms"
                    >
                      <i className="bi bi-ui-checks text-success"></i>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.teacher_rankings.map((teacher, index) => (
                    <tr key={teacher.id} style={{ cursor: "default" }}>
                      <td className="py-2 fw-bold text-dark px-3">
                        {index === 0 ? (
                          <span className="fs-6">🥇</span>
                        ) : index === 1 ? (
                          <span className="fs-6">🥈</span>
                        ) : index === 2 ? (
                          <span className="fs-6">🥉</span>
                        ) : (
                          index + 1
                        )}
                      </td>
                      <td className="py-2 text-start">
                        <span
                          className="d-inline-block text-truncate fw-bold text-dark"
                          style={{
                            maxWidth: "120px",
                            fontSize: "0.80rem",
                            verticalAlign: "bottom",
                          }}
                          title={teacher.name}
                        >
                          {teacher.name}
                        </span>
                      </td>
                      <td className="py-2 align-middle text-center">
                        <span className="badge bg-danger fw-medium rounded-3 px-3 shadow-sm">
                          {teacher.classrooms}
                        </span>
                      </td>
                      <td className="py-2 align-middle text-center">
                        <span className="badge bg-primary fw-medium rounded-3 px-3 shadow-sm">
                          {teacher.classworks}
                        </span>
                      </td>
                      <td className="py-2 align-middle text-center">
                        <span className="badge bg-success fw-medium rounded-3 px-3 shadow-sm">
                          {teacher.forms}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {data.teacher_rankings.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-muted">
                        No active teachers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* LINE CHART */}
      <div className="row g-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 premium-hover-card">
            <h6 className="fw-bold text-dark mb-4">
              <i className="bi bi-activity fs-5 me-2"></i> System Logins (Last 7
              Days)
            </h6>
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer>
                <LineChart
                  data={data.login_activity}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    type="monotone"
                    dataKey="student"
                    stroke="#8884d8"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="teacher"
                    stroke="#82ca9d"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="admin"
                    stroke="#ffc658"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
