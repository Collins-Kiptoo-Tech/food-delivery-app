import React, { useState, useContext, useEffect } from "react";
import { StoreContext } from "../../context/StoreContext";
import "./MyOrders.css";
import { Link } from "react-router-dom";

const MyOrders = () => {
  const { token, url } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
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

  // FIXED: Price formatting function
  const formatPrice = (amount) => {
    if (amount === undefined || amount === null) return "KSh 0.00";
    
    let numAmount = Number(amount);
    
    // Debug log to see what we're getting
    console.log(`Formatting amount: ${amount}, as number: ${numAmount}`);
    
    // Check if amount is in cents (common in payment systems)
    // If amount > 1000 and looks like whole dollars/cents
    if (numAmount > 1000) {
      // Check if it's likely in cents (ends with 00 or is very large)
      const amountStr = String(numAmount);
      if ((amountStr.endsWith('00') && amountStr.length > 4) || numAmount > 10000) {
        numAmount = numAmount / 100; // Convert cents to shillings
        console.log(`Converted from cents: ${amount} -> ${numAmount}`);
      }
    }
    
    return `KSh ${numAmount.toLocaleString('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // FIXED: Item price formatting
  const formatItemPrice = (price) => {
    if (price === undefined || price === null) return "KSh 0.00";
    
    let numPrice = Number(price);
    
    // Similar logic for item prices
    if (numPrice > 500) {
      const priceStr = String(numPrice);
      if ((priceStr.endsWith('00') && priceStr.length > 3) || numPrice > 5000) {
        numPrice = numPrice / 100;
      }
    }
    
    return `KSh ${numPrice.toFixed(2)}`;
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
            <div className="error-icon">⚠️</div>
            <h3>Unable to Load Orders</h3>
            <p>{error}</p>
            <button onClick={handleRetry} className="retry-btn">
              {retryCount > 0 ? `Try Again (${retryCount})` : 'Try Again'}
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
            <div className="stat-card processing">
              <span className="stat-icon">⏳</span>
              <div className="stat-content">
                <h3>Processing</h3>
                <p className="stat-number">{processingCount}</p>
              </div>
            </div>
            <div className="stat-card pending">
              <span className="stat-icon">🕒</span>
              <div className="stat-content">
                <h3>Pending</h3>
                <p className="stat-number">{pendingCount}</p>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="orders-controls">
            <div className="search-box">
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

          {/* Orders Summary */}
          <div className="orders-summary">
            <p>
              Showing {filteredOrders.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
              {statusFilter !== 'all' && ` (Filtered by: ${statusFilter})`}
            </p>
          </div>



          {/* Orders List */}
          <div className="orders-list">
            {currentOrders.map((order, index) => (
              <div key={order._id || index} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order {getOrderNumber(order._id)}</h3>
                    <p className="order-date">
                      <span className="date-icon">📅</span>
                      {formatDate(order.createdAt || order.date)}
                    </p>
                    {order.address && (
                      <p className="order-address">
                        <span className="address-icon">📍</span>
                        {typeof order.address === 'object' 
                          ? `${order.address.street || ''}, ${order.address.city || ''}`.trim()
                          : order.address}
                      </p>
                    )}
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {order.status || 'Pending'}
                    </span>
                    <span className={`payment-badge ${order.payment ? 'paid' : 'unpaid'}`}>
                      {order.payment ? 'Paid' : 'Payment Pending'}
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
                    <span className="total-amount">{formatPrice(order?.amount)}</span>
                  </div>
                  <div className="order-actions">
                    <button className="btn view-details-btn">
                      View Details
                    </button>
                    {order.status?.toLowerCase().includes('delivered') && (
                      <button className="btn reorder-btn">
                        Reorder
                      </button>
                    )}
                    {!order.status?.toLowerCase().includes('delivered') && 
                     !order.status?.toLowerCase().includes('cancelled') && (
                      <button className="btn track-btn">
                        Track Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
    </div>
  );
};

export default MyOrders;
