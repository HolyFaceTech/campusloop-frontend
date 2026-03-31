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

const TeacherFiles = () => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading Files...");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setIsLoading(true);
    setLoadingText("Fetching your files...");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/teacher/files`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      setFiles(res.data || []);
    } catch (error) {
      console.error("Failed to fetch files", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- HELPERS PARA SA FILE DETAILS AT ICONS ---
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
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext))
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
    if (["zip", "rar"].includes(ext))
      return {
        icon: "bi-file-earmark-zip-fill",
        color: "#6c757d",
        bg: "#e2e3e5",
      };
    return { icon: "bi-file-earmark-fill", color: "#6c757d", bg: "#e2e3e5" };
  };

  // --- HELPER PARA SA BADGE COLOR NG MODULE ---
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

  // --- VIEW FILE LOGIC ---
  const handleViewDocument = (filePath) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
    const formattedPath =
      filePath.startsWith("/storage") || filePath.startsWith("storage")
        ? `/${filePath.replace(/^\/?storage\//, "storage/")}`
        : `/storage/${filePath}`;

    window.open(`${baseUrl}${formattedPath}`, "_blank");
  };

  // --- SELECTION LOGIC PARA SA CHECKBOX ---
  const handleSelectFile = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id],
    );
  };

  // --- DOWNLOAD ZIP LOGIC ---
  const openDownloadConfirmation = () => {
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
      sileo.error({
        title: "Download Failed",
        description: "An error occurred while zipping the files.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- FILTERING ---
  const filteredFiles = (files || []).filter((f) => {
    if (!f) return false;
    const safeSearch = typeof searchQuery === "string" ? searchQuery : "";
    const safeName = typeof f.name === "string" ? f.name : "";
    return safeName.toLowerCase().includes(safeSearch.toLowerCase());
  });

  return (
    <div className="container-fluid px-0">
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      {/* HEADER SECTION */}
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
            className="btn btn-campusloop shadow-sm px-4 py-2 rounded-3 d-flex align-items-center gap-2 fw-bold w-100 justify-content-center transition-all"
            disabled={selectedIds.length === 0}
            onClick={openDownloadConfirmation}
          >
            <i className="bi bi-file-earmark-zip-fill fs-5"></i> Download File
            {selectedIds.length > 0 && (
              <span className="badge bg-white text-dark ms-1 rounded-pill">
                {selectedIds.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12 col-md-6 col-lg-4 col-xl-3">
          <div className="input-group shadow-sm rounded-3 overflow-hidden">
            <span className="input-group-text bg-white border-end-0 text-muted px-3">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0 toolbar-input"
              placeholder="Search file name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {filteredFiles.length > 0 ? (
          filteredFiles.map((file) => {
            const details = getFileDetails(file.file_extension);
            const isSelected = selectedIds.includes(file.id);
            const badgeStyle = getBadgeStyle(file.source_label);

            return (
              <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={file.id}>
                <div
                  className={`card border-0 shadow-sm rounded-4 h-100 bg-white transition-all ${isSelected ? "border-primary" : "hover-shadow"}`}
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
                            className={`badge ${badgeStyle} bg-opacity-10 border`}
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
            <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
              <i
                className="bi bi-folder-x text-muted d-block mb-3"
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

      <TeacherFilesModal
        selectedIds={selectedIds}
        executeDownloadZip={executeDownloadZip}
      />
    </div>
  );
};

export default TeacherFiles;
