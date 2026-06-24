import React from "react";

const SubjectFormModal = ({
  modalMode,
  formData,
  handleInputChange,
  handleFormSubmit,
  strandsList,
  selectedSubject,
  proceedToUpdateForm,
  executeDelete,
  selectedIdsCount,
}) => {
  return (
    <>
      <div
        className="modal fade"
        id="subjectFormModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
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
                    <i className="bi bi-plus-square-fill me-2"></i> Create New
                    Subject
                  </>
                ) : (
                  <>
                    <i className="bi bi-pencil-square me-2"></i> Update Subject
                  </>
                )}
              </h5>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body p-4 bg-white">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-journal-code me-1 text-muted"></i>{" "}
                    Subject Code
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light toolbar-input"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    autoFocus
                    placeholder="e.g. ENG101"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-card-text me-1 text-muted"></i> Subject
                    Description
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light toolbar-input"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Oral Communication in Context"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-diagram-3 me-1 text-muted"></i> Strand
                  </label>
                  <select
                    className="form-select bg-light toolbar-input"
                    name="strand_id"
                    value={formData.strand_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Strand</option>
                    {strandsList.map((strand) => (
                      <option key={strand.id} value={strand.id}>
                        {strand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold text-dark">
                      <i className="bi bi-mortarboard me-1 text-muted"></i>{" "}
                      Grade Level
                    </label>
                    <select
                      className="form-select bg-light toolbar-input"
                      name="grade_level"
                      value={formData.grade_level}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Grade</option>
                      <option value="11">Grade 11</option>
                      <option value="12">Grade 12</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-bold text-dark">
                      <i className="bi bi-clock-history me-1 text-muted"></i>{" "}
                      Term
                    </label>
                    <select
                      className="form-select bg-light toolbar-input"
                      name="term"
                      value={formData.term}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Term</option>
                      <option value="1st">1st Term</option>
                      <option value="2nd">2nd Term</option>
                      <option value="3rd">3rd Term</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top bg-light p-3 d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-light border px-4 fw-medium rounded-3"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-campusloop px-4 fw-bold rounded-3"
                >
                  {modalMode === "create" ? (
                    <>
                      <i className="bi bi-plus-circle-fill me-2"></i> Submit
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle-fill me-2"></i> Save
                      Changes
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
        id="updateConfirmModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-0 pb-0 justify-content-center mt-4">
              <div
                className="rounded-circle d-flex justify-content-center align-items-center"
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "rgba(98, 111, 71, 0.1)",
                }}
              >
                <i
                  className="bi bi-pencil-square"
                  style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark">Edit Subject Details</h4>
              <p className="text-muted mb-0">
                You are about to edit the information for{" "}
                <b>{selectedSubject?.code}</b>. Do you want to proceed to the
                update form?
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
                className="btn btn-campusloop px-4 fw-medium shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={proceedToUpdateForm}
              >
                Yes, Proceed
              </button>
            </div>
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
              <h4 className="fw-bold text-dark">Delete Subject</h4>
              <p className="text-muted mb-0">
                Are you sure you want to move{" "}
                {selectedSubject ? (
                  <b>{selectedSubject.code}</b>
                ) : (
                  <b>
                    {selectedIdsCount} selected subject
                    {selectedIdsCount > 1 ? "s" : ""}
                  </b>
                )}{" "}
                to the Recycle Bin?
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

export default SubjectFormModal;
