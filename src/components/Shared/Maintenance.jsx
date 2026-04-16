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
      className="container-fluid vh-100 d-flex flex-column justify-content-center align-items-center"
      style={{ backgroundColor: "#F5ECD5" }}
    >
      <div
        className="card border-0 shadow-lg rounded-4 overflow-hidden"
        style={{ maxWidth: "600px", width: "90%" }}
      >
        {/* TOP ACCENT BAR */}
        <div className="w-100 bg-danger" style={{ height: "6px" }}></div>

        <div className="card-body p-5 text-center bg-white">
          <img
            src="/images/maintenance.svg"
            alt="System Maintenance"
            className="img-fluid mb-4"
            style={{ maxHeight: "200px" }}
            onError={(e) => (e.target.style.display = "none")}
          />

          <h2 className="fw-bolder text-dark mb-2">System Under Maintenance</h2>
          <p className="text-muted mb-4 px-3">
            Holy Face of Jesus Lyceum of San Jose Inc. LMS is currently
            undergoing scheduled maintenance to improve your experience.
          </p>

          {/* REAL TIME CLOCK BOX */}
          <div className="bg-light rounded-4 p-4 mb-4 border border-danger border-opacity-25">
            <h6
              className="fw-bold text-muted text-uppercase mb-2"
              style={{ letterSpacing: "1px", fontSize: "0.8rem" }}
            >
              Philippine Standard Time
            </h6>
            <h1 className="fw-bolder text-danger mb-0 font-monospace display-5">
              {pstTime}
            </h1>
          </div>

          {/* ADVISORY MESSAGE */}
          <div className="alert alert-warning border-warning bg-warning bg-opacity-10 text-dark d-flex align-items-start gap-3 text-start mb-0 rounded-4">
            <i className="bi bi-info-circle-fill text-warning fs-3"></i>
            <div>
              <h6 className="fw-bold mb-1">Important Advisory</h6>
              <p className="mb-0 small" style={{ fontSize: "0.85rem" }}>
                Maintenance usually takes a <b>maximum of 1 hour</b>. If the
                process exceeds the expected time, please wait patiently as our
                team finalizes the system updates.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-muted small fw-medium">
        &copy; {new Date().getFullYear()} CampusLoop. All rights reserved.
      </div>
    </div>
  );
};

export default Maintenance;
