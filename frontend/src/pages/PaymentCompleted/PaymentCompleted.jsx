import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PaymentCompleted.css";
import { FiCheckCircle, FiPackage, FiClock, FiTruck, FiHome, FiShoppingBag } from "react-icons/fi";

const PaymentCompleted = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order, paymentMethod, paymentStatus } = location.state || {};

  console.log("📍 PaymentCompleted - order:", order);
  console.log("📍 PaymentCompleted - paymentMethod:", paymentMethod);
  console.log("📍 PaymentCompleted - paymentStatus:", paymentStatus);

  // If no order data, try to get from localStorage
  let orderData = order;
  if (!orderData) {
    const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    if (savedOrders.length > 0) {
      orderData = savedOrders[0];
      console.log("📍 Loaded order from localStorage:", orderData);
    }
  }

  if (!orderData) {
    return (
      <div style={{ textAlign: "center", padding: "50px", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <h2>No order data found</h2>
        <p>Please go back and try again.</p>
        <button onClick={() => navigate("/")} style={{ marginTop: "20px", padding: "10px 20px", background: "#f59e0b", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
          Go to Home
        </button>
      </div>
    );
  }

  // Calculate totals
  const getItemsList = () => {
    if (orderData.items && Array.isArray(orderData.items)) {
      return orderData.items;
    }
    return [];
  };

  const itemsList = getItemsList();
  const subtotal = itemsList.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const deliveryFee = 75;
  const codFee = orderData.paymentMethod === "cash" ? 50 : 0;
  const totalAmount = orderData.amount || subtotal + deliveryFee + codFee;

  // Get payment method display - IMPORTANT for MyOrders
  const getPaymentMethodDisplay = () => {
    const method = paymentMethod || orderData.paymentMethod || orderData.payment?.method;
    if (method === "paypal") return "PayPal";
    if (method === "cash") return "Cash on Delivery";
    return "Cash on Delivery";
  };

  // Check if payment is paid - IMPORTANT for MyOrders
  const isPaid = () => {
    if (paymentStatus === "paid") return true;
    if (orderData.paymentStatus === "paid") return true;
    if (paymentMethod === "paypal") return true;
    if (orderData.paymentMethod === "paypal") return true;
    if (orderData.payment?.method === "paypal") return true;
    return false;
  };

  const orderId = orderData.orderId || orderData.orderNumber || `ORD-${Date.now().toString().slice(-6)}`;

  // Save to localStorage with correct payment method for MyOrders
  const saveToLocalStorage = () => {
    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    
    // Check if order already exists
    const orderExists = existingOrders.some(o => o.orderId === orderId);
    
    if (!orderExists) {
      const orderToSave = {
        ...orderData,
        orderId: orderId,
        paymentMethod: getPaymentMethodDisplay() === "PayPal" ? "paypal" : "cash",
        paymentStatus: isPaid() ? "paid" : "pending",
        amount: totalAmount,
        date: new Date().toLocaleDateString(),
        status: "confirmed"
      };
      existingOrders.unshift(orderToSave);
      localStorage.setItem("orders", JSON.stringify(existingOrders));
      console.log("✅ Order saved to localStorage with method:", orderToSave.paymentMethod);
    }
  };

  // Save order when component loads
  React.useEffect(() => {
    saveToLocalStorage();
  }, []);

  return (
    <div className="payment-completed">
      <div className="confirmation-container">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon-wrapper">
            <FiCheckCircle className="success-icon" />
          </div>
          <h1>Order Confirmed!</h1>
          <p className="order-id">Order #{orderId}</p>
          <p className="success-message">
            Your order has been received and is being prepared. We'll notify you when it's out for delivery.
          </p>
        </div>

        <div className="confirmation-content">
          {/* Left Column - Order Details */}
          <div className="order-details-section">
            <div className="detail-card">
              <div className="card-header">
                <FiShoppingBag />
                <h2>Order Summary</h2>
              </div>
              
              <div className="order-items-list">
                {itemsList.map((item, index) => (
                  <div className="order-item" key={index}>
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">× {item.quantity || 1}</span>
                    </div>
                    <span className="item-price">KES {(item.price * (item.quantity || 1)).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="total-row">
                  <span>Delivery Fee</span>
                  <span>KES {deliveryFee}</span>
                </div>
                {codFee > 0 && (
                  <div className="total-row">
                    <span>COD Fee</span>
                    <span>KES {codFee}</span>
                  </div>
                )}
                <div className="total-divider"></div>
                <div className="total-row grand-total">
                  <span>Total Amount</span>
                  <span className="total-amount">KES {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="detail-card">
              <div className="card-header">
                <FiPackage />
                <h2>Payment Information</h2>
              </div>
              
              <div className="payment-details">
                <div className="detail-row">
                  <span className="detail-label">Payment Method:</span>
                  <span className={`detail-value payment-method ${getPaymentMethodDisplay() === "PayPal" ? "paypal" : "cash"}`}>
                    {getPaymentMethodDisplay()}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge ${isPaid() ? "paid" : "pending"}`}>
                    {isPaid() ? "Paid ✓" : "Pay on Delivery"}
                  </span>
                </div>
                
                {orderData.payment?.transactionId && (
                  <div className="detail-row">
                    <span className="detail-label">Transaction ID:</span>
                    <span className="detail-value transaction-id">
                      {orderData.payment.transactionId}
                    </span>
                  </div>
                )}
                
                {!isPaid() && (
                  <div className="cash-note">
                    <p>💵 Please have exact change ready for the delivery agent.</p>
                    <p>📝 Delivery agent will provide a receipt upon payment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Delivery & Actions */}
          <div className="delivery-section">
            {/* Delivery Timeline */}
            <div className="detail-card">
              <div className="card-header">
                <FiClock />
                <h2>Delivery Timeline</h2>
              </div>
              
              <div className="timeline">
                <div className="timeline-step completed">
                  <div className="step-dot"></div>
                  <div className="step-content">
                    <h4>Order Placed</h4>
                    <p>Just now</p>
                  </div>
                </div>
                
                <div className="timeline-step active">
                  <div className="step-dot"></div>
                  <div className="step-content">
                    <h4>Preparing Food</h4>
                    <p>Estimated: 15-20 minutes</p>
                  </div>
                </div>
                
                <div className="timeline-step">
                  <div className="step-dot"></div>
                  <div className="step-content">
                    <h4>Out for Delivery</h4>
                    <FiTruck className="truck-icon" />
                    <p>Estimated: 30-45 minutes</p>
                  </div>
                </div>
                
                <div className="timeline-step">
                  <div className="step-dot"></div>
                  <div className="step-content">
                    <h4>Delivered</h4>
                    <p>Enjoy your meal! 🍽️</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className="track-order-btn"
                onClick={() => navigate(`/track-order/${orderId}`)}
              >
                <FiTruck /> Track My Order
              </button>
              
              <button 
                className="home-btn"
                onClick={() => navigate("/")}
              >
                <FiHome /> Back to Home
              </button>
            </div>

            {/* Support Information */}
            <div className="support-info">
              <h3>Need Help?</h3>
              <div className="contact-info">
                <p>📞 Call us: <strong>0725 280 289 / 0737 146 958</strong></p>
                <p>✉️ Email: <strong>supportfreshfeast@gmail.com</strong></p>
                <p className="support-note">
                  We'll send you SMS updates about your order status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCompleted;