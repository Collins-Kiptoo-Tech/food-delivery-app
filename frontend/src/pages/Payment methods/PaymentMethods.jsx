import React, { useState, useEffect } from "react";
import "./PaymentMethods.css";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCcVisa, FaCcMastercard, FaPaypal } from "react-icons/fa";

const PaymentMethods = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderData } = location.state || {};
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [savedOrderData, setSavedOrderData] = useState(orderData || null);
  const [loading, setLoading] = useState(false);

  // Persist orderData
  useEffect(() => {
    if (orderData) {
      localStorage.setItem("orderData", JSON.stringify(orderData));
      setSavedOrderData(orderData);
    } else {
      const stored = localStorage.getItem("orderData");
      if (stored) setSavedOrderData(JSON.parse(stored));
      else navigate("/cart");
    }
  }, [orderData, navigate]);

  const handleSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleProceed = () => {
    if (!selectedMethod) return alert("Please select a payment method");

    setLoading(true);

    // simulate payment for all methods including PayPal
    setTimeout(() => {
      navigate("/payment-completed", {
        state: { orderData: savedOrderData, method: selectedMethod },
      });
    }, 1500);
  };

  return (
    <div className="payment-methods-page">
      <h2>Select Payment Method</h2>
      <div className="payment-cards">
        <div
          className={`payment-card ${
            selectedMethod === "M-Pesa" ? "selected" : ""
          }`}
          onClick={() => handleSelect("M-Pesa")}
        >
          <img src="/mpesa-logo.png" alt="M-Pesa" className="payment-icon" />
          <span>M-Pesa</span>
        </div>

        <div
          className={`payment-card ${
            selectedMethod === "Card" ? "selected" : ""
          }`}
          onClick={() => handleSelect("Card")}
        >
          <FaCcVisa className="payment-icon" />
          <FaCcMastercard className="payment-icon" />
          <span>Card</span>
        </div>

        <div
          className={`payment-card ${
            selectedMethod === "PayPal" ? "selected" : ""
          }`}
          onClick={() => handleSelect("PayPal")}
        >
          <FaPaypal className="payment-icon" />
          <span>PayPal</span>
        </div>

        <div
          className={`payment-card ${
            selectedMethod === "airtel-money" ? "selected" : ""
          }`}
          onClick={() => handleSelect("airtel-money")}
        >
          <img src="/airtel.png" alt="Airtel Money" className="payment-icon" />
          <span>Airtel Money</span>
        </div>

        <div
          className={`payment-card ${
            selectedMethod === "Cash Delivery" ? "selected" : ""
          }`}
          onClick={() => handleSelect("Cash Delivery")}
        >
          <img
            src="/cashdelivery.png"
            alt="Cash on Delivery"
            className="payment-icon"
          />
          <span>Cash Delivery</span>
        </div>
      </div>

      {/* Proceed button visible for all methods */}
      <button
        className="proceed-btn"
        onClick={handleProceed}
        disabled={loading}
      >
        {loading ? "Processing..." : "Proceed"}
      </button>
    </div>
  );
};

export default PaymentMethods;
