import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import "./PaymentCompleted.css";

const PaymentCompleted = () => {
  const { cartItems, food_list, getTotalCartAmount } = useContext(StoreContext);

  // Build list of items purchased
  const purchasedItems = food_list.filter((item) => cartItems[item._id] > 0);

  return (
    <div className="payment-completed-page">
      <h1>Payment Completed ✅</h1>
      <p>Your M-Pesa payment request has been sent successfully.</p>

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
                <td>{item.price}</td>
                <td>{item.price * cartItems[item._id]}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="3">
                <strong>Subtotal</strong>
              </td>
              <td>
                <strong>{getTotalCartAmount()}</strong>
              </td>
            </tr>
            <tr className="total-row">
              <td colSpan="3">
                <strong>Delivery Fee</strong>
              </td>
              <td>
                <strong>{getTotalCartAmount() === 0 ? 0 : 250}</strong>
              </td>
            </tr>
            <tr className="total-row">
              <td colSpan="3">
                <strong>Total</strong>
              </td>
              <td>
                <strong>
                  {getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 250}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Link to="/">
        <button>Back to Home</button>
      </Link>
    </div>
  );
};

export default PaymentCompleted;
