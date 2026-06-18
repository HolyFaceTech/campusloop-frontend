import React, { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import axios from "axios";
import { sileo } from "sileo";
import { Offcanvas, Modal } from "bootstrap";
import GlobalSpinner from "../../../components/Shared/GlobalSpinner";
import ClassworkFormDrawer from "./ClassworkFormDrawer";
import RespondentsModal from "./RespondentsModal";
import { openStoredFile, resolveStoragePath } from '../../../utils/fileUrl';

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const TabStream = () => {
  const { classroom } = useOutletContext();
  const [classworks, setClassworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerMode, setDrawerMode] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const currentUser = JSON.parse(
    localStorage.getItem("campusloop_user") ||
      sessionStorage.getItem("campusloop_user") ||
      "{}",
  );
  const userInitial = currentUser.first_name
    ? currentUser.first_name.charAt(0).toUpperCase()
    : "U";

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [replyText, setReplyText] = useState({});
  const [activeReplyBox, setActiveReplyBox] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [includeLink, setIncludeLink] = useState(false);
  const [includeFiles, setIncludeFiles] = useState(false);
  const [includeForm, setIncludeForm] = useState(false);
  const [newFiles, setNewFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [deletedFileIds, setDeletedFileIds] = useState([]);
  const [expandedInstructions, setExpandedInstructions] = useState({});
  const [expandedCommentTexts, setExpandedCommentTexts] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    instruction: "",
    points: "",
    deadline: "",
    link: "",
    form_id: "",
  });

  useEffect(() => {
    if (classroom) fetchClassworks();
    const closeDropdown = (e) => {
      if (!e.target.closest(".classwork-card-dropdown")) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, [classroom]);

  const fetchClassworks = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/classrooms/${classroom.id}/classworks`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      setClassworks(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentSubmit = async (classworkId, parentId = null) => {
    const content = parentId ? replyText[parentId] : commentText[classworkId];
    if (!content || content.trim() === "") return;

    setIsPosting(true);

    if (parentId) {
      setReplyText((prev) => ({ ...prev, [parentId]: "" }));
      setActiveReplyBox(null);
      setExpandedReplies((prev) => ({ ...prev, [parentId]: true }));
    } else {
      setCommentText((prev) => ({ ...prev, [classworkId]: "" }));
      setExpandedComments((prev) => ({ ...prev, [classworkId]: true }));
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
      fetchClassworks();
    } catch (error) {
      console.error(error);
      sileo.error({
        title: "Failed",
        description: "Could not post comment.",
        ...darkToast,
      });
    } finally {
      setIsPosting(false);
    }
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const saveEditedComment = async (commentId) => {
    if (!editContent || editContent.trim() === "") return;
    setIsPosting(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/comments/${commentId}`,
        { content: editContent },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      setEditingCommentId(null);
      setEditContent("");
      fetchClassworks();
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to update comment.",
        ...darkToast,
      });
    } finally {
      setIsPosting(false);
    }
  };

  const deleteComment = async (commentId) => {
    setIsPosting(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      fetchClassworks();
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to delete comment.",
        ...darkToast,
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedItem(null);
    setFormData({
      title: "",
      type: "",
      instruction: "",
      points: "",
      deadline: "",
      link: "",
      form_id: "",
    });
    setNewFiles([]);
    setExistingFiles([]);
    setDeletedFileIds([]);
    setIncludeLink(false);
    setIncludeFiles(false);
    setIncludeForm(false);
    new Offcanvas(document.getElementById("classworkDrawer")).show();
  };

  const openRespondentsModal = (cw) => {
    setSelectedItem(cw);
    setTimeout(() => {
      const modalEl = document.getElementById("respondentsModal");
      if (modalEl) {
        const modal = Modal.getOrCreateInstance(modalEl);
        modal.show();
      }
    }, 100);
  };

  const promptUpdate = (cw) => {
    setOpenDropdownId(null);
    setSelectedItem(cw);
    const modal = new Modal(document.getElementById("updateConfirmModal"));
    modal.show();
  };

  const proceedToUpdateForm = () => {
    setTimeout(() => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      if (selectedItem) {
        openUpdateDrawer(selectedItem);
      }
    }, 400);
  };

  const openUpdateDrawer = (cw) => {
    setDrawerMode("update");
    setFormData({
      title: cw.title,
      type: cw.type,
      instruction: cw.instruction,
      points: cw.points || "",
      deadline: cw.deadline ? cw.deadline.slice(0, 16) : "",
      link: cw.link || "",
      form_id: cw.form_id || "",
    });
    setNewFiles([]);
    setExistingFiles(cw.files || []);
    setDeletedFileIds([]);
    setIncludeLink(!!cw.link);
    setIncludeForm(!!cw.form_id);
    setIncludeFiles(cw.files && cw.files.length > 0);
    new Offcanvas(document.getElementById("classworkDrawer")).show();
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.type || !formData.instruction) {
      sileo.error({
        title: "Incomplete",
        description: "Please fill in all required fields.",
        ...darkToast,
      });
      return;
    }

    Offcanvas.getInstance(document.getElementById("classworkDrawer"))?.hide();
    setTimeout(() => {
      document
        .querySelectorAll(".offcanvas-backdrop")
        .forEach((el) => el.remove());
      executeSubmit();
    }, 300);
  };

  const executeSubmit = async () => {
    setIsLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("type", formData.type);
      data.append("instruction", formData.instruction);
      if (formData.points) data.append("points", formData.points);
      if (formData.deadline) data.append("deadline", formData.deadline);
      if (includeLink && formData.link) data.append("link", formData.link);
      if (includeForm && formData.form_id)
        data.append("form_id", formData.form_id);
      if (includeFiles && newFiles.length > 0)
        newFiles.forEach((file) => data.append("files[]", file));
      if (drawerMode === "update" && deletedFileIds.length > 0)
        deletedFileIds.forEach((id) => data.append("deleted_file_ids[]", id));

      const headers = {
        Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
        "Content-Type": "multipart/form-data",
      };
      if (drawerMode === "create") {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/classrooms/${classroom.id}/classworks`,
          data,
          { headers },
        );
        sileo.success({
          title: "Posted",
          description: "Classwork created.",
          ...darkToast,
        });
      } else {
        data.append("_method", "PUT");
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/classworks/${selectedItem.id}`,
          data,
          { headers },
        );
        sileo.success({
          title: "Updated",
          description: "Classwork changes saved.",
          ...darkToast,
        });
      }
      fetchClassworks();
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: "Failed to save classwork.",
        ...darkToast,
      });
      setIsLoading(false);
    }
  };

  const promptDelete = (cw) => {
    setSelectedItem(cw);
    setOpenDropdownId(null);
    const modal = new Modal(document.getElementById("deleteConfirmModal"));
    modal.show();
  };

  const executeDelete = async () => {
    setIsLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/classworks/${selectedItem.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      sileo.success({
        title: "Deleted",
        description: "Classwork moved to recycle bin.",
        ...darkToast,
      });
      fetchClassworks();
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: "Failed to delete classwork.",
        ...darkToast,
      });
      setIsLoading(false);
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

  const renderCommentBox = (comment, isReply = false, cwId) => {
    const isOwner = comment.user_id === currentUser?.id;

    if (editingCommentId === comment.id) {
      return (
        <div className="bg-light rounded-4 px-3 py-3 w-100 border border-primary-subtle shadow-sm">
          <textarea
            className="form-control mb-2 rounded-3 custom-scrollbar"
            rows="2"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            disabled={isPosting}
          ></textarea>
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-sm btn-light border rounded-3"
              onClick={() => setEditingCommentId(null)}
              disabled={isPosting}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm btn-campusloop rounded-3"
              onClick={() => saveEditedComment(comment.id)}
              disabled={isPosting}
            >
              <i className="bi bi-check-circle-fill me-1"></i> Save Changes
            </button>
          </div>
        </div>
      );
    }

    const isTextExpanded = expandedCommentTexts[comment.id];
    const textLimit = 150;
    const shouldTruncate =
      comment.content && comment.content.length > textLimit;
    const displayContent =
      isTextExpanded || !shouldTruncate
        ? comment.content
        : comment.content.substring(0, textLimit) + "...";

    return (
      <div className="w-100 d-flex flex-column align-items-start">
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
              fontSize: isReply ? "0.75rem" : "0.8rem",
              marginBottom: "2px",
            }}
          >
            {comment.user?.first_name} {comment.user?.last_name}
            {comment.user?.role === "admin" && (
              <i
                className="bi bi-patch-check-fill text-primary ms-1"
                title="Admin"
              ></i>
            )}
          </span>
          <span
            className="text-dark lh-sm d-block"
            style={{
              fontSize: isReply ? "0.85rem" : "0.9rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {renderWithLinks(displayContent)}
          </span>

          {shouldTruncate && (
            <button
              className="btn btn-link p-0 text-decoration-none fw-bold shadow-none mt-1"
              style={{ fontSize: "0.75rem", color: "var(--primary-color)" }}
              onClick={() =>
                setExpandedCommentTexts((prev) => ({
                  ...prev,
                  [comment.id]: !isTextExpanded,
                }))
              }
            >
              {isTextExpanded ? "See Less" : "See More"}
            </button>
          )}
        </div>

        <div className="ms-2 mt-1 d-flex align-items-center gap-3">
          <span
            className="text-muted"
            style={{ fontSize: "0.65rem", fontWeight: "500" }}
          >
            {new Date(comment.created_at).toLocaleString([], {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {!isReply && (
            <button
              className="btn btn-link p-0 text-muted fw-bold text-decoration-none shadow-none"
              style={{ fontSize: "0.7rem" }}
              onClick={() => setActiveReplyBox(comment.id)}
            >
              Reply
            </button>
          )}

          <div className="d-flex align-items-center gap-2 ms-1 ps-2">
            {isOwner && (
              <>
                <button
                  className="btn btn-link p-0 text-primary fw-bold text-decoration-none shadow-none"
                  style={{ fontSize: "0.7rem" }}
                  onClick={() => startEditing(comment)}
                  title="Edit Comment"
                  disabled={isPosting}
                >
                  <i className="bi bi-pencil-square"></i>
                </button>
                <button
                  className="btn btn-link p-0 text-danger fw-bold text-decoration-none shadow-none"
                  style={{ fontSize: "0.7rem" }}
                  onClick={() => deleteComment(comment.id)}
                  title="Delete Comment"
                  disabled={isPosting}
                >
                  <i className="bi bi-trash-fill"></i>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text="Loading Stream..." />
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
              {classworks.length === 0 ? (
                <p className="text-muted small mb-0 text-center py-4">
                  No works posted yet.
                </p>
              ) : (
                <div className="d-flex flex-column gap-1">
                  {classworks.map((task, index) => {
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
                                  className={`badge bg-opacity-10 border ${taskStyle.badge} flex-shrink-0 mt-1 fw-medium shadow-sm`}
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
                        {index !== classworks.length - 1 && (
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

        {/* STREAM */}
        <div className="col-12 col-lg-9 pb-5">
          <div
            className="card border-0 shadow-sm rounded-4 bg-white mb-4 premium-hover-card"
            style={{ cursor: "pointer", border: "1px solid rgba(0,0,0,0.05)" }}
            onClick={openCreateDrawer}
          >
            <div className="card-body p-3 px-4 d-flex align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold flex-shrink-0 shadow-sm"
                  style={{
                    width: "45px",
                    height: "45px",
                    backgroundColor: "var(--primary-color)",
                    fontSize: "1.2rem",
                  }}
                >
                  {userInitial}
                </div>
                <span className="text-muted fw-medium fs-6">
                  Post a new classwork to your class...
                </span>
              </div>
              <div
                className="rounded-circle d-flex justify-content-center align-items-center text-light shadow-sm flex-shrink-0 hover-shadow transition-all"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "var(--secondary-color)",
                }}
              >
                <i className="bi bi-plus-lg fs-5"></i>
              </div>
            </div>
          </div>

          {classworks.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 bg-white mb-4 premium-hover-card">
              <div className="card-body p-5 text-center">
                <i
                  className="bi bi-inbox text-muted d-block mb-3 opacity-50"
                  style={{ fontSize: "4rem" }}
                ></i>
                <h5 className="fw-bold text-dark">No classworks yet.</h5>
                <p className="text-muted small mb-0">
                  Click the area above to post assignments or materials.
                </p>
              </div>
            </div>
          ) : (
            classworks.map((cw) => {
              const typeStyle = getBadgeStyle(cw.type);
              const isMaterial = cw.type === "material";

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
                          <i className={`bi ${getTypeIcon(cw.type)} fs-4`}></i>
                        </div>
                        <div>
                          <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2 flex-wrap">
                            {cw.title}
                            <span
                              className={`badge bg-opacity-10 border fw-medium text-uppercase px-2 py-1 ${typeStyle.badge} shadow-sm`}
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

                      <div className="d-flex align-items-center gap-2 position-relative ms-3">
                        {!isMaterial && (
                          <button
                            className="btn btn-sm btn-campusloop fw-medium rounded-3 px-3 shadow-sm d-none d-md-flex align-items-center"
                            onClick={() => openRespondentsModal(cw)}
                          >
                            <i className="bi bi-people-fill me-2"></i>{" "}
                            Respondents
                          </button>
                        )}
                        <div
                          className="dropdown classwork-card-dropdown"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="btn rounded-circle d-flex align-items-center justify-content-center border-0 shadow-sm transition-all"
                            type="button"
                            onClick={() =>
                              setOpenDropdownId(
                                openDropdownId === cw.id ? null : cw.id,
                              )
                            }
                            style={{
                              width: "35px",
                              height: "35px",
                              backgroundColor:
                                openDropdownId === cw.id
                                  ? "#e9ecef"
                                  : "#f8f9fa",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#e9ecef")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                openDropdownId === cw.id
                                  ? "#e9ecef"
                                  : "#f8f9fa")
                            }
                          >
                            <i className="bi bi-three-dots-vertical text-dark"></i>
                          </button>
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
                            {!isMaterial && (
                              <li className="d-md-none border-bottom">
                                <button
                                  className="dropdown-item py-2 fw-medium text-campusloop"
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    openRespondentsModal(cw);
                                  }}
                                >
                                  <i className="bi bi-people-fill me-2"></i>{" "}
                                  Respondents
                                </button>
                              </li>
                            )}
                            <li>
                              <button
                                className="dropdown-item py-2 fw-medium text-dark"
                                onClick={() => promptUpdate(cw)}
                              >
                                <i
                                  className="bi bi-pencil-square me-2"
                                  style={{ color: "var(--primary-color)" }}
                                ></i>{" "}
                                Update
                              </button>
                            </li>
                            <li>
                              <hr className="dropdown-divider my-1" />
                            </li>
                            <li>
                              <button
                                className="dropdown-item py-2 fw-medium text-danger"
                                onClick={() => promptDelete(cw)}
                              >
                                <i className="bi bi-trash-fill me-2"></i> Delete
                              </button>
                            </li>
                          </ul>
                        </div>
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
                              to={`/teacher/forms/${cw.form.id}`}
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

                      {/* COMMENTS THREAD */}
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
                                    {renderCommentBox(comment, false, cw.id)}
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
                                            {repliesList.map((reply) => (
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
                                                  {renderCommentBox(
                                                    reply,
                                                    true,
                                                    cw.id,
                                                  )}
                                                </div>
                                              </div>
                                            ))}
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
                                          disabled={isPosting}
                                          style={{
                                            resize: "vertical",
                                            fontSize: "0.85rem",
                                            minHeight: "50px",
                                          }}
                                        ></textarea>
                                        <button
                                          className="btn btn-sm btn-campusloop shadow-sm rounded-pill d-flex justify-content-center align-items-center flex-shrink-0 px-3 mt-1"
                                          onClick={() =>
                                            handleCommentSubmit(
                                              cw.id,
                                              comment.id,
                                            )
                                          }
                                          disabled={isPosting}
                                          style={{ height: "32px" }}
                                        >
                                          <i className="bi bi-send-check-fill fs-6"></i>
                                        </button>
                                        <button
                                          className="btn btn-sm btn-light border shadow-sm rounded-circle d-flex justify-content-center align-items-center flex-shrink-0 mt-1 text-muted"
                                          onClick={() =>
                                            setActiveReplyBox(null)
                                          }
                                          disabled={isPosting}
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
                            disabled={isPosting}
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
                            disabled={isPosting}
                            style={{ height: "38px" }}
                          >
                            <i className="bi bi-send-check-fill fs-6 me-2"></i>{" "}
                            <span className="d-none d-sm-inline">Send</span>
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

      <ClassworkFormDrawer
        drawerMode={drawerMode}
        formData={formData}
        handleInputChange={handleInputChange}
        includeLink={includeLink}
        setIncludeLink={setIncludeLink}
        includeFiles={includeFiles}
        setIncludeFiles={setIncludeFiles}
        includeForm={includeForm}
        setIncludeForm={setIncludeForm}
        newFiles={newFiles}
        setNewFiles={setNewFiles}
        existingFiles={existingFiles}
        setExistingFiles={setExistingFiles}
        setDeletedFileIds={setDeletedFileIds}
        handleSubmit={handleSubmit}
        executeDelete={executeDelete}
        selectedItem={selectedItem}
        proceedToUpdateForm={proceedToUpdateForm}
      />

      <RespondentsModal
        selectedItem={selectedItem}
        executeDelete={executeDelete}
      />
    </>
  );
};

export default TabStream;
