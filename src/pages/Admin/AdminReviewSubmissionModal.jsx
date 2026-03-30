import React from "react";
import axios from "axios";
import { Modal } from "bootstrap";
import { ConfirmStudentPDFModal } from "./AdminFormModals";

const AdminReviewSubmissionModal = ({
  form,
  respondent,
  totalPoints,
  setIsLoading,
  setLoadingText,
}) => {
  // Group Questions Logic
  const groupedQuestions = [];
  const existingSections = [];

  if (form && form.questions) {
    form.questions.forEach((q) => {
      const secName = q.section || "";
      if (!existingSections.includes(secName) && q.section)
        existingSections.push(secName);

      let group = groupedQuestions.find((g) => g.sectionName === secName);
      if (!group) {
        group = {
          sectionName: secName,
          instruction: q.instruction || "",
          questions: [],
        };
        groupedQuestions.push(group);
      } else {
        if (!group.instruction && q.instruction)
          group.instruction = q.instruction;
      }
      group.questions.push(q);
    });
  }

  // PDF Generators Logic
  const confirmStudentPDF = () => {
    const modalEl = document.getElementById("adminConfirmStudentPDFModal");
    if (modalEl) Modal.getOrCreateInstance(modalEl).show();
  };

  const executeGenerateStudentPDF = async () => {
    const modalEl = document.getElementById("adminConfirmStudentPDFModal");
    if (modalEl) Modal.getInstance(modalEl)?.hide();

    setIsLoading(true);
    setLoadingText("Generating PDF...");

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/forms/${form.id}/submissions/${respondent.id}/print`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );

      const printWindow = window.open("", "_blank");
      printWindow.document.write(res.data);
      printWindow.document.close();
    } catch (error) {
      alert("Failed to generate PDF. Check backend configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="modal fade"
        id="adminReviewSubmissionModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-light">
            <div
              className="modal-header border-bottom py-3 d-flex justify-content-between align-items-center"
              style={{ backgroundColor: "var(--accent-color)" }}
            >
              <h5
                className="modal-title fw-bold mb-0 d-flex align-items-center"
                style={{ color: "var(--primary-color)" }}
              >
                <i className="bi bi-file-earmark-check me-2 fs-4"></i> Review
                Submission
              </h5>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body p-4 bg-light custom-scrollbar">
              {form && respondent ? (
                <>
                  {/* STUDENT SUMMARY BADGE */}
                  <div
                    className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 border border-light-subtle shadow-sm mx-auto"
                    style={{ maxWidth: "770px" }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold fs-5 shadow-sm"
                        style={{
                          width: "50px",
                          height: "50px",
                          backgroundColor: "var(--secondary-color)",
                        }}
                      >
                        {respondent.student?.first_name?.charAt(0)}
                      </div>
                      <div>
                        <h5 className="fw-bold text-dark mb-0">
                          {respondent.student?.first_name}{" "}
                          {respondent.student?.last_name}
                        </h5>
                        <span className="text-muted small font-monospace">
                          LRN: {respondent.student?.lrn || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="text-end">
                      <span
                        className="d-block text-muted small fw-bold text-uppercase mb-1"
                        style={{ letterSpacing: "0.5px", fontSize: "0.65rem" }}
                      >
                        Total Score
                      </span>
                      <span className="badge bg-light text-dark border shadow-sm px-3 py-2 fw-medium fs-5">
                        <span
                          className={
                            respondent.score < totalPoints / 2
                              ? "text-danger"
                              : "text-success"
                          }
                        >
                          {respondent.score}
                        </span>{" "}
                        <span className="text-muted fs-6">/ {totalPoints}</span>
                      </span>
                    </div>
                  </div>

                  <div className="mx-auto pb-4" style={{ maxWidth: "770px" }}>
                    {/* FORM HEADER (EXACT SAME DESIGN) */}
                    <div
                      className="card bg-white shadow-sm mb-4 position-relative"
                      style={{
                        border: "1px solid #e0e0e0",
                        borderTop: "10px solid var(--primary-color)",
                        borderRadius: "8px",
                      }}
                    >
                      <div className="card-body p-4 p-md-5">
                        <h2
                          className="fw-normal text-dark mb-3"
                          style={{
                            fontSize: "2.2rem",
                            letterSpacing: "-0.5px",
                          }}
                        >
                          {form.name}
                        </h2>
                        <p
                          className="text-muted mb-0"
                          style={{
                            whiteSpace: "pre-wrap",
                            fontSize: "0.95rem",
                          }}
                        >
                          {form.instruction}
                        </p>
                      </div>
                    </div>

                    {/* QUESTIONS RENDERER */}
                    {groupedQuestions.map((group, gIndex) => (
                      <div className="mb-5 pb-2" key={gIndex}>
                        {/* SECTION HEADER */}
                        {group.sectionName !== "" && (
                          <div className="position-relative mt-5 mb-3">
                            <div
                              className="px-3 py-1 text-white fw-medium shadow-sm"
                              style={{
                                backgroundColor: "var(--primary-color)",
                                display: "inline-block",
                                borderTopLeftRadius: "8px",
                                borderTopRightRadius: "8px",
                                fontSize: "0.85rem",
                              }}
                            >
                              Section {gIndex + 1} of {groupedQuestions.length}
                            </div>
                            <div
                              className="card bg-white shadow-sm position-relative"
                              style={{
                                border: "1px solid #e0e0e0",
                                borderTopLeftRadius: "0",
                                borderRadius: "8px",
                              }}
                            >
                              <div className="card-body p-4 p-md-4">
                                <h4
                                  className="fw-normal text-dark mb-2"
                                  style={{ fontSize: "1.5rem" }}
                                >
                                  {group.sectionName}
                                </h4>
                                {group.instruction && (
                                  <p
                                    className="text-muted small mb-0"
                                    style={{ whiteSpace: "pre-wrap" }}
                                  >
                                    {group.instruction}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* QUESTIONS MAP */}
                        <div className="d-flex flex-column gap-3 mt-3">
                          {group.questions.map((q, index) => {
                            // Find student's answer for this question
                            const answerData = respondent.answers?.find(
                              (a) => a.question_id === q.id,
                            );
                            const isCorrect = answerData?.is_correct == 1;
                            const studAns = answerData?.student_answer || "";

                            return (
                              <div
                                className="card bg-white shadow-sm position-relative transition-all"
                                style={{
                                  border: "1px solid #e0e0e0",
                                  borderLeft: `6px solid ${isCorrect ? "var(--bs-success)" : "var(--bs-danger)"}`,
                                  borderRadius: "8px",
                                }}
                                key={q.id}
                              >
                                <div className="card-body p-4 pt-5 pb-4">
                                  {/* Question Header & Points Indicator */}
                                  <div className="d-flex justify-content-between align-items-start gap-3 mb-4 border-bottom pb-3">
                                    <div className="d-flex gap-2 align-items-start flex-grow-1">
                                      <span className="fw-normal text-dark mt-1">
                                        {index + 1}.
                                      </span>
                                      <h5
                                        className="fw-normal text-dark mb-0"
                                        style={{
                                          fontSize: "1.1rem",
                                          lineHeight: "1.5",
                                        }}
                                      >
                                        {q.text}
                                      </h5>
                                    </div>
                                    <div className="text-end flex-shrink-0 mt-1">
                                      <span
                                        className={`badge ${isCorrect ? "bg-success bg-opacity-10 text-success border border-success" : "bg-danger bg-opacity-10 text-danger border border-danger"} px-3 py-2 rounded-3`}
                                      >
                                        {isCorrect ? (
                                          <i className="bi bi-check-circle-fill me-1"></i>
                                        ) : (
                                          <i className="bi bi-x-circle-fill me-1"></i>
                                        )}
                                        {answerData?.points_earned || 0} /{" "}
                                        {q.points} pt{q.points > 1 ? "s" : ""}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Options / Inputs Display */}
                                  <div className="ps-4">
                                    {q.type === "multiple_choice" &&
                                      q.choices && (
                                        <div className="d-flex flex-column gap-3">
                                          {q.choices.map((choice, cIndex) => {
                                            const isStudentChoice =
                                              studAns === choice;
                                            const isActualCorrectChoice =
                                              q.correct_answer === choice;

                                            let textColor = "text-dark";
                                            let icon =
                                              "bi-circle text-muted opacity-25";
                                            let badge = null;

                                            // KUNG ITO ANG PINILI NG STUDENT AT TAMA SIYA
                                            if (isStudentChoice && isCorrect) {
                                              textColor =
                                                "text-success fw-bold";
                                              icon =
                                                "bi-check-circle-fill text-success";
                                              badge = (
                                                <span
                                                  className="badge bg-success ms-auto rounded-3 px-2 py-1 shadow-sm"
                                                  style={{
                                                    fontSize: "0.65rem",
                                                  }}
                                                >
                                                  <i className="bi bi-check-circle-fill me-1"></i>{" "}
                                                  Correct Answer
                                                </span>
                                              );
                                            }
                                            // KUNG ITO ANG PINILI NIYA PERO MALI
                                            else if (
                                              isStudentChoice &&
                                              !isCorrect
                                            ) {
                                              textColor = "text-danger fw-bold";
                                              icon =
                                                "bi-x-circle-fill text-danger";
                                              badge = (
                                                <span
                                                  className="badge bg-danger ms-auto rounded-3 px-2 py-1 shadow-sm"
                                                  style={{
                                                    fontSize: "0.65rem",
                                                  }}
                                                >
                                                  <i className="bi bi-x-circle-fill me-1"></i>{" "}
                                                  Student's Answer
                                                </span>
                                              );
                                            }
                                            // KUNG HINDI NIYA PINILI PERO ITO PALA YUNG TAMA
                                            else if (isActualCorrectChoice) {
                                              textColor =
                                                "text-success fw-bold";
                                              icon =
                                                "bi-check-circle-fill text-success opacity-75";
                                              badge = (
                                                <span
                                                  className="badge bg-success bg-opacity-10 text-success border border-success ms-auto rounded-3 px-2 py-1"
                                                  style={{
                                                    fontSize: "0.65rem",
                                                  }}
                                                >
                                                  <i className="bi bi-check-circle-fill me-1"></i>{" "}
                                                  Correct Answer
                                                </span>
                                              );
                                            }

                                            return (
                                              <div
                                                key={cIndex}
                                                className={`d-flex align-items-center gap-3 p-2 rounded-3 transition-all ${isStudentChoice ? "bg-light border" : "border border-transparent"}`}
                                                style={{
                                                  borderColor:
                                                    isStudentChoice && isCorrect
                                                      ? "var(--bs-success)"
                                                      : isStudentChoice &&
                                                          !isCorrect
                                                        ? "var(--bs-danger)"
                                                        : "transparent",
                                                }}
                                              >
                                                <i
                                                  className={`bi ${icon} fs-5`}
                                                ></i>
                                                <span
                                                  className={`fw-normal ${textColor}`}
                                                  style={{
                                                    fontSize: "0.95rem",
                                                  }}
                                                >
                                                  {choice}
                                                </span>
                                                {badge}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}

                                    {q.type === "short_answer" && (
                                      <div
                                        className="d-flex flex-column gap-3"
                                        style={{ maxWidth: "700px" }}
                                      >
                                        <span
                                          className="small fw-bold text-muted text-uppercase"
                                          style={{
                                            fontSize: "0.7rem",
                                            letterSpacing: "0.5px",
                                          }}
                                        >
                                          Student's Answer:
                                        </span>
                                        <input
                                          type="text"
                                          className={`form-control bg-light shadow-sm py-2 px-3 fw-medium ${isCorrect ? "border-success text-success" : "border-danger text-danger"}`}
                                          value={studAns || "No Answer"}
                                          disabled
                                        />

                                        {/* INCORRECT SHORT ANSWER */}
                                        {!isCorrect && (
                                          <div className="d-flex align-items-center gap-3 p-2 mt-1 rounded-3">
                                            <i className="bi bi-check-circle-fill text-success opacity-75 fs-5"></i>
                                            <span
                                              className="fw-bold text-success"
                                              style={{ fontSize: "0.95rem" }}
                                            >
                                              {q.correct_answer}
                                            </span>
                                            <span
                                              className="badge bg-success bg-opacity-10 text-success border border-success ms-auto rounded-3 px-2 py-1 shadow-sm"
                                              style={{ fontSize: "0.65rem" }}
                                            >
                                              <i className="bi bi-check-circle-fill me-1"></i>{" "}
                                              Correct Answer
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-5 text-muted">
                  <div
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></div>
                  Loading submission...
                </div>
              )}
            </div>

            <div className="modal-footer border-top bg-white p-3 d-flex w-100">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium rounded-3 border shadow-sm"
                data-bs-dismiss="modal"
              >
                Close
              </button>

              <button
                type="button"
                className="btn btn-primary px-4 fw-bold d-flex align-items-center gap-2 shadow-sm transition-all"
                onClick={confirmStudentPDF}
              >
                <i className="bi bi-printer-fill"></i> Print Form
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmStudentPDFModal
        respondent={respondent}
        executeGenerateStudentPDF={executeGenerateStudentPDF}
      />
    </>
  );
};

export default AdminReviewSubmissionModal;
