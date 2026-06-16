import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import { openFileUrl, resolveStoragePath } from '../../utils/fileUrl';

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const AnnouncementViewModal = ({
  announcement,
  currentUser,
  fetchAnnouncements,
}) => {
  const handleViewFile = (filePath) => {
    if (!openFileUrl(filePath)) {
      sileo.error({
        title: "Cannot Open File",
        description:
          "The file link is missing or invalid. Try re-uploading the attachment.",
        ...darkToast,
      });
    }
  };

  const [commentInput, setCommentInput] = useState("");
  const [replyInputs, setReplyInputs] = useState({});
  const [activeReplyBox, setActiveReplyBox] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [expandedCommentTexts, setExpandedCommentTexts] = useState({});
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});

  useEffect(() => {
    setIsContentExpanded(false);
    setIsCommentsExpanded(false);
    setExpandedCommentTexts({});
    setExpandedReplies({});
    setCommentInput("");
    setReplyInputs({});
    setActiveReplyBox(null);
  }, [announcement?.id]);

  if (!announcement) return null;

  const userInitial = currentUser?.first_name
    ? currentUser.first_name.charAt(0).toUpperCase()
    : "A";
  const statusColor = announcement.status === "Done" ? "#6c757d" : "#198754";
  const statusBg =
    announcement.status === "Done" ? "bg-secondary" : "bg-success";
  const statusBorder =
    announcement.status === "Done" ? "border-secondary" : "border-success";
  const statusText =
    announcement.status === "Done" ? "text-secondary" : "text-success";

  const submitComment = async (parentId = null) => {
    const content = parentId ? replyInputs[parentId] : commentInput;
    if (!content || content.trim() === "") return;

    setIsPosting(true);
    if (parentId) {
      setReplyInputs({ ...replyInputs, [parentId]: "" });
      setActiveReplyBox(null);
      setExpandedReplies((prev) => ({ ...prev, [parentId]: true }));
    } else {
      setCommentInput("");
      setIsCommentsExpanded(true);
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/admin/announcements/${announcement.id}/comments`,
        { content, parent_id: parentId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      setTimeout(() => fetchAnnouncements(false), 300);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to post comment.";
      sileo.error({ title: "Failed", description: errorMsg, ...darkToast });
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
        `${import.meta.env.VITE_API_BASE_URL}/admin/announcements/comments/${commentId}`,
        { content: editContent },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      setEditingCommentId(null);
      setEditContent("");
      setTimeout(() => fetchAnnouncements(false), 300);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Could not update comment.";
      sileo.error({ title: "Failed", description: errorMsg, ...darkToast });
    } finally {
      setIsPosting(false);
    }
  };

  const deleteComment = async (commentId) => {
    setIsPosting(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/admin/announcements/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      setTimeout(() => fetchAnnouncements(false), 300);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Could not delete comment.";
      sileo.error({ title: "Failed", description: errorMsg, ...darkToast });
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
    const isOwner = comment.user_id === currentUser?.id;
    const canDelete = true;

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

          <div className="d-flex align-items-center gap-2 ms-1 ps-2">
            {isOwner && (
              <button
                className="btn btn-link p-0 text-primary fw-bold text-decoration-none shadow-none"
                style={{ fontSize: "0.7rem" }}
                onClick={() => startEditing(comment)}
                title="Edit Comment"
              >
                <i className="bi bi-pencil-square"></i>
              </button>
            )}
            {canDelete && (
              <button
                className="btn btn-link p-0 text-danger fw-bold text-decoration-none shadow-none"
                style={{ fontSize: "0.7rem" }}
                onClick={() => deleteComment(comment.id)}
                title="Delete Comment"
              >
                <i className="bi bi-trash-fill"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const rawAnnouncementContent = announcement.content || "";
  const contentLimit = 250;
  const shouldTruncateContent = rawAnnouncementContent.length > contentLimit;
  const displayAnnouncementContent =
    isContentExpanded || !shouldTruncateContent
      ? rawAnnouncementContent
      : rawAnnouncementContent.substring(0, contentLimit) + "...";

  const commentsList = announcement.comments || [];
  const visibleComments = isCommentsExpanded
    ? commentsList
    : commentsList.slice(0, 2);
  const hasMoreComments = commentsList.length > 2;

  const totalCommentsAndReplies = commentsList.reduce((total, comment) => {
    return total + 1 + (comment.replies ? comment.replies.length : 0);
  }, 0);

  return (
    <div
      className="modal fade"
      id="announcementViewModal"
      tabIndex="-1"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-light">
          <div
            className="modal-header border-bottom pb-3 z-1"
            style={{ backgroundColor: "var(--accent-color)" }}
          >
            <h5
              className="modal-title fw-bold"
              style={{ color: "var(--primary-color)" }}
            >
              <i className="bi bi-record-circle me-2"></i>
              Announcement
            </h5>
            <button
              type="button"
              className="btn-close shadow-none"
              data-bs-dismiss="modal"
            ></button>
          </div>

          <div className="modal-body p-0 custom-scrollbar">
            <div className="bg-white position-relative m-3 m-md-4 p-4 p-md-5 rounded-4 shadow-sm">
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
                        <i className="bi bi-calendar-plus me-1"></i> Posted:{" "}
                        {new Date(announcement.publish_from).toLocaleString(
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
                    </div>
                  </div>
                </div>
              </div>

              <div className="ps-0 ps-sm-5 ms-sm-3 mt-2">
                <p
                  className={`text-dark lh-base ${shouldTruncateContent && !isContentExpanded ? "mb-1" : "mb-4"}`}
                  style={{ whiteSpace: "pre-line", fontSize: "0.95rem" }}
                >
                  {displayAnnouncementContent}
                </p>

                {shouldTruncateContent && (
                  <button
                    className="btn btn-link p-0 text-decoration-none mb-4 fw-bold shadow-none"
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--primary-color)",
                    }}
                    onClick={() => setIsContentExpanded(!isContentExpanded)}
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
                      const fileDetails = getFileDetails(file.file_extension);
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
                            <i className={`bi ${fileDetails.icon} fs-4`}></i>
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
                            onClick={() => handleViewFile(file.path)}
                            className="btn btn-sm btn-campusloop ms-3 rounded-3 shadow-sm d-flex justify-content-center align-items-center flex-shrink-0"
                            style={{ width: "35px", height: "35px" }}
                            title="View file"
                          >
                            <i className="bi bi-eye-fill"></i>
                          </button>
                        </div>
                      );
                    })}
                </div>

                <div className="border-top pt-3 mt-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="fw-bold text-dark small d-flex align-items-center gap-2">
                      <i className="bi bi-chat-text text-muted fs-5"></i>{" "}
                      Comments
                    </span>
                    <span className="text-muted small">
                      {totalCommentsAndReplies} comments
                    </span>
                  </div>

                  {commentsList.length > 0 && (
                    <div
                      className="d-flex flex-column gap-3 mb-4 custom-scrollbar"
                      style={{ paddingRight: "10px" }}
                    >
                      {visibleComments.map((comment) => {
                        const isRepliesExpanded = expandedReplies[comment.id];
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
                                            {reply.user?.first_name?.charAt(0)}
                                          </div>
                                          <div className="flex-grow-1">
                                            {renderCommentBox(reply, true)}
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
                                      backgroundColor: "var(--primary-color)",
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
                                    onClick={() => submitComment(comment.id)}
                                    disabled={isPosting}
                                    style={{ height: "32px" }}
                                  >
                                    <i className="bi bi-send-check-fill fs-6"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-light border shadow-sm rounded-circle mt-1 ms-1 text-muted"
                                    onClick={() => setActiveReplyBox(null)}
                                    style={{ width: "32px", height: "32px" }}
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
                          onClick={() => setIsCommentsExpanded(true)}
                        >
                          View all {totalCommentsAndReplies} comments
                        </button>
                      )}
                      {hasMoreComments && isCommentsExpanded && (
                        <button
                          className="btn btn-link text-muted text-decoration-none text-start p-0 fw-medium shadow-none mt-1"
                          style={{ fontSize: "0.85rem" }}
                          onClick={() => setIsCommentsExpanded(false)}
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
                      placeholder="Add a comment as Admin..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      style={{
                        resize: "vertical",
                        fontSize: "0.9rem",
                        minHeight: "60px",
                      }}
                    ></textarea>
                    <button
                      className="btn btn-campusloop shadow-sm rounded-pill d-flex justify-content-center align-items-center flex-shrink-0 px-4 mt-1"
                      title="Post Comment"
                      onClick={() => submitComment(null)}
                      style={{ height: "38px" }}
                      disabled={isPosting}
                    >
                      <i className="bi bi-send-check-fill fs-6 me-2"></i> Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer border-top bg-light p-3 d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
              data-bs-dismiss="modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementViewModal;
