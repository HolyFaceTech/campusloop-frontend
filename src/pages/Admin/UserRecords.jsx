import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import UserDrawer from "./UserDrawer";
import UserImportModal from "./UserImportModal";
import { Offcanvas, Modal } from "bootstrap";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const UserRecords = () => {
  const [users, setUsers] = useState([]);
  const [strandsList, setStrandsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");

  const currentUser = JSON.parse(
    localStorage.getItem("campusloop_user") ||
      sessionStorage.getItem("campusloop_user") ||
      "{}",
  );

  // Filters & Search
  const [filterRole, setFilterRole] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Drawer States
  const [drawerMode, setDrawerMode] = useState("");
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    birthday: "",
    email: "",
    role: "",
    status: "active",
    password: "",
    lrn: "",
    strand_id: "",
  });

  // Isang beses lang maglo-load kapag binuksan ang page
  useEffect(() => {
    fetchStrands();
    fetchUsers();
  }, []);

  // I-reset sa page 1 kapag nagbago ang anumang filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRole, filterGender, entriesPerPage]);

  // Hindi na natin ipapasa ang filter params sa API. Kukunin natin lahat para mabilis ang filter!
  const fetchUsers = async () => {
    setIsLoading(true);
    setLoadingText("Fetching users...");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/users`,
      );
      setUsers(response.data);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to fetch records.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStrands = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/strands`,
      );
      setStrandsList(response.data);
    } catch (error) {
      console.error("Failed to fetch strands for dropdown", error);
    }
  };

  const calculateAge = (birthday) => {
    if (!birthday) return "";
    const ageDifMs = Date.now() - new Date(birthday).getTime();
    return Math.abs(new Date(ageDifMs).getUTCFullYear() - 1970);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openDrawer = (mode, user = null) => {
    setDrawerMode(mode);
    if (user) {
      setFormData({ ...user, password: "" });
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        gender: "",
        birthday: "",
        email: "",
        role: "",
        status: "active",
        password: "",
        lrn: "",
        strand_id: "",
      });
    }
    const offcanvasElement = document.getElementById("userDrawer");
    const offcanvas =
      Offcanvas.getInstance(offcanvasElement) ||
      new Offcanvas(offcanvasElement);
    offcanvas.show();
  };

  const handleConfirmUpdate = (user) => {
    setUserToUpdate(user);
  };

  const proceedToUpdate = () => {
    setTimeout(() => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      if (userToUpdate) {
        openDrawer("update", userToUpdate);
      }
    }, 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingText(
      drawerMode === "create" ? "Creating Account..." : "Saving Changes...",
    );

    try {
      if (drawerMode === "create") {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/users`,
          formData,
        );
        sileo.success({
          title: "User Created",
          description: "Account created successfully.",
          ...darkToast,
        });
      } else if (drawerMode === "update") {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/users/${formData.id}`,
          formData,
        );
        sileo.success({
          title: "User Updated",
          description: "Information updated successfully.",
          ...darkToast,
        });
      }

      const offcanvasElement = document.getElementById("userDrawer");
      const offcanvas = Offcanvas.getInstance(offcanvasElement);
      if (offcanvas) offcanvas.hide();

      setTimeout(() => {
        document
          .querySelectorAll(".offcanvas-backdrop")
          .forEach((el) => el.remove());
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }, 350);

      fetchUsers();
    } catch (error) {
      sileo.error({
        title: "Action Failed",
        description:
          error.response?.data?.message || "Please check your inputs.",
        ...darkToast,
      });
      setIsLoading(false);
    }
  };

  const confirmDeleteSingle = (user) => {
    setUserToDelete(user);
    const modal = new Modal(document.getElementById("deleteConfirmModal"));
    modal.show();
  };

  const confirmBulkDelete = () => {
    setUserToDelete(null);
    const modal = new Modal(document.getElementById("deleteConfirmModal"));
    modal.show();
  };

  const executeDelete = () => {
    setTimeout(async () => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      setIsLoading(true);
      setLoadingText(
        userToDelete ? "Deleting User..." : "Deleting Selection...",
      );

      try {
        if (userToDelete) {
          await axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/users/${userToDelete.id}`,
          );
        } else {
          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/users/bulk-delete`,
            { ids: selectedIds },
          );
          setSelectedIds([]);
        }

        sileo.success({
          title: "Deletion Complete",
          description: "Moved to recycle bin.",
          ...darkToast,
        });
        fetchUsers();
      } catch (error) {
        sileo.error({
          title: "Delete Failed",
          description:
            error.response?.data?.message || "Failed to process deletion.",
          ...darkToast,
        });
        setIsLoading(false);
      }
    }, 400);
  };

  const openImportModal = () => {
    const modal = new Modal(document.getElementById("importUserModal"));
    modal.show();
  };

  // INSTANT CLIENT-SIDE FILTERING (ROLE & GENDER ISAMA NA SA SEARCH)
  const filteredUsers = users.filter((u) => {
    const matchesSearch = `${u.first_name} ${u.last_name} ${u.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === "all" || u.role === filterRole;
    const matchesGender = filterGender === "all" || u.gender === filterGender;

    return matchesSearch && matchesRole && matchesGender;
  });

  const indexOfLastUser = currentPage * entriesPerPage;
  const indexOfFirstUser = indexOfLastUser - entriesPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);

  const selectableCurrentUsers = currentUsers.filter(
    (u) => u.id !== currentUser.id,
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(selectableCurrentUsers.map((u) => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            User Management <i className="bi bi-people"></i>
          </h3>
          <p className="text-muted small mb-0">
            Manage all administrators, teachers, and student records.
          </p>
        </div>
        <div className="flex-shrink-0 d-flex gap-2">
          <button
            onClick={openImportModal}
            className="btn btn-success border shadow-sm px-3 rounded-3 d-flex align-items-center gap-2"
          >
            <i className="bi bi-file-earmark-arrow-up fs-5"></i>
            <span className="d-none d-sm-inline">Import CSV</span>
          </button>

          <button
            onClick={() => openDrawer("create")}
            className="btn btn-campusloop shadow-sm px-4 rounded-3 d-flex align-items-center gap-2"
          >
            <i className="bi bi-plus-lg fs-5"></i> New User
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
        <div className="card-body p-0">
          <div className="d-flex flex-nowrap align-items-center gap-3 overflow-x-auto custom-scrollbar p-3">
            <div className="d-flex align-items-center flex-shrink-0 text-muted small">
              Show
              <select
                className="form-select form-select-sm mx-2 toolbar-input rounded-3"
                style={{ width: "70px" }}
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              entries
            </div>

            <div
              className="input-group flex-grow-1"
              style={{ minWidth: "250px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                placeholder="Search by Name or Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="input-group" style={{ minWidth: "160px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-shield-lock"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="teacher">Teachers</option>
                <option value="student">Students</option>
              </select>
            </div>

            <div className="input-group" style={{ minWidth: "160px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-gender-ambiguous"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
              >
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <button
              className="btn btn-danger d-flex align-items-center justify-content-center gap-2 py-2 px-4 flex-shrink-0 rounded-3 shadow-sm"
              disabled={selectedIds.length === 0}
              onClick={confirmBulkDelete}
            >
              <i className="bi bi-trash3-fill"></i> Delete{" "}
              {selectedIds.length > 0 && `(${selectedIds.length})`}
            </button>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        <div className="table-responsive custom-scrollbar">
          <table
            className="table table-summer align-middle mb-0"
            style={{ minWidth: "1000px" }}
          >
            <thead>
              <tr>
                <th className="ps-4" style={{ width: "50px" }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    onChange={handleSelectAll}
                    checked={
                      selectedIds.length === selectableCurrentUsers.length &&
                      selectableCurrentUsers.length > 0
                    }
                  />
                </th>
                <th style={{ width: "60px" }}>#</th>
                <th>User Details</th>
                <th>Role & Gender</th>
                <th>Last Login</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th className="text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, index) => (
                <tr key={user.id}>
                  <td className="ps-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      disabled={user.id === currentUser.id}
                      checked={selectedIds.includes(user.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedIds((prev) =>
                          checked
                            ? [...prev, user.id]
                            : prev.filter((id) => id !== user.id),
                        );
                      }}
                    />
                  </td>
                  <td className="fw-bold text-muted">
                    {indexOfFirstUser + index + 1}
                  </td>

                  <td>
                    <div className="d-flex align-items-center py-1">
                      <div
                        className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold me-3 shadow-sm flex-shrink-0"
                        style={{
                          width: "40px",
                          height: "40px",
                          backgroundColor: "var(--secondary-color)",
                        }}
                      >
                        {user.first_name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                          <span
                            className="fw-bold text-dark text-truncate"
                            style={{ maxWidth: "250px" }}
                          >
                            {user.first_name} {user.last_name}
                          </span>
                          {user.status === "active" ? (
                            <span
                              className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1"
                              style={{ fontSize: "0.65rem" }}
                            >
                              <i
                                className="bi bi-circle-fill me-1"
                                style={{ fontSize: "0.4rem" }}
                              ></i>{" "}
                              Active
                            </span>
                          ) : (
                            <span
                              className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-1"
                              style={{ fontSize: "0.65rem" }}
                            >
                              <i
                                className="bi bi-circle-fill me-1"
                                style={{ fontSize: "0.4rem" }}
                              ></i>{" "}
                              Inactive
                            </span>
                          )}
                          {user.id === currentUser.id && (
                            <span
                              className="badge bg-secondary rounded-pill px-2 py-1"
                              style={{ fontSize: "0.65rem" }}
                            >
                              You
                            </span>
                          )}
                        </div>
                        <p
                          className="mb-0 text-muted text-truncate"
                          style={{ fontSize: "0.80rem", maxWidth: "250px" }}
                        >
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="badge border text-dark text-uppercase rounded-3 px-2 py-1"
                        style={{ backgroundColor: "var(--accent-color)" }}
                      >
                        {user.role}
                      </span>
                      <div className="vr"></div>
                      <span className="text-muted small fw-bold">
                        {user.gender.toUpperCase()}
                      </span>
                    </div>
                  </td>

                  <td className="text-muted small">
                    {user.last_login_at ? (
                      <>
                        <i className="bi bi-clock me-1"></i>{" "}
                        {formatDateTime(user.last_login_at)}
                      </>
                    ) : (
                      "Never"
                    )}
                  </td>
                  <td className="text-muted small">
                    {formatDateTime(user.created_at)}
                  </td>
                  <td className="text-muted small">
                    {formatDateTime(user.updated_at)}
                  </td>

                  <td className="text-center pe-4">
                    <button
                      onClick={() => openDrawer("view", user)}
                      className="btn btn-sm btn-light border-0 shadow-sm me-2 rounded-circle"
                      style={{ width: "35px", height: "35px" }}
                      title="View Details"
                    >
                      <i
                        className="bi bi-eye-fill"
                        style={{ color: "var(--primary-color)" }}
                      ></i>
                    </button>
                    <button
                      onClick={() => handleConfirmUpdate(user)}
                      data-bs-toggle="modal"
                      data-bs-target="#updateConfirmModal"
                      className="btn btn-sm btn-light border-0 shadow-sm me-2 rounded-circle"
                      style={{ width: "35px", height: "35px" }}
                      title="Edit User"
                    >
                      <i className="bi bi-pencil-fill text-dark"></i>
                    </button>

                    <button
                      onClick={() => confirmDeleteSingle(user)}
                      className="btn btn-sm btn-light border-0 shadow-sm rounded-circle"
                      style={{ width: "35px", height: "35px" }}
                      title="Delete User"
                      disabled={user.id === currentUser.id}
                    >
                      <i className="bi bi-trash-fill text-danger"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {currentUsers.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    {users.length === 0 ? (
                      <>
                        <i className="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
                        No records found.
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search fs-1 d-block mb-2 opacity-50"></i>
                        No matching records found.
                      </>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION CONTROLS */}
      {filteredUsers.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
          <p className="text-muted small mb-0">
            Showing {indexOfFirstUser + 1} to{" "}
            {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
            {filteredUsers.length} entries
          </p>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link page-link-summer"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                >
                  Previous
                </button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li
                  key={i}
                  className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                >
                  <button
                    className="page-link page-link-summer"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link page-link-summer"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      <UserDrawer
        drawerMode={drawerMode}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        calculateAge={calculateAge}
        strandsList={strandsList}
        userToUpdate={userToUpdate}
        proceedToUpdate={proceedToUpdate}
        executeDelete={executeDelete}
      />

      <UserImportModal
        fetchUsers={fetchUsers}
        setIsLoading={setIsLoading}
        setLoadingText={setLoadingText}
      />
    </>
  );
};

export default UserRecords;
