import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import "./PaymentCompleted.css";
import { FaCheckCircle } from "react-icons/fa";

const PaymentCompleted = () => {
  const { cartItems, food_list, getTotalCartAmount } = useContext(StoreContext);

  const purchasedItems = food_list.filter((item) => cartItems[item._id] > 0);
  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal === 0 ? 0 : 250;
  const total = subtotal + deliveryFee;

  return (
    <div className="payment-completed-page">
      {/* ✅ Success Header */}
      <h1>
        Order Completed <FaCheckCircle color="#28a745" />
      </h1>
      <p>Your M-Pesa payment request has been sent successfully.</p>

      {/* ✅ Order Summary Section */}
      <div className="receipt">
        <h2>Order Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price (KES)</th>
              <th>Total (KES)</th>
            </tr>
          </thead>
          <tbody>
            {purchasedItems.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{cartItems[item._id]}</td>
                <td>{item.price.toLocaleString()}</td>
                <td>{(item.price * cartItems[item._id]).toLocaleString()}</td>
              </tr>
            ))}

            {/* ✅ Subtotal */}
            <tr className="total-row">
              <td colSpan="3">
                <strong>Subtotal</strong>
              </td>
              <td>{subtotal.toLocaleString()}</td>
            </tr>

            {/* ✅ Delivery */}
            <tr className="total-row">
              <td colSpan="3">
                <strong>Delivery Fee</strong>
              </td>
              <td>{deliveryFee.toLocaleString()}</td>
            </tr>

            {/* ✅ Total */}
            <tr className="total-row">
              <td colSpan="3">
                <strong>Total</strong>
              </td>
              <td>{total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ✅ CTA */}
      <Link to="/">
        <button>Back to Home</button>
      </Link>
    </div>
  );
};

export default PaymentCompleted;
