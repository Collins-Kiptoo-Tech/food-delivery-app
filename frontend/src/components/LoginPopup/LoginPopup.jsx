import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken, setUserData } = useContext(StoreContext); // Add setUserData

  const [currState, setCurrState] = useState("Sign Up");
  const [data, setData] = useState({ name: "", email: "", password: "" });

  const onChangeHandler = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onLogin = async (e) => {
    e.preventDefault();
    try {
      const endpoint =
        currState === "Login" ? "/api/user/login" : "/api/user/register";
      const response = await axios.post(url + endpoint, data);
      const resData = response.data;
      console.log("LOGIN/REGISTER RESPONSE:", resData);

      if (resData.success) {
        // Save token
        setToken(resData.token);
        localStorage.setItem("token", resData.token);
        
        // Save user ID
        localStorage.setItem("userId", resData.user._id);
        
        // Save user data (name and email)
        const userData = {
          name: resData.user.name,
          email: resData.user.email
        };
        
        // Save to context
        setUserData(userData);
        
        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        
        console.log("User data saved:", userData);
        
        setShowLogin(false);
      } else {
        alert(resData.message);
      }
    } catch (err) {
      console.error("Login/Register error:", err);
      alert("Login failed. Check console for details.");
    }
  };

  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt=""
          />
        </div>

        <div className="login-popup-inputs">
          {currState === "Sign Up" && (
            <input
              name="name"
              value={data.name}
              onChange={onChangeHandler}
              placeholder="Your name"
              required
            />
          )}
          <input
            name="email"
            value={data.email}
            onChange={onChangeHandler}
            type="email"
            placeholder="Your email"
            required
          />
          <input
            name="password"
            value={data.password}
            onChange={onChangeHandler}
            type="password"
            placeholder="Your password"
            required
          />
        </div>

        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>

        <button type="submit">
          {currState === "Sign Up" ? "Create Account" : "Login"}
        </button>

        {currState === "Login" ? (
          <p>
            Create a new account?{" "}
            <span onClick={() => setCurrState("Sign Up")}>Click here</span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span onClick={() => setCurrState("Login")}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;