import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { sileo } from "sileo";
import { Modal } from "bootstrap";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import AdminReviewSubmissionModal from "./AdminReviewSubmissionModal";
import { ConfirmTeacherPDFModal, UnsubmitFormModal } from "./AdminFormModals";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const AdminFormInside = () => {
  const { id } = useParams();

  const [form, setForm] = useState(null);
  const [respondents, setRespondents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading Form Details...");
  const [activeTab, setActiveTab] = useState("questionnaire");

  // SERVER-SIDE SEARCH & PAGINATION STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedRespondent, setSelectedRespondent] = useState(null);
  const [respondentToUnsubmit, setRespondentToUnsubmit] = useState(null);

  // KUNIN ANG DATA NG FORM SA INITIAL LOAD
  useEffect(() => {
    fetchFormData();
  }, [id]);

  // RESET PAGE TO 1 KAPAG NAGBAGO ANG SEARCH O ENTRIES
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage]);

  // SERVER-SIDE DEBOUNCE EFFECT (500ms) PARA SA RESPONDENTS
  useEffect(() => {
    if (id) {
      const delayDebounceFn = setTimeout(() => {
        fetchRespondents();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [id, searchQuery, currentPage, entriesPerPage]);

  const fetchFormData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/forms/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      setForm(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRespondents = async () => {
    setIsLoading(true);
    setLoadingText("Loading records...");

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/forms/${id}/respondents`,
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
      setRespondents(data.data || []);
      setTotalPages(data.last_page || 1);
      setTotalRecords(data.total || 0);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setRespondents([]);
      setIsLoading(false);
    }
  };

  const openReviewModal = (respondent) => {
    setSelectedRespondent(respondent);
    setTimeout(() => {
      const modalEl = document.getElementById("adminReviewSubmissionModal");
      if (modalEl) Modal.getOrCreateInstance(modalEl).show();
    }, 150);
  };

  const confirmTeacherPDF = () => {
    const modalEl = document.getElementById("adminConfirmTeacherPDFModal");
    if (modalEl) Modal.getOrCreateInstance(modalEl).show();
  };

  const executeGenerateTeacherPDF = async () => {
    const modalEl = document.getElementById("adminConfirmTeacherPDFModal");
    if (modalEl) Modal.getInstance(modalEl)?.hide();

    setIsLoading(true);
    setLoadingText("Generating PDF...");

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/admin/forms/${id}/print`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );

      const printWindow = window.open("", "_blank");
      printWindow.document.write(res.data);
      printWindow.document.close();
    } catch (error) {
      alert("Failed to generate PDF. Check backend configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- UNSUBMIT LOGIC ---
  const executeUnsubmit = async () => {
    const modalEl = document.getElementById("adminUnsubmitFormModal");
    if (modalEl) Modal.getInstance(modalEl)?.hide();

    setIsLoading(true);
    setLoadingText("Unsubmitting record...");

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/admin/forms/${id}/submissions/${respondentToUnsubmit.id}/unsubmit`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );

      sileo.success({
        title: "Success",
        description: "Student submission removed successfully.",
        ...darkToast,
      });
      fetchRespondents(); // Refresh listahan para mawala siya agad
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: "Failed to unsubmit form.",
        ...darkToast,
      });
      setIsLoading(false);
    }
  };

  if (isLoading && !form)
    return <GlobalSpinner isLoading={true} text={loadingText} />;

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

      {/* UNIFIED HEADER CARD */}
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
              onClick={confirmTeacherPDF}
              className="btn btn-campusloop shadow-sm px-4 py-2 rounded-3 d-flex align-items-center gap-2 fw-bold flex-shrink-0 transition-all"
            >
              <i className="bi bi-printer-fill"></i> Print Form
            </button>
          </div>

          <hr className="opacity-10 my-4" />

          {/* COMPACT INFO WIDGET */}
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
                  <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 mt-1 px-2 py-1">
                    Focus Mode ON
                  </span>
                ) : (
                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 mt-1 px-2 py-1">
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
                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 mt-1 px-2 py-1">
                    Shuffled
                  </span>
                ) : (
                  <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 mt-1 px-2 py-1">
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

      {/* SLEEK UNDERLINE TABS */}
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
          <i className="bi bi-card-list"></i> Questionnaire
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
          <i className="bi bi-people-fill"></i> Respondents
          {/* UPDATED: Dito sa badge, totalRecords na ang ipapakita para accurate kahit naka-paginate */}
          <span
            className="badge rounded-3 shadow-sm ms-1"
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

      {/* TAB 1: QUESTIONNAIRE */}
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
                    Your form is currently empty.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RESPONDENTS */}
      {activeTab === "respondents" && (
        <>
          <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
            <div className="card-body p-3">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pb-1">
                <div className="d-flex align-items-center flex-shrink-0 text-muted small fw-medium">
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

                <div className="input-group" style={{ width: "350px" }}>
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
                  {respondents.length > 0 ? (
                    respondents.map((sub, index) => (
                      <tr key={sub.id} className="hover-bg-light">
                        <td className="text-center fw-bold text-muted px-4 py-2">
                          {/* UPDATED: Dynamic Index Calculation based on Page */}
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
                            className="badge border text-dark text-uppercase rounded-3 px-2 py-1"
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
                          <div className="d-flex justify-content-center align-items-center gap-2">
                            <button
                              onClick={() => openReviewModal(sub)}
                              className="btn btn-sm btn-light shadow-sm rounded-circle hover-primary transition-all"
                              style={{ width: "35px", height: "35px" }}
                              title="View Answers"
                            >
                              <i
                                className="bi bi-eye-fill"
                                style={{ color: "var(--primary-color)" }}
                              ></i>
                            </button>
                            <button
                              onClick={() => {
                                setRespondentToUnsubmit(sub);
                                const modalEl = document.getElementById(
                                  "adminUnsubmitFormModal",
                                );
                                if (modalEl)
                                  Modal.getOrCreateInstance(modalEl).show();
                              }}
                              className="btn btn-sm btn-light shadow-sm rounded-circle hover-danger transition-all"
                              style={{ width: "35px", height: "35px" }}
                              title="Unsubmit Form"
                            >
                              <i className="bi bi-arrow-counterclockwise text-danger"></i>
                            </button>
                          </div>
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

          {/* PAGINATION BUTTONS */}
          {totalRecords > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-2 mb-4 px-1">
              <span className="text-muted small">
                Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
                {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
                {totalRecords} respondents
              </span>
              <nav>
                <ul className="pagination pagination-sm mb-0">
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
                  {[...Array(totalPages)].map((_, i) => (
                    <li
                      key={i}
                      className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                    >
                      <button
                        className="page-link page-link-summer"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
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

      <ConfirmTeacherPDFModal
        form={form}
        executeGenerateTeacherPDF={executeGenerateTeacherPDF}
      />

      <UnsubmitFormModal
        respondent={respondentToUnsubmit}
        executeUnsubmit={executeUnsubmit}
      />

      <AdminReviewSubmissionModal
        form={form}
        respondent={selectedRespondent}
        totalPoints={totalPoints}
        setIsLoading={setIsLoading}
        setLoadingText={setLoadingText}
      />
    </>
  );
};

export default AdminFormInside;
