import React from "react";

const TeacherHelpModal = () => {
  return (
    <div
      className="modal fade"
      id="teacherHelpModal"
      tabIndex="-1"
      aria-labelledby="teacherHelpModalLabel"
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
                  how to manage your classes, grades, and materials.
                </p>

                <div
                  className="accordion accordion-flush"
                  id="teacherHelpAccordion"
                >
                  {/* Home & Dashboard */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseTeacherHome"
                        aria-expanded="true"
                      >
                        1. Home & To-Do List
                      </button>
                    </h2>
                    <div
                      id="collapseTeacherHome"
                      className="accordion-collapse collapse show"
                      data-bs-parent="#teacherHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        Your Home page displays your profile, global
                        announcements from the Admin (which you can comment on),
                        and a <strong>To-Do List</strong>. The To-Do list
                        specifically shows classworks submitted by your students
                        that are waiting for your grades.
                      </div>
                    </div>
                  </div>

                  {/* Advisory Class & Grades */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseTeacherAdvisory"
                      >
                        2. Advisory Class & Final Grades
                      </button>
                    </h2>
                    <div
                      id="collapseTeacherAdvisory"
                      className="accordion-collapse collapse"
                      data-bs-parent="#teacherHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        Create your Advisory Class and search/add your students.
                        From the students' list, click the{" "}
                        <strong>Grade Icon</strong> to encode their final grades
                        per subject. Submitted grades are sent to the Admin for
                        approval. If an Admin declines a grade, you can read
                        their feedback and edit the grade to resubmit.
                      </div>
                    </div>
                  </div>

                  {/* Managing Classrooms */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseTeacherClassrooms"
                      >
                        3. Managing Classrooms
                      </button>
                    </h2>
                    <div
                      id="collapseTeacherClassrooms"
                      className="accordion-collapse collapse"
                      data-bs-parent="#teacherHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        When you create a classroom, the system generates a
                        unique <strong>9-character code</strong> (e.g.,
                        ASD-3G3-QWE) for students to join. Inside the classroom,
                        you have three tabs:
                        <br />
                        <br />
                        <strong>Stream:</strong> Create Assignments, Quizzes, or
                        Materials with attachments or links.
                        <br />
                        <strong>People:</strong> Approve, decline, or remove
                        students who used your classroom code.
                        <br />
                        <strong>Grades:</strong> A Digital Class Record
                        summarizing all classwork grades in the room.
                      </div>
                    </div>
                  </div>

                  {/* Grading Classworks */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseTeacherSubmissions"
                      >
                        4. Grading & Returning Classworks
                      </button>
                    </h2>
                    <div
                      id="collapseTeacherSubmissions"
                      className="accordion-collapse collapse"
                      data-bs-parent="#teacherHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        Click the <strong>Respondents</strong> button on a
                        classwork to view student submissions. You can preview
                        their attached files, encode a grade, or use the{" "}
                        <strong>Unsubmit Icon</strong> to return the work to the
                        student. When returning work, you must provide feedback
                        explaining why it was returned.
                      </div>
                    </div>
                  </div>

                  {/* Quiz & Exam Builder (Forms) */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseTeacherForms"
                      >
                        5. Quiz/Exam Builder (Forms)
                      </button>
                    </h2>
                    <div
                      id="collapseTeacherForms"
                      className="accordion-collapse collapse"
                      data-bs-parent="#teacherHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        Create automated quizzes and exams using the Form
                        Builder. You can set a <strong>Timer</strong>, enable{" "}
                        <strong>Shuffle Questions</strong>, and input correct
                        answers for Auto-Checking.
                        <br />
                        <br />
                        <strong>Focus Mode (Anti-Cheat):</strong> Enabling this
                        prevents students from copying (Ctrl+C/V), taking
                        screenshots, or switching tabs. If they lose focus, the
                        form auto-submits. You can also duplicate existing forms
                        for other sections.
                      </div>
                    </div>
                  </div>

                  {/* E-Library & Files */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseTeacherFiles"
                      >
                        6. E-Library & My Files
                      </button>
                    </h2>
                    <div
                      id="collapseTeacherFiles"
                      className="accordion-collapse collapse"
                      data-bs-parent="#teacherHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        <strong>E-Library:</strong> Upload books or reading
                        materials[cite: 1494]. They will be tagged as "Pending"
                        and must be approved by the Admin before appearing
                        globally to students.
                        <br />
                        <strong>Files:</strong> All files you've uploaded across
                        the system are stored here. You can select multiple
                        items to download them as a ZIP file.
                      </div>
                    </div>
                  </div>

                  {/* Settings & Recycle Bin */}
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button fw-medium collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseTeacherSettings"
                      >
                        7. Recycle Bin & Activity Logs
                      </button>
                    </h2>
                    <div
                      id="collapseTeacherSettings"
                      className="accordion-collapse collapse"
                      data-bs-parent="#teacherHelpAccordion"
                    >
                      <div className="accordion-body text-muted small">
                        <strong>Recycle Bin:</strong> Deleted items (classrooms,
                        forms, files) go here first. You can restore them to
                        their original location or permanently delete them.
                        <br />
                        <strong>Activity Logs:</strong> Found in your profile
                        dropdown, this tracks all your personal actions (e.g.,
                        creating classes, grading) for transparency.
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

export default TeacherHelpModal;
