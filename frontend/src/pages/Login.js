import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  ensureRecaptcha,
  firebaseReady
} from "../services/firebase";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpResult, setOtpResult] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (!identifier || !password) {
        setError("Email and password are required.");
        return;
      }
      setStatus("loading");
      const { data } = await api.post("/api/auth/login", {
        email: identifier,
        password,
      });

      // token save
      localStorage.setItem("userInfo", JSON.stringify(data));

      alert("Login successful");
      window.location.href = "/";
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Login failed. Please try again.";
      setError(message);
      alert(message);
    } finally {
      setStatus("idle");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    if (!firebaseReady || !auth || !googleProvider) {
      setError("Firebase is not configured.");
      return;
    }
    try {
      setStatus("loading");
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const { data } = await api.post("/api/auth/firebase", { idToken });
      localStorage.setItem("userInfo", JSON.stringify(data));
      window.location.href = "/";
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Google sign-in failed.";
      setError(message);
    } finally {
      setStatus("idle");
    }
  };

  const handleSendOtp = async () => {
    setError("");
    if (!firebaseReady || !auth) {
      setError("Firebase is not configured.");
      return;
    }
    if (!phone) {
      setError("Enter phone number in +91XXXXXXXXXX format.");
      return;
    }
    try {
      setStatus("loading");
      const verifier = ensureRecaptcha();
      if (!verifier) {
        setError("Recaptcha is not ready.");
        return;
      }
      const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
      setOtpResult(confirmation);
    } catch (err) {
      const message =
        err?.message || "Failed to send OTP. Try again.";
      setError(message);
    } finally {
      setStatus("idle");
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (!otpResult) {
      setError("Please request OTP first.");
      return;
    }
    if (!otp) {
      setError("Enter the OTP.");
      return;
    }
    try {
      setStatus("loading");
      const result = await otpResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      const { data } = await api.post("/api/auth/firebase", { idToken });
      localStorage.setItem("userInfo", JSON.stringify(data));
      window.location.href = "/";
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "OTP verification failed.";
      setError(message);
    } finally {
      setStatus("idle");
    }
  };

  const handleForgotPassword = () => {
    setError("Password reset is not configured yet.");
  };

  return (
    <form onSubmit={submitHandler} className="form auth-card">
      <h2>Sign in</h2>
      <p className="muted">Welcome back. Use your email, phone, or Google.</p>

      {error && <p className="alert error">{error}</p>}

      <button
        type="button"
        className="button secondary social-button"
        onClick={handleGoogleLogin}
        disabled={status === "loading"}
      >
        Continue with Google
      </button>

      <div className="auth-divider">
        <span>Or sign in with email and password</span>
      </div>

      <input
        className="input"
        type="text"
        placeholder="Email"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />

      <input
        className="input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="auth-actions">
        <label className="checkbox">
          <input type="checkbox" />
          <span className="muted">Keep me signed in</span>
        </label>
        <button type="button" className="link" onClick={handleForgotPassword}>
          Forgot password?
        </button>
      </div>

      <button className="button" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Signing in..." : "Sign in"}
      </button>

      <div className="auth-divider">
        <span>Or verify with phone number</span>
      </div>

      <input
        className="input"
        type="tel"
        placeholder="Phone number (+91XXXXXXXXXX)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <div className="form-grid">
        <button
          type="button"
          className="button secondary"
          onClick={handleSendOtp}
          disabled={status === "loading"}
        >
          Send OTP
        </button>
        <input
          className="input"
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="button"
        onClick={handleVerifyOtp}
        disabled={status === "loading"}
      >
        Verify & Sign in
      </button>

      <div id="recaptcha-container" />

      <p className="muted auth-footer">
        New to BazzarIndia?{" "}
        <Link to="/register" className="link">
          Create your account
        </Link>
      </p>
    </form>
  );
};

export default Login;
