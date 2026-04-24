import React from "react";

const TermsAndPolicy = () => {
  return (
    <div
      className="offcanvas offcanvas-end shadow"
      tabIndex="-1"
      id="termsDrawer"
      aria-labelledby="termsDrawerLabel"
      style={{ width: "450px" }}
    >
      <div
        className="offcanvas-header border-bottom"
        style={{ backgroundColor: "var(--accent-color)" }}
      >
        <img
          src="/images/logo.png"
          alt="CampusLoop Logo"
          style={{
            width: "32px",
            height: "32px",
            objectFit: "contain",
          }}
        />
        <h5
          className="offcanvas-title fw-bold ms-2 fs-5"
          id="termsDrawerLabel"
          style={{ color: "var(--primary-color)", letterSpacing: "1px" }}
        >
          Terms & Policy
        </h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div className="offcanvas-body px-4">
        <p className="text-muted small mb-4">
          Welcome to CampusLoop. By accessing or using our Learning Management
          System, you agree to be bound by these terms. Please read them
          carefully.
        </p>

        <div className="mb-4">
          <h6 className="fw-bold text-dark">
            <i
              className="bi bi-shield-check me-2"
              style={{ color: "var(--primary-color)" }}
            ></i>
            1. Data Privacy Act of 2012
          </h6>
          <p className="text-muted small text-justify">
            Holy Face adheres strictly to the Data Privacy Act of 2012 (Republic
            Act No. 10173). All personal information, academic records, LRNs,
            and communications stored within CampusLoop are highly confidential.
            Your data will only be processed for academic, administrative, and
            system enhancement purposes. We do not share your data with
            unauthorized third parties.
          </p>
        </div>

        <div className="mb-4">
          <h6 className="fw-bold text-dark">
            <i
              className="bi bi-book me-2"
              style={{ color: "var(--primary-color)" }}
            ></i>
            2. Academic Integrity & Anti-Cheat
          </h6>
          <p className="text-muted small text-justify">
            Users must maintain honesty in all academic tasks. CampusLoop
            utilizes a <strong>Focus Mode (Anti-Cheat)</strong> during quizzes
            and exams. The system automatically detects tab-switching, loss of
            window focus, and disables copy-pasting (CTRL+C / CTRL+V). Any
            detected anomalies will result in an auto-submission of your form
            and will be flagged for disciplinary review.
          </p>
        </div>

        <div className="mb-4">
          <h6 className="fw-bold text-dark">
            <i
              className="bi bi-person-lock me-2"
              style={{ color: "var(--primary-color)" }}
            ></i>
            3. Single Session Policy
          </h6>
          <p className="text-muted small text-justify">
            To protect your account from unauthorized access, CampusLoop
            enforces a Single Session Policy. Logging into a new device or
            browser will automatically terminate and log out your active session
            on any previous device. Sharing of accounts is strictly prohibited.
          </p>
        </div>

        <div className="mb-4">
          <h6 className="fw-bold text-dark">
            <i
              className="bi bi-folder-check me-2"
              style={{ color: "var(--primary-color)" }}
            ></i>
            4. Content Ownership & Moderation
          </h6>
          <p className="text-muted small text-justify">
            All files, modules, and E-Library materials uploaded by teachers
            remain the intellectual property of the creators and Holy Face.
            Administrators reserve the right to approve, decline, or remove
            content and comments that violate school guidelines or display
            inappropriate behavior.
          </p>
        </div>

        <div className="mb-4">
          <h6 className="fw-bold text-dark">
            <i
              className="bi bi-exclamation-triangle me-2"
              style={{ color: "var(--primary-color)" }}
            ></i>
            5. System Maintenance
          </h6>
          <p className="text-muted small text-justify">
            Administrators may place the system into Maintenance Mode for
            upgrades or fixes. During this period, students and teachers will be
            temporarily restricted from accessing their dashboards and will see
            a 1-hour countdown timer.
          </p>
        </div>

        <hr />
        <p className="text-center text-muted small mt-4 mb-0 fw-medium">
          &copy; {new Date().getFullYear()} CampusLoop.
        </p>
        <p className="text-center text-muted" style={{ fontSize: "0.75rem" }}>
          Administered by Holy Face.
        </p>
      </div>
    </div>
  );
};

export default TermsAndPolicy;
