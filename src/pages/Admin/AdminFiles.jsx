import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal } from "bootstrap";
import { sileo } from "sileo";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import {
  AdminDownloadZipModal,
  AdminDeleteFilesModal,
} from "./AdminFilesModal";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const AdminFiles = () => {
  const [view, setView] = useState("folders");
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading...");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 12;
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // RESET PAGE TO 1 PAG MAY NAGBAGONG FILTER
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, sortOrder]);

  // DEBOUNCE EFFECT PARA SA "FOLDERS" VIEW
  useEffect(() => {
    if (view === "folders") {
      const delayDebounceFn = setTimeout(() => {
        fetchFolders();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, currentPage, view]);

  // DEBOUNCE EFFECT
  useEffect(() => {
    if (view === "files" && currentFolder) {
      const delayDebounceFn = setTimeout(() => {
        fetchUserFiles(currentFolder.id);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, typeFilter, sortOrder, currentPage, view, currentFolder]);

  const fetchFolders = async () => {
    setIsLoading(true);
    setLoadingText("Loading directories...");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/folders`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
          params: {
            search: searchQuery,
            page: currentPage,
            entries: entriesPerPage,
          },
        },
      );
      const data = res.data;
      setFolders(data.data || []);
      setTotalPages(data.last_page || 1);
      setTotalRecords(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch folders", error);
      setFolders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserFiles = async (userId) => {
    setIsLoading(true);
    setLoadingText("Loading files...");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/folders/${userId}/files`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
          params: {
            search: searchQuery,
            type: typeFilter,
            sort: sortOrder,
            page: currentPage,
            entries: entriesPerPage,
          },
        },
      );
      const data = res.data;
      setFiles(data.data || []);
      setTotalPages(data.last_page || 1);
      setTotalRecords(data.total || 0);
      setSelectedIds([]);
    } catch (error) {
      console.error("Failed to fetch files", error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openFolder = (folder) => {
    setCurrentFolder(folder);
    setSearchQuery("");
    setTypeFilter("all");
    setSortOrder("newest");
    setSelectedIds([]);
    setCurrentPage(1);
    setView("files");
  };

  const backToFolders = () => {
    setView("folders");
    setCurrentFolder(null);
    setSearchQuery("");
    setTypeFilter("all");
    setSortOrder("newest");
    setSelectedIds([]);
    setCurrentPage(1);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0 || !bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileDetails = (extension) => {
    const ext = extension?.toLowerCase();
    if (["pdf"].includes(ext))
      return {
        icon: "bi-file-earmark-pdf-fill",
        color: "#dc3545",
        bg: "#f8d7da",
      };
    if (["doc", "docx"].includes(ext))
      return {
        icon: "bi-file-earmark-word-fill",
        color: "#0d6efd",
        bg: "#cfe2ff",
      };
    if (["xls", "xlsx", "csv"].includes(ext))
      return {
        icon: "bi-file-earmark-excel-fill",
        color: "#198754",
        bg: "#d1e7dd",
      };
    if (["ppt", "pptx"].includes(ext))
      return {
        icon: "bi-file-earmark-ppt-fill",
        color: "#fd7e14",
        bg: "#ffe5d0",
      };
    if (["png", "jpg", "jpeg", "gif"].includes(ext))
      return {
        icon: "bi-file-earmark-image-fill",
        color: "#6f42c1",
        bg: "#e0cffc",
      };
    if (["mp4", "avi", "mov"].includes(ext))
      return {
        icon: "bi-file-earmark-play-fill",
        color: "#0dcaf0",
        bg: "#cff4fc",
      };

    return { icon: "bi-file-earmark-fill", color: "#6c757d", bg: "#e2e3e5" };
  };

  const getBadgeStyle = (source) => {
    switch (source) {
      case "E-Library":
        return "text-primary border-primary bg-primary";
      case "Classwork":
        return "text-purple border-purple bg-purple";
      case "Submission":
        return "text-warning border-warning bg-warning";
      case "Announcement":
        return "text-success border-success bg-success";
      default:
        return "text-secondary border-secondary bg-secondary";
    }
  };

  const handleViewDocument = (filePath) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
    const formattedPath =
      filePath.startsWith("/storage") || filePath.startsWith("storage")
        ? `/${filePath.replace(/^\/?storage\//, "storage/")}`
        : `/storage/${filePath}`;
    window.open(`${baseUrl}${formattedPath}`, "_blank");
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === files.length && files.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(files.map((file) => file.id));
    }
  };

  const openModal = (modalId) => {
    const modalEl = document.getElementById(modalId);
    if (modalEl) Modal.getOrCreateInstance(modalEl).show();
  };

  const executeDownloadZip = async () => {
    Modal.getInstance(document.getElementById("downloadZipModal"))?.hide();
    setIsLoading(true);
    setLoadingText("Compressing files into ZIP...");
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/admin/files/download-zip`,
        { file_ids: selectedIds },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Exported_Files_${new Date().getTime()}.zip`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      sileo.success({
        title: "Success",
        description: "Files compressed and downloaded.",
        ...darkToast,
      });
      setSelectedIds([]);
    } catch (error) {
      let errorMsg = "Error compressing files.";

      if (error.response && error.response.data instanceof Blob) {
        try {
          const textData = await error.response.data.text();
          const jsonData = JSON.parse(textData);
          errorMsg = jsonData.message || errorMsg;
        } catch (e) {
          console.error("Failed to parse blob error message.");
        }
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }

      sileo.error({
        title: "Failed",
        description: errorMsg,
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeBulkDelete = async () => {
    Modal.getInstance(document.getElementById("deleteFilesModal"))?.hide();
    setIsLoading(true);
    setLoadingText("Moving to Recycle Bin...");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/admin/files/bulk-delete`,
        { file_ids: selectedIds },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      sileo.success({
        title: "Deleted",
        description: "Files moved to Recycle Bin.",
        ...darkToast,
      });
      setSelectedIds([]);
      fetchUserFiles(currentFolder.id);
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: "Could not delete files.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
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
    <div className="container-fluid px-0">
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-4 gap-3">
        <div>
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            File Management <i className="bi bi-folder-symlink"></i>
          </h3>
          {view === "folders" ? (
            <p className="text-muted small mb-0">
              Browse automatically generated user directories.
            </p>
          ) : (
            <p className="text-muted small mb-0">
              <span
                onClick={backToFolders}
                className="fw-bold me-1"
                style={{
                  cursor: "pointer",
                  color: "var(--primary-color)",
                  textDecoration: "underline",
                }}
              >
                Folders
              </span>
              / Viewing files of {currentFolder?.name}. Max 50 files per
              download.
            </p>
          )}
        </div>
      </div>

      {view === "folders" && (
        <div className="row mb-4">
          <div className="col-12 col-md-6 col-xl-4">
            <div className="input-group shadow-sm rounded-3 overflow-hidden">
              <span className="input-group-text bg-white border-end-0 text-muted px-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0 toolbar-input"
                placeholder="Search directory name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* FOLDERS */}
      {view === "folders" && (
        <>
          <div className="row g-4 mb-4">
            {folders.length > 0 ? (
              folders.map((folder) => (
                <div className="col-12 col-md-6 col-xl-4" key={folder.id}>
                  <div
                    className="card h-100 border-0 shadow-sm rounded-4 hover-shadow transition-all bg-white premium-hover-card"
                    onClick={() => openFolder(folder)}
                  >
                    <div
                      className="p-4 position-relative d-flex flex-column justify-content-center"
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
                        }}
                      ></div>
                      <div
                        className="pe-5 position-relative z-1"
                        style={{ pointerEvents: "none" }}
                      >
                        <h4
                          className="fw-bold text-white mb-1 text-truncate"
                          title={folder.name}
                        >
                          {folder.name}
                        </h4>
                        <span className="badge bg-white text-dark bg-opacity-25 px-2 py-1 fw-semibold shadow-sm text-uppercase shadow-sm">
                          <i
                            className={`bi ${folder.role === "teacher" ? "bi-person-video3" : folder.role === "system" ? "bi-hdd-network" : "bi-person-badge"} me-1`}
                          ></i>{" "}
                          {folder.role}
                        </span>
                      </div>
                    </div>

                    <div
                      className="card-body p-4 d-flex flex-column position-relative"
                      style={{ cursor: "pointer" }}
                    >
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
                        <i
                          className={
                            folder.role === "system"
                              ? "bi bi-megaphone-fill"
                              : "bi bi-folder-fill"
                          }
                        ></i>
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
                          {folder.role === "system"
                            ? "System Directory"
                            : "User Directory"}
                        </span>
                        <p
                          className="text-dark small fw-medium mb-0 text-clamp-3"
                          style={{ lineHeight: "1.6" }}
                        >
                          {folder.role === "system"
                            ? "This folder contains all files attached to announcements across the entire system."
                            : `This folder contains all the files, submissions, and attachments uploaded by ${folder.name}.`}
                        </p>
                      </div>

                      <div className="bg-light rounded-4 p-3 mb-3 border border-light-subtle d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center overflow-hidden pe-2">
                          <div
                            className="rounded-circle bg-primary text-white shadow-sm d-flex justify-content-center align-items-center me-2 flex-shrink-0 fw-bold"
                            style={{
                              width: "35px",
                              height: "35px",
                            }}
                          >
                            <i className="bi bi-files"></i>
                          </div>
                          <div className="overflow-hidden">
                            <span
                              className="d-block text-muted fw-bold mb-0 text-uppercase"
                              style={{
                                fontSize: "0.60rem",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Storage Status
                            </span>
                            <span
                              className="d-block text-dark fw-bold text-truncate"
                              style={{ fontSize: "0.80rem" }}
                            >
                              Total Uploads
                            </span>
                          </div>
                        </div>
                        <div className="text-end flex-shrink-0">
                          <span
                            className="badge bg-primary bg-opacity-10 text-primary fw-medium border border-primary px-3 py-2 shadow-sm"
                            style={{ fontSize: "0.85rem" }}
                          >
                            {folder.file_count} File
                            {folder.file_count !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto d-flex gap-2">
                        <button className="btn btn-campusloop fw-bold w-100 rounded-3 shadow-sm">
                          <i className="bi bi-folder2-open me-2"></i> Open
                          Directory
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="p-5 bg-white rounded-4 shadow-sm text-center border premium-hover-card">
                  <i
                    className="bi bi-inbox text-muted d-block mb-3"
                    style={{ fontSize: "3rem", opacity: 0.5 }}
                  ></i>
                  <h5 className="fw-bold text-dark">No directories found.</h5>
                  <p className="text-muted small mb-0">
                    {searchQuery
                      ? "No matching directories for your search."
                      : "No users created yet."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {!isLoading && totalRecords > 0 && (
            <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 mb-5 gap-3 px-2">
              <p className="text-muted small mb-0">
                Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
                {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
                {totalRecords} folders
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
        </>
      )}

      {/* FILES */}
      {view === "files" && (
        <>
          <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden premium-hover-card">
            <div className="card-body p-0">
              <div className="d-flex flex-nowrap align-items-center gap-3 overflow-x-auto custom-scrollbar p-3">
                <div className="d-flex align-items-center flex-shrink-0 pe-2">
                  <div className="form-check m-0 d-flex align-items-center">
                    <input
                      type="checkbox"
                      className="form-check-input mt-0 shadow-sm"
                      id="selectAllFiles"
                      checked={
                        selectedIds.length === files.length && files.length > 0
                      }
                      onChange={toggleSelectAll}
                      style={{
                        cursor: "pointer",
                        width: "1.2rem",
                        height: "1.2rem",
                      }}
                    />
                    <label
                      className="form-check-label small fw-bold text-dark ms-2 d-flex align-items-center pe-2"
                      htmlFor="selectAllFiles"
                      style={{ cursor: "pointer", userSelect: "none" }}
                    >
                      Select All
                      <span
                        className="badge bg-primary fw-medium rounded-3 ms-2 shadow-sm"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {selectedIds.length}
                      </span>
                    </label>
                  </div>
                </div>

                <div
                  className="input-group flex-shrink-0"
                  style={{ maxWidth: "360px" }}
                >
                  <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                    placeholder="Search file name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div
                  className="input-group flex-shrink-0"
                  style={{ width: "360px" }}
                >
                  <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                    <i className="bi bi-funnel"></i>
                  </span>
                  <select
                    className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">All File Types</option>
                    {currentFolder?.role === "system" ? (
                      <>
                        <option value="Announcement">Announcement</option>
                        <option value="Other">Other</option>
                      </>
                    ) : currentFolder?.role === "student" ? (
                      <>
                        <option value="Submission">Submission</option>
                        <option value="Other">Other</option>
                      </>
                    ) : (
                      <>
                        <option value="Classwork">Classwork</option>
                        <option value="E-Library">E-Library</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                </div>

                <div
                  className="input-group flex-shrink-0"
                  style={{ width: "360px" }}
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

                <div className="d-flex gap-2 flex-shrink-0 ms-auto ps-2">
                  <button
                    className="btn btn-outline-primary fw-medium rounded-3 shadow-sm d-flex align-items-center gap-2 py-2 px-3"
                    disabled={selectedIds.length === 0}
                    onClick={() => openModal("downloadZipModal")}
                  >
                    <i className="bi bi-download"></i> Download
                  </button>
                  <button
                    className="btn btn-danger text-white fw-medium rounded-3 shadow-sm d-flex align-items-center gap-2 py-2 px-3"
                    disabled={selectedIds.length === 0}
                    onClick={() => openModal("deleteFilesModal")}
                  >
                    <i className="bi bi-trash-fill"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            {files.length > 0 ? (
              files.map((file) => {
                const details = getFileDetails(file.file_extension);
                const isSelected = selectedIds.includes(file.id);
                const badgeStyle = getBadgeStyle(file.source_label);

                return (
                  <div
                    className="col-12 col-md-6 col-lg-4 col-xl-3"
                    key={file.id}
                  >
                    <div
                      className={`card border-0 shadow-sm rounded-4 h-100 bg-white transition-all ${isSelected ? "border-primary" : "hover-shadow"} premium-hover-card`}
                      style={{
                        border: isSelected
                          ? "2px solid var(--primary-color)"
                          : "2px solid transparent",
                      }}
                    >
                      <div className="card-body p-3 d-flex flex-column position-relative">
                        <div
                          className="position-absolute top-0 end-0 p-3"
                          style={{ zIndex: 10 }}
                        >
                          <input
                            type="checkbox"
                            className="form-check-input"
                            style={{
                              width: "1.3rem",
                              height: "1.3rem",
                              cursor: "pointer",
                            }}
                            checked={isSelected}
                            onChange={() => toggleSelection(file.id)}
                          />
                        </div>

                        <div
                          className="d-flex align-items-center mb-3 mt-2 pe-4"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleViewDocument(file.path)}
                          title="Click to view file"
                        >
                          <div
                            className="rounded-3 d-flex align-items-center justify-content-center me-3 flex-shrink-0 transition-all"
                            style={{
                              width: "60px",
                              height: "60px",
                              backgroundColor: details.bg,
                              color: details.color,
                            }}
                          >
                            <i
                              className={`bi ${details.icon}`}
                              style={{ fontSize: "2rem" }}
                            ></i>
                          </div>
                          <div className="overflow-hidden w-100">
                            <p
                              className="fw-bold text-dark text-truncate mb-1"
                              style={{ fontSize: "1rem" }}
                            >
                              {file.name}
                            </p>
                            <div className="d-flex align-items-center justify-content-between mt-1">
                              <span
                                className="text-muted small fw-medium font-monospace text-uppercase"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {file.file_extension}
                              </span>
                              <span
                                className={`badge ${badgeStyle} bg-opacity-10 fw-medium border shadow-sm d-none d-sm-inline`}
                                style={{
                                  fontSize: "0.60rem",
                                  letterSpacing: "0.5px",
                                  textTransform: "uppercase",
                                  color:
                                    file.source_label === "Classwork"
                                      ? "#6f42c1"
                                      : file.source_label === "Submission"
                                        ? "#fd7e14"
                                        : "",
                                  borderColor:
                                    file.source_label === "Classwork"
                                      ? "#6f42c1"
                                      : file.source_label === "Submission"
                                        ? "#fd7e14"
                                        : "",
                                  backgroundColor:
                                    file.source_label === "Classwork"
                                      ? "#e0cffc"
                                      : file.source_label === "Submission"
                                        ? "#ffe5d0"
                                        : "",
                                }}
                              >
                                {file.source_label}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                          <span className="text-muted small fw-medium">
                            {formatBytes(file.file_size)}
                          </span>
                          <span
                            className="text-muted small"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {new Date(file.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-12 mt-2">
                <div className="p-5 bg-white rounded-4 shadow-sm text-center border premium-hover-card">
                  {searchQuery || typeFilter !== "all" ? (
                    <>
                      <i
                        className="bi bi-inbox text-muted d-block mb-3"
                        style={{ fontSize: "3rem", opacity: 0.5 }}
                      ></i>
                      <h5 className="fw-bold text-dark">No files found.</h5>
                      <p className="text-muted small mb-0">
                        We couldn't find any files matching your search or
                        selected filter.
                      </p>
                    </>
                  ) : (
                    <>
                      <i
                        className="bi bi-inbox text-muted d-block mb-3"
                        style={{ fontSize: "3rem", opacity: 0.5 }}
                      ></i>
                      <h5 className="fw-bold text-dark">Folder is empty.</h5>
                      <p className="text-muted small mb-0">
                        {currentFolder?.role === "system"
                          ? "There are no system-generated files in this directory yet."
                          : "This user hasn't uploaded any files to this directory yet."}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {!isLoading && totalRecords > 0 && (
            <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 mb-5 gap-3 px-2">
              <p className="text-muted small mb-0">
                Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
                {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
                {totalRecords} files
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
        </>
      )}

      <AdminDownloadZipModal
        selectedIds={selectedIds}
        executeDownloadZip={executeDownloadZip}
      />
      <AdminDeleteFilesModal
        selectedIds={selectedIds}
        executeBulkDelete={executeBulkDelete}
      />
    </div>
  );
};

export default AdminFiles;
