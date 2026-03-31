import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { sileo } from "sileo";
import { useNavigate } from "react-router-dom";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import { Modal } from "bootstrap";
import TeacherCalendarEventModal from "./TeacherCalendarEventModal";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const TeacherCalendar = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/calendar/teacher/events`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("campusloop_token") || sessionStorage.getItem("campusloop_token")}`,
          },
        },
      );

      const parsedEvents = response.data.map((event) => {
        if (event.extendedProps && event.extendedProps.type === "Classroom") {
          return {
            ...event,
            backgroundColor: "#6f42c1", // LEGEND
            borderColor: "#6f42c1", // border
          };
        }
        return event;
      });

      setEvents(parsedEvents); // Gagamitin na natin ang pinroseso nating events
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to load calendar events.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventClick = (clickInfo) => {
    const eventType = clickInfo.event.extendedProps.type;

    // KUNG ANNOUNCEMENT, BUKSAN ANG MODAL
    if (eventType === "Announcement") {
      setSelectedEvent({
        title: clickInfo.event.title,
        start: clickInfo.event.start,
        end: clickInfo.event.end,
        content: clickInfo.event.extendedProps.content,
        status: clickInfo.event.extendedProps.status,
        type: clickInfo.event.extendedProps.type,
        link: clickInfo.event.extendedProps.link,
        files: clickInfo.event.extendedProps.files || [],
      });

      const modal = new Modal(document.getElementById("eventDetailsModal"));
      modal.show();
    }
    // KUNG CLASSROOM O CLASSWORK, I-REDIRECT SA CLASSROOM VIEW
    else if (eventType === "Classroom" || eventType === "Classwork") {
      const classroomId = clickInfo.event.extendedProps.classroom_id;
      if (classroomId) {
        navigate(`/teacher/classrooms/${classroomId}`);
      }
    }
  };

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text="Loading Calendar..." />

      <div className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center mb-4 gap-3">
        <div>
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            My Schedule <i className="bi bi-calendar-check ms-1"></i>
          </h3>
          <p className="text-muted small mb-0">
            Manage your class schedules, deadlines, and view system
            announcements.
          </p>
        </div>

        {/* LEGEND COLOR INDICATORS SA UPPER RIGHT */}
        <div className="d-flex flex-wrap align-items-center gap-3 bg-white px-4 py-2 rounded-pill shadow-sm border">
          <span className="small fw-bold text-muted me-1 border-end pe-3">
            Legend
          </span>
          <div className="d-flex align-items-center gap-1 small text-dark fw-medium">
            <span
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#198754",
                borderRadius: "50%",
                display: "inline-block",
              }}
            ></span>{" "}
            Published Ann.
          </div>
          <div className="d-flex align-items-center gap-1 small text-dark fw-medium">
            <span
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#6c757d",
                borderRadius: "50%",
                display: "inline-block",
              }}
            ></span>{" "}
            Done Ann.
          </div>
          <div className="d-flex align-items-center gap-1 small text-dark fw-medium">
            <span
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#6f42c1",
                borderRadius: "50%",
                display: "inline-block",
              }}
            ></span>{" "}
            Class Schedule
          </div>
          <div className="d-flex align-items-center gap-1 small text-dark fw-medium">
            <span
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#dc3545",
                borderRadius: "50%",
                display: "inline-block",
              }}
            ></span>{" "}
            Classwork Deadline
          </div>
        </div>
      </div>

      {/* CALENDAR CONTAINER */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
          ]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,listWeek,listDay",
          }}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          contentHeight={700}
          eventDisplay="block"
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: "short",
          }}
          buttonText={{
            today: "Today",
            month: "Month",
            week: "Week Schedule",
            day: "Day Schedule",
          }}
        />
      </div>

      <TeacherCalendarEventModal selectedEvent={selectedEvent} />
    </>
  );
};

export default TeacherCalendar;
