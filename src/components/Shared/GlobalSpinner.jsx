import React from "react";

const GlobalSpinner = ({ isLoading, text = "Loading" }) => {
  if (!isLoading) return null;

  const cleanText = text.replace(/\.+$/, "");

  return (
    <div className="global-spinner-overlay">
      <div className="spinner-card shadow-lg">
        <img
          src="/images/spinner.svg"
          alt="Loading..."
          className="toga-spinner-image mb-3"
        />

        <div className="d-flex align-items-baseline justify-content-center">
          <h5 className="fw-bold m-0" style={{ color: "var(--primary-color)" }}>
            {cleanText}
          </h5>

          <div className="jumping-dots ms-2">
            <div
              className="dot"
              style={{ backgroundColor: "var(--primary-color)" }}
            ></div>
            <div
              className="dot"
              style={{ backgroundColor: "var(--primary-color)" }}
            ></div>
            <div
              className="dot"
              style={{ backgroundColor: "var(--primary-color)" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSpinner;
