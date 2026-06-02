import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 w-100"
      style={{ backgroundColor: "#F5ECD5" }}
    >
      <div
        className="text-center p-5 bg-white shadow-lg border-0"
        style={{
          maxWidth: "500px",
          width: "90%",
          borderRadius: "1.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="position-absolute rounded-circle"
          style={{
            width: "150px",
            height: "150px",
            backgroundColor: "rgba(98, 111, 71, 0.05)",
            top: "-50px",
            left: "-50px",
            pointerEvents: "none",
          }}
        ></div>
        <div
          className="position-absolute rounded-circle"
          style={{
            width: "100px",
            height: "100px",
            backgroundColor: "rgba(98, 111, 71, 0.05)",
            bottom: "-30px",
            right: "-30px",
            pointerEvents: "none",
          }}
        ></div>

        <div className="position-relative z-1">
          <div className="mb-2">
            <i
              className="bi bi-compass text-muted"
              style={{ fontSize: "5rem", opacity: 0.3 }}
            ></i>
          </div>

          <h1
            className="fw-bolder mb-1"
            style={{
              fontSize: "5rem",
              color: "var(--primary-color)",
              lineHeight: "1",
              textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            404
          </h1>

          <h4
            className="fw-bold text-dark mb-3"
            style={{ letterSpacing: "-0.5px" }}
          >
            Page Not Found
          </h4>

          <p className="text-muted mb-4 small" style={{ lineHeight: "1.6" }}>
            Oops! It seems you've ventured too far. The page you are looking for
            doesn't exist, has been moved, or is temporarily unavailable.
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-light border fw-medium px-4 py-2 rounded-3 shadow-sm d-flex align-items-center transition-all hover-shadow"
            >
              <i className="bi bi-arrow-left me-2"></i> Go Back
            </button>
            <button
              onClick={() => navigate("/")}
              className="btn btn-campusloop fw-bold px-4 py-2 rounded-3 shadow-sm d-flex align-items-center transition-all hover-shadow"
            >
              <i className="bi bi-house-door-fill me-2"></i> Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
