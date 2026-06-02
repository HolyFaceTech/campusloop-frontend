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
              <div
                className="col-md-6 d-none d-md-flex position-relative align-items-center justify-content-center p-4"
                style={{ backgroundColor: "white" }}
              >
                <div className="position-absolute top-0 start-0 p-4 d-flex align-items-center">
                  <img
                    src="/images/logo.png"
                    alt="CampusLoop Logo"
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
                    CAMPUSLOOP
                  </span>
                </div>
                <img
                  src={illustration}
                  alt="CampusLoop Auth"
                  className="img-fluid mt-5"
                  style={{ maxHeight: "350px" }}
                />
              </div>

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

      <footer className="py-3 mt-auto px-4 px-md-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <small className="text-muted fw-medium mb-2 mb-md-0">
            &copy; {currentYear} CampusLoop. All rights reserved.
          </small>
          <small className="text-muted fw-medium">
            <a
              href="#"
              className="text-decoration-none px-3"
              style={{ color: "var(--primary-color)" }}
              data-bs-toggle="offcanvas"
              data-bs-target="#termsDrawer"
            >
              <i className="bi bi-shield-check me-1"></i> Terms & Policy
            </a>

            <a
              href="#"
              className="text-decoration-none"
              style={{ color: "var(--primary-color)" }}
              data-bs-toggle="modal"
              data-bs-target="#helpAuthModal"
            >
              <i className="bi bi-question-circle me-1"></i> Help Center
            </a>
          </small>
        </div>
      </footer>
      <TermsAndPolicy />
      <HelpAuth />
    </div>
  );
};

export default AuthLayout;
