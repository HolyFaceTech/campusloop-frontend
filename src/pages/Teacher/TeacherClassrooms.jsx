import React, { useState, useEffect } from "react";
import axios from "axios";
import { sileo } from "sileo";
import { useNavigate } from "react-router-dom";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import ClassroomFormDrawer from "./ClassroomFormDrawer";
import { Modal, Offcanvas } from "bootstrap";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const TeacherClassrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [drawerMode, setDrawerMode] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [formData, setFormData] = useState({
    section: "",
    strand_id: "",
    grade_level: "",
    subject_id: "",
    capacity: "",
    color_bg: "#626F47",
    schedule: { days: [], start_time: "", end_time: "" },
  });

  useEffect(() => {
    fetchClassrooms();

    const closeDropdown = () => setOpenDropdownId(null);
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  const fetchClassrooms = async () => {
    setIsLoading(true);
    setLoadingText("Fetching classrooms...");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/classrooms`,
      );
      setClassrooms(res.data);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to fetch classrooms.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleScheduleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...(prev.schedule || { days: [], start_time: "", end_time: "" }),
        [field]: value,
      },
    }));
  };

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setSelectedItem(null);
    setFormData({
      section: "",
      strand_id: "",
      grade_level: "",
      subject_id: "",
      capacity: "",
      color_bg: "#626F47",
      schedule: { days: [], start_time: "", end_time: "" },
    });
    const bsOffcanvas = new Offcanvas(
      document.getElementById("classroomDrawer"),
    );
    bsOffcanvas.show();
  };

  const openUpdateDrawer = (item) => {
    setDrawerMode("update");
    setSelectedItem(item);

    let parsedSchedule = { days: [], start_time: "", end_time: "" };
    if (item.schedule) {
      if (typeof item.schedule === "object") {
        parsedSchedule = item.schedule;
      } else if (typeof item.schedule === "string") {
        try {
          parsedSchedule = JSON.parse(item.schedule);
        } catch (e) {}
      }
    }

    setFormData({
      section: item.section,
      strand_id: item.strand_id,
      grade_level: item.grade_level,
      subject_id: item.subject_id,
      capacity: item.capacity,
      color_bg: item.color_bg,
      schedule: parsedSchedule,
    });
    const bsOffcanvas = new Offcanvas(
      document.getElementById("classroomDrawer"),
    );
    bsOffcanvas.show();
  };

  const triggerSaveConfirmation = () => {
    if (
      !formData.section ||
      !formData.strand_id ||
      !formData.subject_id ||
      !formData.capacity
    ) {
      sileo.error({
        title: "Incomplete",
        description: "Please fill in all required fields.",
        ...darkToast,
      });
      return;
    }

    const safeSchedule = formData.schedule || {};
    const safeDays = safeSchedule.days || [];

    if (
      safeDays.length === 0 ||
      !safeSchedule.start_time ||
      !safeSchedule.end_time
    ) {
      sileo.error({
        title: "Invalid Schedule",
        description: "Please select days and setup the time.",
        ...darkToast,
      });
      return;
    }
    if (safeSchedule.start_time >= safeSchedule.end_time) {
      sileo.error({
        title: "Invalid Time",
        description: "End time must be after Start time.",
        ...darkToast,
      });
      return;
    }

    const bsOffcanvas = Offcanvas.getInstance(
      document.getElementById("classroomDrawer"),
    );
    if (bsOffcanvas) bsOffcanvas.hide();

    setTimeout(() => {
      document
        .querySelectorAll(".offcanvas-backdrop")
        .forEach((el) => el.remove());
      const modal = new Modal(document.getElementById("saveConfirmModal"));
      modal.show();
    }, 400);
  };

  const executeSubmit = async () => {
    setIsLoading(true);
    setLoadingText(
      drawerMode === "create" ? "Creating Classroom..." : "Saving Changes...",
    );
    try {
      if (drawerMode === "create") {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/classrooms`,
          formData,
        );
        sileo.success({
          title: "Success",
          description: `Classroom created! Class Code: ${res.data.code}`,
          ...darkToast,
        });
      } else {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/classrooms/${selectedItem.id}`,
          formData,
        );
        sileo.success({
          title: "Updated",
          description: "Classroom updated successfully.",
          ...darkToast,
        });
      }
      fetchClassrooms();
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: "Could not process request.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const promptDelete = (item) => {
    setSelectedItem(item);
    const modal = new Modal(document.getElementById("deleteConfirmModal"));
    modal.show();
  };

  const executeDelete = async () => {
    setIsLoading(true);
    setLoadingText("Moving to Recycle Bin...");
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/classrooms/${selectedItem.id}`,
      );
      sileo.success({
        title: "Deleted",
        description: "Classroom removed.",
        ...darkToast,
      });
      fetchClassrooms();
    } catch (error) {
      sileo.error({
        title: "Failed",
        description: "Could not delete classroom.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterClassroom = (id) => {
    setIsLoading(true);
    setLoadingText("Entering Classroom...");
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/teacher/classrooms/${id}`);
    }, 1000);
  };

  const formatScheduleText = (schedule) => {
    try {
      const schedObj =
        typeof schedule === "string" ? JSON.parse(schedule) : schedule;
      if (
        !schedObj ||
        !Array.isArray(schedObj.days) ||
        schedObj.days.length === 0
      )
        return "No Schedule";

      const formatTime = (time24) => {
        if (!time24) return "";
        const [h, m] = time24.split(":");
        let hours = parseInt(h);
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `${hours}:${m} ${ampm}`;
      };

      return `${schedObj.days.join(", ")} | ${formatTime(
        schedObj.start_time,
      )} - ${formatTime(schedObj.end_time)}`;
    } catch (e) {
      return typeof schedule === "string" ? schedule : "Invalid Schedule";
    }
  };

  const filteredClassrooms = classrooms.filter((item) => {
    const search = searchQuery.toLowerCase();
    const subjectMatch = item.subject?.description
      ?.toLowerCase()
      .includes(search);
    const sectionMatch = item.section?.toLowerCase().includes(search);
    const codeMatch = item.code?.toLowerCase().includes(search);
    return subjectMatch || sectionMatch || codeMatch;
  });

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      {/* Tittle and Button Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-3 gap-3">
        <div>
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            Classroom Management <i className="bi bi-easel"></i>
          </h3>
          <p className="text-muted small mb-0">
            Create and manage your digital classrooms.
          </p>
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={openCreateDrawer}
            className="btn btn-campusloop shadow-sm px-4 rounded-3 d-flex align-items-center gap-2 w-100 justify-content-center"
          >
            <i className="bi bi-plus-lg fs-5"></i> New Classroom
          </button>
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
              placeholder="Search Subject, Section, or Code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="row g-4">
        {filteredClassrooms.map((item) => (
          <div className="col-12 col-md-6 col-xl-4" key={item.id}>
            <div
              className="card border-0 shadow-sm rounded-4 h-100 premium-hover-card bg-white"
              style={{ borderRadius: "1rem" }}
            >
              <div
                className="p-4 position-relative d-flex flex-column justify-content-end"
                style={{
                  backgroundColor: item.color_bg,
                  minHeight: "140px",
                  borderTopLeftRadius: "1rem",
                  borderTopRightRadius: "1rem",
                }}
              >
                {/* Decorative Circles */}
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
                <div
                  className="dropdown position-absolute top-0 end-0 mt-3 me-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="btn btn-sm text-white rounded-circle shadow-none d-flex justify-content-center align-items-center p-0"
                    type="button"
                    onClick={() =>
                      setOpenDropdownId(
                        openDropdownId === item.id ? null : item.id,
                      )
                    }
                    style={{
                      backgroundColor: "rgba(0,0,0,0.2)",
                      width: "32px",
                      height: "32px",
                    }}
                  >
                    <i className="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul
                    className={`dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-1 ${openDropdownId === item.id ? "show" : ""}`}
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: "0",
                      zIndex: 1050,
                    }}
                  >
                    <li>
                      <button
                        className="dropdown-item py-2 fw-medium"
                        onClick={() => {
                          openUpdateDrawer(item);
                          setOpenDropdownId(null);
                        }}
                      >
                        <i
                          className="bi bi-pencil-square me-2"
                          style={{ color: "var(--primary-color)" }}
                        ></i>{" "}
                        Update
                      </button>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item py-2 fw-medium text-danger"
                        onClick={() => {
                          promptDelete(item);
                          setOpenDropdownId(null);
                        }}
                      >
                        <i className="bi bi-trash-fill me-2"></i> Delete
                      </button>
                    </li>
                  </ul>
                </div>

                <div className="pe-4 position-relative z-1">
                  <h4
                    className="fw-bold text-white mb-1 text-truncate"
                    title={item.subject?.description}
                  >
                    {item.subject?.description}
                  </h4>
                  <span className="badge bg-white text-dark bg-opacity-25 px-2 py-1 fw-semibold shadow-sm">
                    {item.section} • Grade {item.grade_level}
                  </span>
                </div>
              </div>

              <div className="card-body p-4 d-flex flex-column position-relative">
                <div
                  className="position-absolute shadow-sm rounded-circle d-flex justify-content-center align-items-center fw-bold text-white"
                  style={{
                    width: "55px",
                    height: "55px",
                    top: "-27px",
                    right: "24px",
                    backgroundColor: "var(--primary-color)",
                    border: "4px solid white",
                    fontSize: "1.3rem",
                  }}
                  title={`Creator: ${item.creator?.first_name} ${item.creator?.last_name}`}
                >
                  {item.creator?.first_name
                    ? item.creator.first_name.charAt(0).toUpperCase()
                    : "T"}
                </div>

                <div className="mb-3 mt-1">
                  <span
                    className="d-block text-muted mb-1 text-uppercase"
                    style={{
                      fontSize: "0.65rem",
                      letterSpacing: "1px",
                      fontWeight: "700",
                    }}
                  >
                    Creator
                  </span>
                  <div className="d-flex align-items-center">
                    <span className="text-dark small fw-bold">
                      {item.creator
                        ? `${item.creator.first_name} ${item.creator.last_name}`
                        : "Unknown Teacher"}
                    </span>
                  </div>
                </div>

                <div className="bg-light rounded-4 p-3 mb-4 border border-light-subtle flex-grow-1">
                  <div className="d-flex align-items-start mb-3">
                    <div
                      className="rounded-circle bg-white shadow-sm d-flex justify-content-center align-items-center me-3 flex-shrink-0"
                      style={{ width: "35px", height: "35px" }}
                    >
                      <i className="bi bi-calendar3 text-primary"></i>
                    </div>
                    <div className="overflow-hidden">
                      <span
                        className="d-block small text-muted fw-bold mb-1"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Class Schedule
                      </span>
                      <span className="d-block text-dark small fw-medium text-truncate">
                        {formatScheduleText(item.schedule)}
                      </span>
                    </div>
                  </div>
                  <div className="d-flex align-items-start">
                    <div
                      className="rounded-circle bg-white shadow-sm d-flex justify-content-center align-items-center me-3 flex-shrink-0"
                      style={{ width: "35px", height: "35px" }}
                    >
                      <i className="bi bi-people text-success"></i>
                    </div>
                    <div>
                      <span
                        className="d-block small text-muted fw-bold mb-1"
                        style={{ fontSize: "0.75rem" }}
                      >
                        Enrolled Students
                      </span>
                      <span className="d-block text-dark small fw-medium">
                        <b
                          className={
                            item.enrolled_count >= item.capacity
                              ? "text-danger"
                              : "text-success"
                          }
                        >
                          {item.enrolled_count}
                        </b>{" "}
                        / {item.capacity}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                  <div className="d-flex flex-column">
                    <span
                      className="text-muted fw-bold text-uppercase mb-1"
                      style={{ fontSize: "0.65rem", letterSpacing: "1px" }}
                    >
                      Class Code
                    </span>
                    <span
                      className="badge bg-secondary bg-opacity-10 text-dark border px-3 py-2 fw-bold"
                      style={{ letterSpacing: "1px", fontSize: "0.85rem" }}
                    >
                      {item.code}
                    </span>
                  </div>
                  <button
                    onClick={() => handleEnterClassroom(item.id)}
                    className="btn btn-campusloop rounded-3 fw-bold px-4 shadow-sm"
                  >
                    Enter <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredClassrooms.length === 0 && !isLoading && (
          <div className="col-12">
            <div className="p-5 bg-white rounded-4 shadow-sm text-center border">
              <i
                className="bi bi-easel text-muted d-block mb-3"
                style={{ fontSize: "3rem", opacity: 0.5 }}
              ></i>
              <h5 className="fw-bold text-dark">No classrooms found.</h5>
              <p className="text-muted small mb-0">
                {searchQuery
                  ? "No matching classrooms for your search."
                  : "Click the 'New Classroom' button to get started."}
              </p>
            </div>
          </div>
        )}
      </div>

      <ClassroomFormDrawer
        drawerMode={drawerMode}
        formData={formData}
        handleInputChange={handleInputChange}
        handleScheduleChange={handleScheduleChange}
        triggerSaveConfirmation={triggerSaveConfirmation}
      />

      <div
        className="modal fade"
        id="saveConfirmModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-0 pb-0 justify-content-center mt-4">
              <div
                className="rounded-circle d-flex justify-content-center align-items-center"
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "rgba(98, 111, 71, 0.1)",
                }}
              >
                <i
                  className="bi bi-check-circle-fill"
                  style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark">
                {drawerMode === "create" ? "Create Classroom" : "Save Changes"}
              </h4>
              <p className="text-muted mb-0">
                Are you sure you want to proceed with these details?
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
                onClick={() => {
                  const bsOffcanvas = new Offcanvas(
                    document.getElementById("classroomDrawer"),
                  );
                  bsOffcanvas.show();
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-campusloop px-4 fw-medium shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={executeSubmit}
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="deleteConfirmModal"
        tabIndex="-1"
        aria-hidden="true"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header border-0 pb-0 justify-content-center mt-4">
              <div
                className="rounded-circle bg-danger bg-opacity-10 d-flex justify-content-center align-items-center"
                style={{ width: "80px", height: "80px" }}
              >
                <i
                  className="bi bi-exclamation-triangle-fill text-danger"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
            </div>
            <div className="modal-body text-center p-4">
              <h4 className="fw-bold text-dark">Delete Classroom</h4>
              <p className="text-muted mb-0">
                Are you sure you want to move{" "}
                <b>{selectedItem?.subject?.description}</b> to the recycle bin?
              </p>
            </div>
            <div className="modal-footer border-0 d-flex justify-content-center pb-4 pt-0 gap-2">
              <button
                type="button"
                className="btn btn-light px-4 fw-medium shadow-sm rounded-3 border"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger px-4 fw-medium shadow-sm rounded-3"
                data-bs-dismiss="modal"
                onClick={executeDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherClassrooms;
