import React from "react";

const StudentHelpModal = () => {
  return (
    <div
      className="modal fade"
      id="studentHelpModal"
      tabIndex="-1"
      aria-labelledby="studentHelpModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 overflow-hidden shadow-lg">
          <div className="row g-0">
            {/* Illustration Side */}
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

            {/* Instructions Accordion Side */}
            <div className="col-md-7 position-relative">
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
              <div
                className="modal-body px-4 pb-5 custom-scrollbar"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                <p className="text-muted small mb-4">
                  Welcome to the Help Center. Click on the topics below to learn
                  how to navigate your classes, submit activities, and view your
                  grades.
                </p>

                <div
                  className="accordion accordion-flush"
                  id="studentHelpAccordion"
                >
                  {/* Home & To-Do List */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseStudentHome"
                        aria-expanded="true"
                      >
                        1. Home, Feed & To-Do List
                      </button>
                    </h2>
                    <div
                      id="collapseStudentHome"
                      className="accordion-collapse collapse show"
                      data-bs-parent="#studentHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        Your Home page displays your profile and Global
                        Announcements from the Admin. You can leave comments or
                        replies on these announcements. It also features a{" "}
                        <strong>To-Do List</strong> that tracks all your
                        pending, missing, due soon, and completed classworks so
                        you never miss a deadline.
                      </div>
                    </div>
                  </div>

                  {/* Joining Classrooms */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseStudentClassrooms"
                      >
                        2. Joining & Viewing Classrooms
                      </button>
                    </h2>
                    <div
                      id="collapseStudentClassrooms"
                      className="accordion-collapse collapse"
                      data-bs-parent="#studentHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        To join a class, get the{" "}
                        <strong>9-character classroom code</strong> from your
                        teacher and enter it in the Classrooms module. Once
                        approved, you can access the classroom's{" "}
                        <strong>Stream</strong> (for activities and assignments)
                        and <strong>Grades</strong> (to track your scores for
                        that specific class).
                      </div>
                    </div>
                  </div>

                  {/* Submitting Classworks */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseStudentSubmissions"
                      >
                        3. Submitting & Unsubmitting Work
                      </button>
                    </h2>
                    <div
                      id="collapseStudentSubmissions"
                      className="accordion-collapse collapse"
                      data-bs-parent="#studentHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        When a teacher posts an assignment, you can upload
                        multiple files as attachments. If you made a mistake,
                        you can use the <strong>Unsubmit</strong> button to
                        remove your files and pass again, as long as the
                        deadline hasn't passed. You can also comment on
                        classworks if you have questions.
                      </div>
                    </div>
                  </div>

                  {/* Taking Quizzes/Exams */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseStudentForms"
                      >
                        4. Taking Quizzes & Exams (Forms)
                      </button>
                    </h2>
                    <div
                      id="collapseStudentForms"
                      className="accordion-collapse collapse"
                      data-bs-parent="#studentHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        Click on a Quiz or Exam to answer it. Be aware that
                        teachers can enable <strong>Focus Mode</strong>{" "}
                        (Anti-Cheat). If Focus Mode is active, you cannot
                        copy/paste, take screenshots, or switch browser tabs. If
                        you lose focus, the form will automatically submit your
                        current answers. Note: You cannot "unsubmit" a quiz.
                      </div>
                    </div>
                  </div>

                  {/* Final Grades */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseStudentGrades"
                      >
                        5. Viewing Final Grades
                      </button>
                    </h2>
                    <div
                      id="collapseStudentGrades"
                      className="accordion-collapse collapse"
                      data-bs-parent="#studentHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        The Grades module displays your Final Grades per subject
                        for the current School Year and Semester. Note: You will
                        only see grades that have been officially{" "}
                        <strong>Approved and Locked</strong> by the Admin.
                        Pending grades from your advisory teacher will remain
                        hidden.
                      </div>
                    </div>
                  </div>

                  {/* Files & E-Library */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseStudentLibrary"
                      >
                        6. My Files & E-Library
                      </button>
                    </h2>
                    <div
                      id="collapseStudentLibrary"
                      className="accordion-collapse collapse"
                      data-bs-parent="#studentHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        <strong>My Files:</strong> View all the files you have
                        submitted across all your classrooms. You can select
                        multiple files and download them as a ZIP archive.
                        <br />
                        <strong>E-Library:</strong> Access a collection of
                        reading materials and books uploaded by teachers and
                        approved by the Admins.
                      </div>
                    </div>
                  </div>

                  {/* Activity Logs */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseStudentLogs"
                      >
                        7. Activity Logs
                      </button>
                    </h2>
                    <div
                      id="collapseStudentLogs"
                      className="accordion-collapse collapse"
                      data-bs-parent="#studentHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        You can track your own account activity (e.g.,
                        submitting works, joining classes, commenting) by
                        opening the <strong>Activity Logs</strong> from your
                        profile dropdown menu.
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

export default StudentHelpModal;
