import { useState } from "react";
import api from "../services/api";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (!name || !email || !password) {
        setError("Name, email, and password are required.");
        return;
      }
      setStatus("loading");
      const { data } = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });

      localStorage.setItem("userInfo", JSON.stringify(data));

      alert("Registration successful");
      window.location.href = "/";
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed. Please try again.";
      setError(message);
      alert(message);
    } finally {
      setStatus("idle");
    }
  };

  return (
    <form onSubmit={submitHandler} className="form">
      <h2>Register</h2>
      <p className="muted">Create an account to track orders.</p>

      {error && <p>{error}</p>}

      <input
        className="input"
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="input"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="button" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Registering..." : "Register"}
      </button>
    </form>
  );
};

export default Register;
