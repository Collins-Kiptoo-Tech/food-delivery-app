import React, { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import { Route, Routes } from "react-router-dom";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder.jsx";
import Footer from "./components/Footer/Footer";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import Verify from "./pages/Verify/Verify";
import MyOrders from "./pages/MyOrders/MyOrders";
import PaymentCompleted from "./pages/PaymentCompleted/PaymentCompleted";
import Blog from "./components/Blog/Blog.jsx";
import AddFood from "./pages/AddFood/AddFood";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/payment-completed" element={<PaymentCompleted />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/addfood" element={<AddFood />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;
