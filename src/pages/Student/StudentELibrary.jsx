import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal } from "bootstrap";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import StudentELibraryModal from "./StudentELibraryModal";

// Centralized Token
const getAuthHeader = () => {
  const token =
    localStorage.getItem("campusloop_token") ||
    sessionStorage.getItem("campusloop_token");
  return {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  };
};

const StudentELibrary = () => {
  const [libraries, setLibraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading E-Library...");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [viewingItem, setViewingItem] = useState(null);

  // Reset Page to 1 kapag nagbago ang search query o entries limit
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, entriesPerPage]);

  // 500ms Server-Side Debounce Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLibraries();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentPage, entriesPerPage]);

  const fetchLibraries = async () => {
    setIsLoading(true);
    setLoadingText("Loading library materials...");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/student/e-libraries`,
        {
          ...getAuthHeader(),
          params: {
            search: searchQuery,
            page: currentPage,
            entries: entriesPerPage,
          },
        },
      );
      setLibraries(res.data.data || []);
      setTotalPages(res.data.last_page || 1);
      setTotalRecords(res.data.total || 0);
    } catch (error) {
      console.error("Failed to fetch e-libraries", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openFiles = (item) => {
    setViewingItem(item);

    setTimeout(() => {
      const modalEl = document.getElementById("viewContentModal");
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
      if (currentPage <= 3) pages = [1, 2, 3, 4, "...", totalPages];
      else if (currentPage >= totalPages - 2)
        pages = [
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      else
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
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-4 gap-3">
        <div className="flex-grow-1">
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            E-Library <i className="bi bi-book-half"></i>
          </h3>
          <p className="text-muted small mb-0">
            Browse approved resources and reading materials from your teachers.
          </p>
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
              className="input-group"
              style={{ maxWidth: "400px", minWidth: "350px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                placeholder="Search Title or Description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {libraries.length > 0 ? (
          libraries.map((item) => (
            <div className="col-md-6 col-xl-4" key={item.id}>
              <div className="card h-100 border-0 shadow-sm rounded-4 hover-shadow transition-all bg-white premium-hover-card">
                <div
                  className="p-4 position-relative d-flex flex-column justify-content-end"
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
                  <div className="pe-4 position-relative z-1">
                    <h4
                      className="fw-bold text-white mb-1 text-truncate"
                      title={item.title}
                    >
                      {item.title}
                    </h4>
                    <span className="badge bg-white text-dark bg-opacity-25 px-2 py-1 fw-semibold shadow-sm">
                      <i className="bi bi-book-half me-1"></i> Library Resource
                    </span>
                  </div>
                </div>

                <div className="card-body p-4 d-flex flex-column position-relative">
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
                    <i className="bi bi-journal-text"></i>
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
                      Description
                    </span>
                    <p
                      className="text-dark small fw-medium mb-0 text-clamp-3"
                      style={{ lineHeight: "1.6", whiteSpace: "pre-wrap" }}
                    >
                      {item.description}
                    </p>
                  </div>

                  <div className="bg-light rounded-4 p-3 mb-3 border border-light-subtle d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center overflow-hidden pe-2">
                      <div
                        className="rounded-circle text-white shadow-sm d-flex justify-content-center align-items-center me-2 flex-shrink-0 fw-bold"
                        style={{
                          width: "35px",
                          height: "35px",
                          backgroundColor: "var(--primary-color)",
                        }}
                      >
                        {item.creator?.first_name?.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <span
                          className="d-block text-muted fw-bold mb-0 text-uppercase"
                          style={{
                            fontSize: "0.60rem",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Uploaded By
                        </span>
                        <span
                          className="d-block text-dark fw-bold text-truncate"
                          style={{ fontSize: "0.80rem" }}
                        >
                          {item.creator
                            ? `${item.creator.first_name} ${item.creator.last_name}`
                            : "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto d-flex gap-2">
                    <button
                      className="btn btn-campusloop fw-bold w-100 rounded-3 shadow-sm"
                      onClick={() => openFiles(item)}
                    >
                      <i className="bi bi-folder2-open me-2"></i> Open Content
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
              <i
                className="bi bi-inbox text-muted d-block mb-3"
                style={{ fontSize: "3rem", opacity: 0.5 }}
              ></i>
              <h5 className="fw-bold text-dark">No books found.</h5>
              <p className="text-muted small mb-0">
                {searchQuery
                  ? "No matching resources for your search."
                  : "The E-Library is currently empty."}
              </p>
            </div>
          </div>
        )}
      </div>

      {totalRecords > 0 && !isLoading && (
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-2 mb-4 px-2 gap-3">
          <span className="text-muted small">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
            {totalRecords} materials
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

      <StudentELibraryModal viewingItem={viewingItem} />
    </>
  );
};

export default StudentELibrary;
