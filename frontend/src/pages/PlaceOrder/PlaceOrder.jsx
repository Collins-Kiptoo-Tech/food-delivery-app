import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

  // Handle input changes
  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate inputs
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

  // Place order function (forced navigation for debugging)
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

      const response = await axios.post(url + "/api/order/place", orderData, {
        headers: { token },
      });

      console.log("Backend response:", response.data);

      setLoading(false);

      // FOR DEBUG: navigate no matter what the backend returns
      navigate("/payment-completed");

      // If you want to still handle backend success, uncomment below:
      /*
      if (response.data.success) {
        navigate("/payment-completed");
      } else {
        setErrors({ form: response.data.message || "Something went wrong" });
      }
      */
    } catch (err) {
      console.error(err);
      setLoading(false);
      setErrors({ form: "Something went wrong. Try again." });
    }
  };

  // Redirect if no token or empty cart
  useEffect(() => {
    if (!token || getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  }, [token, getTotalCartAmount, navigate]);

  return (
    <div>
      <form onSubmit={placeOrder} className="place-order" noValidate>
        <div className="place-order-left">
          <p className="title">Delivery Information</p>

          <div className="multi-fields">
            <div>
              <input
                name="firstName"
                onChange={onChangeHandler}
                value={data.firstName}
                type="text"
                placeholder="First name"
              />
              {errors.firstName && (
                <p className="error-text">{errors.firstName}</p>
              )}
            </div>
            <div>
              <input
                name="lastName"
                onChange={onChangeHandler}
                value={data.lastName}
                type="text"
                placeholder="Last name"
              />
              {errors.lastName && (
                <p className="error-text">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <input
              name="email"
              onChange={onChangeHandler}
              value={data.email}
              type="email"
              placeholder="Email address"
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div>
            <input
              name="street"
              onChange={onChangeHandler}
              value={data.street}
              type="text"
              placeholder="Street"
            />
            {errors.street && <p className="error-text">{errors.street}</p>}
          </div>

          <div className="multi-fields">
            <div>
              <input
                name="city"
                onChange={onChangeHandler}
                value={data.city}
                type="text"
                placeholder="City"
              />
              {errors.city && <p className="error-text">{errors.city}</p>}
            </div>
            <div>
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
            <div>
              <input
                name="zipcode"
                onChange={onChangeHandler}
                value={data.zipcode}
                type="text"
                placeholder="Zip code"
              />
              {errors.zipcode && <p className="error-text">{errors.zipcode}</p>}
            </div>
            <div>
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

          <div>
            <input
              name="phone"
              onChange={onChangeHandler}
              value={data.phone}
              type="tel"
              placeholder="Phone (e.g., 2547XXXXXXXX)"
            />
            {errors.phone && <p className="error-text">{errors.phone}</p>}
          </div>

          {errors.form && <p className="error-text">{errors.form}</p>}

          <p className="info-text">
            After clicking &quot;Proceed to Payment&quot;, an M-Pesa prompt will
            appear on your phone. Enter your PIN to complete the payment.
          </p>
        </div>

        <div className="place-order-right">
          <div className="cart-total">
            <h2>Cart Totals</h2>

            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>KES {getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>KES {getTotalCartAmount() === 0 ? 0 : DELIVERY_FEE}</p>
            </div>
            <hr />
            <div className="cart-total-details">
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
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;
