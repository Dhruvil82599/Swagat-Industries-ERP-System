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
    }
    else {
      alert("Invalid username or password. Please try again.");
    }

    // Clear the form fields after submission
    setUsername("");
    setPassword("");

  };

  return (
    <div className="background">
      
      <div className="login-container">
        <div className="logo">

          <img src={logo} alt="Swagat Industries Logo" />
        </div>

        <h2 className="title">Welcome To Swagat Industries</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group input-1">
            <label htmlFor="username">Username</label>

            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter Username"
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
              placeholder="Enter Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="login-btn" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
