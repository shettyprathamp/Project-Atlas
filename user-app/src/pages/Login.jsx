
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      const role = user.role?.toLowerCase();

      switch (role) {
        case "manager":
          navigate("/manager");
          break;

        case "billing":
          navigate("/billing");
          break;

        case "hr":
          navigate("/hr");
          break;

        case "employee":
          navigate("/employee");
          break;

        default:
          setError("Your account does not have a valid role.");
      }
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setError(
      "Please contact your administrator to reset your password."
    );
  };

  return (
    <div className="login-page">
      {/* Background Effects */}
      <div className="login-background-glow login-glow-one" />
      <div className="login-background-glow login-glow-two" />

      <div className="login-card">

        {/* =========================
            BRAND
        ========================== */}
        <div className="login-brand">
          <div className="login-logo">A</div>

          <div className="login-brand-text">
            <h1>Atlas</h1>
            <span>Business Platform</span>
          </div>
        </div>

        {/* =========================
            HEADER
        ========================== */}
        <div className="login-header">
          <h2>Welcome back</h2>
          <p>Sign in to continue to Atlas.</p>
        </div>

        {/* =========================
            LOGIN FORM
        ========================== */}
        <form onSubmit={handleSubmit} className="login-form">

          {/* EMAIL */}
          <div className="form-group">
            <label htmlFor="email">Email address</label>

            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label htmlFor="password">Password</label>

            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* FORGOT PASSWORD */}
            <button
              type="button"
              className="forgot-password"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="login-error">
              <span className="login-error-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-spinner" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* =========================
            FOOTER
        ========================== */}
        <div className="login-footer">
          <span>Secure access</span>
          <span className="login-footer-dot">•</span>
          <span>Atlas</span>
        </div>
      </div>
    </div>
  );
}
