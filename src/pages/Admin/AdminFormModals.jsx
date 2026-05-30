import React from "react";

export const DeleteFormsModal = ({ selectedIdsCount, executeBulkDelete }) => {
  return (
    <div
      className="modal fade"
      id="deleteFormsModal"
      tabIndex="-1"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-body text-center p-4 pt-5">
            <div
              className="rounded-circle bg-danger bg-opacity-10 d-flex justify-content-center align-items-center mx-auto mb-3"
              style={{ width: "80px", height: "80px" }}
            >
              <i className="bi bi-exclamation-triangle-fill text-danger fs-1"></i>
            </div>
            <h4 className="fw-bold text-dark mt-2">Delete Forms</h4>
            <p className="text-muted mb-4">
              Are you sure you want to move the{" "}
              <b>
                {selectedIdsCount} selected file
                {selectedIdsCount > 1 ? "s" : ""}
              </b>{" "}
              to the recycle bin?
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-light px-4 border"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger px-4 fw-medium shadow-sm"
                data-bs-dismiss="modal"
                onClick={executeBulkDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ConfirmTeacherPDFModal = ({ form, executeGenerateTeacherPDF }) => {
  return (
    <div
      className="modal fade"
      id="adminConfirmTeacherPDFModal"
      tabIndex="-1"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-body text-center p-4 pt-5">
            <div
              className="rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3"
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: "rgba(98, 111, 71, 0.1)",
              }}
            >
              <i
                className="bi bi-file-earmark-pdf-fill fs-1"
                style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}
              ></i>
            </div>
            <h4 className="fw-bold text-dark mt-2">Print Form</h4>
            <p className="text-muted mb-4">
              Are you sure you want to print the <b>{form?.name}</b>{" "}
              questionnaire?
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-light px-4 border"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-campusloop px-4 fw-medium shadow-sm"
                onClick={executeGenerateTeacherPDF}
              >
                Yes, Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ConfirmStudentPDFModal = ({
  respondent,
  executeGenerateStudentPDF,
}) => {
  return (
    <div
      className="modal fade"
      id="adminConfirmStudentPDFModal"
      tabIndex="-1"
      aria-hidden="true"
      data-bs-backdrop="static"
      style={{ zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-body text-center p-4 pt-5">
            <div
              className="rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3"
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: "rgba(98, 111, 71, 0.1)",
              }}
            >
              <i
                className="bi bi-file-earmark-pdf-fill s-1"
                style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}
              ></i>
            </div>
            <h4 className="fw-bold text-dark mt-2">Print Form</h4>
            <p className="text-muted mb-4">
              Print <b>{respondent?.student?.first_name}'s</b> submission?
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-light px-4 border"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-campusloop px-4 fw-medium shadow-sm"
                onClick={executeGenerateStudentPDF}
              >
                Yes, Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UnsubmitFormModal = ({ respondent, executeUnsubmit }) => {
  return (
    <div
      className="modal fade"
      id="adminUnsubmitFormModal"
      tabIndex="-1"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-body text-center p-4 pt-5">
            <div
              className="rounded-circle bg-danger bg-opacity-10 d-flex justify-content-center align-items-center mx-auto mb-3"
              style={{ width: "80px", height: "80px" }}
            >
              <i className="bi bi-arrow-counterclockwise text-danger fs-1"></i>
            </div>
            <h4 className="fw-bold text-dark mt-2">Unsubmit Form</h4>
            <p className="text-muted mb-4">
              Are you sure you want to unsubmit the form for{" "}
              <b>
                {respondent?.student?.first_name}{" "}
                {respondent?.student?.last_name}
              </b>
              ? This will delete their score and answers permanently.
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-light px-4 border"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger px-4 fw-medium shadow-sm"
                onClick={executeUnsubmit}
              >
                Yes, Unsubmit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
