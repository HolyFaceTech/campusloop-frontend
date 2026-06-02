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

const getAuthHeader = () => {
  const token =
    localStorage.getItem("campusloop_token") ||
    sessionStorage.getItem("campusloop_token");
  return {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  };
};

const StudentTakeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const initialRender = useRef(true);
  const [groupedQuestions, setGroupedQuestions] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerInitialized, setTimerInitialized] = useState(false);
  const timerRef = useRef(null);
  const isAutoSubmitting = useRef(false);

  useEffect(() => {
    fetchFormData();
  }, [id]);

  const fetchFormData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/student/forms/${id}`,
        getAuthHeader(),
      );

      if (res.data.already_submitted) {
        setResultData(res.data);
        setIsDone(true);
        setIsLoading(false);
        return;
      }

      const formData = res.data.form;
      setForm(formData);

      let fetchedQuestions = formData.questions || [];
      if (formData.is_shuffle_questions) {
        fetchedQuestions = [...fetchedQuestions].sort(
          () => Math.random() - 0.5,
        );
      }
      setQuestions(fetchedQuestions);

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

      if (
        res.data.saved_answers &&
        Object.keys(res.data.saved_answers).length > 0
      ) {
        setAnswers(res.data.saved_answers);
      }

      if (
        res.data.time_left_seconds !== undefined &&
        res.data.time_left_seconds !== null
      ) {
        setTimeLeft(res.data.time_left_seconds);

        if (res.data.time_left_seconds <= 0 && !isAutoSubmitting.current) {
          isAutoSubmitting.current = true;
          setTimeout(() => {
            const m = new Modal(document.getElementById("timeUpModal"));
            m.show();
          }, 800);
        }
      } else if (formData.timer && formData.timer > 0) {
        setTimeLeft(formData.timer * 60);
      }

      setTimerInitialized(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching form", error);
      sileo.error({
        title: "Error",
        description: error.response?.data?.message || "Cannot load the form.",
        ...darkToast,
      });
      navigate(-1);
    }
  };

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    if (isDone || isLoading || Object.keys(answers).length === 0) return;

    const autoSaveTimer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/student/forms/${id}/save-progress`,
          { answers },
          getAuthHeader(),
        );
      } catch (error) {
        console.error("Auto-save failed", error);
      } finally {
        setIsSaving(false);
      }
    }, 1500);

    return () => clearTimeout(autoSaveTimer);
  }, [answers, id, isDone, isLoading]);

  useEffect(() => {
    if (isDone || !timerInitialized || timeLeft === null || timeLeft <= 0)
      return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!isAutoSubmitting.current) {
            isAutoSubmitting.current = true;
            const m = new Modal(document.getElementById("timeUpModal"));
            m.show();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isDone, timerInitialized]);

  const formatTime = (rawSeconds) => {
    const seconds = Math.floor(rawSeconds);
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (form && form.is_focus_mode && !isDone) {
      const triggerFocusViolation = () => {
        if (!isAutoSubmitting.current) {
          isAutoSubmitting.current = true;
          const m = new Modal(document.getElementById("focusViolationModal"));
          m.show();
        }
      };

      const handleVisibilityChange = () => {
        if (document.hidden) triggerFocusViolation();
      };
      const handleWindowBlur = () => {
        triggerFocusViolation();
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

  const isCurrentSectionComplete = () => {
    if (groupedQuestions.length === 0) return false;
    const currentGroup = groupedQuestions[currentSectionIndex];
    return currentGroup.questions.every((q) => {
      const ans = answers[q.id];
      return ans !== undefined && ans !== null && ans.trim() !== "";
    });
  };

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
          getAuthHeader(),
        );
        sileo.success({
          title: "Submitted",
          description: "Your form has been graded and submitted successfully.",
          ...darkToast,
        });

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
        if (error.response?.status === 403 || error.response?.status === 404) {
          navigate(-1);
        }
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
            className="card border-0 shadow-lg rounded-4 text-center animate__animated animate__zoomIn premium-hover-card"
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
                <span className="badge bg-success mt-3 px-3 py-2 fw-medium w-100">
                  <i className="bi bi-check-all me-1"></i>{" "}
                  <span className="d-none d-sm-inline">Successfully</span>{" "}
                  Recorded
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
            <div
              className="sticky-top d-flex justify-content-between align-items-start z-3 mb-3"
              style={{ top: "80px", pointerEvents: "none" }}
            >
              <div
                style={{
                  pointerEvents: "auto",
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                {form.is_focus_mode && (
                  <span
                    className="badge bg-danger fw-medium px-3 py-2 rounded-pill border border-danger-subtle text-danger bg-opacity-25 shadow-sm animate__animated animate__pulse animate__infinite"
                    style={{ fontSize: "0.8rem", letterSpacing: "0.5px" }}
                  >
                    <i className="bi bi-eye-fill me-2"></i>{" "}
                    <span className="d-none d-sm-inline">FOCUS MODE ON</span>
                  </span>
                )}

                {Object.keys(answers).length > 0 &&
                  (isSaving ? (
                    <span className="badge bg-secondary fw-medium px-3 py-2 rounded-pill border border-secondary-subtle text-secondary bg-opacity-25 shadow-sm animate__animated animate__fadeIn">
                      <i className="bi bi-cloud-arrow-up-fill me-1"></i>{" "}
                      <span className="d-none d-sm-inline">Saving</span>...
                    </span>
                  ) : (
                    <span className="badge bg-success fw-medium px-3 py-2 rounded-pill border border-success-subtle text-success bg-opacity-25 shadow-sm animate__animated animate__fadeIn">
                      <i className="bi bi-cloud-check-fill me-1"></i>{" "}
                      <span className="d-none d-sm-inline">Saved</span>
                    </span>
                  ))}
              </div>
              <div style={{ pointerEvents: "auto" }}>
                {timeLeft !== null && (
                  <span
                    className={`badge px-4 py-2 fs-5 bg-opacity-50 border rounded-3 fw-medium shadow-sm ${timeLeft <= 60 ? " text-danger bg-danger border-danger-subtle animate__animated animate__flash animate__infinite" : "bg-dark text-white border-dark-subtle"}`}
                  >
                    <i className="bi bi-stopwatch me-2"></i>{" "}
                    {formatTime(timeLeft)}
                  </span>
                )}
              </div>
            </div>

            <div
              className="card bg-white shadow-sm mb-4 position-relative premium-hover-card"
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
                      Total Point{totalPoints > 1 ? "s" : ""}
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

            {currentGroup && (
              <form
                onSubmit={promptSubmit}
                className="animate__animated animate__fadeIn"
              >
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
                      className="card bg-white shadow-sm position-relative premium-hover-card"
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

                <div className="d-flex flex-column gap-3 mt-3">
                  {currentGroup.questions.map((q, index) => (
                    <div
                      className="card bg-white shadow-sm position-relative transition-all premium-hover-card"
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
                                    disabled={
                                      timeLeft !== null && timeLeft <= 0
                                    }
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
                                disabled={timeLeft !== null && timeLeft <= 0}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-5 pb-5">
                  <div className="flex-grow-1 d-flex justify-content-start">
                    {currentSectionIndex > 0 && (
                      <button
                        type="button"
                        className="btn btn-light border fw-medium shadow-sm px-4 py-2 rounded-3 w-80 w-sm-auto"
                        onClick={handlePrevSection}
                      >
                        <i className="bi bi-arrow-left me-2"></i>{" "}
                        <span className="d-none d-sm-inline">Back</span>
                      </button>
                    )}
                  </div>

                  <div className="flex-grow-1 d-flex justify-content-end">
                    {!isLastSection ? (
                      <button
                        type="button"
                        className={`btn fw-medium shadow-sm px-4 py-2 rounded-3 w-80 w-sm-auto ${isCurrentSectionComplete() ? "btn-campusloop" : "btn-secondary opacity-50"}`}
                        onClick={handleNextSection}
                        disabled={!isCurrentSectionComplete()}
                      >
                        <span className="d-none d-sm-inline">Next</span>{" "}
                        <i className="bi bi-arrow-right ms-2"></i>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className={`btn fw-bold shadow-lg px-5 py-2 rounded-3 w-80 w-sm-auto ${isFormComplete() ? "btn-campusloop" : "btn-secondary opacity-50"}`}
                        disabled={!isFormComplete()}
                      >
                        <i className="bi bi-send-check-fill me-2"></i>{" "}
                        <span className="d-none d-sm-inline">Submit</span>
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
