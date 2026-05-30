import React from "react";

const AdminStreamModals = ({
  selectedCount,
  executeBulkDelete,
  executeDeleteComment,
}) => {
  return (
    <>
      <div
        className="modal fade"
        id="deleteClassworksModal"
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
                <i
                  className="bi bi-exclamation-triangle-fill text-danger"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
              <h4 className="fw-bold text-dark mt-2">Delete Classworks</h4>
              <p className="text-muted mb-4">
                Are you sure you want to move the{" "}
                <b>
                  {selectedCount} selected classwork
                  {selectedCount > 1 ? "s" : ""}
                </b>{" "}
                to the recycle bin?
              </p>
              <div className="d-flex justify-content-center gap-2">
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
                  onClick={executeBulkDelete}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="deleteCommentModal"
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
                <i
                  className="bi bi-exclamation-triangle-fill text-danger"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
              <h4 className="fw-bold text-dark mt-2">Delete Comment</h4>
              <p className="text-muted mb-4">
                Are you sure you want to delete this comment/reply?
              </p>
              <div className="d-flex justify-content-center gap-2">
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
                  onClick={executeDeleteComment}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminStreamModals;
