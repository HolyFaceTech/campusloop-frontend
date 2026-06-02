import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { sileo } from "sileo";
import ReCAPTCHA from "react-google-recaptcha";
import AuthLayout from "../../components/Layouts/AuthLayout";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";

const darkToast = {
  fill: "#242424",
  styles: {
    title: "sileo-toast-title",
    description: "sileo-toast-desc",
  },
};

const Login = () => {
  const navigate = useNavigate();
  const recaptchaRef = useRef();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading CampusLoop...");
  const [recaptchaToken, setRecaptchaToken] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("session_terminated") === "true") {
      sileo.error({
        title: "Session Terminated",
        description:
          "Your account was logged in on another device. For security, you have been logged out.",
        ...darkToast,
      });
      sessionStorage.removeItem("session_terminated");
    }

    const checkExistingSession = () => {
      const token =
        localStorage.getItem("campusloop_token") ||
        sessionStorage.getItem("campusloop_token");
      const userStr =
        localStorage.getItem("campusloop_user") ||
        sessionStorage.getItem("campusloop_user");

      if (token && userStr) {
        setLoadingText("Resuming session...");
        try {
          const user = JSON.parse(userStr);
          setTimeout(() => {
            if (user.role === "admin") navigate("/admin/dashboard");
            else if (user.role === "teacher") navigate("/teacher/home");
            else if (user.role === "student") navigate("/student/home");
            else setIsLoading(false);
          }, 800); // 800ms delay para smooth ang transition
          return;
        } catch (error) {
          localStorage.clear();
          sessionStorage.clear();
        }
      }

      // Kung walang naka-login, patayin ang spinner after 800ms para lumabas ang form
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    };

    checkExistingSession();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!recaptchaToken) {
      sileo.warning({
        title: "reCAPTCHA Required",
        description: "Please complete the reCAPTCHA to verify you are human.",
        ...darkToast,
      });
      return;
    }

    setIsLoading(true);
    setLoadingText("Logging you in...");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/login`,
        {
          email: formData.email,
          password: formData.password,
          "g-recaptcha-response": recaptchaToken,
        },
      );

      const { token, user, role } = response.data;
      const storage = formData.rememberMe ? localStorage : sessionStorage;
      storage.setItem("campusloop_token", token);
      storage.setItem("campusloop_user", JSON.stringify(user));

      sileo.success({
        title: "Login Successful",
        description: "Welcome back to CampusLoop!",
        ...darkToast,
      });

      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "teacher") navigate("/teacher/home");
      else if (role === "student") navigate("/student/home");
    } catch (error) {
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setRecaptchaToken("");

      if (error.response) {
        const { status, data } = error.response;

        if (status === 403 && data.require_verification) {
          sileo.info({
            title: "Verification Required",
            description: data.message,
            ...darkToast,
          });
          navigate(`/verify?email=${encodeURIComponent(formData.email)}`);
        } else {
          sileo.error({
            title: "Login Failed",
            description: data.message || "Invalid email or password.",
            ...darkToast,
          });
        }
      } else {
        sileo.error({
          title: "Network Error",
          description: "Please try again later.",
          ...darkToast,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text={loadingText} />

      <AuthLayout illustration="/images/login.svg">
        <div className="w-100" style={{ maxWidth: "400px", margin: "0 auto" }}>
          <div className="mb-4 text-center text-md-start">
            <h2 className="fw-bold" style={{ color: "var(--primary-color)" }}>
              Welcome Back! <span className="wave-icon">👋</span>
            </h2>
            <p className="text-muted">Sign in to your CampusLoop account.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label fw-medium text-dark">
                <i className="bi bi-envelope-at me-1 text-muted"></i> Email
                Address
              </label>
              <input
                type="email"
                name="email"
                className="form-control bg-light py-2 px-3"
                style={{ fontSize: "0.95rem", fontWeight: "400" }}
                placeholder="student@school.edu"
                value={formData.email}
                onChange={handleInputChange}
                autoFocus
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium text-dark">
                <i className="bi bi-key me-1 text-muted"></i> Password
              </label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-control bg-light border-end-0 py-2 px-3"
                  style={{ fontSize: "0.95rem", fontWeight: "400" }}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <span
                  className="input-group-text bg-light cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: "pointer" }}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-eye-slash"
                      viewBox="0 0 16 16"
                    >
                      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755l-.809-.805zm-4.643-2.617L7.14 7.045a2.001 2.001 0 0 1-1.185-1.185l-1.576-1.576A4.983 4.983 0 0 0 3.5 8c0 1.368.611 2.585 1.564 3.42l-.845.845A6.974 6.974 0 0 1 1.5 8s3-5.5 8-5.5c.34 0 .673.04 1 .116l-.806.806c-.06-.007-.128-.012-.194-.012zM8 12.5a5.944 5.944 0 0 1-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="bi bi-eye"
                      viewBox="0 0 16 16"
                    >
                      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                    </svg>
                  )}
                </span>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="rememberMe"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                />
                <label
                  className="form-check-label text-muted"
                  htmlFor="rememberMe"
                >
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                style={{
                  color: "var(--primary-color)",
                  fontWeight: "500",
                  textDecoration: "none",
                }}
              >
                Forgot Password?
              </Link>
            </div>

            <div className="mb-4 d-flex justify-content-center w-100">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={(token) => setRecaptchaToken(token)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-campusloop w-100 rounded-3 d-flex justify-content-center align-items-center gap-2"
              disabled={isLoading}
            >
              <i className="bi bi-person-badge fs-5"></i> Login
            </button>
          </form>
        </div>
      </AuthLayout>
    </>
  );
};

export default Login;
