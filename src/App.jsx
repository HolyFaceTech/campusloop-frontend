import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sileo";
import axios from "axios";

// Auth Components
import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import EmailVerification from "./pages/Auth/EmailVerification";

// Admin Components
import AdminLayout from "./components/Layouts/AdminLayout";
import UserRecords from "./pages/Admin/UserRecords";
import Strands from "./pages/Admin/Strands";
import SystemSettings from "./pages/Admin/Settings";
import Subjects from "./pages/Admin/Subjects";
import Announcements from "./pages/Admin/Announcements";
import AdminCalendar from "./pages/Admin/Calendar";
import AdminELibrary from "./pages/Admin/AdminELibrary";
import AdminStudentGrades from "./pages/Admin/AdminStudentGrades";
import {
  Dashboard,
  ClassroomsAdmin,
  FormsAdmin,
  FilesAdmin,
  RecycleBin,
  AdminNotifications,
} from "./pages/Admin/AdminPages";

// Teacher Components
import TeacherLayout from "./components/Layouts/TeacherLayout";
import TeacherHome from "./pages/Teacher/TeacherHome";
import TeacherAdvisory from "./pages/Teacher/TeacherAdvisory";
import TeacherAdvisoryDetails from "./pages/Teacher/TeacherAdvisoryDetails";

import TeacherClassrooms from "./pages/Teacher/TeacherClassrooms";
import ClassroomView from "./pages/Teacher/Classroom/ClassroomView";
import TabStream from "./pages/Teacher/Classroom/TabStream";
import TabPeople from "./pages/Teacher/Classroom/TabPeople";
import TabGrades from "./pages/Teacher/Classroom/TabGrades";

import TeacherForms from "./pages/Teacher/TeacherForms";
import FormInside from "./pages/Teacher/FormInside";
import FormBuilder from "./pages/Teacher/FormBuilder";

import TeacherFiles from "./pages/Teacher/TeacherFiles";
import TeacherELibrary from "./pages/Teacher/TeacherELibrary";
import TeacherRecycleBin from "./pages/Teacher/TeacherRecycleBin";

// Taga-test kung valid pa ang session
const DashboardPlaceholder = ({ title }) => {
  const testSession = async () => {
    try {
      // Susubukan niyang kumuha ng data sa backend
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/user`,
      );
      alert("Session is still active! User: " + response.data.email);
    } catch (error) {
      // Kapag 401 Unauthorized (dahil nabura na yung token sa kabilang device),
      // automatic sasaluin ito ng interceptor sa main.jsx at iki-kick out ka!
      console.log("Session verified as expired.");
    }
  };

  return (
    <div className="text-center mt-5">
      <h1 style={{ color: "var(--primary-color)" }} className="fw-bold">
        {title} (Coming Soon)
      </h1>
      <p className="text-muted">
        Click the button below to simulate fetching data from the database.
      </p>
      <button
        onClick={testSession}
        className="btn btn-campusloop mt-3 shadow-sm px-4"
      >
        Test Single Session Connection
      </button>
    </div>
  );
};

function App() {
  return (
    <>
      <div className="dark">
        <Toaster theme="dark" position="top-center" />
      </div>

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify" element={<EmailVerification />} />

        {/* ADMIN ROUTES (Protected) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserRecords />} />
          <Route path="student-grades" element={<AdminStudentGrades />} />
          <Route path="strands" element={<Strands />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="classrooms" element={<ClassroomsAdmin />} />
          <Route path="forms" element={<FormsAdmin />} />
          <Route path="files" element={<FilesAdmin />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="e-libraries" element={<AdminELibrary />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="recycle-bin" element={<RecycleBin />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>

        {/* Placeholder */}
        {/* TEACHER PROTECTED ROUTES */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<TeacherHome />} />{" "}
          {/* Default redirect to home */}
          <Route path="home" element={<TeacherHome />} />
          <Route path="advisory" element={<TeacherAdvisory />} />
          <Route path="advisory/:id" element={<TeacherAdvisoryDetails />} />
          <Route path="classrooms" element={<TeacherClassrooms />} />
          <Route path="classrooms/:id" element={<ClassroomView />}>
            <Route path="stream" element={<TabStream />} />
            <Route path="people" element={<TabPeople />} />
            <Route path="grades" element={<TabGrades />} />
          </Route>
          <Route path="forms" element={<TeacherForms />} />
          <Route path="forms/:id" element={<FormInside />} />
          <Route path="forms/:id/builder" element={<FormBuilder />} />
          <Route path="files" element={<TeacherFiles />} />
          <Route path="e-library" element={<TeacherELibrary />} />
          <Route path="recycle-bin" element={<TeacherRecycleBin />} />
          {/* Pwede mo rin i-re-use ang Calendar component ng admin dito kapag ready na, o gumawa ng sarili niya */}
          <Route
            path="calendar"
            element={
              <div className="p-5 text-center">Calendar (Coming Soon)</div>
            }
          />
          <Route
            path="notifications"
            element={
              <div className="p-5 text-center">Notifications (Coming Soon)</div>
            }
          />
        </Route>
        <Route
          path="/student/home"
          element={<DashboardPlaceholder title="Student Home" />}
        />

        <Route
          path="*"
          element={
            <h2 className="text-center mt-5 text-danger">
              404 - Page Not Found
            </h2>
          }
        />
      </Routes>
    </>
  );
}

export default App;
