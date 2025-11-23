import React, { useState, useContext, useEffect } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { assets } from "../../assets/assets";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { getTotalCartCount, token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 50) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className={`navbar ${showNavbar ? "visible" : "hidden"}`}>
    
      <Link to="/" className="logo-link">
        <img src={assets.logo} alt="logo" className="logo" />
      </Link>  
      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => setMenu("home")}
          className={menu === "home" ? "active" : ""}
        >
          Home
        </Link>
        <a
          href="#explore-menu"
          onClick={() => setMenu("menu")}
          className={menu === "menu" ? "active" : ""}
        >
          Menu
        </a>
        <a
          href="#footer"
          onClick={() => setMenu("contact-us")}
          className={menu === "contact-us" ? "active" : ""}
        >
          Contact Us
        </a>
        <a
          href="#blog"
          onClick={() => setMenu("blog")}
          className={menu === "blog" ? "active" : ""}
        >
          Blog
        </a>
      </ul>     
      <div className="navbar-right">
        
        <Link to="/cart" className="navbar-search-icon">
          <FaShoppingCart className="icon" size={28} />
          {getTotalCartCount() > 0 && (
            <div className="cart-count">{getTotalCartCount()}</div>
          )}
        </Link>
        {!token ? (
          <button onClick={() => setShowLogin(true)}>Sign In</button>
        ) : (
          <div className="navbar-profile">
            <FaUserCircle className="icon profile-icon" size={28} />
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate("/myorders")}>Orders</li>
              <hr />
              <li onClick={logout}>Logout</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;

