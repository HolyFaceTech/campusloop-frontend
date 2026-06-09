import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import { useNavigate } from "react-router-dom";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
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

const StudentHome = () => {
  const [data, setData] = useState({
    user: {},
    announcements: [],
    todos: [],
    classrooms_count: 0,
    today_schedules: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [activeReplyBox, setActiveReplyBox] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [expandedAnnouncements, setExpandedAnnouncements] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});
  const [expandedCommentTexts, setExpandedCommentTexts] = useState({});
  const navigate = useNavigate();

  const userInitial = data.user?.first_name
    ? data.user.first_name.charAt(0).toUpperCase()
    : "S";

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async (showSpinner = true) => {
    if (showSpinner) setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/student/dashboard`,
        getAuthHeader(),
      );
      setData(res.data);
    } catch (error) {
      console.error("Failed to load dashboard data.", error);
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  };

  const submitComment = async (announcementId, parentId = null) => {
    const content = parentId
      ? replyInputs[parentId]
      : commentInputs[announcementId];
    if (!content || content.trim() === "") return;

    setIsPosting(true);
    if (parentId) {
      setReplyInputs({ ...replyInputs, [parentId]: "" });
      setActiveReplyBox(null);
      setExpandedReplies((prev) => ({ ...prev, [parentId]: true }));
    } else {
      setCommentInputs({ ...commentInputs, [announcementId]: "" });
      setExpandedComments((prev) => ({ ...prev, [announcementId]: true }));
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/student/announcements/${announcementId}/comment`,
        { content, parent_id: parentId },
        getAuthHeader(),
      );
      setTimeout(() => fetchDashboard(false), 300);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to post comment.",
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
        `${import.meta.env.VITE_API_BASE_URL}/student/comments/${commentId}`,
        { content: editContent },
        getAuthHeader(),
      );
      setEditingCommentId(null);
      setEditContent("");
      setTimeout(() => fetchDashboard(false), 300);
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
        `${import.meta.env.VITE_API_BASE_URL}/student/comments/${commentId}`,
        getAuthHeader(),
      );
      setTimeout(() => fetchDashboard(false), 300);
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
    if (["jpg", "jpeg", "gif"].includes(ext))
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

  const getTodoIcon = (statusCode) => {
    switch (statusCode) {
      case "missing":
        return "bi-exclamation-circle-fill";
      case "pending":
        return "bi-clock-history";
      case "turned_in":
        return "bi-file-earmark-check-fill";
      case "done":
        return "bi-check-circle-fill";
      case "done_late":
        return "bi-exclamation-triangle-fill";
      case "returned":
        return "bi-arrow-return-left";
      case "graded":
        return "bi-award-fill";
      default:
        return "bi-file-earmark-text";
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

  const renderCommentBox = (comment, isReply = false) => {
    const isOwner = comment.user_id === data.user?.id;

    if (editingCommentId === comment.id) {
      return (
        <div className="bg-light rounded-4 px-3 py-3 w-100 border border-primary-subtle shadow-sm">
          <textarea
            className="form-control mb-2 rounded-3 custom-scrollbar"
            rows="2"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          ></textarea>
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-sm btn-light border rounded-3"
              onClick={() => setEditingCommentId(null)}
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
            width: "fit-content",
            maxWidth: "100%",
            border: "1px solid #f0f0f0",
          }}
        >
          <span
            className="fw-bold text-dark d-block"
            style={{
              fontSize: isReply ? "0.75rem" : "0.8rem",
              marginBottom: "1px",
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

          {isOwner && (
            <div className="d-flex align-items-center gap-2 ms-1 ps-2">
              <button
                className="btn btn-link p-0 text-primary fw-bold text-decoration-none shadow-none"
                onClick={() => startEditing(comment)}
                title="Edit Comment"
                style={{ fontSize: "0.8rem" }}
              >
                <i className="bi bi-pencil-square"></i>
              </button>
              <button
                className="btn btn-link p-0 text-danger fw-bold text-decoration-none shadow-none"
                onClick={() => deleteComment(comment.id)}
                title="Delete Comment"
                style={{ fontSize: "0.8rem" }}
              >
                <i className="bi bi-trash-fill"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid px-0">
      <GlobalSpinner isLoading={isLoading} text="Loading your home page..." />

      <div className="row g-4">
        <div className="col-12 col-lg-8 d-flex flex-column gap-4">
          <div
            className="card border-0 shadow-sm rounded-4 overflow-hidden position-relative premium-hover-card"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-color) 0%, #4a5435 100%)",
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

            <div className="card-body p-4 p-md-5 position-relative z-1 d-flex align-items-center">
              <div className="text-white w-75">
                <span
                  className="badge bg-white text-dark bg-opacity-25 px-2 py-1 fw-semibold shadow-sm mb-2 text-uppercase"
                  style={{ letterSpacing: "1px" }}
                >
                  <i className="bi bi-person-video me-1"></i> Student Home Page
                </span>
                <h2 className="fw-bold mb-2 display-6 text-white">
                  Welcome back, {data.user.first_name}!{" "}
                  <span className="wave-icon">👋</span>
                </h2>
                <p
                  className="mb-0 text-white text-opacity-75"
                  style={{ fontSize: "1rem" }}
                >
                  Ready to learn? Check your tasks, schedules, and recent
                  announcements below.
                </p>
              </div>
              <img
                src="/images/student.svg"
                alt="Student Illustration"
                className="position-absolute d-none d-sm-block"
                style={{
                  right: "2%",
                  bottom: "-15px",
                  height: "170px",
                  filter: "drop-shadow(-5px 10px 10px rgba(0,0,0,0.3))",
                }}
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          </div>

          {/* ANNOUNCEMENTS */}
          {data.announcements.length > 0 ? (
            data.announcements.map((announcement) => {
              const statusColor =
                announcement.status === "Done" ? "#6c757d" : "#198754";
              const isContentExpanded = expandedAnnouncements[announcement.id];
              const contentLimit = 250;
              const shouldTruncateContent =
                announcement.content &&
                announcement.content.length > contentLimit;
              const displayContent =
                isContentExpanded || !shouldTruncateContent
                  ? announcement.content
                  : announcement.content.substring(0, contentLimit) + "...";

              const isCommentsExpanded = expandedComments[announcement.id];
              const commentsList = announcement.comments || [];
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
                  key={announcement.id}
                  className="card border-0 shadow-sm bg-white mb-2 position-relative premium-hover-card"
                  style={{
                    borderRadius: "1rem",
                    borderLeft: `5px solid ${statusColor}`,
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
                            backgroundColor: statusColor,
                            color: "white",
                          }}
                        >
                          <i className="bi bi-megaphone-fill fs-4"></i>
                        </div>
                        <div>
                          <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2 flex-wrap">
                            {announcement.title}
                          </h4>
                          <div className="text-muted small fw-medium d-flex flex-wrap align-items-center gap-3 mt-1">
                            <span>
                              <i className="bi bi-calendar-plus me-1"></i>{" "}
                              Posted:{" "}
                              {new Date(
                                announcement.publish_from,
                              ).toLocaleString([], {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ps-0 ps-sm-5 ms-sm-3 mt-2">
                      <p
                        className={`text-dark lh-base ${shouldTruncateContent && !isContentExpanded ? "mb-1" : "mb-4"}`}
                        style={{ whiteSpace: "pre-line", fontSize: "0.95rem" }}
                      >
                        {displayContent}
                      </p>

                      {shouldTruncateContent && (
                        <button
                          className="btn btn-link p-0 text-decoration-none mb-4 fw-bold shadow-none"
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--primary-color)",
                          }}
                          onClick={() =>
                            setExpandedAnnouncements((prev) => ({
                              ...prev,
                              [announcement.id]: !isContentExpanded,
                            }))
                          }
                        >
                          {isContentExpanded ? "See Less" : "See More"}
                        </button>
                      )}

                      <div className="d-flex flex-column gap-2 mb-3">
                        {announcement.link && (
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
                                {announcement.link}
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
                              href={announcement.link}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-sm btn-campusloop ms-3 rounded-3 shadow-sm d-flex justify-content-center align-items-center flex-shrink-0"
                              style={{ width: "35px", height: "35px" }}
                            >
                              <i className="bi bi-box-arrow-up-right"></i>
                            </a>
                          </div>
                        )}
                        {announcement.files &&
                          announcement.files.length > 0 &&
                          announcement.files.map((file) => {
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
                                <a
                                  href={`${resolveFileUrl(file.path)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-sm btn-campusloop ms-3 rounded-3 shadow-sm d-flex justify-content-center align-items-center flex-shrink-0"
                                  style={{ width: "35px", height: "35px" }}
                                >
                                  <i className="bi bi-eye-fill"></i>
                                </a>
                              </div>
                            );
                          })}
                      </div>

                      {/* COMMENTS THREAD */}
                      <div className="border-top pt-3 mt-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span className="fw-bold text-dark small d-flex align-items-center gap-2">
                            <i className="bi bi-chat-text text-muted fs-5"></i>{" "}
                            Comments
                          </span>
                          <span className="text-muted small">
                            {announcement.comments
                              ? announcement.comments.reduce(
                                  (total, comment) => {
                                    return (
                                      total +
                                      1 +
                                      (comment.replies
                                        ? comment.replies.length
                                        : 0)
                                    );
                                  },
                                  0,
                                )
                              : 0}{" "}
                            comments
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
                                    {renderCommentBox(comment, false)}
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
                                          value={replyInputs[comment.id] || ""}
                                          onChange={(e) =>
                                            setReplyInputs({
                                              ...replyInputs,
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
                                          className="btn btn-sm btn-campusloop shadow-sm rounded-pill px-3 mt-1"
                                          onClick={() =>
                                            submitComment(
                                              announcement.id,
                                              comment.id,
                                            )
                                          }
                                          disabled={isPosting}
                                          style={{ height: "32px" }}
                                        >
                                          <i className="bi bi-send-check-fill fs-6"></i>
                                        </button>
                                        <button
                                          className="btn btn-sm btn-light border shadow-sm rounded-circle mt-1 ms-1 text-muted"
                                          onClick={() =>
                                            setActiveReplyBox(null)
                                          }
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
                                    [announcement.id]: true,
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
                                    [announcement.id]: false,
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
                            value={commentInputs[announcement.id] || ""}
                            onChange={(e) =>
                              setCommentInputs({
                                ...commentInputs,
                                [announcement.id]: e.target.value,
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
                            onClick={() => submitComment(announcement.id)}
                            disabled={isPosting}
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
          ) : (
            <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
              <i
                className="bi bi-megaphone text-muted d-block mb-3"
                style={{ fontSize: "3rem", opacity: 0.5 }}
              ></i>
              <h5 className="fw-bold text-dark">No announcements yet.</h5>
              <p className="text-muted small mb-0">
                Check back later for updates from the administration.
              </p>
            </div>
          )}
        </div>

        <div className="col-12 col-lg-4 mb-4 mb-lg-0" style={{ zIndex: 10 }}>
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 mb-3 d-flex flex-row align-items-center justify-content-between premium-hover-card">
            <div>
              <span
                className="d-block text-muted mb-1 fw-bold text-uppercase"
                style={{ fontSize: "0.75rem", letterSpacing: "1px" }}
              >
                Enrolled Classes
              </span>
              <h2 className="fw-bolder text-primary mb-0 display-5">
                {data.classrooms_count || 0}
              </h2>
            </div>
            <div
              className="rounded-4 bg-primary border border-primary-subtle bg-opacity-10 d-flex justify-content-center align-items-center flex-shrink-0 shadwo-sm"
              style={{ width: "60px", height: "60px" }}
            >
              <i className="bi bi-journal-bookmark-fill text-primary fs-2"></i>
            </div>
          </div>

          {/* TODAY'S SCHEDULES CARD */}
          <div className="card border-0 shadow-sm rounded-4 bg-white mb-4 premium-hover-card">
            <div className="card-header bg-light border-bottom p-3 d-flex justify-content-between align-items-center rounded-top-4">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center">
                <i
                  className="bi bi-calendar-event  fs-5 me-2"
                  style={{ color: "var(--bs-purple, #6f42c1)" }}
                ></i>{" "}
                Today's Schedules
              </h6>
              <span
                className="badge rounded-3 shadow-sm fw-medium"
                style={{ background: "var(--bs-purple, #6f42c1)" }}
              >
                {data.today_schedules?.length || 0}
              </span>
            </div>
            <div
              className="card-body p-2 custom-scrollbar"
              style={{ maxHeight: "250px", overflowY: "auto" }}
            >
              {data.today_schedules?.length === 0 ? (
                <div className="p-4 text-center">
                  <i
                    className="bi bi-calendar-x text-success opacity-50 d-block mb-2"
                    style={{ fontSize: "2.5rem" }}
                  ></i>
                  <span className="d-block fw-bold text-dark mb-1">
                    Free Day!
                  </span>
                  <span className="small text-muted">
                    You have no classes or deadlines today.
                  </span>
                </div>
              ) : (
                <div className="d-flex flex-column gap-1">
                  {data.today_schedules?.map((sched) => (
                    <div
                      key={sched.id}
                      className="p-2 rounded-3 hover-bg-light transition-all"
                      style={{
                        cursor: "pointer",
                        borderLeft: "3px solid transparent",
                      }}
                      onClick={() =>
                        navigate(
                          `/student/classrooms/${sched.classroom_id}/stream`,
                        )
                      }
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderLeftColor =
                          sched.type === "deadline"
                            ? "var(--bs-danger)"
                            : "var(--bs-purple, #6f42c1)";
                        e.currentTarget.style.backgroundColor =
                          "rgba(0,0,0,0.02)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderLeftColor = "transparent";
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div className="d-flex align-items-start gap-2">
                        <div
                          className="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0 mt-1"
                          style={{
                            width: "32px",
                            height: "32px",
                            backgroundColor:
                              sched.type === "deadline"
                                ? "var(--bs-danger)"
                                : "#6f42c1",
                            color: "white",
                          }}
                        >
                          <i
                            className={
                              sched.type === "deadline"
                                ? "bi bi-exclamation-circle"
                                : "bi bi-journal-text"
                            }
                            style={{ fontSize: "0.85rem" }}
                          ></i>
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <span
                            className="small fw-bold text-dark text-truncate d-block"
                            title={sched.title}
                          >
                            {sched.title}
                          </span>
                          <div
                            className="text-muted"
                            style={{ fontSize: "0.7rem" }}
                          >
                            <i className="bi bi-clock me-1"></i> {sched.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* STUDENT TO-DO LIST */}
          <div
            className="card border-0 shadow-sm rounded-4 bg-white sticky-top premium-hover-card"
            style={{ top: "100px" }}
          >
            <div className="card-header bg-light border-bottom p-4 rounded-top-4">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center justify-content-between">
                <span>
                  <i className="bi bi-list-task text-danger fs-5 me-2"></i>{" "}
                  To-Do List
                </span>
                <span className="badge bg-danger rounded-3 shadow-sm fw-medium">
                  {data.todos.length}
                </span>
              </h6>
            </div>
            <div
              className="card-body p-2 custom-scrollbar"
              style={{ maxHeight: "350px", overflowY: "auto" }}
            >
              {data.todos.length === 0 ? (
                <div className="p-4 text-center">
                  <i
                    className="bi bi-check2-all text-success opacity-50 d-block mb-2"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <span className="d-block fw-bold text-dark mb-1">
                    Woohoo, no work due in soon!
                  </span>
                  <span className="small text-muted">
                    Take a break and relax.
                  </span>
                </div>
              ) : (
                <div className="d-flex flex-column gap-1">
                  {data.todos.map((todo, index) => (
                    <React.Fragment key={todo.id}>
                      <div
                        className="p-2 rounded-3 hover-bg-light transition-all"
                        style={{
                          cursor: "pointer",
                          borderLeft: "3px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderLeftColor = `var(--bs-${todo.indicator})`;
                          e.currentTarget.style.backgroundColor =
                            "rgba(0,0,0,0.03)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderLeftColor = "transparent";
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                        onClick={() =>
                          navigate(
                            `/student/classrooms/${todo.classroom_id}/stream`,
                          )
                        }
                      >
                        <div className="d-flex align-items-start gap-2">
                          <div
                            className="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0 shadow-sm mt-1"
                            style={{
                              width: "32px",
                              height: "32px",
                              backgroundColor: `var(--bs-${todo.indicator})`,
                              color: "white",
                            }}
                          >
                            <i
                              className={getTodoIcon(todo.status_code)}
                              style={{ fontSize: "0.85rem" }}
                            ></i>
                          </div>
                          <div className="flex-grow-1 overflow-hidden">
                            <div className="d-flex justify-content-between align-items-start mb-1 gap-2">
                              <span
                                className="small fw-bold text-dark text-truncate d-block"
                                title={todo.title}
                              >
                                {todo.title}
                              </span>
                              <span
                                className={`badge bg-${todo.indicator} bg-opacity-10 text-${todo.indicator} fw-medium border border-${todo.indicator}-subtle px-2 py-1 flex-shrink-0 mt-1 shadow-sm`}
                                style={{ fontSize: "0.55rem" }}
                              >
                                {todo.label}
                              </span>
                            </div>
                            <div
                              className="text-muted"
                              style={{ fontSize: "0.7rem" }}
                            >
                              <span>
                                <i className="bi bi-easel me-1"></i>{" "}
                                {todo.subject_code}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {index !== data.todos.length - 1 && (
                        <hr className="my-1 border-secondary opacity-10 mx-2" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
