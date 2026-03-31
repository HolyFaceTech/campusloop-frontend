import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { sileo } from "sileo";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import { Modal } from "bootstrap";
import CalendarEventModal from "./CalendarEventModal";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/calendar/admin/events`,
      );
      setEvents(response.data);
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
            System Calendar <i className="bi bi-calendar-check ms-1"></i>
          </h3>
          <p className="text-muted small mb-0">
            View all scheduled announcements and deadlines.
          </p>
        </div>

        {/* LEGEND COLOR INDICATORS SA UPPER RIGHT */}
        <div className="d-flex align-items-center gap-3 bg-white px-4 py-2 rounded-3 shadow-sm border">
          <span className="small fw-bold text-muted me-1 border-end pe-3">
            Legend
          </span>
          <div className="d-flex align-items-center gap-1 small text-dark fw-medium">
            <span
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#fd7e14",
                borderRadius: "50%",
                display: "inline-block",
              }}
            ></span>{" "}
            Pending
          </div>
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
            Published
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
            Done
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

      <CalendarEventModal selectedEvent={selectedEvent} />
    </>
  );
};

export default AdminCalendar;
