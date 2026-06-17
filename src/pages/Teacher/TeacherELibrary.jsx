import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import { Modal } from "bootstrap";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import ELibraryModal from "./ELibraryModal";
import ELibraryContentModal from "./ELibraryContentModal";
import { resolveFileUrl, resolveStoragePath } from '../../utils/fileUrl';

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const getAuthHeader = () => {
  const token =
    localStorage.getItem("campusloop_token") ||
    sessionStorage.getItem("campusloop_token");
  return {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  };
};

const TeacherELibrary = () => {
  const [libraries, setLibraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading E-Library...");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [modalMode, setModalMode] = useState("create");
  const [selectedLib, setSelectedLib] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  const currentUser = JSON.parse(
    localStorage.getItem("campusloop_user") ||
      sessionStorage.getItem("campusloop_user") ||
      "{}",
  );

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    files: [],
  });

  const [existingFiles, setExistingFiles] = useState([]);
  const [deletedFileIds, setDeletedFileIds] = useState([]);

  // RESET PAGE TO 1 KAPAG NAGBAGO ANG SEARCH O ENTRIES
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage]);

  // DEBOUNCE EFFECT (500ms)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLibraries();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentPage, entriesPerPage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".elibrary-card-dropdown")) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLibraries = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/e-libraries`,
        {
          ...getAuthHeader(),
          params: {
            search: searchQuery,
            page: currentPage,
            entries: entriesPerPage,
          },
        },
      );
      const data = res.data;
      setLibraries(data.data || []);
      setTotalPages(data.last_page || 1);
      setTotalRecords(data.total || 0);
    } catch (error) {
      console.error("Error fetching libraries", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((file) => {
      if (file.type !== "application/pdf") {
        sileo.error({
          title: "Invalid Format",
          description: `${file.name} is not a PDF.`,
          ...darkToast,
        });
        return false;
      }
      if (file.size > 15 * 1024 * 1024) {
        sileo.error({
          title: "File too large",
          description: `${file.name} exceeds 15MB limit.`,
          ...darkToast,
        });
        return false;
      }
      return true;
    });

    if (formData.files.length + existingFiles.length + validFiles.length > 5) {
      sileo.error({
        title: "Limit Exceeded",
        description: "You can only attach a maximum of 5 files per resource.",
        ...darkToast,
      });
      if (e.target) e.target.value = null;
      return;
    }

    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...validFiles],
    }));

    if (e.target) e.target.value = null;
  };

  const removeFile = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleConfirmUpdateClick = (item) => {
    setOpenDropdownId(null);
    setSelectedLib(item);
    const modal = new Modal(document.getElementById("editConfirmModal"));
    modal.show();
  };

  const proceedToUpdateForm = () => {
    const modalElement = document.getElementById("editConfirmModal");
    const modal = Modal.getInstance(modalElement);
    if (modal) modal.hide();

    setTimeout(() => {
      openFormModal("update", selectedLib);
    }, 400);
  };

  const openFormModal = (mode, item = null) => {
    setModalMode(mode);
    setOpenDropdownId(null);
    if (item) {
      setSelectedLib(item);
      setFormData({
        title: item.title,
        description: item.description,
        files: [],
      });
      setExistingFiles(item.files || []);
      setDeletedFileIds([]);
    } else {
      setSelectedLib(null);
      setFormData({ title: "", description: "", files: [] });
      setExistingFiles([]);
      setDeletedFileIds([]);
    }
    const modal = new Modal(document.getElementById("elibraryModal"));
    modal.show();
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();

    if (modalMode === "create" && formData.files.length === 0) {
      return sileo.error({
        title: "Missing File",
        description: "Please attach at least one PDF file.",
        ...darkToast,
      });
    }
    if (
      modalMode === "update" &&
      formData.files.length === 0 &&
      existingFiles.length === 0
    ) {
      return sileo.error({
        title: "Missing File",
        description: "A resource must contain at least one file.",
        ...darkToast,
      });
    }

    if (document.activeElement) document.activeElement.blur();

    const modalElement = document.getElementById("elibraryModal");
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }

    setTimeout(() => {
      executeSubmit();
    }, 400);
  };

  const executeSubmit = async () => {
    setIsLoading(true);
    setLoadingText(
      modalMode === "create" ? "Uploading..." : "Saving Changes...",
    );

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("description", formData.description);

    if (formData.files.length > 0) {
      formData.files.forEach((file) => {
        payload.append("files[]", file);
      });
    }

    if (modalMode === "update") {
      payload.append("_method", "PUT");
      if (deletedFileIds.length > 0) {
        deletedFileIds.forEach((id) => {
          payload.append("deleted_file_ids[]", id);
        });
      }
    }

    const authHeaders = getAuthHeader().headers;
    const submitHeaders = {
      ...authHeaders,
      "Content-Type": "multipart/form-data",
    };

    try {
      if (modalMode === "create") {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/e-libraries`,
          payload,
          { headers: submitHeaders },
        );
        sileo.success({
          title: "Uploaded",
          description: "Pending Admin Approval.",
          ...darkToast,
        });
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/e-libraries/${selectedLib.id}`,
          payload,
          { headers: submitHeaders },
        );
        sileo.success({
          title: "Updated",
          description: "Changes saved.",
          ...darkToast,
        });
      }
      fetchLibraries();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.errors?.files?.[0] ||
        "Could not process request.";
      sileo.error({
        title: "Upload Failed",
        description: errorMsg,
        ...darkToast,
      });
      setIsLoading(false);
    }
  };

  const confirmDelete = (item) => {
    setOpenDropdownId(null);
    setSelectedLib(item);
    const modal = new Modal(document.getElementById("deleteConfirmModal"));
    modal.show();
  };

  const executeDelete = async () => {
    if (document.activeElement) document.activeElement.blur();

    const modalElement = document.getElementById("deleteConfirmModal");
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }

    setTimeout(async () => {
      setIsLoading(true);
      setLoadingText("Moving to Recycle Bin...");
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/e-libraries/${selectedLib.id}`,
          getAuthHeader(),
        );
        sileo.success({
          title: "Deleted",
          description: "Item removed.",
          ...darkToast,
        });
        fetchLibraries();
      } catch (error) {
        sileo.error({
          title: "Failed",
          description: "Could not delete.",
          ...darkToast,
        });
        setIsLoading(false);
      }
    }, 400);
  };

  const openFiles = (item) => {
    setViewingItem(item);
    const modal = new Modal(document.getElementById("viewFilesModal"));
    modal.show();
  };

  const handleViewDocument = (filePath) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
    window.open(`${resolveStoragePath(filePath)}`, "_blank");
  };

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

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-3 gap-3">
        <div className="flex-grow-1">
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            E-Library <i className="bi bi-book-half"></i>
          </h3>
          <p className="text-muted small mb-0">
            Browse approved resources or upload materials to the global library.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => openFormModal("create")}
            className="btn btn-campusloop shadow-sm px-4 py-2 rounded-3 d-flex align-items-center gap-2 w-100 justify-content-center fw-medium"
          >
            <i className="bi bi-cloud-arrow-up-fill fs-5"></i> Upload Resource
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden premium-hover-card">
        <div className="card-body p-0">
          <div className="d-flex flex-nowrap align-items-center justify-content-between overflow-x-auto custom-scrollbar p-3 gap-3">
            <div className="d-flex align-items-center flex-shrink-0 text-muted small pe-2">
              Show
              <select
                className="form-select form-select-sm mx-2 toolbar-input rounded-3"
                style={{ width: "70px" }}
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={100}>100</option>
              </select>
              entries
            </div>
            <div
              className="input-group"
              style={{ maxWidth: "400px", minWidth: "350px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                placeholder="Search Title or Description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {libraries.length > 0 ? (
          libraries.map((item) => (
            <div className="col-md-6 col-xl-4" key={item.id}>
              <div className="card h-100 border-0 shadow-sm rounded-4 hover-shadow transition-all bg-white premium-hover-card">
                <div
                  className="p-4 position-relative d-flex flex-column justify-content-end"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    minHeight: "110px",
                    borderTopLeftRadius: "1rem",
                    borderTopRightRadius: "1rem",
                  }}
                >
                  <div
                    className="position-absolute rounded-circle"
                    style={{
                      width: "100px",
                      height: "100px",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      top: "-20px",
                      right: "-20px",
                      pointerEvents: "none",
                    }}
                  ></div>
                  <div
                    className="position-absolute rounded-circle"
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      bottom: "-10px",
                      left: "20%",
                      pointerEvents: "none",
                    }}
                  ></div>
                  {item.creator_id === currentUser.id && (
                    <div
                      className="dropdown elibrary-card-dropdown position-absolute top-0 end-0 mt-3 me-3"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        zIndex: 10,
                      }}
                    >
                      <button
                        className="btn btn-sm text-white rounded-circle shadow-none d-flex justify-content-center align-items-center p-0"
                        type="button"
                        onClick={() =>
                          setOpenDropdownId(
                            openDropdownId === item.id ? null : item.id,
                          )
                        }
                        style={{
                          backgroundColor: "rgba(0,0,0,0.2)",
                          width: "32px",
                          height: "32px",
                        }}
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul
                        className={`dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-1 ${openDropdownId === item.id ? "show" : ""}`}
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: "0",
                          zIndex: 1050,
                        }}
                      >
                        <li>
                          <button
                            className="dropdown-item py-2 fw-medium text-dark"
                            onClick={() => handleConfirmUpdateClick(item)}
                          >
                            <i
                              className="bi bi-pencil-square me-2"
                              style={{ color: "var(--primary-color)" }}
                            ></i>{" "}
                            Update
                          </button>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <button
                            className="dropdown-item py-2 fw-medium text-danger"
                            onClick={() => confirmDelete(item)}
                          >
                            <i className="bi bi-trash-fill me-2"></i> Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}

                  <div className="pe-4 position-relative z-1">
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
                      style={{ lineHeight: "1.6", whiteSpace: "pre-wrap" }}
                    >
                      {item.description}
                    </p>
                  </div>

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
                        {item.creator?.first_name?.charAt(0)}
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
                          {item.creator
                            ? `${item.creator.first_name} ${item.creator.last_name}`
                            : "Unknown"}
                        </span>
                      </div>
                    </div>
                    <div className="text-end flex-shrink-0">
                      {item.creator_id === currentUser.id ? (
                        <>
                          {item.status === "pending" && (
                            <span
                              className="badge bg-warning bg-opacity-10 text-warning fw-medium border border-warning px-2 py-1 shadow-sm"
                              style={{ fontSize: "0.65rem" }}
                            >
                              Pending
                            </span>
                          )}
                          {item.status === "approved" && (
                            <span
                              className="badge bg-success bg-opacity-10 text-success fw-medium border border-success px-2 py-1 shadow-sm"
                              style={{ fontSize: "0.65rem" }}
                            >
                              Approved
                            </span>
                          )}
                          {item.status === "declined" && (
                            <span
                              className="badge bg-danger bg-opacity-10 text-danger fw-medium border border-danger px-2 py-1 shadow-sm"
                              style={{ fontSize: "0.65rem" }}
                            >
                              Declined
                            </span>
                          )}
                        </>
                      ) : (
                        <span
                          className="badge bg-success bg-opacity-10 text-success border border-success px-2 py-1 shadow-sm"
                          style={{ fontSize: "0.65rem" }}
                        >
                          Public
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto d-flex gap-2">
                    <button
                      className="btn btn-campusloop fw-bold w-100 rounded-3 shadow-sm"
                      onClick={() => openFiles(item)}
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
            <div className="p-5 bg-white rounded-4 shadow-sm text-center border-0 premium-hover-card">
              <i
                className="bi bi-inbox text-muted d-block mb-3"
                style={{ fontSize: "3rem", opacity: 0.5 }}
              ></i>
              <h5 className="fw-bold text-dark">No materials found.</h5>
              <p className="text-muted small mb-0">
                {searchQuery
                  ? "No matching resources for your search."
                  : "Click the 'Upload Resource' button to get started."}
              </p>
            </div>
          </div>
        )}
      </div>

      {totalRecords > 0 && !isLoading && (
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-2 mb-4 px-2">
          <span className="text-muted small">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
            {totalRecords} materials
          </span>
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

      <ELibraryModal
        modalMode={modalMode}
        formData={formData}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        removeFile={removeFile}
        existingFiles={existingFiles}
        setExistingFiles={setExistingFiles}
        setDeletedFileIds={setDeletedFileIds}
        handleInitialSubmit={handleInitialSubmit}
        selectedLib={selectedLib}
        executeDelete={executeDelete}
        proceedToUpdateForm={proceedToUpdateForm}
      />

      <ELibraryContentModal
        viewingItem={viewingItem}
        handleViewDocument={handleViewDocument}
        currentUser={currentUser}
      />
    </>
  );
};

export default TeacherELibrary;
