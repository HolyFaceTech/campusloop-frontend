import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { sileo } from "sileo";
import { Offcanvas, Modal } from "bootstrap";
import GlobalSpinner from "../../../components/Shared/GlobalSpinner";
import AdminStudentViewDrawer from "./AdminStudentViewDrawer";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const AdminTabPeople = () => {
  const { classroom } = useOutletContext();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");

  // FILTERS & SEARCH
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGender, setFilterGender] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // SERVER-SIDE PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [actionType, setActionType] = useState(""); // 'approve', 'decline', 'remove'

  // RESET PAGE TO 1 KAPAG MAY NAGBAGONG FILTER O SEARCH
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterGender, filterStatus, entriesPerPage]);

  // SERVER-SIDE DEBOUNCE EFFECT
  useEffect(() => {
    if (classroom && classroom.id) {
      const delayDebounceFn = setTimeout(() => {
        fetchStudents();
      }, 500); // 500ms delay para sa debounce

      return () => clearTimeout(delayDebounceFn);
    }
  }, [
    classroom?.id,
    searchQuery,
    filterGender,
    filterStatus,
    currentPage,
    entriesPerPage,
  ]);

  const fetchStudents = async () => {
    setIsLoading(true);
    setLoadingText("Fetching students...");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/classrooms/${classroom.id}/students`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
          params: {
            search: searchQuery,
            gender: filterGender,
            status: filterStatus,
            page: currentPage,
            entries: entriesPerPage,
          },
        },
      );

      // Saluhin ang array mula sa backend pagination object
      setStudents(res.data.data || []);
      setTotalPages(res.data.last_page || 1);
      setTotalRecords(res.data.total || 0);
      setSelectedIds([]); // Reset selection tuwing naglo-load ng bagong page
    } catch (error) {
      console.error("Error fetching students", error);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openViewDrawer = (student) => {
    setSelectedStudent(student);
    const bsOffcanvas = new Offcanvas(
      document.getElementById("adminStudentViewDrawer"),
    );
    bsOffcanvas.show();
  };

  const confirmAction = (action) => {
    setActionType(action);
    const modal = new Modal(document.getElementById("adminActionConfirmModal"));
    modal.show();
  };

  const executeAction = async () => {
    setIsLoading(true);
    setLoadingText("Processing request...");
    try {
      if (actionType === "approve") {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/admin/classrooms/${classroom.id}/students/approve`,
          { student_ids: selectedIds },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
            },
          },
        );
        sileo.success({
          title: "Enrolled",
          description: "Students successfully approved.",
          ...darkToast,
        });
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/admin/classrooms/${classroom.id}/students/remove`,
          { student_ids: selectedIds },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
            },
          },
        );
        sileo.success({
          title: "Success",
          description: `Selected students ${actionType === "decline" ? "declined" : "removed"}.`,
          ...darkToast,
        });
      }
      fetchStudents();
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: "Action could not be completed.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(students.map((s) => s.id));
    else setSelectedIds([]);
  };

  // CHECKERS PARA SA BUTTONS (Disabled kung walang tamang selected)
  const hasPendingSelected = selectedIds.some(
    (id) => students.find((s) => s.id === id)?.pivot?.status === "pending",
  );
  const hasApprovedSelected = selectedIds.some(
    (id) => students.find((s) => s.id === id)?.pivot?.status === "approved",
  );

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
        <div className="card-body p-0">
          <div className="d-flex flex-nowrap align-items-center gap-3 overflow-x-auto custom-scrollbar p-3">
            {/* ENTRIES PER PAGE DROPDOWN */}
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
              style={{ minWidth: "200px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                placeholder="Search Name, Email, or LRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="input-group" style={{ minWidth: "150px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-gender-ambiguous"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
              >
                <option value="all">All Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="input-group" style={{ minWidth: "150px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-funnel"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="approved">Enrolled</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* ACTION BUTTONS */}
            <div className="d-flex gap-2 flex-shrink-0">
              <button
                className="btn btn-success text-dark  d-flex align-items-center justify-content-center gap-2 py-2 px-3 rounded-3 shadow-sm"
                disabled={!hasPendingSelected}
                onClick={() => confirmAction("approve")}
              >
                <i className="bi bi-person-check-fill"></i> Enroll
              </button>

              <button
                className="btn btn-warning text-dark d-flex align-items-center justify-content-center gap-2 py-2 px-3 rounded-3 shadow-sm"
                disabled={!hasPendingSelected}
                onClick={() => confirmAction("decline")}
              >
                <i className="bi bi-person-x-fill"></i> Decline
              </button>

              <button
                className="btn btn-danger d-flex align-items-center justify-content-center gap-2 py-2 px-3 rounded-3 shadow-sm"
                disabled={!hasApprovedSelected}
                onClick={() => confirmAction("remove")}
              >
                <i className="bi bi-trash-fill"></i> Remove
              </button>
            </div>
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
                      selectedIds.length === students.length &&
                      students.length > 0
                    }
                  />
                </th>
                <th style={{ width: "60px" }}>#</th>
                <th>Student Details</th>
                <th>LRN</th>
                <th>Strand</th>
                <th>Gender</th>
                <th>Status</th>
                <th className="text-center pe-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-5 text-muted bg-white"
                  >
                    <div
                      className="spinner-border spinner-border-sm text-primary me-2"
                      role="status"
                    ></div>
                    Loading students...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-4 bg-light border-bottom-0">
                    <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
                      <i
                        className="bi bi-inbox text-muted d-block mb-3"
                        style={{ fontSize: "3rem", opacity: 0.5 }}
                      ></i>
                      <h5 className="fw-bold text-dark">No records found.</h5>
                      <p className="text-muted small mb-0">
                        {searchQuery ||
                        filterGender !== "all" ||
                        filterStatus !== "all"
                          ? "No matching students for your search or filters."
                          : "There are no students in this classroom yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((student, index) => (
                  <tr
                    key={student.id}
                    className={
                      selectedIds.includes(student.id) ? "table-active-row" : ""
                    }
                  >
                    <td className="ps-4">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedIds.includes(student.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedIds((prev) =>
                            checked
                              ? [...prev, student.id]
                              : prev.filter((id) => id !== student.id),
                          );
                        }}
                      />
                    </td>
                    <td className="fw-bold text-muted">
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
                          {student.first_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                            <span
                              className="fw-bold text-dark text-truncate"
                              style={{ maxWidth: "250px" }}
                            >
                              {student.first_name} {student.last_name}
                            </span>
                          </div>
                          <p
                            className="mb-0 text-muted text-truncate"
                            style={{ fontSize: "0.80rem", maxWidth: "250px" }}
                          >
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className="fw-bold font-monospace tracking-wide text-dark"
                        style={{ fontSize: "0.90rem" }}
                      >
                        {student.lrn || "N/A"}
                      </span>
                    </td>

                    <td>
                      <span
                        className="badge border text-dark text-uppercase rounded-3 px-2 py-1"
                        style={{ backgroundColor: "var(--accent-color)" }}
                      >
                        {student.strand?.name || "N/A"}
                      </span>
                    </td>

                    <td>
                      <span className="text-muted small fw-bold">
                        {student.gender || "N/A"}
                      </span>
                    </td>

                    <td>
                      {student.pivot?.status === "approved" ? (
                        <span
                          className="badge bg-success bg-opacity-10 text-success rounded-3 px-2 py-1 shadow-sm"
                          style={{ fontSize: "0.65rem" }}
                        >
                          <i
                            className="bi bi-circle-fill me-1"
                            style={{ fontSize: "0.4rem" }}
                          ></i>{" "}
                          Enrolled
                        </span>
                      ) : (
                        <span
                          className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-2 py-1 shadow-sm"
                          style={{ fontSize: "0.65rem" }}
                        >
                          <i
                            className="bi bi-circle-fill me-1"
                            style={{ fontSize: "0.4rem" }}
                          ></i>{" "}
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="text-center pe-4">
                      <button
                        onClick={() => openViewDrawer(student)}
                        className="btn btn-sm btn-light border-0 shadow-sm rounded-circle d-inline-flex justify-content-center align-items-center"
                        style={{ width: "35px", height: "35px" }}
                        title="View Profile"
                      >
                        <i
                          className="bi bi-eye-fill"
                          style={{
                            color: "var(--primary-color)",
                            fontSize: "0.9rem",
                          }}
                        ></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION FOOTER */}
      {!isLoading && totalRecords > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
          <p className="text-muted small mb-0">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
            {totalRecords} entries
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

      {/* MODALS AND DRAWERS */}
      <AdminStudentViewDrawer
        student={selectedStudent}
        actionType={actionType}
        selectedIdsCount={selectedIds.length}
        executeAction={executeAction}
      />
    </>
  );
};

export default AdminTabPeople;
