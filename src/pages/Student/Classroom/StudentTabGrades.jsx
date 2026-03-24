import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import GlobalSpinner from "../../../components/Shared/GlobalSpinner";

const StudentTabGrades = () => {
  const { id } = useParams();
  const [grades, setGrades] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, [id]);

  const fetchGrades = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/student/classrooms/${id}/grades`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      setGrades(res.data);
    } catch (error) {
      console.error("Failed to load grades.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeDisplay = (type) => {
    switch (type) {
      case "assignment":
        return {
          icon: "bi-journal-code",
          color: "text-primary",
          bg: "bg-primary",
        };
      case "activity":
        return {
          icon: "bi-person-workspace",
          color: "text-success",
          bg: "bg-success",
        };
      case "quiz":
        return {
          icon: "bi-ui-checks",
          color: "text-warning",
          bg: "bg-warning",
        };
      case "exam":
        return {
          icon: "bi-file-earmark-check",
          color: "text-danger",
          bg: "bg-danger",
        };
      default:
        return {
          icon: "bi-journal-text",
          color: "text-secondary",
          bg: "bg-secondary",
        };
    }
  };

  if (isLoading)
    return <GlobalSpinner isLoading={true} text="Fetching Grades..." />;

  const totalEarned = grades.reduce(
    (sum, g) => sum + (Number(g.grade) || 0),
    0,
  );
  const totalPossible = grades.reduce(
    (sum, g) => sum + (Number(g.points) || 0),
    0,
  );
  const percentage =
    totalPossible > 0 ? ((totalEarned / totalPossible) * 100).toFixed(1) : 0;

  const filteredGrades = grades.filter((g) =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
      <div className="card-header bg-white border-bottom p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h5 className="fw-bold mb-0 text-dark">
            <i className="bi bi-journal-check me-2 text-success"></i> My Grade
            Record
          </h5>
          <p className="text-muted small mb-0 mt-1">
            Review all your graded activities in this class.
          </p>
        </div>

        <div className="d-flex align-items-center gap-4">
          <div
            className="input-group input-group-sm border rounded-3 overflow-hidden shadow-sm"
            style={{ width: "250px" }}
          >
            <span className="input-group-text bg-white border-0 text-muted px-3">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-0 ps-0 shadow-none"
              placeholder="Search Title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {grades.length > 0 && (
            <div className="text-end border-start ps-4">
              <span
                className="d-block small text-muted fw-bold"
                style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
              >
                CURRENT STANDING
              </span>
              <span className="d-block fs-4 fw-bolder text-primary lh-1 mt-1">
                {percentage}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="card-body p-0">
        <div
          className="table-responsive custom-scrollbar"
          style={{ maxHeight: "600px" }}
        >
          <table className="table table-hover align-middle mb-0 border-top-0">
            <thead className="sticky-top bg-light" style={{ zIndex: 10 }}>
              <tr>
                <th className="small fw-bold text-muted px-4 py-3 text-uppercase border-bottom">
                  Classwork Details
                </th>
                <th className="small fw-bold text-muted py-3 text-center text-uppercase border-bottom">
                  Type
                </th>
                <th className="small fw-bold text-muted py-3 text-center pe-4 text-uppercase border-bottom">
                  Score / Points
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredGrades.length > 0 ? (
                filteredGrades.map((g, index) => {
                  const display = getTypeDisplay(g.type);
                  return (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className={`rounded-circle d-flex justify-content-center align-items-center bg-light flex-shrink-0 shadow-sm ${display.color}`}
                            style={{ width: "35px", height: "35px" }}
                          >
                            <i className={`bi ${display.icon}`}></i>
                          </div>
                          <span className="fw-bold text-dark">{g.title}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge bg-opacity-10 border px-3 py-1 text-uppercase ${display.color} border-${display.color.split("-")[1]}`}
                          style={{
                            fontSize: "0.70rem",
                            backgroundColor: `var(--bs-${display.color.split("-")[1]})`,
                          }}
                        >
                          {g.type}
                        </span>
                      </td>
                      <td className="text-center pe-4">
                        <span className="fw-bolder fs-5 text-primary">
                          {g.grade}
                        </span>
                        <span className="text-muted small fw-medium ms-1">
                          / {g.points}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-5 text-muted">
                    <i className="bi bi-journal-x fs-1 d-block mb-3 opacity-25"></i>
                    <span className="fw-medium">No graded activities yet.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentTabGrades;
