import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal } from "bootstrap";
import { sileo } from "sileo";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import TeacherFilesModal from "./TeacherFilesModal";

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

const TeacherFiles = () => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading Files...");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFiles();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentPage, entriesPerPage]);

  const fetchFiles = async () => {
    setIsLoading(true);
    setLoadingText("Loading your files...");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/teacher/files`,
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
      setFiles(data.data || []);
      setTotalPages(data.last_page || 1);
      setTotalRecords(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch files", error);
    } finally {
      setIsLoading(false);
    }
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

  const handleSelectFile = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    const currentPageIds = files.map((file) => file.id);
    const allSelectedOnPage = currentPageIds.every((id) =>
      selectedIds.includes(id),
    );

    if (allSelectedOnPage) {
      setSelectedIds((prev) =>
        prev.filter((id) => !currentPageIds.includes(id)),
      );
    } else {
      setSelectedIds((prev) => {
        const newIds = [...prev];
        currentPageIds.forEach((id) => {
          if (!newIds.includes(id)) newIds.push(id);
        });
        return newIds;
      });
    }
  };

  const openDownloadConfirmation = () => {
    if (selectedIds.length > 20) {
      sileo.error({
        title: "Limit Exceeded",
        description: "You can only download up to 20 files at once.",
        ...darkToast,
      });
      return;
    }
    const modalEl = document.getElementById("downloadZipModal");
    if (modalEl) Modal.getOrCreateInstance(modalEl).show();
  };

  const executeDownloadZip = async () => {
    const modalEl = document.getElementById("downloadZipModal");
    if (modalEl) Modal.getInstance(modalEl)?.hide();

    setIsLoading(true);
    setLoadingText("Compressing files into ZIP...");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/teacher/files/download-zip`,
        { file_ids: selectedIds },
        { ...getAuthHeader(), responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `My_Uploaded_Files_${new Date().getTime()}.zip`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      sileo.success({
        title: "Download Complete",
        description: "Your files have been compressed and downloaded.",
        ...darkToast,
      });
      setSelectedIds([]);
    } catch (error) {
      let errorMessage = "An error occurred while zipping the files.";
      if (error.response && error.response.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          if (json.message) errorMessage = json.message;
        } catch (e) {}
      }

      sileo.error({
        title: "Download Failed",
        description: errorMessage,
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
            My Files <i className="bi bi-folder2-open"></i>
          </h3>
          <p className="text-muted small mb-0">
            View and download all the files you uploaded to the system.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            className="btn btn-outline-primary shadow-sm px-4 py-2 rounded-3 d-flex align-items-center gap-2 fw-bold w-100 justify-content-center transition-all"
            disabled={selectedIds.length === 0}
            onClick={openDownloadConfirmation}
          >
            <i className="bi bi-download fs-5"></i> Download File
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
              className="input-group flex-grow-1"
              style={{ maxWidth: "400px", minWidth: "350px" }}
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

            <div className="d-flex align-items-center flex-shrink-0 ps-2 ps-3 gap-3">
              <div className="form-check mb-0 d-flex align-items-center">
                <input
                  className="form-check-input m-0 shadow-sm"
                  type="checkbox"
                  id="selectAll"
                  style={{
                    cursor: "pointer",
                    width: "1.2rem",
                    height: "1.2rem",
                  }}
                  onChange={handleSelectAll}
                  checked={
                    files.length > 0 &&
                    files.every((file) => selectedIds.includes(file.id))
                  }
                  disabled={files.length === 0}
                />
                <label
                  className="form-check-label fw-bold text-dark ms-2 d-flex align-items-center"
                  htmlFor="selectAll"
                  style={{ cursor: "pointer", whiteSpace: "nowrap" }}
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
              <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={file.id}>
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
                        onChange={() => handleSelectFile(file.id)}
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
                            className={`badge ${badgeStyle} bg-opacity-10 border fw-medium shadow-sm`}
                            style={{
                              fontSize: "0.60rem",
                              letterSpacing: "0.5px",
                              textTransform: "uppercase",
                              color:
                                file.source_label === "Classwork"
                                  ? "#6f42c1"
                                  : "",
                              borderColor:
                                file.source_label === "Classwork"
                                  ? "#6f42c1"
                                  : "",
                              backgroundColor:
                                file.source_label === "Classwork"
                                  ? "#e0cffc"
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
                        {new Date(file.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-12">
            <div className="p-5 bg-white rounded-4 shadow-sm text-center border premium-hover-card">
              <i
                className="bi bi-inbox text-muted d-block mb-3"
                style={{ fontSize: "3rem", opacity: 0.5 }}
              ></i>
              <h5 className="fw-bold text-dark">No Files Found.</h5>
              <p className="text-muted small mb-0">
                {searchQuery
                  ? "No matching files for your search."
                  : "You haven't uploaded or attached any files yet."}
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
            {totalRecords} files
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

      <TeacherFilesModal
        selectedIds={selectedIds}
        executeDownloadZip={executeDownloadZip}
      />
    </div>
  );
};

export default TeacherFiles;
