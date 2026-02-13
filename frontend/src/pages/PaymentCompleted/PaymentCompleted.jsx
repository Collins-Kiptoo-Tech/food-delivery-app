import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PaymentCompleted.css";
import { FiCheckCircle, FiPackage, FiClock, FiTruck, FiHome, FiShoppingBag } from "react-icons/fi";

const PaymentCompleted = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order, paymentMethod } = location.state || {};

  // Calculate total if not provided
  const calculateTotal = () => {
    if (order?.amount) return order.amount;
    if (order?.items) {
      return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 250; // Add delivery fee
    }
    return 0;
  };

  const totalAmount = calculateTotal();

  // ✅ Get order ID from different possible formats
  const getOrderId = () => {
    if (order?.orderId) return order.orderId;
    if (order?._id) return order._id;
    if (order?.id) return order.id;
    return order?.orderId || "COD-098033";
  };

  const orderId = getOrderId();

  // ✅ Track order handler - Navigate to actual tracking page
  const handleTrackOrder = () => {
    // Navigate to the track order page with the order ID
    navigate(`/track-order/${orderId}`);
  };

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
                {order?.items ? (
                  order.items.map((item, index) => (
                    <div className="order-item" key={index}>
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">× {item.quantity}</span>
                      </div>
                      <span className="item-price">KES {item.price * item.quantity}</span>
                    </div>
                  ))
                ) : (
                  // Fallback data for testing
                  <>
                    <div className="order-item">
                      <div className="item-info">
                        <span className="item-name">Dutch Oven Chicken</span>
                        <span className="item-quantity">× 1</span>
                      </div>
                      <span className="item-price">KES 2005</span>
                    </div>
                    <div className="order-item">
                      <div className="item-info">
                        <span className="item-name">Chicken Marsala</span>
                        <span className="item-quantity">× 1</span>
                      </div>
                      <span className="item-price">KES 1505</span>
                    </div>
                    <div className="order-item">
                      <div className="item-info">
                        <span className="item-name">Roasted Chicken</span>
                        <span className="item-quantity">× 1</span>
                      </div>
                      <span className="item-price">KES 1799</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>KES {totalAmount - 250}</span>
                </div>
                <div className="total-row">
                  <span>Delivery Fee</span>
                  <span>KES 250</span>
                </div>
                <div className="total-divider"></div>
                <div className="total-row grand-total">
                  <span>Total Amount</span>
                  <span className="total-amount">KES {totalAmount}</span>
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
                  <span className={`detail-value payment-method ${paymentMethod || "cash"}`}>
                    {paymentMethod === "mpesa" ? "M-Pesa" : "Cash on Delivery"}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge ${paymentMethod === "mpesa" ? "paid" : "pending"}`}>
                    {paymentMethod === "mpesa" ? "Paid ✓" : "Pay on Delivery"}
                  </span>
                </div>
                
                {paymentMethod === "mpesa" && order?.payment?.transactionCode && (
                  <div className="detail-row">
                    <span className="detail-label">Transaction ID:</span>
                    <span className="detail-value transaction-id">
                      {order.payment.transactionCode}
                    </span>
                  </div>
                )}
                
                {paymentMethod === "cash" && (
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
                onClick={handleTrackOrder} // ✅ Now navigates to actual tracking page
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
                <p>📞 Call us: <strong>0725 280 289/ 0737146958</strong></p>
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