import React, { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import axios from "axios";
import { sileo } from "sileo";
import { Modal } from "bootstrap";
import GlobalSpinner from "../../../components/Shared/GlobalSpinner";
import AdminStreamModals from "./AdminStreamModals";
import AdminRespondentsModal from "./AdminRespondentsModal";
import { openStoredFile, resolveStoragePath } from '../../../utils/fileUrl';

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const AdminTabStream = () => {
  const { classroom } = useOutletContext();
  const [classworks, setClassworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading Stream...");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [expandedInstructions, setExpandedInstructions] = useState({});
  const [expandedCommentTexts, setExpandedCommentTexts] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});

  // SERVER-SIDE DEBOUNCE EFFECT
  useEffect(() => {
    if (classroom && classroom.id) {
      const delayDebounceFn = setTimeout(() => {
        fetchClassworks();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [classroom?.id, searchQuery]);

  const fetchClassworks = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/classrooms/${classroom.id}/classworks`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
          params: {
            search: searchQuery,
          },
        },
      );

      if (Array.isArray(res.data)) {
        setClassworks(res.data);
      } else {
        setClassworks([]);
      }
      setSelectedIds([]);
    } catch (error) {
      console.error(error);
      setClassworks([]);
    } finally {
      setIsLoading(false);
    }
  };

  let filteredClassworks = classworks.filter((cw) => {
    return filterType === "all" || cw.type === filterType;
  });

  filteredClassworks.sort((a, b) => {
    const dateA = new Date(a?.created_at || 0).getTime();
    const dateB = new Date(b?.created_at || 0).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(filteredClassworks.map((cw) => cw.id));
    else setSelectedIds([]);
  };

  const confirmBulkDelete = () => {
    const modal = new Modal(document.getElementById("deleteClassworksModal"));
    modal.show();
  };

  const executeBulkDelete = async () => {
    setIsLoading(true);
    setLoadingText("Moving to Recycle Bin...");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/admin/classworks/bulk-delete`,
        { ids: selectedIds },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      sileo.success({
        title: "Deleted",
        description: "Classworks moved to recycle bin.",
        ...darkToast,
      });
      fetchClassworks();
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: "Could not delete classworks.",
        ...darkToast,
      });
      setIsLoading(false);
    }
  };

  const confirmDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
    const modal = new Modal(document.getElementById("deleteCommentModal"));
    modal.show();
  };

  const executeDeleteComment = async () => {
    setIsLoading(true);
    setLoadingText("Deleting comment...");
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/admin/comments/${commentToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      sileo.success({
        title: "Comment Deleted",
        description: "The comment has been removed.",
        ...darkToast,
      });
      fetchClassworks();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Could not delete comment.";
      sileo.error({
        title: "Failed",
        description: errorMsg,
        ...darkToast,
      });
      setIsLoading(false);
    }
  };

  const openRespondentsModal = (cw) => {
    setSelectedItem(cw);
    setTimeout(() => {
      const modalEl = document.getElementById("adminRespondentsModal");
      if (modalEl) {
        const modal = Modal.getOrCreateInstance(modalEl);
        modal.show();
      }
    }, 100);
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case "assignment":
        return {
          badge: "text-primary fw-medium bg-primary border-primary",
          hex: "var(--bs-primary)",
        };
      case "activity":
        return {
          badge: "text-success fw-medium bg-success border-success",
          hex: "var(--bs-success)",
        };
      case "quiz":
        return {
          badge: "text-warning fw-medium bg-warning border-warning",
          hex: "var(--bs-warning)",
        };
      case "exam":
        return {
          badge: "text-danger fw-medium bg-danger border-danger",
          hex: "var(--bs-danger)",
        };
      case "material":
        return {
          badge: "text-info fw-medium bg-info border-info",
          hex: "var(--bs-info)",
        };
      default:
        return {
          badge: "text-secondary fw-medium bg-secondary border-secondary",
          hex: "var(--bs-secondary)",
        };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "assignment":
        return "bi-journal-code";
      case "activity":
        return "bi-person-workspace";
      case "quiz":
        return "bi-ui-checks";
      case "exam":
        return "bi-file-earmark-check";
      case "material":
        return "bi-bookmark-star";
      default:
        return "bi-journal-text";
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0 || !bytes) return "Unknown Size";
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
        label: "PDF",
      };
    if (["doc", "docx"].includes(ext))
      return {
        icon: "bi-file-earmark-word-fill",
        color: "#0d6efd",
        bg: "#cfe2ff",
        label: "DOCX",
      };
    if (["xls", "xlsx", "csv"].includes(ext))
      return {
        icon: "bi-file-earmark-excel-fill",
        color: "#198754",
        bg: "#d1e7dd",
        label: "EXCEL",
      };
    if (["ppt", "pptx"].includes(ext))
      return {
        icon: "bi-file-earmark-ppt-fill",
        color: "#fd7e14",
        bg: "#ffe5d0",
        label: "POWERPOINT",
      };
    if (["png", "jpg", "jpeg", "gif"].includes(ext))
      return {
        icon: "bi-file-earmark-image-fill",
        color: "#6f42c1",
        bg: "#e0cffc",
        label: "IMAGE",
      };
    if (["mp4", "avi", "mov"].includes(ext))
      return {
        icon: "bi-file-earmark-play-fill",
        color: "#0dcaf0",
        bg: "#cff4fc",
        label: "VIDEO",
      };

    return {
      icon: "bi-file-earmark-fill",
      color: "#6c757d",
      bg: "#e2e3e5",
      label: "FILE",
    };
  };

  const scrollToClasswork = (cwId) => {
    const element = document.getElementById(`classwork-${cwId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.style.transition = "all 0.5s ease";
      element.style.boxShadow = "0 0 0 4px var(--primary-color)";
      setTimeout(() => {
        element.style.boxShadow = "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)";
      }, 2000);
    }
  };

  // Sanitizes link to prevent XSS Attacks
  const getSafeLink = (url) => {
    if (!url) return "#";
    try {
      const parsedUrl = new URL(url);
      if (["http:", "https:"].includes(parsedUrl.protocol)) {
        return parsedUrl.href;
      }
    } catch (e) {
      if (
        !url.startsWith("http") &&
        !url.toLowerCase().startsWith("javascript:")
      ) {
        return `https://${url}`;
      }
    }
    return "#";
  };

  const renderWithLinks = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-underline fw-medium"
            style={{ color: "var(--primary-color)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden premium-hover-card">
        <div className="card-body p-0">
          <div className="d-flex flex-nowrap align-items-center gap-3 overflow-x-auto custom-scrollbar p-3">
            <div className="d-flex align-items-center flex-shrink-0 pe-2">
              <div className="form-check m-0 d-flex align-items-center">
                <input
                  type="checkbox"
                  className="form-check-input mt-0 shadow-sm"
                  id="selectAll"
                  checked={
                    selectedIds.length === filteredClassworks.length &&
                    filteredClassworks.length > 0
                  }
                  onChange={handleSelectAll}
                  style={{
                    cursor: "pointer",
                    width: "1.2rem",
                    height: "1.2rem",
                  }}
                />
                <label
                  className="form-check-label small fw-bold text-muted ms-2 d-flex align-items-center pe-2"
                  htmlFor="selectAll"
                  style={{ cursor: "pointer" }}
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
              className="input-group flex-grow-1"
              style={{ minWidth: "400px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                placeholder="Search classwork title or instruction..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div
              className="input-group flex-shrink-0"
              style={{ width: "400px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-funnel"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="assignment">Assignment</option>
                <option value="activity">Activity</option>
                <option value="quiz">Quiz</option>
                <option value="exam">Exam</option>
                <option value="material">Material</option>
              </select>
            </div>

            <div
              className="input-group flex-shrink-0"
              style={{ width: "400px" }}
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
                onClick={confirmBulkDelete}
                disabled={selectedIds.length === 0}
                className="btn btn-danger d-flex align-items-center justify-content-center gap-2 py-2 px-3 rounded-3 shadow-sm ms-2"
              >
                <i className="bi bi-trash-fill"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-3 mb-4 mb-lg-0" style={{ zIndex: 10 }}>
          <div
            className="card border-0 shadow-sm rounded-4 bg-white sticky-top premium-hover-card"
            style={{ top: "100px" }}
          >
            <div className="card-header bg-light border-bottom p-4 rounded-top-4">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center">
                <i className="bi bi-card-list fs-5 me-2 text-primary"></i>{" "}
                Classwork Outline
              </h6>
            </div>
            <div
              className="card-body p-2 custom-scrollbar"
              style={{ maxHeight: "450px", overflowY: "auto" }}
            >
              {filteredClassworks.length === 0 ? (
                <p className="text-muted small mb-0 text-center py-4">
                  No works found.
                </p>
              ) : (
                <div className="d-flex flex-column gap-1">
                  {filteredClassworks.map((task, index) => {
                    const taskStyle = getBadgeStyle(task?.type);
                    return (
                      <React.Fragment key={task.id}>
                        <div
                          className="p-2 rounded-3 hover-bg-light transition-all"
                          style={{
                            cursor: "pointer",
                            borderLeft: "3px solid transparent",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderLeftColor =
                              "var(--primary-color)";
                            e.currentTarget.style.backgroundColor =
                              "rgba(98, 111, 71, 0.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderLeftColor =
                              "transparent";
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                          onClick={() => scrollToClasswork(task.id)}
                        >
                          <div className="d-flex align-items-start gap-2">
                            <div
                              className="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0 shadow-sm mt-1"
                              style={{
                                width: "32px",
                                height: "32px",
                                backgroundColor: taskStyle.hex,
                                color: "white",
                              }}
                            >
                              <i
                                className={`bi ${getTypeIcon(task?.type)}`}
                                style={{ fontSize: "0.85rem" }}
                              ></i>
                            </div>

                            <div className="flex-grow-1 overflow-hidden">
                              <div className="d-flex justify-content-between align-items-start mb-1 gap-2">
                                <span
                                  className="small fw-bold text-dark text-truncate d-block"
                                  title={task.title}
                                >
                                  {task.title}
                                </span>
                                <span
                                  className={`badge bg-opacity-10 border ${taskStyle.badge} flex-shrink-0 mt-1 shadow-sm`}
                                  style={{ fontSize: "0.55rem" }}
                                >
                                  {task?.type?.toUpperCase()}
                                </span>
                              </div>

                              <div
                                className="text-muted"
                                style={{ fontSize: "0.7rem" }}
                              >
                                {task.type === "material" || !task.deadline ? (
                                  <span>
                                    <i className="bi bi-calendar-plus me-1"></i>{" "}
                                    Posted:{" "}
                                    {new Date(task.created_at).toLocaleString(
                                      [],
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </span>
                                ) : (
                                  <span>
                                    <i className="bi bi-clock me-1"></i> Due:{" "}
                                    {new Date(task.deadline).toLocaleString(
                                      [],
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {index !== filteredClassworks.length - 1 && (
                          <hr className="my-1 border-secondary opacity-10 mx-2" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-9 pb-5">
          {filteredClassworks.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 bg-white mb-4 premium-hover-card">
              <div className="card-body p-5 text-center">
                <i
                  className="bi bi-inbox text-muted d-block mb-3"
                  style={{ fontSize: "3rem", opacity: 0.5 }}
                ></i>
                <h5 className="fw-bold text-dark">No classworks found.</h5>
                <p className="text-muted small mb-0">
                  {searchQuery || filterType !== "all"
                    ? "Try adjusting your search or filters."
                    : "There are no classworks posted in this classroom yet."}
                </p>
              </div>
            </div>
          ) : (
            filteredClassworks.map((cw) => {
              const typeStyle = getBadgeStyle(cw?.type);
              const isMaterial = cw?.type === "material";

              const rawInstruction = cw.instruction || cw.description || "";
              const isInstructionExpanded = expandedInstructions[cw.id];
              const instructionLimit = 250;
              const shouldTruncateInstruction =
                rawInstruction.length > instructionLimit;
              const displayInstruction =
                isInstructionExpanded || !shouldTruncateInstruction
                  ? rawInstruction
                  : rawInstruction.substring(0, instructionLimit) + "...";

              const isCommentsExpanded = expandedComments[cw.id];
              const commentsList = cw.comments || [];
              const visibleComments = isCommentsExpanded
                ? commentsList
                : commentsList.slice(0, 2);
              const hasMoreComments = commentsList.length > 2;

              const totalCommentsAndReplies = commentsList.reduce(
                (total, comment) => {
                  return (
                    total + 1 + (comment.replies ? comment.replies.length : 0)
                  );
                },
                0,
              );

              return (
                <div
                  key={cw.id}
                  id={`classwork-${cw.id}`}
                  className="card border-0 shadow-sm bg-white mb-4 position-relative premium-hover-card"
                  style={{
                    borderRadius: "1rem",
                    borderLeft: `5px solid ${typeStyle.hex}`,
                  }}
                >
                  <div className="card-body p-4 p-md-5 pb-4">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0 shadow-sm"
                          style={{
                            width: "50px",
                            height: "50px",
                            backgroundColor: typeStyle.hex,
                            color: "white",
                          }}
                        >
                          <i className={`bi ${getTypeIcon(cw?.type)} fs-4`}></i>
                        </div>
                        <div>
                          <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2 flex-wrap">
                            {cw.title}
                            <span
                              className={`badge bg-opacity-10 border text-uppercase px-2 py-1 ${typeStyle.badge} shadow-sm`}
                              style={{
                                fontSize: "0.65rem",
                                letterSpacing: "1px",
                                transform: "translateY(-1px)",
                              }}
                            >
                              {cw?.type}
                            </span>
                          </h4>
                          <div className="text-muted small fw-medium d-flex flex-wrap align-items-center gap-3 mt-1">
                            <span>
                              <i className="bi bi-calendar-plus me-1"></i>{" "}
                              Posted:{" "}
                              {new Date(cw.created_at).toLocaleString([], {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {cw.deadline && (
                              <>
                                <span className="d-none d-sm-inline opacity-50">
                                  |
                                </span>
                                <span className="text-danger fw-medium">
                                  <i className="bi bi-clock me-1"></i> Due:{" "}
                                  {new Date(cw.deadline).toLocaleString([], {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-3 position-relative ms-3">
                        {!isMaterial && (
                          <button
                            className="btn btn-sm btn-campusloop fw-medium rounded-3 px-3 shadow-sm d-none d-md-flex align-items-center"
                            onClick={() => openRespondentsModal(cw)}
                          >
                            <i className="bi bi-people-fill me-2"></i>{" "}
                            Respondents
                          </button>
                        )}
                        <input
                          type="checkbox"
                          className="form-check-input shadow-sm m-0 border-secondary"
                          checked={selectedIds.includes(cw.id)}
                          onChange={() => handleSelect(cw.id)}
                          style={{
                            cursor: "pointer",
                            width: "22px",
                            height: "22px",
                          }}
                        />
                      </div>
                    </div>

                    <div className="ps-0 ps-sm-5 ms-sm-3 mt-2">
                      <p
                        className={`text-dark lh-base ${shouldTruncateInstruction && !isInstructionExpanded ? "mb-1" : "mb-4"}`}
                        style={{ whiteSpace: "pre-line", fontSize: "0.95rem" }}
                      >
                        {displayInstruction}
                      </p>

                      {shouldTruncateInstruction && (
                        <button
                          className="btn btn-link p-0 text-decoration-none mb-4 fw-bold shadow-none"
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--primary-color)",
                          }}
                          onClick={() =>
                            setExpandedInstructions((prev) => ({
                              ...prev,
                              [cw.id]: !isInstructionExpanded,
                            }))
                          }
                        >
                          {isInstructionExpanded ? "See Less" : "See More"}
                        </button>
                      )}

                      {/* ATTACHMENTS */}
                      <div className="d-flex flex-column gap-2 mb-3">
                        {cw.link && (
                          <div className="d-flex align-items-center justify-content-between p-3 bg-white border rounded-4 shadow-sm transition-all hover-shadow">
                            <div
                              className="rounded-3 d-flex align-items-center justify-content-center me-3 flex-shrink-0 bg-primary bg-opacity-10 text-primary"
                              style={{ width: "45px", height: "45px" }}
                            >
                              <i className="bi bi-link-45deg fs-4"></i>
                            </div>
                            <div className="flex-grow-1 overflow-hidden">
                              <p
                                className="mb-0 fw-bold text-dark text-truncate"
                                style={{ fontSize: "0.95rem" }}
                              >
                                {cw.link}
                              </p>
                              <p
                                className="mb-0 text-muted"
                                style={{
                                  fontSize: "0.75rem",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                EXTERNAL LINK
                              </p>
                            </div>
                            <a
                              href={getSafeLink(cw.link)}
                              target={
                                getSafeLink(cw.link) === "#"
                                  ? "_self"
                                  : "_blank"
                              }
                              rel="noreferrer"
                              className={`btn btn-sm ms-3 rounded-3 shadow-sm d-flex justify-content-center align-items-center flex-shrink-0 ${
                                getSafeLink(cw.link) === "#"
                                  ? "btn-secondary opacity-50"
                                  : "btn-campusloop"
                              }`}
                              style={{
                                width: "35px",
                                height: "35px",
                                pointerEvents:
                                  getSafeLink(cw.link) === "#"
                                    ? "none"
                                    : "auto",
                              }}
                              title={
                                getSafeLink(cw.link) === "#"
                                  ? "Unsafe Link Blocked"
                                  : "Visit Link"
                              }
                              onClick={(e) => {
                                if (getSafeLink(cw.link) === "#") {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <i
                                className={
                                  getSafeLink(cw.link) === "#"
                                    ? "bi bi-shield-lock-fill"
                                    : "bi bi-box-arrow-up-right"
                                }
                              ></i>
                            </a>
                          </div>
                        )}
                        {cw.form && (
                          <div className="d-flex align-items-center justify-content-between p-3 bg-white border rounded-4 shadow-sm transition-all hover-shadow">
                            <div
                              className="rounded-3 d-flex align-items-center justify-content-center me-3 flex-shrink-0 bg-dark bg-opacity-10 text-dark"
                              style={{ width: "45px", height: "45px" }}
                            >
                              <i className="bi bi-ui-radios fs-4"></i>
                            </div>
                            <div className="flex-grow-1 overflow-hidden">
                              <p
                                className="mb-0 fw-bold text-dark text-truncate"
                                style={{ fontSize: "0.95rem" }}
                              >
                                {cw.form.name}
                              </p>
                              <p
                                className="mb-0 text-muted"
                                style={{
                                  fontSize: "0.75rem",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                QUIZ / EXAM FORM
                              </p>
                            </div>
                            <Link
                              to={`/admin/forms/${cw.form.id}`}
                              className="btn btn-sm btn-campusloop ms-3 rounded-3 shadow-sm d-flex justify-content-center align-items-center flex-shrink-0"
                              style={{ width: "35px", height: "35px" }}
                              title="View Form"
                            >
                              <i className="bi bi-box-arrow-up-right"></i>
                            </Link>
                          </div>
                        )}
                        {cw.files &&
                          cw.files.length > 0 &&
                          cw.files.map((file) => {
                            const fileDetails = getFileDetails(
                              file.file_extension,
                            );
                            return (
                              <div
                                key={file.id}
                                className="d-flex align-items-center justify-content-between p-3 bg-white border rounded-4 shadow-sm transition-all hover-shadow"
                              >
                                <div
                                  className="rounded-3 d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                  style={{
                                    width: "45px",
                                    height: "45px",
                                    backgroundColor: fileDetails.bg,
                                    color: fileDetails.color,
                                  }}
                                >
                                  <i
                                    className={`bi ${fileDetails.icon} fs-4`}
                                  ></i>
                                </div>
                                <div className="flex-grow-1 overflow-hidden">
                                  <p
                                    className="mb-0 fw-bold text-dark text-truncate"
                                    style={{ fontSize: "0.95rem" }}
                                    title={file.name}
                                  >
                                    {file.name}
                                  </p>
                                  <p
                                    className="mb-0 text-muted text-uppercase"
                                    style={{ fontSize: "0.75rem" }}
                                  >
                                    {formatBytes(file.file_size)} •{" "}
                                    {fileDetails.label}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => openStoredFile(file)}
                                  className="btn btn-sm btn-campusloop ms-3 rounded-3 shadow-sm d-flex justify-content-center align-items-center flex-shrink-0"
                                  style={{ width: "35px", height: "35px" }}
                                  title="View File"
                                >
                                  <i className="bi bi-eye-fill"></i>
                                </button>
                              </div>
                            );
                          })}
                      </div>

                      {!isMaterial && (
                        <div className="d-flex align-items-center justify-content-end mt-2 mb-4 px-1">
                          <div className="d-flex align-items-center gap-2">
                            <span
                              className="fw-bold text-muted text-uppercase"
                              style={{
                                fontSize: "0.65rem",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Point{cw.points > 1 ? "s" : ""}:
                            </span>
                            <span
                              className="fw-bolder text-dark"
                              style={{ fontSize: "0.85rem" }}
                            >
                              {cw.points ? `${cw.points}` : "0"}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="border-top pt-3 mt-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span className="fw-bold text-dark small d-flex align-items-center gap-2">
                            <i className="bi bi-chat-text text-muted fs-5"></i>{" "}
                            Class Comments
                          </span>
                          <span className="text-muted small">
                            {totalCommentsAndReplies} comments
                          </span>
                        </div>

                        {commentsList.length > 0 && (
                          <div
                            className="d-flex flex-column gap-3 mb-4 custom-scrollbar"
                            style={{
                              maxHeight: "350px",
                              overflowY: "auto",
                              paddingRight: "10px",
                            }}
                          >
                            {visibleComments.map((comment) => {
                              const isTextExpanded =
                                expandedCommentTexts[comment.id];
                              const textLimit = 150;
                              const shouldTruncate =
                                comment.content &&
                                comment.content.length > textLimit;
                              const displayContent =
                                isTextExpanded || !shouldTruncate
                                  ? comment.content
                                  : comment.content.substring(0, textLimit) +
                                    "...";

                              const isRepliesExpanded =
                                expandedReplies[comment.id];
                              const repliesList = comment.replies || [];
                              const hasReplies = repliesList.length > 0;

                              return (
                                <div
                                  key={comment.id}
                                  className="d-flex align-items-start gap-2"
                                >
                                  <div
                                    className="rounded-circle text-white d-flex justify-content-center align-items-center flex-shrink-0"
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      backgroundColor: "var(--primary-color)",
                                      fontSize: "0.85rem",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {comment.user?.first_name?.charAt(0)}
                                  </div>
                                  <div className="flex-grow-1">
                                    <div
                                      className="bg-light rounded-4 px-3 py-2"
                                      style={{
                                        display: "inline-block",
                                        maxWidth: "100%",
                                        border: "1px solid #f0f0f0",
                                      }}
                                    >
                                      <span
                                        className="fw-bold text-dark d-block"
                                        style={{
                                          fontSize: "0.8rem",
                                          marginBottom: "2px",
                                        }}
                                      >
                                        {comment.user?.first_name}{" "}
                                        {comment.user?.last_name}
                                      </span>
                                      <span
                                        className="text-dark lh-sm d-block"
                                        style={{
                                          fontSize: "0.85rem",
                                          whiteSpace: "pre-wrap",
                                          wordBreak: "break-word",
                                        }}
                                      >
                                        {renderWithLinks(displayContent)}
                                      </span>

                                      {shouldTruncate && (
                                        <button
                                          className="btn btn-link p-0 text-decoration-none fw-bold shadow-none mt-1"
                                          style={{
                                            fontSize: "0.75rem",
                                            color: "var(--primary-color)",
                                          }}
                                          onClick={() =>
                                            setExpandedCommentTexts((prev) => ({
                                              ...prev,
                                              [comment.id]: !isTextExpanded,
                                            }))
                                          }
                                        >
                                          {isTextExpanded
                                            ? "See Less"
                                            : "See More"}
                                        </button>
                                      )}
                                    </div>
                                    <div className="ms-2 mt-1 d-flex align-items-center gap-3">
                                      <span
                                        className="text-muted"
                                        style={{
                                          fontSize: "0.7rem",
                                          fontWeight: "500",
                                        }}
                                      >
                                        {new Date(
                                          comment.created_at,
                                        ).toLocaleString([], {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                      <button
                                        className="btn btn-link p-0 text-danger fw-bold text-decoration-none shadow-none"
                                        style={{ fontSize: "0.7rem" }}
                                        onClick={() =>
                                          confirmDeleteComment(comment.id)
                                        }
                                      >
                                        <i className="bi bi-trash-fill"></i>{" "}
                                      </button>
                                    </div>

                                    {hasReplies && (
                                      <div className="mt-1">
                                        {!isRepliesExpanded ? (
                                          <button
                                            className="btn btn-link text-muted p-0 text-decoration-none fw-medium shadow-none d-flex align-items-center gap-1"
                                            style={{
                                              fontSize: "0.75rem",
                                              marginLeft: "8px",
                                            }}
                                            onClick={() =>
                                              setExpandedReplies((prev) => ({
                                                ...prev,
                                                [comment.id]: true,
                                              }))
                                            }
                                          >
                                            <i className="bi bi-arrow-return-right"></i>{" "}
                                            View {repliesList.length}{" "}
                                            {repliesList.length === 1
                                              ? "reply"
                                              : "replies"}
                                          </button>
                                        ) : (
                                          <div className="d-flex flex-column gap-2 mt-2">
                                            {repliesList.map((reply) => {
                                              const isReplyTextExpanded =
                                                expandedCommentTexts[reply.id];
                                              const shouldTruncateReply =
                                                reply.content &&
                                                reply.content.length >
                                                  textLimit;
                                              const displayReplyContent =
                                                isReplyTextExpanded ||
                                                !shouldTruncateReply
                                                  ? reply.content
                                                  : reply.content.substring(
                                                      0,
                                                      textLimit,
                                                    ) + "...";

                                              return (
                                                <div
                                                  key={reply.id}
                                                  className="d-flex align-items-start gap-2"
                                                >
                                                  <div
                                                    className="rounded-circle text-white d-flex justify-content-center align-items-center flex-shrink-0"
                                                    style={{
                                                      width: "24px",
                                                      height: "24px",
                                                      backgroundColor:
                                                        "var(--secondary-color)",
                                                      fontSize: "0.6rem",
                                                      fontWeight: "bold",
                                                    }}
                                                  >
                                                    {reply.user?.first_name?.charAt(
                                                      0,
                                                    )}
                                                  </div>
                                                  <div className="flex-grow-1">
                                                    <div
                                                      className="bg-light rounded-4 px-3 py-2"
                                                      style={{
                                                        display: "inline-block",
                                                        maxWidth: "100%",
                                                        border:
                                                          "1px solid #f0f0f0",
                                                      }}
                                                    >
                                                      <span
                                                        className="fw-bold text-dark d-block"
                                                        style={{
                                                          fontSize: "0.75rem",
                                                          marginBottom: "1px",
                                                        }}
                                                      >
                                                        {reply.user?.first_name}{" "}
                                                        {reply.user?.last_name}
                                                      </span>
                                                      <span
                                                        className="text-dark lh-sm d-block"
                                                        style={{
                                                          fontSize: "0.85rem",
                                                          whiteSpace:
                                                            "pre-wrap",
                                                          wordBreak:
                                                            "break-word",
                                                        }}
                                                      >
                                                        {renderWithLinks(
                                                          displayReplyContent,
                                                        )}
                                                      </span>

                                                      {shouldTruncateReply && (
                                                        <button
                                                          className="btn btn-link p-0 text-decoration-none fw-bold shadow-none mt-1"
                                                          style={{
                                                            fontSize: "0.7rem",
                                                            color:
                                                              "var(--primary-color)",
                                                          }}
                                                          onClick={() =>
                                                            setExpandedCommentTexts(
                                                              (prev) => ({
                                                                ...prev,
                                                                [reply.id]:
                                                                  !isReplyTextExpanded,
                                                              }),
                                                            )
                                                          }
                                                        >
                                                          {isReplyTextExpanded
                                                            ? "See Less"
                                                            : "See More"}
                                                        </button>
                                                      )}
                                                    </div>
                                                    <div className="ms-2 mt-1 d-flex align-items-center gap-3">
                                                      <span
                                                        className="text-muted"
                                                        style={{
                                                          fontSize: "0.65rem",
                                                          fontWeight: "500",
                                                        }}
                                                      >
                                                        {new Date(
                                                          reply.created_at,
                                                        ).toLocaleString([], {
                                                          year: "numeric",
                                                          month: "short",
                                                          day: "numeric",
                                                          hour: "2-digit",
                                                          minute: "2-digit",
                                                        })}
                                                      </span>
                                                      <button
                                                        className="btn btn-link p-0 text-danger fw-bold text-decoration-none shadow-none"
                                                        style={{
                                                          fontSize: "0.65rem",
                                                        }}
                                                        onClick={() =>
                                                          confirmDeleteComment(
                                                            reply.id,
                                                          )
                                                        }
                                                      >
                                                        <i className="bi bi-trash-fill"></i>{" "}
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                            <button
                                              className="btn btn-link text-muted p-0 text-decoration-none fw-medium shadow-none mt-1 d-flex align-items-center gap-1"
                                              style={{
                                                fontSize: "0.75rem",
                                                marginLeft: "32px",
                                              }}
                                              onClick={() =>
                                                setExpandedReplies((prev) => ({
                                                  ...prev,
                                                  [comment.id]: false,
                                                }))
                                              }
                                            >
                                              <i className="bi bi-chevron-up"></i>{" "}
                                              Hide replies
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                            {hasMoreComments && !isCommentsExpanded && (
                              <button
                                className="btn btn-link text-muted text-decoration-none text-start p-0 fw-medium shadow-none mt-1"
                                style={{ fontSize: "0.85rem" }}
                                onClick={() =>
                                  setExpandedComments((prev) => ({
                                    ...prev,
                                    [cw.id]: true,
                                  }))
                                }
                              >
                                View all {totalCommentsAndReplies} comments
                              </button>
                            )}
                            {hasMoreComments && isCommentsExpanded && (
                              <button
                                className="btn btn-link text-muted text-decoration-none text-start p-0 fw-medium shadow-none mt-1"
                                style={{ fontSize: "0.85rem" }}
                                onClick={() =>
                                  setExpandedComments((prev) => ({
                                    ...prev,
                                    [cw.id]: false,
                                  }))
                                }
                              >
                                Hide comments
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AdminStreamModals
        selectedCount={selectedIds.length}
        executeBulkDelete={executeBulkDelete}
        executeDeleteComment={executeDeleteComment}
      />

      <AdminRespondentsModal selectedItem={selectedItem} />
    </>
  );
};

export default AdminTabStream;
