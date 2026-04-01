import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import "./PaymentMethods.css";
import { 
  FiPackage, 
  FiCheck, 
  FiLock, 
  FiDollarSign,
  FiArrowRight,
  FiClock,
  FiShield,
  FiTruck
} from "react-icons/fi";
import { FaPaypal } from "react-icons/fa";
import axios from "axios";

const PaymentMethods = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state?.orderData;

  console.log("🔍 PaymentMethods - Component Mounted");
  console.log("🔍 orderData received:", orderData);
  console.log("🔍 orderData items:", orderData?.items);

  const [selectedMethod, setSelectedMethod] = useState("paypal");
  const [loading, setLoading] = useState(false);
  const [paypalError, setPaypalError] = useState("");

  const totalAmount = orderData?.total || orderData?.amount || 0;
  const codFee = 50;
  const finalAmount = selectedMethod === "cash" ? totalAmount + codFee : totalAmount;

  const token = localStorage.getItem("token");
  console.log("🔍 Token exists:", !!token);

  const paypalOptions = {
    "client-id": "AQ58xWEITgxA4_AdIxuo8AjogaZxr9v1jLDiuQ92ZSrhqhEv5QLZ0-GfGKPH8wJmMySaj2aTOzFHEoM1",
    currency: "USD",
    intent: "capture",
  };

  // Function to save order to backend
  const saveOrderToBackend = async (orderDetails) => {
    try {
      console.log("🔴 SAVING TO BACKEND");
      console.log("🔴 URL:", "http://localhost:4000/api/order/place");
      console.log("🔴 Order details:", orderDetails);
      console.log("🔴 Token being used:", token);
      
      const response = await axios.post(
        "http://localhost:4000/api/order/place",
        orderDetails,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Backend response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Backend save failed:", error.message);
      console.error("❌ Error response:", error.response?.data);
      return null;
    }
  };

  const getEstimatedDelivery = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 45);
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle successful PayPal payment
  const onApprove = async (data, actions) => {
    console.log("🟢 onApprove CALLED - PayPal payment successful");
    try {
      setLoading(true);
      const details = await actions.order.capture();
      console.log("✅ PayPal payment captured:", details);
      
      const orderDetails = {
        items: orderData?.items || [],
        amount: totalAmount,
        address: orderData?.address || {},
        paymentMethod: "paypal",
        paymentStatus: "paid",
        payment: {
          method: "paypal",
          status: "paid",
          email: details.payer.email_address,
          amount: totalAmount,
          transactionId: details.id,
          date: new Date().toISOString()
        },
        specialInstructions: orderData?.instructions || "",
        estimatedDelivery: getEstimatedDelivery(),
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        orderId: `ORD-${Date.now().toString().slice(-6)}`,
        orderDate: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        status: "confirmed"
      };

      console.log("📦 Calling saveOrderToBackend for PayPal order...");
      await saveOrderToBackend(orderDetails);
      
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      const newOrder = {
        ...orderDetails,
        id: Date.now(),
        items: orderDetails.items.length,
        total: totalAmount
      };
      
      existingOrders.push(newOrder);
      localStorage.setItem("orders", JSON.stringify(existingOrders));
      localStorage.setItem(`order_${newOrder.orderId}`, JSON.stringify(newOrder));

      console.log("✅ PayPal order saved, navigating to confirmation");
      navigate("/order-confirmation", {
        state: { 
          order: newOrder, 
          paymentMethod: "paypal",
          paymentStatus: "paid"
        },
      });
    } catch (err) {
      console.error("❌ PayPal error:", err);
      setPaypalError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Complete Cash on Delivery order
  const confirmCODOrder = async () => {
    console.log("🟢 confirmCODOrder CALLED - Cash on Delivery");
    console.log("🟢 orderData:", orderData);
    
    if (!orderData) {
      console.log("❌ No orderData!");
      alert("Order data missing. Please go back and try again.");
      navigate("/cart");
      return;
    }

    setLoading(true);

    try {
      console.log("📦 Creating order details for cash order...");
      const orderDetails = {
        items: orderData?.items || [],
        amount: finalAmount,
        address: orderData?.address || {},
        paymentMethod: "cash",
        paymentStatus: "pending",
        payment: {
          method: "cash",
          status: "pending",
          amount: totalAmount,
          fee: codFee,
        },
        specialInstructions: orderData?.instructions || "",
        estimatedDelivery: getEstimatedDelivery(),
        orderNumber: `COD-${Date.now().toString().slice(-6)}`,
        orderId: `COD-${Date.now().toString().slice(-6)}`,
        orderDate: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        status: "confirmed"
      };

      console.log("📦 Calling saveOrderToBackend for cash order...");
      await saveOrderToBackend(orderDetails);
      
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      const newOrder = {
        ...orderDetails,
        id: Date.now(),
        items: orderDetails.items.length,
        total: finalAmount,
        codFee: codFee
      };
      
      existingOrders.push(newOrder);
      localStorage.setItem("orders", JSON.stringify(existingOrders));
      localStorage.setItem(`order_${newOrder.orderId}`, JSON.stringify(newOrder));

      console.log("✅ Cash order saved, navigating to confirmation");
      setLoading(false);
      
      navigate("/order-confirmation", {
        state: { 
          order: newOrder, 
          paymentMethod: "cash",
          paymentStatus: "pending"
        },
      });
    } catch (error) {
      console.error("❌ Order error:", error);
      alert("Failed to confirm order. Please try again.");
      setLoading(false);
    }
  };

  if (!orderData) {
    console.log("❌ No order data, redirecting to cart");
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h2>No order data found</h2>
        <button onClick={() => navigate("/cart")}>Go to Cart</button>
      </div>
    );
  }

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
          <h1>Complete Your Payment</h1>
          <p>Choose your preferred payment method to complete your order</p>
        </div>

        <div className="payment-content">
          {/* LEFT - Order Summary */}
          <div className="order-summary-card">
            <div className="card-header">
              <h2>Order Summary</h2>
              <span className="item-badge">{orderData?.items?.length || 0} items</span>
            </div>

            <div className="restaurant-info">
              <img 
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&h=100&fit=crop" 
                alt="Restaurant" 
                className="restaurant-logo"
              />
              <div>
                <h3>FreshFeast Kitchen</h3>
                <p>Preparing your meal with care</p>
              </div>
            </div>

            <div className="order-items-list">
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
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>KES {totalAmount - 75}</span>
              </div>
              <div className="total-row">
                <span>Delivery Fee</span>
                <span>KES 75</span>
              </div>

              {selectedMethod === "cash" && (
                <div className="total-row cod-fee-row">
                  <span>Cash on Delivery Fee</span>
                  <span>KES {codFee}</span>
                </div>
              )}

              <div className="total-divider"></div>
              <div className="total-row grand-total">
                <span>Total Amount</span>
                <span className="total-amount">
                  KES {finalAmount}
                </span>
              </div>
            </div>

            <div className="delivery-estimate">
              <FiTruck className="icon" />
              <div>
                <span>Estimated Delivery</span>
                <strong>30-45 minutes</strong>
              </div>
            </div>

            <div className="secure-badge">
              <FiShield />
              <span>Secure Payment • 100% Protected</span>
            </div>
          </div>

          {/* RIGHT - Payment Methods */}
          <div className="payment-methods-card">
            <h2>Select Payment Method</h2>

            {/* PayPal */}
            <div
              className={`payment-option ${selectedMethod === "paypal" ? "selected" : ""}`}
              onClick={() => setSelectedMethod("paypal")}
            >
              <div className="option-header">
                <div className="option-icon paypal-icon">
                  <FaPaypal />
                </div>
                <div className="option-info">
                  <h3>PayPal</h3>
                  <p>Fast, secure payments with PayPal</p>
                  <div className="payment-features">
                    <span><FiCheck /> Buyer Protection</span>
                    <span><FiCheck /> Instant Payment</span>
                  </div>
                </div>
                <div className="radio-custom">
                  {selectedMethod === "paypal" && <div className="radio-dot"></div>}
                </div>
              </div>

              {selectedMethod === "paypal" && (
                <div className="paypal-buttons-container">
                  {paypalError && (
                    <div className="error-message">{paypalError}</div>
                  )}
                  
                  <PayPalScriptProvider options={paypalOptions}>
                    <PayPalButtons
                      style={{ layout: "vertical", shape: "pill" }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [{
                            amount: {
                              value: (totalAmount / 130).toFixed(2)
                            },
                            description: "FreshFeast Food Order"
                          }]
                        });
                      }}
                      onApprove={onApprove}
                      onError={(err) => {
                        console.error("PayPal error:", err);
                        setPaypalError("PayPal error occurred. Please try again.");
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              )}
            </div>

            {/* Cash on Delivery */}
            <div
              className={`payment-option ${selectedMethod === "cash" ? "selected" : ""}`}
              onClick={() => setSelectedMethod("cash")}
            >
              <div className="option-header">
                <div className="option-icon cash-icon">
                  <FiDollarSign />
                </div>
                <div className="option-info">
                  <h3>Cash on Delivery</h3>
                  <p>Pay when you receive your order</p>
                  <div className="payment-features">
                    <span><FiClock /> Pay on arrival</span>
                    <span><FiCheck /> No card needed</span>
                  </div>
                </div>
                <div className="radio-custom">
                  {selectedMethod === "cash" && <div className="radio-dot"></div>}
                </div>
              </div>
              {selectedMethod === "cash" && (
                <div className="cod-note">
                  <FiPackage className="note-icon" />
                  <span>Extra KES 50 handling fee applies for cash payments</span>
                </div>
              )}
            </div>

            {selectedMethod === "cash" && (
              <button 
                className="pay-button" 
                onClick={confirmCODOrder} 
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    Confirm Cash Order
                    <FiArrowRight className="btn-icon" />
                  </>
                )}
              </button>
            )}

            <div className="payment-footer">
              <p>By continuing, you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;