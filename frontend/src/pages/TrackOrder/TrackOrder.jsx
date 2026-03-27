// pages/TrackOrder/TrackOrder.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

// Fix for Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom restaurant icon
const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom user icon
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Restaurant location (Chuka, Kenya)
const RESTAURANT_LOCATION = {
  lat: -0.3378,
  lng: 37.6482
};

const TrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('map');
  const [selectedView, setSelectedView] = useState('standard');
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [requestingLocation, setRequestingLocation] = useState(false);

  // Calculate distance between two points
  const calculateDistance = (point1, point2) => {
    const R = 6371;
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Request location permission function
  const requestLocation = () => {
    setRequestingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userLoc);
          const dist = calculateDistance(userLoc, RESTAURANT_LOCATION);
          setDistance(`${dist.toFixed(1)} km`);
          setLocationDenied(false);
          setRequestingLocation(false);
          
          // Show success message
          console.log('Location acquired:', userLoc);
        },
        (error) => {
          console.error('Location error:', error);
          setLocationDenied(true);
          setRequestingLocation(false);
          
          // Show user-friendly error message
          let errorMessage = '';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Please allow location access in your browser settings';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'Unable to get your location';
          }
          alert(errorMessage);
          
          // Set default location
          setUserLocation({ lat: -0.335, lng: 37.645 });
          setDistance('0.5 km');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
      setLocationDenied(true);
      setRequestingLocation(false);
      setUserLocation({ lat: -0.335, lng: 37.645 });
      setDistance('0.5 km');
    }
  };

  useEffect(() => {
    // Auto-request location on component mount
    requestLocation();

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

      {/* Location Permission Banner */}
      {locationDenied && (
        <div className="location-permission-banner">
          <FiNavigation className="banner-icon" />
          <div className="banner-content">
            <p>📍 Enable location to see your distance from restaurant</p>
            <button 
              onClick={requestLocation} 
              className="enable-location-btn"
              disabled={requestingLocation}
            >
              {requestingLocation ? 'Getting location...' : 'Enable Location'}
            </button>
          </div>
        </div>
      )}

      {/* Map View Tabs */}
      <div className="map-tabs">
        <button 
          className={`tab ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          🗺️ Kitchen Map
        </button>
        <button 
          className={`tab ${activeTab === 'satellite' ? 'active' : ''}`}
          onClick={() => setActiveTab('satellite')}
        >
          🛰️ Satellite
        </button>
        <button 
          className={`tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📍 Nearby Places
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

        {/* Real Map */}
        <div className="realistic-map">
          {activeTab === 'map' ? (
            <MapContainer
              key="map-container"
              center={RESTAURANT_LOCATION}
              zoom={15}
              style={{ height: '100%', width: '100%', borderRadius: '12px' }}
              zoomControl={false}
            >
              <TileLayer
                url={selectedView === 'standard' 
                  ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  : "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                }
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              
              {/* Restaurant Marker */}
              <Marker position={RESTAURANT_LOCATION} icon={restaurantIcon}>
                <Popup>
                  <div>
                    <strong>🍽️ NATIVE DISHES</strong><br />
                    Your food is being prepared here<br />
                    <small>Chuka, Tharaka Nithi County</small>
                  </div>
                </Popup>
              </Marker>
              
              {/* User Location Marker */}
              {userLocation && (
                <Marker position={userLocation} icon={userIcon}>
                  <Popup>
                    <div>
                      <strong>📍 Your Location</strong><br />
                      {distance || 'Calculating...'} from restaurant
                      {locationDenied && <br />}
                      {locationDenied && <small>Approximate location</small>}
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Path between user and restaurant */}
              {userLocation && (
                <Polyline
                  positions={[RESTAURANT_LOCATION, userLocation]}
                  color="#f59e0b"
                  weight={3}
                  opacity={0.6}
                  dashArray="5, 10"
                />
              )}
            </MapContainer>
          ) : activeTab === 'list' ? (
            <div className="nearby-places-full">
              <h3>📍 Places Near Native Dishes</h3>
              {order.nearbyPlaces.map((place, idx) => (
                <div key={idx} className="nearby-place-item">
                  <FiMapPin className="place-icon" />
                  <div className="place-details">
                    <span className="place-name">{place.name}</span>
                    <span className="place-distance">{place.distance} away</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="map-placeholder">
              <div className="placeholder-content">
                <FiMapPin size={48} color="#f59e0b" />
                <h3>Satellite View</h3>
                <p>Switch to Standard view for interactive map</p>
              </div>
            </div>
          )}
          
          {/* Map Scale */}
          <div className="map-scale">
            <div className="scale-bar">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="scale-text">200m</span>
          </div>

          {/* Compass */}
          <div className="map-compass">
            <div className="compass-ring">
              <div className="compass-needle"></div>
            </div>
            <span>N</span>
          </div>

          {/* Zoom Controls */}
          <div className="map-zoom-controls">
            <button className="zoom-btn" onClick={() => {
              const map = document.querySelector('.leaflet-container')?.__reactLeafletMap;
              if (map) map.zoomIn();
            }}>+</button>
            <div className="zoom-divider"></div>
            <button className="zoom-btn" onClick={() => {
              const map = document.querySelector('.leaflet-container')?.__reactLeafletMap;
              if (map) map.zoomOut();
            }}>−</button>
          </div>

          {/* Current Location Indicator */}
          <div className="current-location" onClick={requestLocation}>
            <div className="location-dot"></div>
            <span>{userLocation ? 'You are here' : 'Tap to locate'}</span>
          </div>
        </div>

        {/* Map Footer with Details */}
        <div className="map-footer">
          <div className="coordinates">
            <span>📍 Native Dishes, Chuka Town</span>
            <span className="update-time">
              {userLocation 
                ? `${distance} from you` 
                : 'Enable location to see distance'}
            </span>
          </div>
          <div className="map-attribution">
            © OpenStreetMap
          </div>
        </div>
      </div>

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
            <p className="landmark">
              {userLocation 
                ? `📍 ${distance} from your location` 
                : '📍 Near Chuka Town Center'}
            </p>
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
          <h4>🏨 Nearby Places</h4>
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
          <h3>🔴 Live Kitchen Updates</h3>
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
        <button className="action-btn primary" onClick={() => window.location.href = 'tel:+254700123456'}>
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