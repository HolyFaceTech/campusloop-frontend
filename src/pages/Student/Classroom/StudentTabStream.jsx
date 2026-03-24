import React, { useState, useEffect } from "react";
import { useParams, useOutletContext, Link } from "react-router-dom";
import axios from "axios";
import { sileo } from "sileo";
import GlobalSpinner from "../../../components/Shared/GlobalSpinner";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const StudentTabStream = () => {
  const { id } = useParams();
  const { classroom } = useOutletContext();
  const [stream, setStream] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = JSON.parse(
    localStorage.getItem("campusloop_user") ||
      sessionStorage.getItem("campusloop_user") ||
      "{}",
  );
  const userInitial = currentUser.first_name
    ? currentUser.first_name.charAt(0).toUpperCase()
    : "S";

  // MGA STATES PARA SA COMMENTS AT REPLIES
  const [commentText, setCommentText] = useState({});
  const [replyText, setReplyText] = useState({});
  const [activeReplyBox, setActiveReplyBox] = useState(null);

  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    fetchStream();
    const closeDropdown = (e) => {
      if (!e.target.closest(".classwork-card-dropdown")) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, [id]);

  const fetchStream = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/student/classrooms/${id}/stream`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      setStream(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // STANDARD ASYNC SUBMIT (TO PREVENT DUPLICATION)
  const handleCommentSubmit = async (classworkId, parentId = null) => {
    const content = parentId ? replyText[parentId] : commentText[classworkId];
    if (!content || content.trim() === "") return;

    // Clear text field instantly for responsive feel and to prevent double clicks
    if (parentId) {
      setReplyText((prev) => ({ ...prev, [parentId]: "" }));
      setActiveReplyBox(null);
    } else {
      setCommentText((prev) => ({ ...prev, [classworkId]: "" }));
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/classworks/${classworkId}/comments`,
        { content: content, parent_id: parentId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      fetchStream(); // Fetch real data directly from DB
    } catch (error) {
      console.error(error);
      sileo.error({
        title: "Failed",
        description: "Could not post comment.",
        ...darkToast,
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "DONE":
        return (
          <span
            className="badge bg-success bg-opacity-10 text-success border border-success px-2 py-1 shadow-sm"
            style={{ fontSize: "0.65rem", letterSpacing: "0.5px" }}
          >
            <i className="bi bi-check-circle-fill me-1"></i> Done
          </span>
        );
      case "MISSING":
        return (
          <span
            className="badge bg-danger bg-opacity-10 text-danger border border-danger px-2 py-1 shadow-sm"
            style={{ fontSize: "0.65rem", letterSpacing: "0.5px" }}
          >
            <i className="bi bi-x-circle-fill me-1"></i> Missing
          </span>
        );
      case "DUE SOON":
        return (
          <span
            className="badge bg-warning bg-opacity-25 text-dark border border-warning px-2 py-1 shadow-sm"
            style={{ fontSize: "0.65rem", letterSpacing: "0.5px" }}
          >
            <i className="bi bi-clock-fill me-1"></i> Due Soon
          </span>
        );
      default:
        return (
          <span
            className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary px-2 py-1 shadow-sm"
            style={{ fontSize: "0.65rem", letterSpacing: "0.5px" }}
          >
            Pending
          </span>
        );
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case "assignment":
        return {
          badge: "text-primary bg-primary border-primary",
          hex: "var(--bs-primary)",
        };
      case "activity":
        return {
          badge: "text-success bg-success border-success",
          hex: "var(--bs-success)",
        };
      case "quiz":
        return {
          badge: "text-warning bg-warning border-warning",
          hex: "var(--bs-warning)",
        };
      case "exam":
        return {
          badge: "text-danger bg-danger border-danger",
          hex: "var(--bs-danger)",
        };
      case "material":
        return {
          badge: "text-info bg-info border-info",
          hex: "var(--bs-info)",
        };
      default:
        return {
          badge: "text-secondary bg-secondary border-secondary",
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
        label: "WORD",
      };
    if (["xls", "xlsx", "csv"].includes(ext))
      return {
        icon: "bi-file-earmark-excel-fill",
        color: "#198754",
        bg: "#d1e7dd",
        label: "EXCEL",
      };
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext))
      return {
        icon: "bi-file-earmark-image-fill",
        color: "#6f42c1",
        bg: "#e0cffc",
        label: "IMAGE",
      };
    if (["mp4", "avi", "mov"].includes(ext))
      return {
        icon: "bi-file-earmark-play-fill",
        color: "#fd7e14",
        bg: "#ffe5d0",
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

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text="Loading Stream..." />
      <div className="row g-4">
        {/* CLASSWORK OUTLINE SIDEBAR */}
        <div className="col-12 col-lg-3 mb-4 mb-lg-0" style={{ zIndex: 10 }}>
          <div
            className="card border-0 shadow-sm rounded-4 bg-white sticky-top"
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
              {stream.length === 0 ? (
                <p className="text-muted small mb-0 text-center py-4">
                  No works posted yet.
                </p>
              ) : (
                <div className="d-flex flex-column gap-1">
                  {stream.map((task, index) => {
                    const taskStyle = getBadgeStyle(task.type);
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
                                className={`bi ${getTypeIcon(task.type)}`}
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
                                  className={`badge bg-opacity-10 border ${taskStyle.badge} flex-shrink-0 mt-1`}
                                  style={{ fontSize: "0.55rem" }}
                                >
                                  {task.type.toUpperCase()}
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
                        {index !== stream.length - 1 && (
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

        {/* FEED / STREAM */}
        <div className="col-12 col-lg-9 pb-5">
          {stream.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 bg-white mb-4">
              <div className="card-body p-5 text-center">
                <i
                  className="bi bi-inbox text-muted d-block mb-3 opacity-50"
                  style={{ fontSize: "4rem" }}
                ></i>
                <h5 className="fw-bold text-dark">No classworks yet.</h5>
                <p className="text-muted small mb-0">
                  Your teacher hasn't posted anything in this classroom.
                </p>
              </div>
            </div>
          ) : (
            stream.map((cw) => {
              const typeStyle = getBadgeStyle(cw.type);
              const isMaterial = cw.type === "material";

              return (
                <div
                  key={cw.id}
                  id={`classwork-${cw.id}`}
                  className="card border-0 shadow-sm bg-white mb-4 position-relative"
                  style={{
                    borderRadius: "1rem",
                    borderLeft: `5px solid ${typeStyle.hex}`,
                  }}
                >
                  <div className="card-body p-4 p-md-5 pb-4">
                    {/* PREMIUM HEADER */}
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
                          <i className={`bi ${getTypeIcon(cw.type)} fs-4`}></i>
                        </div>
                        <div>
                          <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2 flex-wrap">
                            {cw.title}
                            <span
                              className={`badge bg-opacity-10 border text-uppercase px-2 py-1 ${typeStyle.badge}`}
                              style={{
                                fontSize: "0.65rem",
                                letterSpacing: "1px",
                                transform: "translateY(-1px)",
                              }}
                            >
                              {cw.type}
                            </span>
                          </h4>
                          <div className="text-muted small fw-medium d-flex flex-wrap align-items-center gap-3 mt-1">
                            <span>
                              <i className="bi bi-calendar-plus me-1"></i>{" "}
                              Posted:{" "}
                              {new Date(cw.created_at).toLocaleString([], {
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
                                <span className="text-danger fw-bold">
                                  <i className="bi bi-clock me-1"></i> Due:{" "}
                                  {new Date(cw.deadline).toLocaleString([], {
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

                      {/* 3 DOTS STUDENT ACTIONS MENU */}
                      <div className="d-flex align-items-center gap-2 position-relative ms-3">
                        <div
                          className="dropdown classwork-card-dropdown"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="btn rounded-circle d-flex align-items-center justify-content-center border-0 shadow-sm transition-all"
                            type="button"
                            disabled={isMaterial}
                            onClick={() =>
                              setOpenDropdownId(
                                openDropdownId === cw.id ? null : cw.id,
                              )
                            }
                            style={{
                              width: "35px",
                              height: "35px",
                              backgroundColor: isMaterial
                                ? "#f1f3f5"
                                : openDropdownId === cw.id
                                  ? "#e9ecef"
                                  : "#f8f9fa",
                              cursor: isMaterial ? "not-allowed" : "pointer",
                              opacity: isMaterial ? 0.5 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (!isMaterial)
                                e.currentTarget.style.backgroundColor =
                                  "#e9ecef";
                            }}
                            onMouseLeave={(e) => {
                              if (!isMaterial)
                                e.currentTarget.style.backgroundColor =
                                  openDropdownId === cw.id
                                    ? "#e9ecef"
                                    : "#f8f9fa";
                            }}
                          >
                            <i className="bi bi-three-dots-vertical text-dark"></i>
                          </button>

                          {!isMaterial && (
                            <ul
                              className={`dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-2 ${openDropdownId === cw.id ? "show" : ""}`}
                              style={{
                                position: "absolute",
                                zIndex: 1050,
                                minWidth: "160px",
                                right: 0,
                                left: "auto",
                                top: "100%",
                              }}
                            >
                              {cw.type === "form" &&
                                cw.student_status !== "DONE" && (
                                  <li>
                                    <button className="dropdown-item py-2 fw-medium text-campusloop">
                                      <i className="bi bi-ui-checks me-2"></i>{" "}
                                      Open Form
                                    </button>
                                  </li>
                                )}
                              {(cw.type === "assignment" ||
                                cw.type === "activity") &&
                                cw.student_status !== "DONE" && (
                                  <>
                                    <li>
                                      <button className="dropdown-item py-2 fw-medium text-campusloop">
                                        <i className="bi bi-cloud-upload me-2"></i>{" "}
                                        Add Work
                                      </button>
                                    </li>
                                    <li>
                                      <button className="dropdown-item py-2 fw-medium text-success">
                                        <i className="bi bi-check-circle me-2"></i>{" "}
                                        Mark as Done
                                      </button>
                                    </li>
                                  </>
                                )}
                              {cw.student_status === "DONE" && (
                                <li>
                                  <button className="dropdown-item py-2 fw-medium text-secondary">
                                    <i className="bi bi-eye me-2"></i> View
                                    Submission
                                  </button>
                                </li>
                              )}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="ps-0 ps-sm-5 ms-sm-3 mt-2">
                      <p
                        className="text-dark mb-4 lh-base"
                        style={{ whiteSpace: "pre-line", fontSize: "0.95rem" }}
                      >
                        {cw.instruction || cw.description}
                      </p>

                      {/* ATTACHMENTS */}
                      <div className="d-flex flex-column gap-2 mb-3">
                        {cw.link && (
                          <div className="d-flex align-items-center p-3 bg-light rounded-4 border hover-shadow transition-all overflow-hidden">
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
                                  fontSize: "0.70rem",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                EXTERNAL LINK
                              </p>
                            </div>
                            <a
                              href={cw.link}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-sm btn-campusloop ms-3 rounded-3 shadow-sm d-flex justify-content-center align-items-center flex-shrink-0"
                              style={{ width: "35px", height: "35px" }}
                              title="Visit Link"
                            >
                              <i className="bi bi-box-arrow-up-right"></i>
                            </a>
                          </div>
                        )}
                        {cw.form && (
                          <div className="d-flex align-items-center p-3 bg-light rounded-4 border hover-shadow transition-all overflow-hidden">
                            <div
                              className="rounded-3 d-flex align-items-center justify-content-center me-3 flex-shrink-0 bg-campusloop text-white"
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
                                  fontSize: "0.70rem",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                QUIZ / EXAM FORM
                              </p>
                            </div>
                            <Link
                              to={`/student/forms/${cw.form.id}`}
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
                                className="d-flex align-items-center p-3 bg-light rounded-4 border hover-shadow transition-all overflow-hidden"
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
                                    style={{
                                      fontSize: "0.95rem",
                                      maxWidth: "400px",
                                    }}
                                  >
                                    {file.name}
                                  </p>
                                  <p
                                    className="mb-0 text-muted"
                                    style={{ fontSize: "0.75rem" }}
                                  >
                                    {formatBytes(file.file_size)} •{" "}
                                    {fileDetails.label}
                                  </p>
                                </div>
                                <a
                                  href={`${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${file.path}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-sm btn-campusloop ms-3 rounded-3 shadow-sm d-flex justify-content-center align-items-center flex-shrink-0"
                                  style={{ width: "35px", height: "35px" }}
                                  title="View File"
                                >
                                  <i className="bi bi-eye-fill"></i>
                                </a>
                              </div>
                            );
                          })}
                      </div>

                      {/* STATUS AND POINTS */}
                      {!isMaterial && (
                        <div className="d-flex align-items-center justify-content-between mt-2 mb-4 px-1">
                          <div className="d-flex align-items-center gap-2">
                            <span
                              className="fw-bold text-muted text-uppercase"
                              style={{
                                fontSize: "0.65rem",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Status:
                            </span>
                            {getStatusBadge(cw.student_status)}
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span
                              className="fw-bold text-muted text-uppercase"
                              style={{
                                fontSize: "0.65rem",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Points:
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

                      {/* FB-STYLE COMMENTS THREAD */}
                      <div className="border-top pt-3 mt-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span className="fw-bold text-dark small d-flex align-items-center gap-2">
                            <i className="bi bi-chat-text text-muted fs-5"></i>{" "}
                            Class Comments
                          </span>
                          <span className="text-muted small">
                            {cw.comments ? cw.comments.length : 0} comments
                          </span>
                        </div>

                        {/* RENDER COMMENTS */}
                        {cw.comments && cw.comments.length > 0 && (
                          <div
                            className="d-flex flex-column gap-3 mb-4 custom-scrollbar"
                            style={{
                              maxHeight: "350px",
                              overflowY: "auto",
                              paddingRight: "10px",
                            }}
                          >
                            {cw.comments.map((comment) => (
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
                                        fontSize: "0.9rem",
                                        whiteSpace: "pre-wrap",
                                      }}
                                    >
                                      {comment.content}
                                    </span>
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
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                    <button
                                      className="btn btn-link p-0 text-muted fw-bold text-decoration-none shadow-none"
                                      style={{ fontSize: "0.7rem" }}
                                      onClick={() =>
                                        setActiveReplyBox(comment.id)
                                      }
                                    >
                                      Reply
                                    </button>
                                  </div>

                                  {/* RENDER REPLIES */}
                                  {comment.replies &&
                                    comment.replies.length > 0 && (
                                      <div className="d-flex flex-column gap-2 mt-2">
                                        {comment.replies.map((reply) => (
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
                                                  border: "1px solid #f0f0f0",
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
                                                    whiteSpace: "pre-wrap",
                                                  }}
                                                >
                                                  {reply.content}
                                                </span>
                                              </div>
                                              <div className="ms-2 mt-1">
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
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                  })}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                  {/* REPLY INPUT BOX */}
                                  {activeReplyBox === comment.id && (
                                    <div className="d-flex align-items-start gap-2 mt-2">
                                      <div
                                        className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold shadow-sm flex-shrink-0 mt-1"
                                        style={{
                                          width: "24px",
                                          height: "24px",
                                          backgroundColor:
                                            "var(--primary-color)",
                                          fontSize: "0.6rem",
                                        }}
                                      >
                                        {userInitial}
                                      </div>
                                      <textarea
                                        className="form-control bg-light border border-light-subtle rounded-3 py-1 px-3 custom-scrollbar shadow-sm flex-grow-1"
                                        rows="2"
                                        placeholder="Write a reply..."
                                        value={replyText[comment.id] || ""}
                                        onChange={(e) =>
                                          setReplyText({
                                            ...replyText,
                                            [comment.id]: e.target.value,
                                          })
                                        }
                                        style={{
                                          resize: "vertical",
                                          fontSize: "0.85rem",
                                          minHeight: "50px",
                                        }}
                                      ></textarea>
                                      <button
                                        className="btn btn-sm btn-campusloop shadow-sm rounded-pill d-flex justify-content-center align-items-center flex-shrink-0 px-3 mt-1"
                                        onClick={() =>
                                          handleCommentSubmit(cw.id, comment.id)
                                        }
                                        style={{ height: "32px" }}
                                      >
                                        <i className="bi bi-send-fill fs-6"></i>
                                      </button>
                                      <button
                                        className="btn btn-sm btn-light border shadow-sm rounded-circle d-flex justify-content-center align-items-center flex-shrink-0 mt-1 text-muted"
                                        onClick={() => setActiveReplyBox(null)}
                                        style={{
                                          width: "32px",
                                          height: "32px",
                                        }}
                                      >
                                        <i className="bi bi-x-lg"></i>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* MAIN COMMENT INPUT BOX */}
                        <div className="d-flex align-items-start gap-2 mt-3 pt-2 border-top">
                          <div
                            className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold shadow-sm flex-shrink-0 mt-1"
                            style={{
                              width: "38px",
                              height: "38px",
                              backgroundColor: "var(--primary-color)",
                            }}
                          >
                            {userInitial}
                          </div>
                          <textarea
                            className="form-control bg-light border border-light-subtle rounded-3 py-2 px-3 custom-scrollbar shadow-sm flex-grow-1"
                            rows="2"
                            placeholder="Write a comment..."
                            value={commentText[cw.id] || ""}
                            onChange={(e) =>
                              setCommentText({
                                ...commentText,
                                [cw.id]: e.target.value,
                              })
                            }
                            style={{
                              resize: "vertical",
                              fontSize: "0.9rem",
                              minHeight: "60px",
                            }}
                          ></textarea>
                          <button
                            className="btn btn-campusloop shadow-sm rounded-pill d-flex justify-content-center align-items-center flex-shrink-0 px-4 mt-1"
                            title="Post Comment"
                            onClick={() => handleCommentSubmit(cw.id)}
                            style={{ height: "38px" }}
                          >
                            <i className="bi bi-send-fill fs-6 me-1"></i> Send
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default StudentTabStream;
