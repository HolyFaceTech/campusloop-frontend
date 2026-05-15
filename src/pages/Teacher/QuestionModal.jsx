import React from "react";

const QuestionModal = ({
  modalMode,
  formData,
  handleInputChange,
  handleTypeChange,
  handleChoiceChange,
  addChoice,
  removeChoice,
  correctAnswerIndex,
  setCorrectAnswerIndex,
  handleInitialSubmit,
  existingSections = [],
  executeDelete,
}) => {
  return (
    <>
      <div
        className="modal fade"
        id="questionModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div
              className="modal-header border-bottom pb-3"
              style={{ backgroundColor: "var(--accent-color)" }}
            >
              <h5
                className="modal-title fw-bold"
                style={{ color: "var(--primary-color)" }}
              >
                {modalMode === "create" ? (
                  <>
                    <i className="bi bi-plus-square-fill me-2"></i> Add Question
                  </>
                ) : (
                  <>
                    <i className="bi bi-pencil-square me-2"></i> Update Question
                  </>
                )}
              </h5>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <form onSubmit={(e) => handleInitialSubmit(e)}>
              <div className="modal-body p-4 bg-white">
                <div className="row">
                  <div className="col-md-5 mb-3">
                    <label className="form-label small fw-bold text-dark">
                      <i className="bi bi-folder2-open me-1 text-muted"></i>{" "}
                      Section Name
                    </label>
                    <input
                      type="text"
                      className="form-control bg-light toolbar-input"
                      name="section"
                      list="sectionOptions"
                      value={formData.section}
                      onChange={handleInputChange}
                      placeholder="e.g. Part I: Multiple Choice"
                    />
                    <datalist id="sectionOptions">
                      {existingSections.map((sec, idx) => (
                        <option key={idx} value={sec} />
                      ))}
                    </datalist>
                  </div>

                  <div className="col-md-7 mb-3">
                    <label className="form-label small fw-bold text-dark">
                      <i className="bi bi-info-circle me-1 text-muted"></i>{" "}
                      Section Instruction
                    </label>
                    <textarea
                      className="form-control bg-light toolbar-input custom-scrollbar"
                      name="instruction"
                      value={formData.instruction}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="e.g. Choose the best answer for the following questions."
                    ></textarea>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-question-circle me-1 text-muted"></i>{" "}
                    Question Text
                  </label>
                  <textarea
                    className="form-control bg-light toolbar-input custom-scrollbar"
                    name="text"
                    value={formData.text}
                    onChange={handleInputChange}
                    rows="3"
                    required
                    placeholder="Type your question here..."
                  ></textarea>
                </div>

                <div className="row">
                  <div className="col-md-8 mb-3">
                    <label className="form-label small fw-bold text-dark">
                      <i className="bi bi-ui-radios me-1 text-muted"></i> Answer
                      Type
                    </label>
                    <select
                      className="form-select bg-light toolbar-input"
                      name="type"
                      value={formData.type}
                      onChange={handleTypeChange}
                      required
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="short_answer">
                        Short Answer / Identification
                      </option>
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label small fw-bold text-dark">
                      <i className="bi bi-star me-1 text-muted"></i> Points
                    </label>
                    <input
                      type="number"
                      className="form-control bg-light toolbar-input"
                      name="points"
                      value={formData.points}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>
                </div>

                {formData.type === "multiple_choice" && (
                  <div className="mb-2 mt-2">
                    <label className="form-label small fw-bold text-dark mb-2">
                      <i className="bi bi-list-check me-1 text-muted"></i>{" "}
                      Choices{" "}
                      <span className="text-muted fw-normal">
                        (Select the radio button for the correct answer)
                      </span>
                    </label>
                    {formData.choices.map((choice, index) => (
                      <div
                        className="d-flex align-items-center gap-2 mb-2"
                        key={index}
                      >
                        <input
                          className="form-check-input mt-0 border-secondary"
                          type="radio"
                          name="correctAnswer"
                          style={{
                            width: "1.5rem",
                            height: "1.5rem",
                            cursor: "pointer",
                          }}
                          checked={correctAnswerIndex === index}
                          onChange={() => setCorrectAnswerIndex(index)}
                          required
                        />
                        <input
                          type="text"
                          className={`form-control toolbar-input ${correctAnswerIndex === index ? "border-success bg-success bg-opacity-10 text-success fw-bold" : "bg-light"}`}
                          value={choice}
                          onChange={(e) =>
                            handleChoiceChange(index, e.target.value)
                          }
                          placeholder={`Option ${index + 1}`}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-light text-danger border-0 rounded-circle d-flex justify-content-center align-items-center"
                          style={{ width: "35px", height: "35px" }}
                          onClick={() => removeChoice(index)}
                          disabled={formData.choices.length <= 2}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn btn-sm d-inline-flex align-items-center mt-2 transition-all fw-bold"
                      style={{
                        backgroundColor: "rgba(98, 111, 71, 0.1)",
                        color: "var(--primary-color)",
                        border: "1px dashed var(--primary-color)",
                        borderRadius: "8px",
                        padding: "0.5rem 1rem",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--primary-color)";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(98, 111, 71, 0.1)";
                        e.currentTarget.style.color = "var(--primary-color)";
                      }}
                      onClick={addChoice}
                    >
                      <i className="bi bi-plus-circle me-2"></i> Add Another
                      Option
                    </button>
                  </div>
                )}

                {formData.type === "short_answer" && (
                  <div className="p-3 rounded-4 border border-success bg-success bg-opacity-10 mt-2">
                    <label className="form-label small fw-bold text-success mb-1">
                      <i className="bi bi-fonts me-1"></i> Exact Correct Answer
                    </label>
                    <p className="small text-muted mb-2">
                      The system's auto-checker will strictly compare the
                      student's input to this text.
                    </p>
                    <input
                      type="text"
                      className="form-control border-success fw-bold"
                      name="correct_answer"
                      value={formData.correct_answer}
                      onChange={handleInputChange}
                      placeholder="Type the exact correct answer..."
                      required={formData.type === "short_answer"}
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer border-top bg-light p-3 d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light border px-4 fw-medium rounded-3"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-campusloop px-4 fw-bold rounded-3 d-flex align-items-center gap-2"
                >
                  {modalMode === "create" ? (
                    <>
                      <i className="bi bi-plus-circle-fill"></i> Submit
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle-fill"></i> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="deleteConfirmModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-0 pb-0 justify-content-center mt-4">
              <div
                className="rounded-circle bg-danger bg-opacity-10 d-flex justify-content-center align-items-center"
                style={{ width: "80px", height: "80px" }}
              >
                <i
                  className="bi bi-exclamation-triangle-fill text-danger"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark mt-2">Delete Question</h4>
              <p className="text-muted mb-0">
                Are you sure you want to remove this question?
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger px-4 fw-medium shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={executeDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionModal;
