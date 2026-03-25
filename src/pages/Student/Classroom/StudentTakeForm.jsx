import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { sileo } from "sileo";
import { Modal } from "bootstrap";
import GlobalSpinner from "../../../components/Shared/GlobalSpinner";
import StudentTakeFormModals from "./StudentTakeFormModals";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const StudentTakeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SECTIONING STATE
  const [groupedQuestions, setGroupedQuestions] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // RESULT STATE (Para sa Congratulation Card)
  const [isDone, setIsDone] = useState(false);
  const [resultData, setResultData] = useState(null);

  // TIMER STATE
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);
  const isAutoSubmitting = useRef(false);

  useEffect(() => {
    fetchFormData();
  }, [id]);

  const fetchFormData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/student/forms/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );

      // KUNG TAPOS NA PALA SIYA, DIRETSO SA RESULT CARD
      if (res.data.already_submitted) {
        setResultData(res.data);
        setIsDone(true);
        setIsLoading(false);
        return;
      }

      const formData = res.data.form;
      setForm(formData);

      // SHUFFLE LOGIC
      let fetchedQuestions = formData.questions || [];
      if (formData.is_shuffle_questions) {
        fetchedQuestions = [...fetchedQuestions].sort(
          () => Math.random() - 0.5,
        );
      }
      setQuestions(fetchedQuestions);

      // GROUPING LOGIC
      const groups = [];
      fetchedQuestions.forEach((q) => {
        const secName = q.section || "";
        let group = groups.find((g) => g.sectionName === secName);
        if (!group) {
          group = {
            sectionName: secName,
            instruction: q.instruction || "",
            questions: [],
          };
          groups.push(group);
        } else {
          if (!group.instruction && q.instruction)
            group.instruction = q.instruction;
        }
        group.questions.push(q);
      });
      setGroupedQuestions(groups);

      // TIMER INITIALIZATION
      if (formData.timer && formData.timer > 0) {
        setTimeLeft(formData.timer * 60);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching form", error);
      sileo.error({
        title: "Error",
        description: "Cannot load the form.",
        ...darkToast,
      });
      navigate(-1);
    }
  };

  useEffect(() => {
    if (isDone) return; // Stop timer if already submitted

    if (timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAutoSubmitting.current) {
      clearInterval(timerRef.current);
      isAutoSubmitting.current = true;
      const m = new Modal(document.getElementById("timeUpModal"));
      m.show();
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft, isDone]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (form && form.is_focus_mode && !isDone) {
      const handleVisibilityChange = () => {
        if (document.hidden && !isAutoSubmitting.current) {
          isAutoSubmitting.current = true;
          const m = new Modal(document.getElementById("focusViolationModal"));
          m.show();
        }
      };
      const handleWindowBlur = () => {
        if (!isAutoSubmitting.current) {
          isAutoSubmitting.current = true;
          const m = new Modal(document.getElementById("focusViolationModal"));
          m.show();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleWindowBlur);

      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
        window.removeEventListener("blur", handleWindowBlur);
      };
    }
  }, [form, isDone]);

  const handleKeyDown = (e) => {
    if (form?.is_focus_mode && !isDone) {
      if (
        e.key === "PrintScreen" ||
        (e.ctrlKey &&
          (e.key === "c" || e.key === "v" || e.key === "p" || e.key === "s"))
      ) {
        e.preventDefault();
        sileo.error({
          title: "Warning",
          description: "This action is disabled in Focus Mode.",
          ...darkToast,
        });
      }
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  // Check if current section is fully answered
  const isCurrentSectionComplete = () => {
    if (groupedQuestions.length === 0) return false;
    const currentGroup = groupedQuestions[currentSectionIndex];
    return currentGroup.questions.every((q) => {
      const ans = answers[q.id];
      return ans !== undefined && ans !== null && ans.trim() !== "";
    });
  };

  // Check if ALL questions in the form are answered
  const isFormComplete = () => {
    return questions.every((q) => {
      const ans = answers[q.id];
      return ans !== undefined && ans !== null && ans.trim() !== "";
    });
  };

  const handleNextSection = () => {
    if (currentSectionIndex < groupedQuestions.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const promptSubmit = (e) => {
    e.preventDefault();
    const modal = new Modal(document.getElementById("submitConfirmModal"));
    modal.show();
  };

  const executeSubmit = async () => {
    setIsSubmitting(true);

    setTimeout(async () => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/student/forms/${id}/submit`,
          { answers },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
            },
          },
        );
        sileo.success({
          title: "Submitted",
          description: "Your form has been graded and submitted successfully.",
          ...darkToast,
        });

        // SHOW CONGRATULATION CARD
        setResultData(res.data);
        setIsDone(true);
        setIsSubmitting(false);
      } catch (error) {
        sileo.error({
          title: "Submission Failed",
          description: error.response?.data?.message || "An error occurred.",
          ...darkToast,
        });
        setIsSubmitting(false);
        navigate(-1);
      }
    }, 400);
  };

  if (isLoading)
    return <GlobalSpinner isLoading={true} text="Preparing your form..." />;
  if (isSubmitting)
    return <GlobalSpinner isLoading={true} text="Auto-Checking Answers..." />;

  const totalPoints =
    form?.questions?.reduce((sum, q) => sum + q.points, 0) || 0;
  const currentGroup = groupedQuestions[currentSectionIndex];
  const isLastSection = currentSectionIndex === groupedQuestions.length - 1;

  return (
    <div
      style={{ userSelect: form?.is_focus_mode && !isDone ? "none" : "auto" }}
      onCopy={(e) => {
        if (form?.is_focus_mode && !isDone) e.preventDefault();
      }}
      onPaste={(e) => {
        if (form?.is_focus_mode && !isDone) e.preventDefault();
      }}
      onContextMenu={(e) => {
        if (form?.is_focus_mode && !isDone) e.preventDefault();
      }}
      onKeyDown={handleKeyDown}
      tabIndex="0"
    >
      {isDone ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "80vh" }}
        >
          <div
            className="card border-0 shadow-lg rounded-4 text-center animate__animated animate__zoomIn"
            style={{ maxWidth: "500px", width: "100%" }}
          >
            <div className="card-header border-0 pb-0 pt-5 bg-white">
              <div
                className="rounded-circle bg-success bg-opacity-10 d-flex justify-content-center align-items-center mx-auto mb-3"
                style={{ width: "100px", height: "100px" }}
              >
                <i
                  className="bi bi-patch-check-fill text-success"
                  style={{ fontSize: "4rem" }}
                ></i>
              </div>
            </div>
            <div className="card-body p-5 pt-3">
              <h2 className="fw-bold text-dark mb-1">Congratulations!</h2>
              <p className="text-muted fw-medium mb-4 fs-5">
                {resultData?.student_name}
              </p>

              <div className="bg-light p-4 rounded-4 border border-light-subtle mb-4">
                <p
                  className="text-muted small fw-bold text-uppercase mb-2"
                  style={{ letterSpacing: "1px" }}
                >
                  {resultData?.form_name}
                </p>
                <h1 className="display-3 fw-bolder text-primary mb-0">
                  {resultData?.score}{" "}
                  <span className="text-muted fs-4">
                    / {resultData?.total_points}
                  </span>
                </h1>
                <span className="badge bg-success mt-3 px-3 py-2 fw-medium">
                  <i className="bi bi-check-all me-1"></i> Successfully Recorded
                </span>
              </div>

              <button
                onClick={() => navigate(-1)}
                className="btn btn-campusloop w-100 py-3 fw-bold rounded-3 shadow-sm"
              >
                <i className="bi bi-arrow-left-circle-fill me-2"></i> Back to
                Classroom
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mx-auto pb-5 px-3 pt-4" style={{ maxWidth: "770px" }}>
            {/* FLOATING HEADER BAR (TIMER & FOCUS) */}
            {(form.is_focus_mode || timeLeft !== null) && (
              <div
                className="sticky-top d-flex justify-content-between align-items-start z-3 mb-3"
                style={{ top: "80px", pointerEvents: "none" }}
              >
                <div style={{ pointerEvents: "auto" }}>
                  {form.is_focus_mode && (
                    <span
                      className="badge bg-danger px-3 py-2 rounded-pill shadow-sm animate__animated animate__pulse animate__infinite"
                      style={{ fontSize: "0.8rem", letterSpacing: "0.5px" }}
                    >
                      <i className="bi bi-eye-fill me-2"></i> FOCUS MODE ON
                    </span>
                  )}
                </div>
                <div style={{ pointerEvents: "auto" }}>
                  {timeLeft !== null && (
                    <span
                      className={`badge px-4 py-2 fs-5 rounded-pill shadow-sm ${timeLeft <= 60 ? "bg-danger animate__animated animate__flash animate__infinite" : "bg-dark"}`}
                    >
                      <i className="bi bi-stopwatch me-2"></i>{" "}
                      {formatTime(timeLeft)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* TITLE WARNING */}
            <div
              className="card bg-white shadow-sm mb-4 position-relative"
              style={{
                border: "1px solid #e0e0e0",
                borderTop: "10px solid var(--primary-color)",
                borderRadius: "8px",
              }}
            >
              <div className="card-body p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="w-100 pe-4">
                    <h2
                      className="fw-normal text-dark mb-3"
                      style={{ fontSize: "2.2rem", letterSpacing: "-0.5px" }}
                    >
                      {form.name}
                    </h2>
                    <p
                      className="text-muted mb-0"
                      style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem" }}
                    >
                      {form.instruction}
                    </p>
                  </div>
                  <div className="text-end flex-shrink-0 d-none d-md-block">
                    <span
                      className="text-muted fw-medium small d-block text-uppercase"
                      style={{ letterSpacing: "1px", fontSize: "0.65rem" }}
                    >
                      Total Points
                    </span>
                    <span
                      className="fw-bold text-dark"
                      style={{ fontSize: "2rem" }}
                    >
                      {totalPoints}
                    </span>
                  </div>
                </div>

                {form.is_focus_mode && (
                  <div className="mt-4 p-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-3 w-100">
                    <strong className="text-danger small">
                      <i className="bi bi-shield-lock-fill me-1"></i> Warning:
                    </strong>
                    <p className="text-danger small mb-0 mt-1">
                      If you switch tabs, minimize the browser, or take
                      screenshots, the system will automatically submit your
                      exam.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION RENDERER */}
            {currentGroup && (
              <form
                onSubmit={promptSubmit}
                className="animate__animated animate__fadeIn"
              >
                {/* SECTION HEADER */}
                {currentGroup.sectionName !== "" && (
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
                      Section {currentSectionIndex + 1} of{" "}
                      {groupedQuestions.length}
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
                          {currentGroup.sectionName}
                        </h4>
                        {currentGroup.instruction && (
                          <p
                            className="text-muted small mb-0"
                            style={{ whiteSpace: "pre-wrap" }}
                          >
                            {currentGroup.instruction}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION QUESTIONS */}
                <div className="d-flex flex-column gap-3 mt-3">
                  {currentGroup.questions.map((q, index) => (
                    <div
                      className="card bg-white shadow-sm position-relative transition-all"
                      style={{
                        border: "1px solid #e0e0e0",
                        borderLeft: "6px solid var(--primary-color)",
                        borderRadius: "8px",
                      }}
                      key={q.id}
                    >
                      <div className="card-body p-4 pt-5 pb-4">
                        <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                          <div className="d-flex gap-2 align-items-start flex-grow-1">
                            <span className="fw-normal text-dark mt-1">
                              {index + 1}.
                            </span>
                            <h5
                              className="fw-normal text-dark mb-0"
                              style={{ fontSize: "1.1rem", lineHeight: "1.5" }}
                            >
                              {q.text}
                            </h5>
                          </div>
                          <div className="text-end flex-shrink-0 mt-1">
                            <span
                              className="text-muted fw-medium"
                              style={{ fontSize: "0.85rem" }}
                            >
                              {q.points} pt{q.points > 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>

                        <div className="ps-4">
                          {q.type === "multiple_choice" && q.choices && (
                            <div className="d-flex flex-column gap-3">
                              {q.choices.map((choice, cIndex) => (
                                <label
                                  key={cIndex}
                                  className="d-flex align-items-center gap-3"
                                  style={{ cursor: "pointer" }}
                                >
                                  <input
                                    type="radio"
                                    name={`question_${q.id}`}
                                    value={choice}
                                    checked={answers[q.id] === choice}
                                    onChange={() =>
                                      handleAnswerChange(q.id, choice)
                                    }
                                    required
                                    style={{
                                      width: "20px",
                                      height: "20px",
                                      accentColor: "var(--primary-color)",
                                    }}
                                  />
                                  <span
                                    className="fw-normal text-dark"
                                    style={{ fontSize: "0.95rem" }}
                                  >
                                    {choice}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}

                          {q.type === "short_answer" && (
                            <div
                              className="d-flex flex-column gap-2"
                              style={{ maxWidth: "400px" }}
                            >
                              <input
                                type="text"
                                className="form-control bg-light border-light-subtle shadow-sm py-2 px-3"
                                placeholder="Type your answer here..."
                                value={answers[q.id] || ""}
                                onChange={(e) =>
                                  handleAnswerChange(q.id, e.target.value)
                                }
                                required
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* NAVIGATION BUTTONS RESPONSIVE FIX */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-5 pb-5">
                  <div className="flex-grow-1 d-flex justify-content-start">
                    {currentSectionIndex > 0 && (
                      <button
                        type="button"
                        className="btn btn-light border fw-bold shadow-sm px-4 py-2 rounded-3 w-80 w-sm-auto"
                        onClick={handlePrevSection}
                      >
                        <i className="bi bi-arrow-left me-2"></i> Back
                      </button>
                    )}
                  </div>

                  <div className="flex-grow-1 d-flex justify-content-end">
                    {!isLastSection ? (
                      <button
                        type="button"
                        className={`btn fw-bold shadow-sm px-5 py-2 rounded-3 w-80 w-sm-auto ${isCurrentSectionComplete() ? "btn-campusloop" : "btn-secondary opacity-50"}`}
                        onClick={handleNextSection}
                        disabled={!isCurrentSectionComplete()}
                      >
                        Next <i className="bi bi-arrow-right ms-2"></i>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className={`btn fw-bold shadow-lg px-5 py-2 rounded-3 w-80 w-sm-auto ${isFormComplete() ? "btn-campusloop" : "btn-secondary opacity-50"}`}
                        disabled={!isFormComplete()}
                      >
                        <i className="bi bi-send-check-fill me-2"></i> Submit
                      </button>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>

          <StudentTakeFormModals executeSubmit={executeSubmit} />
        </>
      )}
    </div>
  );
};

export default StudentTakeForm;
