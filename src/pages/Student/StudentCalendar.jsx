import React, { useState } from "react";
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
import StudentCalendarEventModal from "./StudentCalendarEventModal";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

// XSS Protection Helper
const getAuthHeader = () => {
  const token =
    localStorage.getItem("campusloop_token") ||
    sessionStorage.getItem("campusloop_token");
  return {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  };
};

const StudentCalendar = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  // Dinadala sa backend ang range para DoS Protection
  const fetchEvents = async (startStr, endStr) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/calendar/student/events`,
        {
          ...getAuthHeader(),
          params: {
            start: startStr,
            end: endStr,
          },
        },
      );

      const parsedEvents = response.data.map((event) => {
        if (event.extendedProps && event.extendedProps.type === "Classroom") {
          return {
            ...event,
            backgroundColor: "#6f42c1",
            borderColor: "#6f42c1",
          };
        }
        return event;
      });

      setEvents(parsedEvents);
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

  // Window Listener for FullCalendar
  const handleDatesSet = (dateInfo) => {
    fetchEvents(dateInfo.startStr, dateInfo.endStr);
  };

  const handleEventClick = (clickInfo) => {
    const eventType = clickInfo.event.extendedProps.type;

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
    } else if (eventType === "Classroom" || eventType === "Classwork") {
      const classroomId = clickInfo.event.extendedProps.classroom_id;
      if (classroomId) {
        navigate(`/student/classrooms/${classroomId}`);
      }
    }
  };

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text="Loading Calendar..." />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            My Schedule <i className="bi bi-calendar-check ms-1"></i>
          </h3>
          <p className="text-muted small mb-0">
            View all your joined class schedules, assignment deadlines, and
            system announcements.
          </p>
        </div>

        <div className="d-flex flex-wrap align-items-center justify-content-center gap-3 bg-white px-3 py-2 rounded-3 shadow-sm border">
          <span className="small fw-bold text-muted me-1 border-end pe-3 d-none d-sm-block">
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
            Deadline
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 bg-white p-4 overflow-hidden">
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
          datesSet={handleDatesSet}
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

      <StudentCalendarEventModal selectedEvent={selectedEvent} />
    </>
  );
};

export default StudentCalendar;
