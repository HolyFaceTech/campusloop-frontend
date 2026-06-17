import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { sileo } from "sileo";
import { Modal } from "bootstrap";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import QuestionModal from "./QuestionModal";

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

const FormBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading Builder...");
  const [modalMode, setModalMode] = useState("create");
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const [formData, setFormData] = useState({
    section: "",
    instruction: "",
    text: "",
    type: "multiple_choice",
    choices: ["Option 1"],
    correct_answer: "",
    points: 1,
  });

  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null);

  useEffect(() => {
    fetchFormData();
  }, [id]);

  const fetchFormData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/forms/${id}`,
        getAuthHeader(),
      );
      setForm(res.data);
    } catch (error) {
      console.error("Error fetching form", error);
      navigate("/teacher/forms");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    if (type === "multiple_choice" && formData.choices.length === 0) {
      setFormData({ ...formData, type, choices: ["Option 1"] });
    } else {
      setFormData({ ...formData, type });
    }
  };

  const handleChoiceChange = (index, value) => {
    const newChoices = [...formData.choices];
    newChoices[index] = value;
    setFormData({ ...formData, choices: newChoices });
  };

  const addChoice = () => {
    setFormData({
      ...formData,
      choices: [...formData.choices, `Option ${formData.choices.length + 1}`],
    });
  };

  const removeChoice = (index) => {
    const newChoices = formData.choices.filter((_, i) => i !== index);
    setFormData({ ...formData, choices: newChoices });
    if (correctAnswerIndex === index) setCorrectAnswerIndex(null);
  };

  const openQuestionModal = (mode, questionOrSection = null) => {
    setModalMode(mode);

    let targetSection = "";
    let targetInstruction = "";

    if (mode === "update" && questionOrSection) {
      targetSection = questionOrSection.section || "";
      targetInstruction = questionOrSection.instruction || "";
    } else {
      targetSection =
        typeof questionOrSection === "string" ? questionOrSection : "";
    }

    if (
      (!targetInstruction || targetInstruction.trim() === "") &&
      targetSection &&
      form?.questions
    ) {
      const matchedQuestion = form.questions.find(
        (q) =>
          q.section === targetSection &&
          q.instruction &&
          q.instruction.trim() !== "",
      );
      if (matchedQuestion) {
        targetInstruction = matchedQuestion.instruction;
      }
    }

    if (mode === "update" && questionOrSection) {
      setSelectedQuestion(questionOrSection);
      setFormData({
        section: targetSection,
        instruction: targetInstruction,
        text: questionOrSection.text,
        type: questionOrSection.type,
        choices: questionOrSection.choices || [],
        correct_answer:
          questionOrSection.type === "short_answer"
            ? questionOrSection.correct_answer
            : "",
        points: questionOrSection.points,
      });
      if (questionOrSection.type === "multiple_choice") {
        const idx = questionOrSection.choices.findIndex(
          (c) => c === questionOrSection.correct_answer,
        );
        setCorrectAnswerIndex(idx >= 0 ? idx : null);
      }
    } else {
      setSelectedQuestion(null);
      setFormData({
        section: targetSection,
        instruction: targetInstruction,
        text: "",
        type: "multiple_choice",
        choices: ["Option 1"],
        correct_answer: "",
        points: 1,
      });
      setCorrectAnswerIndex(null);
    }
    const modal = new Modal(document.getElementById("questionModal"));
    modal.show();
  };

  const handleInitialSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    let finalPayload = { ...formData };

    if (formData.type === "multiple_choice") {
      if (correctAnswerIndex === null) {
        sileo.error({
          title: "Incomplete",
          description:
            "Please select a correct answer by clicking the radio button.",
          ...darkToast,
        });
        return;
      }
      const hasEmptyChoices = formData.choices.some((c) => c.trim() === "");
      if (hasEmptyChoices) {
        sileo.error({
          title: "Incomplete",
          description: "Please fill in all choice fields.",
          ...darkToast,
        });
        return;
      }
      finalPayload.correct_answer = formData.choices[correctAnswerIndex];
    } else {
      if (!formData.correct_answer || formData.correct_answer.trim() === "") {
        sileo.error({
          title: "Incomplete",
          description: "Please provide the exact correct answer.",
          ...darkToast,
        });
        return;
      }
    }

    setFormData(finalPayload);
    executeSubmit(finalPayload);
  };

  const executeSubmit = async (payload) => {
    if (document.activeElement) {
      document.activeElement.blur();
    }

    const modalEl = document.getElementById("questionModal");
    if (modalEl) {
      const modalInstance = Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();
    }

    setTimeout(async () => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      setIsLoading(true);
      setLoadingText(
        modalMode === "create" ? "Adding Question..." : "Saving Changes...",
      );

      try {
        if (modalMode === "create") {
          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/forms/${id}/questions`,
            payload,
            getAuthHeader(),
          );
          sileo.success({
            title: "Success",
            description: "Question added.",
            ...darkToast,
          });
        } else {
          await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/questions/${selectedQuestion.id}`,
            payload,
            getAuthHeader(),
          );
          sileo.success({
            title: "Success",
            description: "Question updated.",
            ...darkToast,
          });
        }
        await fetchFormData();
      } catch (error) {
        console.error(error);
        sileo.error({
          title: "Failed",
          description: "Failed to save question. Please check inputs.",
          ...darkToast,
        });
        setIsLoading(false);
      }
    }, 300);
  };

  const confirmDelete = (item) => {
    setSelectedQuestion(item);
    const modal = new Modal(document.getElementById("deleteConfirmModal"));
    modal.show();
  };

  const executeDelete = async () => {
    if (document.activeElement) {
      document.activeElement.blur();
    }

    const modalEl = document.getElementById("deleteConfirmModal");
    if (modalEl) {
      const modalInstance = Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();
    }

    setTimeout(async () => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      setIsLoading(true);
      setLoadingText("Deleting Question...");
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/questions/${selectedQuestion.id}`,
          getAuthHeader(),
        );
        sileo.success({
          title: "Deleted",
          description: "Question removed.",
          ...darkToast,
        });
        await fetchFormData();
      } catch (error) {
        sileo.error({
          title: "Failed",
          description: "Could not delete question.",
          ...darkToast,
        });
        setIsLoading(false);
      }
    }, 300);
  };

  if (!form)
    return <GlobalSpinner isLoading={true} text="Loading Builder..." />;

  const groupedQuestions = [];
  const existingSections = [];

  if (form.questions) {
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
        if (!group.instruction && q.instruction) {
          group.instruction = q.instruction;
        }
      }
      group.questions.push(q);
    });
  }

  const totalPoints = form.questions
    ? form.questions.reduce((sum, q) => sum + q.points, 0)
    : 0;

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <nav aria-label="breadcrumb" className="mb-4 ps-1">
        <ol className="breadcrumb mb-0 align-items-center">
          <li className="breadcrumb-item">
            <Link
              to="/teacher/forms"
              className="text-decoration-none small text-muted fw-medium"
            >
              Forms
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link
              to={`/teacher/forms/${id}`}
              className="text-decoration-none small text-muted fw-medium text-truncate"
              style={{
                maxWidth: "250px",
                display: "inline-block",
                verticalAlign: "bottom",
              }}
            >
              {form.name}
            </Link>
          </li>
          <li className="breadcrumb-item small active fw-bold text-dark">
            Builder
          </li>
        </ol>
      </nav>

      <div className="mx-auto pb-5" style={{ maxWidth: "770px" }}>
        <div
          className="card bg-white shadow-sm mb-4 position-relative border-0 premium-hover-card"
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
          </div>
        </div>

        {groupedQuestions.length > 0 ? (
          groupedQuestions.map((group, gIndex) => (
            <div className="mb-5 pb-2" key={gIndex}>
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
                    className="card bg-white shadow-sm position-relative border-0 premium-hover-card shadow-sm"
                    style={{
                      border: "1px solid #e0e0e0",
                      borderTopLeftRadius: "0",
                      borderTopRightRadius: "8px",
                      borderBottomLeftRadius: "8px",
                      borderBottomRightRadius: "8px",
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

              <div className="d-flex flex-column gap-3 mt-3">
                {group.questions.map((q, index) => (
                  <div
                    className="card bg-white shadow-sm position-relative transition-all border-0 premium-hover-card"
                    style={{
                      border: "1px solid #e0e0e0",
                      borderLeft: "6px solid var(--primary-color)",
                      borderRadius: "8px",
                    }}
                    key={q.id}
                  >
                    <div className="card-body p-4 pt-5 pb-3">
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

                      <div className="ps-4 mb-4">
                        {q.type === "multiple_choice" && q.choices && (
                          <div className="d-flex flex-column gap-3">
                            {q.choices.map((choice, cIndex) => (
                              <div
                                key={cIndex}
                                className="d-flex align-items-center gap-3"
                              >
                                <i
                                  className={`bi ${q.correct_answer === choice ? "bi-check-circle-fill text-success" : "bi-circle text-muted opacity-50"} fs-5`}
                                ></i>
                                <span
                                  className={`fw-normal ${q.correct_answer === choice ? "text-success fw-bold" : "text-dark"}`}
                                  style={{ fontSize: "0.95rem" }}
                                >
                                  {choice}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === "short_answer" && (
                          <div
                            className="d-flex align-items-center gap-3 border-bottom pb-2"
                            style={{ maxWidth: "400px" }}
                          >
                            <span className="text-muted">Answer:</span>
                            <span className="fw-bold text-success">
                              {q.correct_answer}
                            </span>
                            <i className="bi bi-check-circle-fill text-success ms-auto"></i>
                          </div>
                        )}
                      </div>

                      <div className="d-flex justify-content-end align-items-center border-top pt-2 mt-2">
                        <div className="d-flex gap-3 pe-2">
                          <button
                            onClick={() => openQuestionModal("update", q)}
                            className="btn btn-sm shadow-none p-1 d-flex justify-content-center align-items-center bg-transparent border-0"
                            title="Edit Question"
                            style={{ transition: "all 0.2s ease" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform = "scale(1.2)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                          >
                            <i className="bi bi-pencil fs-5 text-dark"></i>
                          </button>
                          <button
                            onClick={() => confirmDelete(q)}
                            className="btn btn-sm shadow-none p-1 d-flex justify-content-center align-items-center bg-transparent border-0"
                            title="Delete Question"
                            style={{ transition: "all 0.2s ease" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform = "scale(1.2)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                          >
                            <i className="bi bi-trash fs-5 text-danger"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 px-1">
                <button
                  onClick={() => openQuestionModal("create", group.sectionName)}
                  className="btn w-100 py-3 fw-bold d-flex justify-content-center align-items-center shadow-sm"
                  style={{
                    backgroundColor: "var(--accent-color)",
                    border: "2px dashed var(--primary-color)",
                    color: "var(--primary-color)",
                    borderRadius: "8px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--primary-color)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--accent-color)";
                    e.currentTarget.style.color = "var(--primary-color)";
                  }}
                >
                  <i className="bi bi-plus-circle-fill fs-5 me-2"></i> Add
                  Question to this Section
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 mt-4">
            <div
              className="card bg-white border-0 premium-hover-card border-light-subtle shadow-sm text-center py-5"
              style={{ borderRadius: "8px" }}
            >
              <div className="card-body py-5">
                <div
                  className="rounded-circle bg-light d-flex justify-content-center align-items-center mx-auto mb-4"
                  style={{ width: "90px", height: "90px" }}
                >
                  <i
                    className="bi bi-ui-radios text-muted opacity-50"
                    style={{ fontSize: "3rem" }}
                  ></i>
                </div>
                <h4 className="fw-normal text-dark mb-3">
                  No questions added yet
                </h4>
                <p
                  className="text-muted small mb-4"
                  style={{ maxWidth: "400px", margin: "0 auto" }}
                >
                  Your form is currently empty. Start building your form by
                  adding sections and questions.
                </p>
                <button
                  onClick={() => openQuestionModal("create")}
                  className="btn shadow-sm fw-medium px-4 py-2 rounded-3 text-white d-inline-flex align-items-center gap-2"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 20px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 6px rgba(0,0,0,0.1)";
                  }}
                >
                  <i className="bi bi-plus-circle-fill fs-5"></i> Add Your First
                  Question
                </button>
              </div>
            </div>
          </div>
        )}

        {groupedQuestions.length > 0 && (
          <div className="text-center mt-5 mb-5 pb-4">
            <div className="d-flex align-items-center justify-content-center gap-3">
              <hr className="flex-grow-1 opacity-10" />
              <button
                onClick={() => openQuestionModal("create", "")}
                className="btn bg-white border border-2 shadow-sm fw-bold px-4 py-2 rounded-pill text-dark d-inline-flex align-items-center"
                style={{ transition: "all 0.3s ease" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--primary-color)";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.borderColor = "var(--primary-color)";
                  e.currentTarget.classList.remove("text-dark");
                  e.currentTarget.classList.remove("bg-white");
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = "";
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.classList.add("text-dark");
                  e.currentTarget.classList.add("bg-white");
                }}
              >
                <i className="bi bi-layout-split fs-5 me-2"></i> Add New Section
              </button>
              <hr className="flex-grow-1 opacity-10" />
            </div>
          </div>
        )}
      </div>

      <QuestionModal
        modalMode={modalMode}
        formData={formData}
        handleInputChange={handleInputChange}
        handleTypeChange={handleTypeChange}
        handleChoiceChange={handleChoiceChange}
        addChoice={addChoice}
        removeChoice={removeChoice}
        correctAnswerIndex={correctAnswerIndex}
        setCorrectAnswerIndex={setCorrectAnswerIndex}
        handleInitialSubmit={handleInitialSubmit}
        existingSections={existingSections}
        executeDelete={executeDelete}
      />
    </>
  );
};

export default FormBuilder;
