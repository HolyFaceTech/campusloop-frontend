import React from "react";
import TermsAndPolicy from "../Shared/TermsAndPolicy";
import HelpAuth from "../../pages/Auth/HelpAuth";

const AuthLayout = ({ children, illustration }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div
      className="container-fluid min-vh-100 d-flex flex-column"
      style={{ backgroundColor: "var(--accent-color)" }}
    >
      <div className="row flex-grow-1 align-items-center justify-content-center">
        <div className="col-12 col-md-10 col-lg-8 my-4">
          <div
            className="card shadow-lg border-0 rounded-4 overflow-hidden"
            style={{ backgroundColor: "var(--neutral-color)" }}
          >
            <div className="row g-0 h-100">
              {/* Left Column: Illustration + Logo (Hidden on Mobile) */}
              <div
                className="col-md-6 d-none d-md-flex position-relative align-items-center justify-content-center p-4"
                style={{ backgroundColor: "white" }}
              >
                <div className="position-absolute top-0 start-0 p-4 d-flex align-items-center">
                  <img
                    src="/images/logo.png"
                    alt="Holy Face Logo"
                    style={{
                      width: "40px",
                      height: "40px",
                      objectFit: "contain",
                    }}
                  />
                  <span
                    className="ms-2 fw-bold fs-5"
                    style={{
                      color: "var(--primary-color)",
                      letterSpacing: "1px",
                    }}
                  >
                    HOLY FACE
                  </span>
                </div>
                <img
                  src={illustration}
                  alt="CampusLoop Auth"
                  className="img-fluid mt-5"
                  style={{ maxHeight: "350px" }}
                />
              </div>

              {/* Right Column: Form Content */}
              <div className="col-md-6 d-flex align-items-center">
                <div className="card-body p-4 p-lg-5 bg-white h-100 d-flex flex-column justify-content-center">
                  <div className="d-flex d-md-none align-items-center justify-content-center mb-4">
                    <img
                      src="/images/logo.png"
                      alt="Holy Face Logo"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "contain",
                      }}
                    />
                    <span
                      className="ms-2 fw-bold fs-3"
                      style={{
                        color: "var(--primary-color)",
                        letterSpacing: "1px",
                      }}
                    >
                      HOLY FACE
                    </span>
                  </div>

                  {/* Form Container */}
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-3 mt-auto">
        <small className="text-muted fw-medium">
          &copy; {currentYear} CampusLoop. All rights reserved. <br />
          <a
            href="#"
            className="text-decoration-none"
            style={{ color: "var(--primary-color)" }}
            data-bs-toggle="offcanvas"
            data-bs-target="#termsDrawer"
          >
            Terms & Policy
          </a>{" "}
          <span className="text-muted mx-1">|</span>{" "}
          <a
            href="#"
            className="text-decoration-none"
            style={{ color: "var(--primary-color)" }}
            data-bs-toggle="modal"
            data-bs-target="#helpAuthModal"
          >
            Help Center
          </a>
        </small>
      </footer>
      <TermsAndPolicy />
      <HelpAuth />
    </div>
  );
};

export default AuthLayout;
