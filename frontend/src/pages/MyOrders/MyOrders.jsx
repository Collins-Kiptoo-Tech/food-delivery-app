import React, { useState, useContext, useEffect } from "react";
import { StoreContext } from "../../context/StoreContext";
import "./MyOrders.css";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiPackage, 
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiMapPin,
  FiEye,
  FiRefreshCw,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDollarSign,
  FiShoppingBag,
  FiStar,
  FiDownload,
  FiPrinter,
  FiSmartphone
} from "react-icons/fi";
import { FaPaypal } from "react-icons/fa";

const MyOrders = () => {
  const { token, url } = useContext(StoreContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      // If no token, try to load from localStorage
      loadOrdersFromLocalStorage();
    }
  }, [token]);

  const loadOrdersFromLocalStorage = () => {
    const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    setOrders(savedOrders);
    setLoading(false);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${url}/api/order/userorders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data || []);
      } else {
        // Fallback to localStorage if backend fails
        loadOrdersFromLocalStorage();
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      // Fallback to localStorage
      loadOrdersFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  // Format price
  const formatPrice = (amount) => {
    return `KSh ${Number(amount || 0).toLocaleString()}`;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      'delivered': { class: 'status-delivered', icon: <FiCheckCircle />, text: 'Delivered' },
      'processing': { class: 'status-processing', icon: <FiRefreshCw />, text: 'Processing' },
      'shipped': { class: 'status-shipped', icon: <FiTruck />, text: 'Shipped' },
      'cancelled': { class: 'status-cancelled', icon: <FiXCircle />, text: 'Cancelled' },
      'confirmed': { class: 'status-processing', icon: <FiRefreshCw />, text: 'Confirmed' },
      'pending': { class: 'status-pending', icon: <FiClock />, text: 'Pending' }
    };
    
    const key = status?.toLowerCase() || 'pending';
    return statusMap[key] || statusMap.pending;
  };

  // Get payment method icon and text - FIXED VERSION
  const getPaymentInfo = (order) => {
    // Check multiple possible locations for payment method
    let method = '';
    let status = '';
    
    // Try different structures
    if (order.paymentMethod) {
      method = order.paymentMethod;
      status = order.paymentStatus;
    } else if (order.payment?.method) {
      method = order.payment.method;
      status = order.payment.status;
    } else if (order.payment?.method === 'paypal') {
      method = 'paypal';
      status = 'paid';
    } else {
      method = 'cash';
      status = 'pending';
    }
    
    // Get icon based on method
    let icon = null;
    let displayName = '';
    
    switch(method) {
      case 'paypal':
        icon = <FaPaypal className="payment-icon paypal" />;
        displayName = 'PayPal';
        break;
      case 'mpesa':
        icon = <FiSmartphone className="payment-icon mpesa" />;
        displayName = 'M-Pesa';
        break;
      case 'cash':
        icon = <FiDollarSign className="payment-icon cash" />;
        displayName = 'Cash on Delivery';
        break;
      default:
        icon = <FiDollarSign className="payment-icon" />;
        displayName = 'Cash on Delivery';
    }
    
    return { icon, displayName, status: status || 'pending' };
  };

  // Filter orders based on tab and search
  const filteredOrders = orders.filter(order => {
    // Tab filter
    if (activeTab !== 'all') {
      const status = order.status?.toLowerCase() || '';
      if (activeTab === 'delivered' && !status.includes('delivered')) return false;
      if (activeTab === 'processing' && !status.includes('processing') && !status.includes('confirmed')) return false;
      if (activeTab === 'cancelled' && !status.includes('cancelled')) return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (order._id || order.id || '').toLowerCase().includes(query) ||
        (order.orderId || '').toLowerCase().includes(query) ||
        order.items?.some(item => item.name?.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.orderDate || a.date || 0);
    const dateB = new Date(b.createdAt || b.orderDate || b.date || 0);
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Toggle order expansion
  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get order number
  const getOrderNumber = (order) => {
    if (order.orderId) return order.orderId;
    if (order._id) return `ORD-${order._id.slice(-8).toUpperCase()}`;
    if (order.id) return `ORD-${order.id.slice(-8).toUpperCase()}`;
    return 'N/A';
  };

  // Track order handler
  const handleTrackOrder = (order) => {
    const orderId = order._id || order.id || order.orderId;
    navigate(`/trackorder/${orderId}`);
  };

  return (
    <div className="jumia-orders">
      {/* Header */}
      <div className="orders-header">
        <h1>My Orders</h1>
        <p>Track, return, or buy items again</p>
      </div>

      {/* Search Bar */}
      <div className="orders-search">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search by order ID or item name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter Bar */}
      <div className="orders-filter-bar">
        <div className="filter-tabs">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Orders
          </button>
          <button 
            className={`tab-btn ${activeTab === 'processing' ? 'active' : ''}`}
            onClick={() => setActiveTab('processing')}
          >
            To Receive
          </button>
          <button 
            className={`tab-btn ${activeTab === 'delivered' ? 'active' : ''}`}
            onClick={() => setActiveTab('delivered')}
          >
            Completed
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled
          </button>
        </div>

        <div className="filter-options">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="all">All Time</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">This Year</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="orders-loading">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="orders-error">
          <FiXCircle />
          <p>{error}</p>
          <button onClick={fetchOrders}>Try Again</button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredOrders.length === 0 && (
        <div className="orders-empty">
          <div className="empty-icon">
            <FiPackage />
          </div>
          <h2>No orders found</h2>
          <p>Start shopping to see your orders here</p>
          <Link to="/" className="shop-now-btn">Shop Now</Link>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && filteredOrders.length > 0 && (
        <div className="orders-table">
          {/* Table Header */}
          <div className="orders-table-header">
            <div className="header-cell order-info-header">ORDER</div>
            <div className="header-cell order-status-header">STATUS</div>
            <div className="header-cell order-payment-header">PAYMENT</div>
            <div className="header-cell order-total-header">TOTAL</div>
            <div className="header-cell order-actions-header">ACTIONS</div>
          </div>

          {/* Table Rows */}
          {sortedOrders.map((order) => {
            const status = getStatusBadge(order.status);
            const isExpanded = expandedOrder === (order._id || order.id);
            const paymentInfo = getPaymentInfo(order);
            
            return (
              <div key={order._id || order.id} className="order-row">
                {/* Main Order Row */}
                <div className="order-main-row" onClick={() => toggleExpand(order._id || order.id)}>
                  <div className="order-cell order-info-cell">
                    <div className="order-info-content">
                      <div className="order-number">{getOrderNumber(order)}</div>
                      <div className="order-date">
                        <FiCalendar />
                        {formatDate(order.createdAt || order.orderDate || order.date)}
                      </div>
                      <div className="order-items-count">
                        {order.items?.length || 0} item(s)
                      </div>
                    </div>
                  </div>

                  <div className="order-cell order-status-cell">
                    <span className={`status-badge ${status.class}`}>
                      {status.icon}
                      {status.text}
                    </span>
                  </div>

                  <div className="order-cell order-payment-cell">
                    <div className="payment-info">
                      {paymentInfo.icon}
                      <span className="payment-method">
                        {paymentInfo.displayName}
                      </span>
                    </div>
                    <span className={`payment-status ${paymentInfo.status === 'paid' ? 'paid' : 'pending'}`}>
                      {paymentInfo.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>

                  <div className="order-cell order-total-cell">
                    <span className="order-total-amount">{formatPrice(order.amount || order.total)}</span>
                  </div>

                  <div className="order-cell order-actions-cell">
                    <button 
                      className="action-btn view-btn" 
                      title="View Details"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(order._id || order.id);
                      }}
                    >
                      <FiEye />
                    </button>
                    {!order.status?.toLowerCase().includes('delivered') && 
                     !order.status?.toLowerCase().includes('cancelled') && (
                      <button 
                        className="action-btn track-btn" 
                        title="Track Order"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTrackOrder(order);
                        }}
                      >
                        <FiTruck />
                      </button>
                    )}
                    <button 
                      className="expand-btn" 
                      title={isExpanded ? "Show Less" : "Show More"}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(order._id || order.id);
                      }}
                    >
                      {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="order-expanded">
                    <div className="expanded-content">
                      {/* Items Section */}
                      <div className="expanded-section items-section">
                        <h4><FiShoppingBag /> Items Ordered</h4>
                        <div className="items-list">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="expanded-item">
                              <div className="item-image">
                                {item.image ? (
                                  <img 
                                    src={`${url}/images/${item.image}`} 
                                    alt={item.name}
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/60x60?text=Food'}
                                  />
                                ) : (
                                  <div className="item-placeholder">🍔</div>
                                )}
                              </div>
                              <div className="item-details">
                                <h5>{item.name}</h5>
                                <div className="item-specs">
                                  <span>Qty: {item.quantity || 1}</span>
                                  <span>Price: {formatPrice(item.price)}</span>
                                  <span className="item-subtotal">
                                    Subtotal: {formatPrice((item.price || 0) * (item.quantity || 1))}
                                  </span>
                                </div>
                              </div>
                              <button className="rate-item-btn">
                                <FiStar /> Rate
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery & Payment Section */}
                      <div className="expanded-grid">
                        <div className="expanded-section">
                          <h4><FiMapPin /> Delivery Address</h4>
                          {order.address && (
                            <div className="address-details">
                              <p className="address-name">
                                {order.address.firstName} {order.address.lastName}
                              </p>
                              <p>{order.address.street}</p>
                              <p>{order.address.city}, {order.address.state} {order.address.zipcode}</p>
                              <p>{order.address.country}</p>
                              <p className="address-phone">📞 {order.address.phone}</p>
                            </div>
                          )}
                        </div>

                        <div className="expanded-section">
                          <h4><FiDollarSign /> Payment Summary</h4>
                          <div className="payment-summary">
                            <div className="summary-row">
                              <span>Payment Method</span>
                              <span className="payment-method-name">{paymentInfo.displayName}</span>
                            </div>
                            <div className="summary-row">
                              <span>Payment Status</span>
                              <span className={paymentInfo.status === 'paid' ? 'paid-text' : 'pending-text'}>
                                {paymentInfo.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                              </span>
                            </div>
                            <div className="summary-row">
                              <span>Subtotal</span>
                              <span>{formatPrice((order.amount || order.total) - 75)}</span>
                            </div>
                            <div className="summary-row">
                              <span>Delivery Fee</span>
                              <span>KSh 75</span>
                            </div>
                            <div className="summary-row total">
                              <span>Total</span>
                              <span>{formatPrice(order.amount || order.total)}</span>
                            </div>
                          </div>
                          
                          {(order.paymentDetails?.transactionId || order.payment?.transactionId) && (
                            <div className="transaction-info">
                              <p>Transaction ID: {order.paymentDetails?.transactionId || order.payment?.transactionId}</p>
                              {(order.paymentDetails?.payerEmail || order.payment?.email) && 
                                <p>PayPal Email: {order.paymentDetails?.payerEmail || order.payment?.email}</p>
                              }
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="expanded-actions">
                        <button className="expanded-action-btn primary">
                          <FiRefreshCw /> Buy Again
                        </button>
                        <button className="expanded-action-btn">
                          <FiDownload /> Invoice
                        </button>
                        <button className="expanded-action-btn">
                          <FiPrinter /> Print
                        </button>
                        {order.status?.toLowerCase().includes('delivered') && (
                          <button className="expanded-action-btn secondary">
                            Return Items
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Footer */}
      {!loading && !error && filteredOrders.length > 0 && (
        <div className="orders-footer">
          <p>
            Showing {filteredOrders.length} of {orders.length} orders
          </p>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
