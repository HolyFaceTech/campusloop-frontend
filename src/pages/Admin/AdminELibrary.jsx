import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import { Modal } from "bootstrap";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import AdminELibraryModals from "./AdminELibraryModals";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const AdminELibrary = () => {
  const [libraries, setLibraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Fetching E-Library...");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination States (Default 12 para sakto sa grid 3-columns or 2-columns)
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [viewItem, setViewItem] = useState(null);
  const [declineFeedback, setDeclineFeedback] = useState("");

  // Reset page kapag nagbago ang filters
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortOrder, entriesPerPage]);

  // SERVER-SIDE DEBOUNCE EFFECT (500ms delay)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLibraries();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, statusFilter, sortOrder, currentPage, entriesPerPage]);

  const fetchLibraries = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/e-libraries`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
          params: {
            search: searchQuery,
            status: statusFilter,
            sort: sortOrder,
            page: currentPage,
            entries: entriesPerPage,
          },
        },
      );
      setLibraries(res.data.data || []);
      setTotalPages(res.data.last_page || 1);
      setTotalRecords(res.data.total || 0);
      setSelectedIds([]); // Clear selection pagka-lipat ng page
    } catch (error) {
      sileo.error({
        title: "Fetch Error",
        description: "Failed to load E-Library materials.",
        ...darkToast,
      });
      setLibraries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === libraries.length && libraries.length > 0) {
      setSelectedIds([]); // Unselect all
    } else {
      setSelectedIds(libraries.map((lib) => lib.id)); // Select all current page
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleViewContent = (item) => {
    setViewItem(item);
    const modal = new Modal(document.getElementById("viewELibraryModal"));
    modal.show();
  };

  const triggerApprove = () =>
    new Modal(document.getElementById("confirmApproveModal")).show();

  const triggerDecline = () => {
    setDeclineFeedback("");
    new Modal(document.getElementById("confirmDeclineModal")).show();
  };

  const proceedToFeedback = () => {
    Modal.getInstance(document.getElementById("confirmDeclineModal")).hide();
    setTimeout(() => {
      new Modal(document.getElementById("feedbackDeclineModal")).show();
    }, 400);
  };

  const triggerDelete = () =>
    new Modal(document.getElementById("confirmDeleteModal")).show();

  const executeApprove = async () => {
    setIsLoading(true);
    setLoadingText("Approving materials...");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/admin/e-libraries/approve`,
        { ids: selectedIds },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      sileo.success({
        title: "Approved",
        description: "Materials are now visible to students.",
        ...darkToast,
      });
      setSelectedIds([]);
      fetchLibraries();
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to approve materials.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeDecline = async (e) => {
    e.preventDefault();
    Modal.getInstance(document.getElementById("feedbackDeclineModal")).hide();
    setIsLoading(true);
    setLoadingText("Declining materials...");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/admin/e-libraries/decline`,
        {
          ids: selectedIds,
          feedback: declineFeedback,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      sileo.success({
        title: "Declined",
        description: "Materials returned to teachers.",
        ...darkToast,
      });
      setSelectedIds([]);
      fetchLibraries();
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to decline materials.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeDelete = async () => {
    setIsLoading(true);
    setLoadingText("Deleting materials...");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/admin/e-libraries/delete`,
        { ids: selectedIds },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      sileo.success({
        title: "Deleted",
        description: "Materials moved to Recycle Bin.",
        ...darkToast,
      });
      setSelectedIds([]);
      fetchLibraries();
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to delete materials.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-4 gap-3">
        <div className="flex-grow-1">
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            E-Library Management <i className="bi bi-journal-album"></i>
          </h3>
          <p className="text-muted small mb-0">
            Review, approve, or decline learning materials uploaded by teachers.
          </p>
        </div>
      </div>

      {/* CONTROLS & BULK ACTIONS TRAY */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
        <div className="card-body p-0">
          <div className="d-flex flex-nowrap align-items-center gap-3 overflow-x-auto custom-scrollbar p-3">
            {/* SELECT ALL & COUNT */}
            <div className="col-auto pe-xl-2 ps-1">
              <div className="d-flex align-items-center">
                <input
                  type="checkbox"
                  className="form-check-input shadow-sm border-secondary m-0"
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                  onChange={toggleSelectAll}
                  checked={
                    selectedIds.length === libraries.length &&
                    libraries.length > 0
                  }
                />
                <label
                  className="text-dark fw-bold mb-0 ms-2"
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={toggleSelectAll}
                >
                  Select All
                  <span className="badge bg-primary rounded-3 ms-2">
                    {selectedIds.length}
                  </span>
                </label>
              </div>
            </div>

            {/* SEARCH BAR */}
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
                placeholder="Search Title or Creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* FILTER DROPDOWNS */}
            <div
              className="input-group flex-shrink-0"
              style={{ width: "300px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-funnel"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
              </select>
            </div>

            <div
              className="input-group flex-shrink-0"
              style={{ width: "200px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-sort-down"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {/* BUTTON COLORS */}
            <div className="col-12 col-xl-auto ms-xl-auto d-flex flex-wrap gap-2">
              <button
                className="btn btn-success fw-bold rounded-3 shadow-sm d-flex align-items-center"
                disabled={selectedIds.length === 0}
                onClick={triggerApprove}
              >
                <i className="bi bi-check-circle-fill me-xl-2"></i>{" "}
                <span className="d-none d-xl-inline">Approve</span>
              </button>
              <button
                className="btn btn-warning text-dark fw-bold rounded-3 shadow-sm d-flex align-items-center"
                disabled={selectedIds.length === 0}
                onClick={triggerDecline}
              >
                <i className="bi bi-x-circle-fill me-xl-2"></i>{" "}
                <span className="d-none d-xl-inline">Decline</span>
              </button>
              <button
                className="btn btn-danger text-white fw-bold rounded-3 shadow-sm d-flex align-items-center"
                disabled={selectedIds.length === 0}
                onClick={triggerDelete}
              >
                <i className="bi bi-trash-fill me-xl-2"></i>{" "}
                <span className="d-none d-xl-inline">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GRID CARDS */}
      <div className="row g-4 mb-4">
        {libraries.length > 0 ? (
          libraries.map((item) => (
            <div className="col-md-6 col-xl-4" key={item.id}>
              <div
                className={`card h-100 border-0 shadow-sm rounded-4 hover-shadow transition-all bg-white premium-hover-card ${selectedIds.includes(item.id) ? "border border-success border-opacity-50" : ""}`}
              >
                {/* Header Background */}
                <div
                  className="p-4 position-relative d-flex flex-column justify-content-center"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    minHeight: "110px",
                    borderTopLeftRadius: "1rem",
                    borderTopRightRadius: "1rem",
                  }}
                >
                  <div className="position-absolute top-50 translate-middle-y end-0 me-4 z-3">
                    <input
                      type="checkbox"
                      className="form-check-input shadow-sm border-white"
                      style={{
                        width: "22px",
                        height: "22px",
                        cursor: "pointer",
                      }}
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelection(item.id)}
                    />
                  </div>

                  <div
                    className="pe-5 position-relative z-1"
                    style={{ pointerEvents: "none" }}
                  >
                    <h4
                      className="fw-bold text-white mb-1 text-truncate"
                      title={item.title}
                    >
                      {item.title}
                    </h4>
                    <span className="badge bg-white text-dark bg-opacity-25 px-2 py-1 fw-semibold shadow-sm">
                      <i className="bi bi-book-half me-1"></i> Library Resource
                    </span>
                  </div>
                </div>

                <div className="card-body p-4 d-flex flex-column position-relative">
                  {/* OVERLAPPING ICON */}
                  <div
                    className="position-absolute shadow-sm rounded-circle d-flex justify-content-center align-items-center fw-bold text-white"
                    style={{
                      width: "45px",
                      height: "45px",
                      top: "-22px",
                      right: "24px",
                      backgroundColor: "var(--secondary-color)",
                      border: "3px solid white",
                      fontSize: "1.2rem",
                    }}
                  >
                    <i className="bi bi-journal-text"></i>
                  </div>

                  {/* DESCRIPTION AREA */}
                  <div className="mb-3 mt-1 flex-grow-1">
                    <span
                      className="d-block text-muted mb-1 text-uppercase"
                      style={{
                        fontSize: "0.65rem",
                        letterSpacing: "1px",
                        fontWeight: "700",
                      }}
                    >
                      Description
                    </span>
                    <p
                      className="text-dark small fw-medium mb-0 text-clamp-3"
                      style={{ lineHeight: "1.6" }}
                    >
                      {item.description}
                    </p>
                  </div>

                  {/* UPLOADER & STATUS BADGE */}
                  <div className="bg-light rounded-4 p-3 mb-3 border border-light-subtle d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center overflow-hidden pe-2">
                      <div
                        className="rounded-circle text-white shadow-sm d-flex justify-content-center align-items-center me-2 flex-shrink-0 fw-bold"
                        style={{
                          width: "35px",
                          height: "35px",
                          backgroundColor: "var(--primary-color)",
                        }}
                      >
                        {item.creator?.first_name?.charAt(0) || "?"}
                      </div>
                      <div className="overflow-hidden">
                        <span
                          className="d-block text-muted fw-bold mb-0 text-uppercase"
                          style={{
                            fontSize: "0.60rem",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Uploaded By
                        </span>
                        <span
                          className="d-block text-dark fw-bold text-truncate"
                          style={{ fontSize: "0.80rem" }}
                        >
                          {item.creator?.first_name} {item.creator?.last_name}
                        </span>
                      </div>
                    </div>
                    <div className="text-end flex-shrink-0">
                      {item.status === "pending" && (
                        <span
                          className="badge bg-warning bg-opacity-25 text-warning border border-warning px-2 py-1 shadow-sm"
                          style={{ fontSize: "0.65rem" }}
                        >
                          Pending
                        </span>
                      )}
                      {item.status === "approved" && (
                        <span
                          className="badge bg-success bg-opacity-10 text-success border border-success px-2 py-1 shadow-sm"
                          style={{ fontSize: "0.65rem" }}
                        >
                          Approved
                        </span>
                      )}
                      {item.status === "declined" && (
                        <span
                          className="badge bg-danger bg-opacity-10 text-danger border border-danger px-2 py-1 shadow-sm"
                          style={{ fontSize: "0.65rem" }}
                        >
                          Declined
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto d-flex gap-2">
                    <button
                      className="btn btn-campusloop fw-bold w-100 rounded-3 shadow-sm"
                      onClick={() => handleViewContent(item)}
                    >
                      <i className="bi bi-folder2-open me-2"></i> Open Content
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
              <i
                className="bi bi-inbox text-muted d-block mb-3"
                style={{ fontSize: "3rem", opacity: 0.5 }}
              ></i>
              <h5 className="fw-bold text-dark">No records found.</h5>
              <p className="text-muted small mb-0">
                {searchQuery || statusFilter !== "all"
                  ? "No matching records found."
                  : "No materials have been uploaded yet."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {totalRecords > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-2 mb-4 px-2">
          <p className="text-muted small mb-0">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
            {totalRecords} materials
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

      <AdminELibraryModals
        viewItem={viewItem}
        selectedCount={selectedIds.length}
        executeApprove={executeApprove}
        proceedToFeedback={proceedToFeedback}
        executeDecline={executeDecline}
        executeDelete={executeDelete}
        declineFeedback={declineFeedback}
        setDeclineFeedback={setDeclineFeedback}
      />
    </>
  );
};

export default AdminELibrary;
