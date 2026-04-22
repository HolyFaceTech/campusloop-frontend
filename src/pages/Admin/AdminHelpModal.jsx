import React from "react";

const AdminHelpModal = () => {
  return (
    <div
      className="modal fade"
      id="adminHelpModal"
      tabIndex="-1"
      aria-labelledby="adminHelpModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 overflow-hidden shadow-lg">
          <div className="row g-0">
            {/* Illustration Side */}
            <div
              className="col-md-5 d-none d-md-flex align-items-center justify-content-center p-4"
              style={{ backgroundColor: "var(--accent-color)" }}
            >
              <img
                src="/images/help.svg"
                alt="Admin Help Center"
                className="img-fluid"
                style={{ maxHeight: "300px" }}
              />
            </div>

            {/* Instructions Accordion Side */}
            <div className="col-md-7 position-relative">
              <div className="modal-header border-0 pb-0 mt-2">
                <h4
                  className="modal-title fw-bold"
                  id="adminHelpModalLabel"
                  style={{ color: "var(--primary-color)" }}
                >
                  Admin Help Center
                </h4>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div
                className="modal-body px-4 pb-5 custom-scrollbar"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                <p className="text-muted small mb-4">
                  Welcome to the Admin Help Center. Click on the topics below to
                  learn how to manage the CampusLoop system.
                </p>

                <div
                  className="accordion accordion-flush"
                  id="adminHelpAccordion"
                >
                  {/* Dashboard & Overview */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseDashboard"
                        aria-expanded="true"
                      >
                        1. Dashboard & Reports
                      </button>
                    </h2>
                    <div
                      id="collapseDashboard"
                      className="accordion-collapse collapse show"
                      data-bs-parent="#adminHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        The Dashboard provides a real-time overview of the
                        system. You can filter data by School Year or Date. It
                        features stats cards for total users and classrooms, a
                        pie chart for Strand distribution, and a ranking table
                        recognizing the most active teachers based on their
                        system usage.
                      </div>
                    </div>
                  </div>

                  {/* User Records */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseUsers"
                      >
                        2. Managing User Records
                      </button>
                    </h2>
                    <div
                      id="collapseUsers"
                      className="accordion-collapse collapse"
                      data-bs-parent="#adminHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        In the User Records module, you can create, view,
                        update, and soft-delete accounts for Admins, Teachers,
                        and Students. When creating a new account, the system
                        automatically sends a Welcome and Verification email to
                        the user's registered email address. Passwords can be
                        auto-generated or manually assigned.
                      </div>
                    </div>
                  </div>

                  {/* Academic Management */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseAcademic"
                      >
                        3. Academic Management (Strands & Subjects)
                      </button>
                    </h2>
                    <div
                      id="collapseAcademic"
                      className="accordion-collapse collapse"
                      data-bs-parent="#adminHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        <strong>Strands:</strong> Create and manage SHS strands
                        (e.g., STEM, HUMSS). <br />
                        <br />
                        <strong>Subjects:</strong> Manage subjects by linking
                        them to specific strands, grade levels (11/12), and
                        semesters. This ensures teachers select the correct
                        subjects when setting up their classrooms.
                      </div>
                    </div>
                  </div>

                  {/* Monitoring & Oversight */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseMonitoring"
                      >
                        4. Monitoring & Oversight
                      </button>
                    </h2>
                    <div
                      id="collapseMonitoring"
                      className="accordion-collapse collapse"
                      data-bs-parent="#adminHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        Admins have a "Viewer" role in these areas: <br />
                        <strong>Classrooms:</strong> Monitor class streams, view
                        participants, and enforce content guidelines. You can
                        soft-delete inappropriate classrooms or classworks.
                        <br />
                        <strong>Forms & Files:</strong> Oversee all uploaded
                        files and created quiz forms by teachers and students to
                        maintain a secure environment.
                      </div>
                    </div>
                  </div>

                  {/* Content Approval */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseApproval"
                      >
                        5. Content Approvals (E-Library & Grades)
                      </button>
                    </h2>
                    <div
                      id="collapseApproval"
                      className="accordion-collapse collapse"
                      data-bs-parent="#adminHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        <strong>E-Library:</strong> Teachers submit reading
                        materials here. Admins must Approve it to make it
                        visible globally, or Decline it with feedback. <br />
                        <strong>Student Grades:</strong> Teachers encode final
                        grades for their advisory class. Admins review and lock
                        (approve) these grades before students can view them on
                        their portal.
                      </div>
                    </div>
                  </div>

                  {/* Global Announcements */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseAnnouncements"
                      >
                        6. Global Announcements
                      </button>
                    </h2>
                    <div
                      id="collapseAnnouncements"
                      className="accordion-collapse collapse"
                      data-bs-parent="#adminHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        Create announcements with text, links, or files that
                        will appear on everyone's dashboard feed. You can set a
                        "Publish From" and "Valid Until" date to automatically
                        manage when the announcement appears and disappears.
                      </div>
                    </div>
                  </div>

                  {/* System Settings & Recycle Bin */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseSettings"
                      >
                        7. System Settings & Recycle Bin
                      </button>
                    </h2>
                    <div
                      id="collapseSettings"
                      className="accordion-collapse collapse"
                      data-bs-parent="#adminHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        <strong>Settings:</strong> Update the active School Year
                        and Semester. You can also generate system reports or
                        toggle "Maintenance Mode" to restrict access
                        temporarily.
                        <br />
                        <strong>Recycle Bin:</strong> Due to our safety net
                        feature, deleted items go here. You can either Restore
                        them or Permanently Delete them from the database.
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

export default AdminHelpModal;
