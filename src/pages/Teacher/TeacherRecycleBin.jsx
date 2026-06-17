import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import TeacherRecycleBinModals from "./TeacherRecycleBinModals";

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

const TeacherRecycleBin = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Hardcoded options dahil hindi na hawak ng frontend ang lahat ng data
  const categoryOptions = [
    "Classrooms",
    "Classworks",
    "Forms",
    "Files",
    "E-Libraries",
    "Advisory Classes",
  ];

  // RESET PAGE TO 1 KAPAG NAGBAGO ANG SEARCH/FILTER
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, entriesPerPage]);

  // DEBOUNCE EFFECT (500ms)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDeletedItems();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filterCategory, currentPage, entriesPerPage]);

  const fetchDeletedItems = async () => {
    setIsLoading(true);
    setLoadingText("Loading deleted records...");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/teacher/recycle-bin`,
        {
          ...getAuthHeader(),
          params: {
            search: searchQuery,
            category: filterCategory,
            page: currentPage,
            entries: entriesPerPage,
          },
        },
      );

      const data = response.data;
      setItems(data.data || []);
      setTotalPages(data.last_page || 1);
      setTotalRecords(data.total || 0);
      setSelectedItems([]);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to load recycle bin data.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isSelected = (id) => selectedItems.some((item) => item.id === id);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(items.map((item) => ({ id: item.id, type: item.type })));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id, type, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, { id, type }]);
    } else {
      setSelectedItems(selectedItems.filter((item) => item.id !== id));
    }
  };

  const executeAction = () => {
    if (selectedItems.length === 0) return;

    if (selectedItems.length > 50) {
      sileo.error({
        title: "Limit Exceeded",
        description:
          "You can only restore up to 50 items at once to prevent server overload.",
        ...darkToast,
      });
      return;
    }

    setTimeout(async () => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      setIsLoading(true);
      setLoadingText("Restoring selected items...");

      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/teacher/recycle-bin/restore`,
          { items: selectedItems },
          getAuthHeader(),
        );

        sileo.success({
          title: "Action Complete",
          description: "Items restored successfully.",
          ...darkToast,
        });

        fetchDeletedItems();
      } catch (error) {
        sileo.error({
          title: "Action Failed",
          description: "Failed to process the request. Please try again.",
          ...darkToast,
        });
        setIsLoading(false);
      }
    }, 400);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
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

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            My Recycle Bin <i className="bi bi-trash ps-1"></i>
          </h3>
          <p className="text-muted small mb-0">
            Restore your deleted records and files.
          </p>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden premium-hover-card">
        <div className="card-body p-0">
          <div className="d-flex flex-nowrap align-items-center gap-3 overflow-x-auto custom-scrollbar p-3">
            <div className="d-flex align-items-center flex-shrink-0 text-muted small">
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
              className="input-group flex-grow-1"
              style={{ minWidth: "400px" }}
            >
              <span className="input-group-text bg-white border-end-0 text-muted ps-3 rounded-start-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-1 toolbar-input py-2 rounded-end-3"
                placeholder="Search your deleted items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="input-group" style={{ minWidth: "400px" }}>
              <span className="input-group-text bg-white border-end-0 text-muted rounded-start-3">
                <i className="bi bi-funnel"></i>
              </span>
              <select
                className="form-select border-start-0 ps-2 toolbar-input py-2 rounded-end-3"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-success d-flex align-items-center justify-content-center gap-2 py-2 px-4 flex-shrink-0 rounded-3 shadow-sm"
              disabled={selectedItems.length === 0}
              data-bs-toggle="modal"
              data-bs-target="#actionConfirmModal"
            >
              <i className="bi bi-arrow-counterclockwise"></i> Restore
            </button>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4 premium-hover-card">
        <div className="table-responsive custom-scrollbar">
          <table
            className="table table-summer align-middle mb-0"
            style={{ minWidth: "1000px" }}
          >
            <thead>
              <tr>
                <th className="ps-4" style={{ width: "50px" }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    onChange={handleSelectAll}
                    checked={
                      selectedItems.length === items.length && items.length > 0
                    }
                  />
                </th>
                <th>Deleted Item</th>
                <th>Category</th>
                <th>Item ID</th>
                <th className="text-end pe-4">Deleted At</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={`${item.type}-${item.id}`}>
                  <td className="ps-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={isSelected(item.id)}
                      onChange={(e) =>
                        handleSelectItem(item.id, item.type, e.target.checked)
                      }
                    />
                  </td>
                  <td>
                    <span
                      className="fw-bold text-dark d-block text-truncate mb-1"
                      style={{ maxWidth: "400px" }}
                      title={item.title}
                    >
                      {item.title}
                    </span>
                    <span className="text-muted small d-block">
                      <i className="bi bi-person-circle me-1"></i> {item.owner}
                    </span>
                  </td>
                  <td>
                    <span
                      className="badge border border-dark-subtle text-dark bg-opacity-10 fw-medium rounded-3 px-2 py-1 shadow-sm"
                      style={{ backgroundColor: "var(--accent-color)" }}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="text-muted font-monospace small text-break text-nowrap">
                    {item.id}
                  </td>
                  <td className="text-muted small text-end pe-4 text-nowrap">
                    {formatDateTime(item.deleted_at)}
                  </td>
                </tr>
              ))}
              {items.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="5" className="p-4 bg-light border-bottom-0">
                    <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
                      {searchQuery || filterCategory !== "all" ? (
                        <>
                          <i
                            className="bi bi-inbox text-muted d-block mb-3"
                            style={{ fontSize: "3rem", opacity: 0.5 }}
                          ></i>
                          <h5 className="fw-bold text-dark">No junks found.</h5>
                          <p className="text-muted small mb-0">
                            No matching items found for your search or filter.
                          </p>
                        </>
                      ) : (
                        <>
                          <i
                            className="bi bi-inbox text-muted d-block mb-3"
                            style={{ fontSize: "3rem", opacity: 0.5 }}
                          ></i>
                          <h5 className="fw-bold text-dark">
                            Recycle Bin is empty.
                          </h5>
                          <p className="text-muted small mb-0">
                            There are currently no deleted items in the system.
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalRecords > 0 && !isLoading && (
        <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
          <p className="text-muted small mb-0">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, totalRecords)} of{" "}
            {totalRecords} junks
          </p>
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

      <TeacherRecycleBinModals
        selectedCount={selectedItems.length}
        executeAction={executeAction}
      />
    </>
  );
};

export default TeacherRecycleBin;
