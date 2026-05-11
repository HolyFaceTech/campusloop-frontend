import React, { useState, useRef } from "react";
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

const ForgotPassword = () => {
  const navigate = useNavigate();
  const recaptchaRef = useRef();

  const [email, setEmail] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotSubmit = async (e) => {
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

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/forgot-password`,
        {
          email: email,
          "g-recaptcha-response": recaptchaToken,
        },
      );

      sileo.success({
        title: "Email Sent",
        description: response.data.message,
        ...darkToast,
      });
      navigate("/login");
    } catch (error) {
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setRecaptchaToken("");

      if (error.response) {
        sileo.error({
          title: "Request Failed",
          description:
            error.response.data.message || "Failed to send reset link.",
          ...darkToast,
        });
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
      <GlobalSpinner isLoading={isLoading} text="Sending Reset Link..." />

      <AuthLayout illustration="/images/forgot.svg">
        <div className="w-100" style={{ maxWidth: "400px", margin: "0 auto" }}>
          <div className="mb-4 text-center text-md-start">
            <h2 className="fw-bold" style={{ color: "var(--primary-color)" }}>
              Forgot Password <span className="wave-icon">❓</span>
            </h2>
            <p className="text-muted">
              Enter your registered email and we'll send you instructions to
              reset your password.
            </p>
          </div>

          <form onSubmit={handleForgotSubmit}>
            <div className="mb-4">
              <label className="form-label fw-medium text-dark">
                <i className="bi bi-envelope-at me-1 text-muted"></i> Email
                Address
              </label>
              <input
                type="email"
                className="form-control bg-light py-2 px-3"
                style={{ fontSize: "0.95rem", fontWeight: "400" }}
                placeholder="Enter registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
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
              className="btn btn-campusloop w-100 rounded-3 mb-3 d-flex justify-content-center align-items-center gap-2"
              disabled={isLoading}
            >
              <i className="bi bi-arrow-repeat fs-5"></i> Send Reset Link
            </button>

            <div className="text-center">
              <span className="text-muted">Remember your password? </span>
              <Link
                to="/login"
                style={{
                  color: "var(--primary-color)",
                  fontWeight: "500",
                  textDecoration: "none",
                }}
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </AuthLayout>
    </>
  );
};

export default ForgotPassword;
