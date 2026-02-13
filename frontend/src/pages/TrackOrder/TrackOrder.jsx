// pages/TrackOrder/TrackOrder.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TrackOrder.css';
import { 
  FiPackage, 
  FiClock,
  FiArrowLeft,
  FiMapPin,
  FiPhone,
  FiNavigation,
  FiChevronDown,
  FiStar,
  FiCamera
} from 'react-icons/fi';

const TrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('map');
  const [selectedView, setSelectedView] = useState('standard');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchOrder = setTimeout(() => {
      setOrder({
        status: 'Food Processing',
        preparationLocation: 'NATIVE DISHES',
        estimatedTime: '10-15 minutes',
        kitchenLocation: {
          name: 'NATIVE DISHES',
          area: 'Chuka Town',
          address: 'Chuka, Tharaka Nithi County',
          rating: 4.5,
          reviews: 128
        },
        nearbyPlaces: [
          { name: 'Wakatamu hotel', type: 'hotel', distance: '0.3 km' },
          { name: 'Hotel chuka', type: 'hotel', distance: '0.5 km' },
          { name: 'Hillside grand', type: 'hotel', distance: '0.7 km' },
          { name: 'Marine Park Resort', type: 'resort', distance: '1.2 km' },
          { name: 'Space Q Lounge', type: 'lounge', distance: '0.4 km' }
        ],
        lastUpdated: new Date()
      });
      setLoading(false);
    }, 1500);

    return () => clearTimeout(fetchOrder);
  }, [orderId]);

  if (loading) {
    return (
      <div className="track-loading">
        <div className="loading-spinner"></div>
        <p>Finding your kitchen location...</p>
        <span className="loading-sub">Preparing live map view</span>
      </div>
    );
  }

  return (
    <div className="track-order-container">
      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-left">
          <span className="status-dot"></span>
          <span className="status-text">LIVE TRACKING</span>
        </div>
        <div className="order-number">
          Order #{orderId?.slice(-6) || '488547'}
        </div>
      </div>

      {/* Header with Restaurant Info */}
      <div className="restaurant-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft />
        </button>
        <div className="restaurant-info">
          <h1>NATIVE DISHES</h1>
          <div className="restaurant-meta">
            <span className="rating">
              <FiStar /> 4.5 (128)
            </span>
            <span className="cuisine">African Cuisine</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-steps">
          <div className="step completed">
            <div className="step-dot"></div>
            <span>Order Received</span>
          </div>
          <div className="step active">
            <div className="step-dot"></div>
            <span>Preparing</span>
          </div>
          <div className="step">
            <div className="step-dot"></div>
            <span>Ready</span>
          </div>
          <div className="step">
            <div className="step-dot"></div>
            <span>Delivered</span>
          </div>
        </div>
        <div className="progress-time">
          <FiClock />
          <span>Ready in {order.estimatedTime}</span>
        </div>
      </div>

      {/* Map View Tabs */}
      <div className="map-tabs">
        <button 
          className={`tab ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          Kitchen Map
        </button>
        <button 
          className={`tab ${activeTab === 'satellite' ? 'active' : ''}`}
          onClick={() => setActiveTab('satellite')}
        >
          Satellite
        </button>
        <button 
          className={`tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Nearby Places
        </button>
      </div>

      {/* Main Map Area */}
      <div className="map-main-container">
        {/* Map Type Selector */}
        <div className="map-type-selector">
          <button 
            className={`map-type ${selectedView === 'standard' ? 'active' : ''}`}
            onClick={() => setSelectedView('standard')}
          >
            Standard
          </button>
          <button 
            className={`map-type ${selectedView === 'satellite' ? 'active' : ''}`}
            onClick={() => setSelectedView('satellite')}
          >
            Satellite
          </button>
          <button 
            className={`map-type ${selectedView === 'hybrid' ? 'active' : ''}`}
            onClick={() => setSelectedView('hybrid')}
          >
            Hybrid
          </button>
        </div>

        {/* Map Image with Overlay */}
        <div className="realistic-map">
          {!imageError ? (
            <img 
              src="/image.png" 
              alt="NATIVE DISHES location map"
              className="map-image"
              onError={() => {
                console.log('Failed to load image.png, trying alternative name...');
                // Try with the screenshot name
                const img = new Image();
                img.src = "/Screenshot 2026-02-13 132924.png";
                img.onload = () => {
                  document.querySelector('.map-image').src = "/Screenshot 2026-02-13 132924.png";
                  setImageError(false);
                };
                img.onerror = () => {
                  console.log('Both image names failed');
                  setImageError(true);
                };
              }}
            />
          ) : (
            <div className="map-placeholder">
              <div className="placeholder-content">
                <FiMapPin size={48} color="#f59e0b" />
                <h3>NATIVE DISHES</h3>
                <p>Chuka, Tharaka Nithi County</p>
                <div className="placeholder-grid"></div>
                <div className="placeholder-marker">
                  <div className="marker-pulse"></div>
                  <div className="marker-icon">
                    <FiMapPin />
                  </div>
                </div>
                <small>📍 Your food is being prepared here</small>
              </div>
            </div>
          )}
          
          {/* Map Overlay Elements - These will show on top of the image */}
          <div className="map-overlay-grid"></div>
          
          {/* Kitchen Location Marker - Only show if image loaded */}
          {!imageError && (
            <>
              <div className="kitchen-location-marker" style={{ top: '52%', left: '45%' }}>
                <div className="marker-pin">
                  <div className="pin-icon">
                    <FiMapPin />
                  </div>
                  <div className="pin-pulse"></div>
                </div>
                <div className="location-card">
                  <strong>NATIVE DISHES</strong>
                  <span>Your food is being prepared</span>
                </div>
              </div>

              {/* Nearby Place Markers */}
              
            </>
          )}

          {/* Map Scale - Always show */}
          <div className="map-scale">
            <div className="scale-bar">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="scale-text">200m</span>
          </div>

          {/* Compass - Always show */}
          <div className="map-compass">
            <div className="compass-ring">
              <div className="compass-needle"></div>
            </div>
            <span>N</span>
          </div>

          {/* Zoom Controls - Always show */}
          <div className="map-zoom-controls">
            <button className="zoom-btn">+</button>
            <div className="zoom-divider"></div>
            <button className="zoom-btn">−</button>
          </div>

          {/* Current Location Indicator - Always show */}
          <div className="current-location">
            <div className="location-dot"></div>
            <span>You are here</span>
          </div>
        </div>

        {/* Map Footer with Details */}
        <div className="map-footer">
          <div className="coordinates">
            <span>0.3378° S, 37.6482° E</span>
            <span className="update-time">Updated just now</span>
          </div>
          <div className="map-attribution">
            ©2026 Google • Imagery 2026 • Terms
          </div>
        </div>
      </div>

      {/* Rest of your components remain the same */}
      {/* Kitchen Details Card */}
      <div className="kitchen-card">
        <div className="card-header">
          <FiMapPin className="header-icon" />
          <h3>FOOD PREPARATION LOCATION</h3>
        </div>
        
        <div className="kitchen-details">
          <div className="detail-main">
            <h4>NATIVE DISHES Restaurant</h4>
            <p className="address">Chuka, Tharaka Nithi County</p>
            <p className="landmark">Near Chuka Town • 0.2 km away</p>
          </div>
          
          <div className="detail-stats">
            <div className="stat">
              <span className="stat-label">Prep Time</span>
              <span className="stat-value">{order.estimatedTime}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Kitchen</span>
              <span className="stat-value">Station 3</span>
            </div>
            <div className="stat">
              <span className="stat-label">Chef</span>
              <span className="stat-value">Michael</span>
            </div>
          </div>
        </div>

        {/* Nearby Places Grid */}
        <div className="nearby-grid">
          <h4>Nearby Places</h4>
          <div className="places-list">
            {order.nearbyPlaces.map((place, index) => (
              <div key={index} className="place-item">
                <div className={`place-icon ${place.type}`}></div>
                <div className="place-info">
                  <span className="place-name">{place.name}</span>
                  <span className="place-distance">{place.distance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Updates */}
      <div className="live-updates-section">
        <div className="section-header">
          <h3>Live Kitchen Updates</h3>
          <FiChevronDown />
        </div>
        
        <div className="updates-list">
          <div className="update-item live">
            <div className="update-icon">
              <FiPackage />
            </div>
            <div className="update-content">
              <p>Chef started preparing your order</p>
              <span className="update-time">Just now</span>
            </div>
          </div>
          
          <div className="update-item">
            <div className="update-icon">
              <FiClock />
            </div>
            <div className="update-content">
              <p>Order received in kitchen</p>
              <span className="update-time">2 min ago</span>
            </div>
          </div>
          
          <div className="update-item">
            <div className="update-icon">
              <FiCamera />
            </div>
            <div className="update-content">
              <p>Kitchen photo captured</p>
              <span className="update-time">3 min ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="action-btn primary">
          <FiPhone /> Call Restaurant
        </button>
        <button className="action-btn secondary" onClick={() => navigate('/myorders')}>
          View All Orders
        </button>
      </div>
    </div>
  );
};

export default TrackOrder;