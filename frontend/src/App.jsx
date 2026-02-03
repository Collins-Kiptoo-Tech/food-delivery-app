import React, { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder.jsx";
import Footer from "./components/Footer/Footer";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import Verify from "./pages/Verify/Verify";
import MyOrders from "./pages/MyOrders/MyOrders";
import PaymentCompleted from "./pages/PaymentCompleted/PaymentCompleted";
import Blog from "./components/Blog/Blog.jsx";
import PaymentMethods from "./pages/Payment methods/PaymentMethods.jsx";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();

 
  const hideNavbarFooterRoutes = [
    "/payment-completed",
    "/order",
    "/payment-methods",
  ];

  const shouldHide = hideNavbarFooterRoutes.includes(location.pathname);

  return (
    <>
      {/* ✅ Login popup */}
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}

      {/* ✅ Conditionally render Navbar */}
      {!shouldHide && <Navbar setShowLogin={setShowLogin} />}

      {/* ✅ Main content */}
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/payment-methods" element={<PaymentMethods />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/payment-completed" element={<PaymentCompleted />} />
          <Route path="/blog" element={<Blog />} />
        </Routes>
      </div>

      {/* ✅ Conditionally render Footer */}
      {!shouldHide && <Footer />}
    </>
  );
};

export default App;
