import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal } from "bootstrap";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import StudentELibraryModal from "./StudentELibraryModal";

const StudentELibrary = () => {
  const [libraries, setLibraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading E-Library...");
  const [searchQuery, setSearchQuery] = useState("");

  const [viewingItem, setViewingItem] = useState(null);

  useEffect(() => {
    fetchLibraries();
  }, []);

  const fetchLibraries = async () => {
    setIsLoading(true);
    setLoadingText("Fetching library materials...");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/student/e-libraries`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );
      setLibraries(res.data);
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

  const filteredLibraries = libraries.filter((lib) =>
    `${lib.title} ${lib.description}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-3 gap-3">
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

      <div className="row mb-4">
        <div className="col-12 col-md-6 col-xl-4">
          <div className="input-group shadow-sm rounded-3 overflow-hidden">
            <span className="input-group-text bg-white border-end-0 text-muted px-3">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0 toolbar-input"
              placeholder="Search Title or Description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* GRID CARDS EXACTLY LIKE TEACHER */}
      <div className="row g-4 mb-4">
        {filteredLibraries.length > 0 ? (
          filteredLibraries.map((item) => (
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
                      style={{ lineHeight: "1.6" }}
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
                className="bi bi-book-half text-muted d-block mb-3"
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

      <StudentELibraryModal viewingItem={viewingItem} />
    </>
  );
};

export default StudentELibrary;
