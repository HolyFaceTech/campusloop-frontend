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

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedItems, setSelectedItems] = useState([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const fetchDeletedItems = async () => {
    setIsLoading(true);
    setLoadingText("Fetching deleted records...");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/teacher/recycle-bin`,
        getAuthHeader(),
      );
      setItems(response.data);
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

  useEffect(() => {
    fetchDeletedItems();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, entriesPerPage]);

  const categoryOptions = [...new Set(items.map((item) => item.type))];

  const filteredItems = items.filter((item) => {
    const matchesSearch = `${item.title} ${item.owner} ${item.id}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || item.type === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / entriesPerPage);

  const isSelected = (id) => selectedItems.some((item) => item.id === id);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(
        currentItems.map((item) => ({ id: item.id, type: item.type })),
      );
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

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      {/* HEADER SECTION */}
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

      {/* TOOLBAR SECTION */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
        <div className="card-body p-3">
          <div className="d-flex flex-nowrap align-items-center gap-3 overflow-x-auto custom-scrollbar pb-1">
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
              style={{ minWidth: "250px" }}
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

            <div className="input-group" style={{ minWidth: "180px" }}>
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
              <i className="bi bi-arrow-counterclockwise"></i> Restore{" "}
              {selectedItems.length > 0 && `(${selectedItems.length})`}
            </button>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
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
                      selectedItems.length === currentItems.length &&
                      currentItems.length > 0
                    }
                  />
                </th>
                <th>Deleted Item</th>
                <th className="text-center">Category</th>
                <th>Item ID</th>
                <th className="text-end pe-4">Deleted At</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
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
                  <td className="text-center">
                    <span
                      className="badge border text-dark rounded-3 px-2 py-1"
                      style={{ backgroundColor: "var(--accent-color)" }}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td
                    className="text-muted font-monospace small text-break"
                    style={{ maxWidth: "250px" }}
                  >
                    {item.id}
                  </td>
                  <td className="text-muted small text-end pe-4">
                    {formatDateTime(item.deleted_at)}
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && !isLoading && (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    {items.length === 0 ? (
                      <>
                        <i className="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
                        Recycle Bin is empty.
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search fs-1 d-block mb-2 opacity-50"></i>
                        No matching records found.
                      </>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION CONTROLS */}
      {filteredItems.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-2 mb-4">
          <p className="text-muted small mb-0">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredItems.length)} of{" "}
            {filteredItems.length} entries
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

      {/* ACTION MODAL COMPONENT */}
      <TeacherRecycleBinModals
        selectedCount={selectedItems.length}
        executeAction={executeAction}
      />
    </>
  );
};

export default TeacherRecycleBin;
