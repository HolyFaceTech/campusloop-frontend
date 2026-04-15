import React from "react";

const RecycleBinModals = ({ actionType, selectedCount, executeAction }) => {
  return (
    <div
      className="modal fade"
      id="actionConfirmModal"
      tabIndex="-1"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header border-0 pb-0 justify-content-center mt-4">
            <div
              className={`rounded-circle d-flex justify-content-center align-items-center ${
                actionType === "restore" ? "bg-success" : "bg-danger"
              } bg-opacity-10`}
              style={{ width: "80px", height: "80px" }}
            >
              <i
                className={`bi ${
                  actionType === "restore"
                    ? "bi-arrow-counterclockwise text-success"
                    : "bi-exclamation-triangle-fill text-danger"
                }`}
                style={{ fontSize: "2.5rem" }}
              ></i>
            </div>
          </div>
          <div className="modal-body text-center p-4">
            <h4 className="fw-bold text-dark">
              {actionType === "restore"
                ? "Confirm Restoration"
                : "Confirm Permanent Deletion"}
            </h4>
            <p className="text-muted mb-0">
              Are you sure you want to{" "}
              {actionType === "restore" ? "restore" : "permanently delete"}{" "}
              <b>{selectedCount} selected item(s)</b>?
              <br />
              {actionType === "restore"
                ? "They will be returned to their active status."
                : "WARNING: This action cannot be undone."}
            </p>
          </div>
          <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
            <button
              type="button"
              className="btn btn-light px-4 fw-medium shadow-sm rounded-3"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button
              type="button"
              className={`btn px-4 fw-medium shadow-sm rounded-3 ${
                actionType === "restore" ? "btn-success" : "btn-danger"
              }`}
              data-bs-dismiss="modal"
              onClick={executeAction}
            >
              Yes, {actionType === "restore" ? "Restore" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecycleBinModals;
