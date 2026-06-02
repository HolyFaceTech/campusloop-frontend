import React from "react";
import { Modal } from "bootstrap";

const StudentTakeFormModals = ({ executeSubmit }) => {
  const handleForceSubmit = (modalId) => {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      const m = Modal.getInstance(modalEl);
      if (m) m.hide();
    }
    executeSubmit();
  };

  return (
    <>
      <div
        className="modal fade"
        id="focusViolationModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-0 pb-0 justify-content-center mt-4">
              <div
                className="rounded-circle bg-danger bg-opacity-10 d-flex justify-content-center align-items-center"
                style={{ width: "80px", height: "80px" }}
              >
                <i
                  className="bi bi-shield-lock-fill text-danger"
                  style={{ fontSize: "3rem" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark mt-2">Focus Mode Violation</h4>
              <p className="text-muted mb-0">
                You have left the exam tab or lost focus on the window. As per
                security rules, your answers will now be automatically checked
                and submitted.
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0">
              <button
                type="button"
                className="btn btn-danger px-5 fw-medium shadow-sm rounded-3"
                onClick={() => handleForceSubmit("focusViolationModal")}
              >
                Okay, Got it!
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="timeUpModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-0 pb-0 justify-content-center mt-4">
              <div
                className="rounded-circle bg-warning bg-opacity-10 d-flex justify-content-center align-items-center"
                style={{ width: "80px", height: "80px" }}
              >
                <i
                  className="bi bi-alarm-fill text-warning"
                  style={{ fontSize: "3rem" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark mt-2">Time is Up!</h4>
              <p className="text-muted mb-0">
                Your allotted time has expired. The system will now
                automatically check and submit your current answers.
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0">
              <button
                type="button"
                className="btn btn-warning px-5 fw-medium shadow-sm rounded-3"
                onClick={() => handleForceSubmit("timeUpModal")}
              >
                Okay, Got it!
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="submitConfirmModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-0 pb-0 justify-content-center mt-4">
              <div
                className="rounded-circle bg-opacity-10 d-flex justify-content-center align-items-center"
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "rgba(98, 111, 71, 0.1)",
                }}
              >
                <i
                  className="bi bi-question-circle-fill"
                  style={{ fontSize: "3rem", color: "var(--primary-color)" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark mt-2">Submit Form?</h4>
              <p className="text-muted mb-0">
                Are you sure you want to submit your answers? You cannot change
                them once submitted.
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
                onClick={() => handleForceSubmit("submitConfirmModal")}
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentTakeFormModals;
