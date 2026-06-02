import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import axios from "axios";
import { sileo } from "sileo";

// Import Bootstrap and Custom CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";

const darkToast = {
  fill: "#242424",
  styles: {
    title: "sileo-toast-title",
    description: "sileo-toast-desc",
  },
};

// Laging isama ang token kapag mag-rerequest sa backend
axios.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("campusloop_token") ||
    sessionStorage.getItem("campusloop_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Laging humingi ng JSON response
  config.headers.Accept = "application/json";
  return config;
});

// Saluhin ang 401 Error kapag na-kick-out ng Single Session
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Kapag nag-401 (Unauthorized) si Laravel
    if (error.response && error.response.status === 401) {
      // Check kung hindi pa tayo nasa login page para hindi mag-loop
      if (window.location.pathname !== "/login") {
        // Burahin ang lumang tokens at user data sa browser
        localStorage.removeItem("campusloop_token");
        sessionStorage.removeItem("campusloop_token");
        localStorage.removeItem("campusloop_user");
        sessionStorage.removeItem("campusloop_user");
        sessionStorage.setItem("session_terminated", "true");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
