import React, { useState, useEffect, useRef } from "react";
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

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id");
  const hash = searchParams.get("hash");
  const emailParam = searchParams.get("email");
  const expires = searchParams.get("expires");
  const [email, setEmail] = useState(emailParam || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const hasAttemptedVerification = useRef(false);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  useEffect(() => {
    const verifyAccount = async () => {
      if (hasAttemptedVerification.current) return;
      hasAttemptedVerification.current = true;

      setIsVerifying(true);

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/verify-email`,
          { id: id, hash: hash, expires: expires },
        );

        sileo.success({
          title: "Account Verified",
          description:
            response.data.message ||
            "Account successfully verified and activated!",
          ...darkToast,
        });

        navigate("/login", { replace: true });
      } catch (error) {
        const errorMsg =
          error.response?.data?.message ||
          "Invalid or expired verification link.";

        if (
          errorMsg.includes("already been used") ||
          errorMsg.includes("already active")
        ) {
          sileo.info({
            title: "Already Verified",
            description: "Your account is already active. You can now log in.",
            ...darkToast,
          });
          navigate("/login", { replace: true });
        } else {
          sileo.error({
            title: "Verification Failed",
            description: errorMsg,
            ...darkToast,
          });

          if (emailParam) {
            setSearchParams({ email: emailParam }, { replace: true });
          } else {
            setSearchParams({}, { replace: true });
          }
        }
      } finally {
        setIsVerifying(false);
      }
    };

    if (id && hash && expires) {
      verifyAccount();
    }
  }, [id, hash, expires, emailParam, navigate, setSearchParams]);

  const handleResend = async () => {
    if (!email) {
      sileo.error({
        title: "Email Missing",
        description:
          "Email address is missing. Please log in again to request a new link.",
        ...darkToast,
      });
      return navigate("/login");
    }

    setIsResending(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/resend-verification`,
        { email: email },
      );

      sileo.success({
        title: "Email Sent",
        description:
          response.data.message || "Verification email sent successfully.",
        ...darkToast,
      });
    } catch (error) {
      sileo.error({
        title: "Request Failed",
        description:
          error.response?.data?.message ||
          "Failed to send verification email. Please try again.",
        ...darkToast,
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <GlobalSpinner
        isLoading={isVerifying || isResending}
        text={isVerifying ? "Verifying Account..." : "Sending Email..."}
      />

      <AuthLayout illustration="/images/verify.svg">
        <div
          className="w-100 text-center"
          style={{ maxWidth: "400px", margin: "0 auto" }}
        >
          <div className="mb-4">
            <h2 className="fw-bold" style={{ color: "var(--primary-color)" }}>
              Verify Your Email <span className="wave-icon">✉️</span>
            </h2>
            <p className="text-muted mt-2">
              You need to verify your email address before you can access the
              dashboard.
            </p>

            {email && (
              <div className="mt-3">
                <p
                  className="form-control fw-bold text-dark bg-light py-2 px-3 text-center"
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: "400",
                    wordBreak: "break-all",
                    letterSpacing: "0.5px",
                  }}
                >
                  {email}
                </p>
              </div>
            )}
          </div>

          <div
            className="mb-4 text-start text-muted"
            style={{ fontSize: "0.9rem" }}
          >
            <p>
              We've sent a verification link to your email address. Please check
              your inbox and click the link to activate your account.
            </p>
            <p className="mb-0">
              If you don't see the email, check your spam folder or click the
              button below to resend.
            </p>
          </div>

          <button
            onClick={handleResend}
            className="btn btn-campusloop w-100 rounded-3 mb-3 d-flex justify-content-center align-items-center gap-2"
            disabled={isResending || isVerifying}
          >
            <i className="bi bi-envelope-arrow-up fs-5"></i> Resend Verification
            Email
          </button>

          <div>
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
        </div>
      </AuthLayout>
    </>
  );
};

export default EmailVerification;
