import React, { useState } from "react";

const UserDrawer = ({
  drawerMode,
  formData,
  handleInputChange,
  handleSubmit,
  calculateAge,
  strandsList,
  userToUpdate,
  proceedToUpdate,
  executeDelete,
  userToDelete,
  selectedIdsCount,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Eye Icon Renderer
  const renderEyeIcon = (isVisible) =>
    isVisible ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755l-.809-.805zm-4.643-2.617L7.14 7.045a2.001 2.001 0 0 1-1.185-1.185l-1.576-1.576A4.983 4.983 0 0 0 3.5 8c0 1.368.611 2.585 1.564 3.42l-.845.845A6.974 6.974 0 0 1 1.5 8s3-5.5 8-5.5c.34 0 .673.04 1 .116l-.806.806c-.06-.007-.128-.012-.194-.012zM8 12.5a5.944 5.944 0 0 1-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
      </svg>
    );

  return (
    <>
      <div
        className="offcanvas offcanvas-end shadow-lg border-0"
        tabIndex="-1"
        id="userDrawer"
        style={{ width: "450px" }}
      >
        <div
          className="offcanvas-header border-bottom py-3"
          style={{ backgroundColor: "var(--accent-color)" }}
        >
          <h5
            className="offcanvas-title fw-bold d-flex align-items-center"
            style={{ color: "var(--primary-color)" }}
          >
            {drawerMode === "create" ? (
              <>
                <i className="bi bi-person-plus-fill me-2 fs-4"></i> Create New
                User
              </>
            ) : drawerMode === "update" ? (
              <>
                <i className="bi bi-pencil-square me-2 fs-4"></i> Update User
                Info.
              </>
            ) : (
              <>
                <i className="bi bi-person-badge-fill me-2 fs-4"></i> User
                Details
              </>
            )}
          </h5>
          <button
            type="button"
            className="btn-close shadow-none"
            data-bs-dismiss="offcanvas"
          ></button>
        </div>

        <div className="offcanvas-body custom-scrollbar p-4 bg-white">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* Personal Information Section */}
              <div className="col-12">
                <h6
                  className="fw-bold text-muted mb-0 border-bottom pb-2"
                  style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                >
                  PERSONAL INFORMATION
                </h6>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-person me-1 text-muted"></i> First Name
                </label>
                <input
                  type="text"
                  className="form-control bg-light toolbar-input"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  disabled={drawerMode === "view"}
                  required
                  autoFocus
                  placeholder="e.g. Juan"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-person me-1 text-muted"></i> Last Name
                </label>
                <input
                  type="text"
                  className="form-control bg-light toolbar-input"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  disabled={drawerMode === "view"}
                  required
                  placeholder="e.g. Dela Cruz"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-gender-ambiguous me-1 text-muted"></i>{" "}
                  Gender
                </label>
                <select
                  className="form-select bg-light toolbar-input"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={drawerMode === "view"}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-calendar-date me-1 text-muted"></i>{" "}
                  Birthday & Age
                </label>
                <div className="input-group">
                  <input
                    type="date"
                    className="form-control bg-light toolbar-input border-end-0"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    disabled={drawerMode === "view"}
                    required
                  />

                  <div className="input-group-text bg-white border-top border-bottom border-0 px-1">
                    <div
                      className="vr text-muted"
                      style={{ width: "2px", height: "20px" }}
                    ></div>
                  </div>

                  <span
                    className="input-group-text bg-white toolbar-input border-start-0 text-primary fw-bold px-2"
                    style={{ minWidth: "55px", justifyContent: "center" }}
                  >
                    {calculateAge(formData.birthday) || "-"}
                  </span>
                </div>
              </div>

              {/* Account Settings Section */}
              <div className="col-12 mt-4">
                <h6
                  className="fw-bold text-muted mb-0 border-bottom pb-2"
                  style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                >
                  ACCOUNT SETTINGS
                </h6>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-shield-lock me-1 text-muted"></i> Role
                </label>
                <select
                  className="form-select bg-light toolbar-input"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={drawerMode === "view"}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-toggle-on me-1 text-muted"></i> Status
                </label>
                <select
                  className="form-select bg-light toolbar-input"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={drawerMode === "view"}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold text-dark">
                  <i className="bi bi-envelope-at me-1 text-muted"></i> Email
                  Address
                </label>
                <input
                  type="email"
                  className="form-control bg-light toolbar-input"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={drawerMode === "view"}
                  required
                  placeholder="e.g. jdelacruz@holyface.edu.ph"
                />
              </div>

              {drawerMode !== "view" && (
                <div className="col-12">
                  <label className="form-label small fw-bold text-dark">
                    <i className="bi bi-key me-1 text-muted"></i> Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control bg-light toolbar-input border-end-0"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={
                        drawerMode === "create"
                          ? "Leave blank to auto-generate"
                          : "Leave blank to keep current"
                      }
                      pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}"
                      title="Must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters."
                    />
                    <span
                      className="input-group-text bg-light cursor-pointer text-muted border-start-0"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: "pointer" }}
                    >
                      {renderEyeIcon(showPassword)}
                    </span>
                  </div>
                  <small className="text-muted" style={{ fontSize: "0.70rem" }}>
                    Min. 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1
                    special symbol.
                  </small>
                </div>
              )}

              {/* Academic Details (Student Only) */}
              {formData.role === "student" && (
                <>
                  <div className="col-12 mt-4">
                    <h6
                      className="fw-bold text-muted mb-0 border-bottom pb-2"
                      style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                    >
                      ACADEMIC DETAILS
                    </h6>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">
                      <i className="bi bi-123 me-1 text-muted"></i> LRN
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\d{12}"
                      maxLength="12"
                      minLength="12"
                      title="LRN must be exactly 12 digits."
                      className="form-control bg-light toolbar-input"
                      name="lrn"
                      value={formData.lrn}
                      onChange={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                        handleInputChange(e);
                      }}
                      disabled={drawerMode === "view"}
                      required
                      placeholder="e.g. 109876543210"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">
                      <i className="bi bi-journal-text me-1 text-muted"></i>{" "}
                      Strand
                    </label>
                    <select
                      className="form-select bg-light toolbar-input"
                      name="strand_id"
                      value={formData.strand_id}
                      onChange={handleInputChange}
                      disabled={drawerMode === "view"}
                      required
                    >
                      <option value="">Select Strand</option>
                      {strandsList && strandsList.length > 0 ? (
                        strandsList.map((strand) => (
                          <option key={strand.id} value={strand.id}>
                            {strand.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No strands available
                        </option>
                      )}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="mt-5 pt-3 border-top">
              {drawerMode === "view" ? (
                <button
                  type="button"
                  className="btn btn-campusloop w-100 rounded-3 shadow-sm"
                  data-bs-dismiss="offcanvas"
                >
                  <i className="bi bi-check-circle me-2"></i> Okay, Got it!
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-campusloop w-100 rounded-3 shadow-sm"
                >
                  {drawerMode === "create" ? (
                    <>
                      <i className="bi bi-person-check-fill me-2"></i> Create
                      Account
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle-fill me-2"></i> Save
                      Changes
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Update */}
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
              <h4 className="fw-bold text-dark">Edit User Information</h4>
              <p className="text-muted mb-0">
                You are about to edit the records of{" "}
                <b>
                  {userToUpdate?.first_name} {userToUpdate?.last_name}
                </b>
                . Do you want to proceed to the update form?
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
                onClick={proceedToUpdate}
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Deletion */}
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
              <h4 className="fw-bold text-dark">Confirm Deletion</h4>
              <p className="text-muted mb-0">
                Are you sure you want to move{" "}
                {userToDelete ? (
                  <b>
                    "{userToDelete.first_name} {userToDelete.last_name}"
                  </b>
                ) : (
                  <b>{selectedIdsCount} selected users</b>
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

export default UserDrawer;
