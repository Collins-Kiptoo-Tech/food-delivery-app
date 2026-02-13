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
import TrackOrder from "./pages/TrackOrder/TrackOrder.jsx"; // ✅ 1. ADD THIS IMPORT

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();

  const hideNavbarFooterRoutes = [
    "/payment-completed",
    "/order",
    "/payment-methods",
    "/order-confirmation",
    "/track-order", // ✅ 2. ADD THIS TO HIDE NAVBAR
  ];

  // ✅ 3. ALSO HIDE NAVBAR FOR ANY /track-order/ORDERID ROUTES
  const shouldHide = hideNavbarFooterRoutes.includes(location.pathname) || 
                    location.pathname.startsWith("/track-order/");

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
          <Route path="/order-confirmation" element={<PaymentCompleted />} /> 
          <Route path="/blog" element={<Blog />} />
          {/* ✅ 4. ADD THE TRACK ORDER ROUTE WITH DYNAMIC ORDER ID */}
          <Route path="/track-order/:orderId" element={<TrackOrder />} />
        </Routes>
      </div>

      {/* ✅ Conditionally render Footer */}
      {!shouldHide && <Footer />}
    </>
  );
};

export default App;
