import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PaymentMethods.css";
import { FiSmartphone, FiPackage, FiCheck, FiLock } from "react-icons/fi";

const PaymentMethods = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state?.orderData;

  const [selectedMethod, setSelectedMethod] = useState("mpesa");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMPesaPrompt, setShowMPesaPrompt] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhone(value.slice(0, 12));
  };

  const processPayment = async () => {
    if (selectedMethod === "mpesa") {
      if (!phone || phone.length !== 12 || !phone.startsWith("254")) {
        alert("Please enter a valid Safaricom phone number (12 digits starting with 254)");
        return;
      }

      setLoading(true);
      setShowMPesaPrompt(true);
      setPaymentStatus("Sending payment request...");

      try {
        console.log("Sending STK Push request...", {
          phone,
          amount: orderData?.amount || 1
        });

        const res = await fetch("http://localhost:4000/api/mpesa/stkpush", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone,
            amount: Math.max(1, orderData?.amount || 1), // Minimum 1 KES
            orderId: `ORD-${Date.now().toString().slice(-6)}`
          }),
        });

        const data = await res.json();
        console.log("Backend Response:", data);

        // Check if request was successful
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Payment request failed');
        }

        setPaymentStatus("Payment request sent! Check your phone for M-Pesa prompt...");
        alert("✅ Payment request sent! Check your phone for M-Pesa prompt.");

        // Wait 30 seconds for user to complete payment on phone
        setTimeout(() => {
          completeMPesaOrder(data);
        }, 30000); // Wait 30 seconds for payment completion

      } catch (err) {
        console.error("Payment Error:", err);
        alert(`❌ Payment failed: ${err.message}`);
        setPaymentStatus("Payment failed. Please try again.");
        setShowMPesaPrompt(false);
        setLoading(false);
      }

      return;
    }

    // 🚫 Cash on Delivery
    confirmCODOrder();
  };

  const completeMPesaOrder = (paymentData) => {
    const orderDetails = {
      ...orderData,
      address: orderData?.address || {},
      payment: {
        method: "mpesa",
        status: "paid",
        phone,
        amount: orderData?.amount || 0,
        transactionCode: paymentData.checkoutRequestID || `MPESA${Date.now().toString().slice(-8)}`,
        merchantRequestID: paymentData.merchantRequestID,
        customerMessage: paymentData.customerMessage || "Payment completed successfully"
      },
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      status: "paid",
      deliveryTime: "30-45 minutes",
      items: orderData?.items || [],
    };

    // Save to localStorage
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.push(orderDetails);
    localStorage.setItem("orders", JSON.stringify(orders));

    setShowMPesaPrompt(false);
    setLoading(false);

    navigate("/order-confirmation", {
      state: { order: orderDetails, paymentMethod: "mpesa" },
    });
  };

  const confirmCODOrder = async () => {
    if (!orderData) {
      alert("Order data missing. Please go back and try again.");
      navigate("/cart");
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const orderDetails = {
        ...orderData,
        address: orderData.address || {},
        payment: {
          method: "cash",
          status: "pending",
          amount: orderData.amount || 0,
          fee: 50,
        },
        orderId: `COD-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        status: "confirmed",
        deliveryTime: "30-45 minutes",
        items: orderData.items || [],
      };

      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      orders.push(orderDetails);
      localStorage.setItem("orders", JSON.stringify(orders));

      navigate("/order-confirmation", {
        state: { order: orderDetails, paymentMethod: "cash" },
      });
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = orderData?.amount || 0;

  return (
    <div className="payment-page">
      {/* Progress Steps */}
      <div className="payment-progress">
        <div className="progress-step completed">
          <div className="step-icon"><FiCheck /></div>
          <span>Cart</span>
        </div>
        <div className="progress-line completed"></div>
        <div className="progress-step completed">
          <div className="step-icon"><FiCheck /></div>
          <span>Delivery</span>
        </div>
        <div className="progress-line active"></div>
        <div className="progress-step active">
          <div className="step-icon">3</div>
          <span>Payment</span>
        </div>
        <div className="progress-line"></div>
        <div className="progress-step">
          <div className="step-icon">4</div>
          <span>Complete</span>
        </div>
      </div>

      <div className="payment-container">
        <div className="payment-header">
          <h1>Select Payment Method</h1>
          <p>Choose how you'd like to pay for your order</p>
        </div>

        <div className="payment-content">
          {/* LEFT - Order Summary */}
          <div className="order-summary-card">
            <h2>Order Summary</h2>

            {orderData?.items?.map((item, index) => (
              <div className="order-item-summary" key={index}>
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">× {item.quantity}</span>
                </div>
                <span className="item-total">
                  KES {item.price * item.quantity}
                </span>
              </div>
            ))}

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>KES {orderData?.amount - 250 || 0}</span>
              </div>
              <div className="total-row">
                <span>Delivery</span>
                <span>KES 75</span>
              </div>

              {selectedMethod === "cash" && (
                <div className="total-row">
                  <span>COD Fee</span>
                  <span>KES 50</span>
                </div>
              )}

              <div className="total-divider"></div>
              <div className="total-row grand-total">
                <span>Total Amount</span>
                <span className="total-amount">
                  KES {selectedMethod === "cash" ? totalAmount + 50 : totalAmount}
                </span>
              </div>
            </div>

            <div className="secure-badge">
              <FiLock />
              <span>Secure Payment • 100% Protected</span>
            </div>
          </div>

          {/* RIGHT - Payment Methods */}
          <div className="payment-methods-card">
            <h2>Payment Options</h2>

            {/* M-Pesa */}
            <div
              className={`payment-option ${selectedMethod === "mpesa" ? "selected" : ""}`}
              onClick={() => setSelectedMethod("mpesa")}
            >
              <div className="option-header">
                <div className="option-icon"><FiSmartphone /></div>
                <div className="option-info">
                  <h3>M-Pesa</h3>
                  <p>Pay instantly with M-Pesa. You'll receive a payment prompt.</p>
                </div>
                <input type="radio" checked={selectedMethod === "mpesa"} readOnly />
              </div>

              {selectedMethod === "mpesa" && (
                <div className="mpesa-details">
                  <label>Enter your M-Pesa phone number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="254708374149"
                    maxLength="12"
                  />
                  <small className="phone-hint">
                    Use test number: <strong>254708374149</strong> (PIN: 1234)
                  </small>
                </div>
              )}
            </div>

            {/* Cash on Delivery */}
            <div
              className={`payment-option ${selectedMethod === "cash" ? "selected" : ""}`}
              onClick={() => setSelectedMethod("cash")}
            >
              <div className="option-header">
                <div className="option-icon"><FiPackage /></div>
                <div className="option-info">
                  <h3>Cash on Delivery</h3>
                  <p>Pay with cash when your order arrives</p>
                  <small className="cod-fee">Extra KES 50 handling fee applies</small>
                </div>
                <input type="radio" checked={selectedMethod === "cash"} readOnly />
              </div>
            </div>

            <button 
              className="pay-button" 
              onClick={processPayment} 
              disabled={loading || (selectedMethod === "mpesa" && !phone)}
            >
              {loading ? "Processing..." : selectedMethod === "mpesa" ? "Pay with M-Pesa" : "Confirm Cash Order"}
            </button>
          </div>
        </div>
      </div>

      {/* M-Pesa Waiting Modal */}
      {showMPesaPrompt && (
        <div className="mpesa-modal-overlay">
          <div className="mpesa-modal">
            <div className="modal-header">
              <div className="mpesa-logo">M-PESA</div>
              <button 
                className="close-modal" 
                onClick={() => {
                  setShowMPesaPrompt(false);
                  setLoading(false);
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="payment-status">
                <p><strong>KES {totalAmount}</strong></p>
                <p>Payment request sent to <strong>+{phone}</strong></p>
                <p className="status-message">{paymentStatus}</p>
                <p>Please enter your M-Pesa PIN on your phone.</p>
                <div className="test-info">
                  <small>
                    <strong>Sandbox Test Instructions:</strong><br />
                    Phone: <strong>254708374149</strong><br />
                    PIN: <strong>1234</strong><br />
                    Amount: <strong>KES {totalAmount}</strong>
                  </small>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="confirm-btn" disabled>
                ⏳ Waiting for payment...
              </button>
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowMPesaPrompt(false);
                  setLoading(false);
                }}
              >
                Cancel Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;