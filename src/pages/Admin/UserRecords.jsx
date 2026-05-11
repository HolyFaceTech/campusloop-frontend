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
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

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

  // Isang beses lang maglo-load kapag binuksan ang page para sa Strands
  useEffect(() => {
    fetchStrands();
  }, []);

  // DEBOUNCE EFFECT PARA HINDI MA-SPAM ANG SERVER
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500); // Maghihintay ng 500ms bago i-call ang API

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filterRole, filterGender, currentPage, entriesPerPage]);

  // Hindi na ipapasa ang filter params sa API. Kukunin lahat para mabilis ang filter!
  const fetchUsers = async () => {
    setIsLoading(true);
    setLoadingText("Loading users...");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/users`,
        {
          params: {
            role: filterRole,
            gender: filterGender,
            search: searchQuery, // Ipapasa na ang search text sa backend
            page: currentPage, // Ipapasa ang page number
            entries: entriesPerPage, // Limit per page
          },
        },
      );
      // Laravel Pagination format (response.data.data ang mismong array ng users)
      setUsers(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
      setTotalRecords(response.data.total || 0);
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

    // Linisin ang data bago ipadala sa Laravel
    const payload = { ...formData };

    // Kung walang nilagay na password, tanggalin sa payload para Laravel ang mag-generate
    if (!payload.password || payload.password.trim() === "") {
      delete payload.password;
      delete payload.password_confirmation;
    }

    // Kung hindi student ang role, siguraduhing null ang LRN at Strand para iwas error
    if (payload.role !== "student") {
      payload.lrn = null;
      payload.strand_id = null;
    }

    try {
      if (drawerMode === "create") {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/users`,
          payload, // Dito ipapasa ang malinis na payload
        );
        sileo.success({
          title: "User Created",
          description: "Account created successfully.",
          ...darkToast,
        });
      } else if (drawerMode === "update") {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/users/${payload.id}`,
          payload,
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
        // Ipapakita na ang mismong specific error galing sa Laravel para hindi manghula!
        description:
          error.response?.data?.message || "Please check your inputs.",
        ...darkToast,
      });
      setIsLoading(false);
    }
  };

  // Unified Confirmation functions
  const confirmDelete = (user) => {
    setUserToDelete(user); // Set the specific user to delete
    const modal = new Modal(document.getElementById("deleteConfirmModal"));
    modal.show();
  };

  const confirmBulkDelete = () => {
    setUserToDelete(null); // I-clear ang userToDelete para alam ng modal na BULK ang gagawin
    const modal = new Modal(document.getElementById("deleteConfirmModal"));
    modal.show();
  };

  // Unified Execution Function (Handles both Single at Bulk)
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
          // SINGLE DELETE LOGIC
          await axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/users/${userToDelete.id}`,
          );
        } else {
          // BULK DELETE LOGIC
          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/users/bulk-delete`,
            { ids: selectedIds },
          );
          setSelectedIds([]);
        }

        sileo.success({
          title: "Deleted",
          description: userToDelete
            ? "User moved to recycle bin."
            : "Selected users moved to recycle bin.",
          ...darkToast,
        });

        setCurrentPage(1);
        fetchUsers();
      } catch (error) {
        sileo.error({
          title: "Failed",
          description: "Could not process deletion.",
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

  // Selectable users para sa checkbox (Current Page View Only)
  const selectableCurrentUsers = users.filter((u) => u.id !== currentUser.id);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(selectableCurrentUsers.map((u) => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (e, id) => {
    if (e.target.checked) setSelectedIds([...selectedIds, id]);
    else setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
  };

  // SMART PAGINATION HELPER
  const renderPageNumbers = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, "...", totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        pages = [
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        ];
      }
    }

    return pages.map((page, index) => (
      <li
        key={index}
        className={`page-item ${currentPage === page ? "active" : ""} ${page === "..." ? "disabled" : ""}`}
      >
        <button
          className={`page-link ${page === "..." ? "border-0 bg-transparent text-muted" : "page-link-summer"}`}
          onClick={() => page !== "..." && setCurrentPage(page)}
          style={page === "..." ? { cursor: "default" } : {}}
        >
          {page}
        </button>
      </li>
    ));
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
            className="btn btn-outline-dark border-dark shadow-sm px-3 rounded-3 d-flex align-items-center gap-2"
          >
            <i className="bi bi-file-earmark-arrow-up fs-5"></i>
            <span className="d-none d-sm-inline">Import CSV</span>
          </button>

          <button
            onClick={() => openDrawer("create")}
            className="btn btn-campusloop fw-medium shadow-sm px-3 rounded-3 d-flex align-items-center gap-2"
          >
            <i className="bi bi-plus-lg fs-5"></i>{" "}
            <span className="d-none d-sm-inline">New User</span>
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
              style={{ minWidth: "400px" }}
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

            <div className="input-group" style={{ minWidth: "200px" }}>
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

            <div className="input-group" style={{ minWidth: "200px" }}>
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
              <i className="bi bi-trash-fill"></i> Delete
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
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td className="ps-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      disabled={user.id === currentUser.id}
                      checked={selectedIds.includes(user.id)}
                      onChange={(e) => handleSelectOne(e, user.id)}
                    />
                  </td>
                  <td className="fw-bold text-muted">
                    {/* Dynamic Row Numbering */}
                    {(currentPage - 1) * entriesPerPage + index + 1}
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
                              className="badge bg-success bg-opacity-10 text-success fw-medium rounded-3 px-2 py-1"
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
                              className="badge bg-danger bg-opacity-10 text-danger fw-medium rounded-3 px-2 py-1"
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
                              className="badge bg-secondary rounded-3 px-2 py-1"
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
                        className="badge border text-dark fw-medium text-uppercase rounded-3 px-2 py-1"
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

                  <td className="text-muted small text-nowrap">
                    {user.last_login_at ? (
                      <>
                        <i className="bi bi-clock me-1"></i>{" "}
                        {formatDateTime(user.last_login_at)}
                      </>
                    ) : (
                      "Never"
                    )}
                  </td>
                  <td className="text-muted small text-nowrap">
                    {formatDateTime(user.created_at)}
                  </td>
                  <td className="text-muted small text-nowrap">
                    {formatDateTime(user.updated_at)}
                  </td>

                  <td className="text-center pe-4 text-nowrap">
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
                      onClick={() => confirmDelete(user)}
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
              {users.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="8" className="p-4 bg-light border-bottom-0">
                    <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
                      <i
                        className="bi bi-inbox text-muted d-block mb-3"
                        style={{ fontSize: "3rem", opacity: 0.5 }}
                      ></i>
                      <h5 className="fw-bold text-dark">No records found.</h5>
                      <p className="text-muted small mb-0">
                        {searchQuery
                          ? "No matching users for your search."
                          : "Click the 'New User' button to get started."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION CONTROLS */}
      {totalRecords > 0 && (
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-2 mb-4 gap-3 px-2">
          <p className="text-muted small mb-0">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
            {totalRecords} users
          </p>
          <nav>
            <ul className="pagination pagination-sm mb-0 flex-wrap justify-content-end">
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

              {renderPageNumbers()}

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
        userToDelete={userToDelete}
        selectedIdsCount={selectedIds.length}
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
