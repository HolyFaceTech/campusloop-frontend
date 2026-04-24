import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { sileo } from "sileo";
import AuthLayout from "../../components/Layouts/AuthLayout";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";

const darkToast = {
  fill: "#242424",
  styles: {
    title: "sileo-toast-title",
    description: "sileo-toast-desc",
  },
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirmation) {
      sileo.error({
        title: "Update Failed",
        description: "Passwords do not match!",
        ...darkToast,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/reset-password`,
        {
          email: email,
          token: token,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        },
      );

      sileo.success({
        title: "Password Reset",
        description:
          "Your password has been changed successfully. Please log in.",
        ...darkToast,
      });
      navigate("/login");
    } catch (error) {
      if (error.response) {
        const errData = error.response.data;

        if (errData.errors && errData.errors.password) {
          sileo.error({
            title: "Validation Error",
            description: errData.errors.password[0],
            ...darkToast,
          });
        } else {
          sileo.error({
            title: "Reset Failed",
            description:
              errData.message ||
              "Failed to reset password. Link might be invalid or expired.",
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

  const renderEyeIcon = (isVisible) =>
    isVisible ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="currentColor"
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
        viewBox="0 0 16 16"
      >
        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
      </svg>
    );

  if (!token || !email) {
    return (
      <AuthLayout illustration="/images/reset.svg">
        <div className="text-center">
          <h2 className="fw-bold" style={{ color: "var(--primary-color)" }}>
            Link Unavailable <span className="wave-icon">❌</span>
          </h2>

          <p className="text-muted mb-2">
            The password reset link is missing or broken.
          </p>
          <p className="text-muted mb-4">
            Please use the exact link sent to your email.
          </p>

          <button
            onClick={() => navigate("/forgot-password")}
            className="btn btn-campusloop mt-3"
          >
            Request New Link
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text="Resetting Password..." />

      <AuthLayout illustration="/images/reset.svg">
        <div className="w-100" style={{ maxWidth: "400px", margin: "0 auto" }}>
          <div className="mb-4 text-center text-md-start">
            <h2 className="fw-bold" style={{ color: "var(--primary-color)" }}>
              New Password <span className="wave-icon">🔐</span>
            </h2>
            <p className="text-muted">
              Your new password must be at least 8 characters long and contain
              letters, numbers, and symbols.
            </p>
          </div>

          <form onSubmit={handleResetSubmit}>
            {email && (
              <div className="mb-3">
                <p
                  className="fw-bold text-dark bg-light p-3 rounded-3 border shadow-sm mb-0 text-center"
                  style={{ wordBreak: "break-all", letterSpacing: "0.5px" }}
                >
                  {email}
                </p>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label fw-medium text-dark">
                <i className="bi bi-key me-1 text-muted"></i> New Password
              </label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-control form-control-lg bg-light border-end-0"
                  placeholder="New secure password"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoFocus
                  required
                />
                <span
                  className="input-group-text bg-light cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: "pointer" }}
                >
                  {renderEyeIcon(showPassword)}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium text-dark">
                <i className="bi bi-key me-1 text-muted"></i> Confirm New
                Password
              </label>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="password_confirmation"
                  className="form-control form-control-lg bg-light border-end-0"
                  placeholder="Retype password"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  required
                />
                <span
                  className="input-group-text bg-light cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ cursor: "pointer" }}
                >
                  {renderEyeIcon(showConfirmPassword)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-campusloop btn-lg w-100 rounded-3 mb-3 d-flex justify-content-center align-items-center"
              disabled={isLoading}
            >
              Reset Password
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

export default ResetPassword;
