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

  const { getTotalCartCount, token, setToken, userData } = useContext(StoreContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
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
              {/* User Info Header - Shows real logged in user */}
              <li className="dropdown-header">
                <div className="user-info">
                  <span className="user-name">{userData?.name || "User"}</span>
                  <span className="user-email">{userData?.email || "user@email.com"}</span>
                </div>
              </li>
              
              {/* My Profile */}
              <li onClick={() => navigate("/profile")} className="dropdown-item">
                <span className="item-icon">👤</span>
                <span>My Profile</span>
              </li>
              
              {/* Orders */}
              <li onClick={() => navigate("/myorders")} className="dropdown-item">
                <span className="item-icon">📦</span>
                <span>Orders</span>
              </li>
              
              {/* Favorites */}
              <li onClick={() => navigate("/favorites")} className="dropdown-item">
                <span className="item-icon">❤️</span>
                <span>Favorites</span>
              </li>
              
              {/* Saved Addresses */}
              <li onClick={() => navigate("/addresses")} className="dropdown-item">
                <span className="item-icon">📍</span>
                <span>Saved Addresses</span>
              </li>
              
              {/* Payment Methods */}
              <li onClick={() => navigate("/payment-methods")} className="dropdown-item">
                <span className="item-icon">💳</span>
                <span>Payment Methods</span>
              </li>
              
              {/* Help & Support */}
              <li onClick={() => navigate("/support")} className="dropdown-item">
                <span className="item-icon">❓</span>
                <span>Help & Support</span>
              </li>
              
              {/* Settings */}
              <li onClick={() => navigate("/settings")} className="dropdown-item">
                <span className="item-icon">⚙️</span>
                <span>Settings</span>
              </li>
              
              <hr className="dropdown-divider" />
              
              {/* Logout */}
              <li onClick={logout} className="dropdown-item logout">
                <span className="item-icon">🚪</span>
                <span>Logout</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;