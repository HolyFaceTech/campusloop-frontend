import React from "react";

const RespondentsModal = ({ selectedItem, executeDelete }) => {
  return (
    <>
      <div
        className="modal fade"
        id="respondentsModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-bottom py-3 bg-light">
              <div>
                <h5 className="modal-title fw-bold text-dark mb-0">
                  <i className="bi bi-people-fill me-2 text-primary"></i>{" "}
                  Respondents
                </h5>
                <span className="text-muted small">
                  {selectedItem?.title || "Classwork"}
                </span>
              </div>
              <button
                type="button"
                className="btn-close shadow-none"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body p-0 custom-scrollbar">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-white sticky-top shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-muted small fw-bold">#</th>
                    <th className="py-3 text-muted small fw-bold">
                      Name / LRN
                    </th>
                    <th className="py-3 text-muted small fw-bold">
                      Files / Forms
                    </th>
                    <th className="py-3 text-muted small fw-bold">Status</th>
                    <th className="py-3 text-muted small fw-bold">
                      Date / Time
                    </th>
                    <th className="py-3 text-muted small fw-bold">Grade</th>
                    <th className="pe-4 py-3 text-muted small fw-bold text-end">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* PLACEHOLDER ROW FOR STUDENT SUBMISSION */}
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
                      <span className="fw-medium">No submissions yet.</span>
                    </td>
                  </tr>
                </tbody>
              </table>
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
            <div className="modal-body text-center p-4">
              <div
                className="rounded-circle bg-danger bg-opacity-10 d-flex justify-content-center align-items-center mx-auto mb-3"
                style={{ width: "80px", height: "80px" }}
              >
                <i
                  className="bi bi-exclamation-triangle-fill text-danger"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
              <h4 className="fw-bold text-dark mt-3">Delete Classwork</h4>
              <p className="text-muted mb-4">
                Are you sure you want to move <b>{selectedItem?.title}</b> to
                the recycle bin?
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
                  onClick={executeDelete}
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

export default RespondentsModal;
