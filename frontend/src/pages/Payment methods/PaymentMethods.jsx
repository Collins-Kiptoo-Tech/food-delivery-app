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
  const [pin, setPin] = useState("");

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setPhone(value.slice(0, 12)); // Limit to 12 digits
  };

  const processPayment = async () => {
    if (selectedMethod === "mpesa") {
      // Validate phone number
      if (!phone || phone.length !== 12 || !phone.startsWith("2547")) {
        alert("Please enter a valid Safaricom phone number (12 digits starting with 2547)");
        return;
      }
      setShowMPesaPrompt(true);
    } else {
      // Cash on Delivery
      confirmCODOrder();
    }
  };

  const confirmCODOrder = async () => {
    console.log("Confirming COD order..."); // Debug log
    
    // Validate order data exists
    if (!orderData) {
      console.error("No order data found!");
      alert("Order data missing. Please go back and try again.");
      navigate("/cart");
      return;
    }

    setLoading(true);
    
    try {
      // Simulate order confirmation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const orderDetails = {
        ...orderData,
        address: orderData.address || {},
        payment: {
          method: "cash",
          status: "pending",
          amount: orderData.amount || 0,
          fee: 50 // COD handling fee
        },
        orderId: `COD-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        status: "confirmed",
        deliveryTime: "30-45 minutes",
        items: orderData.items || []
      };
      
      console.log("Order details created:", orderDetails); // Debug log
      
      // Save to localStorage
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      orders.push(orderDetails);
      localStorage.setItem("orders", JSON.stringify(orders));
      
      console.log("Saved to localStorage, navigating..."); // Debug log
      
      // Navigate to order confirmation page
      navigate("/order-confirmation", { 
        state: { 
          order: orderDetails,
          paymentMethod: "cash"
        }
      });
      
    } catch (error) {
      console.error("Error confirming COD order:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const confirmMPesaPayment = async () => {
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      alert("Please enter a valid 4-digit PIN");
      return;
    }

    setLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const transaction = {
        id: `MPESA_${Date.now()}`,
        amount: orderData?.amount || 0,
        phone: phone,
        method: "mpesa",
        timestamp: new Date().toISOString(),
        status: "success",
        transactionCode: `TEST${Date.now().toString().slice(-6)}`
      };
      
      const orderDetails = {
        ...orderData,
        address: orderData?.address || {},
        payment: transaction,
        orderId: `ORD-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        status: "paid",
        deliveryTime: "30-45 minutes",
        items: orderData?.items || []
      };
      
      // Save to localStorage
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      orders.push(orderDetails);
      localStorage.setItem("orders", JSON.stringify(orders));
      
      setShowMPesaPrompt(false);
      
      // Navigate to order confirmation page
      navigate("/order-confirmation", { 
        state: { 
          order: orderDetails,
          paymentMethod: "mpesa"
        }
      });
      
    } catch (error) {
      console.error("Error confirming M-Pesa payment:", error);
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
          {/* Left - Order Summary */}
          <div className="order-summary-card">
            <h2>Order Summary</h2>
            
            {orderData?.items?.map((item, index) => (
              <div className="order-item-summary" key={index}>
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">× {item.quantity}</span>
                </div>
                <span className="item-total">KES {item.price * item.quantity}</span>
              </div>
            ))}
            
            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>KES {orderData?.amount - 250 || 0}</span>
              </div>
              <div className="total-row">
                <span>Delivery</span>
                <span>KES 250</span>
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

          {/* Right - Payment Methods */}
          <div className="payment-methods-card">
            <h2>Payment Options</h2>
            
            {/* M-Pesa Option */}
            <div 
              className={`payment-option ${selectedMethod === "mpesa" ? "selected" : ""}`}
              onClick={() => setSelectedMethod("mpesa")}
            >
              <div className="option-header">
                <div className="option-icon">
                  <FiSmartphone />
                </div>
                <div className="option-info">
                  <h3>M-Pesa</h3>
                  <p>Pay instantly with M-Pesa. You'll receive a payment prompt.</p>
                </div>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  checked={selectedMethod === "mpesa"}
                  readOnly
                />
              </div>
              
              {selectedMethod === "mpesa" && (
                <div className="mpesa-details">
                  <label>Enter your M-Pesa phone number</label>
                  <div className="phone-input-group">
                    <input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="254712345678"
                      maxLength="12"
                      className="phone-input"
                    />
                  </div>
                  <small className="hint">
                    Enter your 12-digit Safaricom number starting with 2547
                  </small>
                  
                  {phone && (
                    <div className="phone-display">
                      <small>
                        You'll receive prompt on: <strong>+{phone}</strong>
                      </small>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cash on Delivery Option */}
            <div 
              className={`payment-option ${selectedMethod === "cash" ? "selected" : ""}`}
              onClick={() => setSelectedMethod("cash")}
            >
              <div className="option-header">
                <div className="option-icon">
                  <FiPackage />
                </div>
                <div className="option-info">
                  <h3>Cash on Delivery</h3>
                  <p>Pay with cash when your order arrives</p>
                  <small className="cod-fee">Extra KES 50 handling fee applies</small>
                </div>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  checked={selectedMethod === "cash"}
                  readOnly
                />
              </div>
              
              {selectedMethod === "cash" && (
                <div className="cod-details">
                  <div className="cod-info">
                    <p>• Pay with cash when your order arrives</p>
                    <p>• Exact change is appreciated</p>
                    <p>• Delivery agent will provide receipt</p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Button */}
            <button 
              className="pay-button"
              onClick={processPayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  {selectedMethod === "mpesa" ? "Pay with M-Pesa" : "Confirm Cash Order"}
                  <span className="amount">
                    KES {selectedMethod === "cash" ? totalAmount + 50 : totalAmount}
                  </span>
                </>
              )}
            </button>

            <div className="back-to-delivery">
              <button 
                className="back-button"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                ← Back to Delivery Info
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* M-Pesa PIN Prompt Modal */}
      {showMPesaPrompt && (
        <div className="mpesa-modal-overlay">
          <div className="mpesa-modal">
            <div className="modal-header">
              <div className="mpesa-logo">M-PESA</div>
              <button 
                className="close-modal"
                onClick={() => {
                  setShowMPesaPrompt(false);
                  setPin("");
                }}
                disabled={loading}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="payment-info">
                <p className="amount-label">Pay Amount</p>
                <p className="amount">KES {totalAmount}</p>
                <p className="business">to <strong>FRESH FEAST</strong></p>
                <p className="account">Business No: 123456</p>
              </div>
              
              <div className="sender-info">
                <p>From: +{phone}</p>
              </div>
              
              <div className="pin-section">
                <label>Enter your M-PESA PIN</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="Enter 4-digit PIN"
                  maxLength="4"
                  autoFocus
                  disabled={loading}
                />
                <small>For testing, use any 4 digits (e.g., 1234)</small>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowMPesaPrompt(false);
                  setPin("");
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn"
                onClick={confirmMPesaPayment}
                disabled={pin.length !== 4 || loading}
              >
                {loading ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;