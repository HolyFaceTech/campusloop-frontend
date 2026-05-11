import React from "react";

const HelpAuth = () => {
  return (
    <div
      className="modal fade"
      id="helpAuthModal"
      tabIndex="-1"
      aria-labelledby="helpAuthModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 overflow-hidden shadow-lg">
          <div className="row g-0">
            {/* Illustration */}
            <div
              className="col-lg-5 d-none d-lg-flex align-items-center justify-content-center p-4 position-relative"
              style={{ backgroundColor: "var(--accent-color)" }}
            >
              <div className="position-absolute top-0 start-0 p-4 d-flex align-items-center">
                <img
                  src="/images/logo.png"
                  alt="CampusLoop Logo"
                  style={{
                    width: "32px",
                    height: "32px",
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
                src="/images/help.svg"
                alt="Help Center"
                className="img-fluid"
                style={{ maxHeight: "300px" }}
              />
            </div>

            {/* Instructions Accordion */}
            <div className="col-lg-7 position-relative">
              <button
                type="button"
                className="btn-close position-absolute"
                data-bs-dismiss="modal"
                aria-label="Close"
                style={{ top: "1.5rem", right: "1.5rem", zIndex: 10 }}
              ></button>
              <div className="modal-header border-0 flex-column align-items-start pb-0 pt-4 px-4">
                <div className="d-flex align-items-center justify-content-center d-lg-none w-100 mb-3 mt-1">
                  <img
                    src="/images/logo.png"
                    alt="CampusLoop Logo"
                    style={{
                      width: "32px",
                      height: "32px",
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

                <h4
                  className="modal-title fw-bold"
                  id="helpAuthModalLabel"
                  style={{ color: "var(--primary-color)" }}
                >
                  How can we help?
                </h4>
              </div>
              <div className="modal-body px-4 pb-5">
                <p className="text-muted small mb-4">
                  Welcome to the Help Center. Select a topic below to explore
                  authentication settings in the CampusLoop system.
                </p>
                <div className="accordion accordion-flush" id="helpAccordion">
                  {/* Instruction 1 - ACTIVE BY DEFAULT */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      {/* Inalis ang 'collapsed' class dito at nilagyan ng aria-expanded="true" */}
                      <button
                        className="accordion-button fw-medium"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseLogin"
                        aria-expanded="true"
                      >
                        1. How do I Login?
                      </button>
                    </h2>
                    {/* Nilagyan ng 'show' class dito para naka-open agad */}
                    <div
                      id="collapseLogin"
                      className="accordion-collapse collapse show"
                      data-bs-parent="#helpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        To login, enter your registered school email address and
                        your password. You must also complete the reCAPTCHA
                        verification. If your account is newly created or
                        unverified, the system will automatically direct you to
                        the Email Verification page.
                      </div>
                    </div>
                  </div>

                  {/* Instruction 2 */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseForgot"
                      >
                        2. I Forgot My Password
                      </button>
                    </h2>
                    <div
                      id="collapseForgot"
                      className="accordion-collapse collapse"
                      data-bs-parent="#helpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        Click on the "Forgot Password?" link on the login page.
                        Enter your registered email address and submit the form.
                        If your email exists in our system, you will receive a
                        secure reset link in your inbox. Check your spam/junk
                        folder if you don't see it immediately.
                      </div>
                    </div>
                  </div>

                  {/* Instruction 3 */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseReset"
                      >
                        3. Password Reset Requirements
                      </button>
                    </h2>
                    <div
                      id="collapseReset"
                      className="accordion-collapse collapse"
                      data-bs-parent="#helpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        When creating a new password, ensure it is{" "}
                        <strong>at least 8 characters long</strong>. For your
                        security, it must contain a mix of uppercase letters,
                        lowercase letters, numbers, and special symbols (e.g.,
                        @, #, $, !).
                      </div>
                    </div>
                  </div>

                  {/* Instruction 4 */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseVerify"
                      >
                        4. Email Verification Issues
                      </button>
                    </h2>
                    <div
                      id="collapseVerify"
                      className="accordion-collapse collapse"
                      data-bs-parent="#helpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        Before accessing the dashboard, you must verify your
                        account. If the verification link expired, log in using
                        your credentials to access the Verification Page, then
                        click "Resend Verification Email" to get a fresh link.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpAuth;
