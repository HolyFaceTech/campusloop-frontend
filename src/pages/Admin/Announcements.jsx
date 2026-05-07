import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import AnnouncementFormModal from "./AnnouncementFormModal";
import AnnouncementViewModal from "./AnnouncementViewModal";
import { Modal } from "bootstrap";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortDate, setSortDate] = useState("newest");
  const [filterAttachment, setFilterAttachment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [selectedIds, setSelectedIds] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [modalMode, setModalMode] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const currentUser = JSON.parse(
    localStorage.getItem("campusloop_user") ||
      sessionStorage.getItem("campusloop_user") ||
      "{}",
  );

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    link: "",
    publish_from: "",
    valid_until: "",
  });

  const [includeLink, setIncludeLink] = useState(false);
  const [includeFiles, setIncludeFiles] = useState(false);
  const [newFiles, setNewFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [deletedFileIds, setDeletedFileIds] = useState([]);

  // Reset to page 1 kapag nagbago ang mga filters
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortDate, filterAttachment, filterStatus, entriesPerPage]);

  // DEBOUNCE EFFECT Mag-fe-fetch sa server kapag nag-stop na mag-type
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAnnouncements(true);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [
    searchQuery,
    filterAttachment,
    filterStatus,
    sortDate,
    currentPage,
    entriesPerPage,
  ]);

  const fetchAnnouncements = async (showSpinner = true) => {
    if (showSpinner) {
      setIsLoading(true);
      setLoadingText("Fetching announcements...");
    }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/announcements`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
          params: {
            search: searchQuery,
            filterAttachment: filterAttachment,
            filterStatus: filterStatus,
            sortDate: sortDate,
            page: currentPage,
            entries: entriesPerPage,
          },
        },
      );
      // Galing na sa server ang naka-paginate na data
      setAnnouncements(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
      setTotalRecords(response.data.total || 0);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to load records.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const toDatetimeLocal = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  const resetFormStates = () => {
    setFormData({
      title: "",
      content: "",
      link: "",
      publish_from: "",
      valid_until: "",
    });
    setNewFiles([]);
    setExistingFiles([]);
    setDeletedFileIds([]);
    setIncludeLink(false);
    setIncludeFiles(false);
  };

  const openViewModal = (item) => {
    setSelectedItem(item);

    // Maliit na delay para iwas Bootstrap Backdrop error
    setTimeout(() => {
      const modalElement = document.getElementById("announcementViewModal");
      if (modalElement) {
        const modal = Modal.getOrCreateInstance(modalElement);
        modal.show();
      }
    }, 100);
  };

  const openCreateModal = () => {
    resetFormStates();
    setModalMode("create");
    setSelectedItem(null);
    const modal = new Modal(document.getElementById("announcementFormModal"));
    modal.show();
  };

  const promptUpdateConfirm = (item) => {
    setSelectedItem(item);
    const modal = new Modal(document.getElementById("updatePreConfirmModal"));
    modal.show();
  };

  const proceedToUpdateForm = () => {
    setTimeout(() => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      resetFormStates();
      setModalMode("update");
      setFormData({
        title: selectedItem.title,
        content: selectedItem.content,
        link: selectedItem.link || "",
        publish_from: toDatetimeLocal(selectedItem.publish_from),
        valid_until: toDatetimeLocal(selectedItem.valid_until),
      });
      setIncludeLink(!!selectedItem.link);
      if (selectedItem.files && selectedItem.files.length > 0) {
        setIncludeFiles(true);
        setExistingFiles(selectedItem.files);
      }
      const formModal = new Modal(
        document.getElementById("announcementFormModal"),
      );
      formModal.show();
    }, 400);
  };

  const triggerSaveConfirmation = () => {
    if (
      !formData.title ||
      !formData.content ||
      !formData.publish_from ||
      !formData.valid_until
    ) {
      sileo.error({
        title: "Incomplete",
        description: "Please fill in all required fields including dates.",
        ...darkToast,
      });
      return;
    }
    if (new Date(formData.valid_until) <= new Date(formData.publish_from)) {
      sileo.error({
        title: "Invalid Date",
        description: "Valid Until date must be later than Publish From date.",
        ...darkToast,
      });
      return;
    }
    if (includeLink && !formData.link) {
      sileo.error({
        title: "Incomplete",
        description: "Please provide a valid URL.",
        ...darkToast,
      });
      return;
    }

    // I-deretso na natin sa pag-submit
    if (modalMode === "update") {
      executeSubmit();
      return;
    }

    // Ipakita pa rin ang confirmation modal
    const formModal = Modal.getInstance(
      document.getElementById("announcementFormModal"),
    );
    if (formModal) formModal.hide();

    setTimeout(() => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      const confirmModalId = "createConfirmModal";
      const confirmModal = Modal.getOrCreateInstance(
        document.getElementById(confirmModalId),
      );
      confirmModal.show();
    }, 400);
  };

  const executeSubmit = async () => {
    // Siguraduhing isasara ang form modal kung direct save on update
    const formModal = Modal.getInstance(
      document.getElementById("announcementFormModal"),
    );
    if (formModal) formModal.hide();

    document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";

    setIsLoading(true);
    setLoadingText(modalMode === "create" ? "Posting..." : "Saving Changes...");

    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    data.append("publish_from", formData.publish_from);
    data.append("valid_until", formData.valid_until);

    if (includeLink && formData.link) data.append("link", formData.link);
    else data.append("link", "");

    deletedFileIds.forEach((id) => data.append("deleted_file_ids[]", id));

    if (includeFiles) {
      newFiles.forEach((file) => data.append("files[]", file));
    } else {
      existingFiles.forEach((f) => data.append("deleted_file_ids[]", f.id));
    }

    try {
      if (modalMode === "create") {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/announcements`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
            },
          },
        );
        sileo.success({
          title: "Posted",
          description: "Announcement is now scheduled.",
          ...darkToast,
        });
      } else {
        data.append("_method", "PUT");
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/announcements/${selectedItem.id}`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
            },
          },
        );
        sileo.success({
          title: "Updated",
          description: "Changes have been saved.",
          ...darkToast,
        });
      }
      fetchAnnouncements();
      setSelectedIds([]);
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: error.response?.data?.message || "Check inputs.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (item = null) => {
    setSelectedItem(item);
    const modal = new Modal(document.getElementById("deleteConfirmModal"));
    modal.show();
  };

  const executeDelete = () => {
    setTimeout(async () => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      setIsLoading(true);
      setLoadingText(
        selectedItem ? "Moving to Recycle Bin..." : "Deleting Selection...",
      );
      try {
        if (selectedItem) {
          await axios.delete(
            `${import.meta.env.VITE_API_BASE_URL}/announcements/${selectedItem.id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
              },
            },
          );
        } else {
          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/announcements/bulk-delete`,
            { ids: selectedIds },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
              },
            },
          );
          setSelectedIds([]);
        }
        sileo.success({
          title: "Deleted",
          description: "Moved to recycle bin.",
          ...darkToast,
        });
        setCurrentPage(1); // Balik page 1 kapag nakadelete
        fetchAnnouncements();
      } catch (error) {
        sileo.error({
          title: "Failed",
          description: "Could not delete.",
          ...darkToast,
        });
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  const formatDisplayDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(announcements.map((a) => a.id));
    else setSelectedIds([]);
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const currentViewItem = selectedItem
    ? announcements.find((a) => a.id === selectedItem.id) || selectedItem
    : null;

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            Announcement Management <i className="bi bi-megaphone ms-1"></i>
          </h3>
          <p className="text-muted small mb-0">
            Create and manage global announcements for students and teachers.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn btn-campusloop shadow-sm px-4 rounded-3 d-flex align-items-center gap-2"
        >
          <i className="bi bi-plus-lg fs-5"></i> New Announcement
        </button>
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
                placeholder="Search Announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="input-group" style={{ minWidth: "200px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-calendar-event"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={sortDate}
                onChange={(e) => setSortDate(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <div className="input-group" style={{ minWidth: "200px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-paperclip"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterAttachment}
                onChange={(e) => setFilterAttachment(e.target.value)}
              >
                <option value="all">All Attachments</option>
                <option value="files">With Files</option>
                <option value="links">With Links</option>
                <option value="both">Files & Links</option>
                <option value="none">Text Only</option>
              </select>
            </div>

            <div className="input-group" style={{ minWidth: "200px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-funnel"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Published">Published</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <button
              className="btn btn-danger d-flex align-items-center justify-content-center gap-2 py-2 px-4 flex-shrink-0 rounded-3 shadow-sm"
              disabled={selectedIds.length === 0}
              onClick={() => confirmDelete(null)}
            >
              <i className="bi bi-trash-fill"></i> Delete{" "}
              {selectedIds.length > 0 && `(${selectedIds.length})`}
            </button>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        <div className="table-responsive custom-scrollbar">
          <table
            className="table table-summer align-middle mb-0"
            style={{ minWidth: "1200px" }}
          >
            <thead>
              <tr>
                <th className="ps-4" style={{ width: "50px" }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    onChange={handleSelectAll}
                    checked={
                      selectedIds.length === announcements.length &&
                      announcements.length > 0
                    }
                  />
                </th>
                <th style={{ width: "60px" }}>#</th>
                <th style={{ width: "450px" }}>Announcement Details</th>
                <th style={{ width: "250px" }}>Schedule & Expiration</th>
                <th>Attachments</th>
                <th>Status</th>
                <th>Created At</th>
                <th className="text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((item, index) => (
                <tr key={item.id} className="table-row-hover">
                  <td className="ps-4 py-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleSelect(item.id)}
                    />
                  </td>
                  <td className="fw-bold text-muted py-3">
                    {(currentPage - 1) * entriesPerPage + index + 1}
                  </td>
                  <td className="py-3">
                    <div style={{ maxWidth: "450px" }}>
                      <h6
                        className="mb-1 fw-bold text-dark text-truncate"
                        style={{ fontSize: "0.95rem" }}
                      >
                        {item.title}
                      </h6>
                      <p
                        className="mb-0 text-muted text-truncate"
                        style={{ fontSize: "0.80rem" }}
                      >
                        {item.content}
                      </p>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="d-flex flex-column gap-1">
                      <div
                        className="d-flex align-items-center text-dark"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <div
                          className="rounded-circle bg-success bg-opacity-10 d-flex justify-content-center align-items-center me-2"
                          style={{ width: "24px", height: "24px" }}
                        >
                          <i
                            className="bi bi-calendar-check text-success"
                            style={{ fontSize: "0.75rem" }}
                          ></i>
                        </div>
                        <span className="fw-medium">
                          {formatDisplayDateTime(item.publish_from)}
                        </span>
                      </div>
                      <div
                        className="d-flex align-items-center text-muted"
                        style={{ fontSize: "0.80rem" }}
                      >
                        <div
                          className="rounded-circle bg-danger bg-opacity-10 d-flex justify-content-center align-items-center me-2"
                          style={{ width: "24px", height: "24px" }}
                        >
                          <i
                            className="bi bi-calendar-x text-danger"
                            style={{ fontSize: "0.75rem" }}
                          ></i>
                        </div>
                        <span>{formatDisplayDateTime(item.valid_until)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="d-flex flex-wrap gap-2">
                      {item.link && (
                        <span className="badge bg-primary text-light shadow-sm fw-medium rounded-3 px-2 py-1">
                          <i className="bi bi-link-45deg me-1"></i> Link
                        </span>
                      )}
                      {item.files && item.files.length > 0 && (
                        <span className="badge bg-secondary text-light shadow-sm fw-medium rounded-3 px-2 py-1">
                          <i className="bi bi-file-earmark-text me-1"></i>{" "}
                          {item.files.length} Files
                        </span>
                      )}
                      {!item.link &&
                        (!item.files || item.files.length === 0) && (
                          <span className="text-muted small">None</span>
                        )}
                    </div>
                  </td>
                  <td className="py-3">
                    {item.status === "Pending" && (
                      <span className="badge bg-warning bg-opacity-10 text-warning rounded-3 px-2 py-1 border border-warning-subtle">
                        Pending
                      </span>
                    )}
                    {item.status === "Published" && (
                      <span className="badge bg-success bg-opacity-10 text-success rounded-3 px-2 py-1 border border-success-subtle">
                        Published
                      </span>
                    )}
                    {item.status === "Done" && (
                      <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-3 px-2 py-1 border border-secondary-subtle">
                        Done
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="text-muted" style={{ fontSize: "0.80rem" }}>
                      <i className="bi bi-clock me-1"></i>{" "}
                      {formatDisplayDateTime(item.created_at)}
                    </div>
                  </td>
                  <td className="text-center pe-4 py-3">
                    <button
                      onClick={() => openViewModal(item)}
                      className="btn btn-sm btn-light border-0 shadow-sm me-2 rounded-circle"
                      style={{ width: "35px", height: "35px" }}
                      title="View"
                    >
                      <i
                        className="bi bi-eye-fill"
                        style={{ color: "var(--primary-color)" }}
                      ></i>
                    </button>
                    <button
                      onClick={() => promptUpdateConfirm(item)}
                      className="btn btn-sm btn-light border-0 shadow-sm me-2 rounded-circle"
                      style={{ width: "35px", height: "35px" }}
                      title="Update"
                    >
                      <i className="bi bi-pencil-fill text-dark"></i>
                    </button>
                    <button
                      onClick={() => confirmDelete(item)}
                      className="btn btn-sm btn-light border-0 shadow-sm rounded-circle"
                      style={{ width: "35px", height: "35px" }}
                      title="Delete"
                    >
                      <i className="bi bi-trash-fill text-danger"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {announcements.length === 0 && !isLoading && (
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
                          ? "No matching announcements for your search."
                          : "Click the 'New Announcement' button to get started."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalRecords > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
          <p className="text-muted small mb-0">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
            {totalRecords} announcements
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

      <AnnouncementFormModal
        modalMode={modalMode}
        formData={formData}
        handleInputChange={handleInputChange}
        includeLink={includeLink}
        setIncludeLink={setIncludeLink}
        includeFiles={includeFiles}
        setIncludeFiles={setIncludeFiles}
        newFiles={newFiles}
        setNewFiles={setNewFiles}
        existingFiles={existingFiles}
        setExistingFiles={setExistingFiles}
        setDeletedFileIds={setDeletedFileIds}
        triggerSaveConfirmation={triggerSaveConfirmation}
        executeSubmit={executeSubmit}
        proceedToUpdateForm={proceedToUpdateForm}
        executeDelete={executeDelete}
        selectedItem={selectedItem}
        selectedIds={selectedIds}
      />

      <AnnouncementViewModal
        announcement={currentViewItem}
        currentUser={currentUser}
        fetchAnnouncements={fetchAnnouncements}
      />
    </>
  );
};

export default Announcements;
