import React, { useState, useEffect } from "react";

const Maintenance = () => {
  const [pstTime, setPstTime] = useState("");

  useEffect(() => {
    // REAL-TIME PST CLOCK
    const updateTime = () => {
      const now = new Date();
      const options = {
        timeZone: "Asia/Manila",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setPstTime(now.toLocaleTimeString("en-US", options));
    };

    updateTime(); // Initial call
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="container-fluid min-vh-100 d-flex flex-column py-4"
      style={{ backgroundColor: "#F5ECD5" }}
    >
      <div className="m-auto w-100 px-2" style={{ maxWidth: "600px" }}>
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden w-100">
          <div className="w-100 bg-danger" style={{ height: "6px" }}></div>

          <div className="card-body p-4 p-sm-5 text-center bg-white">
            <img
              src="/images/maintenance.svg"
              alt="System Maintenance"
              className="img-fluid mb-3 mb-md-4"
              style={{ maxHeight: "180px" }}
              onError={(e) => (e.target.style.display = "none")}
            />

            <h2 className="fw-bolder text-dark mb-2 fs-4 fs-md-2">
              System Under Maintenance
            </h2>
            <p
              className="text-muted mb-4 px-1 px-md-3"
              style={{ fontSize: "0.95rem" }}
            >
              Holy Face of Jesus Lyceum of San Jose Inc. LMS is currently
              undergoing scheduled maintenance to improve your experience.
            </p>

            <div className="bg-light rounded-4 p-3 p-md-4 mb-4 border border-danger border-opacity-25">
              <h6
                className="fw-bold text-muted text-uppercase mb-2"
                style={{ letterSpacing: "1px", fontSize: "0.75rem" }}
              >
                Philippine Standard Time
              </h6>
              <h1 className="fw-bolder text-danger mb-0 font-monospace fs-3 fs-sm-1">
                {pstTime}
              </h1>
            </div>

            <div className="alert alert-warning border-warning bg-warning bg-opacity-10 text-dark d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-2 gap-sm-3 text-center text-sm-start mb-0 rounded-4 p-3 p-sm-4">
              <i className="bi bi-info-circle-fill text-warning fs-3 mb-1 mb-sm-0"></i>
              <div>
                <h6 className="fw-bold mb-1">Important Advisory</h6>
                <p className="mb-0 small" style={{ fontSize: "0.85rem" }}>
                  Maintenance usually takes a <b>maximum of 1 hour</b>. If the
                  process exceeds the expected time, please wait patiently as
                  our team finalizes the system updates.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-muted small fw-medium text-center">
          &copy; {new Date().getFullYear()} CampusLoop. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
