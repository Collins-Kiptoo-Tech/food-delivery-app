import React, { useState, useContext, useEffect } from "react";
import { StoreContext } from "../../context/StoreContext";
import "./MyOrders.css";
import { Link } from "react-router-dom";
import { 
  FiPackage, 
  FiCheckCircle, 
  FiClock, 
  FiTruck, 
  FiHome,
  FiShoppingBag,
  FiDollarSign,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiMapPin,
  FiCreditCard,
  FiEye,
  FiRefreshCw,
  FiAlertCircle
} from "react-icons/fi";
import { FaPaypal } from "react-icons/fa";

const MyOrders = () => {
  const { token, url } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const ordersPerPage = 5;

  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      setLoading(false);
      setError("Please login to view your orders");
    }
  }, [token, retryCount]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("Fetching orders from:", `${url}/api/order/userorders`);
      
      const response = await fetch(`${url}/api/order/userorders`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log("Response status:", response.status);
      
      if (response.status === 401) {
        throw new Error("Session expired. Please login again.");
      }
      
      if (response.status === 404) {
        throw new Error("Orders endpoint not found. Check backend.");
      }
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Orders API response:", data);
      
      if (data.success) {
        if (Array.isArray(data.data)) {
          const sortedOrders = data.data.sort((a, b) => 
            new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
          );
          setOrders(sortedOrders);
        } else {
          setOrders([]);
        }
      } else {
        setError(data.message || "Failed to load orders. Please try again.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      
      if (err.message.includes("Failed to fetch")) {
        setError("Cannot connect to server. Check if backend is running.");
      } else if (err.message.includes("401")) {
        setError("Session expired. Please login again.");
      } else if (err.message.includes("404")) {
        setError("Orders endpoint not found. Contact support.");
      } else {
        setError(err.message || "Error loading orders. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Format price with proper conversion
  const formatPrice = (amount) => {
    if (amount === undefined || amount === null) return "KSh 0.00";
    
    let numAmount = Number(amount);
    
    // Debug log to see what we're getting
    console.log(`Formatting amount: ${amount}, as number: ${numAmount}`);
    
    // Check if amount is in cents (common in payment systems)
    if (numAmount > 1000) {
      const amountStr = String(numAmount);
      if ((amountStr.endsWith('00') && amountStr.length > 4) || numAmount > 10000) {
        numAmount = numAmount / 100;
        console.log(`Converted from cents: ${amount} -> ${numAmount}`);
      }
    }
    
    return `KSh ${numAmount.toLocaleString('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Format item price
  const formatItemPrice = (price) => {
    if (price === undefined || price === null) return "KSh 0.00";
    
    let numPrice = Number(price);
    
    if (numPrice > 500) {
      const priceStr = String(numPrice);
      if ((priceStr.endsWith('00') && priceStr.length > 3) || numPrice > 5000) {
        numPrice = numPrice / 100;
      }
    }
    
    return `KSh ${numPrice.toFixed(2)}`;
  };

  // Get payment status with proper display
  const getPaymentStatus = (order) => {
    // Check various places where payment status might be stored
    if (order.payment?.status === 'paid') {
      return { 
        text: 'Paid ✓', 
        class: 'paid',
        method: order.payment?.method || 'unknown',
        icon: order.payment?.method === 'paypal' ? <FaPaypal /> : <FiCheckCircle />
      };
    }
    
    if (order.payment?.method === 'paypal') {
      return { 
        text: 'Paid via PayPal ✓', 
        class: 'paid paypal-paid',
        method: 'paypal',
        icon: <FaPaypal />
      };
    }
    
    if (order.status === 'paid') {
      return { 
        text: 'Paid ✓', 
        class: 'paid',
        method: 'unknown',
        icon: <FiCheckCircle />
      };
    }
    
    if (order.payment?.method === 'cash') {
      return { 
        text: 'Cash on Delivery', 
        class: 'cod',
        method: 'cash',
        icon: <FiDollarSign />
      };
    }
    
    return { 
      text: 'Payment Pending', 
      class: 'unpaid',
      method: 'pending',
      icon: <FiClock />
    };
  };

  // Get payment method display
  const getPaymentMethod = (order) => {
    if (order.payment?.method === 'paypal') {
      return {
        name: 'PayPal',
        icon: <FaPaypal />,
        class: 'paypal-method'
      };
    }
    if (order.payment?.method === 'cash') {
      return {
        name: 'Cash on Delivery',
        icon: <FiDollarSign />,
        class: 'cash-method'
      };
    }
    if (order.payment?.method === 'mpesa') {
      return {
        name: 'M-Pesa',
        icon: <FiCreditCard />,
        class: 'mpesa-method'
      };
    }
    return {
      name: order.payment?.method || 'Not specified',
      icon: <FiCreditCard />,
      class: 'unknown-method'
    };
  };

  const getStatusColor = (status) => {
    if (!status) return 'status-pending';
    
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('delivered')) return 'status-delivered';
    if (statusLower.includes('food processing') || statusLower.includes('processing')) return 'status-processing';
    if (statusLower.includes('shipped') || statusLower.includes('on the way')) return 'status-shipped';
    if (statusLower.includes('cancelled') || statusLower.includes('canceled')) return 'status-cancelled';
    if (statusLower.includes('payment failed')) return 'status-cancelled';
    return 'status-pending';
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Date not available";
    }
  };

  const getOrderNumber = (orderId) => {
    if (!orderId) return "N/A";
    return `#${orderId.slice(-8).toUpperCase()}`;
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === "" || 
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = statusFilter === "all" || 
      (order.status?.toLowerCase().includes(statusFilter.toLowerCase()));
    
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Calculate statistics
  const deliveredCount = orders.filter(o => o.status?.toLowerCase().includes('delivered')).length;
  const processingCount = orders.filter(o => 
    o.status?.toLowerCase().includes('processing') || 
    o.status?.toLowerCase().includes('food processing')
  ).length;
  const pendingCount = orders.filter(o => 
    !o.status || 
    o.status.toLowerCase().includes('pending')
  ).length;

  const paidCount = orders.filter(o => 
    o.payment?.status === 'paid' || 
    o.payment?.method === 'paypal' || 
    o.status === 'paid'
  ).length;

  // Handle view details
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  // Login required state
  if (!token) {
    return (
      <div className="my-orders-container">
        <div className="no-orders">
          <div className="empty-order-icon">🔒</div>
          <h2>Login Required</h2>
          <p>Please sign in to view your order history</p>
          <Link to="/" className="shop-btn">Go to Homepage</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders-container">
      <div className="my-orders-header">
        <h1>My Orders</h1>
        <p>Track and manage your orders</p>
      </div>

      {error && !loading && (
        <div className="error-container">
          <div className="error-message">
            <FiAlertCircle className="error-icon" />
            <h3>Unable to Load Orders</h3>
            <p>{error}</p>
            <button onClick={handleRetry} className="retry-btn">
              <FiRefreshCw /> {retryCount > 0 ? `Try Again (${retryCount})` : 'Try Again'}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="no-orders">
          <div className="empty-order-icon">📦</div>
          <h2>No Orders Yet</h2>
          <p>Your order history is empty. Start shopping to see orders here!</p>
          <div className="action-buttons">
            <Link to="/" className="shop-btn">Browse Menu</Link>
            <Link to="/cart" className="cart-btn">View Cart</Link>
          </div>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <>
          {/* Statistics Card */}
          <div className="stats-container">
            <div className="stat-card total-orders">
              <span className="stat-icon">📦</span>
              <div className="stat-content">
                <h3>Total Orders</h3>
                <p className="stat-number">{orders.length}</p>
              </div>
            </div>
            <div className="stat-card delivered">
              <span className="stat-icon">✅</span>
              <div className="stat-content">
                <h3>Delivered</h3>
                <p className="stat-number">{deliveredCount}</p>
              </div>
            </div>
            <div className="stat-card paid">
              <span className="stat-icon">💰</span>
              <div className="stat-content">
                <h3>Paid</h3>
                <p className="stat-number">{paidCount}</p>
              </div>
            </div>
            <div className="stat-card processing">
              <span className="stat-icon">⏳</span>
              <div className="stat-content">
                <h3>Processing</h3>
                <p className="stat-number">{processingCount}</p>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="orders-controls">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search orders or items..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
              />
            </div>
            <div className="filter-box">
              <FiFilter className="filter-icon" />
              <select 
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="delivered">Delivered</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders Summary */}
          <div className="orders-summary">
            <p>
              Showing {filteredOrders.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
              {statusFilter !== 'all' && ` (Filtered by: ${statusFilter})`}
            </p>
          </div>

          {/* Orders List */}
          <div className="orders-list">
            {currentOrders.map((order, index) => {
              const payment = getPaymentStatus(order);
              const paymentMethod = getPaymentMethod(order);
              
              return (
                <div key={order._id || index} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Order {getOrderNumber(order._id)}</h3>
                      <p className="order-date">
                        <FiCalendar className="icon" />
                        {formatDate(order.createdAt || order.date)}
                      </p>
                      {order.address && (
                        <p className="order-address">
                          <FiMapPin className="icon" />
                          {typeof order.address === 'object' 
                            ? `${order.address.street || ''}, ${order.address.city || ''}`.trim()
                            : order.address}
                        </p>
                      )}
                    </div>
                    <div className="order-status-group">
                      <span className={`status-badge ${getStatusColor(order.status)}`}>
                        {order.status || 'Pending'}
                      </span>
                      <span className={`payment-badge ${payment.class}`}>
                        {payment.icon}
                        {payment.text}
                      </span>
                      <span className={`payment-method-badge ${paymentMethod.class}`}>
                        {paymentMethod.icon}
                        {paymentMethod.name}
                      </span>
                    </div>
                  </div>

                  {order.items && order.items.length > 0 ? (
                    <div className="order-items">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="order-item">
                          <div className="item-image">
                            {item.image ? (
                              <img 
                                src={`${url}/images/${item.image}`} 
                                alt={item.name} 
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/80x80?text=Food';
                                }}
                              />
                            ) : (
                              <div className="image-placeholder">🍔</div>
                            )}
                          </div>
                          <div className="item-details">
                            <h4>{item.name || `Item ${idx + 1}`}</h4>
                            <div className="item-meta">
                              <span className="item-quantity">Qty: {item.quantity || 1}</span>
                              <span className="item-price">Price: {formatItemPrice(item.price)}</span>
                              <span className="item-total">
                                Total: {formatItemPrice((item.price || 0) * (item.quantity || 1))}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {order.items.length > 3 && (
                        <div className="more-items">
                          + {order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="no-items">
                      <p>No item details available</p>
                    </div>
                  )}

                  <div className="order-footer">
                    <div className="order-total">
                      <span className="total-label">Total Amount:</span>
                      <span className="total-amount">{formatPrice(order.amount)}</span>
                    </div>
                    <div className="order-actions">
                      <button 
                        className="btn view-details-btn"
                        onClick={() => handleViewDetails(order)}
                      >
                        <FiEye /> View Details
                      </button>
                      {order.status?.toLowerCase().includes('delivered') && (
                        <button className="btn reorder-btn">
                          <FiRefreshCw /> Reorder
                        </button>
                      )}
                      {!order.status?.toLowerCase().includes('delivered') && 
                       !order.status?.toLowerCase().includes('cancelled') && (
                        <button className="btn track-btn">
                          <FiTruck /> Track Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {filteredOrders.length > ordersPerPage && (
            <div className="pagination">
              <button 
                className="pagination-btn prev"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button 
                className="pagination-btn next"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details {getOrderNumber(selectedOrder._id)}</h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-section">
                <h3><FiShoppingBag /> Order Information</h3>
                <div className="info-grid">
                  <div className="info-row">
                    <span className="info-label">Order ID:</span>
                    <span className="info-value">{selectedOrder._id}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Date:</span>
                    <span className="info-value">{formatDate(selectedOrder.createdAt || selectedOrder.date)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Status:</span>
                    <span className={`status-badge ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3><FiCreditCard /> Payment Information</h3>
                <div className="info-grid">
                  <div className="info-row">
                    <span className="info-label">Method:</span>
                    <span className={`payment-method-badge ${getPaymentMethod(selectedOrder).class}`}>
                      {getPaymentMethod(selectedOrder).icon}
                      {getPaymentMethod(selectedOrder).name}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Status:</span>
                    <span className={`payment-badge ${getPaymentStatus(selectedOrder).class}`}>
                      {getPaymentStatus(selectedOrder).icon}
                      {getPaymentStatus(selectedOrder).text}
                    </span>
                  </div>
                  {selectedOrder.payment?.transactionId && (
                    <div className="info-row">
                      <span className="info-label">Transaction ID:</span>
                      <span className="info-value transaction-id">{selectedOrder.payment.transactionId}</span>
                    </div>
                  )}
                  {selectedOrder.payment?.email && (
                    <div className="info-row">
                      <span className="info-label">PayPal Email:</span>
                      <span className="info-value">{selectedOrder.payment.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-section">
                <h3><FiMapPin /> Delivery Address</h3>
                <div className="address-details">
                  {selectedOrder.address && (
                    <>
                      <p>{selectedOrder.address.firstName} {selectedOrder.address.lastName}</p>
                      <p>{selectedOrder.address.street}</p>
                      <p>{selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.zipcode}</p>
                      <p>{selectedOrder.address.country}</p>
                      <p>Phone: {selectedOrder.address.phone}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="modal-section">
                <h3><FiPackage /> Items</h3>
                <div className="modal-items-list">
                  {selectedOrder.items?.map((item, idx) => (
                    <div className="modal-item" key={idx}>
                      <div className="modal-item-info">
                        <span className="modal-item-name">{item.name}</span>
                        <span className="modal-item-quantity">× {item.quantity}</span>
                      </div>
                      <span className="modal-item-price">{formatItemPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="modal-totals">
                  <div className="modal-total-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(selectedOrder.amount - 250)}</span>
                  </div>
                  <div className="modal-total-row">
                    <span>Delivery Fee</span>
                    <span>KSh 250.00</span>
                  </div>
                  <div className="modal-total-divider"></div>
                  <div className="modal-total-row grand-total">
                    <span>Total</span>
                    <span className="total-amount">{formatPrice(selectedOrder.amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-btn close" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
              {!selectedOrder.status?.toLowerCase().includes('delivered') && 
               !selectedOrder.status?.toLowerCase().includes('cancelled') && (
                <button className="modal-btn track">
                  <FiTruck /> Track Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
