import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiUser, FiMail, FiMapPin, FiPhone, FiShoppingCart, FiPackage, FiCreditCard, FiCheck } from "react-icons/fi";

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } =
    useContext(StoreContext);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const DELIVERY_FEE = 75;

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    const phoneRegex = /^2547\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.firstName.trim()) newErrors.firstName = "First name is required";
    if (!data.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!data.street.trim()) newErrors.street = "Street address is required";
    if (!data.city.trim()) newErrors.city = "City is required";
    if (!data.zipcode.trim()) newErrors.zipcode = "Zip code is required";
    if (!data.country.trim()) newErrors.country = "Country is required";
    if (!phoneRegex.test(data.phone))
      newErrors.phone = "Enter a valid phone number (e.g., 2547XXXXXXXX)";
    if (data.email && !emailRegex.test(data.email))
      newErrors.email = "Enter a valid email address";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        orderItems.push({ ...item, quantity: cartItems[item._id] });
      }
    });

    const orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + DELIVERY_FEE,
      phone: data.phone,
    };

    try {
      setLoading(true);
      setErrors({});
      await axios.post(url + "/api/order/place", orderData, {
        headers: { token },
      });
      setLoading(false);
      navigate("/payment-methods", { state: { orderData } });
    } catch (err) {
      console.error(err);
      setLoading(false);
      setErrors({ form: "Something went wrong. Please try again." });
    }
  };

  useEffect(() => {
    if (!token || getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  }, [token, getTotalCartAmount, navigate]);

  // Calculate total items in cart
  const totalItems = Object.values(cartItems).reduce((a, b) => a + b, 0);

  return (
    <div className="place-order-page">
      {/* Progress Steps */}
      <div className="checkout-progress">
        <div className="progress-step completed">
          <div className="step-icon">1</div>
          <span className="step-label">Cart</span>
        </div>
        <div className="progress-line active"></div>
        <div className="progress-step active">
          <div className="step-icon">2</div>
          <span className="step-label">Delivery</span>
        </div>
        <div className="progress-line"></div>
        <div className="progress-step">
          <div className="step-icon">3</div>
          <span className="step-label">Payment</span>
        </div>
        <div className="progress-line"></div>
        <div className="progress-step">
          <div className="step-icon">4</div>
          <span className="step-label">Complete</span>
        </div>
      </div>

      <div className="place-order-container">
        <h1 className="page-title">Delivery Information</h1>
        <p className="page-subtitle">Please provide your delivery details to proceed</p>

        <form onSubmit={placeOrder} className="place-order-form" noValidate>
          {/* Left - Delivery Form */}
          <div className="delivery-section">
            <div className="section-header">
              <FiMapPin className="section-icon" />
              <h2>Delivery Address</h2>
            </div>
            
            <div className="form-grid">
              <div className={`form-group ${errors.firstName ? 'error' : ''}`}>
                <label htmlFor="firstName">
                  <FiUser className="input-icon" />
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  onChange={onChangeHandler}
                  value={data.firstName}
                  type="text"
                  placeholder="Enter your first name"
                  required
                />
                {errors.firstName && (
                  <span className="error-message">{errors.firstName}</span>
                )}
              </div>

              <div className={`form-group ${errors.lastName ? 'error' : ''}`}>
                <label htmlFor="lastName">
                  <FiUser className="input-icon" />
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  onChange={onChangeHandler}
                  value={data.lastName}
                  type="text"
                  placeholder="Enter your last name"
                  required
                />
                {errors.lastName && (
                  <span className="error-message">{errors.lastName}</span>
                )}
              </div>

              <div className={`form-group ${errors.email ? 'error' : ''}`}>
                <label htmlFor="email">
                  <FiMail className="input-icon" />
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  onChange={onChangeHandler}
                  value={data.email}
                  type="email"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className={`form-group ${errors.phone ? 'error' : ''}`}>
                <label htmlFor="phone">
                  <FiPhone className="input-icon" />
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  onChange={onChangeHandler}
                  value={data.phone}
                  type="tel"
                  placeholder="2547XXXXXXXX"
                  required
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="street">
                  <FiMapPin className="input-icon" />
                  Street Address *
                </label>
                <input
                  id="street"
                  name="street"
                  onChange={onChangeHandler}
                  value={data.street}
                  type="text"
                  placeholder="Enter your street address"
                  required
                />
                {errors.street && (
                  <span className="error-message">{errors.street}</span>
                )}
              </div>

              <div className={`form-group ${errors.city ? 'error' : ''}`}>
                <label htmlFor="city">City *</label>
                <input
                  id="city"
                  name="city"
                  onChange={onChangeHandler}
                  value={data.city}
                  type="text"
                  placeholder="Enter city"
                  required
                />
                {errors.city && (
                  <span className="error-message">{errors.city}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="state">State / Province</label>
                <input
                  id="state"
                  name="state"
                  onChange={onChangeHandler}
                  value={data.state}
                  type="text"
                  placeholder="State"
                />
              </div>

              <div className={`form-group ${errors.zipcode ? 'error' : ''}`}>
                <label htmlFor="zipcode">Zip Code *</label>
                <input
                  id="zipcode"
                  name="zipcode"
                  onChange={onChangeHandler}
                  value={data.zipcode}
                  type="text"
                  placeholder="Enter zip code"
                  required
                />
                {errors.zipcode && (
                  <span className="error-message">{errors.zipcode}</span>
                )}
              </div>

              <div className={`form-group ${errors.country ? 'error' : ''}`}>
                <label htmlFor="country">Country *</label>
                <input
                  id="country"
                  name="country"
                  onChange={onChangeHandler}
                  value={data.country}
                  type="text"
                  placeholder="Enter country"
                  required
                />
                {errors.country && (
                  <span className="error-message">{errors.country}</span>
                )}
              </div>
            </div>

            {errors.form && (
              <div className="form-error">
                <span className="error-icon">⚠</span>
                {errors.form}
              </div>
            )}

            <div className="delivery-note">
              <FiPackage className="note-icon" />
              <div>
                <p className="note-title">Delivery Information</p>
                <p className="note-text">
                  After completing your order, you'll be redirected to select your payment method.
                  We'll send you order updates via SMS and email.
                </p>
              </div>
            </div>
          </div>

          {/* Right - Order Summary */}
          <div className="order-summary-section">
            <div className="section-header">
              <FiShoppingCart className="section-icon" />
              <h2>Order Summary</h2>
              <span className="item-count">{totalItems} items</span>
            </div>

            <div className="order-items">
              {food_list.map((item) =>
                cartItems[item._id] > 0 ? (
                  <div className="order-item" key={item._id}>
                    <img
                      src={`${url}/uploads/${item.image}`}
                      alt={item.name}
                      className="item-image"
                    />
                    <div className="item-details">
                      <h4 className="item-name">{item.name}</h4>
                      <span className="item-quantity">× {cartItems[item._id]}</span>
                    </div>
                    <div className="item-price">
                      KES {item.price * cartItems[item._id]}
                    </div>
                  </div>
                ) : null
              )}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>KES {getTotalCartAmount()}</span>
              </div>
              <div className="total-row">
                <span>Delivery Fee</span>
                <span>KES {getTotalCartAmount() === 0 ? 0 : DELIVERY_FEE}</span>
              </div>
              <div className="total-divider"></div>
              <div className="total-row grand-total">
                <span>Total Amount</span>
                <span className="grand-total-amount">
                  KES {getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + DELIVERY_FEE}
                </span>
              </div>
            </div>

            <button 
              type="submit" 
              className={`proceed-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  <FiCreditCard className="btn-icon" />
                  Proceed to Payment
                </>
              )}
            </button>

            <div className="security-note">
              <FiCheck className="security-icon" />
              <span>Your information is secure and encrypted</span>
            </div>

            <div className="back-to-cart">
              <button 
                type="button" 
                className="back-btn"
                onClick={() => navigate("/cart")}
              >
                ← Back to Cart
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaceOrder;
