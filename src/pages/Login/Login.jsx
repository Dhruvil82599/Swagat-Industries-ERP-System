import logo from "../../assets/Swagat Industries.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username === "admin" && password === "admin") {
      navigate("/admin");
    } else {
      alert("Invalid username or password. Please try again.");
    }

    setUsername("");
    setPassword("");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <aside className="login-panel">
          <div className="brand-block">
            <img src={logo} alt="Swagat Industries Logo" />
            <div>
              <p className="brand-label">Swagat Industries</p>
              <p className="brand-note">ERP portal for operations and inventory.</p>
            </div>
          </div>

          <h1>Secure access for your team</h1>
          <p>Sign in to manage customers, reports, and dashboard insights instantly.</p>

          <div className="accent-row">
            <span className="accent-dot" />
            <span className="accent-dot" />
            <span className="accent-dot" />
          </div>
        </aside>

        <section className="login-form-section">
          <div className="form-head">
            <p className="eyebrow">Welcome back</p>
            <h2>Login to your ERP account</h2>
            <p className="subtitle">Enter your credentials below to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group input-1">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="form-group input-2">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-footer">
              <button className="login-btn" type="submit">
                Login
              </button>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Login;
