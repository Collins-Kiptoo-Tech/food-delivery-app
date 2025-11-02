import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiUser, FiMail, FiMapPin, FiPhone } from "react-icons/fi";

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
  const DELIVERY_FEE = 250;

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
    if (!data.street.trim()) newErrors.street = "Street is required";
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
      // PlaceOrder.jsx
      navigate("/payment-methods", { state: { orderData } });
    } catch (err) {
      console.error(err);
      setLoading(false);
      setErrors({ form: "Something went wrong. Try again." });
    }
  };

  useEffect(() => {
    if (!token || getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  }, [token, getTotalCartAmount, navigate]);

  return (
    <div className="place-order-container">
      <form onSubmit={placeOrder} className="place-order-form" noValidate>
        {/* Left - Delivery Info */}
        <div className="place-order-left card">
          <h2 className="title">Delivery Information</h2>

          <div className="input-group">
            <FiUser className="input-icon" />
            <input
              name="firstName"
              onChange={onChangeHandler}
              value={data.firstName}
              type="text"
              placeholder="First Name"
            />
            {errors.firstName && (
              <p className="error-text">{errors.firstName}</p>
            )}
          </div>

          <div className="input-group">
            <FiUser className="input-icon" />
            <input
              name="lastName"
              onChange={onChangeHandler}
              value={data.lastName}
              type="text"
              placeholder="Last Name"
            />
            {errors.lastName && <p className="error-text">{errors.lastName}</p>}
          </div>

          <div className="input-group">
            <FiMail className="input-icon" />
            <input
              name="email"
              onChange={onChangeHandler}
              value={data.email}
              type="email"
              placeholder="Email Address"
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="input-group">
            <FiMapPin className="input-icon" />
            <input
              name="street"
              onChange={onChangeHandler}
              value={data.street}
              type="text"
              placeholder="Street Address"
            />
            {errors.street && <p className="error-text">{errors.street}</p>}
          </div>

          <div className="multi-fields">
            <div className="input-group">
              <FiMapPin className="input-icon" />
              <input
                name="city"
                onChange={onChangeHandler}
                value={data.city}
                type="text"
                placeholder="City"
              />
              {errors.city && <p className="error-text">{errors.city}</p>}
            </div>

            <div className="input-group">
              <input
                name="state"
                onChange={onChangeHandler}
                value={data.state}
                type="text"
                placeholder="State"
              />
            </div>
          </div>

          <div className="multi-fields">
            <div className="input-group">
              <input
                name="zipcode"
                onChange={onChangeHandler}
                value={data.zipcode}
                type="text"
                placeholder="Zip Code"
              />
              {errors.zipcode && <p className="error-text">{errors.zipcode}</p>}
            </div>

            <div className="input-group">
              <input
                name="country"
                onChange={onChangeHandler}
                value={data.country}
                type="text"
                placeholder="Country"
              />
              {errors.country && <p className="error-text">{errors.country}</p>}
            </div>
          </div>

          <div className="input-group">
            <FiPhone className="input-icon" />
            <input
              name="phone"
              onChange={onChangeHandler}
              value={data.phone}
              type="tel"
              placeholder="Phone (2547XXXXXXXX)"
            />
            {errors.phone && <p className="error-text">{errors.phone}</p>}
          </div>

          {errors.form && <p className="error-text">{errors.form}</p>}

          <p className="info-text">
            After clicking &quot;Proceed to Payment&quot;, an M-Pesa prompt will
            appear on your phone. Enter your PIN to complete payment.
          </p>
        </div>

        {/* Right - Cart Totals */}
        <div className="place-order-right card">
          <h2>Cart Totals</h2>

          {food_list.map((item) =>
            cartItems[item._id] > 0 ? (
              <div className="cart-item-summary" key={item._id}>
                <img
                  src={`${url}/uploads/${item.image}`} // <-- updated path
                  alt={item.name}
                  className="cart-thumb"
                />

                <span>
                  {item.name} x {cartItems[item._id]}
                </span>
                <b>KES {item.price * cartItems[item._id]}</b>
              </div>
            ) : null
          )}

          <hr />

          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>KES {getTotalCartAmount()}</p>
          </div>
          <div className="cart-total-details">
            <p>Delivery Fee</p>
            <p>KES {getTotalCartAmount() === 0 ? 0 : DELIVERY_FEE}</p>
          </div>
          <div className="cart-total-details total">
            <p>Total</p>
            <b>
              KES{" "}
              {getTotalCartAmount() === 0
                ? 0
                : getTotalCartAmount() + DELIVERY_FEE}
            </b>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "PROCEED TO PAYMENT"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;
