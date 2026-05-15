import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { sileo } from "sileo";
import { Modal } from "bootstrap";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import FormBuilder from "./FormBuilder";
import ReviewSubmissionModal from "./ReviewSubmissionModal";

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

const FormInside = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [respondents, setRespondents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading Form Details...");
  const [activeTab, setActiveTab] = useState("questionnaire");

  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedRespondent, setSelectedRespondent] = useState(null);

  useEffect(() => {
    fetchFormData();
  }, [id]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (id) fetchRespondents();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [id, searchQuery, currentPage, entriesPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage]);

  const fetchFormData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/forms/${id}`,
        getAuthHeader(),
      );
      setForm(res.data);
    } catch (error) {
      console.error("Error fetching form", error);
    }
  };

  const fetchRespondents = async () => {
    if (activeTab === "respondents") {
      setIsLoading(true);
      setLoadingText("Loading respondents...");
    }
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/forms/${id}/respondents`,
        {
          ...getAuthHeader(),
          params: {
            search: searchQuery,
            page: currentPage,
            entries: entriesPerPage,
          },
        },
      );
      setRespondents(res.data.data || []);
      setTotalPages(res.data.last_page || 1);
      setTotalRecords(res.data.total || 0);
    } catch (error) {
      console.error("Error fetching respondents", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openReviewModal = (respondent) => {
    setSelectedRespondent(respondent);
    setTimeout(() => {
      const modalEl = document.getElementById("reviewSubmissionModal");
      if (modalEl) {
        const modal = Modal.getOrCreateInstance(modalEl);
        modal.show();
      }
    }, 150);
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

  if (isLoading && !form)
    return <GlobalSpinner isLoading={true} text="Loading Form Details..." />;

  const groupedQuestions = [];
  const existingSections = [];

  if (form?.questions) {
    form.questions.forEach((q) => {
      const secName = q.section || "";
      if (!existingSections.includes(secName) && q.section)
        existingSections.push(secName);

      let group = groupedQuestions.find((g) => g.sectionName === secName);
      if (!group) {
        group = {
          sectionName: secName,
          instruction: q.instruction || "",
          questions: [],
        };
        groupedQuestions.push(group);
      } else {
        if (!group.instruction && q.instruction) {
          group.instruction = q.instruction;
        }
      }
      group.questions.push(q);
    });
  }

  const totalPoints = form?.questions
    ? form.questions.reduce((sum, q) => sum + q.points, 0)
    : 0;

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="card bg-white border-0 shadow-sm rounded-4 mb-4 overflow-hidden position-relative">
        <div className="card-body p-4 p-md-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-4">
            <div className="flex-grow-1" style={{ maxWidth: "800px" }}>
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  className="rounded-circle text-white d-flex justify-content-center align-items-center shadow-sm flex-shrink-0"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "var(--primary-color)",
                  }}
                >
                  <i className="bi bi-card-checklist fs-4"></i>
                </div>
                <h2
                  className="fw-bolder text-dark mb-0"
                  style={{ letterSpacing: "-0.5px" }}
                >
                  {form?.name}
                </h2>
              </div>
              <p
                className="text-muted mt-3 mb-0"
                style={{
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                }}
              >
                {form?.instruction}
              </p>
            </div>

            <button
              onClick={() => navigate(`/teacher/forms/${form?.id}/builder`)}
              className="btn btn-campusloop shadow-sm px-4 py-2 rounded-3 d-flex align-items-center gap-2 fw-bold flex-shrink-0 justify-content-center"
            >
              <i className="bi bi-pencil-square"></i> Open Builder
            </button>
          </div>

          <hr className="opacity-10 my-4" />

          <div className="d-flex flex-wrap justify-content-center gap-4 gap-md-4 align-items-center bg-light p-3 rounded-4 border border-light-subtle">
            <div className="d-flex align-items-center gap-3 pe-md-4 border-end-md">
              <div
                className="rounded-circle bg-white shadow-sm d-flex justify-content-center align-items-center flex-shrink-0"
                style={{ width: "40px", height: "40px" }}
              >
                <i className="bi bi-hourglass-split text-warning fs-5"></i>
              </div>
              <div>
                <span
                  className="d-block small text-muted fw-bold mb-0"
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Time Limit
                </span>
                <span className="d-block text-dark small fw-bolder">
                  {form?.timer > 0 ? `${form.timer} Minutes` : "No Timer"}
                </span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3 pe-md-4 border-end-md">
              <div
                className="rounded-circle bg-white shadow-sm d-flex justify-content-center align-items-center flex-shrink-0"
                style={{ width: "40px", height: "40px" }}
              >
                <i
                  className={`bi ${form?.is_focus_mode ? "bi-eye-slash-fill text-danger" : "bi-shield-check text-success"} fs-5`}
                ></i>
              </div>
              <div>
                <span
                  className="d-block small text-muted fw-bold mb-0"
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Security Mode
                </span>
                {form?.is_focus_mode ? (
                  <span className="badge bg-danger bg-opacity-10 text-danger fw-medium border border-danger border-opacity-25 mt-1 px-2 py-1">
                    Focus Mode ON
                  </span>
                ) : (
                  <span className="badge bg-success bg-opacity-10 text-success fw-medium border border-success border-opacity-25 mt-1 px-2 py-1">
                    Normal
                  </span>
                )}
              </div>
            </div>

            <div className="d-flex align-items-center gap-3 pe-md-4 border-end-md">
              <div
                className="rounded-circle bg-white shadow-sm d-flex justify-content-center align-items-center flex-shrink-0"
                style={{ width: "40px", height: "40px" }}
              >
                <i
                  className={`bi bi-shuffle ${form?.is_shuffle_questions ? "text-primary" : "text-muted"} fs-5`}
                ></i>
              </div>
              <div>
                <span
                  className="d-block small text-muted fw-bold mb-0"
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Question Order
                </span>
                {form?.is_shuffle_questions ? (
                  <span className="badge bg-primary bg-opacity-10 text-primary fw-medium border border-primary border-opacity-25 mt-1 px-2 py-1">
                    Shuffled
                  </span>
                ) : (
                  <span className="badge bg-secondary bg-opacity-10 text-secondary fw-medium border border-secondary border-opacity-25 mt-1 px-2 py-1">
                    Default Order
                  </span>
                )}
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle bg-white shadow-sm d-flex justify-content-center align-items-center flex-shrink-0"
                style={{ width: "40px", height: "40px" }}
              >
                <i className="bi bi-star-fill text-info fs-5"></i>
              </div>
              <div>
                <span
                  className="d-block small text-muted fw-bold mb-0"
                  style={{
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Total Points
                </span>
                <span className="d-block text-dark small fw-bolder">
                  {totalPoints} Pts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center gap-4 border-bottom mb-4 px-3 mt-2">
        <button
          className={`btn rounded-0 pb-3 px-3 border-0 d-flex align-items-center gap-2 transition-all ${activeTab === "questionnaire" ? "fw-bolder" : "text-muted fw-medium"}`}
          style={{
            borderBottom:
              activeTab === "questionnaire"
                ? "3px solid var(--primary-color)"
                : "3px solid transparent",
            color: activeTab === "questionnaire" ? "var(--primary-color)" : "",
            backgroundColor: "transparent",
            boxShadow: "none",
          }}
          onClick={() => setActiveTab("questionnaire")}
        >
          <i className="bi bi-card-list"></i>{" "}
          <span className="d-none d-sm-inline">Questionnaire</span>
        </button>
        <button
          className={`btn rounded-0 pb-3 px-3 border-0 d-flex align-items-center gap-2 transition-all ${activeTab === "respondents" ? "fw-bolder" : "text-muted fw-medium"}`}
          style={{
            borderBottom:
              activeTab === "respondents"
                ? "3px solid var(--primary-color)"
                : "3px solid transparent",
            color: activeTab === "respondents" ? "var(--primary-color)" : "",
            backgroundColor: "transparent",
            boxShadow: "none",
          }}
          onClick={() => setActiveTab("respondents")}
        >
          <i className="bi bi-people-fill"></i>{" "}
          <span className="d-none d-sm-inline">Respondents</span>
          <span
            className="badge rounded-3 shadow-sm ms-1 fw-medium"
            style={{
              backgroundColor:
                activeTab === "respondents"
                  ? "var(--primary-color)"
                  : "#e9ecef",
              color: activeTab === "respondents" ? "white" : "#6c757d",
            }}
          >
            {totalRecords}
          </span>
        </button>
      </div>

      {activeTab === "questionnaire" && (
        <div className="mx-auto pb-4" style={{ maxWidth: "770px" }}>
          {groupedQuestions.length > 0 ? (
            groupedQuestions.map((group, gIndex) => (
              <div className="mb-5 pb-2" key={gIndex}>
                {group.sectionName !== "" && (
                  <div className="position-relative mt-4 mb-3">
                    <div
                      className="px-3 py-1 text-white fw-medium shadow-sm"
                      style={{
                        backgroundColor: "var(--primary-color)",
                        display: "inline-block",
                        borderTopLeftRadius: "8px",
                        borderTopRightRadius: "8px",
                        fontSize: "0.85rem",
                      }}
                    >
                      Section {gIndex + 1} of {groupedQuestions.length}
                    </div>
                    <div
                      className="card bg-white shadow-sm position-relative"
                      style={{
                        border: "1px solid #e0e0e0",
                        borderTopLeftRadius: "0",
                        borderTopRightRadius: "8px",
                        borderBottomLeftRadius: "8px",
                        borderBottomRightRadius: "8px",
                      }}
                    >
                      <div className="card-body p-4 p-md-4">
                        <h4
                          className="fw-normal text-dark mb-2"
                          style={{ fontSize: "1.5rem" }}
                        >
                          {group.sectionName}
                        </h4>
                        {group.instruction && (
                          <p
                            className="text-muted small mb-0"
                            style={{ whiteSpace: "pre-wrap" }}
                          >
                            {group.instruction}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <div className="d-flex flex-column gap-3 mt-3">
                  {group.questions.map((q, index) => (
                    <div
                      className="card bg-white shadow-sm position-relative transition-all"
                      style={{
                        border: "1px solid #e0e0e0",
                        borderLeft: "6px solid var(--primary-color)",
                        borderRadius: "8px",
                      }}
                      key={q.id}
                    >
                      <div className="card-body p-4 pt-4 pb-4">
                        <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                          <div className="d-flex gap-2 align-items-start flex-grow-1">
                            <span className="fw-normal text-dark mt-1">
                              {index + 1}.
                            </span>
                            <h5
                              className="fw-normal text-dark mb-0"
                              style={{ fontSize: "1.1rem", lineHeight: "1.5" }}
                            >
                              {q.text}
                            </h5>
                          </div>
                          <div className="text-end flex-shrink-0 mt-1">
                            <span
                              className="text-muted fw-medium"
                              style={{ fontSize: "0.85rem" }}
                            >
                              {q.points} pt{q.points > 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>

                        <div className="ps-4 mb-2">
                          {q.type === "multiple_choice" && q.choices && (
                            <div className="d-flex flex-column gap-3">
                              {q.choices.map((choice, cIndex) => (
                                <div
                                  key={cIndex}
                                  className="d-flex align-items-center gap-3"
                                >
                                  <i
                                    className={`bi ${q.correct_answer === choice ? "bi-check-circle-fill text-success" : "bi-circle text-muted opacity-50"} fs-5`}
                                  ></i>
                                  <span
                                    className={`fw-normal ${q.correct_answer === choice ? "text-success fw-bold" : "text-dark"}`}
                                    style={{ fontSize: "0.95rem" }}
                                  >
                                    {choice}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          {q.type === "short_answer" && (
                            <div
                              className="d-flex align-items-center gap-3 border-bottom pb-2"
                              style={{ maxWidth: "400px" }}
                            >
                              <span className="text-muted">Answer:</span>
                              <span className="fw-bold text-success">
                                {q.correct_answer}
                              </span>
                              <i className="bi bi-check-circle-fill text-success ms-auto"></i>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 mt-4">
              <div
                className="card bg-white border border-light-subtle shadow-sm text-center py-5"
                style={{ borderRadius: "8px" }}
              >
                <div className="card-body py-5">
                  <div
                    className="rounded-circle bg-light d-flex justify-content-center align-items-center mx-auto mb-4"
                    style={{ width: "90px", height: "90px" }}
                  >
                    <i
                      className="bi bi-ui-radios text-muted opacity-50"
                      style={{ fontSize: "3rem" }}
                    ></i>
                  </div>
                  <h4 className="fw-normal text-dark mb-3">
                    No questions added yet
                  </h4>
                  <p
                    className="text-muted small mb-4"
                    style={{ maxWidth: "400px", margin: "0 auto" }}
                  >
                    Your form is currently empty. Open the Question Builder to
                    start adding sections and questions.
                  </p>
                  <button
                    onClick={() =>
                      navigate(`/teacher/forms/${form?.id}/builder`)
                    }
                    className="btn shadow-sm fw-medium px-4 py-2 rounded-3 text-white d-inline-flex align-items-center gap-2"
                    style={{ backgroundColor: "var(--primary-color)" }}
                  >
                    <i className="bi bi-magic me-2"></i> Go to Builder
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "respondents" && (
        <>
          <div className="card border-0 shadow-sm rounded-4 mb-3 bg-white overflow-hidden">
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
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
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
                    placeholder="Search Name, Email, or LRN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
            <div className="table-responsive custom-scrollbar">
              <table
                className="table table-summer align-middle mb-0"
                style={{ minWidth: "950px" }}
              >
                <thead className="bg-light sticky-top" style={{ zIndex: 10 }}>
                  <tr>
                    <th
                      className="text-center ps-4"
                      style={{ width: "60px", borderTop: "none" }}
                    >
                      #
                    </th>
                    <th style={{ borderTop: "none" }}>Student Details</th>
                    <th style={{ borderTop: "none" }}>LRN</th>
                    <th style={{ borderTop: "none" }}>Strand</th>
                    <th className="text-center" style={{ borderTop: "none" }}>
                      Score
                    </th>
                    <th className="text-center" style={{ borderTop: "none" }}>
                      Submitted At
                    </th>
                    <th
                      className="text-center pe-4"
                      style={{ borderTop: "none" }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? null : respondents.length > 0 ? (
                    respondents.map((sub, index) => (
                      <tr key={sub.id} className="hover-bg-light">
                        <td className="text-center fw-bold text-muted px-4 py-2">
                          {(currentPage - 1) * entriesPerPage + index + 1}
                        </td>
                        <td className="py-2">
                          <div className="d-flex align-items-center py-1">
                            <div
                              className="rounded-circle text-white d-flex justify-content-center align-items-center fw-bold me-3 flex-shrink-0 shadow-sm"
                              style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: "var(--secondary-color)",
                              }}
                            >
                              {sub.student?.first_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-bold text-dark d-block">
                                {sub.student?.first_name}{" "}
                                {sub.student?.last_name}
                              </div>
                              <span
                                className="text-muted small d-block"
                                style={{ fontSize: "0.80rem" }}
                              >
                                {sub.student?.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2">
                          <span
                            className="d-block fw-bold font-monospace text-dark tracking-wide"
                            style={{ fontSize: "0.90rem" }}
                          >
                            {sub.student?.lrn || "N/A"}
                          </span>
                        </td>
                        <td className="py-2">
                          <span
                            className="badge bg-opacity-10 text-dark fw-medium text-uppercase rounded-3 px-2 py-1 border border-dark-subtle"
                            style={{
                              maxWidth: "150px",
                              backgroundColor: "var(--accent-color)",
                            }}
                          >
                            {sub.student?.strand?.name || "N/A"}
                          </span>
                        </td>
                        <td className="text-center py-2">
                          <div className="d-flex flex-column align-items-center justify-content-center">
                            <span
                              className={`fw-bolder fs-5 ${sub.score < totalPoints / 2 ? "text-danger" : "text-success"}`}
                            >
                              {sub.score}
                            </span>
                            <span
                              className="text-muted fw-bold d-block text-uppercase"
                              style={{
                                fontSize: "0.6rem",
                                letterSpacing: "1px",
                              }}
                            >
                              Points
                            </span>
                          </div>
                        </td>
                        <td className="text-center py-2">
                          <div className="d-inline-block text-center">
                            <span className="d-block fw-bold text-dark small">
                              {new Date(sub.submitted_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </span>
                            <span
                              className="text-muted font-monospace d-block"
                              style={{ fontSize: "0.75rem" }}
                            >
                              {new Date(sub.submitted_at).toLocaleTimeString(
                                "en-US",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="text-center pe-4 py-2">
                          <button
                            onClick={() => openReviewModal(sub)}
                            className="btn btn-sm btn-light border-0 shadow-sm rounded-circle d-inline-flex justify-content-center align-items-center transition-all hover-primary"
                            style={{ width: "35px", height: "35px" }}
                            title="View Answers"
                          >
                            <i
                              className="bi bi-eye-fill"
                              style={{ color: "var(--primary-color)" }}
                            ></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-4 bg-light border-bottom-0">
                        <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
                          <i
                            className="bi bi-inbox text-muted d-block mb-3"
                            style={{ fontSize: "3rem", opacity: 0.5 }}
                          ></i>
                          <h5 className="fw-bold text-dark">
                            {totalRecords === 0 && !searchQuery
                              ? "No submissions yet"
                              : "No matching records found"}
                          </h5>
                          <p className="text-muted small mb-0">
                            {totalRecords === 0 && !searchQuery
                              ? "Students haven't taken this form."
                              : "Try adjusting your search criteria."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalRecords > 0 && !isLoading && (
            <div className="d-flex flex-wrap justify-content-between align-items-center mt-2 mb-4 gap-3 px-2">
              <span className="text-muted small">
                Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
                {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
                {totalRecords} entries
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
        </>
      )}

      <ReviewSubmissionModal
        form={form}
        respondent={selectedRespondent}
        totalPoints={totalPoints}
      />
    </>
  );
};

export default FormInside;
